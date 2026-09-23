import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";

import { getCustomerOutreachReport } from "../services/reportApi";
import {
  OUTREACH_STATUSES,
  getOutreachStatusLabel,
} from "../constants/outreachStatus";

const toLocalIsoDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getToday = () => toLocalIsoDate(new Date());

const getYesterday = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return toLocalIsoDate(date);
};

const getMonthRange = (monthValue) => {
  const [year, month] = monthValue.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();

  return {
    dateFrom: `${monthValue}-01`,
    dateTo: `${monthValue}-${String(lastDay).padStart(2, "0")}`,
  };
};

const getYearRange = (yearValue) => ({
  dateFrom: `${yearValue}-01-01`,
  dateTo: `${yearValue}-12-31`,
});

const formatReportDate = (value) => {
  if (!value) return "-";

  const dateValue = String(value).split("T")[0];

  return new Date(`${dateValue}T00:00:00`).toLocaleDateString("id-ID");
};

function Report() {
  const [periodType, setPeriodType] = useState("today");
  const [specificDate, setSpecificDate] = useState(getToday);
  const [specificMonth, setSpecificMonth] = useState(getToday().slice(0, 7));
  const [specificYear, setSpecificYear] = useState(String(new Date().getFullYear()));
  const [customFrom, setCustomFrom] = useState(getToday);
  const [customTo, setCustomTo] = useState(getToday);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [report, setReport] = useState({ data: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const period = useMemo(() => {
    if (periodType === "yesterday") {
      const yesterday = getYesterday();
      return { dateFrom: yesterday, dateTo: yesterday, label: `Kemarin, ${formatReportDate(yesterday)}` };
    }

    if (periodType === "specific") {
      return { dateFrom: specificDate, dateTo: specificDate, label: formatReportDate(specificDate) };
    }

    if (periodType === "month") {
      const range = getMonthRange(specificMonth);
      return { ...range, label: new Date(`${range.dateFrom}T00:00:00`).toLocaleDateString("id-ID", { month: "long", year: "numeric" }) };
    }

    if (periodType === "year") {
      const range = getYearRange(specificYear);
      return { ...range, label: specificYear };
    }

    if (periodType === "custom") {
      return { dateFrom: customFrom, dateTo: customTo, label: `${formatReportDate(customFrom)} - ${formatReportDate(customTo)}` };
    }

    const today = getToday();
    return { dateFrom: today, dateTo: today, label: `Hari ini, ${formatReportDate(today)}` };
  }, [periodType, specificDate, specificMonth, specificYear, customFrom, customTo]);

  useEffect(() => {
    const fetchReport = async () => {
      if (!period.dateFrom || !period.dateTo || period.dateFrom > period.dateTo) {
        setError("Periode tanggal tidak valid.");
        setReport({ data: [], count: 0 });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const result = await getCustomerOutreachReport({
          dateFrom: period.dateFrom,
          dateTo: period.dateTo,
          statuses: selectedStatuses,
        });
        setReport(result);
      } catch (requestError) {
        console.error("Failed to load report:", requestError);
        setError("Laporan gagal dimuat. Pastikan backend dan database aktif.");
        setReport({ data: [], count: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [period, selectedStatuses]);

  const toggleStatus = (status) => {
    setSelectedStatuses((currentStatuses) =>
      currentStatuses.includes(status)
        ? currentStatuses.filter((currentStatus) => currentStatus !== status)
        : [...currentStatuses, status]
    );
  };

  const exportReport = () => {
    const rows = report.data.map((customer) => ({
      Tanggal: formatReportDate(customer.report_date),
      "Nama Customer": customer.name,
      Telepon: customer.phone,
      Email: customer.email || "",
      Alamat: customer.address || "",
      Status: getOutreachStatusLabel(customer.status),
      "Catatan Follow-up": customer.follow_up_note || "",
      "Tanggal Follow-up": formatReportDate(customer.follow_up_date),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = [
      { wch: 14 }, { wch: 26 }, { wch: 18 }, { wch: 28 },
      { wch: 32 }, { wch: 20 }, { wch: 42 }, { wch: 18 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Outreach");
    XLSX.writeFile(workbook, `laporan-outreach-${period.dateFrom}-${period.dateTo}.xlsx`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Report Outreach</h1>
          <p>Lihat dan export data customer berdasarkan periode dan status outreach.</p>
        </div>
        <button className="primary-button" onClick={exportReport} disabled={loading || report.data.length === 0}>
          Export Excel
        </button>
      </div>

      <section className="customer-list report-controls">
        <div className="report-control-grid">
          <div className="form-group">
            <label htmlFor="report-period">Periode</label>
            <select id="report-period" value={periodType} onChange={(event) => setPeriodType(event.target.value)}>
              <option value="today">Hari ini</option>
              <option value="yesterday">Kemarin</option>
              <option value="specific">Tanggal tertentu</option>
              <option value="month">Bulan tertentu</option>
              <option value="year">Tahun tertentu</option>
              <option value="custom">Rentang tanggal</option>
            </select>
          </div>

          {periodType === "specific" && (
            <div className="form-group">
              <label htmlFor="specific-date">Tanggal</label>
              <input id="specific-date" type="date" value={specificDate} onChange={(event) => setSpecificDate(event.target.value)} />
            </div>
          )}

          {periodType === "month" && (
            <div className="form-group">
              <label htmlFor="specific-month">Bulan</label>
              <input id="specific-month" type="month" value={specificMonth} onChange={(event) => setSpecificMonth(event.target.value)} />
            </div>
          )}

          {periodType === "year" && (
            <div className="form-group">
              <label htmlFor="specific-year">Tahun</label>
              <input id="specific-year" type="number" min="2000" max="2100" value={specificYear} onChange={(event) => setSpecificYear(event.target.value)} />
            </div>
          )}

          {periodType === "custom" && (
            <>
              <div className="form-group">
                <label htmlFor="custom-from">Dari</label>
                <input id="custom-from" type="date" value={customFrom} onChange={(event) => setCustomFrom(event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="custom-to">Sampai</label>
                <input id="custom-to" type="date" value={customTo} onChange={(event) => setCustomTo(event.target.value)} />
              </div>
            </>
          )}
        </div>

        <div className="report-period-summary">
          <strong>Periode aktif:</strong> {period.label}
        </div>

        <fieldset className="report-status-filter">
          <legend>Status outreach</legend>
          <label className="status-checkbox">
            <input type="checkbox" checked={selectedStatuses.length === 0} onChange={() => setSelectedStatuses([])} />
            Semua status
          </label>
          {OUTREACH_STATUSES.map((status) => (
            <label className="status-checkbox" key={status.value}>
              <input type="checkbox" checked={selectedStatuses.includes(status.value)} onChange={() => toggleStatus(status.value)} />
              {status.label}
            </label>
          ))}
        </fieldset>
      </section>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="customer-list"><p>Memuat laporan...</p></div>}
      {!loading && !error && report.data.length === 0 && <div className="customer-list"><p>Tidak ada data pada periode dan status yang dipilih.</p></div>}

      {!loading && !error && report.data.length > 0 && (
        <section className="customer-list report-results">
          <div className="report-results-header">
            <h2>Hasil laporan</h2>
            <span>{report.count} customer</span>
          </div>
          <div className="table-wrapper report-table-wrapper">
            <table>
              <thead>
                <tr><th>Tanggal</th><th>Customer</th><th>Telepon</th><th>Email</th><th>Alamat</th><th>Status</th><th>Follow-up</th></tr>
              </thead>
              <tbody>
                {report.data.map((customer) => (
                  <tr key={customer.id}>
                    <td>{formatReportDate(customer.report_date)}</td>
                    <td>{customer.name}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.email || "-"}</td>
                    <td>{customer.address || "-"}</td>
                    <td>{getOutreachStatusLabel(customer.status)}</td>
                    <td>{customer.follow_up_note || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

export default Report;
