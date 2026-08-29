# INQUIRY-MANAGEMENT

問い合わせ対応を1人で管理したい人向けの、シンプルな問い合わせ管理アプリです。
以前作成した TASKMANAGEMENT（Trello風タスク管理アプリ）と同様の「ステータス管理 + CRUD」
構造を持ちますが、学校課題の条件により異なる技術スタックを採用し、業務系アプリ入門として
問い合わせ管理をテーマにしています。

ユーザー側（誰でも送信できる公開フォーム）と管理者側（パスワードでログインした人だけが見られる
カンバン画面）を分離しており、氏名・連絡先などの個人情報は管理者以外には見えません。

詳細な要件は [docs/requirements.md](docs/requirements.md) を参照してください。

## 概要

- 氏名・連絡先・件名・内容・カテゴリ・ステータス・受付日時を持つ「問い合わせ」を管理する
- ユーザーはログイン不要で問い合わせを送信できる（送信フォームのみで、他の問い合わせは見えない）
- 管理者はパスワードでログインし、ステータス（未対応／対応中／完了）ごとに3列に分けた
  カンバン形式で一覧表示・編集・削除・ステータス変更（ボタンまたはドラッグ&ドロップ）ができる
- 管理者画面ではカテゴリによる絞り込み・並び替えができる
- 問い合わせの一覧・詳細・更新・削除APIは、未ログイン状態では呼び出せない

## 技術スタック

- フロントエンド・バックエンド: [Next.js](https://nextjs.org/)（TypeScript、App Router）
  - バックエンド機能は Route Handlers（`app/api/**/route.ts`）で実装
  - 認証保護は Next.js の Proxy（`proxy.ts`。旧Middleware）とCookieによる自作の仕組みで実装
    （NextAuth.js等は「パスワード1つ」の要件に対してオーバースペックのため不使用。詳細は
    [docs/requirements.md](docs/requirements.md) の「8. 認証方式」を参照）
- データベース: MySQL（Docker Compose で用意）
- ORM: [Prisma](https://www.prisma.io/)

## ディレクトリ構成（抜粋）

```
app/
  page.tsx                       ユーザー側: 問い合わせ送信フォーム（公開）
  admin/page.tsx                 管理者側: カンバン画面（認証必須）
  admin/login/page.tsx           管理者ログインページ
  api/inquiries/route.ts         一覧取得（要認証）・新規登録（公開） API
  api/inquiries/[id]/route.ts    詳細取得・更新・削除 API（要認証）
  api/auth/login/route.ts        管理者ログインAPI
  api/auth/logout/route.ts       管理者ログアウトAPI
  components/                    UIコンポーネント（送信フォーム・カンバン画面など）
lib/
  prisma.ts                      PrismaClientのシングルトン
  validation.ts                  リクエストボディのバリデーション
  auth.ts                        パスワード照合・セッショントークンの検証
  types.ts                       フロントエンド用の型定義
proxy.ts                         管理者ページ・保護対象APIの認証チェック（Next.js Proxy）
prisma/
  schema.prisma                  DBスキーマ定義
  migrations/                    マイグレーション履歴
  seed.ts                        サンプルデータ投入スクリプト
docs/
  requirements.md                 要件定義書
docker-compose.yml                MySQL用のDocker Compose定義
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

`.env.example` を参考に `.env` を作成します。

```bash
cp .env.example .env
```

```
# DB接続情報
DATABASE_URL="mysql://inquiry_user:inquiry_password@localhost:3306/inquiry_management"

# 管理者ページ(/admin)のログインに使用するパスワード。本番では推測されにくい値に変更する
ADMIN_PASSWORD="change-me"
```

本番環境ではこれらの値を実際のRDS（MySQL）エンドポイントや、推測されにくいパスワードに
差し替えるだけで切り替えられるようにしています。

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

### 5. サンプルデータの投入（任意）

カテゴリ・ステータスが異なる問い合わせのサンプルデータを投入し、管理者画面での見え方を
すぐに確認できます（実行するたびに既存データは全件削除されてから再投入されます）。

```bash
npx prisma db seed
```

### 6. 開発サーバーの起動

```bash
npm run dev
```

- ユーザー側（問い合わせ送信フォーム、ログイン不要）: [http://localhost:3000/](http://localhost:3000/)
- 管理者側（カンバン画面、要ログイン）: [http://localhost:3000/admin](http://localhost:3000/admin)
  - 未ログインの場合は自動的に [http://localhost:3000/admin/login](http://localhost:3000/admin/login) にリダイレクトされます
  - `.env` の `ADMIN_PASSWORD` に設定した値でログインしてください

## テスト

```bash
npm test
```

## 動作確認

以下を確認済みです。

- `npm test` で全テスト（バリデーション・APIルート・認証・Proxyの認可制御）が成功すること
- `npx next build` によるビルド・型チェックが成功すること
- `npx eslint .` でLintエラーがないこと
- 未ログインの状態でユーザー側フォーム（`/`）から問い合わせを送信でき、完了メッセージが
  表示されること
- 未ログインの状態で管理者ページ（`/admin`）にアクセスするとログインページへリダイレクトされ、
  一覧・詳細・更新・削除のAPI（`/api/inquiries`系）に直接アクセスしても401が返り拒否されること
- 正しいパスワードでログインすると管理者ページに遷移し、カンバン一覧・カテゴリ絞り込み・
  並び替え・新規登録・編集・削除・ステータス変更（ボタン/ドラッグ&ドロップ）ができること
- ログアウトすると再度ログインページへ戻ること

## 今回のスコープ外

- カテゴリ別に問い合わせと回答を一般公開するQ&Aページ（今後の展望として
  [docs/requirements.md](docs/requirements.md) に記載）
- メール通知機能
- 本番環境へのデプロイ
- 管理者の複数アカウント対応・ロール管理
