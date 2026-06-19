// Claude API（Claude Haiku）を呼ぶサーバー処理（5章）
// APIキーはこのファイル（サーバー側）でのみ使用する。ブラウザ側には絶対に置かない。

import Anthropic from "@anthropic-ai/sdk";
import { buildPrompt } from "@/lib/prompt";
import type { FormInput, GenerateResult } from "@/lib/types";

// このルートは動的に実行する（ビルド時に評価しない）
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 設計書 2章で指定されたモデル文字列
const MODEL = "claude-haiku-4-5-20251001";

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "サーバー設定エラー：APIキーが未設定です。" },
      { status: 500 },
    );
  }

  let input: FormInput;
  try {
    input = (await req.json()) as FormInput;
  } catch {
    return Response.json({ error: "入力の形式が不正です。" }, { status: 400 });
  }

  // 必須3項目が無ければ弾く
  if (!input.area_type || !input.building_type || !input.access) {
    return Response.json(
      { error: "必須項目が入力されていません。" },
      { status: 400 },
    );
  }

  const anthropic = new Anthropic({ apiKey });
  const prompt = buildPrompt(input);

  try {
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    let text = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    const data = parseResult(text);
    if (!data) {
      return Response.json(
        { error: "結果の解析に失敗しました。もう一度お試しください。" },
        { status: 502 },
      );
    }

    return Response.json(data);
  } catch (err) {
    console.error("generate error:", err);
    return Response.json(
      { error: "アイデアの生成に失敗しました。時間をおいて再度お試しください。" },
      { status: 502 },
    );
  }
}

// 念のため try/catch でパースし、失敗時は ```json フェンスを除去して再パースする（5.2）
function parseResult(text: string): GenerateResult | null {
  const tryParse = (s: string): GenerateResult | null => {
    try {
      const obj = JSON.parse(s) as GenerateResult;
      if (Array.isArray(obj.ideas) && typeof obj.common_caution === "string") {
        return obj;
      }
      return null;
    } catch {
      return null;
    }
  };

  const direct = tryParse(text.trim());
  if (direct) return direct;

  // ```json ... ``` フェンスを除去して再パース
  const stripped = text.replace(/```json|```/g, "").trim();
  const second = tryParse(stripped);
  if (second) return second;

  // 文中の最初の { から最後の } までを抜き出して再パース
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return tryParse(stripped.slice(start, end + 1));
  }

  return null;
}
