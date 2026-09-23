export const whatsappTemplates = [
  {
    id: "follow-up",
    name: "Follow-up",
    text:
      "Hi {{name}}, this is {{senderName}} from {{company}}. I wanted to follow up regarding your recent inquiry. You can reach us at {{phone}} if you would like to continue the conversation.",
  },
  {
    id: "intro",
    name: "Introduction",
    text:
      "Hello {{name}}, thank you for your interest. I am {{senderName}} from {{company}}. We are happy to help and can be reached at {{phone}}.",
  },
  {
    id: "appointment",
    name: "Appointment Reminder",
    text:
      "Hi {{name}}, this is {{senderName}} from {{company}}. Just a quick reminder about our upcoming conversation. Please reply to confirm and we can continue from {{phone}}.",
  },
];

export const replaceTemplateVariables = (templateText, variables = {}) => {
  if (!templateText) {
    return "";
  }

  return templateText.replace(/\{\{\s*([a-zA-Z0-9]+)\s*\}\}/g, (_, key) => {
    return variables[key] ?? "";
  });
};

export const normalizePhoneForWhatsApp = (phoneValue) => {
  if (!phoneValue) {
    return "";
  }

  const digits = String(phoneValue).replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  return digits.startsWith("0") ? digits.replace(/^0+/, "") : digits;
};

export const buildWhatsAppLink = ({ phone, message }) => {
  const normalizedPhone = normalizePhoneForWhatsApp(phone);

  if (!normalizedPhone) {
    return "";
  }

  const encodedMessage = encodeURIComponent(message || "");

  return {
    web: `https://web.whatsapp.com/send?phone=${normalizedPhone}&text=${encodedMessage}`,
    desktop: `whatsapp://send?phone=${normalizedPhone}&text=${encodedMessage}`,
    mobile: `https://wa.me/${normalizedPhone}?text=${encodedMessage}`,
  };
};
