export type TemplateCategory = "Onboarding" | "Follow-up" | "Proposal" | "Thank You" | "General" | "Newsletter" | "Support";
export type TemplateType = "Public" | "Private";
export type TemplateStatus = "Active" | "Inactive";

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: TemplateCategory;
  type: TemplateType;
  status: TemplateStatus;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  variables: string[];
  language: string;
}

export const emailTemplates: EmailTemplate[] = [
  {
    id: "TPL-1025",
    name: "Welcome Email",
    subject: "Welcome to {{company_name}}",
    content: `Hi {{first_name}},

Welcome to {{company_name}}!

We're excited to have you on board. Our team is here to help you succeed and make the most of our services.

If you have any questions, feel free to reach out to {{contact_name}}.

Thanks,
{{company_name}} Team`,
    category: "Onboarding",
    type: "Public",
    status: "Active",
    description: "Welcome email sent to new clients after onboarding.",
    createdBy: "Test User",
    createdAt: "2026-05-15T10:30:00",
    updatedAt: "2026-05-16T14:15:00",
    variables: ["{{first_name}}", "{{company_name}}", "{{contact_name}}"],
    language: "English",
  },
  {
    id: "TPL-1026",
    name: "Follow-up Email",
    subject: "Following up on our conversation",
    content: `Hi {{first_name}},

I wanted to follow up on our recent conversation about {{company_name}}.

Please let me know if you have any questions or need further information.

Best regards,
{{contact_name}}`,
    category: "Follow-up",
    type: "Public",
    status: "Active",
    description: "Follow-up email after initial contact.",
    createdBy: "Test User",
    createdAt: "2026-05-14T14:15:00",
    updatedAt: "2026-05-14T14:15:00",
    variables: ["{{first_name}}", "{{company_name}}", "{{contact_name}}"],
    language: "English",
  },
  {
    id: "TPL-1027",
    name: "Proposal Email",
    subject: "Proposal for your requirements",
    content: `Dear {{first_name}},

Thank you for considering {{company_name}} for your requirements.

Please find attached our proposal tailored specifically for your needs.

Feel free to contact {{contact_name}} for any queries.

Warm regards,
{{company_name}}`,
    category: "Proposal",
    type: "Public",
    status: "Active",
    description: "Proposal email with attached document.",
    createdBy: "Test User",
    createdAt: "2026-05-12T11:45:00",
    updatedAt: "2026-05-12T11:45:00",
    variables: ["{{first_name}}", "{{company_name}}", "{{contact_name}}"],
    language: "English",
  },
  {
    id: "TPL-1028",
    name: "Thank You Email",
    subject: "Thank you for your time",
    content: `Hi {{first_name}},

Thank you for taking the time to meet with us today.

We at {{company_name}} truly appreciate your interest and look forward to working with you.

Best,
{{contact_name}}`,
    category: "Thank You",
    type: "Public",
    status: "Active",
    description: "Thank you email after a meeting.",
    createdBy: "Test User",
    createdAt: "2026-05-10T09:20:00",
    updatedAt: "2026-05-10T09:20:00",
    variables: ["{{first_name}}", "{{company_name}}", "{{contact_name}}"],
    language: "English",
  },
  {
    id: "TPL-1029",
    name: "General Email",
    subject: "General communication template",
    content: `Hi {{first_name}},

This is a general communication from {{company_name}}.

Please don't hesitate to reach out to {{contact_name}} if you need any assistance.

Regards,
{{company_name}} Team`,
    category: "General",
    type: "Private",
    status: "Inactive",
    description: "General communication template for various purposes.",
    createdBy: "Test User",
    createdAt: "2026-05-08T16:10:00",
    updatedAt: "2026-05-08T16:10:00",
    variables: ["{{first_name}}", "{{company_name}}", "{{contact_name}}"],
    language: "English",
  },
  {
    id: "TPL-1030",
    name: "Newsletter Email",
    subject: "{{company_name}} Monthly Newsletter - {{date}}",
    content: `Hi {{first_name}},

Here is your monthly newsletter from {{company_name}}.

Stay updated with our latest news and updates.

Unsubscribe | View in browser

{{company_name}} Team`,
    category: "Newsletter",
    type: "Public",
    status: "Active",
    description: "Monthly newsletter template.",
    createdBy: "Test User",
    createdAt: "2026-05-07T10:00:00",
    updatedAt: "2026-05-07T10:00:00",
    variables: ["{{first_name}}", "{{company_name}}", "{{date}}"],
    language: "English",
  },
  {
    id: "TPL-1031",
    name: "Support Email",
    subject: "Re: Your support request",
    content: `Hi {{first_name}},

Thank you for contacting {{company_name}} support.

We have received your request and {{contact_name}} will get back to you shortly.

Reference: {{email}}

Best,
{{company_name}} Support Team`,
    category: "Support",
    type: "Public",
    status: "Active",
    description: "Support acknowledgment email.",
    createdBy: "Test User",
    createdAt: "2026-05-06T08:30:00",
    updatedAt: "2026-05-06T08:30:00",
    variables: ["{{first_name}}", "{{company_name}}", "{{contact_name}}", "{{email}}"],
    language: "English",
  },
  {
    id: "TPL-1032",
    name: "Onboarding Checklist",
    subject: "Your onboarding checklist - {{company_name}}",
    content: `Dear {{first_name}},

Welcome aboard! Here's your onboarding checklist for {{company_name}}.

Please complete the following steps:
1. Set up your account
2. Complete your profile
3. Review the documentation

For help, contact {{contact_name}}.

{{company_name}} Team`,
    category: "Onboarding",
    type: "Private",
    status: "Active",
    description: "Onboarding checklist for new users.",
    createdBy: "Test User",
    createdAt: "2026-05-05T14:00:00",
    updatedAt: "2026-05-05T14:00:00",
    variables: ["{{first_name}}", "{{company_name}}", "{{contact_name}}"],
    language: "English",
  },
  {
    id: "TPL-1033",
    name: "Renewal Reminder",
    subject: "Your subscription renewal reminder",
    content: `Hi {{first_name}},

This is a reminder that your subscription with {{company_name}} is due for renewal.

Please contact {{contact_name}} to proceed with the renewal.

Thanks,
{{company_name}}`,
    category: "General",
    type: "Public",
    status: "Active",
    description: "Subscription renewal reminder.",
    createdBy: "Test User",
    createdAt: "2026-05-04T11:00:00",
    updatedAt: "2026-05-04T11:00:00",
    variables: ["{{first_name}}", "{{company_name}}", "{{contact_name}}"],
    language: "English",
  },
];

export const ALL_CATEGORIES: TemplateCategory[] = ["Onboarding", "Follow-up", "Proposal", "Thank You", "General", "Newsletter", "Support"];

export const AVAILABLE_VARIABLES = [
  "{{company_name}}",
  "{{contact_name}}",
  "{{first_name}}",
  "{{last_name}}",
  "{{email}}",
  "{{date}}",
];

export const CATEGORY_COLORS: Record<TemplateCategory, { bg: string; color: string }> = {
  "Onboarding":  { bg: "#eef2ff", color: "#4f46e5" },
  "Follow-up":   { bg: "#ecfeff", color: "#0891b2" },
  "Proposal":    { bg: "#faf5ff", color: "#7c3aed" },
  "Thank You":   { bg: "#f0fdf4", color: "#16a34a" },
  "General":     { bg: "#f1f5f9", color: "#64748b" },
  "Newsletter":  { bg: "#fef3c7", color: "#b45309" },
  "Support":     { bg: "#fef2f2", color: "#dc2626" },
};

export default emailTemplates;
