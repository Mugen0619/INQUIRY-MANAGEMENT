# 問い合わせ管理アプリ 要件定義書

## 1. 概要
問い合わせ対応を1人で管理する人向けの、シンプルな問い合わせ管理アプリ。
以前作成した TASKMANAGEMENT（Trello風タスク管理アプリ、React + Spring Boot + PostgreSQL）と
似た「ステータス管理 + CRUD」構造を持つが、学校課題の条件により異なる技術スタックを採用し、
業務系アプリ入門として問い合わせ管理をテーマにする。

初期実装では、カンバン画面（個人情報を含む問い合わせ一覧）が認証なしで誰でも閲覧できる
状態になっていたため、ユーザー側（公開の送信フォームのみ）と管理者側（認証必須のカンバン画面）に
画面を分離し、個人情報を保護する形に見直した。

## 2. 対象ユーザー
- ユーザー（問い合わせをする人）: 誰でもアクセス可能。ログイン不要
- 管理者（問い合わせ対応を1人で管理したい人）: パスワードでログインした人のみ

## 3. 技術スタック
- フロントエンド・バックエンド: Next.js（TypeScript、App Router）
  - バックエンド機能は Route Handlers（`app/api/**/route.ts`）で実装し、別フレームワークは使わない
  - 認証保護は Next.js の Proxy（旧Middleware。`proxy.ts`）で実装
- データベース: MySQL（Docker で用意）
- ORM: Prisma

## 4. データモデル（Inquiry）
| 項目 | 型 | 説明 |
|---|---|---|
| id | Int（自動採番） | 主キー |
| name | String | 氏名（最大100文字） |
| contact | String | 連絡先（メールまたは電話。自由入力、最大191文字） |
| subject | String | 件名（最大191文字） |
| content | String（Text） | 内容（最大5000文字） |
| category | Enum（SHIPPING / PAYMENT / PRODUCT / OTHER） | カテゴリ（配送について／支払いについて／商品について／その他） |
| status | Enum（UNCONTACTED / IN_PROGRESS / DONE） | ステータス（未対応／対応中／完了） |
| receivedAt | DateTime | 受付日時（公開フォームからの送信時は送信時刻を自動設定） |
| createdAt | DateTime | 作成日時（自動） |
| updatedAt | DateTime | 更新日時（自動） |

contact/subjectの文字数上限（191文字）は、MySQLの`VARCHAR`列のデフォルト長（191）を
超えないようにするためのもの。nameの上限（100文字）は氏名として妥当な長さとして設定した。
いずれも、`POST /api/inquiries`が未認証で呼び出せることを踏まえ、過大なペイロードの
送信を防ぐ目的を兼ねる。

## 5. 画面

### 5.1 ユーザー側（公開・認証不要）
- パス: `/`
- カテゴリ選択＋氏名・連絡先・件名・内容を入力する、送信フォームのみのページ
- 他の問い合わせ内容は一切表示しない（個人情報保護のため、一覧・詳細の閲覧機能を持たせない）
- 送信後は完了メッセージを表示する

### 5.2 管理者側（認証必須）
- パス: `/admin`（未ログイン時は `/admin/login` にリダイレクト）
- ログインページ: `/admin/login`（パスワードのみの簡易ログインフォーム）
- カンバン形式の一覧画面（TASKMANAGEMENTと同様）
  - 「未対応」「対応中」「完了」の3列でステータスごとに問い合わせを表示
  - 各カードにカテゴリ・氏名・件名・受付日時・連絡先を表示
  - 新規登録用フォーム（モーダル）、カードクリックで編集・削除
  - ステータス変更はボタン操作、またはドラッグ&ドロップ
  - カテゴリによる絞り込み、受付日時・氏名による並び替え

## 6. 機能一覧
- （ユーザー側）問い合わせの送信（登録）
- （管理者側）問い合わせの一覧表示（ステータス別カンバン表示、カテゴリ絞り込み・並び替え）
- （管理者側）問い合わせの編集（更新）・削除
- （管理者側）ステータス変更（ボタンまたはドラッグ&ドロップ）
- （管理者側）パスワードによるログイン・ログアウト

## 7. API（Route Handlers）
| メソッド | パス | 内容 | 認証 |
|---|---|---|---|
| POST | /api/inquiries | 問い合わせ新規登録 | 不要（公開フォームからの送信） |
| GET | /api/inquiries | 問い合わせ一覧取得 | 必須 |
| GET | /api/inquiries/[id] | 問い合わせ詳細取得 | 必須 |
| PUT | /api/inquiries/[id] | 問い合わせ更新（内容・ステータス変更を含む） | 必須 |
| DELETE | /api/inquiries/[id] | 問い合わせ削除 | 必須 |
| POST | /api/auth/login | 管理者ログイン（パスワード照合、セッションCookie発行） | 不要 |
| POST | /api/auth/logout | 管理者ログアウト（セッションCookie失効） | 不要 |

一覧・詳細・更新・削除のAPIは、画面のログイン保護とは別に、`proxy.ts`（Next.jsのProxy機能）が
リクエスト単位でセッションCookieを検証し、未ログインの場合は401を返して呼び出しそのものを拒否する。
これにより、画面を経由せずURLを直接指定した場合でも個人情報を含むデータは取得できない。

## 8. 認証方式
- 管理者パスワードを環境変数 `ADMIN_PASSWORD` として保持する
- `POST /api/auth/login` でパスワードを照合し、一致すればパスワードのハッシュ値（SHA-256）を
  `httpOnly` なセッションCookieとして発行する
