#!/usr/bin/env node
/**
 * Kompletní generátor dokumentace ikon a tlačítek
 * - Prochází VŠECHNY soubory v repositáři
 * - Generuje icon_button.md a icon_button.xlsx
 */

const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// Load icons from src/ui/icons.js
const iconsContent = fs.readFileSync(path.join(__dirname, 'src/ui/icons.js'), 'utf-8');
const iconsMatch = iconsContent.match(/export const ICONS = \{([\s\S]*?)\};/);
if (!iconsMatch) {
  console.error('❌ Cannot find ICONS object');
  process.exit(1);
}

const iconsText = iconsMatch[1];
const iconLines = iconsText.split('\n');
const icons = {};
const iconCategories = {};
let currentCategory = 'Ostatní';

iconLines.forEach(line => {
  const categoryMatch = line.match(/\/\/ (.+)/);
  if (categoryMatch) {
    currentCategory = categoryMatch[1].trim();
    return;
  }
  
  const iconMatch = line.match(/"([^"]+)":\s*"([^"]+)"/);
  if (iconMatch) {
    const key = iconMatch[1];
    const emoji = iconMatch[2];
    icons[key] = { emoji, category: currentCategory };
    
    if (!iconCategories[currentCategory]) {
      iconCategories[currentCategory] = [];
    }
    iconCategories[currentCategory].push({ key, emoji });
  }
});

console.log(`📊 Loaded ${Object.keys(icons).length} icons`);

// Load buttons
const commonActionsContent = fs.readFileSync(path.join(__dirname, 'src/ui/commonActions.js'), 'utf-8');
const catalogMatch = commonActionsContent.match(/const CATALOG = \{([\s\S]*?)\};/);
const buttons = [];

if (catalogMatch) {
  const catalogText = catalogMatch[1];
  const buttonLines = catalogText.split('\n');
  
  buttonLines.forEach(line => {
    const buttonMatch = line.match(/(\w+):\s*\{\s*key:\s*'([^']+)',\s*icon:\s*'([^']+)',\s*label:\s*'([^']+)',\s*title:\s*'([^']+)'/);
    if (buttonMatch) {
      buttons.push({
        key: buttonMatch[2],
        icon: buttonMatch[3],
        label: buttonMatch[4],
        title: buttonMatch[5]
      });
    }
  });
}

console.log(`🔘 Loaded ${buttons.length} buttons`);

// Scan all files for icon usage
function scanDirectory(dir, results = new Set()) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (file === 'node_modules' || file === '.git' || file === 'archive') return;
    
    if (stat.isDirectory()) {
      scanDirectory(filePath, results);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        const iconPattern1 = /icon:\s*['"]([^'"]+)['"]/g;
        let match;
        while ((match = iconPattern1.exec(content)) !== null) {
          results.add(match[1]);
        }
        
        const iconPattern2 = /icon\(['"]([^'"]+)['"]\)/g;
        while ((match = iconPattern2.exec(content)) !== null) {
          results.add(match[1]);
        }
      } catch (err) {
        // Ignore errors
      }
    }
  });
  
  return results;
}

console.log('🔍 Scanning repository...');
const usedIcons = scanDirectory(path.join(__dirname, 'src'));
console.log(`✅ Found ${usedIcons.size} icons used in code`);

