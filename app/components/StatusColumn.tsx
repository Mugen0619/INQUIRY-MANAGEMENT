"use client";

import { useState } from "react";
import { Inquiry, InquiryStatus, STATUS_LABELS } from "@/lib/types";
import InquiryCard from "./InquiryCard";

type Props = {
  status: InquiryStatus;
  inquiries: Inquiry[];
  onOpen: (inquiry: Inquiry) => void;
  onMove: (id: number, status: InquiryStatus) => void;
  onDragStart: (e: React.DragEvent, id: number) => void;
  onDrop: (status: InquiryStatus) => void;
};

export default function StatusColumn({
  status,
  inquiries,
  onOpen,
  onMove,
  onDragStart,
  onDrop,
}: Props) {
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        onDrop(status);
      }}
      className={`flex min-h-[60vh] w-full flex-col gap-3 rounded-lg border-2 border-dashed p-3 transition-colors ${
        isOver
          ? "border-zinc-400 bg-zinc-100 dark:border-zinc-500 dark:bg-zinc-800/60"
          : "border-transparent bg-zinc-50 dark:bg-zinc-900"
      }`}
    >
      <div className="flex items-center justify-between px-1">
        <h2 className="font-semibold text-zinc-800 dark:text-zinc-100">
          {STATUS_LABELS[status]}
        </h2>
        <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
          {inquiries.length}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {inquiries.map((inquiry) => (
          <InquiryCard
            key={inquiry.id}
            inquiry={inquiry}
            onOpen={() => onOpen(inquiry)}
            onMove={(newStatus) => onMove(inquiry.id, newStatus)}
            onDragStart={onDragStart}
          />
        ))}
        {inquiries.length === 0 && (
          <p className="px-1 text-sm text-zinc-400 dark:text-zinc-600">
            問い合わせはありません
          </p>
        )}
      </div>
    </div>
  );
}
