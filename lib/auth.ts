export const SESSION_COOKIE_NAME = "inquiry_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7日間

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

/** 管理者パスワードから、Cookieに保存するセッショントークンを導出する。 */
export async function createSessionToken(): Promise<string> {
  return sha256Hex(getAdminPassword());
}

/** 入力されたパスワードが管理者パスワードと一致するか検証する。 */
export async function verifyPassword(password: string): Promise<boolean> {
  const adminPassword = getAdminPassword();
  if (!adminPassword) return false;
  return timingSafeEqual(password, adminPassword);
}

/** Cookieから取得したトークンが有効なセッションかどうかを検証する。 */
export async function isValidSessionToken(
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  const adminPassword = getAdminPassword();
  if (!adminPassword) return false;
  const expected = await createSessionToken();
  return timingSafeEqual(token, expected);
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};