// Icon translations with Czech/English names and aliases
const iconTranslations = {
  'home': { cz: 'Domů', en: 'Home', aliases_cz: ['domovská stránka'], aliases_en: ['house'] },
  'dashboard': { cz: 'Nástěnka', en: 'Dashboard', aliases_cz: ['přehled'], aliases_en: ['overview'] },
  'users': { cz: 'Uživatelé', en: 'Users', aliases_cz: ['lidé'], aliases_en: ['people'] },
  'user': { cz: 'Uživatel', en: 'User', aliases_cz: ['osoba'], aliases_en: ['person'] },
  'settings': { cz: 'Nastavení', en: 'Settings', aliases_cz: ['konfigurace'], aliases_en: ['config'] },
  'add': { cz: 'Přidat', en: 'Add', aliases_cz: ['nový'], aliases_en: ['new', 'plus'] },
  'edit': { cz: 'Upravit', en: 'Edit', aliases_cz: ['změnit'], aliases_en: ['modify'] },
  'delete': { cz: 'Smazat', en: 'Delete', aliases_cz: ['odstranit'], aliases_en: ['remove'] },
  'detail': { cz: 'Detail', en: 'Detail', aliases_cz: ['zobrazit'], aliases_en: ['view'] },
  'save': { cz: 'Uložit', en: 'Save', aliases_cz: ['potvrdit'], aliases_en: ['confirm'] },
  'archive': { cz: 'Archivovat', en: 'Archive', aliases_cz: ['uložit'], aliases_en: ['store'] },
  'refresh': { cz: 'Obnovit', en: 'Refresh', aliases_cz: ['reload'], aliases_en: ['reload'] },
  'search': { cz: 'Hledat', en: 'Search', aliases_cz: ['vyhledávání'], aliases_en: ['find'] },
  'building': { cz: 'Budova', en: 'Building', aliases_cz: ['objekt'], aliases_en: ['structure'] },
  'calendar': { cz: 'Kalendář', en: 'Calendar', aliases_cz: ['datum'], aliases_en: ['date'] },
  'mail': { cz: 'Pošta', en: 'Mail', aliases_cz: ['e-mail'], aliases_en: ['email'] },
  'star': { cz: 'Hvězdička', en: 'Star', aliases_cz: ['oblíbené'], aliases_en: ['favorite'] },
  'map': { cz: 'Mapa', en: 'Map', aliases_cz: ['plán'], aliases_en: ['plan'] },
  'car': { cz: 'Auto', en: 'Car', aliases_cz: ['vozidlo'], aliases_en: ['vehicle'] },
  'warehouse': { cz: 'Sklad', en: 'Warehouse', aliases_cz: ['skladiště'], aliases_en: ['storage'] },
  'apartment': { cz: 'Byt', en: 'Apartment', aliases_cz: ['bytová jednotka'], aliases_en: ['flat'] },
  'office': { cz: 'Kancelář', en: 'Office', aliases_cz: ['pracoviště'], aliases_en: ['workplace'] },
  'export': { cz: 'Exportovat', en: 'Export', aliases_cz: ['stáhnout'], aliases_en: ['download'] },
  'import': { cz: 'Importovat', en: 'Import', aliases_cz: ['nahrát'], aliases_en: ['upload'] },
  'print': { cz: 'Tisk', en: 'Print', aliases_cz: ['vytisknout'], aliases_en: ['printer'] },
  'history': { cz: 'Historie', en: 'History', aliases_cz: ['záznamy'], aliases_en: ['log'] },
  'grid': { cz: 'Mřížka', en: 'Grid', aliases_cz: ['tabulka'], aliases_en: ['table'] },
  'form': { cz: 'Formulář', en: 'Form', aliases_cz: ['vstup'], aliases_en: ['input'] },
};

// Add defaults for icons without translation
Object.keys(icons).forEach(key => {
  if (!iconTranslations[key]) {
    iconTranslations[key] = {
      cz: key,
      en: key,
      aliases_cz: [],
      aliases_en: []
    };
  }
});

// Generate markdown
let markdown = `# Ikony a Tlačítka v Aplikaci

## 📊 Statistiky

- **Celkem ikon v systému:** ${Object.keys(icons).length}
- **Celkem použitých ikon:** ${usedIcons.size}
- **Celkem tlačítek:** ${buttons.length}
- **Kategorií:** ${Object.keys(iconCategories).length}

---

## 🔘 Tlačítka

| Klíč | Ikona | Název CZ | Název EN | Popis |
|------|-------|----------|----------|-------|
`;

buttons.forEach(button => {
  const iconData = icons[button.icon];
  const emoji = iconData ? iconData.emoji : '❓';
  const trans = iconTranslations[button.icon] || { en: button.label };
  markdown += `| \`${button.key}\` | ${emoji} | ${button.label} | ${trans.en} | ${button.title} |\n`;
});

markdown += `\n---\n\n## 🎨 Použité ikony\n\n`;
markdown += `| Klíč | Ikona | Název CZ | Název EN | Kategorie |\n`;
markdown += `|------|-------|----------|----------|----------|\n`;

