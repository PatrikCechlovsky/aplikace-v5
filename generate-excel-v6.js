#!/usr/bin/env node
/**
 * Generates Excel V6 Metamodel according to the new methodology
 * Reads from struktura-aplikace (10).xlsx and creates struktura-V6.xlsx
 */

const ExcelJS = require('exceljs');

// Color definitions
const COLORS = {
  sectionHeader: 'FF2563EB',  // Blue for META/SIDEBAR/PŘEHLEDY/FORMULÁŘE sections
  tableHeader: 'FFFFD966',     // Yellow for table headers
  white: 'FFFFFFFF',
  lightGray: 'FFE5E7EB'
};

// Modules to process
const MODULES = [
  { code: '010', name: 'Sprava_uzivatelu', sheet: 'Uživatelé', entity: 'users' },
  { code: '020', name: 'Muj_ucet', sheet: 'Můj účet', entity: 'user_profile' },
  { code: '030', name: 'Pronajimatel', sheet: 'Pronajímatel', entity: 'subjects' },
  { code: '040', name: 'Nemovitost', sheet: 'Nemovitosti', entity: 'properties' },
  { code: '050', name: 'Najemnik', sheet: 'Nájemník', entity: 'tenants' },
  { code: '060', name: 'Smlouva', sheet: 'Smlouvy', entity: 'contracts' },
  { code: '070', name: 'Sluzby', sheet: 'Služby', entity: 'services' },
  { code: '080', name: 'Platby', sheet: 'Platby', entity: 'payments' },
  { code: '090', name: 'Finance', sheet: 'Finance', entity: 'finance' },
  { code: '100', name: 'Energie', sheet: 'Energie', entity: 'energy' },
  { code: '110', name: 'Udrzba', sheet: 'Udržba', entity: 'maintenance' },
  { code: '120', name: 'Dokumenty', sheet: 'Dokumenty', entity: 'documents' },
  { code: '130', name: 'Komunikace', sheet: 'Komunikace', entity: 'communication' },
  { code: '900', name: 'Nastaveni', sheet: 'Nastaveni', entity: 'settings' }
];

async function generateExcelV6() {
  console.log('📊 Starting Excel V6 generation...');
  
  // Load source workbook
  const sourceWorkbook = new ExcelJS.Workbook();
  await sourceWorkbook.xlsx.readFile('struktura-aplikace (10).xlsx');
  console.log('✅ Loaded source Excel file');
  
  // Create new workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Excel V6 Generator';
  workbook.created = new Date();
  
  // Process each module
  for (const module of MODULES) {
    console.log(`\n📦 Processing module: ${module.code} - ${module.name}`);
    
    const sourceSheet = sourceWorkbook.getWorksheet(module.sheet);
    if (!sourceSheet) {
      console.log(`⚠️  Source sheet '${module.sheet}' not found, skipping...`);
      continue;
    }
    
    createModuleSheet(workbook, module, sourceSheet);
  }
  
  // Create central sheets
  console.log('\n📋 Creating central sheets...');
  createNastaveniIDSheet(workbook);
  createCiselniky(workbook);
  createImportyExporty(workbook);
  createSablonyImportu(workbook);
  
  // Save workbook
  const outputFile = 'struktura-V6.xlsx';
  await workbook.xlsx.writeFile(outputFile);
  console.log(`\n✅ Excel V6 generated successfully: ${outputFile}`);
}

function createModuleSheet(workbook, module, sourceSheet) {
  const sheetName = `Modul_${module.code}_${module.name}`;
  const sheet = workbook.addWorksheet(sheetName.substring(0, 31)); // Excel limit
  
  let currentRow = 1;
  
  // ========== META SECTION ==========
  currentRow = addMetaSection(sheet, currentRow, module);
  currentRow += 2; // Add spacing
  
  // ========== SIDEBAR SECTION ==========
  currentRow = addSidebarSection(sheet, currentRow, module, sourceSheet);
  currentRow += 2; // Add spacing
  
  // ========== PŘEHLEDY SECTION ==========
  currentRow = addPrehledySection(sheet, currentRow, module, sourceSheet);
  currentRow += 2; // Add spacing
  
  // ========== FORMULÁŘE SECTION ==========
  currentRow = addFormulareSection(sheet, currentRow, module, sourceSheet);
  
  // Set column widths
  sheet.getColumn(1).width = 25;
  sheet.getColumn(2).width = 30;
  sheet.getColumn(3).width = 15;
  sheet.getColumn(4).width = 15;
  sheet.getColumn(5).width = 20;
  sheet.getColumn(6).width = 30;
  sheet.getColumn(7).width = 20;
  sheet.getColumn(8).width = 25;
}

