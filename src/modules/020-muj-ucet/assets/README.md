# Moduly 010 (Správa uživatelů) a 020 (Můj účet) — Podrobná specifikace

**Verze:** 2025-11-10  
**Autor:** PatrikCechlovsky  
**Účel:** Kompletní zadání pro agenta k implementaci modulů 010 a 020 s autentizací, 2FA a rychlým přístupem

---

## 📋 Obsah

1. [Přehled](#přehled)
2. [Modul 010 - Správa uživatelů](#modul-010---správa-uživatelů)
3. [Modul 020 - Můj účet](#modul-020---můj-účet)
4. [Login Overlay](#login-overlay)
5. [Dvoufázové ověření (2FA)](#dvoufázové-ověření-2fa)
6. [Rychlý přístup k nemovitostem](#rychlý-přístup-k-nemovitostem)
7. [Acceptační kritéria](#acceptační-kritéria)

---

## Přehled

Tento dokument poskytuje **kompletní a podrobné** zadání pro vytvoření/rozšíření modulů:

- **010 - Správa uživatelů** (existující, vyžaduje rozšíření)
- **020 - Můj účet** (existující, vyžaduje rozšíření)

### Hlavní cíle implementace

1. **Přihlášení s login overlay**
   - Zobrazit login formulář v centrální části stránky (content area)
   - Blokovat interakci s UI dokud není uživatel plně přihlášen
   - Vizuální zatemněn pozadí

2. **Dvoufázové ověření (2FA)**
   - Podpora více metod: E-mail, SMS, TOTP, Push, Biometrie
   - Náhradní recovery kódy
   - Kompletní audit log
   - Admin možnost resetovat 2FA

3. **Rychlý přístup k nemovitostem**
   - Uživatelé mohou rychle přistupovat k nemovitostem, které spravují
   - Filtrování podle role (správce, vlastník)
   - Rychlé odkazy na dokumenty a smlouvy

4. **Bezpečnost**
   - RLS policies
   - Rate limiting
   - Šifrování citlivých dat
   - Kompletní audit trail

---

## Modul 010 - Správa uživatelů

### Stávající struktura

```
src/modules/010-sprava-uzivatelu/
├── module.config.js
├── tiles/
│   └── prehled.js
└── forms/
    ├── form.js
    ├── create.js
    └── role.js
```

### Manifest (module.config.js)

```javascript
export async function getManifest() {
  return {
    id: '010-sprava-uzivatelu',
    title: 'Uživatelé',
    icon: 'users',
    defaultTile: 'prehled',
    tiles: [
      { id: 'prehled', title: 'Přehled', icon: 'list' },
      { id: 'audit-2fa', title: '2FA Audit', icon: 'security' } // NOVÝ
    ],
    forms: [
      { id: 'form', title: 'Formulář', icon: 'form' },
      { id: 'create', title: 'Nový / Pozvat', icon: 'add' },
      { id: 'role', title: 'Role & barvy', icon: 'settings' }
    ]
  };
}
```

### Funkce a rozšíření

#### 1. Přehled uživatelů (tiles/prehled.js)

**Stávající funkce:**
- Zobrazení seznamu uživatelů
- Filtrace podle role
- Přepínání archivovaných
- CRUD operace

**Nové funkce:**
- Sloupec s indikátorem 2FA stavu (zapnuto/vypnuto)
- Badge zobrazující metody 2FA (📧 📱 🔐)
- Akce "Reset 2FA" (pouze pro admin)
- Filtr uživatelů s/bez 2FA

**Příklad sloupců:**

```javascript
const columns = [
  { key: 'username', label: 'Uživatel', width: '15%', sortable: true },
  { key: 'display_name', label: 'Jméno', width: '20%', sortable: true },
  { key: 'email', label: 'E-mail', width: '20%', sortable: true },
  { key: 'role', label: 'Role', width: '12%', sortable: true },
  { key: 'twofa_status', label: '2FA', width: '10%' }, // NOVÝ
  { key: 'last_login', label: 'Poslední přihlášení', width: '13%', sortable: true },
  { key: 'active', label: 'Aktivní', width: '8%' },
  { key: 'archivedLabel', label: 'Archivován', width: '8%' }
];
```

**Akce (CommonActions):**
- `add` - Přidat uživatele (navigace na create form)
- `edit` - Upravit uživatele (navigace na form)
- `archive` - Archivovat uživatele (jen admin)
- `reset-2fa` - Resetovat 2FA (jen admin, jen když je vybrán uživatel) ⚠️ NOVÝ
- `refresh` - Obnovit seznam

#### 2. Nová tile: 2FA Audit (tiles/audit-2fa.js)

**Účel:** Zobrazit log všech 2FA událostí v systému

**Funkce:**
- Tabulka událostí z `twofa_events`
- Filtrace podle:
  - Typ události (enable, disable, verify_success, verify_fail, reset)
  - Uživatel
  - Časové období
  - IP adresa
- Export do CSV

**Příklad sloupců:**

```javascript
const columns = [
  { key: 'timestamp', label: 'Datum', width: '15%', sortable: true },
  { key: 'username', label: 'Uživatel', width: '15%' },
  { key: 'event_type', label: 'Událost', width: '15%' },
  { key: 'method', label: 'Metoda', width: '10%' },
  { key: 'ip_address', label: 'IP', width: '12%' },
  { key: 'user_agent', label: 'Zařízení', width: '18%' },
  { key: 'success', label: 'Výsledek', width: '8%' }
];
```

#### 3. Formulář uživatele (forms/form.js)

**Rozšíření:**

Přidat sekci "Dvoufázové ověření" (pouze pro admin):

```javascript
// Část formuláře pro 2FA správu (readonly pro běžného uživatele)
{
  type: 'section',
  label: 'Dvoufázové ověření',
  fields: [
    {
      name: 'twofa_enabled',
      label: '2FA aktivní',
      type: 'checkbox',
      readonly: true, // Admin může jen vidět, ne měnit
      help: 'Uživatel spravuje 2FA ve svém profilu (modul 020)'
    },
    {
      name: 'twofa_methods_display',
      label: 'Aktivní metody',
      type: 'text',
      readonly: true,
      compute: (data) => {
        const methods = data.twofa_methods || [];
        const labels = {
          email: 'E-mail',
          sms: 'SMS',
          totp: 'TOTP',
          push: 'Push',
          biometric: 'Biometrie'
        };
        return methods.map(m => labels[m] || m).join(', ') || 'Žádné';
      }
    }
  ],
  actions: [
    {
      type: 'button',
      label: 'Reset 2FA',
      icon: 'lock_reset',
      variant: 'danger',
      confirm: 'Opravdu chcete resetovat 2FA pro tohoto uživatele? Bude muset nastavit 2FA znovu.',
      permission: 'users.reset_2fa',
      action: async (profileId) => {
        await reset2FA(profileId);
        showToast('2FA bylo resetováno', 'success');
      }
    }
  ]
}
```

**Reset 2FA funkce (v db.js):**

```javascript
/**
 * Reset 2FA for user (admin only)
 */
export async function reset2FA(profileId) {
  try {
    const now = new Date().toISOString();
    const adminId = (await supabase.auth.getUser()).data?.user?.id;
    
    // Clear all 2FA settings
    const { data, error } = await supabase
      .from('profiles')
      .update({
        twofa_enabled: false,
        twofa_methods: [],
        twofa_totp_secret: null,
        twofa_recovery_codes: null,
        updated_at: now,
        updated_by: adminId
      })
      .eq('id', profileId)
      .select()
      .single();
    
    if (error) {
      console.error('Error resetting 2FA:', error);
      return { data: null, error };
    }
    
    // Log event
    await supabase.from('twofa_events').insert({
      profile_id: profileId,
      event_type: 'reset_by_admin',
      admin_id: adminId,
      ip: await getCurrentIP(),
      user_agent: navigator.userAgent,
      created_at: now
    });
    
    return { data, error: null };
  } catch (err) {
    console.error('Exception in reset2FA:', err);
    return { data: null, error: err };
  }
}
```

#### 4. Pozvání uživatele (forms/create.js)

**Rozšíření:**

Přidat možnost vynutit 2FA při vytvoření účtu:

```javascript
{
  name: 'require_2fa',
  label: 'Vyžadovat 2FA při prvním přihlášení',
  type: 'checkbox',
  defaultValue: false,
  help: 'Uživatel bude muset nastavit 2FA před prvním použitím aplikace'
}
```

---

## Modul 020 - Můj účet

### Stávající struktura

```
src/modules/020-muj-ucet/
├── module.config.js
├── assets/           # dokumentace
│   ├── README.md
│   ├── permissions.md
│   ├── datovy-model.md
│   └── checklist.md
├── tiles/
│   (žádné - tento modul nemá tiles)
└── forms/
    └── form.js
```

### Manifest (module.config.js)

```javascript
export async function getManifest() {
  return {
    id: '020-muj-ucet',
    title: 'Můj účet',
    icon: 'account',
    forms: [
      { id: 'form', title: 'Upravit profil', icon: 'account' }
    ],
    tiles: []
  };
}
```

### Funkce a rozšíření

#### 1. Formulář profilu (forms/form.js)

**Stávající sekce:**
- Základní údaje (jméno, e-mail, telefon)
- Heslo (změna hesla)
- Preference

**Nové sekce:**

##### A. Dvoufázové ověření (Two-Factor Authentication)

Kompletní UI pro správu 2FA metod:

```javascript
// Sekce 2FA
{
  type: 'section',
  label: 'Dvoufázové ověření',
  description: 'Zvyšte zabezpečení vašeho účtu pomocí druhého faktoru ověření',
  fields: [
    {
      type: 'custom',
      render: (container, data) => {
        render2FAManagementUI(container, data);
      }
    }
  ]
}
```

**Komponenta 2FA Management UI:**

```javascript
async function render2FAManagementUI(container, profileData) {
  const enabled = profileData.twofa_enabled || false;
  const methods = profileData.twofa_methods || [];
  
  container.innerHTML = `
    <div class="twofa-management">
      <!-- Hlavní přepínač -->
      <div class="twofa-toggle">
        <label class="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <span class="font-semibold">Zapnout dvoufázové ověření</span>
            <p class="text-sm text-gray-600">Doporučujeme pro zvýšení zabezpečení</p>
          </div>
          <input type="checkbox" ${enabled ? 'checked' : ''} 
                 id="twofa-master-toggle" class="toggle-switch">
        </label>
      </div>
      
      <!-- Metody (viditelné pouze pokud je 2FA zapnuto) -->
      <div id="twofa-methods" class="${enabled ? '' : 'hidden'}">
        
        <!-- E-mail -->
        <div class="twofa-method">
          <div class="flex items-center justify-between p-4 border rounded-lg mt-3">
            <div class="flex items-center gap-3">
              <span class="text-2xl">📧</span>
              <div>
                <span class="font-medium">E-mailový kód</span>
                <p class="text-sm text-gray-600">${profileData.primary_email || 'Nenastaveno'}</p>
              </div>
            </div>
            <input type="checkbox" ${methods.includes('email') ? 'checked' : ''}
                   data-method="email" class="method-checkbox">
          </div>
        </div>
        
        <!-- SMS -->
        <div class="twofa-method">
          <div class="flex items-center justify-between p-4 border rounded-lg mt-3">
            <div class="flex items-center gap-3">
              <span class="text-2xl">📱</span>
              <div>
                <span class="font-medium">SMS kód</span>
                <p class="text-sm text-gray-600">${profileData.primary_phone || 'Nenastaveno'}</p>
              </div>
            </div>
            <input type="checkbox" ${methods.includes('sms') ? 'checked' : ''}
                   data-method="sms" class="method-checkbox"
                   ${!profileData.primary_phone ? 'disabled' : ''}>
          </div>
          ${!profileData.primary_phone ? '<p class="text-xs text-orange-600 mt-1 ml-12">Nejprve vyplňte telefonní číslo</p>' : ''}
        </div>
        
        <!-- TOTP (Google Authenticator) -->
        <div class="twofa-method">
          <div class="flex items-center justify-between p-4 border rounded-lg mt-3">
            <div class="flex items-center gap-3">
              <span class="text-2xl">🔐</span>
              <div>
                <span class="font-medium">Authenticator app (TOTP)</span>
                <p class="text-sm text-gray-600">Google Authenticator, Authy, apod.</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              ${methods.includes('totp') ? 
                '<span class="text-green-600 text-sm">✓ Aktivní</span>' : 
                '<button class="btn btn-sm btn-primary" id="btn-setup-totp">Nastavit</button>'}
            </div>
          </div>
        </div>
        
        <!-- Biometrie (pokud podporováno) -->
        <div class="twofa-method" id="biometric-section" style="display: none;">
          <div class="flex items-center justify-between p-4 border rounded-lg mt-3">
            <div class="flex items-center gap-3">
              <span class="text-2xl">👤</span>
              <div>
                <span class="font-medium">Biometrie</span>
                <p class="text-sm text-gray-600">FaceID / TouchID / Fingerprint</p>
              </div>
            </div>
            <input type="checkbox" ${methods.includes('biometric') ? 'checked' : ''}
                   data-method="biometric" class="method-checkbox">
          </div>
        </div>
        
        <!-- Recovery kódy -->
        <div class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div class="flex items-start gap-3">
            <span class="text-2xl">🔑</span>
            <div class="flex-1">
              <h4 class="font-semibold">Náhradní kódy</h4>
              <p class="text-sm text-gray-700 mb-3">
                Uložte si náhradní kódy pro případ, že ztratíte přístup k 2FA zařízení
              </p>
              <button class="btn btn-sm btn-outline" id="btn-generate-recovery">
                Generovat nové kódy
              </button>
              ${profileData.twofa_recovery_codes ? 
                '<button class="btn btn-sm btn-outline ml-2" id="btn-show-recovery">Zobrazit kódy</button>' : ''}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  `;
  
  // Event listeners
  setupTwoFAListeners(container, profileData);
}
```

**TOTP Setup Modal:**

```javascript
async function showTOTPSetupModal() {
  // 1. Vygenerovat TOTP secret na backendu
  const { secret, qrCodeUrl } = await generateTOTPSecret();
  
  // 2. Zobrazit modal s QR kódem
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Nastavení TOTP Authenticator</h2>
      
      <div class="steps">
        <div class="step">
          <h3>1. Naskenujte QR kód</h3>
          <div class="qr-code-container">
            <img src="${qrCodeUrl}" alt="QR Code">
          </div>
          <p class="text-sm text-gray-600">
            Nebo zadejte ručně: <code>${secret}</code>
          </p>
        </div>
        
        <div class="step mt-4">
          <h3>2. Zadejte 6-místný kód z aplikace</h3>
          <input type="text" 
                 id="totp-verify-code" 
                 placeholder="123456" 
                 maxlength="6" 
                 class="text-center text-2xl tracking-widest">
        </div>
      </div>
      
      <div class="modal-actions">
        <button class="btn btn-secondary" id="btn-cancel-totp">Zrušit</button>
        <button class="btn btn-primary" id="btn-confirm-totp">Potvrdit</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Event listeners pro potvrzení
  document.getElementById('btn-confirm-totp').addEventListener('click', async () => {
    const code = document.getElementById('totp-verify-code').value;
    const { success, error } = await verifyAndEnableTOTP(secret, code);
    
    if (success) {
      showToast('TOTP úspěšně aktivováno', 'success');
      modal.remove();
      // Reload profilu
    } else {
      showToast('Neplatný kód, zkuste znovu', 'error');
    }
  });
}
```

**Recovery Codes Modal:**

```javascript
async function showRecoveryCodesModal(codes) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>⚠️ Náhradní kódy</h2>
      <p class="text-orange-600 mb-4">
        Uložte si tyto kódy na bezpečné místo! Každý kód lze použít pouze jednou.
      </p>
      
      <div class="recovery-codes">
        ${codes.map((code, i) => `
          <div class="code-item">${i + 1}. <code>${code}</code></div>
        `).join('')}
      </div>
      
      <div class="modal-actions mt-4">
        <button class="btn btn-secondary" id="btn-download-codes">
          Stáhnout jako textový soubor
        </button>
        <button class="btn btn-primary" id="btn-close-codes">
          Uložil/a jsem si kódy
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Download handler
  document.getElementById('btn-download-codes').addEventListener('click', () => {
    const blob = new Blob([codes.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recovery-codes.txt';
    a.click();
  });
}
```

##### B. Rychlý přístup k nemovitostem

**Sekce "Moje nemovitosti":**

```javascript
{
  type: 'section',
  label: 'Rychlý přístup',
  description: 'Nemovitosti a jednotky, které spravujete nebo vlastníte',
  fields: [
    {
      type: 'custom',
      render: async (container, data) => {
        await renderQuickAccessUI(container, data.id);
      }
    }
  ]
}
```

**Quick Access UI:**

```javascript
async function renderQuickAccessUI(container, profileId) {
  // Načíst nemovitosti kde je uživatel správce
  const { data: managed } = await supabase
    .from('property_managers')
    .select('property:properties(*), role')
    .eq('profile_id', profileId);
  
  // Načíst nemovitosti kde je uživatel vlastník (přes subjects)
  const { data: owned } = await supabase
    .from('properties')
    .select('*, subject:subjects!pronajimatel_id(*)')
    .eq('subjects.user_subjects.profile_id', profileId);
  
  container.innerHTML = `
    <div class="quick-access">
      
      <!-- Spravované nemovitosti -->
      ${managed.length > 0 ? `
        <div class="mb-4">
          <h4 class="font-semibold mb-2">📋 Spravuji (${managed.length})</h4>
          <div class="grid gap-2">
            ${managed.map(m => `
              <div class="property-card" data-id="${m.property.id}">
                <div class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">🏢</span>
                    <div>
                      <div class="font-medium">${m.property.nazev}</div>
                      <div class="text-sm text-gray-600">${m.property.mesto}</div>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button class="btn-icon" title="Dokumenty" data-action="docs">📄</button>
                    <button class="btn-icon" title="Jednotky" data-action="units">🏠</button>
                    <button class="btn-icon" title="Detail" data-action="detail">➡️</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      <!-- Vlastněné nemovitosti -->
      ${owned.length > 0 ? `
        <div class="mb-4">
          <h4 class="font-semibold mb-2">🏆 Vlastním (${owned.length})</h4>
          <div class="grid gap-2">
            ${owned.map(p => `
              <div class="property-card" data-id="${p.id}">
                <div class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">🏠</span>
                    <div>
                      <div class="font-medium">${p.nazev}</div>
                      <div class="text-sm text-gray-600">${p.mesto}</div>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button class="btn-icon" title="Dokumenty" data-action="docs">📄</button>
                    <button class="btn-icon" title="Jednotky" data-action="units">🏠</button>
                    <button class="btn-icon" title="Detail" data-action="detail">➡️</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      <!-- Pokud žádné -->
      ${managed.length === 0 && owned.length === 0 ? `
        <div class="text-center text-gray-500 py-8">
          <span class="text-4xl">🏢</span>
          <p class="mt-2">Žádné nemovitosti k zobrazení</p>
        </div>
      ` : ''}
      
    </div>
  `;
  
  // Event listeners
  setupQuickAccessListeners(container);
}

function setupQuickAccessListeners(container) {
  container.querySelectorAll('[data-action="detail"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const propertyId = e.target.closest('.property-card').dataset.id;
      navigateTo(`#/m/040-nemovitost/f/detail?id=${propertyId}`);
    });
  });
  
  container.querySelectorAll('[data-action="units"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const propertyId = e.target.closest('.property-card').dataset.id;
      navigateTo(`#/m/040-nemovitost/f/detail?id=${propertyId}&tab=units`);
    });
  });
  
  container.querySelectorAll('[data-action="docs"]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const propertyId = e.target.closest('.property-card').dataset.id;
      await showPropertyDocumentsModal(propertyId);
    });
  });
}
```

---

## Login Overlay

### Účel

Zajistit, že uživatel nemůže interagovat s aplikací dokud není plně přihlášen (včetně 2FA).

### UX požadavky

1. **Po načtení aplikace (nepřihlášen):**
   - Zobrazit login overlay v **content area** (centrální část)
   - Zatemněnět/deaktivovat zbytek UI (sidebar, header, buttons)
   - Nelze kliknout na nic jiného kromě login formuláře

2. **Login flow:**
   ```
   1. Zadání e-mailu/username + hesla
   2. Klik na "Přihlásit"
   3. Pokud uživatel má 2FA → zobrazit 2FA výzvu
   4. Pokud uživatel NEMÁ 2FA → přihlásit rovnou
   5. Po úspěšném 2FA → přihlásit
   6. Overlay zmizí, UI se zpřístupní
   ```

3. **2FA výzva (v overlay):**
   - Zobrazit dostupné metody (e-mail, SMS, TOTP)
   - Tlačítko "Poslat kód znovu" (s cooldown 30s)
   - Pole pro zadání kódu
   - Tlačítko "Ověřit"
   - Link "Použít náhradní kód"

### Implementace

#### Komponenta: LoginOverlay.js

```javascript
// src/components/LoginOverlay.js

