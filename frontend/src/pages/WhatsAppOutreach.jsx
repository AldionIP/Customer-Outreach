import { useEffect, useMemo, useState } from "react";

import MechaAssistant from "../components/MechaAssistant";
import { getCustomers } from "../services/customerApi";
import {
  buildWhatsAppLink,
  replaceTemplateVariables,
  whatsappTemplates,
} from "../utils/whatsAppMessage";

const defaultSenderName = "Customer Outreach";
const defaultCompany = "Customer Outreach";

function WhatsAppOutreach() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(whatsappTemplates[0]?.id || "");
  const [senderName, setSenderName] = useState(defaultSenderName);
  const [company, setCompany] = useState(defaultCompany);
  const [customMessage, setCustomMessage] = useState(whatsappTemplates[0]?.text || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const result = await getCustomers({ page: 1, limit: 100 });
        setCustomers(result.data || []);

        if (result.data && result.data.length > 0) {
          setSelectedCustomerId(result.data[0].id);
        }
      } catch (fetchError) {
        console.error("Failed to load customers for WhatsApp outreach:", fetchError);
        setError("Failed to load customer list.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedCustomerId) || null,
    [customers, selectedCustomerId]
  );

  const handleTemplateChange = (event) => {
    const nextTemplateId = event.target.value;
    const nextTemplate = whatsappTemplates.find((template) => template.id === nextTemplateId);

    setSelectedTemplateId(nextTemplateId);

    if (nextTemplate) {
      setCustomMessage(nextTemplate.text);
    }
  };

  const generatedMessage = useMemo(
    () =>
      replaceTemplateVariables(customMessage, {
        name: selectedCustomer?.name || "{{name}}",
        phone: selectedCustomer?.phone || "{{phone}}",
        company: company || defaultCompany,
        senderName: senderName || defaultSenderName,
      }),
    [customMessage, selectedCustomer, senderName, company]
  );

  const whatsappLink = useMemo(
    () =>
      buildWhatsAppLink({
        phone: selectedCustomer?.phone || "",
        message: generatedMessage,
      }),
    [selectedCustomer, generatedMessage]
  );

  if (loading) {
    return (
      <div className="page-container">
        <div className="panel p-8 text-slate-200">Loading outreach directory...</div>
      </div>
    );
  }

  return (
    <div className="page-container content-stack">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="hud-label">
            <span className="status-dot" />
            Outreach / WhatsApp
          </span>
          <h1 className="mt-4 text-3xl font-semibold text-slate-50">Message Command Console</h1>
          <p className="mt-2 text-sm text-slate-300">Send a personalized message while keeping the outreach workflow consistent.</p>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="panel p-6 sm:p-7">
          <div className="grid gap-5">
            <div className="form-group">
              <label htmlFor="customer-select">Customer</label>
              <select id="customer-select" value={selectedCustomerId} onChange={(event) => setSelectedCustomerId(event.target.value)}>
                {customers.length === 0 ? (
                  <option value="">No customers available</option>
                ) : (
                  customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} — {customer.phone}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="template-select">Message template</label>
              <select id="template-select" value={selectedTemplateId} onChange={handleTemplateChange}>
                {whatsappTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="sender-name">Sender name</label>
              <input id="sender-name" type="text" value={senderName} onChange={(event) => setSenderName(event.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor="company-name">Company</label>
              <input id="company-name" type="text" value={company} onChange={(event) => setCompany(event.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor="message-body">Message</label>
              <textarea id="message-body" rows="8" value={customMessage} onChange={(event) => setCustomMessage(event.target.value)} />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={whatsappLink?.web || "#"}
                target="_blank"
                rel="noreferrer"
                className={`primary-button ${!whatsappLink?.web ? "pointer-events-none opacity-50" : ""}`}
                onClick={(event) => {
                  if (!whatsappLink?.web) event.preventDefault();
                }}
              >
                Open WhatsApp Web
              </a>

              <a
                href={whatsappLink?.desktop || "#"}
                target="_blank"
                rel="noreferrer"
                className={`secondary-button ${!whatsappLink?.desktop ? "pointer-events-none opacity-50" : ""}`}
                onClick={(event) => {
                  if (!whatsappLink?.desktop) event.preventDefault();
                }}
              >
                Open WhatsApp Desktop
              </a>
            </div>
          </div>
        </div>

        <div className="panel p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">Message Preview</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-50">Transmission</h2>
            </div>
            <MechaAssistant mode="combat" className="scale-75" />
          </div>

          {selectedCustomer ? (
            <div className="mt-4 space-y-3 rounded-2xl border border-slate-700/70 bg-slate-950/60 p-4 text-sm text-slate-200">
              <p><span className="text-slate-400">Customer:</span> {selectedCustomer.name}</p>
              <p><span className="text-slate-400">Phone:</span> {selectedCustomer.phone}</p>
              <p><span className="text-slate-400">Company:</span> {company || defaultCompany}</p>
              <p><span className="text-slate-400">Sender:</span> {senderName || defaultSenderName}</p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-300">Select a customer to preview the message.</p>
          )}

          <div className="mt-5 rounded-2xl border border-cyan-500/30 bg-slate-950/80 p-4">
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-100">
              {generatedMessage || "Your message preview will appear here."}
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-700/70 bg-slate-950/60 p-4">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Available variables</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              <li>{"{{name}}"}</li>
              <li>{"{{phone}}"}</li>
              <li>{"{{company}}"}</li>
              <li>{"{{senderName}}"}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WhatsAppOutreach;
