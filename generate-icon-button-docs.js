#!/usr/bin/env node
/**
 * Generuje dokumentaci a Excel soubor se všemi ikonami a tlačítky z aplikace
 * - icon_button.md - přehled v markdown formátu
 * - icon_button.xlsx - Excel s dvěma listy: ikony/tlačítka z databáze + dostupné ikony pro výběr
 * 
 * Poznámka: Tento skript používá jednoduché regex parsování, které předpokládá
 * konzistentní formátování zdrojových souborů. Pro změny formátu je třeba
 * upravit regex výrazy.
 */

// Check for required dependencies
try {
  require('exceljs');
} catch (err) {
  console.error('❌ Chybí závislost "exceljs". Spusťte: npm install');
  process.exit(1);
}

const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// Načtení ICONS z src/ui/icons.js
let iconsContent;
try {
  iconsContent = fs.readFileSync(path.join(__dirname, 'src/ui/icons.js'), 'utf-8');
} catch (err) {
  console.error('❌ Nepodařilo se načíst soubor src/ui/icons.js:', err.message);
  process.exit(1);
}

// Extrakce ICONS objektu pomocí regulárního výrazu
const iconsMatch = iconsContent.match(/export const ICONS = \{([\s\S]*?)\};/);
if (!iconsMatch) {
  console.error('❌ Nepodařilo se najít ICONS objekt v src/ui/icons.js');
  process.exit(1);
}

// Parsování ikon (jednoduchý parser pro formát "key": "emoji")
const iconsText = iconsMatch[1];
const iconLines = iconsText.split('\n');
const icons = {};
const iconCategories = {};
let currentCategory = 'Ostatní';

