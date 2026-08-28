import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    inquiry: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { GET, POST } from "@/app/api/inquiries/route";

const validBody = {
  name: "テスト太郎",
  contact: "test@example.com",
  subject: "件名",
  content: "内容",
  status: "UNCONTACTED",
  receivedAt: "2026-01-01T10:00:00.000Z",
};

function postRequest(body: unknown) {
  return new NextRequest("http://localhost/api/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("GET /api/inquiries", () => {
  it("受付日時の降順で一覧を返す", async () => {
    const rows = [{ id: 1 }, { id: 2 }];
    prismaMock.inquiry.findMany.mockResolvedValue(rows);

    const res = await GET();

    expect(prismaMock.inquiry.findMany).toHaveBeenCalledWith({
      orderBy: { receivedAt: "desc" },
    });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(rows);
  });
});

describe("POST /api/inquiries", () => {
  it("有効なデータで登録し201を返す", async () => {
    const created = { id: 1, ...validBody };
    prismaMock.inquiry.create.mockResolvedValue(created);

    const res = await POST(postRequest(validBody));

    expect(prismaMock.inquiry.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ name: "テスト太郎" }),
    });
    expect(res.status).toBe(201);
    await expect(res.json()).resolves.toEqual(created);
  });

  it("必須項目が欠落している場合は400を返す", async () => {
    const rest: Record<string, unknown> = { ...validBody };
    delete rest.name;

    const res = await POST(postRequest(rest));

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("氏名");
    expect(prismaMock.inquiry.create).not.toHaveBeenCalled();
  });

  it("Prismaでエラーが発生した場合は500を返す", async () => {
    prismaMock.inquiry.create.mockRejectedValue(new Error("DB down"));

    const res = await POST(postRequest(validBody));

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("問い合わせの登録に失敗しました。");
  });
});
