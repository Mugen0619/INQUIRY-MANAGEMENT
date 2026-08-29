import { describe, expect, it, vi } from "vitest";
import { parseInquiryInput, parseInquiryPatch, ValidationError } from "@/lib/validation";

const validBody = {
  name: "テスト太郎",
  contact: "test@example.com",
  subject: "件名",
  content: "内容",
  category: "PRODUCT",
  status: "IN_PROGRESS",
  receivedAt: "2026-01-01T10:00:00.000Z",
};

describe("parseInquiryInput", () => {
  it("有効なデータをパースできる", () => {
    const result = parseInquiryInput(validBody);
    expect(result).toEqual({
      name: "テスト太郎",
      contact: "test@example.com",
      subject: "件名",
      content: "内容",
      category: "PRODUCT",
      status: "IN_PROGRESS",
      receivedAt: new Date("2026-01-01T10:00:00.000Z"),
    });
  });

  it("statusが省略された場合はUNCONTACTEDになる", () => {
    const rest: Record<string, unknown> = { ...validBody };
    delete rest.status;
    const result = parseInquiryInput(rest);
    expect(result.status).toBe("UNCONTACTED");
  });

  it("categoryが省略された場合はOTHERになる", () => {
    const rest: Record<string, unknown> = { ...validBody };
    delete rest.category;
    const result = parseInquiryInput(rest);
    expect(result.category).toBe("OTHER");
  });

  it("receivedAtが省略された場合は現在時刻になる（公開フォームからの送信を想定）", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-01T00:00:00.000Z"));
    const rest: Record<string, unknown> = { ...validBody };
    delete rest.receivedAt;
    const result = parseInquiryInput(rest);
    expect(result.receivedAt).toEqual(new Date("2026-03-01T00:00:00.000Z"));
    vi.useRealTimers();
  });

  it("bodyがオブジェクトでない場合はValidationError", () => {
    expect(() => parseInquiryInput(null)).toThrow(ValidationError);
    expect(() => parseInquiryInput("string")).toThrow(ValidationError);
    expect(() => parseInquiryInput(123)).toThrow(ValidationError);
  });

  it.each(["name", "contact", "subject", "content"] as const)(
    "%sが空文字の場合はValidationError",
    (field) => {
      expect(() => parseInquiryInput({ ...validBody, [field]: "" })).toThrow(
        ValidationError,
      );
    },
  );

  it.each(["name", "contact", "subject", "content"] as const)(
    "%sが空白のみの場合はValidationError",
    (field) => {
      expect(() => parseInquiryInput({ ...validBody, [field]: "   " })).toThrow(
        ValidationError,
      );
    },
  );

  it.each(["name", "contact", "subject", "content"] as const)(
    "%sが欠落している場合はValidationError",
    (field) => {
      const body = { ...validBody };
      delete (body as Record<string, unknown>)[field];
      expect(() => parseInquiryInput(body)).toThrow(ValidationError);
    },
  );

  it("statusが不正な値の場合はValidationError", () => {
    expect(() =>
      parseInquiryInput({ ...validBody, status: "UNKNOWN_STATUS" }),
    ).toThrow(ValidationError);
  });

  it("categoryが不正な値の場合はValidationError", () => {
    expect(() =>
      parseInquiryInput({ ...validBody, category: "UNKNOWN_CATEGORY" }),
    ).toThrow(ValidationError);
  });

  it("receivedAtが不正な日時文字列の場合はValidationError", () => {
    expect(() =>
      parseInquiryInput({ ...validBody, receivedAt: "not-a-date" }),
    ).toThrow(ValidationError);
  });
});

describe("parseInquiryPatch", () => {
  it("空オブジェクトを渡すと空の差分になる", () => {
    expect(parseInquiryPatch({})).toEqual({});
  });

  it("指定したフィールドのみを差分として返す", () => {
    const result = parseInquiryPatch({ status: "DONE" });
    expect(result).toEqual({ status: "DONE" });
  });

  it("bodyがオブジェクトでない場合はValidationError", () => {
    expect(() => parseInquiryPatch(undefined)).toThrow(ValidationError);
    expect(() => parseInquiryPatch([])).not.toThrow();
  });

  it("statusが不正な値の場合はValidationError", () => {
    expect(() => parseInquiryPatch({ status: "INVALID" })).toThrow(
      ValidationError,
    );
  });

  it("categoryが不正な値の場合はValidationError", () => {
    expect(() => parseInquiryPatch({ category: "INVALID" })).toThrow(
      ValidationError,
    );
  });

  it("categoryを指定すると差分に反映される", () => {
    const result = parseInquiryPatch({ category: "SHIPPING" });
    expect(result).toEqual({ category: "SHIPPING" });
  });

  it("nameが空文字の場合はValidationError", () => {
    expect(() => parseInquiryPatch({ name: "" })).toThrow(ValidationError);
  });

  it("receivedAtが不正な日時文字列の場合はValidationError", () => {
    expect(() => parseInquiryPatch({ receivedAt: "invalid" })).toThrow(
      ValidationError,
    );
  });

  it("receivedAtが有効な場合はDateに変換される", () => {
    const result = parseInquiryPatch({ receivedAt: "2026-02-01T00:00:00.000Z" });
    expect(result.receivedAt).toEqual(new Date("2026-02-01T00:00:00.000Z"));
  });
});
