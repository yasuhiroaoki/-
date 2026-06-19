// メール登録処理（5.4）— 連絡先専用の経路。AI（Anthropic）は一切呼ばない。
// 物件情報を扱う generate と、連絡先を扱う subscribe を別Routeに分けることが安全設計の要。

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SubscribeBody {
  email?: string;
}

// 簡易メール形式チェック
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  let body: SubscribeBody;
  try {
    body = (await req.json()) as SubscribeBody;
  } catch {
    return Response.json({ error: "入力の形式が不正です。" }, { status: 400 });
  }

  const email = (body.email ?? "").trim();
  if (!email || !isValidEmail(email)) {
    return Response.json(
      { error: "メールアドレスの形式が正しくありません。" },
      { status: 400 },
    );
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "サーバー設定エラー：メール登録が未設定です。" },
      { status: 500 },
    );
  }

  // Brevo（旧Sendinblue）の連絡先作成API。
  // listIds を指定すると、既存のautomation（ウェルカムメール→PDF）が発火する。
  const listId = process.env.BREVO_LIST_ID;
  const payload: Record<string, unknown> = {
    email,
    updateEnabled: true, // 既存連絡先でもエラーにせず更新する
  };
  if (listId) {
    payload.listIds = [Number(listId)];
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    // 201 作成 / 204 更新 を成功とみなす。重複（既存）も成功扱いにする。
    if (res.ok || res.status === 204) {
      return Response.json({ ok: true });
    }

    // Brevoが重複を 400 (duplicate_parameter) で返す場合も、登録済みとして成功扱い
    const data = (await res.json().catch(() => null)) as
      | { code?: string }
      | null;
    if (res.status === 400 && data?.code === "duplicate_parameter") {
      return Response.json({ ok: true, alreadyRegistered: true });
    }

    console.error("brevo error:", res.status, data);
    return Response.json(
      { error: "登録に失敗しました。時間をおいて再度お試しください。" },
      { status: 502 },
    );
  } catch (err) {
    console.error("subscribe error:", err);
    return Response.json(
      { error: "登録に失敗しました。時間をおいて再度お試しください。" },
      { status: 502 },
    );
  }
}
