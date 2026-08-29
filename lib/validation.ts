import { InquiryCategory, InquiryStatus } from "@/app/generated/prisma/client";

export const INQUIRY_STATUSES = Object.values(InquiryStatus);
export const INQUIRY_CATEGORIES = Object.values(InquiryCategory);

export type InquiryInput = {
  name: string;
  contact: string;
  subject: string;
  content: string;
  category: InquiryCategory;
  status: InquiryStatus;
  receivedAt: Date;
};

export class ValidationError extends Error {}

const MAX_LENGTHS = {
  name: 100,
  contact: 191,
  subject: 191,
  content: 5000,
} as const;

function requireString(
  value: unknown,
  field: string,
  maxLength?: number,
): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ValidationError(`${field}は必須です。`);
  }
  if (maxLength !== undefined && value.length > maxLength) {
    throw new ValidationError(`${field}は${maxLength}文字以内で入力してください。`);
  }
  return value;
}

function parseCategory(value: unknown): InquiryCategory {
  if (
    typeof value !== "string" ||
    !INQUIRY_CATEGORIES.includes(value as InquiryCategory)
  ) {
    throw new ValidationError("カテゴリの値が不正です。");
  }
  return value as InquiryCategory;
}

function parseStatus(value: unknown): InquiryStatus {
  if (
    typeof value !== "string" ||
    !INQUIRY_STATUSES.includes(value as InquiryStatus)
  ) {
    throw new ValidationError("ステータスの値が不正です。");
  }
  return value as InquiryStatus;
}

function parseDateTime(value: unknown, field: string): Date {
  const raw = requireString(value, field);
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    throw new ValidationError(`${field}の形式が不正です。`);
  }
  return date;
}

export function parseInquiryInput(body: unknown): InquiryInput {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("リクエストボディが不正です。");
  }
  const data = body as Record<string, unknown>;

  const name = requireString(data.name, "氏名", MAX_LENGTHS.name);
  const contact = requireString(data.contact, "連絡先", MAX_LENGTHS.contact);
  const subject = requireString(data.subject, "件名", MAX_LENGTHS.subject);
  const content = requireString(data.content, "内容", MAX_LENGTHS.content);
  const category = parseCategory(data.category ?? InquiryCategory.OTHER);
  const status = parseStatus(data.status ?? InquiryStatus.UNCONTACTED);
  const receivedAt =
    data.receivedAt === undefined
      ? new Date()
      : parseDateTime(data.receivedAt, "受付日時");

  return {
    name,
    contact,
    subject,
    content,
    category,
    status,
    receivedAt,
  };
}

export function parseInquiryPatch(body: unknown): Partial<InquiryInput> {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("リクエストボディが不正です。");
  }
  const data = body as Record<string, unknown>;
  const result: Partial<InquiryInput> = {};

  if (data.name !== undefined)
    result.name = requireString(data.name, "氏名", MAX_LENGTHS.name);
  if (data.contact !== undefined)
    result.contact = requireString(data.contact, "連絡先", MAX_LENGTHS.contact);
  if (data.subject !== undefined)
    result.subject = requireString(data.subject, "件名", MAX_LENGTHS.subject);
  if (data.content !== undefined)
    result.content = requireString(data.content, "内容", MAX_LENGTHS.content);
  if (data.category !== undefined) result.category = parseCategory(data.category);
  if (data.status !== undefined) result.status = parseStatus(data.status);
  if (data.receivedAt !== undefined)
    result.receivedAt = parseDateTime(data.receivedAt, "受付日時");

  return result;
}