export class LoginOverlay {
  constructor() {
    this.container = null;
    this.state = 'login'; // 'login' | '2fa' | 'recovery'
    this.challengeId = null;
    this.availableMethods = [];
  }
  
  render(parentContainer) {
    this.container = document.createElement('div');
    this.container.id = 'login-overlay';
    this.container.className = 'fixed inset-0 z-50 flex items-center justify-center';
    this.container.innerHTML = `
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black bg-opacity-50"></div>
      
      <!-- Login card -->
      <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        <div id="login-overlay-content">
          ${this.renderLoginForm()}
        </div>
      </div>
    `;
    
    parentContainer.appendChild(this.container);
    this.attachListeners();
    
    // Disable rest of UI
    this.disableUI();
  }
  
  renderLoginForm() {
    return `
      <h2 class="text-2xl font-bold mb-6 text-center">Přihlášení</h2>
      
      <form id="login-form" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">E-mail nebo uživatelské jméno</label>
          <input type="text" 
                 id="login-identifier" 
                 class="w-full px-3 py-2 border rounded-lg" 
                 required 
                 autofocus>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Heslo</label>
          <input type="password" 
                 id="login-password" 
                 class="w-full px-3 py-2 border rounded-lg" 
                 required>
        </div>
        
        <div class="flex items-center">
          <input type="checkbox" id="remember-me" class="mr-2">
          <label for="remember-me" class="text-sm">Zapamatovat si mě</label>
        </div>
        
        <button type="submit" class="w-full btn btn-primary py-2">
          Přihlásit
        </button>
        
        <div class="text-center">
          <a href="#/forgot-password" class="text-sm text-blue-600 hover:underline">
            Zapomenuté heslo?
          </a>
        </div>
      </form>
      
      <div id="login-error" class="mt-4 hidden">
        <div class="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm"></div>
      </div>
    `;
  }
  
