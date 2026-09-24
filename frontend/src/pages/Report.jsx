import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";

import { OUTREACH_STATUSES, getOutreachStatusLabel } from "../constants/outreachStatus";
import { getCustomerOutreachReport } from "../services/reportApi";

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
  const [specificDate, setSpecificDate] = useState(getToday());
  const [specificMonth, setSpecificMonth] = useState(getToday().slice(0, 7));
  const [specificYear, setSpecificYear] = useState(String(new Date().getFullYear()));
  const [customFrom, setCustomFrom] = useState(getToday());
  const [customTo, setCustomTo] = useState(getToday());
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
      return {
        ...range,
        label: new Date(`${range.dateFrom}T00:00:00`).toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
      };
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
      { wch: 14 }, { wch: 26 }, { wch: 18 }, { wch: 28 }, { wch: 32 }, { wch: 20 }, { wch: 42 }, { wch: 18 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Outreach");
    XLSX.writeFile(workbook, `laporan-outreach-${period.dateFrom}-${period.dateTo}.xlsx`);
  };

  return (
    <div className="page-container content-stack">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="hud-label">
            <span className="status-dot" />
            Tactical Analytics
          </span>
          <h1 className="mt-4 text-3xl font-semibold text-slate-50">Report Outreach</h1>
          <p className="mt-2 text-sm text-slate-300">Monitor customer outreach performance by date range and status.</p>
        </div>

        <button type="button" className="primary-button" onClick={exportReport} disabled={loading || report.data.length === 0}>
          Export Excel
        </button>
      </header>

      <section className="panel p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="form-group">
            <label htmlFor="report-period">Period</label>
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

        <div className="mt-5 rounded-2xl border border-slate-700/70 bg-slate-950/60 p-3 text-sm text-slate-200">
          <strong className="text-slate-100">Periode aktif:</strong> {period.label}
        </div>

        <fieldset className="mt-5 rounded-2xl border border-slate-700/70 bg-slate-950/60 p-4">
          <legend className="px-2 text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400">Status outreach</legend>
          <div className="mt-3 flex flex-wrap gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-slate-200">
              <input type="checkbox" checked={selectedStatuses.length === 0} onChange={() => setSelectedStatuses([])} />
              Semua status
            </label>
            {OUTREACH_STATUSES.map((status) => (
              <label key={status.value} className="inline-flex items-center gap-2 text-sm text-slate-200">
                <input type="checkbox" checked={selectedStatuses.includes(status.value)} onChange={() => toggleStatus(status.value)} />
                {status.label}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {error && <div className="error-message">{error}</div>}

      {loading && (
        <div className="panel p-8 text-slate-200">Memuat laporan...</div>
      )}

      {!loading && !error && report.data.length === 0 && (
        <div className="panel p-8 text-slate-200">Tidak ada data pada periode dan status yang dipilih.</div>
      )}

      {!loading && !error && report.data.length > 0 && (
        <section className="panel p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-50">Hasil laporan</h2>
            <span className="text-[10px] uppercase tracking-[0.22em] text-slate-400">{report.count} customer</span>
          </div>

          <div className="table-scroll">
            <div className="table-shell">
              <table className="min-w-full text-left text-sm text-slate-200">
                <thead className="bg-slate-900/80 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Telepon</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Alamat</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Follow-up</th>
                  </tr>
                </thead>
                <tbody>
                  {report.data.map((customer) => (
                    <tr key={customer.id} className="border-t border-slate-800">
                      <td className="px-4 py-3">{formatReportDate(customer.report_date)}</td>
                      <td className="px-4 py-3">{customer.name}</td>
                      <td className="px-4 py-3">{customer.phone}</td>
                      <td className="px-4 py-3">{customer.email || "-"}</td>
                      <td className="px-4 py-3">{customer.address || "-"}</td>
                      <td className="px-4 py-3">{getOutreachStatusLabel(customer.status)}</td>
                      <td className="px-4 py-3">{customer.follow_up_note || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default Report;
