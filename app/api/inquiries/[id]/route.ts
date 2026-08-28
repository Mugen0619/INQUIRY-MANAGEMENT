import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { parseInquiryPatch, ValidationError } from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

function parseId(idParam: string): number | null {
  const id = Number(idParam);
  return Number.isInteger(id) ? id : null;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (id === null) {
    return NextResponse.json({ error: "IDが不正です。" }, { status: 400 });
  }

  const inquiry = await prisma.inquiry.findUnique({ where: { id } });
  if (!inquiry) {
    return NextResponse.json(
      { error: "問い合わせが見つかりません。" },
      { status: 404 },
    );
  }
  return NextResponse.json(inquiry);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (id === null) {
    return NextResponse.json({ error: "IDが不正です。" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const data = parseInquiryPatch(body);
    const inquiry = await prisma.inquiry.update({ where: { id }, data });
    return NextResponse.json(inquiry);
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "問い合わせが見つかりません。" },
        { status: 404 },
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "問い合わせの更新に失敗しました。" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (id === null) {
    return NextResponse.json({ error: "IDが不正です。" }, { status: 400 });
  }

  try {
    await prisma.inquiry.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "問い合わせが見つかりません。" },
        { status: 404 },
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "問い合わせの削除に失敗しました。" },
      { status: 500 },
    );
  }
}
