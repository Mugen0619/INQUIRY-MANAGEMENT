import { InquiryStatus } from "@/app/generated/prisma/client";

export const INQUIRY_STATUSES = Object.values(InquiryStatus);

export type InquiryInput = {
  name: string;
  contact: string;
  subject: string;
  content: string;
  status: InquiryStatus;
  receivedAt: Date;
};

export class ValidationError extends Error {}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ValidationError(`${field}は必須です。`);
  }
  return value;
}

export function parseInquiryInput(body: unknown): InquiryInput {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("リクエストボディが不正です。");
  }
  const data = body as Record<string, unknown>;

  const name = requireString(data.name, "氏名");
  const contact = requireString(data.contact, "連絡先");
  const subject = requireString(data.subject, "件名");
  const content = requireString(data.content, "内容");

  const status = data.status ?? InquiryStatus.UNCONTACTED;
  if (
    typeof status !== "string" ||
    !INQUIRY_STATUSES.includes(status as InquiryStatus)
  ) {
    throw new ValidationError("ステータスの値が不正です。");
  }

  const receivedAtRaw = requireString(data.receivedAt, "受付日時");
  const receivedAt = new Date(receivedAtRaw);
  if (Number.isNaN(receivedAt.getTime())) {
    throw new ValidationError("受付日時の形式が不正です。");
  }

  return {
    name,
    contact,
    subject,
    content,
    status: status as InquiryStatus,
    receivedAt,
  };
}

export function parseInquiryPatch(body: unknown): Partial<InquiryInput> {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("リクエストボディが不正です。");
  }
  const data = body as Record<string, unknown>;
  const result: Partial<InquiryInput> = {};

  if (data.name !== undefined) result.name = requireString(data.name, "氏名");
  if (data.contact !== undefined)
    result.contact = requireString(data.contact, "連絡先");
  if (data.subject !== undefined)
    result.subject = requireString(data.subject, "件名");
  if (data.content !== undefined)
    result.content = requireString(data.content, "内容");

  if (data.status !== undefined) {
    if (
      typeof data.status !== "string" ||
      !INQUIRY_STATUSES.includes(data.status as InquiryStatus)
    ) {
      throw new ValidationError("ステータスの値が不正です。");
    }
    result.status = data.status as InquiryStatus;
  }

  if (data.receivedAt !== undefined) {
    const receivedAtRaw = requireString(data.receivedAt, "受付日時");
    const receivedAt = new Date(receivedAtRaw);
    if (Number.isNaN(receivedAt.getTime())) {
      throw new ValidationError("受付日時の形式が不正です。");
    }
    result.receivedAt = receivedAt;
  }

  return result;
}
