#!/usr/bin/env node
/**
 * Analyzuje strukturu aplikace a vytváří dokumentaci
 * - MD soubor se strukturou modulů, formulářů, seznamů, akcí a sloupců
 * - Excel soubor s listy pro jednotlivé moduly a analýzu polí
 */

const fs = require('fs');
const path = require('path');

// Helper to read JS module and extract data
function readJsModule(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf-8');
}

// Extract manifest from module.config.js
function extractManifest(moduleId) {
  const configPath = path.join(__dirname, 'src', 'modules', moduleId, 'module.config.js');
  const content = readJsModule(configPath);
  if (!content) return null;

  const manifest = {
    id: moduleId,
    title: '',
    icon: '',
    tiles: [],
    forms: []
  };

  // Extract title
  const titleMatch = content.match(/title:\s*['"]([^'"]+)['"]/);
  if (titleMatch) manifest.title = titleMatch[1];

  // Extract icon
  const iconMatch = content.match(/icon:\s*['"]([^'"]+)['"]/);
  if (iconMatch) manifest.icon = iconMatch[1];

  // Extract tiles
  const tilesMatch = content.match(/tiles:\s*\[([\s\S]*?)\]/);
  if (tilesMatch) {
    const tilesContent = tilesMatch[1];
    const tileMatches = tilesContent.matchAll(/\{\s*id:\s*['"]([^'"]+)['"],\s*title:\s*['"]([^'"]+)['"],\s*icon:\s*['"]([^'"]+)['"]/g);
    for (const match of tileMatches) {
      manifest.tiles.push({ id: match[1], title: match[2], icon: match[3] });
    }
  }

  // Extract forms
  const formsMatch = content.match(/forms:\s*\[([\s\S]*?)\]/);
  if (formsMatch) {
    const formsContent = formsMatch[1];
    const formMatches = formsContent.matchAll(/\{\s*id:\s*['"]([^'"]+)['"],\s*title:\s*['"]([^'"]+)['"],\s*icon:\s*['"]([^'"]+)['"]/g);
    for (const match of formMatches) {
      manifest.forms.push({ id: match[1], title: match[2], icon: match[3] });
    }
  }

  return manifest;
}

// Extract actions from tile/form file
function extractActions(filePath) {
  const content = readJsModule(filePath);
  if (!content) return [];

  const actions = new Set();

  // Look for moduleActions array
  const actionsMatch = content.match(/moduleActions:\s*\[([\s\S]*?)\]/);
  if (actionsMatch) {
    const actionsContent = actionsMatch[1];
    const actionMatches = actionsContent.matchAll(/['"]([^'"]+)['"]/g);
    for (const match of actionMatches) {
      actions.add(match[1]);
    }
  }

  // Look for common handler patterns
  const handlerPatterns = [
    /onAdd:/g, /onEdit:/g, /onDelete:/g, /onArchive:/g,
    /onAttach:/g, /onRefresh:/g, /onHistory:/g, /onDetail:/g,
    /onUnits:/g, /onSave:/g, /onInvite:/g
  ];

  for (const pattern of handlerPatterns) {
    if (pattern.test(content)) {
      const actionName = pattern.source.match(/on([A-Z][a-z]+)/)[1].toLowerCase();
      actions.add(actionName);
    }
  }

  return Array.from(actions);
}

// Extract columns from tile file
function extractColumns(filePath) {
  const content = readJsModule(filePath);
  if (!content) return [];

  const columns = [];

  // Look for columns array definition
  const columnsMatch = content.match(/const columns\s*=\s*\[([\s\S]*?)\n\s*\];/);
  if (columnsMatch) {
    const columnsContent = columnsMatch[1];
    
    // Split by commas at the top level (handling nested objects)
    let depth = 0;
    let current = '';
    const columnDefs = [];
    
    for (let i = 0; i < columnsContent.length; i++) {
      const char = columnsContent[i];
      if (char === '{') depth++;
      if (char === '}') depth--;
      
      current += char;
      
      if (char === ',' && depth === 0) {
        columnDefs.push(current.trim().slice(0, -1));
        current = '';
      }
    }
    if (current.trim()) {
      columnDefs.push(current.trim());
    }
    
    // Parse each column definition
    for (const colDef of columnDefs) {
      const keyMatch = colDef.match(/key:\s*['"]([^'"]+)['"]/);
      const labelMatch = colDef.match(/label:\s*['"]([^'"]+)['"]/);
      const widthMatch = colDef.match(/width:\s*['"]([^'"]+)['"]/);
      const sortableMatch = colDef.match(/sortable:\s*(true|false)/);
      
      if (keyMatch && labelMatch) {
        columns.push({ 
          key: keyMatch[1], 
          label: labelMatch[1],
          width: widthMatch ? widthMatch[1] : '',
          sortable: sortableMatch ? sortableMatch[1] === 'true' : false
        });
      }
    }
  }

  return columns;
}

// Extract fields from form file or schema
function extractFields(moduleId, formId) {
  const fields = [];

  // Try to find type-schemas.js or fields.js
  const schemasPath = path.join(__dirname, 'src', 'modules', moduleId, 'type-schemas.js');
  const fieldsPath = path.join(__dirname, 'src', 'modules', moduleId, 'forms', 'fields.js');

  let content = readJsModule(schemasPath) || readJsModule(fieldsPath);
  
  // If not found, try the lib/type-schemas
  if (!content) {
    const libSchemaPath = path.join(__dirname, 'src', 'lib', 'type-schemas', 'subjects.js');
    content = readJsModule(libSchemaPath);
  }

  if (!content) return fields;

  // For FIELDS constant (040-nemovitost)
  const fieldsMatch = content.match(/export const FIELDS\s*=\s*\[([\s\S]*?)\];/);
  if (fieldsMatch) {
    const fieldsContent = fieldsMatch[1];
    const fieldDefs = extractFieldDefinitions(fieldsContent);
    fields.push(...fieldDefs);
    return fields;
  }

  // For TYPE_SCHEMAS object (subjects)
  const schemasMatch = content.match(/export const TYPE_SCHEMAS\s*=\s*\{([\s\S]*?)\};/);
  if (schemasMatch) {
    const schemasContent = schemasMatch[1];
    // Extract all type definitions
    const typeMatches = schemasContent.matchAll(/(\w+):\s*\[([\s\S]*?)\]/g);
    const allFields = new Map();
    
    for (const typeMatch of typeMatches) {
      const fieldDefs = extractFieldDefinitions(typeMatch[2]);
      for (const field of fieldDefs) {
        // Use Map to avoid duplicates by key
        if (!allFields.has(field.key)) {
          allFields.set(field.key, field);
        }
      }
    }
    fields.push(...allFields.values());
  }

  return fields;
}

// Helper to extract field definitions from content
function extractFieldDefinitions(content) {
  const fields = [];
  const fieldMatches = content.matchAll(/\{\s*key:\s*['"]([^'"]+)['"],\s*label:\s*['"]([^'"]+)['"],\s*type:\s*['"]([^'"]+)['"]/g);
  for (const match of fieldMatches) {
    fields.push({ 
      key: match[1], 
      label: match[2], 
      type: match[3] 
    });
  }
  return fields;
}

// Main analysis function
function analyzeApplication() {
  const modulesDir = path.join(__dirname, 'src', 'modules');
  const modules = fs.readdirSync(modulesDir).filter(name => {
    return !name.startsWith('000-') && fs.statSync(path.join(modulesDir, name)).isDirectory();
  });

  const analysis = {
    modules: []
  };

  for (const moduleId of modules) {
    console.log(`Analyzing module: ${moduleId}`);
    const manifest = extractManifest(moduleId);
    if (!manifest) continue;

    const moduleData = {
      id: moduleId,
      title: manifest.title,
      icon: manifest.icon,
      tiles: [],
      forms: []
    };

    // Analyze tiles
    for (const tile of manifest.tiles) {
      const tilePath = path.join(modulesDir, moduleId, 'tiles', `${tile.id}.js`);
      const actions = extractActions(tilePath);
      const columns = extractColumns(tilePath);
      
      moduleData.tiles.push({
        id: tile.id,
        title: tile.title,
        icon: tile.icon,
        actions: actions,
        columns: columns
      });
    }

    // Analyze forms
    for (const form of manifest.forms) {
      const formPath = path.join(modulesDir, moduleId, 'forms', `${form.id}.js`);
      const actions = extractActions(formPath);
      const fields = extractFields(moduleId, form.id);
      
      moduleData.forms.push({
        id: form.id,
        title: form.title,
        icon: form.icon,
        actions: actions,
        fields: fields
      });
    }

    analysis.modules.push(moduleData);
  }

  return analysis;
}

// Generate Markdown documentation
function generateMarkdown(analysis) {
  let md = '# Struktura aplikace - Analýza modulů\n\n';
  md += `Datum vytvoření: ${new Date().toLocaleString('cs-CZ')}\n\n`;
  md += '## Obsah\n\n';
  
  for (const module of analysis.modules) {
    md += `- [${module.title} (${module.id})](#${module.id.replace(/\//g, '').replace(/-/g, '')})\n`;
  }
  md += '\n---\n\n';

  for (const module of analysis.modules) {
    md += `## ${module.title} (${module.id})\n\n`;
    md += `**Ikona modulu:** \`${module.icon}\`\n\n`;

    if (module.tiles.length > 0) {
      md += '### Přehledy (Tiles)\n\n';
      for (const tile of module.tiles) {
        md += `#### ${tile.title} (\`${tile.id}\`)\n`;
        md += `- **Ikona:** \`${tile.icon}\`\n`;
        
        if (tile.actions.length > 0) {
          md += `- **Akce:** ${tile.actions.join(', ')}\n`;
        }
        
        if (tile.columns.length > 0) {
          md += '- **Sloupce:**\n\n';
          md += '| Klíč | Název | Šířka | Řazení |\n';
          md += '|------|-------|-------|--------|\n';
          for (const col of tile.columns) {
            md += `| \`${col.key}\` | ${col.label} | ${col.width || '-'} | ${col.sortable ? 'Ano' : 'Ne'} |\n`;
          }
        }
        md += '\n';
      }
    }

    if (module.forms.length > 0) {
      md += '### Formuláře (Forms)\n\n';
      for (const form of module.forms) {
        md += `#### ${form.title} (\`${form.id}\`)\n`;
        md += `- **Ikona:** \`${form.icon}\`\n`;
        
        if (form.actions.length > 0) {
          md += `- **Akce:** ${form.actions.join(', ')}\n`;
        }
        
        if (form.fields.length > 0) {
          md += '- **Pole:**\n\n';
          md += '| Klíč | Název | Typ |\n';
          md += '|------|-------|-----|\n';
          for (const field of form.fields) {
            md += `| \`${field.key}\` | ${field.label} | \`${field.type}\` |\n`;
          }
        }
        md += '\n';
      }
    }

    md += '---\n\n';
  }

  // Add field usage analysis
  md += '## Analýza použití polí\n\n';
  md += 'Seznam všech polí použitých v aplikaci a jejich výskyt v jednotlivých modulech.\n\n';
  
  const fieldUsage = analyzeFieldUsage(analysis);
  const sortedFields = Object.entries(fieldUsage).sort((a, b) => b[1].count - a[1].count);
  
  for (const [fieldKey, usage] of sortedFields) {
    md += `### \`${fieldKey}\`\n`;
    md += `**Počet použití:** ${usage.count}\n\n`;
    md += '**Umístění:**\n';
    for (const location of usage.locations) {
      md += `- ${location}\n`;
    }
    md += '\n';
  }

  return md;
}

// Analyze field usage across modules
function analyzeFieldUsage(analysis) {
  const fieldUsage = {};

  for (const module of analysis.modules) {
    // Check tiles
    for (const tile of module.tiles) {
      for (const column of tile.columns) {
        if (!fieldUsage[column.key]) {
          fieldUsage[column.key] = { count: 0, locations: [] };
        }
        fieldUsage[column.key].count++;
        fieldUsage[column.key].locations.push(
          `${module.title} - Přehled: ${tile.title}`
        );
      }
    }

    // Check forms
    for (const form of module.forms) {
      for (const field of form.fields) {
        if (!fieldUsage[field.key]) {
          fieldUsage[field.key] = { count: 0, locations: [] };
        }
        fieldUsage[field.key].count++;
        fieldUsage[field.key].locations.push(
          `${module.title} - Formulář: ${form.title}`
        );
      }
    }
  }

  return fieldUsage;
}

// Main execution
console.log('Starting application analysis...');
const analysis = analyzeApplication();

// Generate markdown
const markdown = generateMarkdown(analysis);
fs.writeFileSync('struktura-aplikace.md', markdown, 'utf-8');
console.log('✅ Created: struktura-aplikace.md');

// Save JSON for Excel processing
fs.writeFileSync('struktura-aplikace.json', JSON.stringify(analysis, null, 2), 'utf-8');
console.log('✅ Created: struktura-aplikace.json');

console.log('\nAnalysis complete!');
console.log(`Analyzed ${analysis.modules.length} modules`);
