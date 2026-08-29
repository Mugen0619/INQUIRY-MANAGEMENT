export const STATUSES = ["UNCONTACTED", "IN_PROGRESS", "DONE"] as const;

export type InquiryStatus = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<InquiryStatus, string> = {
  UNCONTACTED: "未対応",
  IN_PROGRESS: "対応中",
  DONE: "完了",
};

export const CATEGORIES = ["SHIPPING", "PAYMENT", "PRODUCT", "OTHER"] as const;

export type InquiryCategory = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<InquiryCategory, string> = {
  SHIPPING: "配送について",
  PAYMENT: "支払いについて",
  PRODUCT: "商品について",
  OTHER: "その他",
};

export type Inquiry = {
  id: number;
  name: string;
  contact: string;
  subject: string;
  content: string;
  category: InquiryCategory;
  status: InquiryStatus;
  receivedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type InquiryFormValues = {
  name: string;
  contact: string;
  subject: string;
  content: string;
  category: InquiryCategory;
  status: InquiryStatus;
  receivedAt: string;
};

export type PublicInquiryFormValues = {
  name: string;
  contact: string;
  subject: string;
  content: string;
  category: InquiryCategory;
};