  render2FAForm() {
    const methodLabels = {
      email: 'E-mail',
      sms: 'SMS',
      totp: 'Authenticator app'
    };
    
    return `
      <h2 class="text-2xl font-bold mb-6 text-center">Dvoufázové ověření</h2>
      
      <p class="text-sm text-gray-600 mb-4 text-center">
        Vyberte metodu a zadejte ověřovací kód
      </p>
      
      <!-- Method selector -->
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">Metoda ověření</label>
        <select id="twofa-method" class="w-full px-3 py-2 border rounded-lg">
          ${this.availableMethods.map(m => `
            <option value="${m}">${methodLabels[m] || m}</option>
          `).join('')}
        </select>
      </div>
      
      <!-- Code input -->
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">Ověřovací kód</label>
        <input type="text" 
               id="twofa-code" 
               class="w-full px-3 py-2 border rounded-lg text-center text-2xl tracking-widest" 
               placeholder="123456"
               maxlength="6"
               pattern="[0-9]{6}"
               required
               autofocus>
      </div>
      
      <!-- Send code button (for email/sms) -->
      <div class="mb-4 text-center" id="send-code-container">
        <button type="button" id="btn-send-code" class="text-sm text-blue-600 hover:underline">
          Poslat kód znovu
        </button>
        <span id="send-code-countdown" class="text-sm text-gray-500 hidden"></span>
      </div>
      
      <button type="button" id="btn-verify-2fa" class="w-full btn btn-primary py-2 mb-3">
        Ověřit
      </button>
      
      <button type="button" id="btn-use-recovery" class="w-full btn btn-secondary py-2">
        Použít náhradní kód
      </button>
      
      <div id="twofa-error" class="mt-4 hidden">
        <div class="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm"></div>
      </div>
    `;
  }
  
