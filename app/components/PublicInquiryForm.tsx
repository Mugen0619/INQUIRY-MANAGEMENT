"use client";

import { FormEvent, useState } from "react";
import { CATEGORIES, CATEGORY_LABELS, PublicInquiryFormValues } from "@/lib/types";
import { BASE_PATH } from "@/lib/basePath";

const initialValues: PublicInquiryFormValues = {
  name: "",
  contact: "",
  subject: "",
  content: "",
  category: "OTHER",
};

async function parseErrorMessage(res: Response, fallback: string) {
  try {
    const data = await res.json();
    return typeof data.error === "string" ? data.error : fallback;
  } catch {
    return fallback;
  }
}

export default function PublicInquiryForm() {
  const [values, setValues] = useState<PublicInquiryFormValues>(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleChange =
    (field: keyof PublicInquiryFormValues) =>
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_PATH}/api/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        throw new Error(await parseErrorMessage(res, "送信に失敗しました。"));
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "送信に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          送信が完了しました
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          お問い合わせいただきありがとうございます。担当者が確認のうえ対応いたします。
        </p>
        <button
          type="button"
          onClick={() => {
            setValues(initialValues);
            setDone(false);
          }}
          className="rounded border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          もう一件送信する
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg flex-1 p-6">
      <h1 className="mb-1 text-xl font-bold text-zinc-900 dark:text-zinc-50">
        お問い合わせ
      </h1>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        必要事項をご入力のうえ、送信してください。
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          カテゴリ
          <select
            className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            value={values.category}
            onChange={handleChange("category")}
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          氏名
          <input
            className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            value={values.name}
            onChange={handleChange("name")}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          連絡先（メールまたは電話）
          <input
            className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            value={values.contact}
            onChange={handleChange("contact")}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          件名
          <input
            className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            value={values.subject}
            onChange={handleChange("subject")}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          内容
          <textarea
            className="min-h-32 rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            value={values.content}
            onChange={handleChange("content")}
            required
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {submitting ? "送信中..." : "送信する"}
        </button>
      </form>
    </div>
  );
}
