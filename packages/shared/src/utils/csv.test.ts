import { describe, expect, it } from "vitest";
import {
  parseCsv,
  generateCsv,
  autoMapHeaders,
  validateImportRows,
} from "./csv";

describe("parseCsv", () => {
  it("parses a simple CSV", () => {
    const csv = "name,email\nAlice,alice@test.com\nBob,bob@test.com";
    const result = parseCsv(csv);
    expect(result.headers).toEqual(["name", "email"]);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual({ name: "Alice", email: "alice@test.com" });
    expect(result.rows[1]).toEqual({ name: "Bob", email: "bob@test.com" });
  });

  it("handles quoted fields with commas", () => {
    const csv = 'name,title\n"Doe, John","VP, Sales"';
    const result = parseCsv(csv);
    expect(result.rows[0]).toEqual({ name: "Doe, John", title: "VP, Sales" });
  });

  it("handles escaped quotes inside quoted fields", () => {
    const csv = 'name,note\nAlice,"She said ""hello"""';
    const result = parseCsv(csv);
    expect(result.rows[0]!.note).toBe('She said "hello"');
  });

  it("handles CRLF line endings", () => {
    const csv = "name,email\r\nAlice,alice@test.com\r\nBob,bob@test.com";
    const result = parseCsv(csv);
    expect(result.rows).toHaveLength(2);
  });

  it("skips blank rows", () => {
    const csv = "name,email\nAlice,alice@test.com\n\nBob,bob@test.com\n";
    const result = parseCsv(csv);
    expect(result.rows).toHaveLength(2);
  });

  it("returns empty result for empty input", () => {
    const result = parseCsv("");
    expect(result.headers).toEqual([]);
    expect(result.rows).toEqual([]);
  });

  it("handles rows with fewer columns than headers", () => {
    const csv = "a,b,c\n1,2";
    const result = parseCsv(csv);
    expect(result.rows[0]).toEqual({ a: "1", b: "2", c: "" });
  });
});

describe("generateCsv", () => {
  it("generates CSV from data array", () => {
    const data = [
      { name: "Alice", email: "alice@test.com" },
      { name: "Bob", email: "bob@test.com" },
    ];
    const csv = generateCsv(data, ["name", "email"]);
    expect(csv).toBe("name,email\nAlice,alice@test.com\nBob,bob@test.com");
  });

  it("escapes fields with commas", () => {
    const data = [{ name: "Doe, John", email: "john@test.com" }];
    const csv = generateCsv(data, ["name", "email"]);
    expect(csv).toBe('name,email\n"Doe, John",john@test.com');
  });

  it("escapes fields with quotes", () => {
    const data = [{ note: 'She said "hi"', email: "a@b.com" }];
    const csv = generateCsv(data, ["note", "email"]);
    expect(csv).toContain('"She said ""hi"""');
  });

  it("handles null and undefined values", () => {
    const data = [{ name: "Alice", phone: null, title: undefined }];
    const csv = generateCsv(data, ["name", "phone", "title"]);
    expect(csv).toBe("name,phone,title\nAlice,,");
  });
});

describe("autoMapHeaders", () => {
  it("maps common header variations to contact fields", () => {
    const headers = ["First Name", "Last Name", "Email Address", "Phone Number", "Job Title"];
    const mapping = autoMapHeaders(headers);
    expect(mapping["First Name"]).toBe("firstName");
    expect(mapping["Last Name"]).toBe("lastName");
    expect(mapping["Email Address"]).toBe("email");
    expect(mapping["Phone Number"]).toBe("phone");
    expect(mapping["Job Title"]).toBe("title");
  });

  it("returns null for unrecognized headers", () => {
    const headers = ["firstName", "Random Column", "email"];
    const mapping = autoMapHeaders(headers);
    expect(mapping["firstName"]).toBe("firstName");
    expect(mapping["Random Column"]).toBeNull();
    expect(mapping["email"]).toBe("email");
  });

  it("prevents duplicate field mappings", () => {
    const headers = ["First Name", "firstname"];
    const mapping = autoMapHeaders(headers);
    expect(mapping["First Name"]).toBe("firstName");
    expect(mapping["firstname"]).toBeNull();
  });

  it("is case-insensitive", () => {
    const headers = ["EMAIL", "FIRST NAME", "PHONE"];
    const mapping = autoMapHeaders(headers);
    expect(mapping["EMAIL"]).toBe("email");
    expect(mapping["FIRST NAME"]).toBe("firstName");
    expect(mapping["PHONE"]).toBe("phone");
  });
});

describe("validateImportRows", () => {
  const defaultMapping: Record<string, string> = {
    "First Name": "firstName",
    "Last Name": "lastName",
    Email: "email",
    Phone: "phone",
    Status: "status",
  };

  it("validates valid rows", () => {
    const rows = [
      { "First Name": "Alice", "Last Name": "Smith", Email: "alice@test.com", Phone: "555-1234", Status: "" },
    ];
    const result = validateImportRows(rows, defaultMapping);
    expect(result.valid).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
    expect(result.valid[0]!.data.firstName).toBe("Alice");
    expect(result.valid[0]!.data.email).toBe("alice@test.com");
  });

  it("rejects rows missing required fields", () => {
    const rows = [{ "First Name": "", "Last Name": "Smith", Email: "alice@test.com", Phone: "", Status: "" }];
    const result = validateImportRows(rows, defaultMapping);
    expect(result.valid).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]!.field).toBe("firstName");
  });

  it("rejects invalid email formats", () => {
    const rows = [{ "First Name": "Alice", "Last Name": "Smith", Email: "not-an-email", Phone: "", Status: "" }];
    const result = validateImportRows(rows, defaultMapping);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]!.field).toBe("email");
  });

  it("detects duplicate emails within the import", () => {
    const rows = [
      { "First Name": "Alice", "Last Name": "Smith", Email: "alice@test.com", Phone: "", Status: "" },
      { "First Name": "Alice2", "Last Name": "Smith2", Email: "alice@test.com", Phone: "", Status: "" },
    ];
    const result = validateImportRows(rows, defaultMapping);
    expect(result.valid).toHaveLength(1);
    expect(result.duplicateEmails).toContain("alice@test.com");
  });

  it("validates status field values", () => {
    const rows = [
      { "First Name": "Alice", "Last Name": "Smith", Email: "alice@test.com", Phone: "", Status: "INVALID" },
    ];
    const result = validateImportRows(rows, defaultMapping);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]!.field).toBe("status");
  });

  it("accepts valid status values case-insensitively", () => {
    const rows = [
      { "First Name": "Alice", "Last Name": "Smith", Email: "alice@test.com", Phone: "", Status: "lead" },
    ];
    const result = validateImportRows(rows, defaultMapping);
    expect(result.valid).toHaveLength(1);
    expect(result.valid[0]!.data.status).toBe("LEAD");
  });

  it("handles unmapped columns gracefully", () => {
    const rows = [
      {
        "First Name": "Alice",
        "Last Name": "Smith",
        Email: "alice@test.com",
        Phone: "",
        Status: "",
        "Random": "data",
      },
    ];
    const mapping = { ...defaultMapping, Random: null };
    const result = validateImportRows(rows, mapping as Record<string, string | null>);
    expect(result.valid).toHaveLength(1);
  });
});