  renderRecoveryForm() {
    return `
      <h2 class="text-2xl font-bold mb-6 text-center">Náhradní kód</h2>
      
      <p class="text-sm text-gray-600 mb-4">
        Zadejte jeden z vašich náhradních kódů
      </p>
      
      <div class="mb-4">
        <input type="text" 
               id="recovery-code" 
               class="w-full px-3 py-2 border rounded-lg text-center" 
               placeholder="XXXX-XXXX-XXXX-XXXX"
               required
               autofocus>
      </div>
      
      <button type="button" id="btn-verify-recovery" class="w-full btn btn-primary py-2 mb-3">
        Ověřit
      </button>
      
      <button type="button" id="btn-back-to-2fa" class="w-full btn btn-secondary py-2">
        Zpět na 2FA
      </button>
      
      <div id="recovery-error" class="mt-4 hidden">
        <div class="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm"></div>
      </div>
    `;
  }
  
  async attachListeners() {
    // Login form submit
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleLogin();
      });
    }
    
    // 2FA verify
    const btnVerify2FA = document.getElementById('btn-verify-2fa');
    if (btnVerify2FA) {
      btnVerify2FA.addEventListener('click', () => this.handleVerify2FA());
    }
    
    // Send code again
    const btnSendCode = document.getElementById('btn-send-code');
    if (btnSendCode) {
      btnSendCode.addEventListener('click', () => this.handleSendCode());
    }
    
    // Use recovery code
    const btnUseRecovery = document.getElementById('btn-use-recovery');
    if (btnUseRecovery) {
      btnUseRecovery.addEventListener('click', () => this.switchToRecovery());
    }
    
    // Verify recovery
    const btnVerifyRecovery = document.getElementById('btn-verify-recovery');
    if (btnVerifyRecovery) {
      btnVerifyRecovery.addEventListener('click', () => this.handleVerifyRecovery());
    }
    
    // Back to 2FA
    const btnBackTo2FA = document.getElementById('btn-back-to-2fa');
    if (btnBackTo2FA) {
      btnBackTo2FA.addEventListener('click', () => this.switchTo2FA());
    }
  }
  
  async handleLogin() {
    const identifier = document.getElementById('login-identifier').value;
    const password = document.getElementById('login-password').value;
    
    const { data, error, twofa_required, challenge_id, methods } = await loginUser(identifier, password);
    
    if (error) {
      this.showError('login-error', error.message);
      return;
    }
    
    if (twofa_required) {
      // Switch to 2FA form
      this.challengeId = challenge_id;
      this.availableMethods = methods;
      this.switchTo2FA();
    } else {
      // Success - close overlay
      this.onSuccess(data);
    }
  }
  
  async handleVerify2FA() {
    const method = document.getElementById('twofa-method').value;
    const code = document.getElementById('twofa-code').value;
    
    const { data, error } = await verify2FACode(this.challengeId, method, code);
    
    if (error) {
      this.showError('twofa-error', error.message);
      return;
    }
    
    // Success
    this.onSuccess(data);
  }
  
  async handleSendCode() {
    const method = document.getElementById('twofa-method').value;
    
    // Disable button and show countdown
    const btn = document.getElementById('btn-send-code');
    const countdown = document.getElementById('send-code-countdown');
    
    btn.classList.add('hidden');
    countdown.classList.remove('hidden');
    
    let seconds = 30;
    const interval = setInterval(() => {
      countdown.textContent = `Znovu můžete poslat za ${seconds}s`;
      seconds--;
      if (seconds < 0) {
        clearInterval(interval);
        btn.classList.remove('hidden');
        countdown.classList.add('hidden');
      }
    }, 1000);
    
    // Send code
    await send2FACode(this.challengeId, method);
  }
  
  async handleVerifyRecovery() {
    const code = document.getElementById('recovery-code').value;
    
    const { data, error } = await verifyRecoveryCode(this.challengeId, code);
    
    if (error) {
      this.showError('recovery-error', error.message);
      return;
    }
    
    // Success
    this.onSuccess(data);
  }
  
  switchTo2FA() {
    this.state = '2fa';
    const content = document.getElementById('login-overlay-content');
    content.innerHTML = this.render2FAForm();
    this.attachListeners();
  }
  
  switchToRecovery() {
    this.state = 'recovery';
    const content = document.getElementById('login-overlay-content');
    content.innerHTML = this.renderRecoveryForm();
    this.attachListeners();
  }
  
  showError(containerId, message) {
    const errorDiv = document.getElementById(containerId);
    if (errorDiv) {
      errorDiv.classList.remove('hidden');
      errorDiv.querySelector('div').textContent = message;
    }
  }
  
  disableUI() {
    // Add class to body to disable interactions
    document.body.classList.add('login-overlay-active');
    
    // Add CSS to disable pointer events on everything except overlay
    const style = document.createElement('style');
    style.id = 'login-overlay-style';
    style.textContent = `
      body.login-overlay-active > *:not(#login-overlay) {
        pointer-events: none;
        opacity: 0.5;
      }
    `;
    document.head.appendChild(style);
  }
  
  onSuccess(userData) {
    // Store user data
    window.currentUser = userData;
    
    // Remove overlay
    this.remove();
    
    // Trigger app reload or state update
    window.dispatchEvent(new CustomEvent('user-logged-in', { detail: userData }));
  }
  
  remove() {
    if (this.container) {
      this.container.remove();
    }
    
    // Re-enable UI
    document.body.classList.remove('login-overlay-active');
    document.getElementById('login-overlay-style')?.remove();
  }
}
```

#### Integrace v app.js

```javascript
// src/app.js

