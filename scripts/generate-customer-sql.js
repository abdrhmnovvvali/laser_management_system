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

  function trackCustomer(map, key, data) {
    if (!map.has(key)) {
      map.set(key, { ...data, visitCount: 1 });
    } else {
      const existing = map.get(key);
      existing.visitCount += 1;
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

  // 1. Sheet: 10761 -> Daşkənd (Doctor laser - Candela Pro U)
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
      trackCustomer(daskentCustomers, key, {
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
          trackCustomer(daskentCustomers, key, {
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
          trackCustomer(semerqendCustomers, key, {
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
          trackCustomer(semerqendCustomers, key, {
            firstName,
            lastName,
            phone: sPhone2 ? "+" + sPhone2 : null,
            registeredAt: sDate2,
          });
        }
      }
    });
  }

  // 3. Sheet: 1245 Pro -> Səmərqənd (Laser N1 - Candela Pro U)
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
      trackCustomer(semerqendCustomers, key, {
        firstName,
        lastName,
        phone: phone ? "+" + phone : null,
        registeredAt,
      });
    });
  }

  let sql = `-- ==========================================================\n`;
  sql += `-- Auto-generated Import Script for Customers with Visit Counts\n`;
  sql += `-- ==========================================================\n\n`;

  sql += `DO $$\n`;
  sql += `DECLARE\n`;
  sql += `  v_daskent_id UUID;\n`;
  sql += `  v_semerqend_id UUID;\n`;
  sql += `  v_candela_daskent_id UUID;\n`;
  sql += `  v_candela_semerqend_id UUID;\n`;
  sql += `BEGIN\n`;
  // 1. Branches & Devices
  sql += `  -- 1. Ensure Branches & Devices\n`;
  sql += `  SELECT branch_id INTO v_daskent_id FROM branch_translations WHERE name ILIKE '%Daşkənd%' OR name ILIKE '%Daskent%' OR name ILIKE '%Doctor laser%' LIMIT 1;\n`;
  sql += `  IF v_daskent_id IS NULL THEN\n`;
  sql += `    v_daskent_id := gen_random_uuid();\n`;
  sql += `    INSERT INTO branches (id, created_at) VALUES (v_daskent_id, NOW());\n`;
  sql += `    INSERT INTO branch_translations (branch_id, locale, name, address) VALUES\n`;
  sql += `      (v_daskent_id, 'az', 'Doctor laser', 'Дархан, Ниёзбек Йули 8'),\n`;
  sql += `      (v_daskent_id, 'en', 'Doctor laser', 'Darkhan, Niyozbek Yuli 8'),\n`;
  sql += `      (v_daskent_id, 'ru', 'Doctor laser', 'Дархан, Ниёзбек Йули 8');\n`;
  sql += `  END IF;\n\n`;

  sql += `  SELECT branch_id INTO v_semerqend_id FROM branch_translations WHERE name ILIKE '%Səmərqənd%' OR name ILIKE '%Semerqend%' OR name ILIKE '%Laser N1%' LIMIT 1;\n`;
  sql += `  IF v_semerqend_id IS NULL THEN\n`;
  sql += `    v_semerqend_id := gen_random_uuid();\n`;
  sql += `    INSERT INTO branches (id, created_at) VALUES (v_semerqend_id, NOW());\n`;
  sql += `    INSERT INTO branch_translations (branch_id, locale, name, address) VALUES\n`;
  sql += `      (v_semerqend_id, 'az', 'Laser N1', 'Гагарина, дом 81'),\n`;
  sql += `      (v_semerqend_id, 'en', 'Laser N1', 'Gagarina, house 81'),\n`;
  sql += `      (v_semerqend_id, 'ru', 'Laser N1', 'Гагарина, дом 81');\n`;
  sql += `  END IF;\n\n`;

  sql += `  SELECT d.id INTO v_candela_daskent_id FROM devices d JOIN device_translations dt ON dt.device_id = d.id WHERE d.branch_id = v_daskent_id AND dt.type ILIKE '%Candela%' LIMIT 1;\n`;
  sql += `  IF v_candela_daskent_id IS NULL THEN\n`;
  sql += `    SELECT id INTO v_candela_daskent_id FROM devices WHERE branch_id = v_daskent_id LIMIT 1;\n`;
  sql += `    IF v_candela_daskent_id IS NULL THEN\n`;
  sql += `      v_candela_daskent_id := gen_random_uuid();\n`;
  sql += `      INSERT INTO devices (id, branch_id, shot_counter, created_at) VALUES (v_candela_daskent_id, v_daskent_id, 0, NOW());\n`;
  sql += `      INSERT INTO device_translations (device_id, locale, type) VALUES\n`;
  sql += `        (v_candela_daskent_id, 'az', 'Candela Pro U'),\n`;
  sql += `        (v_candela_daskent_id, 'en', 'Candela Pro U'),\n`;
  sql += `        (v_candela_daskent_id, 'ru', 'Candela Pro U');\n`;
  sql += `    END IF;\n`;
  sql += `  END IF;\n\n`;

  sql += `  SELECT d.id INTO v_candela_semerqend_id FROM devices d JOIN device_translations dt ON dt.device_id = d.id WHERE d.branch_id = v_semerqend_id AND dt.type ILIKE '%Candela%' LIMIT 1;\n`;
  sql += `  IF v_candela_semerqend_id IS NULL THEN\n`;
  sql += `    SELECT id INTO v_candela_semerqend_id FROM devices WHERE branch_id = v_semerqend_id LIMIT 1;\n`;
  sql += `    IF v_candela_semerqend_id IS NULL THEN\n`;
  sql += `      v_candela_semerqend_id := gen_random_uuid();\n`;
  sql += `      INSERT INTO devices (id, branch_id, shot_counter, created_at) VALUES (v_candela_semerqend_id, v_semerqend_id, 0, NOW());\n`;
  sql += `      INSERT INTO device_translations (device_id, locale, type) VALUES\n`;
  sql += `        (v_candela_semerqend_id, 'az', 'Candela Pro U'),\n`;
  sql += `        (v_candela_semerqend_id, 'en', 'Candela Pro U'),\n`;
  sql += `        (v_candela_semerqend_id, 'ru', 'Candela Pro U');\n`;
  sql += `    END IF;\n`;
  sql += `  END IF;\n\n`;

  // 2. Customers Temp Table
  sql += `  -- 2. Create Temp Table for Customers with Visit Counts\n`;
  sql += `  CREATE TEMP TABLE temp_import_customers (\n`;
  sql += `    branch_type TEXT,\n`;
  sql += `    first_name TEXT,\n`;
  sql += `    last_name TEXT,\n`;
  sql += `    phone TEXT,\n`;
  sql += `    registered_at TIMESTAMPTZ,\n`;
  sql += `    visit_count INTEGER\n`;
  sql += `  ) ON COMMIT DROP;\n\n`;

  const customerRows = [];
  for (const c of daskentCustomers.values()) {
    const regDateSql = c.registeredAt ? `'${c.registeredAt}'::timestamptz` : 'NOW()';
    customerRows.push(`('DASKENT', ${escapeSql(c.firstName)}, ${escapeSql(c.lastName)}, ${escapeSql(c.phone)}, ${regDateSql}, ${c.visitCount || 1})`);
  }
  for (const c of semerqendCustomers.values()) {
    const regDateSql = c.registeredAt ? `'${c.registeredAt}'::timestamptz` : 'NOW()';
    customerRows.push(`('SEMERQEND', ${escapeSql(c.firstName)}, ${escapeSql(c.lastName)}, ${escapeSql(c.phone)}, ${regDateSql}, ${c.visitCount || 1})`);
  }

  const batchSize = 300;
  for (let i = 0; i < customerRows.length; i += batchSize) {
    const chunk = customerRows.slice(i, i + batchSize);
    sql += `  INSERT INTO temp_import_customers (branch_type, first_name, last_name, phone, registered_at, visit_count) VALUES\n  ` + chunk.join(',\n  ') + `;\n\n`;
  }

  sql += `  -- Insert new Daşkənd customers\n`;
  sql += `  INSERT INTO customers (id, first_name, last_name, phone, branch_id, registered_at, visit_count)\n`;
  sql += `  SELECT gen_random_uuid(), t.first_name, t.last_name, t.phone, v_daskent_id, t.registered_at, t.visit_count\n`;
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

  sql += `  -- Insert new Səmərqənd customers\n`;
  sql += `  INSERT INTO customers (id, first_name, last_name, phone, branch_id, registered_at, visit_count)\n`;
  sql += `  SELECT gen_random_uuid(), t.first_name, t.last_name, t.phone, v_semerqend_id, t.registered_at, t.visit_count\n`;
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

  sql += `  -- Update existing customers' visit_count and registered_at\n`;
  sql += `  UPDATE customers c\n`;
  sql += `  SET visit_count = t.visit_count,\n`;
  sql += `      registered_at = LEAST(c.registered_at, t.registered_at)\n`;
  sql += `  FROM temp_import_customers t\n`;
  sql += `  WHERE c.branch_id = (CASE WHEN t.branch_type = 'DASKENT' THEN v_daskent_id ELSE v_semerqend_id END)\n`;
  sql += `    AND (\n`;
  sql += `      (t.phone IS NOT NULL AND c.phone = t.phone)\n`;
  sql += `      OR (t.phone IS NULL AND c.first_name = t.first_name AND c.last_name = t.last_name)\n`;
  sql += `    );\n\n`;

  sql += `END $$;\n`;

  const outputPath = path.resolve(__dirname, "import_customers.sql");
  fs.writeFileSync(outputPath, sql);
  console.log(`Generated SQL file at ${outputPath}`);
  console.log(`Daşkənd customers: ${daskentCustomers.size}`);
  console.log(`Səmərqənd customers: ${semerqendCustomers.size}`);
  console.log(`Total customers: ${daskentCustomers.size + semerqendCustomers.size}`);
}

main().catch(console.error);
