"use client";

import {
  CATEGORY_LABELS,
  Inquiry,
  InquiryStatus,
  STATUS_LABELS,
  STATUSES,
} from "@/lib/types";

function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = {
  inquiry: Inquiry;
  onOpen: () => void;
  onMove: (status: InquiryStatus) => void;
  onDragStart: (e: React.DragEvent, id: number) => void;
};

export default function InquiryCard({
  inquiry,
  onOpen,
  onMove,
  onDragStart,
}: Props) {
  const currentIndex = STATUSES.indexOf(inquiry.status);
  const prevStatus = STATUSES[currentIndex - 1];
  const nextStatus = STATUSES[currentIndex + 1];

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, inquiry.id)}
      onClick={onOpen}
      className="cursor-pointer rounded-md border border-zinc-200 bg-white p-3 shadow-sm transition hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
    >
      <span className="inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
        {CATEGORY_LABELS[inquiry.category]}
      </span>
      <p className="mt-1 font-medium text-zinc-900 dark:text-zinc-50">
        {inquiry.subject}
      </p>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {inquiry.name}
      </p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
        {inquiry.contact}
      </p>
      <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
        受付: {formatDateTime(inquiry.receivedAt)}
      </p>
      <div className="mt-3 flex justify-between gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => prevStatus && onMove(prevStatus)}
          disabled={!prevStatus}
          className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          ← {prevStatus ? STATUS_LABELS[prevStatus] : ""}
        </button>
        <button
          type="button"
          onClick={() => nextStatus && onMove(nextStatus)}
          disabled={!nextStatus}
          className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          {nextStatus ? STATUS_LABELS[nextStatus] : ""} →
        </button>
      </div>
    </div>
  );
}