import { LoginOverlay } from './components/LoginOverlay.js';

// Check auth state on app load
async function initApp() {
  const user = await getCurrentUser();
  
  if (!user) {
    // Show login overlay
    const overlay = new LoginOverlay();
    overlay.render(document.body);
  } else {
    // User logged in, proceed normally
    loadApp();
  }
}

// Listen for login success
window.addEventListener('user-logged-in', (e) => {
  console.log('User logged in:', e.detail);
  loadApp();
});
```

---

## Dvoufázové ověření (2FA)

### Podporované metody

1. **E-mail** - Kód zaslaný na primary_email
2. **SMS** - Kód zaslaný na primary_phone
3. **TOTP** - Time-based One-Time Password (Google Authenticator, Authy)
4. **Push notifikace** - (volitelně, pokud infrastruktura podporuje)
5. **Biometrie** - FaceID/TouchID (klientská implementace)
6. **Náhradní kódy** - Recovery codes (jednorázové)

### Workflow

#### 1. Zapnutí 2FA

```
Uživatel v modulu 020:
1. Zapne master toggle "Zapnout 2FA"
2. Vybere metodu (např. E-mail)
3. Systém pošle testovací kód
4. Uživatel zadá kód -> potvrzení
5. Metoda je aktivována
```

#### 2. Přihlášení s 2FA

```
1. Zadání hesla
2. Backend kontrola: user.twofa_enabled?
3. ANO → Vytvoří 2FA challenge
4. Vrátí { twofa_required: true, challenge_id, methods: [...] }
5. Frontend zobrazí 2FA form
6. Uživatel vybere metodu
7. Pro email/sms: automaticky se pošle kód
8. Pro TOTP: uživatel vygeneruje v app
9. Zadání kódu
10. Backend verify → Success nebo Error
11. Success → vydá token, přihlášen
```

#### 3. TOTP Setup

```
1. Klik na "Nastavit TOTP"
2. Backend: vygeneruje secret
3. Frontend: zobrazí QR kód + secret text
4. Uživatel: naskenuje v Google Authenticator
5. Zadá první vygenerovaný kód
6. Backend: ověří kód
7. Success → uloží encrypted secret do DB
8. TOTP aktivován
```

#### 4. Recovery Codes

```
1. Klik na "Generovat náhradní kódy"
2. Backend: vygeneruje 10 náhodných kódů
3. Uloží encrypted do DB
4. Vrátí kódy frontednu
5. Frontend: zobrazí modal s kódy
6. Uživatel: stáhne nebo zkopíruje
7. Každý kód lze použít pouze jednou
```

### Bezpečnostní požadavky

1. **Rate limiting:**
   - Max 5 pokusů o ověření 2FA za 15 minut
   - Max 3 pokusy poslat kód za 10 minut

2. **Kódy:**
   - E-mail/SMS kódy: 6 číslic, platnost 10 minut
   - TOTP: 6 číslic, platnost 30s (standard)
   - Recovery: 16 znaků (XXXX-XXXX-XXXX-XXXX)

3. **Šifrování:**
   - TOTP secret: šifrovaný v DB
   - Recovery codes: šifrované v DB
   - Nikdy nelogovat kódy v plain textu

4. **Audit:**
   - Logovat všechny 2FA události do `twofa_events`
   - Včetně IP adresy a user agent

---

## Rychlý přístup k nemovitostem

### Účel

Umožnit uživatelům rychle přistupovat k nemovitostem, které:
- Spravují (jsou správci)
- Vlastní (jsou pronajímatelé)

### Funkce

1. **Seznam nemovitostí:**
   - Sekce "Spravuji" - nemovitosti kde je uživatel v `property_managers`
   - Sekce "Vlastním" - nemovitosti kde je uživatel vlastník

2. **Akce pro každou nemovitost:**
   - Detail - navigace na detail nemovitosti
   - Jednotky - zobrazení jednotek nemovitosti
   - Dokumenty - zobrazení dokumentů nemovitosti (modal)

3. **Dokumenty modal:**
   - Seznam dokumentů z `property_documents`
   - Filtr podle typu (smlouva, plán, fotka, atd.)
   - Možnost stáhnout

### Implementace

#### Tabulka property_managers

```sql
CREATE TABLE IF NOT EXISTS property_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'manager', -- manager, co-manager, assistant
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  
  UNIQUE(property_id, profile_id)
);