Array.from(usedIcons).sort().forEach(key => {
  const icon = icons[key];
  const trans = iconTranslations[key] || { cz: key, en: key };
  if (icon) {
    markdown += `| \`${key}\` | ${icon.emoji} | ${trans.cz} | ${trans.en} | ${icon.category} |\n`;
  }
});

markdown += `\n---\n\n## 📚 Všechny dostupné ikony\n\n`;

Object.keys(iconCategories).sort().forEach(category => {
  markdown += `### ${category}\n\n`;
  markdown += `| Ikona | Klíč | Název CZ | Název EN | Aliasy CZ | Aliasy EN |\n`;
  markdown += `|-------|------|----------|----------|-----------|----------|\n`;
  
  iconCategories[category].forEach(iconItem => {
    const trans = iconTranslations[iconItem.key] || { cz: iconItem.key, en: iconItem.key, aliases_cz: [], aliases_en: [] };
    markdown += `| ${iconItem.emoji} | \`${iconItem.key}\` | ${trans.cz} | ${trans.en} | ${trans.aliases_cz.join(', ')} | ${trans.aliases_en.join(', ')} |\n`;
  });
  
  markdown += `\n`;
});

fs.writeFileSync('icon_button.md', markdown, 'utf-8');
console.log('✅ Created: icon_button.md');