function addMetaSection(sheet, startRow, module) {
  // Section header
  const headerRow = startRow;
  sheet.mergeCells(`A${headerRow}:B${headerRow}`);
  const headerCell = sheet.getCell(`A${headerRow}`);
  headerCell.value = 'META';
  headerCell.font = { size: 14, bold: true, color: { argb: COLORS.white } };
  headerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.sectionHeader } };
  headerCell.alignment = { horizontal: 'left', vertical: 'middle' };
  sheet.getRow(headerRow).height = 25;
  
  let row = headerRow + 1;
  
  // Two-row header
  sheet.getCell(`A${row}`).value = 'meta_key';
  sheet.getCell(`B${row}`).value = 'meta_value';
  sheet.getRow(row).font = { bold: true };
  sheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.tableHeader } };
  row++;
  
  sheet.getCell(`A${row}`).value = 'Klíč';
  sheet.getCell(`B${row}`).value = 'Hodnota';
  sheet.getRow(row).font = { bold: true };
  sheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.tableHeader } };
  row++;
  
  // Meta data
  const metaData = [
    ['module_code', module.code],
    ['module_name_cz', module.name.replace(/_/g, ' ')],
    ['entity_table', module.entity],
    ['description', `Modul pro správu ${module.name.replace(/_/g, ' ').toLowerCase()}`]
  ];
  
  for (const [key, value] of metaData) {
    sheet.getCell(`A${row}`).value = key;
    sheet.getCell(`B${row}`).value = value;
    row++;
  }
  
  return row;
}

function addSidebarSection(sheet, startRow, module, sourceSheet) {
  // Section header
  const headerRow = startRow;
  sheet.mergeCells(`A${headerRow}:H${headerRow}`);
  const headerCell = sheet.getCell(`A${headerRow}`);
  headerCell.value = 'SIDEBAR';
  headerCell.font = { size: 14, bold: true, color: { argb: COLORS.white } };
  headerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.sectionHeader } };
  headerCell.alignment = { horizontal: 'left', vertical: 'middle' };
  sheet.getRow(headerRow).height = 25;
  
  let row = headerRow + 1;
  
  // Two-row header
  const technicalHeaders = ['order', 'group', 'type', 'code', 'label_cz', 'target_code', 'icon', 'description'];
  const czechHeaders = ['Pořadí', 'Skupina', 'Typ', 'Kód', 'Název (CZ)', 'Cíl', 'Ikona', 'Popis'];
  
  for (let i = 0; i < technicalHeaders.length; i++) {
    sheet.getCell(row, i + 1).value = technicalHeaders[i];
  }
  sheet.getRow(row).font = { bold: true };
  sheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.tableHeader } };
  row++;
  
  for (let i = 0; i < czechHeaders.length; i++) {
    sheet.getCell(row, i + 1).value = czechHeaders[i];
  }
  sheet.getRow(row).font = { bold: true };
  sheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.tableHeader } };
  row++;
  
  // Sample sidebar items (extract from source or generate)
  const sidebarItems = generateSidebarItems(module, sourceSheet);
  
  for (const item of sidebarItems) {
    sheet.getCell(`A${row}`).value = item.order;
    sheet.getCell(`B${row}`).value = item.group;
    sheet.getCell(`C${row}`).value = item.type;
    sheet.getCell(`D${row}`).value = item.code;
    sheet.getCell(`E${row}`).value = item.label_cz;
    sheet.getCell(`F${row}`).value = item.target_code;
    sheet.getCell(`G${row}`).value = item.icon;
    sheet.getCell(`H${row}`).value = item.description;
    row++;
  }
  
  return row;
}

