const ExcelJS = require("exceljs");

async function inspect() {
  const file = "/Users/user/Library/Containers/net.whatsapp.WhatsApp/Data/tmp/documents/65C36C3B-86D7-457B-AB0C-D71F294BBC15/Fərman baza (1) (2).xlsx";
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(file);

  wb.eachSheet((ws, id) => {
    console.log(`\n--- Sheet: ${ws.name} (id: ${id}) ---`);
    for (let r = 1; r <= Math.min(10, ws.rowCount); r++) {
      const row = ws.getRow(r);
      const values = [];
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber <= 15) {
          values.push(`[${colNumber}]: ${JSON.stringify(cell.value)}`);
        }
      });
      console.log(`Row ${r}:`, values.join(" | "));
    }
  });
}

inspect().catch(console.error);
