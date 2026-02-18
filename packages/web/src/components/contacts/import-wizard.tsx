"use client";

import { useCallback, useState } from "react";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
} from "lucide-react";
import {
  parseCsv,
  autoMapHeaders,
  validateImportRows,
  CONTACT_CSV_COLUMNS,
  type ContactCsvColumn,
  type CsvParseResult,
  type ImportValidationResult,
} from "@relay/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type WizardStep = "upload" | "mapping" | "preview" | "importing" | "complete";

interface ImportResult {
  imported: number;
  skipped: number;
  failed: number;
  total: number;
  errors: { email: string; error: string }[];
}

export function ImportWizard({
  open,
  onOpenChange,
  onComplete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}) {
  const [step, setStep] = useState<WizardStep>("upload");
  const [csvData, setCsvData] = useState<CsvParseResult | null>(null);
  const [mapping, setMapping] = useState<Record<string, ContactCsvColumn | null>>({});
  const [validation, setValidation] = useState<ImportValidationResult | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function reset() {
    setStep("upload");
    setCsvData(null);
    setMapping({});
    setValidation(null);
    setResult(null);
  }

  function handleClose() {
    reset();
    onOpenChange(false);
  }

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCsv(text);
      setCsvData(parsed);
      setMapping(autoMapHeaders(parsed.headers));
      setStep("mapping");
    };
    reader.readAsText(file);
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".csv") || file.type === "text/csv")) {
      handleFile(file);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleMappingChange(csvHeader: string, field: ContactCsvColumn | "") {
    setMapping((prev) => ({
      ...prev,
      [csvHeader]: field === "" ? null : field,
    }));
  }

  function handleValidateAndPreview() {
    if (!csvData) return;
    const result = validateImportRows(csvData.rows, mapping);
    setValidation(result);
    setStep("preview");
  }

  async function handleImport() {
    if (!validation) return;
    setStep("importing");

    try {
      const res = await fetch("/api/contacts/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contacts: validation.valid.map((r) => r.data),
          skipDuplicates,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setResult(json.data as ImportResult);
        setStep("complete");
      }
    } catch {
      setStep("preview");
    }
  }

  function handleDone() {
    handleClose();
    onComplete();
  }

  // Check if mapping has required fields
  const mappedFields = new Set(Object.values(mapping).filter(Boolean));
  const hasRequiredFields =
    mappedFields.has("firstName") && mappedFields.has("lastName") && mappedFields.has("email");

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Contacts</DialogTitle>
          <DialogDescription>
            {step === "upload" && "Upload a CSV file to import contacts"}
            {step === "mapping" && "Map CSV columns to contact fields"}
            {step === "preview" && "Review and confirm the import"}
            {step === "importing" && "Importing contacts..."}
            {step === "complete" && "Import complete"}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
          {(["upload", "mapping", "preview", "complete"] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <div className="h-px w-6 bg-gray-200" />}
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                  step === s || (step === "importing" && s === "preview")
                    ? "bg-gray-900 text-white"
                    : step === "complete" ||
                        (s === "upload" && step !== "upload") ||
                        (s === "mapping" && (step === "preview" || step === "importing"))
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {i + 1}
              </div>
              <span className="text-xs capitalize text-gray-500">{s}</span>
            </div>
          ))}
        </div>

        {/* Upload step */}
        {step === "upload" && (
          <div
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
              dragOver ? "border-gray-900 bg-gray-50" : "border-gray-200"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <Upload className="mb-3 h-10 w-10 text-gray-400" />
            <p className="mb-1 text-sm font-medium text-gray-700">
              Drop a CSV file here or click to browse
            </p>
            <p className="mb-4 text-xs text-gray-400">
              CSV with headers: First Name, Last Name, Email, Phone, Title, Status, Company
            </p>
            <label>
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleFileInput}
              />
              <Button variant="outline" size="sm" asChild>
                <span>Choose File</span>
              </Button>
            </label>
          </div>
        )}

        {/* Mapping step */}
        {step === "mapping" && csvData && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {csvData.rows.length} rows found with {csvData.headers.length} columns
              </span>
            </div>

            <div className="max-h-64 space-y-2 overflow-y-auto">
              {csvData.headers.map((header) => (
                <div key={header} className="flex items-center gap-3">
                  <span className="w-40 truncate text-sm text-gray-700" title={header}>
                    {header}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-gray-300" />
                  <select
                    className="flex-1 rounded-md border border-gray-200 px-2 py-1.5 text-sm"
                    value={mapping[header] ?? ""}
                    onChange={(e) =>
                      handleMappingChange(header, e.target.value as ContactCsvColumn | "")
                    }
                  >
                    <option value="">— Skip this column —</option>
                    {CONTACT_CSV_COLUMNS.map((col) => (
                      <option
                        key={col}
                        value={col}
                        disabled={mapping[header] !== col && Object.values(mapping).includes(col)}
                      >
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {!hasRequiredFields && (
              <div className="flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Map at least firstName, lastName, and email to continue
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="ghost" size="sm" onClick={reset}>
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Back
              </Button>
              <Button size="sm" disabled={!hasRequiredFields} onClick={handleValidateAndPreview}>
                Preview Import
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Preview step */}
        {step === "preview" && validation && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-emerald-50 p-3 text-center">
                <p className="text-2xl font-bold text-emerald-700">{validation.valid.length}</p>
                <p className="text-xs text-emerald-600">Ready to import</p>
              </div>
              <div className="rounded-lg bg-red-50 p-3 text-center">
                <p className="text-2xl font-bold text-red-700">{validation.errors.length}</p>
                <p className="text-xs text-red-600">Errors</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3 text-center">
                <p className="text-2xl font-bold text-amber-700">
                  {validation.duplicateEmails.length}
                </p>
                <p className="text-xs text-amber-600">Duplicates in file</p>
              </div>
            </div>

            {validation.errors.length > 0 && (
              <div className="max-h-32 overflow-y-auto rounded-md border border-red-100 bg-red-50/50 p-3">
                <p className="mb-1 text-xs font-medium text-red-700">Errors (showing first 10):</p>
                {validation.errors.slice(0, 10).map((err, i) => (
                  <p key={i} className="text-xs text-red-600">
                    Row {err.rowIndex}: {err.field} — {err.message}
                  </p>
                ))}
              </div>
            )}

            {/* Preview table */}
            {validation.valid.length > 0 && (
              <div className="max-h-40 overflow-auto rounded-md border border-gray-200">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr>
                      <th className="px-2 py-1.5 text-left font-medium text-gray-500">Name</th>
                      <th className="px-2 py-1.5 text-left font-medium text-gray-500">Email</th>
                      <th className="px-2 py-1.5 text-left font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validation.valid.slice(0, 10).map((row) => (
                      <tr key={row.rowIndex} className="border-t border-gray-100">
                        <td className="px-2 py-1.5 text-gray-700">
                          {row.data.firstName} {row.data.lastName}
                        </td>
                        <td className="px-2 py-1.5 text-gray-500">{row.data.email}</td>
                        <td className="px-2 py-1.5 text-gray-500">{row.data.status ?? "LEAD"}</td>
                      </tr>
                    ))}
                    {validation.valid.length > 10 && (
                      <tr className="border-t border-gray-100">
                        <td colSpan={3} className="px-2 py-1.5 text-center text-gray-400">
                          ...and {validation.valid.length - 10} more
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={skipDuplicates}
                onChange={(e) => setSkipDuplicates(e.target.checked)}
                className="rounded border-gray-300"
              />
              Skip contacts with emails that already exist
            </label>

            <div className="flex justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep("mapping")}>
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Back
              </Button>
              <Button
                size="sm"
                disabled={validation.valid.length === 0}
                onClick={() => void handleImport()}
              >
                Import {validation.valid.length} Contact{validation.valid.length !== 1 ? "s" : ""}
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Importing step */}
        {step === "importing" && (
          <div className="flex flex-col items-center py-8">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
            <p className="text-sm text-gray-600">Importing contacts...</p>
          </div>
        )}

        {/* Complete step */}
        {step === "complete" && result && (
          <div className="space-y-4">
            <div className="flex flex-col items-center py-4">
              <CheckCircle2 className="mb-3 h-12 w-12 text-emerald-500" />
              <p className="text-lg font-semibold text-gray-900">Import Complete</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-emerald-50 p-3 text-center">
                <p className="text-2xl font-bold text-emerald-700">{result.imported}</p>
                <p className="text-xs text-emerald-600">Imported</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-2xl font-bold text-gray-700">{result.skipped}</p>
                <p className="text-xs text-gray-600">Skipped</p>
              </div>
              <div className="rounded-lg bg-red-50 p-3 text-center">
                <p className="text-2xl font-bold text-red-700">{result.failed}</p>
                <p className="text-xs text-red-600">Failed</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="max-h-24 overflow-y-auto rounded-md border border-red-100 bg-red-50/50 p-3">
                {result.errors.map((err, i) => (
                  <p key={i} className="text-xs text-red-600">
                    {err.email}: {err.error}
                  </p>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <Button size="sm" onClick={handleDone}>
                Done
                <X className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
