import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@/app/generated/prisma/client";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    inquiry: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { GET, PUT, DELETE } from "@/app/api/inquiries/[id]/route";

function params(id: string) {
  return { params: Promise.resolve({ id }) };
}

function putRequest(body: unknown) {
  return new NextRequest("http://localhost/api/inquiries/1", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function notFoundError() {
  return new Prisma.PrismaClientKnownRequestError("Record not found", {
    code: "P2025",
    clientVersion: "test",
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("GET /api/inquiries/[id]", () => {
  it("IDが数値でない場合は400を返す", async () => {
    const res = await GET(new NextRequest("http://localhost/api/inquiries/abc"), params("abc"));
    expect(res.status).toBe(400);
    expect(prismaMock.inquiry.findUnique).not.toHaveBeenCalled();
  });

  it("存在しないIDの場合は404を返す", async () => {
    prismaMock.inquiry.findUnique.mockResolvedValue(null);
    const res = await GET(new NextRequest("http://localhost/api/inquiries/1"), params("1"));
    expect(res.status).toBe(404);
  });

  it("存在するIDの場合は200で取得できる", async () => {
    const row = { id: 1, name: "テスト太郎" };
    prismaMock.inquiry.findUnique.mockResolvedValue(row);
    const res = await GET(new NextRequest("http://localhost/api/inquiries/1"), params("1"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(row);
    expect(prismaMock.inquiry.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});

describe("PUT /api/inquiries/[id]", () => {
  it("IDが数値でない場合は400を返す", async () => {
    const res = await PUT(putRequest({ status: "DONE" }), params("abc"));
    expect(res.status).toBe(400);
    expect(prismaMock.inquiry.update).not.toHaveBeenCalled();
  });

  it("不正なステータス値の場合は400を返す", async () => {
    const res = await PUT(putRequest({ status: "INVALID" }), params("1"));
    expect(res.status).toBe(400);
    expect(prismaMock.inquiry.update).not.toHaveBeenCalled();
  });

  it("有効な差分で更新でき200を返す", async () => {
    const updated = { id: 1, status: "DONE" };
    prismaMock.inquiry.update.mockResolvedValue(updated);

    const res = await PUT(putRequest({ status: "DONE" }), params("1"));

    expect(prismaMock.inquiry.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: "DONE" },
    });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(updated);
  });

  it("対象が存在しない場合(P2025)は404を返す", async () => {
    prismaMock.inquiry.update.mockRejectedValue(notFoundError());

    const res = await PUT(putRequest({ status: "DONE" }), params("999"));

    expect(res.status).toBe(404);
  });

  it("その他のエラーの場合は500を返す", async () => {
    prismaMock.inquiry.update.mockRejectedValue(new Error("DB down"));

    const res = await PUT(putRequest({ status: "DONE" }), params("1"));

    expect(res.status).toBe(500);
  });
});

describe("DELETE /api/inquiries/[id]", () => {
  it("IDが数値でない場合は400を返す", async () => {
    const res = await DELETE(new NextRequest("http://localhost/api/inquiries/abc"), params("abc"));
    expect(res.status).toBe(400);
    expect(prismaMock.inquiry.delete).not.toHaveBeenCalled();
  });

  it("正常に削除できた場合は204を返す", async () => {
    prismaMock.inquiry.delete.mockResolvedValue({ id: 1 });

    const res = await DELETE(new NextRequest("http://localhost/api/inquiries/1"), params("1"));

    expect(res.status).toBe(204);
    expect(prismaMock.inquiry.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it("対象が存在しない場合(P2025)は404を返す", async () => {
    prismaMock.inquiry.delete.mockRejectedValue(notFoundError());

    const res = await DELETE(new NextRequest("http://localhost/api/inquiries/999"), params("999"));

    expect(res.status).toBe(404);
  });

  it("その他のエラーの場合は500を返す", async () => {
    prismaMock.inquiry.delete.mockRejectedValue(new Error("DB down"));

    const res = await DELETE(new NextRequest("http://localhost/api/inquiries/1"), params("1"));

    expect(res.status).toBe(500);
  });
});