// Generate Excel
async function generateExcel() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Aplikace v5 - Icon & Button Analyzer';
  workbook.created = new Date();

  // Sheet 1: Used icons and buttons
  const sheet1 = workbook.addWorksheet('Použité v aplikaci');
  
  sheet1.mergeCells('A1:G1');
  const header1 = sheet1.getCell('A1');
  header1.value = 'IKONY A TLAČÍTKA V APLIKACI';
  header1.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  header1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
  header1.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet1.getRow(1).height = 30;

  let row = 3;
  sheet1.getCell(`A${row}`).value = 'Statistiky';
  sheet1.getCell(`A${row}`).font = { bold: true, size: 12 };
  row++;
  sheet1.getCell(`A${row}`).value = 'Celkem tlačítek:';
  sheet1.getCell(`B${row}`).value = buttons.length;
  row++;
  sheet1.getCell(`A${row}`).value = 'Celkem použitých ikon:';
  sheet1.getCell(`B${row}`).value = usedIcons.size;
  row += 2;

  // Buttons
  sheet1.mergeCells(`A${row}:G${row}`);
  sheet1.getCell(`A${row}`).value = 'TLAČÍTKA';
  sheet1.getCell(`A${row}`).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet1.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } };
  row++;

  sheet1.getCell(`A${row}`).value = 'Klíč';
  sheet1.getCell(`B${row}`).value = 'Ikona';
  sheet1.getCell(`C${row}`).value = 'Emoji';
  sheet1.getCell(`D${row}`).value = 'Název CZ';
  sheet1.getCell(`E${row}`).value = 'Název EN';
  sheet1.getCell(`F${row}`).value = 'Popis';
  sheet1.getCell(`G${row}`).value = 'Kategorie';
  sheet1.getRow(row).font = { bold: true };
  sheet1.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
  row++;

  buttons.forEach(button => {
    const iconData = icons[button.icon];
    const trans = iconTranslations[button.icon] || { cz: button.label, en: button.label };
    sheet1.getCell(`A${row}`).value = button.key;
    sheet1.getCell(`B${row}`).value = button.icon;
    sheet1.getCell(`C${row}`).value = iconData ? iconData.emoji : '❓';
    sheet1.getCell(`D${row}`).value = button.label;
    sheet1.getCell(`E${row}`).value = trans.en;
    sheet1.getCell(`F${row}`).value = button.title;
    sheet1.getCell(`G${row}`).value = iconData ? iconData.category : '';
    row++;
  });

  row += 2;

  // Used icons
  sheet1.mergeCells(`A${row}:G${row}`);
  sheet1.getCell(`A${row}`).value = 'POUŽITÉ IKONY';
  sheet1.getCell(`A${row}`).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet1.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } };
  row++;

  sheet1.getCell(`A${row}`).value = 'Ikona';
  sheet1.getCell(`B${row}`).value = 'Klíč';
  sheet1.getCell(`C${row}`).value = 'Název CZ';
  sheet1.getCell(`D${row}`).value = 'Název EN';
  sheet1.getCell(`E${row}`).value = 'Aliasy CZ';
  sheet1.getCell(`F${row}`).value = 'Aliasy EN';
  sheet1.getCell(`G${row}`).value = 'Kategorie';
  sheet1.getRow(row).font = { bold: true };
  sheet1.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
  row++;

  Array.from(usedIcons).sort().forEach(key => {
    const icon = icons[key];
    const trans = iconTranslations[key] || { cz: key, en: key, aliases_cz: [], aliases_en: [] };
    sheet1.getCell(`A${row}`).value = icon ? icon.emoji : '❓';
    sheet1.getCell(`B${row}`).value = key;
    sheet1.getCell(`C${row}`).value = trans.cz;
    sheet1.getCell(`D${row}`).value = trans.en;
    sheet1.getCell(`E${row}`).value = trans.aliases_cz.join(', ');
    sheet1.getCell(`F${row}`).value = trans.aliases_en.join(', ');
    sheet1.getCell(`G${row}`).value = icon ? icon.category : '';
    row++;
  });

  sheet1.getColumn('A').width = 12;
  sheet1.getColumn('B').width = 22;
  sheet1.getColumn('C').width = 22;
  sheet1.getColumn('D').width = 22;
  sheet1.getColumn('E').width = 30;
  sheet1.getColumn('F').width = 30;
  sheet1.getColumn('G').width = 25;

  // Sheet 2: All available icons
  const sheet2 = workbook.addWorksheet('Dostupné ikony pro výběr');

  sheet2.mergeCells('A1:F1');
  const header2 = sheet2.getCell('A1');
  header2.value = 'VŠECHNY DOSTUPNÉ IKONY PRO VÝBĚR';
  header2.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  header2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
  header2.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet2.getRow(1).height = 30;

  let row2 = 3;
  sheet2.mergeCells(`A${row2}:F${row2}`);
  sheet2.getCell(`A${row2}`).value = 'Kompletní přehled všech ikon s českými a anglickými názvy a aliasy.';
  sheet2.getCell(`A${row2}`).alignment = { wrapText: true };
  row2 += 2;

  sheet2.getCell(`A${row2}`).value = 'Celkem ikon:';
  sheet2.getCell(`B${row2}`).value = Object.keys(icons).length;
  sheet2.getCell(`A${row2}`).font = { bold: true };
  row2 += 2;

  sheet2.getCell(`A${row2}`).value = 'Ikona';
  sheet2.getCell(`B${row2}`).value = 'Klíč';
  sheet2.getCell(`C${row2}`).value = 'Název CZ';
  sheet2.getCell(`D${row2}`).value = 'Název EN';
  sheet2.getCell(`E${row2}`).value = 'Aliasy CZ';
  sheet2.getCell(`F${row2}`).value = 'Aliasy EN';
  sheet2.getRow(row2).font = { bold: true };
  sheet2.getRow(row2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
  row2++;

  Object.keys(iconCategories).sort().forEach(category => {
    // Category header
    sheet2.mergeCells(`A${row2}:F${row2}`);
    sheet2.getCell(`A${row2}`).value = category;
    sheet2.getCell(`A${row2}`).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet2.getCell(`A${row2}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4B5563' } };
    row2++;

    iconCategories[category].forEach(iconItem => {
      const trans = iconTranslations[iconItem.key] || { cz: iconItem.key, en: iconItem.key, aliases_cz: [], aliases_en: [] };
      sheet2.getCell(`A${row2}`).value = iconItem.emoji;
      sheet2.getCell(`B${row2}`).value = iconItem.key;
      sheet2.getCell(`C${row2}`).value = trans.cz;
      sheet2.getCell(`D${row2}`).value = trans.en;
      sheet2.getCell(`E${row2}`).value = trans.aliases_cz.join(', ');
      sheet2.getCell(`F${row2}`).value = trans.aliases_en.join(', ');
      row2++;
    });

    row2++;
  });

  sheet2.getColumn('A').width = 10;
  sheet2.getColumn('B').width = 25;
  sheet2.getColumn('C').width = 25;
  sheet2.getColumn('D').width = 25;
  sheet2.getColumn('E').width = 30;
  sheet2.getColumn('F').width = 30;

  await workbook.xlsx.writeFile('icon_button.xlsx');
  console.log('✅ Created: icon_button.xlsx');
}

generateExcel().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