function addPrehledySection(sheet, startRow, module, sourceSheet) {
  // Section header
  const headerRow = startRow;
  sheet.mergeCells(`A${headerRow}:H${headerRow}`);
  const headerCell = sheet.getCell(`A${headerRow}`);
  headerCell.value = 'PŘEHLEDY';
  headerCell.font = { size: 14, bold: true, color: { argb: COLORS.white } };
  headerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.sectionHeader } };
  headerCell.alignment = { horizontal: 'left', vertical: 'middle' };
  sheet.getRow(headerRow).height = 25;
  
  let row = headerRow + 1;
  
  // Extract overviews from source
  const overviews = extractOverviews(sourceSheet);
  
  for (const overview of overviews) {
    // Overview title
    sheet.getCell(`A${row}`).value = `Přehled: ${overview.title}`;
    sheet.getCell(`A${row}`).font = { bold: true, size: 12 };
    sheet.getCell(`B${row}`).value = `Ikona: ${overview.icon}`;
    row++;
    
    // Two-row header for columns
    const technicalHeaders = ['field_code', 'field_label_cz', 'data_type', 'length', 'filterable', 'sortable', 'width', 'description'];
    const czechHeaders = ['Kód pole', 'Název pole (CZ)', 'Datový typ', 'Délka', 'Filtrovatelné', 'Řaditelné', 'Šířka', 'Popis'];
    
    for (let i = 0; i < technicalHeaders.length; i++) {
      sheet.getCell(row, i + 1).value = technicalHeaders[i];
    }
    sheet.getRow(row).font = { bold: true };
    sheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.tableHeader } };
    row++;
    
    for (let i = 0; i < czechHeaders.length; i++) {
      sheet.getCell(row, i + 1).value = czechHeaders[i];
    }
    sheet.getRow(row).font = { bold: true };
    sheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.tableHeader } };
    row++;
    
    // Columns
    for (const column of overview.columns) {
      sheet.getCell(`A${row}`).value = column.key;
      sheet.getCell(`B${row}`).value = column.label;
      sheet.getCell(`C${row}`).value = column.dataType || 'string';
      sheet.getCell(`D${row}`).value = column.length || '';
      sheet.getCell(`E${row}`).value = column.filterable ? 'Ano' : 'Ne';
      sheet.getCell(`F${row}`).value = column.sortable ? 'Ano' : 'Ne';
      sheet.getCell(`G${row}`).value = column.width || '';
      sheet.getCell(`H${row}`).value = column.description || '';
      row++;
    }
    
    row++; // Space between overviews
  }
  
  return row;
}

function addFormulareSection(sheet, startRow, module, sourceSheet) {
  // Section header
  const headerRow = startRow;
  sheet.mergeCells(`A${headerRow}:I${headerRow}`);
  const headerCell = sheet.getCell(`A${headerRow}`);
  headerCell.value = 'FORMULÁŘE';
  headerCell.font = { size: 14, bold: true, color: { argb: COLORS.white } };
  headerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.sectionHeader } };
  headerCell.alignment = { horizontal: 'left', vertical: 'middle' };
  sheet.getRow(headerRow).height = 25;
  
  let row = headerRow + 1;
  
  // Extract forms from source
  const forms = extractForms(sourceSheet);
  
  for (const form of forms) {
    // Form title
    sheet.getCell(`A${row}`).value = `Formulář: ${form.title}`;
    sheet.getCell(`A${row}`).font = { bold: true, size: 12 };
    sheet.getCell(`B${row}`).value = `Kód: ${form.code}`;
    row++;
    
    // Two-row header for fields
    const technicalHeaders = ['field_code', 'field_label_cz', 'data_type', 'length', 'required', 'default_value', 'validation', 'description', 'business_logic'];
    const czechHeaders = ['Kód pole', 'Název pole (CZ)', 'Datový typ', 'Délka', 'Povinné', 'Výchozí hodnota', 'Validace', 'Popis', 'Business logika'];
    
    for (let i = 0; i < technicalHeaders.length; i++) {
      sheet.getCell(row, i + 1).value = technicalHeaders[i];
    }
    sheet.getRow(row).font = { bold: true };
    sheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.tableHeader } };
    row++;
    
    for (let i = 0; i < czechHeaders.length; i++) {
      sheet.getCell(row, i + 1).value = czechHeaders[i];
    }
    sheet.getRow(row).font = { bold: true };
    sheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.tableHeader } };
    row++;
    
    // Fields
    for (const field of form.fields) {
      sheet.getCell(`A${row}`).value = field.key;
      sheet.getCell(`B${row}`).value = field.label;
      sheet.getCell(`C${row}`).value = field.type || 'text';
      sheet.getCell(`D${row}`).value = field.length || '';
      sheet.getCell(`E${row}`).value = field.required ? 'Ano' : 'Ne';
      sheet.getCell(`F${row}`).value = field.defaultValue || '';
      sheet.getCell(`G${row}`).value = field.validation || '';
      sheet.getCell(`H${row}`).value = field.description || '';
      sheet.getCell(`I${row}`).value = field.businessLogic || '';
      row++;
    }
    
    row++; // Space between forms
  }
  
  return row;
}

