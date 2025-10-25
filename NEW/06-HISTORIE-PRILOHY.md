# 06 - Historie a Přílohy

> **Tento dokument popisuje implementaci historie změn a systému příloh pro všechny entity v aplikaci.**

---

## 📖 Obsah

1. [Historie Změn](#historie-změn)
2. [Přílohy (Attachments)](#přílohy-attachments)

---

## 📜 Historie Změn

### Účel

Automatické zaznamenávání všech změn pro:
- Audit trail
- Sledování změn
- Zobrazení timeline
- Vrácení změn (plánováno)

### Databázová struktura

```sql
-- Příklad pro subjects
CREATE TABLE subject_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  changed_by UUID REFERENCES profiles(id),
  action VARCHAR(50) NOT NULL,  -- 'create', 'update', 'archive', 'unarchive'
  old_data JSONB,               -- Stará data
  new_data JSONB,               -- Nová data
  changes JSONB                 -- Diff (co se změnilo)
);

CREATE INDEX idx_subject_history_subject ON subject_history(subject_id);
CREATE INDEX idx_subject_history_date ON subject_history(changed_at DESC);
```

### Automatické logování (Trigger)

```sql
-- Funkce pro ukládání historie
CREATE OR REPLACE FUNCTION save_subject_history()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subject_history (
    subject_id,
    changed_by,
    action,
    old_data,
    new_data,
    changes
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    auth.uid(),
    TG_OP,
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
    CASE
      WHEN TG_OP = 'UPDATE' THEN (
        SELECT jsonb_object_agg(key, value)
        FROM jsonb_each(to_jsonb(NEW))
        WHERE to_jsonb(NEW) -> key != to_jsonb(OLD) -> key
      )
      ELSE NULL
    END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER subjects_history_trigger
  AFTER INSERT OR UPDATE OR DELETE ON subjects
  FOR EACH ROW
  EXECUTE FUNCTION save_subject_history();
```

### Zobrazení historie

```javascript
// forms/history.js
export async function render(root, manifest, { query }) {
  const entityId = query.id;
  
  // Načti historii
  const { data: history, error } = await supabase
    .from('subject_history')
    .select(`
      *,
      user:changed_by(display_name, email)
    `)
    .eq('subject_id', entityId)
    .order('changed_at', { ascending: false });
  
  if (error) {
    root.innerHTML = '<div class="text-red-500">Chyba při načítání historie</div>';
    return;
  }
  
  root.innerHTML = `
    <div class="max-w-6xl mx-auto">
      <h2 class="text-2xl font-bold mb-6">📜 Historie změn</h2>
      
      <div class="space-y-4">
        ${history.map(entry => `
          <div class="bg-white p-6 rounded-lg shadow border-l-4 ${getActionColor(entry.action)}">
            <div class="flex items-start justify-between mb-4">
              <div>
                <div class="font-semibold">${getActionLabel(entry.action)}</div>
                <div class="text-sm text-slate-600">
                  ${entry.user?.display_name || 'Systém'} • ${formatDate(entry.changed_at)}
                </div>
              </div>
              <div class="text-2xl">${getActionIcon(entry.action)}</div>
            </div>
            
            ${entry.changes ? `
              <details class="mt-4">
                <summary class="cursor-pointer text-blue-600 font-medium">
                  Zobrazit změny
                </summary>
                <div class="mt-2 space-y-2">
                  ${Object.entries(entry.changes).map(([key, value]) => `
                    <div class="flex gap-2 text-sm">
                      <div class="font-medium min-w-[150px]">${formatFieldName(key)}:</div>
                      <div>
                        <span class="line-through text-red-600">${formatValue(entry.old_data?.[key])}</span>
                        →
                        <span class="text-green-600">${formatValue(value)}</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </details>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function getActionColor(action) {
  const colors = {
    'INSERT': 'border-green-500',
    'UPDATE': 'border-blue-500',
    'DELETE': 'border-red-500',
    'create': 'border-green-500',
    'update': 'border-blue-500',
    'archive': 'border-orange-500'
  };
  return colors[action] || 'border-slate-300';
}

function getActionIcon(action) {
  const icons = {
    'INSERT': '✅',
    'UPDATE': '✏️',
    'DELETE': '🗑️',
    'create': '➕',
    'update': '📝',
    'archive': '📦'
  };
  return icons[action] || '📄';
}

function getActionLabel(action) {
  const labels = {
    'INSERT': 'Záznam vytvořen',
    'UPDATE': 'Záznam upraven',
    'DELETE': 'Záznam smazán',
    'create': 'Vytvořeno',
    'update': 'Upraveno',
    'archive': 'Archivováno'
  };
  return labels[action] || action;
}
```

---

## 📎 Přílohy (Attachments)

### Účel

Univerzální systém pro přílohy k jakékoliv entitě:
- Fotky nemovitostí
- Dokumenty (smlouvy, faktury)
- Skeny dokladů
- Další soubory

### Databázová struktura

```sql
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(100) NOT NULL,  -- 'property', 'unit', 'contract', 'subject'
  entity_id UUID NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,            -- Cesta v Supabase Storage
  file_size BIGINT,                   -- Velikost v bytech
  mime_type VARCHAR(100),
  description TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Pro snadné vyhledávání
  CONSTRAINT idx_attachments_entity UNIQUE (entity_type, entity_id, file_name)
);

CREATE INDEX idx_attachments_entity_type ON attachments(entity_type, entity_id);
CREATE INDEX idx_attachments_uploaded_at ON attachments(uploaded_at DESC);
```

### Upload přílohy

```javascript
// ui/attachments.js

export async function uploadAttachment(entityType, entityId, file) {
  try {
    // 1. Upload souboru do Storage
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `${entityType}/${entityId}/${fileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // 2. Ulož metadata do databáze
    const { data, error } = await supabase
      .from('attachments')
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}
```

### Zobrazení příloh

```javascript
export async function renderAttachments(root, entityType, entityId) {
  // Načti přílohy
  const { data: attachments, error } = await supabase
    .from('attachments')
    .select(`
      *,
      uploader:uploaded_by(display_name)
    `)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('uploaded_at', { ascending: false });
  
  if (error) {
    root.innerHTML = '<div class="text-red-500">Chyba při načítání příloh</div>';
    return;
  }
  
  root.innerHTML = `
    <div class="space-y-4">
      <!-- Upload -->
      <div class="bg-white p-4 rounded-lg shadow">
        <input type="file" id="fileInput" multiple class="hidden">
        <button id="uploadBtn"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
          📎 Přidat přílohu
        </button>
      </div>
      
      <!-- Seznam příloh -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${attachments.map(att => `
          <div class="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
            <!-- Náhled (pokud je obrázek) -->
            ${isImage(att.mime_type) ? `
              <img src="${getPublicUrl(att.file_path)}" 
                   alt="${att.file_name}"
                   class="w-full h-48 object-cover rounded-lg mb-3">
            ` : `
              <div class="w-full h-48 bg-slate-100 rounded-lg mb-3 flex items-center justify-center text-6xl">
                ${getFileIcon(att.mime_type)}
              </div>
            `}
            
            <!-- Info -->
            <div class="text-sm font-medium truncate mb-1">${att.file_name}</div>
            <div class="text-xs text-slate-600 mb-3">
              ${formatFileSize(att.file_size)} • ${formatDate(att.uploaded_at)}
            </div>
            
            <!-- Akce -->
            <div class="flex gap-2">
              <a href="${getPublicUrl(att.file_path)}" target="_blank" download
                 class="flex-1 text-center py-1 bg-blue-50 hover:bg-blue-100 rounded text-sm">
                📥 Stáhnout
              </a>
              <button data-delete="${att.id}"
                class="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-sm">
                🗑️
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  // Event handlers
  const uploadBtn = root.querySelector('#uploadBtn');
  const fileInput = root.querySelector('#fileInput');
  
  uploadBtn.addEventListener('click', () => fileInput.click());
  
  fileInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      const { error } = await uploadAttachment(entityType, entityId, file);
      
      if (error) {
        toast(`Chyba při nahrávání ${file.name}`, 'error');
      } else {
        toast(`${file.name} nahráno`, 'success');
      }
    }
    
    // Reload
    renderAttachments(root, entityType, entityId);
  });
  
  // Mazání
  root.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Opravdu smazat přílohu?')) return;
      
      const id = btn.dataset.delete;
      const { error } = await deleteAttachment(id);
      
      if (error) {
        toast('Chyba při mazání', 'error');
      } else {
        toast('Příloha smazána', 'success');
        renderAttachments(root, entityType, entityId);
      }
    });
  });
}

