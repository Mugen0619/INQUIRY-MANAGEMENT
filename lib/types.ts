export const STATUSES = ["UNCONTACTED", "IN_PROGRESS", "DONE"] as const;

export type InquiryStatus = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<InquiryStatus, string> = {
  UNCONTACTED: "未対応",
  IN_PROGRESS: "対応中",
  DONE: "完了",
};

export type Inquiry = {
  id: number;
  name: string;
  contact: string;
  subject: string;
  content: string;
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
  status: InquiryStatus;
  receivedAt: string;
};
