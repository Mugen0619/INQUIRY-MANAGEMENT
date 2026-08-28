# 問い合わせ管理アプリ 要件定義書

## 1. 概要
問い合わせ対応を1人で管理する人向けの、シンプルな問い合わせ管理アプリ。
以前作成した TASKMANAGEMENT（Trello風タスク管理アプリ、React + Spring Boot + PostgreSQL）と
似た「ステータス管理 + CRUD」構造を持つが、学校課題の条件により異なる技術スタックを採用し、
業務系アプリ入門として問い合わせ管理をテーマにする。

## 2. 対象ユーザー
問い合わせ対応を1人で管理したい人（社内の問い合わせ窓口担当者など）。

## 3. 技術スタック
- フロントエンド・バックエンド: Next.js（TypeScript、App Router）
  - バックエンド機能は Route Handlers（`app/api/**/route.ts`）で実装し、別フレームワークは使わない
- データベース: MySQL（Docker で用意）
- ORM: Prisma

## 4. データモデル（Inquiry）
| 項目 | 型 | 説明 |
|---|---|---|
| id | Int（自動採番） | 主キー |
| name | String | 氏名 |
| contact | String | 連絡先（メールまたは電話。自由入力） |
| subject | String | 件名 |
| content | String（Text） | 内容 |
| status | Enum（UNCONTACTED / IN_PROGRESS / DONE） | ステータス（未対応／対応中／完了） |
| receivedAt | DateTime | 受付日時 |
| createdAt | DateTime | 作成日時（自動） |
| updatedAt | DateTime | 更新日時（自動） |

## 5. 画面
- カンバン形式の一覧画面（TASKMANAGEMENTと同様）
  - 「未対応」「対応中」「完了」の3列でステータスごとに問い合わせを表示
  - 各カードに氏名・件名・受付日時・連絡先を表示
  - 新規登録用フォーム（モーダルまたは専用フォーム）
  - カードクリックで編集・削除
  - ステータス変更はボタン操作、またはドラッグ&ドロップ

## 6. 機能一覧
- 問い合わせの登録（作成）
- 問い合わせの一覧表示（ステータス別カンバン表示）
- 問い合わせの編集（更新）
- 問い合わせの削除
- ステータス変更（ボタンまたはドラッグ&ドロップ）

## 7. API（Route Handlers）
| メソッド | パス | 内容 |
|---|---|---|
| GET | /api/inquiries | 問い合わせ一覧取得 |
| POST | /api/inquiries | 問い合わせ新規登録 |
| GET | /api/inquiries/[id] | 問い合わせ詳細取得 |
| PUT | /api/inquiries/[id] | 問い合わせ更新（内容・ステータス変更を含む） |
| DELETE | /api/inquiries/[id] | 問い合わせ削除 |

## 8. 環境変数
本番環境（既存EC2への同居、MySQL用RDS新規作成）へ切り替えやすいよう、
DB接続情報は `.env` の `DATABASE_URL` に一本化する。

```
DATABASE_URL="mysql://user:password@localhost:3306/inquiry_management"
```

## 9. 対象外（今回のスコープ外）
- ログイン・ユーザー管理
- 優先度・タグなどの付加情報
- メール通知機能
- 本番環境へのデプロイ

## 10. デプロイ方針（参考・今回は対象外）
将来デプロイする際は以下を予定。今回は実装に集中するが、環境変数を通じて
本番構成に切り替えやすい作りにしておく。
- EC2は新規に用意せず、TASKMANAGEMENTが稼働中の既存EC2インスタンスに同居（ポートまたはパスで振り分け）
- RDSは、既存PostgreSQL用インスタンスとは別に、MySQL用の新しいインスタンスを用意
- 実際のインフラ変更（EC2セキュリティグループ・ポート開放など）はTASKMANAGEMENT側のインフラ用チャットで実施
