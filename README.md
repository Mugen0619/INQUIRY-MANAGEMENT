# INQUIRY-MANAGEMENT

問い合わせ対応を1人で管理したい人向けの、シンプルな問い合わせ管理アプリです。
以前作成した TASKMANAGEMENT（Trello風タスク管理アプリ）と同様の「ステータス管理 + CRUD」
構造を持ちますが、学校課題の条件により異なる技術スタックを採用し、業務系アプリ入門として
問い合わせ管理をテーマにしています。

詳細な要件は [docs/requirements.md](docs/requirements.md) を参照してください。

## 概要

- 氏名・連絡先・件名・内容・ステータス・受付日時を持つ「問い合わせ」を管理する
- ステータス（未対応／対応中／完了）ごとに3列に分けたカンバン形式で一覧表示する
- 登録・一覧表示・編集・削除・ステータス変更（ボタンまたはドラッグ&ドロップ）ができる

## 技術スタック

- フロントエンド・バックエンド: [Next.js](https://nextjs.org/)（TypeScript、App Router）
  - バックエンド機能は Route Handlers（`app/api/**/route.ts`）で実装
- データベース: MySQL（Docker Compose で用意）
- ORM: [Prisma](https://www.prisma.io/)

## ディレクトリ構成（抜粋）

```
app/
  api/inquiries/route.ts        一覧取得・新規登録 API
  api/inquiries/[id]/route.ts   詳細取得・更新・削除 API
  components/                   カンバン画面のUIコンポーネント
  page.tsx                      トップページ（カンバン画面）
lib/
  prisma.ts                     PrismaClientのシングルトン
  validation.ts                 リクエストボディのバリデーション
  types.ts                      フロントエンド用の型定義
prisma/
  schema.prisma                 DBスキーマ定義
  migrations/                   マイグレーション履歴
docs/
  requirements.md                要件定義書
docker-compose.yml               MySQL用のDocker Compose定義
```

## 起動方法

### 前提

- Node.js 20系以上
- Docker / Docker Compose

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example` を参考に `.env` を作成します（DB接続情報）。

```bash
cp .env.example .env
```

```
DATABASE_URL="mysql://inquiry_user:inquiry_password@localhost:3306/inquiry_management"
```

本番環境ではこの `DATABASE_URL` を実際のRDS（MySQL）等のエンドポイントに差し替えるだけで
切り替えられるようにしています。

### 3. MySQLの起動（Docker）

```bash
docker compose up -d
```

初回起動時のみ、マイグレーション用ユーザーにDB作成権限を付与してください
（Prismaのシャドウデータベース作成に必要です）。

```bash
docker exec inquiry-management-db mysql -uroot -proot_password \
  -e "GRANT ALL PRIVILEGES ON *.* TO 'inquiry_user'@'%'; FLUSH PRIVILEGES;"
```

### 4. マイグレーションの実行

```bash
npx prisma migrate dev
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) にアクセスするとカンバン画面が表示されます。

## 動作確認

以下を確認済みです。

- `npx next build` によるビルド・型チェックが成功すること
- `npx eslint .` でLintエラーがないこと
- APIエンドポイント（GET/POST /api/inquiries、GET/PUT/DELETE /api/inquiries/[id]）が
  curlで正しく動作すること（登録・取得・更新・削除、日本語データのUTF-8往復も含む）
- ブラウザ（Playwrightによるヘッドレスブラウザ操作）で以下が正常に動作すること
  - カンバン画面の表示
  - 新規登録
  - 編集
  - ステータス変更（ボタン操作）
  - ステータス変更（ドラッグ&ドロップ）
  - 削除

## 今回のスコープ外

- ログイン・ユーザー管理
- 優先度・タグなどの付加情報
- メール通知機能
- 本番環境へのデプロイ
