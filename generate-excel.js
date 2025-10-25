#!/usr/bin/env node
/**
 * Generuje Excel soubor ze struktury aplikace
 * - Jeden list pro každý modul s přehledy a formuláři
 * - Jeden list "Analýza polí" se všemi poli a jejich výskyty
 */

const ExcelJS = require('exceljs');
const fs = require('fs');

// Load the JSON analysis
const analysis = JSON.parse(fs.readFileSync('struktura-aplikace.json', 'utf-8'));

async function generateExcel() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Aplikace v5 Analyzer';
  workbook.created = new Date();

  // Create a sheet for each module
  for (const module of analysis.modules) {
    const sheet = workbook.addWorksheet(module.title.substring(0, 30)); // Excel limit
    
    // Module header
    sheet.mergeCells('A1:F1');
    const headerCell = sheet.getCell('A1');
    headerCell.value = `${module.title} (${module.id})`;
    headerCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    headerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
    headerCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 30;

    // Module icon
    sheet.getCell('A2').value = 'Ikona modulu:';
    sheet.getCell('B2').value = module.icon;
    sheet.getCell('A2').font = { bold: true };
    sheet.getRow(2).height = 20;

    let currentRow = 4;

    // Tiles section
    if (module.tiles.length > 0) {
      sheet.mergeCells(`A${currentRow}:F${currentRow}`);
      const tilesHeader = sheet.getCell(`A${currentRow}`);
      tilesHeader.value = 'PŘEHLEDY (TILES)';
      tilesHeader.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
      tilesHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } };
      tilesHeader.alignment = { horizontal: 'left', vertical: 'middle' };
      sheet.getRow(currentRow).height = 25;
      currentRow++;

      for (const tile of module.tiles) {
        // Tile name and icon
        sheet.getCell(`A${currentRow}`).value = `Přehled: ${tile.title}`;
        sheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
        sheet.getCell(`B${currentRow}`).value = `Ikona: ${tile.icon}`;
        currentRow++;

        // Actions
        if (tile.actions.length > 0) {
          sheet.getCell(`A${currentRow}`).value = 'Akce:';
          sheet.getCell(`A${currentRow}`).font = { bold: true };
          sheet.getCell(`B${currentRow}`).value = tile.actions.join(', ');
          currentRow++;
        }

        // Columns
        if (tile.columns.length > 0) {
          sheet.getCell(`A${currentRow}`).value = 'Sloupce:';
          sheet.getCell(`A${currentRow}`).font = { bold: true };
          currentRow++;

          // Column headers
          sheet.getCell(`A${currentRow}`).value = 'Klíč';
          sheet.getCell(`B${currentRow}`).value = 'Název';
          sheet.getCell(`C${currentRow}`).value = 'Šířka';
          sheet.getCell(`D${currentRow}`).value = 'Řazení';
          sheet.getCell(`E${currentRow}`).value = 'Typ';
          sheet.getRow(currentRow).font = { bold: true };
          sheet.getRow(currentRow).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
          currentRow++;

          for (const col of tile.columns) {
            sheet.getCell(`A${currentRow}`).value = col.key;
            sheet.getCell(`B${currentRow}`).value = col.label;
            sheet.getCell(`C${currentRow}`).value = col.width || '-';
            sheet.getCell(`D${currentRow}`).value = col.sortable ? 'Ano' : 'Ne';
            sheet.getCell(`E${currentRow}`).value = '-'; // Type info not in columns
            currentRow++;
          }
        }

        currentRow++; // Space between tiles
      }

      currentRow++; // Extra space before forms
    }

    // Forms section
    if (module.forms.length > 0) {
      sheet.mergeCells(`A${currentRow}:F${currentRow}`);
      const formsHeader = sheet.getCell(`A${currentRow}`);
      formsHeader.value = 'FORMULÁŘE (FORMS)';
      formsHeader.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
      formsHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } };
      formsHeader.alignment = { horizontal: 'left', vertical: 'middle' };
      sheet.getRow(currentRow).height = 25;
      currentRow++;

      for (const form of module.forms) {
        // Form name and icon
        sheet.getCell(`A${currentRow}`).value = `Formulář: ${form.title}`;
        sheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
        sheet.getCell(`B${currentRow}`).value = `Ikona: ${form.icon}`;
        currentRow++;

        // Actions
        if (form.actions.length > 0) {
          sheet.getCell(`A${currentRow}`).value = 'Akce:';
          sheet.getCell(`A${currentRow}`).font = { bold: true };
          sheet.getCell(`B${currentRow}`).value = form.actions.join(', ');
          currentRow++;
        }

        // Fields
        if (form.fields.length > 0) {
          sheet.getCell(`A${currentRow}`).value = 'Pole:';
          sheet.getCell(`A${currentRow}`).font = { bold: true };
          currentRow++;

          // Field headers
          sheet.getCell(`A${currentRow}`).value = 'Klíč';
          sheet.getCell(`B${currentRow}`).value = 'Název';
          sheet.getCell(`C${currentRow}`).value = 'Typ';
          sheet.getRow(currentRow).font = { bold: true };
          sheet.getRow(currentRow).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
          currentRow++;

          for (const field of form.fields) {
            sheet.getCell(`A${currentRow}`).value = field.key;
            sheet.getCell(`B${currentRow}`).value = field.label;
            sheet.getCell(`C${currentRow}`).value = field.type;
            currentRow++;
          }
        }

        currentRow++; // Space between forms
      }
    }

    // Set column widths
    sheet.getColumn('A').width = 25;
    sheet.getColumn('B').width = 30;
    sheet.getColumn('C').width = 15;
    sheet.getColumn('D').width = 12;
    sheet.getColumn('E').width = 15;
    sheet.getColumn('F').width = 15;
  }

  // Create field analysis sheet
  const fieldSheet = workbook.addWorksheet('Analýza polí');
  
  // Header
  fieldSheet.mergeCells('A1:E1');
  const fieldHeaderCell = fieldSheet.getCell('A1');
  fieldHeaderCell.value = 'ANALÝZA POUŽITÍ POLÍ';
  fieldHeaderCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  fieldHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
  fieldHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' };
  fieldSheet.getRow(1).height = 30;

  // Column headers
  fieldSheet.getCell('A3').value = 'Klíč pole';
  fieldSheet.getCell('B3').value = 'Počet použití';
  fieldSheet.getCell('C3').value = 'Modul';
  fieldSheet.getCell('D3').value = 'Typ (Přehled/Formulář)';
  fieldSheet.getCell('E3').value = 'Název';
  fieldSheet.getRow(3).font = { bold: true };
  fieldSheet.getRow(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };

  // Collect all fields
  const fieldUsage = new Map();
  
  for (const module of analysis.modules) {
    // From tiles
    for (const tile of module.tiles) {
      for (const col of tile.columns) {
        if (!fieldUsage.has(col.key)) {
          fieldUsage.set(col.key, []);
        }
        fieldUsage.get(col.key).push({
          module: module.title,
          type: 'Přehled',
          name: tile.title
        });
      }
    }

    // From forms
    for (const form of module.forms) {
      for (const field of form.fields) {
        if (!fieldUsage.has(field.key)) {
          fieldUsage.set(field.key, []);
        }
        fieldUsage.get(field.key).push({
          module: module.title,
          type: 'Formulář',
          name: form.title
        });
      }
    }
  }

  // Sort by usage count
  const sortedFields = Array.from(fieldUsage.entries())
    .sort((a, b) => b[1].length - a[1].length);

  let fieldRow = 4;
  for (const [fieldKey, usages] of sortedFields) {
    const startRow = fieldRow;
    
    for (let i = 0; i < usages.length; i++) {
      const usage = usages[i];
      
      if (i === 0) {
        fieldSheet.getCell(`A${fieldRow}`).value = fieldKey;
        fieldSheet.getCell(`B${fieldRow}`).value = usages.length;
        fieldSheet.getCell(`A${fieldRow}`).font = { bold: true };
        fieldSheet.getCell(`B${fieldRow}`).font = { bold: true };
      }
      
      fieldSheet.getCell(`C${fieldRow}`).value = usage.module;
      fieldSheet.getCell(`D${fieldRow}`).value = usage.type;
      fieldSheet.getCell(`E${fieldRow}`).value = usage.name;
      fieldRow++;
    }

    // Add border after each field group
    if (usages.length > 1) {
      for (let col of ['A', 'B', 'C', 'D', 'E']) {
        fieldSheet.getCell(`${col}${startRow}`).border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' }
        };
        fieldSheet.getCell(`${col}${fieldRow - 1}`).border = {
          bottom: { style: 'medium' }
        };
      }
    }
  }

  // Set column widths
  fieldSheet.getColumn('A').width = 25;
  fieldSheet.getColumn('B').width = 15;
  fieldSheet.getColumn('C').width = 25;
  fieldSheet.getColumn('D').width = 20;
  fieldSheet.getColumn('E').width = 35;

  // Save workbook
  await workbook.xlsx.writeFile('struktura-aplikace.xlsx');
  console.log('✅ Created: struktura-aplikace.xlsx');
}

generateExcel().catch(err => {
  console.error('Error generating Excel:', err);
  process.exit(1);
});
