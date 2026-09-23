import { useEffect, useMemo, useState } from "react";

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
      } catch (error) {
        console.error("Failed to load customers for WhatsApp outreach:", error);
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

  const generatedMessage = useMemo(() => {
    return replaceTemplateVariables(customMessage, {
      name: selectedCustomer?.name || "{{name}}",
      phone: selectedCustomer?.phone || "{{phone}}",
      company: company || defaultCompany,
      senderName: senderName || defaultSenderName,
    });
  }, [customMessage, selectedCustomer, senderName, company]);

  const whatsappLink = useMemo(() => {
    return buildWhatsAppLink({
      phone: selectedCustomer?.phone || "",
      message: generatedMessage,
    });
  }, [selectedCustomer, generatedMessage]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="customer-list">
          <p>Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Outreach / WhatsApp</h1>
          <p>Send a personalized WhatsApp message to a customer.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="whatsapp-layout">
        <div className="form-container whatsapp-panel">
          <div className="form-group">
            <label htmlFor="customer-select">Customer</label>
            <select
              id="customer-select"
              value={selectedCustomerId}
              onChange={(event) => setSelectedCustomerId(event.target.value)}
            >
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
            <input
              id="sender-name"
              type="text"
              value={senderName}
              onChange={(event) => setSenderName(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="company-name">Company</label>
            <input
              id="company-name"
              type="text"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="message-body">Message</label>
            <textarea
              id="message-body"
              rows="8"
              value={customMessage}
              onChange={(event) => setCustomMessage(event.target.value)}
            />
          </div>

          <div className="form-actions whatsapp-actions">
            <a
              href={whatsappLink?.web || "#"}
              target="_blank"
              rel="noreferrer"
              className={`primary-button whatsapp-link ${!whatsappLink?.web ? "disabled-link" : ""}`}
              onClick={(event) => {
                if (!whatsappLink?.web) {
                  event.preventDefault();
                }
              }}
            >
              Open WhatsApp Web
            </a>

            <a
              href={whatsappLink?.desktop || "#"}
              target="_blank"
              rel="noreferrer"
              className={`secondary-button whatsapp-link ${!whatsappLink?.desktop ? "disabled-link" : ""}`}
              onClick={(event) => {
                if (!whatsappLink?.desktop) {
                  event.preventDefault();
                }
              }}
            >
              Open WhatsApp Desktop
            </a>
          </div>
        </div>

        <div className="customer-list whatsapp-preview">
          <h2>Message Preview</h2>

          {selectedCustomer ? (
            <div className="whatsapp-preview-card">
              <p>
                <strong>Customer:</strong> {selectedCustomer.name}
              </p>
              <p>
                <strong>Phone:</strong> {selectedCustomer.phone}
              </p>
              <p>
                <strong>Company:</strong> {company || defaultCompany}
              </p>
              <p>
                <strong>Sender:</strong> {senderName || defaultSenderName}
              </p>
            </div>
          ) : (
            <p>Select a customer to preview the message.</p>
          )}

          <div className="whatsapp-preview-box">
            <p>{generatedMessage || "Your message preview will appear here."}</p>
          </div>

          <div className="whatsapp-variable-list">
            <h3>Available variables</h3>
            <ul>
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