- `proxy.ts` が、保護対象のパス（`/admin/*` ページ、`/api/inquiries` 系API）へのリクエストごとに
  Cookieの値を再計算した期待値と比較し、一致しない場合はページなら `/admin/login` へリダイレクト、
  APIなら401を返す
- セッションは環境変数のみから導出され、サーバー側でセッションを保存するストレージを持たない
  （ステートレス。Cookie自体の有効期限（7日間）で失効する）
- セッションCookieのSecure属性は環境変数 `COOKIE_SECURE`（デフォルト`false`）で制御する。
  本番デプロイ先（12章参照）は現状HTTPS未対応のため`false`のままとし、HTTPS化した際に
  `true`へ切り替える（`NODE_ENV`で判定すると、本番かつHTTPS未対応の現状でSecure Cookieが
  送信されずログインが機能しなくなるため、独立した環境変数にしている）

### なぜNextAuth.js等のライブラリを使わなかったか
今回の認証要件は「管理者パスワードが1つだけ」という非常にシンプルなものであり、
複数ユーザー・ロール管理・外部IdP連携などを前提としたNextAuth.js等のライブラリを導入すると、
要件に対して過剰な作り込みになる。Next.jsのProxy機能とCookieのみで実装することで、
依存を増やさずに要件を満たしつつ、実装・レビューのコストを最小限に抑えている。

## 9. 対象外（今回のスコープ外）
- カテゴリ別に問い合わせと回答を一般公開するQ&Aページ（→ 「11. 今後の展望」を参照）
- メール通知機能
- 独自ドメイン取得・HTTPS化
- 管理者の複数アカウント対応・ロール管理
- 新しいRDSインスタンスの作成（12章の通り、既存EC2上のDockerコンテナでMySQLを構成する方針のため）

## 10. 環境変数
DB接続情報は `.env` の `DATABASE_URL` に一本化する。管理者パスワードも同様に環境変数で管理する。
これにより、接続先を実際の本番用MySQL（12章の通り、既存EC2上のDockerコンテナ）に
差し替えるだけで環境を切り替えられる。

```
DATABASE_URL="mysql://user:password@localhost:3306/inquiry_management"
ADMIN_PASSWORD="change-me"
```

本番デプロイ用の環境変数（`COOKIE_SECURE`等）は12章および `.env.prod.example` を参照。

## 11. 今後の展望（今回は対象外）
- カテゴリ別に問い合わせとその回答を一般公開するQ&Aページ
  - 管理者が問い合わせに回答した内容を、個人情報（氏名・連絡先）を除いた形でカテゴリ別に公開する
  - よくある質問の再問い合わせを減らす目的
  - 実装する場合、Inquiryに「公開する回答」を紐づける項目（例: publishedAnswer, isPublished）の追加を検討する

## 12. デプロイ方針
TASKMANAGEMENT用の既存EC2（t3.micro）に同居させる形でデプロイする。PostgreSQL RDSが
無料利用枠をほぼ使い切っているため、新しいRDSは作らず、MySQLも同じEC2上のDockerコンテナ
として動かす。新しいAWSリソース（RDS・セキュリティグループ等、追加費用が発生するもの）は
一切作成しない。

- **ルーティング**: パスベース（`/inquiries`配下）。EC2のセキュリティグループはポート80のみ
  公開・ポート22は自分のIP限定という現状を変えないため、新しいポート開放は行わない
- **basePath**: `next.config.ts`で`NEXT_PUBLIC_BASE_PATH`環境変数から`basePath`を設定し、
  TASKMANAGEMENT側nginxの`location /inquiries`でこのアプリのコンテナへリバースプロキシする
  （Next.js自身が`/inquiries/`→`/inquiries`へ308リダイレクトするため、nginx側は末尾
  スラッシュなしのプレフィックスマッチにしている。末尾スラッシュ付きにすると無限
  リダイレクトになる）
- **ネットワーク**: TASKMANAGEMENTとINQUIRY-MANAGEMENTのdocker-composeスタックは分離したまま、
  EC2上に作成する外部Dockerネットワーク（`shared_net`）経由で疎通させる。ホストへの新規
  ポート公開は行わない
- **DB接続**: MySQLコンテナはホストにポートを公開せず、`shared_net`内で`mysql`という
  サービス名でこのアプリのコンテナからのみ到達可能にする
- **マイグレーション**: 本番では`prisma migrate deploy`を使う（`prisma migrate dev`は
  シャドウDB作成のため広いDB権限を要求するが、`migrate deploy`は不要）
- **メモリ**: t3.micro（メモリ1GB）でbackend/frontend/mysql/inquiry-appの4コンテナが
  同時稼働するため、mysql（`innodb-buffer-pool-size=64M`等）・inquiry-app
  （`NODE_OPTIONS=--max-old-space-size=192`）にメモリ抑制設定を入れている
- **EC2・RDSのTerraform構成自体は変更しない**: `ec2.tf`・`security_group.tf`・`rds.tf`・
  `user_data.sh.tpl`は変更せず、アプリ層（docker-compose・nginx設定）の追加のみで対応する
- 本番用の構成ファイルは`Dockerfile`・`docker-compose.prod.yml`（このリポジトリ）と、
  TASKMANAGEMENT側の`frontend/nginx.conf`（別リポジトリ、別途対応）