iconLines.forEach(line => {
  // Kategorie komentáře
  const categoryMatch = line.match(/\/\/ (.+)/);
  if (categoryMatch) {
    currentCategory = categoryMatch[1].trim();
    return;
  }
  
  // Ikona: "key": "emoji"
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

// Načtení akcí/tlačítek z src/ui/commonActions.js
let commonActionsContent;
try {
  commonActionsContent = fs.readFileSync(path.join(__dirname, 'src/ui/commonActions.js'), 'utf-8');
} catch (err) {
  console.error('❌ Nepodařilo se načíst soubor src/ui/commonActions.js:', err.message);
  process.exit(1);
}
const catalogMatch = commonActionsContent.match(/const CATALOG = \{([\s\S]*?)\};/);

const buttons = [];
if (catalogMatch) {
  const catalogText = catalogMatch[1];
  const buttonLines = catalogText.split('\n');
  
  buttonLines.forEach(line => {
    // Formát: detail:  { key: 'detail',  icon: 'detail',     label: 'Detail',    title: 'Zobrazit detail' }
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

// Načtení akcí z src/ui/actionButtons.js
let actionButtonsContent;
try {
  actionButtonsContent = fs.readFileSync(path.join(__dirname, 'src/ui/actionButtons.js'), 'utf-8');
} catch (err) {
  console.error('❌ Nepodařilo se načíst soubor src/ui/actionButtons.js:', err.message);
  process.exit(1);
}
const actionsMatch = actionButtonsContent.match(/export const ACTIONS = \{([\s\S]*?)\};/);

const additionalButtons = [];
if (actionsMatch) {
  const actionsText = actionsMatch[1];
  const actionLines = actionsText.split('\n');
  
  actionLines.forEach(line => {
    // Formát: add:     ({ onClick, disabled=false, reason='' }={}) => ({ key:'add',     label:'Přidat',     icon:'add',     onClick, disabled, reason })
    const actionMatch = line.match(/(\w+):\s*.*key:'([^']+)',\s*label:'([^']+)',\s*icon:'([^']+)'/);
    if (actionMatch) {
      const key = actionMatch[2];
      const label = actionMatch[3];
      const iconKey = actionMatch[4];
      
      // Přidej pouze pokud ještě není v buttons
      if (!buttons.find(b => b.key === key)) {
        additionalButtons.push({
          key,
          icon: iconKey,
          label,
          title: label
        });
      }
    }
  });
}

// Spojení všech tlačítek
const allButtons = [...buttons, ...additionalButtons];

console.log(`📊 Nalezeno ${Object.keys(icons).length} ikon`);
console.log(`🔘 Nalezeno ${allButtons.length} tlačítek/akcí`);
console.log(`📁 Kategorie ikon: ${Object.keys(iconCategories).length}`);

// ============================================================================
// GENEROVÁNÍ MARKDOWN SOUBORU
// ============================================================================

let markdown = `# Ikony a Tlačítka v Aplikaci

Tento dokument obsahuje přehled všech ikon a tlačítek použitých v aplikaci.

## 📊 Statistiky

- **Celkem ikon:** ${Object.keys(icons).length}
- **Celkem tlačítek/akcí:** ${allButtons.length}
- **Kategorií ikon:** ${Object.keys(iconCategories).length}

---

## 🔘 Tlačítka a Akce

Všechna dostupná tlačítka a akce v aplikaci:

| Klíč | Ikona | Název | Popis |
|------|-------|-------|-------|
`;

allButtons.forEach(button => {
  const iconData = icons[button.icon];
  const emoji = iconData ? iconData.emoji : '❓';
  markdown += `| \`${button.key}\` | ${emoji} | ${button.label} | ${button.title} |\n`;
});

markdown += `\n---\n\n## 🎨 Ikony podle Kategorií\n\n`;

// Přehled ikon podle kategorií
Object.keys(iconCategories).sort().forEach(category => {
  markdown += `### ${category}\n\n`;
  markdown += `| Klíč | Ikona | Klíč | Ikona | Klíč | Ikona |\n`;
  markdown += `|------|-------|------|-------|------|-------|\n`;
  
  const categoryIcons = iconCategories[category];
  for (let i = 0; i < categoryIcons.length; i += 3) {
    const icon1 = categoryIcons[i];
    const icon2 = categoryIcons[i + 1];
    const icon3 = categoryIcons[i + 2];
    
    markdown += `| \`${icon1.key}\` | ${icon1.emoji} `;
    markdown += icon2 ? `| \`${icon2.key}\` | ${icon2.emoji} ` : `| | `;
    markdown += icon3 ? `| \`${icon3.key}\` | ${icon3.emoji} ` : `| | `;
    markdown += `|\n`;
  }
  
  markdown += `\n`;
});

markdown += `---\n\n## 📋 Všechny Ikony (abecedně)\n\n`;
markdown += `| Klíč | Ikona | Kategorie |\n`;
markdown += `|------|-------|----------|\n`;

Object.keys(icons).sort().forEach(key => {
  const icon = icons[key];
  markdown += `| \`${key}\` | ${icon.emoji} | ${icon.category} |\n`;
});

markdown += `\n---\n\n## 💡 Použití\n\n`;
markdown += `### V kódu JavaScript:\n\n`;
markdown += `\`\`\`javascript\n`;
markdown += `import { icon } from './src/ui/icons.js';\n\n`;
markdown += `// Použití ikony\n`;
markdown += `element.innerHTML = icon('check_circle');\n`;
markdown += `\`\`\`\n\n`;

markdown += `### V tlačítkách:\n\n`;
markdown += `\`\`\`javascript\n`;
markdown += `import { ACTIONS } from './src/ui/actionButtons.js';\n\n`;
markdown += `// Vytvoření tlačítka pro přidání\n`;
markdown += `const addButton = ACTIONS.add({\n`;
markdown += `  onClick: () => console.log('Přidat kliknuto'),\n`;
markdown += `  disabled: false\n`;
markdown += `});\n`;
markdown += `\`\`\`\n`;

// Uložení markdown souboru
fs.writeFileSync('icon_button.md', markdown, 'utf-8');
console.log('✅ Vytvořeno: icon_button.md');

// ============================================================================
// GENEROVÁNÍ EXCEL SOUBORU
// ============================================================================

async function generateExcel() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Aplikace v5 - Icon & Button Analyzer';
  workbook.created = new Date();

  // ========================================================================
  // SHEET 1: Tlačítka a Ikony z Databáze
  // ========================================================================
  const sheet1 = workbook.addWorksheet('Tlačítka a Ikony z DB');
  
  // Hlavička
  sheet1.mergeCells('A1:E1');
  const header1 = sheet1.getCell('A1');
  header1.value = 'TLAČÍTKA A IKONY V APLIKACI';
  header1.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  header1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
  header1.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet1.getRow(1).height = 30;

  // Statistiky
  sheet1.getCell('A3').value = 'Celkem tlačítek/akcí:';
  sheet1.getCell('B3').value = allButtons.length;
  sheet1.getCell('A3').font = { bold: true };
  
  sheet1.getCell('A4').value = 'Celkem ikon:';
  sheet1.getCell('B4').value = Object.keys(icons).length;
  sheet1.getCell('A4').font = { bold: true };

  sheet1.getCell('A5').value = 'Kategorií ikon:';
  sheet1.getCell('B5').value = Object.keys(iconCategories).length;
  sheet1.getCell('A5').font = { bold: true };

  // Tlačítka sekce
  let currentRow = 7;
  sheet1.mergeCells(`A${currentRow}:E${currentRow}`);
  const buttonsHeader = sheet1.getCell(`A${currentRow}`);
  buttonsHeader.value = 'TLAČÍTKA A AKCE';
  buttonsHeader.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  buttonsHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } };
  buttonsHeader.alignment = { horizontal: 'left', vertical: 'middle' };
  sheet1.getRow(currentRow).height = 25;
  currentRow++;

  // Hlavička tabulky tlačítek
  sheet1.getCell(`A${currentRow}`).value = 'Klíč';
  sheet1.getCell(`B${currentRow}`).value = 'Ikona';
  sheet1.getCell(`C${currentRow}`).value = 'Emoji';
  sheet1.getCell(`D${currentRow}`).value = 'Název';
  sheet1.getCell(`E${currentRow}`).value = 'Popis';
  sheet1.getRow(currentRow).font = { bold: true };
  sheet1.getRow(currentRow).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
  currentRow++;

  // Data tlačítek
  allButtons.forEach(button => {
    const iconData = icons[button.icon];
    sheet1.getCell(`A${currentRow}`).value = button.key;
    sheet1.getCell(`B${currentRow}`).value = button.icon;
    sheet1.getCell(`C${currentRow}`).value = iconData ? iconData.emoji : '❓';
    sheet1.getCell(`D${currentRow}`).value = button.label;
    sheet1.getCell(`E${currentRow}`).value = button.title;
    currentRow++;
  });

  currentRow += 2;

  // Ikony podle kategorií
  sheet1.mergeCells(`A${currentRow}:E${currentRow}`);
  const iconsHeader = sheet1.getCell(`A${currentRow}`);
  iconsHeader.value = 'IKONY PODLE KATEGORIÍ';
  iconsHeader.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  iconsHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } };
  iconsHeader.alignment = { horizontal: 'left', vertical: 'middle' };
  sheet1.getRow(currentRow).height = 25;
  currentRow++;

  Object.keys(iconCategories).sort().forEach(category => {
    // Kategorie hlavička
    sheet1.mergeCells(`A${currentRow}:E${currentRow}`);
    const catHeader = sheet1.getCell(`A${currentRow}`);
    catHeader.value = category;
    catHeader.font = { size: 12, bold: true };
    catHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
    currentRow++;

    // Hlavička tabulky
    sheet1.getCell(`A${currentRow}`).value = 'Klíč';
    sheet1.getCell(`B${currentRow}`).value = 'Ikona';
    sheet1.getRow(currentRow).font = { bold: true, size: 10 };
    sheet1.getRow(currentRow).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
    currentRow++;

    // Ikony v kategorii
    iconCategories[category].forEach(iconItem => {
      sheet1.getCell(`A${currentRow}`).value = iconItem.key;
      sheet1.getCell(`B${currentRow}`).value = iconItem.emoji;
      currentRow++;
    });

    currentRow++; // Mezera mezi kategoriemi
  });

  // Nastavení šířek sloupců
  sheet1.getColumn('A').width = 25;
  sheet1.getColumn('B').width = 20;
  sheet1.getColumn('C').width = 10;
  sheet1.getColumn('D').width = 20;
  sheet1.getColumn('E').width = 35;

  // ========================================================================
  // SHEET 2: Další dostupné ikony pro výběr
  // ========================================================================
  const sheet2 = workbook.addWorksheet('Dostupné Ikony pro Výběr');

  // Hlavička
  sheet2.mergeCells('A1:D1');
  const header2 = sheet2.getCell('A1');
  header2.value = 'DALŠÍ DOSTUPNÉ IKONY PRO VÝBĚR V APLIKACI';
  header2.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  header2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
  header2.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet2.getRow(1).height = 30;

  // Popis
  sheet2.mergeCells('A3:D3');
  const desc = sheet2.getCell('A3');
  desc.value = 'Všechny ikony dostupné v systému, které lze použít pro tlačítka, moduly a další UI prvky.';
  desc.alignment = { wrapText: true };
  sheet2.getRow(3).height = 30;

  // Celkový počet
  sheet2.getCell('A5').value = 'Celkem dostupných ikon:';
  sheet2.getCell('B5').value = Object.keys(icons).length;
  sheet2.getCell('A5').font = { bold: true };

  // Hlavička tabulky
  let row2 = 7;
  sheet2.getCell(`A${row2}`).value = 'Klíč ikony';
  sheet2.getCell(`B${row2}`).value = 'Emoji';
  sheet2.getCell(`C${row2}`).value = 'Kategorie';
  sheet2.getCell(`D${row2}`).value = 'Použití v kódu';
  sheet2.getRow(row2).font = { bold: true };
  sheet2.getRow(row2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
  row2++;

  // Všechny ikony abecedně
  Object.keys(icons).sort().forEach(key => {
    const icon = icons[key];
    sheet2.getCell(`A${row2}`).value = key;
    sheet2.getCell(`B${row2}`).value = icon.emoji;
    sheet2.getCell(`C${row2}`).value = icon.category;
    sheet2.getCell(`D${row2}`).value = `icon('${key}')`;
    row2++;
  });

  // Nastavení šířek sloupců
  sheet2.getColumn('A').width = 25;
  sheet2.getColumn('B').width = 10;
  sheet2.getColumn('C').width = 25;
  sheet2.getColumn('D').width = 20;

  // Uložení Excel souboru
  await workbook.xlsx.writeFile('icon_button.xlsx');
  console.log('✅ Vytvořeno: icon_button.xlsx');
}

// Spuštění generování Excel
generateExcel().catch(err => {
  console.error('❌ Chyba při generování Excel:', err);
  process.exit(1);
});