CREATE INDEX idx_property_managers_property ON property_managers(property_id);
CREATE INDEX idx_property_managers_profile ON property_managers(profile_id);
```

#### Tabulka property_documents

```sql
CREATE TABLE IF NOT EXISTS property_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  doc_type VARCHAR(50) NOT NULL, -- contract, plan, photo, invoice, other
  title VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID,
  
  notes TEXT
);

CREATE INDEX idx_property_documents_property ON property_documents(property_id);
CREATE INDEX idx_property_documents_type ON property_documents(doc_type);
```

#### API endpoint: Quick Access

```javascript
// GET /api/profiles/me/quick-access

export async function getQuickAccess(profileId) {
  try {
    // Managed properties
    const { data: managed } = await supabase
      .from('property_managers')
      .select(`
        id,
        role,
        property:properties(
          id,
          nazev,
          mesto,
          typ_nemovitosti,
          pocet_jednotek
        )
      `)
      .eq('profile_id', profileId);
    
    // Owned properties (via subjects)
    const { data: subjectsData } = await supabase
      .from('user_subjects')
      .select('subject_id')
      .eq('profile_id', profileId);
    
    const subjectIds = subjectsData.map(s => s.subject_id);
    
    const { data: owned } = await supabase
      .from('properties')
      .select('id, nazev, mesto, typ_nemovitosti, pocet_jednotek')
      .in('pronajimatel_id', subjectIds);
    
    return {
      data: {
        managed: managed || [],
        owned: owned || []
      },
      error: null
    };
  } catch (err) {
    console.error('Exception in getQuickAccess:', err);
    return { data: null, error: err };
  }
}
```

#### Documents Modal

```javascript
async function showPropertyDocumentsModal(propertyId) {
  const { data: docs } = await supabase
    .from('property_documents')
    .select('*')
    .eq('property_id', propertyId)
    .order('uploaded_at', { ascending: false });
  
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content max-w-2xl">
      <h2 class="text-xl font-bold mb-4">📄 Dokumenty nemovitosti</h2>
      
      <!-- Filter -->
      <div class="mb-4">
        <select id="doc-type-filter" class="px-3 py-2 border rounded">
          <option value="">Všechny typy</option>
          <option value="contract">Smlouvy</option>
          <option value="plan">Plány</option>
          <option value="photo">Fotografie</option>
          <option value="invoice">Faktury</option>
          <option value="other">Ostatní</option>
        </select>
      </div>
      
      <!-- Documents list -->
      <div id="docs-list" class="space-y-2">
        ${docs.map(doc => `
          <div class="doc-item p-3 border rounded-lg hover:bg-gray-50" data-type="${doc.doc_type}">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-2xl">${getDocIcon(doc.doc_type)}</span>
                <div>
                  <div class="font-medium">${doc.title}</div>
                  <div class="text-sm text-gray-600">
                    ${formatDate(doc.uploaded_at)} • ${formatFileSize(doc.file_size)}
                  </div>
                </div>
              </div>
              <a href="${doc.file_url}" target="_blank" download="${doc.file_name}"
                 class="btn btn-sm btn-primary">
                Stáhnout
              </a>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="modal-actions mt-4">
        <button class="btn btn-secondary" id="btn-close-docs">Zavřít</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Filter listener
  document.getElementById('doc-type-filter').addEventListener('change', (e) => {
    const type = e.target.value;
    document.querySelectorAll('.doc-item').forEach(item => {
      if (!type || item.dataset.type === type) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  });
  
  document.getElementById('btn-close-docs').addEventListener('click', () => modal.remove());
}

function getDocIcon(type) {
  const icons = {
    contract: '📝',
    plan: '📐',
    photo: '📸',
    invoice: '🧾',
    other: '📄'
  };
  return icons[type] || '📄';
}
```

---

## Acceptační kritéria

### Login Overlay

- [x] Po spuštění aplikace (nepřihlášen) se zobrazí login overlay
- [x] Overlay je v content area, zbytek UI je zatemněný a neaktivní
- [x] Po zadání správných údajů bez 2FA se uživatel přihlásí
- [x] Po zadání správných údajů s 2FA se zobrazí 2FA výzva
- [x] Po úspěšném 2FA se uživatel přihlásí
- [x] Po přihlášení overlay zmizí a UI je aktivní

### Modul 010 - Správa uživatelů

- [x] Přehled zobrazuje sloupec se stavem 2FA
- [x] Admin může resetovat 2FA uživatele
- [x] Nová tile "2FA Audit" zobrazuje log událostí
- [x] Filtrování událostí v audit logu funguje
- [x] Při pozvání lze vynutit 2FA

### Modul 020 - Můj účet

- [x] Sekce 2FA zobrazuje všechny metody
- [x] Zapnutí/vypnutí metod funguje
- [x] TOTP setup s QR kódem funguje
- [x] Generování recovery kódů funguje
- [x] Sekce "Rychlý přístup" zobrazuje spravované nemovitosti
- [x] Sekce "Rychlý přístup" zobrazuje vlastněné nemovitosti
- [x] Akce (detail, jednotky, dokumenty) fungují

### 2FA Functionality

- [x] E-mail kódy se odesílají správně
- [x] SMS kódy se odesílají správně (testovací provider)
- [x] TOTP kódy se ověřují správně
- [x] Recovery kódy fungují (lze použít jen jednou)
- [x] Rate limiting funguje
- [x] Všechny 2FA události se logují do `twofa_events`

### Databáze

- [x] Migrace přidává nové sloupce do `profiles`
- [x] Tabulka `twofa_events` existuje a funguje
- [x] Tabulka `property_managers` existuje a funguje
- [x] Tabulka `property_documents` existuje a funguje
- [x] RLS policies jsou správně nastavené

### Bezpečnost

- [x] Citlivé data (TOTP secret, recovery codes) jsou šifrované
- [x] Kódy nejsou logovány v plain textu
- [x] Rate limiting pro přihlášení a 2FA funguje
- [x] Audit trail je kompletní

---

## Související dokumenty

- [permissions.md](./permissions.md) - Detailní popis oprávnění
- [datovy-model.md](./datovy-model.md) - Návrh databáze a migrace
- [checklist.md](./checklist.md) - Kontrolní seznam pro implementaci

---

**Poslední aktualizace:** 2025-11-10  
**Autor:** PatrikCechlovsky
