import * as XLSX from 'xlsx';
import path from 'path';

const excelPath = path.resolve(__dirname, '../../Copy of Zoominfo - 1014 Leads.xlsx');
const workbook = XLSX.readFile(excelPath);

for (const sheetName of workbook.SheetNames) {
  const data: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]!);
  if (data.length > 0) {
    const keys = Object.keys(data[0]);
    console.log(`\nSheet: "${sheetName}"`);
    console.log('Columns:', keys.join(', '));
    
    // Show any rows where exec/exe/bde column has "Viswa" (case-insensitive)
    const execKeys = keys.filter(k => /exe|bde|exec|assign/i.test(k));
    if (execKeys.length > 0) {
      console.log('Relevant columns:', execKeys);
      const sample = data[0];
      execKeys.forEach(k => console.log(`  ${k}: ${sample[k]}`));
    }
  }
}
