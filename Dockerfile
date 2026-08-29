# ---- deps: 依存パッケージのインストール ----
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: Prisma Client生成・Next.jsビルド ----
FROM node:20-bookworm-slim AS builder
WORKDIR /app
# Prismaがlibssl/opensslのバージョンを正しく検出できるようにする
# (未インストールだとopenssl-1.1.x向けエンジンにフォールバックし、
# bookwormのOpenSSL 3系と噛み合わず実行時エラーになるため)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# prisma generateはDBに接続しないが、prisma.config.tsがDATABASE_URLの存在を要求するため
# ビルド時点ではダミー値を設定する(実際の接続情報はコンテナ起動時に環境変数として渡す)
ENV DATABASE_URL="mysql://user:password@localhost:3306/db"
# basePath配下にデプロイする場合、クライアントバンドルに埋め込むため
# ビルド時点でNEXT_PUBLIC_BASE_PATHを渡す必要がある(実行時のenvironment設定だけでは
# クライアント側のfetch()呼び出しには反映されない)
ARG NEXT_PUBLIC_BASE_PATH=""
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
RUN npx prisma generate
RUN npm run build

# ---- runner: 本番実行用イメージ ----
# Prisma CLI(migrate deploy用)は依存関係が多く、standalone出力からの個別コピーだと
# 欠落が起きやすいため、node_modulesを丸ごとコピーするシンプルな構成にしている。
FROM node:20-bookworm-slim AS runner
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/app/generated/prisma ./app/generated/prisma

EXPOSE 3000
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && npm run start"]
