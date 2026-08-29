import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/auth/logout/route";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

describe("POST /api/auth/logout", () => {
  it("セッションCookieを失効させて200を返す", async () => {
    const res = await POST();
    expect(res.status).toBe(200);
    const cookie = res.cookies.get(SESSION_COOKIE_NAME);
    expect(cookie?.value).toBe("");
    expect(cookie?.maxAge).toBe(0);
  });
});
