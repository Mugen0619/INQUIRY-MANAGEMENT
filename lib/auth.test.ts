import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createSessionToken,
  isValidSessionToken,
  verifyPassword,
} from "@/lib/auth";

const ORIGINAL_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

beforeEach(() => {
  process.env.ADMIN_PASSWORD = "correct-password";
});

afterEach(() => {
  process.env.ADMIN_PASSWORD = ORIGINAL_ADMIN_PASSWORD;
});

describe("verifyPassword", () => {
  it("正しいパスワードならtrueを返す", async () => {
    await expect(verifyPassword("correct-password")).resolves.toBe(true);
  });

  it("誤ったパスワードならfalseを返す", async () => {
    await expect(verifyPassword("wrong-password")).resolves.toBe(false);
  });

  it("ADMIN_PASSWORDが未設定の場合はfalseを返す", async () => {
    delete process.env.ADMIN_PASSWORD;
    await expect(verifyPassword("")).resolves.toBe(false);
    await expect(verifyPassword("correct-password")).resolves.toBe(false);
  });
});

describe("createSessionToken / isValidSessionToken", () => {
  it("createSessionTokenが返すトークンはisValidSessionTokenでtrueになる", async () => {
    const token = await createSessionToken();
    await expect(isValidSessionToken(token)).resolves.toBe(true);
  });

  it("不正なトークンはfalseになる", async () => {
    await expect(isValidSessionToken("bogus-token")).resolves.toBe(false);
  });

  it("トークンが未指定の場合はfalseになる", async () => {
    await expect(isValidSessionToken(undefined)).resolves.toBe(false);
  });

  it("ADMIN_PASSWORDが未設定の場合はどんなトークンでもfalseになる", async () => {
    const token = await createSessionToken();
    delete process.env.ADMIN_PASSWORD;
    await expect(isValidSessionToken(token)).resolves.toBe(false);
  });
});