function generateSidebarItems(module, sourceSheet) {
  // Generate sidebar navigation items based on module
  const prefix = module.code.replace(/^0+/, '');
  const items = [
    {
      order: 1,
      group: 'Hlavní',
      type: 'overview',
      code: `${module.code}_OVERVIEW_LIST`,
      label_cz: `Přehled ${module.name.replace(/_/g, ' ')}`,
      target_code: `${module.code}_OVERVIEW_LIST`,
      icon: 'list',
      description: 'Hlavní přehled modulu'
    },
    {
      order: 2,
      group: 'Hlavní',
      type: 'form',
      code: `${module.code}_FORM_DETAIL`,
      label_cz: 'Detail',
      target_code: `${module.code}_FORM_DETAIL`,
      icon: 'edit',
      description: 'Detailní formulář'
    }
  ];
  
  return items;
}

function extractOverviews(sourceSheet) {
  const overviews = [];
  let currentOverview = null;
  let inColumnsSection = false;
  
  for (let i = 1; i <= sourceSheet.rowCount; i++) {
    const row = sourceSheet.getRow(i);
    const cellA = row.getCell(1).value;
    const cellB = row.getCell(2).value;
    
    if (!cellA) continue;
    
    const cellAStr = String(cellA);
    
    // Detect overview start
    if (cellAStr.startsWith('Přehled:')) {
      if (currentOverview) {
        overviews.push(currentOverview);
      }
      
      const title = cellAStr.replace('Přehled:', '').trim();
      const icon = cellB ? String(cellB).replace('Ikona:', '').trim() : 'list';
      
      currentOverview = {
        title: title,
        icon: icon,
        columns: []
      };
      inColumnsSection = false;
    }
    // Detect columns header
    else if (cellAStr === 'Klíč' && currentOverview) {
      inColumnsSection = true;
    }
    // Extract column data
    else if (inColumnsSection && currentOverview && cellAStr !== 'Sloupce:') {
      const key = cellAStr;
      const label = row.getCell(2).value || '';
      const width = row.getCell(3).value || '';
      const sortable = row.getCell(4).value === 'Ano';
      const description = row.getCell(6).value || '';
      
      if (key && key !== 'Klíč') {
        currentOverview.columns.push({
          key: String(key),
          label: String(label),
          width: String(width),
          sortable: sortable,
          filterable: true,
          dataType: 'string',
          description: String(description)
        });
      }
    }
    // Detect end of columns (empty row or new section)
    else if ((cellAStr === '' || cellAStr.startsWith('Formulář:') || cellAStr === 'FORMULÁŘE (FORMS)') && inColumnsSection) {
      inColumnsSection = false;
      if (cellAStr.startsWith('Formulář:') || cellAStr === 'FORMULÁŘE (FORMS)') {
        break; // Stop at forms section
      }
    }
  }
  
  if (currentOverview) {
    overviews.push(currentOverview);
  }
  
  return overviews;
}

