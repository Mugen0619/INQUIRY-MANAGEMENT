"use client";

import { useEffect, useState } from "react";
import {
  Inquiry,
  InquiryFormValues,
  InquiryStatus,
  STATUSES,
} from "@/lib/types";
import StatusColumn from "./StatusColumn";
import InquiryFormModal from "./InquiryFormModal";

async function parseErrorMessage(res: Response, fallback: string) {
  try {
    const data = await res.json();
    return typeof data.error === "string" ? data.error : fallback;
  } catch {
    return fallback;
  }
}

export default function Board() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modal, setModal] = useState<
    { mode: "create" } | { mode: "edit"; inquiry: Inquiry } | null
  >(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);

  const loadInquiries = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/inquiries");
      if (!res.ok) {
        throw new Error(await parseErrorMessage(res, "一覧の取得に失敗しました。"));
      }
      const data: Inquiry[] = await res.json();
      setInquiries(data);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "一覧の取得に失敗しました。",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 初回データ取得のため、マウント時にloadInquiriesを実行する
    loadInquiries();
  }, []);

  const handleCreate = async (values: InquiryFormValues) => {
    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      throw new Error(await parseErrorMessage(res, "登録に失敗しました。"));
    }
    const created: Inquiry = await res.json();
    setInquiries((prev) => [created, ...prev]);
    setModal(null);
  };

  const handleUpdate = async (id: number, values: Partial<InquiryFormValues>) => {
    const res = await fetch(`/api/inquiries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      throw new Error(await parseErrorMessage(res, "更新に失敗しました。"));
    }
    const updated: Inquiry = await res.json();
    setInquiries((prev) => prev.map((i) => (i.id === id ? updated : i)));
    return updated;
  };

  const handleEditSubmit = async (id: number, values: InquiryFormValues) => {
    await handleUpdate(id, values);
    setModal(null);
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/inquiries/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      throw new Error(await parseErrorMessage(res, "削除に失敗しました。"));
    }
    setInquiries((prev) => prev.filter((i) => i.id !== id));
    setModal(null);
  };

  const handleMove = async (id: number, status: InquiryStatus) => {
    const prevInquiries = inquiries;
    setInquiries((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i)),
    );
    try {
      await handleUpdate(id, { status });
    } catch (err) {
      setInquiries(prevInquiries);
      alert(
        err instanceof Error ? err.message : "ステータス変更に失敗しました。",
      );
    }
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (status: InquiryStatus) => {
    if (draggedId !== null) {
      handleMove(draggedId, status);
      setDraggedId(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          問い合わせ管理
        </h1>
        <button
          type="button"
          onClick={() => setModal({ mode: "create" })}
          className="rounded bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          + 新規登録
        </button>
      </div>

      {loading && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">読み込み中...</p>
      )}
      {loadError && (
        <div className="flex items-center gap-3 text-sm text-red-600">
          <p>{loadError}</p>
          <button
            type="button"
            onClick={loadInquiries}
            className="rounded border border-red-300 px-2 py-1 text-xs hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
          >
            再読み込み
          </button>
        </div>
      )}

      {!loading && !loadError && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {STATUSES.map((status) => (
            <StatusColumn
              key={status}
              status={status}
              inquiries={inquiries.filter((i) => i.status === status)}
              onOpen={(inquiry) => setModal({ mode: "edit", inquiry })}
              onMove={handleMove}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}

      {modal?.mode === "create" && (
        <InquiryFormModal
          mode="create"
          onClose={() => setModal(null)}
          onSubmit={handleCreate}
        />
      )}
      {modal?.mode === "edit" && (
        <InquiryFormModal
          mode="edit"
          initial={modal.inquiry}
          onClose={() => setModal(null)}
          onSubmit={(values) => handleEditSubmit(modal.inquiry.id, values)}
          onDelete={() => handleDelete(modal.inquiry.id)}
        />
      )}
    </div>
  );
}
