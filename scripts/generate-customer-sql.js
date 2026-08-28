const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

function cleanPhone(raw) {
  if (!raw) return "";
  let str = String(raw).trim().replace(/[\s\-\(\)\+\.]/g, "");
  if (!str || str === "-" || str === "null" || str === "undefined") return "";
  if (str.includes("T00:00") || str.length > 20) return "";
  if (str.length === 9 && !str.startsWith("998")) {
    str = "998" + str;
  }
  return str;
}

function parseFullName(raw) {
  if (!raw) return { firstName: "Müştəri", lastName: "-" };
  let str = String(raw).trim().replace(/\s+/g, " ");
  if (!str || str === "-" || str === "null" || str === "undefined") {
    return { firstName: "Müştəri", lastName: "-" };
  }
  const parts = str.split(" ");
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "-" };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" ")
  };
}

function escapeSql(str) {
  if (str === null || str === undefined) return "NULL";
  return "'" + String(str).replace(/'/g, "''") + "'";
}

async function main() {
  const file = "/Users/user/Library/Containers/net.whatsapp.WhatsApp/Data/tmp/documents/65C36C3B-86D7-457B-AB0C-D71F294BBC15/Fərman baza (1) (2).xlsx";
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(file);

  const daskentCustomers = new Map();
  const semerqendCustomers = new Map();

  // 1. Sheet: 10761 -> Daşkənd Pro
  const ws10761 = wb.getWorksheet("10761");
  if (ws10761) {
    ws10761.eachRow((row) => {
      const nameRaw = row.getCell(3).value;
      const phoneRaw = row.getCell(4).value;
      const phone = cleanPhone(phoneRaw);
      const { firstName, lastName } = parseFullName(nameRaw);
      if (firstName === "Müştəri" && !phone) return;
      const key = phone ? phone : `${firstName}_${lastName}`;
      if (!daskentCustomers.has(key)) {
        daskentCustomers.set(key, { firstName, lastName, phone: phone ? "+" + phone : null });
      }
    });
  }

  // 2. Sheet: Лист1 -> Pro U 10761 (Daşkənd), Pro 1245 & Deka (Səmərqənd)
  const ws1 = wb.getWorksheet("Лист1");
  if (ws1) {
    ws1.eachRow((row, r) => {
      if (r <= 2) return;
      const dName = row.getCell(2).value;
      const dPhone = cleanPhone(row.getCell(3).value);
      if (dName || dPhone) {
        const { firstName, lastName } = parseFullName(dName);
        if (!(firstName === "Müştəri" && !dPhone)) {
          const key = dPhone ? dPhone : `${firstName}_${lastName}`;
          if (!daskentCustomers.has(key)) {
            daskentCustomers.set(key, { firstName, lastName, phone: dPhone ? "+" + dPhone : null });
          }
        }
      }

      const sName1 = row.getCell(6).value;
      const sPhone1 = cleanPhone(row.getCell(7).value);
      if (sName1 || sPhone1) {
        const { firstName, lastName } = parseFullName(sName1);
        if (!(firstName === "Müştəri" && !sPhone1)) {
          const key = sPhone1 ? sPhone1 : `${firstName}_${lastName}`;
          if (!semerqendCustomers.has(key)) {
            semerqendCustomers.set(key, { firstName, lastName, phone: sPhone1 ? "+" + sPhone1 : null });
          }
        }
      }

      const sName2 = row.getCell(10).value;
      const sPhone2 = cleanPhone(row.getCell(11).value);
      if (sName2 || sPhone2) {
        const { firstName, lastName } = parseFullName(sName2);
        if (!(firstName === "Müştəri" && !sPhone2)) {
          const key = sPhone2 ? sPhone2 : `${firstName}_${lastName}`;
          if (!semerqendCustomers.has(key)) {
            semerqendCustomers.set(key, { firstName, lastName, phone: sPhone2 ? "+" + sPhone2 : null });
          }
        }
      }
    });
  }

  // 3. Sheet: 1245 Pro -> Səmərqənd Pro
  const ws1245 = wb.getWorksheet("1245 Pro");
  if (ws1245) {
    ws1245.eachRow((row, r) => {
      if (r <= 3) return;
      const nameRaw = row.getCell(3).value;
      const phoneRaw = row.getCell(4).value;
      const phone = cleanPhone(phoneRaw);
      const { firstName, lastName } = parseFullName(nameRaw);
      if (firstName === "Müştəri" && !phone) return;
      const key = phone ? phone : `${firstName}_${lastName}`;
      if (!semerqendCustomers.has(key)) {
        semerqendCustomers.set(key, { firstName, lastName, phone: phone ? "+" + phone : null });
      }
    });
  }

  let sql = `-- ==========================================================\n`;
  sql += `-- Auto-generated Import Script for Daşkənd Pro & Səmərqənd Pro\n`;
  sql += `-- ==========================================================\n\n`;
  sql += `-- Ensure Branches Exist and Import Customers\n`;
  sql += `DO $$\n`;
  sql += `DECLARE\n`;
  sql += `  v_daskent_id UUID;\n`;
  sql += `  v_semerqend_id UUID;\n`;
  sql += `BEGIN\n`;
  // Find or create Daşkənd Pro branch
  sql += `  SELECT branch_id INTO v_daskent_id FROM branch_translations WHERE name ILIKE '%Daşkənd%' OR name ILIKE '%Daskent%' LIMIT 1;\n`;
  sql += `  IF v_daskent_id IS NULL THEN\n`;
  sql += `    v_daskent_id := gen_random_uuid();\n`;
  sql += `    INSERT INTO branches (id, created_at) VALUES (v_daskent_id, NOW());\n`;
  sql += `    INSERT INTO branch_translations (branch_id, locale, name, address) VALUES\n`;
  sql += `      (v_daskent_id, 'az', 'Daşkənd Pro', 'Daşkənd'),\n`;
  sql += `      (v_daskent_id, 'en', 'Daşkənd Pro', 'Daşkənd'),\n`;
  sql += `      (v_daskent_id, 'ru', 'Daşkənd Pro', 'Daşkənd');\n`;
  sql += `  END IF;\n\n`;

  // Find or create Səmərqənd Pro branch
  sql += `  SELECT branch_id INTO v_semerqend_id FROM branch_translations WHERE name ILIKE '%Səmərqənd%' OR name ILIKE '%Semerqend%' LIMIT 1;\n`;
  sql += `  IF v_semerqend_id IS NULL THEN\n`;
  sql += `    v_semerqend_id := gen_random_uuid();\n`;
  sql += `    INSERT INTO branches (id, created_at) VALUES (v_semerqend_id, NOW());\n`;
  sql += `    INSERT INTO branch_translations (branch_id, locale, name, address) VALUES\n`;
  sql += `      (v_semerqend_id, 'az', 'Səmərqənd Pro', 'Səmərqənd'),\n`;
  sql += `      (v_semerqend_id, 'en', 'Səmərqənd Pro', 'Səmərqənd'),\n`;
  sql += `      (v_semerqend_id, 'ru', 'Səmərqənd Pro', 'Səmərqənd');\n`;
  sql += `  END IF;\n\n`;

  sql += `  -- Create temp table to hold raw import data\n`;
  sql += `  CREATE TEMP TABLE temp_import_customers (\n`;
  sql += `    branch_type TEXT,\n`;
  sql += `    first_name TEXT,\n`;
  sql += `    last_name TEXT,\n`;
  sql += `    phone TEXT\n`;
  sql += `  ) ON COMMIT DROP;\n\n`;

  const allRows = [];
  for (const c of daskentCustomers.values()) {
    allRows.push(`('DASKENT', ${escapeSql(c.firstName)}, ${escapeSql(c.lastName)}, ${escapeSql(c.phone)})`);
  }
  for (const c of semerqendCustomers.values()) {
    allRows.push(`('SEMERQEND', ${escapeSql(c.firstName)}, ${escapeSql(c.lastName)}, ${escapeSql(c.phone)})`);
  }

  const batchSize = 300;
  for (let i = 0; i < allRows.length; i += batchSize) {
    const chunk = allRows.slice(i, i + batchSize);
    sql += `  INSERT INTO temp_import_customers (branch_type, first_name, last_name, phone) VALUES\n  ` + chunk.join(',\n  ') + `;\n\n`;
  }

  sql += `  -- Insert Daşkənd customers avoiding duplicates\n`;
  sql += `  INSERT INTO customers (id, first_name, last_name, phone, branch_id, registered_at)\n`;
  sql += `  SELECT gen_random_uuid(), t.first_name, t.last_name, t.phone, v_daskent_id, NOW()\n`;
  sql += `  FROM temp_import_customers t\n`;
  sql += `  WHERE t.branch_type = 'DASKENT'\n`;
  sql += `    AND NOT EXISTS (\n`;
  sql += `      SELECT 1 FROM customers c\n`;
  sql += `      WHERE c.branch_id = v_daskent_id\n`;
  sql += `        AND (\n`;
  sql += `          (t.phone IS NOT NULL AND c.phone = t.phone)\n`;
  sql += `          OR (t.phone IS NULL AND c.first_name = t.first_name AND c.last_name = t.last_name)\n`;
  sql += `        )\n`;
  sql += `    );\n\n`;

  sql += `  -- Insert Səmərqənd customers avoiding duplicates\n`;
  sql += `  INSERT INTO customers (id, first_name, last_name, phone, branch_id, registered_at)\n`;
  sql += `  SELECT gen_random_uuid(), t.first_name, t.last_name, t.phone, v_semerqend_id, NOW()\n`;
  sql += `  FROM temp_import_customers t\n`;
  sql += `  WHERE t.branch_type = 'SEMERQEND'\n`;
  sql += `    AND NOT EXISTS (\n`;
  sql += `      SELECT 1 FROM customers c\n`;
  sql += `      WHERE c.branch_id = v_semerqend_id\n`;
  sql += `        AND (\n`;
  sql += `          (t.phone IS NOT NULL AND c.phone = t.phone)\n`;
  sql += `          OR (t.phone IS NULL AND c.first_name = t.first_name AND c.last_name = t.last_name)\n`;
  sql += `        )\n`;
  sql += `    );\n\n`;

  sql += `END $$;\n`;

  const outputPath = path.resolve(__dirname, "import_customers.sql");
  fs.writeFileSync(outputPath, sql);
  console.log(`Generated SQL file at ${outputPath}`);
  console.log(`Daşkənd count: ${daskentCustomers.size}`);
  console.log(`Səmərqənd count: ${semerqendCustomers.size}`);
  console.log(`Total count: ${daskentCustomers.size + semerqendCustomers.size}`);
}

main().catch(console.error);