function extractForms(sourceSheet) {
  const forms = [];
  let currentForm = null;
  let inFieldsSection = false;
  let foundFormsSection = false;
  
  for (let i = 1; i <= sourceSheet.rowCount; i++) {
    const row = sourceSheet.getRow(i);
    const cellA = row.getCell(1).value;
    const cellB = row.getCell(2).value;
    
    if (!cellA) continue;
    
    const cellAStr = String(cellA);
    
    // Detect forms section start
    if (cellAStr === 'FORMULÁŘE (FORMS)' || cellAStr.includes('FORMULÁŘE')) {
      foundFormsSection = true;
      continue;
    }
    
    if (!foundFormsSection) continue;
    
    // Detect form start
    if (cellAStr.startsWith('Formulář:')) {
      if (currentForm) {
        forms.push(currentForm);
      }
      
      const title = cellAStr.replace('Formulář:', '').trim();
      const icon = cellB ? String(cellB).replace('Ikona:', '').trim() : 'edit';
      
      currentForm = {
        title: title,
        code: title.toUpperCase().replace(/\s+/g, '_'),
        icon: icon,
        fields: []
      };
      inFieldsSection = false;
    }
    // Detect fields header
    else if (cellAStr === 'Klíč' && currentForm) {
      inFieldsSection = true;
    }
    // Extract field data
    else if (inFieldsSection && currentForm && cellAStr !== 'Pole:') {
      const key = cellAStr;
      const label = row.getCell(2).value || '';
      const type = row.getCell(3).value || 'text';
      const description = row.getCell(4).value || row.getCell(5).value || '';
      
      if (key && key !== 'Klíč') {
        currentForm.fields.push({
          key: String(key),
          label: String(label),
          type: String(type),
          length: '',
          required: false,
          defaultValue: '',
          validation: '',
          description: String(description),
          businessLogic: ''
        });
      }
    }
  }
  
  if (currentForm) {
    forms.push(currentForm);
  }
  
  return forms;
}

function createNastaveniIDSheet(workbook) {
  const sheet = workbook.addWorksheet('Nastavení_ID');
  
  // Section header
  sheet.mergeCells('A1:G1');
  const headerCell = sheet.getCell('A1');
  headerCell.value = 'NASTAVENÍ ID - Číslování a prefixy';
  headerCell.font = { size: 14, bold: true, color: { argb: COLORS.white } };
  headerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.sectionHeader } };
  headerCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(1).height = 25;
  
  // Two-row header
  const technicalHeaders = ['module_code', 'type_code', 'module_prefix', 'type_prefix', 'sequence_length', 'next_number', 'example'];
  const czechHeaders = ['Modul', 'Typ', 'Prefix modulu', 'Prefix typu', 'Délka sekvence', 'Další číslo', 'Příklad'];
  
  let row = 2;
  for (let i = 0; i < technicalHeaders.length; i++) {
    sheet.getCell(row, i + 1).value = technicalHeaders[i];
  }
  sheet.getRow(row).font = { bold: true };
  sheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.tableHeader } };
  row++;
  
  for (let i = 0; i < czechHeaders.length; i++) {
    sheet.getCell(row, i + 1).value = czechHeaders[i];
  }
  sheet.getRow(row).font = { bold: true };
  sheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.tableHeader } };
  row++;
  
  // Sample data
  const idSettings = [
    ['030', 'FIRM', 'PRON', 'FIRM', 4, 1, 'PRON-FIRM-0001'],
    ['030', 'OSVC', 'PRON', 'OSVC', 4, 1, 'PRON-OSVC-0001'],
    ['030', 'OSOBA', 'PRON', 'OSOBA', 4, 1, 'PRON-OSOBA-0001'],
    ['060', 'HLAV', 'SML', 'HLAV', 4, 1, 'SML-HLAV-0001'],
    ['060', 'DOD', 'SML', 'DOD', 4, 1, 'SML-DOD-0001'],
    ['080', 'PLATBA', 'PLT', 'PLATBA', 4, 1, 'PLT-PLATBA-0001']
  ];
  
  for (const setting of idSettings) {
    for (let i = 0; i < setting.length; i++) {
      sheet.getCell(row, i + 1).value = setting[i];
    }
    row++;
  }
  
  // Set column widths
  sheet.getColumn(1).width = 15;
  sheet.getColumn(2).width = 15;
  sheet.getColumn(3).width = 18;
  sheet.getColumn(4).width = 18;
  sheet.getColumn(5).width = 18;
  sheet.getColumn(6).width = 15;
  sheet.getColumn(7).width = 20;
}

