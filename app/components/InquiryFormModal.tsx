"use client";

import { FormEvent, useState } from "react";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  Inquiry,
  InquiryFormValues,
  STATUS_LABELS,
  STATUSES,
} from "@/lib/types";

function toDatetimeLocal(isoString: string): string {
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function nowAsDatetimeLocal(): string {
  return toDatetimeLocal(new Date().toISOString());
}

type Props = {
  mode: "create" | "edit";
  initial?: Inquiry;
  onClose: () => void;
  onSubmit: (values: InquiryFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
};

export default function InquiryFormModal({
  mode,
  initial,
  onClose,
  onSubmit,
  onDelete,
}: Props) {
  const [values, setValues] = useState<InquiryFormValues>({
    name: initial?.name ?? "",
    contact: initial?.contact ?? "",
    subject: initial?.subject ?? "",
    content: initial?.content ?? "",
    category: initial?.category ?? "OTHER",
    status: initial?.status ?? "UNCONTACTED",
    receivedAt: initial ? toDatetimeLocal(initial.receivedAt) : nowAsDatetimeLocal(),
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange =
    (field: keyof InquiryFormValues) =>
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
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました。");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm("この問い合わせを削除しますか？")) return;
    setSubmitting(true);
    setError(null);
    try {
      await onDelete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "削除に失敗しました。");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {mode === "create" ? "問い合わせを登録" : "問い合わせを編集"}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
              className="min-h-24 rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              value={values.content}
              onChange={handleChange("content")}
              required
            />
          </label>
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
          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
              ステータス
              <select
                className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                value={values.status}
                onChange={handleChange("status")}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-1 flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
              受付日時
              <input
                type="datetime-local"
                className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                value={values.receivedAt}
                onChange={handleChange("receivedAt")}
                required
              />
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="mt-2 flex items-center justify-between gap-2">
            <div>
              {mode === "edit" && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={submitting}
                  className="rounded border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:hover:bg-red-950"
                >
                  削除
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                {mode === "create" ? "登録" : "保存"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
