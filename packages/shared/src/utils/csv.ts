/**
 * CSV parsing and generation utilities for contact import/export.
 */

export interface CsvParseResult {
  headers: string[];
  rows: Record<string, string>[];
  rawRows: string[][];
}

/**
 * Parse a CSV string into structured data.
 * Handles quoted fields, commas inside quotes, and newlines inside quotes.
 */
export function parseCsv(input: string): CsvParseResult {
  const lines = splitCsvLines(input.trim());
  if (lines.length === 0) {
    return { headers: [], rows: [], rawRows: [] };
  }

  const headers = parseCsvRow(lines[0]!).map((h) => h.trim());
  const rawRows: string[][] = [];
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvRow(lines[i]!);
    if (values.length === 0 || (values.length === 1 && values[0]!.trim() === "")) {
      continue;
    }
    rawRows.push(values);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]!] = (values[j] ?? "").trim();
    }
    rows.push(row);
  }

  return { headers, rows, rawRows };
}

function splitCsvLines(input: string): string[] {
  const lines: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i]!;
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && input[i + 1] === "\n") {
        i++;
      }
      if (current.trim() !== "") {
        lines.push(current);
      }
      current = "";
    } else {
      current += char;
    }
  }

  if (current.trim() !== "") {
    lines.push(current);
  }

  return lines;
}

function parseCsvRow(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i]!;
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

/**
 * Generate a CSV string from an array of objects.
 */
export function generateCsv(
  data: Record<string, string | number | boolean | null | undefined>[],
  columns: string[],
): string {
  const header = columns.map(escapeCsvField).join(",");
  const rows = data.map((row) => columns.map((col) => escapeCsvField(String(row[col] ?? ""))).join(","));
  return [header, ...rows].join("\n");
}

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Standard contact CSV headers that map to our schema fields */
export const CONTACT_CSV_COLUMNS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "title",
  "status",
  "company",
] as const;

export type ContactCsvColumn = (typeof CONTACT_CSV_COLUMNS)[number];

/** Common header aliases for auto-mapping */
export const HEADER_ALIASES: Record<string, ContactCsvColumn> = {
  "first name": "firstName",
  "first_name": "firstName",
  firstname: "firstName",
  first: "firstName",
  "last name": "lastName",
  "last_name": "lastName",
  lastname: "lastName",
  last: "lastName",
  "email address": "email",
  "e-mail": "email",
  email: "email",
  phone: "phone",
  "phone number": "phone",
  telephone: "phone",
  mobile: "phone",
  title: "title",
  "job title": "title",
  position: "title",
  role: "title",
  status: "status",
  company: "company",
  "company name": "company",
  organization: "company",
  org: "company",
};

/**
 * Auto-map CSV headers to contact fields using aliases.
 * Returns a mapping of CSV header -> ContactCsvColumn | null
 */
export function autoMapHeaders(csvHeaders: string[]): Record<string, ContactCsvColumn | null> {
  const mapping: Record<string, ContactCsvColumn | null> = {};
  const used = new Set<ContactCsvColumn>();

  for (const header of csvHeaders) {
    const normalized = header.toLowerCase().trim();
    const match = HEADER_ALIASES[normalized];
    if (match && !used.has(match)) {
      mapping[header] = match;
      used.add(match);
    } else {
      mapping[header] = null;
    }
  }

  return mapping;
}

export interface ImportValidationResult {
  valid: ImportRow[];
  errors: ImportError[];
  duplicateEmails: string[];
}

export interface ImportRow {
  rowIndex: number;
  data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    title?: string;
    status?: string;
    company?: string;
  };
}

export interface ImportError {
  rowIndex: number;
  field: string;
  message: string;
}

/**
 * Validate parsed CSV rows against contact schema requirements.
 */
export function validateImportRows(
  rows: Record<string, string>[],
  mapping: Record<string, ContactCsvColumn | null>,
): ImportValidationResult {
  const valid: ImportRow[] = [];
  const errors: ImportError[] = [];
  const seenEmails = new Set<string>();
  const duplicateEmails: string[] = [];

  const VALID_STATUSES = ["LEAD", "PROSPECT", "CUSTOMER", "CHURNED", "ARCHIVED"];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const mapped: Record<string, string> = {};

    // Apply field mapping
    for (const [csvHeader, field] of Object.entries(mapping)) {
      if (field && row[csvHeader]) {
        mapped[field] = row[csvHeader]!;
      }
    }

    let hasError = false;

    // Required: firstName
    if (!mapped.firstName || mapped.firstName.trim() === "") {
      errors.push({ rowIndex: i + 2, field: "firstName", message: "First name is required" });
      hasError = true;
    }

    // Required: lastName
    if (!mapped.lastName || mapped.lastName.trim() === "") {
      errors.push({ rowIndex: i + 2, field: "lastName", message: "Last name is required" });
      hasError = true;
    }

    // Required: email with basic format check
    const email = mapped.email?.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      errors.push({ rowIndex: i + 2, field: "email", message: "Valid email is required" });
      hasError = true;
    } else if (seenEmails.has(email)) {
      duplicateEmails.push(email);
      errors.push({ rowIndex: i + 2, field: "email", message: `Duplicate email: ${email}` });
      hasError = true;
    } else {
      seenEmails.add(email);
    }

    // Optional: status validation
    if (mapped.status && !VALID_STATUSES.includes(mapped.status.toUpperCase())) {
      errors.push({
        rowIndex: i + 2,
        field: "status",
        message: `Invalid status: ${mapped.status}. Use: ${VALID_STATUSES.join(", ")}`,
      });
      hasError = true;
    }

    if (!hasError) {
      valid.push({
        rowIndex: i + 2,
        data: {
          firstName: mapped.firstName!.trim(),
          lastName: mapped.lastName!.trim(),
          email: email!,
          phone: mapped.phone?.trim() || undefined,
          title: mapped.title?.trim() || undefined,
          status: mapped.status?.toUpperCase() || undefined,
          company: mapped.company?.trim() || undefined,
        },
      });
    }
  }

  return { valid, errors, duplicateEmails };
}
