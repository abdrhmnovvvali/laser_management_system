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

function parseDate(raw) {
  if (!raw) return null;
  if (raw instanceof Date && !isNaN(raw.getTime())) {
    return raw.toISOString();
  }
  const str = String(raw).trim();
  if (!str || str === "-" || str === "null" || str === "undefined") return null;
  const d = new Date(str);
  if (!isNaN(d.getTime()) && d.getFullYear() > 2000 && d.getFullYear() < 2100) {
    return d.toISOString();
  }
  return null;
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

  function updateCustomer(map, key, data) {
    if (!map.has(key)) {
      map.set(key, data);
    } else {
      const existing = map.get(key);
      // Əgər köhnə tarixdən daha erkən tarix tapılarsa və ya köhnədə tarix yox idisə yeniləyirik
      if (data.registeredAt) {
        if (!existing.registeredAt || new Date(data.registeredAt) < new Date(existing.registeredAt)) {
          existing.registeredAt = data.registeredAt;
        }
      }
      if (existing.firstName === "Müştəri" && data.firstName !== "Müştəri") {
        existing.firstName = data.firstName;
        existing.lastName = data.lastName;
      }
    }
  }

  // 1. Sheet: 10761 -> Daşkənd (Doctor laser)
  const ws10761 = wb.getWorksheet("10761");
  if (ws10761) {
    ws10761.eachRow((row) => {
      const nameRaw = row.getCell(3).value;
      const phoneRaw = row.getCell(4).value;
      const dateRaw = row.getCell(7).value;
      const phone = cleanPhone(phoneRaw);
      const { firstName, lastName } = parseFullName(nameRaw);
      const registeredAt = parseDate(dateRaw);
      if (firstName === "Müştəri" && !phone) return;
      const key = phone ? phone : `${firstName}_${lastName}`;
      updateCustomer(daskentCustomers, key, {
        firstName,
        lastName,
        phone: phone ? "+" + phone : null,
        registeredAt,
      });
    });
  }

  // 2. Sheet: Лист1 -> Pro U 10761 (Daşkənd), Pro 1245 & Deka (Səmərqənd)
  const ws1 = wb.getWorksheet("Лист1");
  if (ws1) {
    ws1.eachRow((row, r) => {
      if (r <= 2) return;
      // Pro U 10761 -> Daşkənd
      const dName = row.getCell(2).value;
      const dPhone = cleanPhone(row.getCell(3).value);
      const dDate = parseDate(row.getCell(4).value);
      if (dName || dPhone) {
        const { firstName, lastName } = parseFullName(dName);
        if (!(firstName === "Müştəri" && !dPhone)) {
          const key = dPhone ? dPhone : `${firstName}_${lastName}`;
          updateCustomer(daskentCustomers, key, {
            firstName,
            lastName,
            phone: dPhone ? "+" + dPhone : null,
            registeredAt: dDate,
          });
        }
      }

      // Pro 1245 -> Səmərqənd
      const sName1 = row.getCell(6).value;
      const sPhone1 = cleanPhone(row.getCell(7).value);
      const sDate1 = parseDate(row.getCell(8).value);
      if (sName1 || sPhone1) {
        const { firstName, lastName } = parseFullName(sName1);
        if (!(firstName === "Müştəri" && !sPhone1)) {
          const key = sPhone1 ? sPhone1 : `${firstName}_${lastName}`;
          updateCustomer(semerqendCustomers, key, {
            firstName,
            lastName,
            phone: sPhone1 ? "+" + sPhone1 : null,
            registeredAt: sDate1,
          });
        }
      }

      // Deka -> Səmərqənd
      const sName2 = row.getCell(10).value;
      const sPhone2 = cleanPhone(row.getCell(11).value);
      const sDate2 = parseDate(row.getCell(12).value);
      if (sName2 || sPhone2) {
        const { firstName, lastName } = parseFullName(sName2);
        if (!(firstName === "Müştəri" && !sPhone2)) {
          const key = sPhone2 ? sPhone2 : `${firstName}_${lastName}`;
          updateCustomer(semerqendCustomers, key, {
            firstName,
            lastName,
            phone: sPhone2 ? "+" + sPhone2 : null,
            registeredAt: sDate2,
          });
        }
      }
    });
  }

  // 3. Sheet: 1245 Pro -> Səmərqənd (Laser N1)
  const ws1245 = wb.getWorksheet("1245 Pro");
  if (ws1245) {
    ws1245.eachRow((row, r) => {
      if (r <= 3) return;
      const nameRaw = row.getCell(3).value;
      const phoneRaw = row.getCell(4).value;
      const dateRaw = row.getCell(7).value;
      const phone = cleanPhone(phoneRaw);
      const { firstName, lastName } = parseFullName(nameRaw);
      const registeredAt = parseDate(dateRaw);
      if (firstName === "Müştəri" && !phone) return;
      const key = phone ? phone : `${firstName}_${lastName}`;
      updateCustomer(semerqendCustomers, key, {
        firstName,
        lastName,
        phone: phone ? "+" + phone : null,
        registeredAt,
      });
    });
  }

  let sql = `-- ==========================================================\n`;
  sql += `-- Auto-generated Import Script for Daşkənd & Səmərqənd with Original Registration Dates\n`;
  sql += `-- ==========================================================\n\n`;

  sql += `-- Ensure Branches Exist and Import Customers\n`;
  sql += `DO $$\n`;
  sql += `DECLARE\n`;
  sql += `  v_daskent_id UUID;\n`;
  sql += `  v_semerqend_id UUID;\n`;
  sql += `BEGIN\n`;
  // Find or create Daşkənd Pro / Doctor laser branch
  sql += `  SELECT branch_id INTO v_daskent_id FROM branch_translations WHERE name ILIKE '%Daşkənd%' OR name ILIKE '%Daskent%' OR name ILIKE '%Doctor laser%' LIMIT 1;\n`;
  sql += `  IF v_daskent_id IS NULL THEN\n`;
  sql += `    v_daskent_id := gen_random_uuid();\n`;
  sql += `    INSERT INTO branches (id, created_at) VALUES (v_daskent_id, NOW());\n`;
  sql += `    INSERT INTO branch_translations (branch_id, locale, name, address) VALUES\n`;
  sql += `      (v_daskent_id, 'az', 'Doctor laser', 'Дархан, Ниёзбек Йули 8'),\n`;
  sql += `      (v_daskent_id, 'en', 'Doctor laser', 'Darkhan, Niyozbek Yuli 8'),\n`;
  sql += `      (v_daskent_id, 'ru', 'Doctor laser', 'Дархан, Ниёзбек Йули 8');\n`;
  sql += `  END IF;\n\n`;

  // Find or create Səmərqənd Pro / Laser N1 branch
  sql += `  SELECT branch_id INTO v_semerqend_id FROM branch_translations WHERE name ILIKE '%Səmərqənd%' OR name ILIKE '%Semerqend%' OR name ILIKE '%Laser N1%' LIMIT 1;\n`;
  sql += `  IF v_semerqend_id IS NULL THEN\n`;
  sql += `    v_semerqend_id := gen_random_uuid();\n`;
  sql += `    INSERT INTO branches (id, created_at) VALUES (v_semerqend_id, NOW());\n`;
  sql += `    INSERT INTO branch_translations (branch_id, locale, name, address) VALUES\n`;
  sql += `      (v_semerqend_id, 'az', 'Laser N1', 'Гагарина, дом 81'),\n`;
  sql += `      (v_semerqend_id, 'en', 'Laser N1', 'Gagarina, house 81'),\n`;
  sql += `      (v_semerqend_id, 'ru', 'Laser N1', 'Гагарина, дом 81');\n`;
  sql += `  END IF;\n\n`;

  sql += `  -- Create temp table to hold raw import data with original date\n`;
  sql += `  CREATE TEMP TABLE temp_import_customers (\n`;
  sql += `    branch_type TEXT,\n`;
  sql += `    first_name TEXT,\n`;
  sql += `    last_name TEXT,\n`;
  sql += `    phone TEXT,\n`;
  sql += `    registered_at TIMESTAMPTZ\n`;
  sql += `  ) ON COMMIT DROP;\n\n`;

  const allRows = [];
  for (const c of daskentCustomers.values()) {
    const regDateSql = c.registeredAt ? `'${c.registeredAt}'::timestamptz` : 'NOW()';
    allRows.push(`('DASKENT', ${escapeSql(c.firstName)}, ${escapeSql(c.lastName)}, ${escapeSql(c.phone)}, ${regDateSql})`);
  }
  for (const c of semerqendCustomers.values()) {
    const regDateSql = c.registeredAt ? `'${c.registeredAt}'::timestamptz` : 'NOW()';
    allRows.push(`('SEMERQEND', ${escapeSql(c.firstName)}, ${escapeSql(c.lastName)}, ${escapeSql(c.phone)}, ${regDateSql})`);
  }

  const batchSize = 300;
  for (let i = 0; i < allRows.length; i += batchSize) {
    const chunk = allRows.slice(i, i + batchSize);
    sql += `  INSERT INTO temp_import_customers (branch_type, first_name, last_name, phone, registered_at) VALUES\n  ` + chunk.join(',\n  ') + `;\n\n`;
  }

  sql += `  -- Insert Daşkənd customers avoiding duplicates\n`;
  sql += `  INSERT INTO customers (id, first_name, last_name, phone, branch_id, registered_at)\n`;
  sql += `  SELECT gen_random_uuid(), t.first_name, t.last_name, t.phone, v_daskent_id, t.registered_at\n`;
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
  sql += `  SELECT gen_random_uuid(), t.first_name, t.last_name, t.phone, v_semerqend_id, t.registered_at\n`;
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
