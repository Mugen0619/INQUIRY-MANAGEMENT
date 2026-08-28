import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseInquiryInput, ValidationError } from "@/lib/validation";

export async function GET() {
  const inquiries = await prisma.inquiry.findMany({
    orderBy: { receivedAt: "desc" },
  });
  return NextResponse.json(inquiries);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = parseInquiryInput(body);
    const inquiry = await prisma.inquiry.create({ data: input });
    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "問い合わせの登録に失敗しました。" },
      { status: 500 },
    );
  }
}
