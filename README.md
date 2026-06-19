# 観光活用 着想ノート

相続した不動産の「一般的な属性」を入力すると、観光活用のアイデア（2〜3案）と、各案に対する実務経験に基づく「専門家の注意点」をセットで返す Next.js アプリです。出力末尾から、LINE相談・メール登録・相続相談LPへ誘導します。

詳細設計は `観光活用 着想ノート ― 詳細設計書 v1` に準拠しています。

## 技術スタック

- Next.js（App Router）/ TypeScript / Tailwind CSS
- AI：Claude Haiku（Anthropic API、モデル `claude-haiku-4-5-20251001`）
- メール登録：Brevo（連絡先API）
- ホスティング：Vercel（想定）/ 計測：GA4

## セットアップ

```bash
npm install
cp .env.local.example .env.local   # 値を入れる
npm run dev
```

http://localhost:3000 を開きます。

## 環境変数

`.env.local`（gitに含めない）に設定します。Vercel では Environment Variables に同じものを登録します。

| 変数 | 用途 | 公開範囲 |
|---|---|---|
| `ANTHROPIC_API_KEY` | アイデア生成用 | サーバー側のみ |
| `BREVO_API_KEY` | メール登録用 | サーバー側のみ |
| `BREVO_LIST_ID` | 登録先リストID（任意） | サーバー側のみ |
| `NEXT_PUBLIC_LINE_ADD_URL` | LINE友だち追加リンク | ブラウザ側に出てよい |
| `NEXT_PUBLIC_LP_URL` | 相続相談LPのURL | ブラウザ側に出てよい |
| `NEXT_PUBLIC_GA_ID` | GA4 測定ID（任意） | ブラウザ側に出てよい |

設計上の要：APIキーは `app/api/generate/route.ts`（サーバー側）でのみ使用します。物件情報を扱う `generate` と、連絡先を扱う `subscribe` は別Routeに分離しています。

## ディレクトリ構成

```
app/
  page.tsx                  # トップ（Suspenseで HomeClient を包む）
  layout.tsx                # 全体レイアウト・GA4タグ
  globals.css               # Tailwind読み込み
  privacy/page.tsx          # プライバシーポリシー
  api/
    generate/route.ts       # Claude APIを呼ぶ（キーはここだけ）
    subscribe/route.ts      # メール登録をBrevoに渡す（AIには送らない）
components/
  HomeClient.tsx            # 入力⇔結果の画面オーケストレーション
  InputForm.tsx             # 入力フォーム（選択式＋自由記述）
  ResultCard.tsx            # 生成結果（アイデア＋注意点）表示
  Disclaimer.tsx            # 免責・相談導線
lib/
  prompt.ts                 # プロンプト組み立て＋実務知見ライブラリ
  options.ts                # 選択肢マスタ
  validation.ts             # 送信前の機微情報チェック
  analytics.ts              # GA4イベント（generate_click 等）
  types.ts                  # 型定義
```

## 機微情報を入れさせない二段構え

1. 記入の抑止：画面とプレースホルダーに平易な注意書き。
2. 送信前チェック：番地らしい数字の並びや「相続」「名前」等を `lib/validation.ts` で検知し送信を止める。

加えてプロンプト側でも、特定情報は使わない・書き写さないよう指示しています。

## デプロイ（Vercel）

1. GitHub にリポジトリを push
2. Vercel でインポート
3. Environment Variables に上記の変数を登録
4. Deploy。以降は git push で自動再デプロイ
