import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  previewCustomerImport,
  importCustomers,
} from "../services/importCustomerApi";

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
    } catch (error) {
      console.error("Preview import failed:", error);
      setError(
        error?.response?.data?.message || "Failed to validate the file."
      );
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
      setSuccess(
        result.message || `${preview.validRows.length} customers imported.`
      );
      setPreview(null);
      setSelectedFile(null);
      const fileInput = document.getElementById("import-file");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Import failed:", error);
      setError(
        error?.response?.data?.message || "Failed to import customers."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Import Customers</h1>
          <p>Upload a CSV or Excel file to add multiple customers.</p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => navigate("/customers")}
        >
          Back to Customers
        </button>
      </div>

      <div className="form-container">
        <div className="form-group">
          <label htmlFor="import-file">Select file</label>
          <input
            id="import-file"
            type="file"
            accept=".csv,.xls,.xlsx"
            onChange={handleFileChange}
          />
          <small>Accepted formats: CSV, XLS, XLSX</small>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="primary-button"
            onClick={handlePreview}
            disabled={!selectedFile || loading}
          >
            {loading ? "Validating..." : "Validate File"}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {preview && (
          <div className="import-preview">
            <h3>Import Preview</h3>

            <p>
              {preview.validCount} valid rows • {preview.invalidCount} invalid rows
            </p>

            {preview.invalidRows.length > 0 && (
              <div className="import-section">
                <h4>Invalid rows</h4>
                <ul>
                  {preview.invalidRows.map((row) => (
                    <li key={row.rowNumber}>
                      Row {row.rowNumber}: {row.errors.join(" ")}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {preview.validRows.length > 0 && (
              <div className="import-section">
                <h4>Valid rows</h4>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Row</th>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.validRows.map((row) => (
                        <tr key={row.rowNumber}>
                          <td>{row.rowNumber}</td>
                          <td>{row.name}</td>
                          <td>{row.phone}</td>
                          <td>{row.email || "-"}</td>
                          <td>{row.address || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setPreview(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={handleConfirmImport}
                disabled={submitting || preview.validRows.length === 0}
              >
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
