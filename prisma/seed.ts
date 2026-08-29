import { PrismaClient, InquiryCategory, InquiryStatus } from "../app/generated/prisma/client";

const prisma = new PrismaClient();

const sampleInquiries = [
  {
    name: "山田太郎",
    contact: "yamada@example.com",
    subject: "配送状況について知りたい",
    content: "注文した商品がまだ届きません。配送状況を教えてください。",
    category: InquiryCategory.SHIPPING,
    status: InquiryStatus.UNCONTACTED,
    receivedAt: new Date("2026-08-25T09:00:00+09:00"),
  },
  {
    name: "佐藤花子",
    contact: "090-1234-5678",
    subject: "クレジットカードの請求について",
    content: "身に覚えのない請求があります。確認をお願いします。",
    category: InquiryCategory.PAYMENT,
    status: InquiryStatus.UNCONTACTED,
    receivedAt: new Date("2026-08-26T10:30:00+09:00"),
  },
  {
    name: "鈴木一郎",
    contact: "suzuki@example.com",
    subject: "商品のサイズ展開について",
    content: "購入を検討していますが、他のサイズはありますか。",
    category: InquiryCategory.PRODUCT,
    status: InquiryStatus.IN_PROGRESS,
    receivedAt: new Date("2026-08-27T13:15:00+09:00"),
  },
  {
    name: "田中みどり",
    contact: "080-2345-6789",
    subject: "返品方法について",
    content: "サイズが合わなかったため返品したいです。手順を教えてください。",
    category: InquiryCategory.PRODUCT,
    status: InquiryStatus.IN_PROGRESS,
    receivedAt: new Date("2026-08-27T16:45:00+09:00"),
  },
  {
    name: "高橋健",
    contact: "takahashi@example.com",
    subject: "領収書の再発行について",
    content: "経費精算のため領収書を再発行してほしいです。",
    category: InquiryCategory.PAYMENT,
    status: InquiryStatus.DONE,
    receivedAt: new Date("2026-08-24T11:00:00+09:00"),
  },
  {
    name: "伊藤さくら",
    contact: "ito@example.com",
    subject: "その他のお問い合わせ",
    content: "サイトの使い方について質問があります。",
    category: InquiryCategory.OTHER,
    status: InquiryStatus.DONE,
    receivedAt: new Date("2026-08-23T14:20:00+09:00"),
  },
];

async function main() {
  await prisma.inquiry.deleteMany();
  await prisma.inquiry.createMany({ data: sampleInquiries });
  console.log(`シードデータを${sampleInquiries.length}件投入しました。`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
