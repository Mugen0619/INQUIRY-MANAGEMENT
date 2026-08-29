// クライアントコンポーネントのfetch()はNext.jsのbasePathを自動付与しないため、
// APIパスを組み立てる際にこの値を明示的に前置する。
// ローカル開発時は未設定（空文字）でこれまで通り"/api/..."のまま動作する。
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