function createCiselniky(workbook) {
  const sheet = workbook.addWorksheet('Číselníky');
  
  // Section header
  sheet.mergeCells('A1:F1');
  const headerCell = sheet.getCell('A1');
  headerCell.value = 'ČÍSELNÍKY - Centrální seznam hodnot';
  headerCell.font = { size: 14, bold: true, color: { argb: COLORS.white } };
  headerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.sectionHeader } };
  headerCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(1).height = 25;
  
  // Two-row header
  const technicalHeaders = ['codelist_type', 'code', 'label_cz', 'prefix', 'editable', 'description'];
  const czechHeaders = ['Typ číselníku', 'Kód', 'Název (CZ)', 'Prefix pro ID', 'Editovatelné', 'Popis'];
  
  let row = 2;
  for (let i = 0; i < technicalHeaders.length; i++) {
    sheet.getCell(row, i + 1).value = technicalHeaders[i];
  }
  sheet.getRow(row).font = { bold: true };
  sheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.tableHeader } };
  row++;
  
  for (let i = 0; i < czechHeaders.length; i++) {
    sheet.getCell(row, i + 1).value = czechHeaders[i];
  }
  sheet.getRow(row).font = { bold: true };
  sheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.tableHeader } };
  row++;
  
  // Sample data
  const codelists = [
    ['typ_pronajimatele', 'FIRM', 'Firma', 'FIRM', 'Ne', 'Právnická osoba - firma'],
    ['typ_pronajimatele', 'OSVC', 'OSVČ', 'OSVC', 'Ne', 'Fyzická osoba podnikající'],
    ['typ_pronajimatele', 'OSOBA', 'Fyzická osoba', 'OSOBA', 'Ne', 'Fyzická osoba nepodnikající'],
    ['typ_dokumentu', 'SMLOUVA', 'Smlouva', '', 'Ano', 'Dokument typu smlouva'],
    ['typ_dokumentu', 'FAKTURA', 'Faktura', '', 'Ano', 'Dokument typu faktura'],
    ['typ_dokumentu', 'PROTOKOL', 'Protokol', '', 'Ano', 'Předávací protokol'],
    ['zpusob_platby', 'BANK', 'Bankovní převod', '', 'Ano', 'Platba bankovním převodem'],
    ['zpusob_platby', 'HOTOVOST', 'Hotovost', '', 'Ano', 'Platba v hotovosti'],
    ['zpusob_platby', 'KARTA', 'Platební karta', '', 'Ano', 'Platba kartou'],
    ['druh_nemovitosti', 'BYT', 'Byt', '', 'Ano', 'Bytová jednotka'],
    ['druh_nemovitosti', 'DUM', 'Dům', '', 'Ano', 'Rodinný dům'],
    ['druh_nemovitosti', 'KOMERC', 'Komerční prostor', '', 'Ano', 'Komerční prostory']
  ];
  
  for (const item of codelists) {
    for (let i = 0; i < item.length; i++) {
      sheet.getCell(row, i + 1).value = item[i];
    }
    row++;
  }
  
  // Set column widths
  sheet.getColumn(1).width = 25;
  sheet.getColumn(2).width = 15;
  sheet.getColumn(3).width = 25;
  sheet.getColumn(4).width = 15;
  sheet.getColumn(5).width = 15;
  sheet.getColumn(6).width = 40;
}

function createImportyExporty(workbook) {
  const sheet = workbook.addWorksheet('Importy_Exporty');
  
  // Section header
  sheet.mergeCells('A1:F1');
  const headerCell = sheet.getCell('A1');
  headerCell.value = 'IMPORTY A EXPORTY - Definice šablon';
  headerCell.font = { size: 14, bold: true, color: { argb: COLORS.white } };
  headerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.sectionHeader } };
  headerCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(1).height = 25;
  
  // Two-row header
  const technicalHeaders = ['code', 'module_code', 'type', 'target', 'description', 'template_name'];
  const czechHeaders = ['Kód', 'Modul', 'Typ', 'Cíl', 'Popis', 'Název šablony'];
  
  let row = 2;
  for (let i = 0; i < technicalHeaders.length; i++) {
    sheet.getCell(row, i + 1).value = technicalHeaders[i];
  }
  sheet.getRow(row).font = { bold: true };
  sheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.tableHeader } };
  row++;
  
  for (let i = 0; i < czechHeaders.length; i++) {
    sheet.getCell(row, i + 1).value = czechHeaders[i];
  }
  sheet.getRow(row).font = { bold: true };
  sheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.tableHeader } };
  row++;
  
  // Sample data
  const importExports = [
    ['PRON_IMPORT_MAIN', '030', 'import', 'form', 'Import pronajímatelů', 'Import_Pronajimatele.xlsx'],
    ['PRON_EXPORT_MAIN', '030', 'export', 'overview', 'Export seznamu pronajímatelů', 'Export_Pronajimatele.xlsx'],
    ['NEM_IMPORT_MAIN', '040', 'import', 'form', 'Import nemovitostí', 'Import_Nemovitosti.xlsx'],
    ['NEM_EXPORT_MAIN', '040', 'export', 'overview', 'Export seznamu nemovitostí', 'Export_Nemovitosti.xlsx'],
    ['SML_IMPORT_MAIN', '060', 'import', 'form', 'Import smluv', 'Import_Smlouvy.xlsx'],
    ['SML_EXPORT_MAIN', '060', 'export', 'overview', 'Export seznamu smluv', 'Export_Smlouvy.xlsx']
  ];
  
  for (const item of importExports) {
    for (let i = 0; i < item.length; i++) {
      sheet.getCell(row, i + 1).value = item[i];
    }
    row++;
  }
  
  // Set column widths
  sheet.getColumn(1).width = 25;
  sheet.getColumn(2).width = 12;
  sheet.getColumn(3).width = 12;
  sheet.getColumn(4).width = 15;
  sheet.getColumn(5).width = 35;
  sheet.getColumn(6).width = 30;
}

