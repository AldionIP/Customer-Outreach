import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { importCustomers, previewCustomerImport } from "../services/importCustomerApi";

function ImportCustomers() {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setPreview(null);
    setError("");
    setSuccess("");
  };

  const handlePreview = async () => {
    if (!selectedFile) {
      setError("Please choose a CSV or Excel file first.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await previewCustomerImport(selectedFile);
      setPreview(result);
    } catch (previewError) {
      console.error("Preview import failed:", previewError);
      setError(previewError?.response?.data?.message || "Failed to validate the file.");
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!preview || preview.validRows.length === 0) {
      setError("There are no valid rows to import.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const result = await importCustomers(preview.validRows);
      setSuccess(result.message || `${preview.validRows.length} customers imported.`);
      setPreview(null);
      setSelectedFile(null);

      const fileInput = document.getElementById("import-file");
      if (fileInput) fileInput.value = "";
    } catch (importError) {
      console.error("Import failed:", importError);
      setError(importError?.response?.data?.message || "Failed to import customers.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container content-stack">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="hud-label">
            <span className="status-dot" />
            Data Import Center
          </span>
          <h1 className="mt-4 text-3xl font-semibold text-slate-50">Import Customer Fleet</h1>
          <p className="mt-2 text-sm text-slate-300">Upload a CSV or Excel file to expand the customer pipeline.</p>
        </div>

        <button type="button" className="secondary-button" onClick={() => navigate("/customers")}>
          Back to Customers
        </button>
      </header>

      <div className="mx-auto w-full max-w-5xl panel p-6 sm:p-8">
        <div className="rounded-3xl border border-dashed border-cyan-400/30 bg-slate-950/60 p-8 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-cyan-300">Upload Module</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-50">Drop Excel file here</h2>
          <p className="mt-2 text-sm text-slate-300">Accepted formats: CSV, XLS, XLSX</p>

          <label htmlFor="import-file" className="primary-button mt-6 inline-flex cursor-pointer">
            Select File
          </label>
          <input id="import-file" type="file" accept=".csv,.xls,.xlsx" onChange={handleFileChange} className="hidden" />

          {selectedFile && (
            <p className="mt-4 text-sm text-slate-200">Selected file: {selectedFile.name}</p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" className="primary-button" onClick={handlePreview} disabled={!selectedFile || loading}>
            {loading ? "Validating..." : "Validate File"}
          </button>
        </div>

        {error && <div className="error-message mt-6">{error}</div>}
        {success && <div className="success-message mt-6">{success}</div>}

        {preview && (
          <div className="mt-8 rounded-3xl border border-slate-700/60 bg-slate-950/50 p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">Import Preview</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-50">{preview.validCount} valid rows • {preview.invalidCount} invalid rows</h3>
              </div>
            </div>

            {preview.invalidRows.length > 0 && (
              <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4">
                <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-300">Invalid rows</h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-200">
                  {preview.invalidRows.map((row) => (
                    <li key={row.rowNumber}>
                      Row {row.rowNumber}: {row.errors.join(" ")}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {preview.validRows.length > 0 && (
              <div className="table-scroll">
                <div className="table-shell">
                  <table className="min-w-full text-left text-sm text-slate-200">
                    <thead className="bg-slate-900/80 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Row</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.validRows.map((row) => (
                        <tr key={row.rowNumber} className="border-t border-slate-800">
                          <td className="px-4 py-3">{row.rowNumber}</td>
                          <td className="px-4 py-3">{row.name}</td>
                          <td className="px-4 py-3">{row.phone}</td>
                          <td className="px-4 py-3">{row.email || "-"}</td>
                          <td className="px-4 py-3">{row.address || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" className="secondary-button" onClick={() => setPreview(null)}>
                Cancel
              </button>
              <button type="button" className="primary-button" onClick={handleConfirmImport} disabled={submitting || preview.validRows.length === 0}>
                {submitting ? "Importing..." : "Confirm Import"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImportCustomers;