function isImage(mimeType) {
  return mimeType?.startsWith('image/');
}

function getFileIcon(mimeType) {
  if (mimeType?.startsWith('image/')) return '🖼️';
  if (mimeType?.startsWith('application/pdf')) return '📄';
  if (mimeType?.startsWith('application/vnd.ms-excel')) return '📊';
  if (mimeType?.startsWith('application/msword')) return '📝';
  return '📎';
}

function getPublicUrl(filePath) {
  const { data } = supabase.storage
    .from('attachments')
    .getPublicUrl(filePath);
  return data.publicUrl;
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
```

### Smazání přílohy

```javascript
async function deleteAttachment(attachmentId) {
  try {
    // 1. Získej data přílohy
    const { data: attachment } = await supabase
      .from('attachments')
      .select('file_path')
      .eq('id', attachmentId)
      .single();
    
    if (!attachment) throw new Error('Příloha nenalezena');
    
    // 2. Smaž soubor ze Storage
    const { error: storageError } = await supabase.storage
      .from('attachments')
      .remove([attachment.file_path]);
    
    if (storageError) throw storageError;
    
    // 3. Smaž záznam z databáze
    const { error } = await supabase
      .from('attachments')
      .delete()
      .eq('id', attachmentId);
    
    if (error) throw error;
    
    return { error: null };
  } catch (err) {
    return { error: err };
  }
}
```

---

**Konec dokumentu - Historie a Přílohy** ✅