function createSablonyImportu(workbook) {
  const sheet = workbook.addWorksheet('Šablony_importu');
  
  // Section header
  sheet.mergeCells('A1:H1');
  const headerCell = sheet.getCell('A1');
  headerCell.value = 'ŠABLONY IMPORTU - Definice sloupců';
  headerCell.font = { size: 14, bold: true, color: { argb: COLORS.white } };
  headerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.sectionHeader } };
  headerCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(1).height = 25;
  
  // Two-row header
  const technicalHeaders = ['import_code', 'order', 'field_code', 'field_label_cz', 'required', 'allowed_values_source', 'example_value', 'description'];
  const czechHeaders = ['Kód importu', 'Pořadí', 'Kód pole', 'Název sloupce (CZ)', 'Povinné', 'Zdroj hodnot', 'Příklad', 'Popis'];
  
  let row = 2;
  for (let i = 0; i < technicalHeaders.length; i++) {
    sheet.getCell(row, i + 1).value = technicalHeaders[i];
  }
  sheet.getRow(row).font = { bold: true };
  sheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.tableHeader } };
  row++;
  
  for (let i = 0; i < czechHeaders.length; i++) {
    sheet.getCell(row, i + 1).value = czechHeaders[i];
  }
  sheet.getRow(row).font = { bold: true };
  sheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.tableHeader } };
  row++;
  
  // Sample data
  const templates = [
    ['PRON_IMPORT_MAIN', 1, 'typ_subjektu', 'Typ pronajímatele', 'Ano', 'typ_pronajimatele', 'FIRM', 'Typ z číselníku'],
    ['PRON_IMPORT_MAIN', 2, 'display_name', 'Název/Jméno', 'Ano', '', 'ABC s.r.o.', 'Název firmy nebo jméno osoby'],
    ['PRON_IMPORT_MAIN', 3, 'ico', 'IČO', 'Ne', '', '12345678', 'Identifikační číslo organizace'],
    ['PRON_IMPORT_MAIN', 4, 'primary_phone', 'Telefon', 'Ne', '', '+420123456789', 'Kontaktní telefon'],
    ['PRON_IMPORT_MAIN', 5, 'primary_email', 'Email', 'Ano', '', 'info@example.cz', 'Kontaktní email'],
    ['PRON_IMPORT_MAIN', 6, 'street', 'Ulice', 'Ne', '', 'Hlavní 123', 'Ulice a číslo popisné'],
    ['PRON_IMPORT_MAIN', 7, 'city', 'Město', 'Ne', '', 'Praha', 'Město'],
    ['PRON_IMPORT_MAIN', 8, 'zip', 'PSČ', 'Ne', '', '11000', 'Poštovní směrovací číslo']
  ];
  
  for (const item of templates) {
    for (let i = 0; i < item.length; i++) {
      sheet.getCell(row, i + 1).value = item[i];
    }
    row++;
  }
  
  // Set column widths
  sheet.getColumn(1).width = 22;
  sheet.getColumn(2).width = 10;
  sheet.getColumn(3).width = 20;
  sheet.getColumn(4).width = 25;
  sheet.getColumn(5).width = 12;
  sheet.getColumn(6).width = 25;
  sheet.getColumn(7).width = 20;
  sheet.getColumn(8).width = 35;
}

// Run the generator
generateExcelV6().catch(err => {
  console.error('❌ Error generating Excel V6:', err);
  process.exit(1);
});
