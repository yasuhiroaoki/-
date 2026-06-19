"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

// 出口・相談導線（4.3）。免責文 → LINE（主役） → メール（副役） → LPテキストリンク。
// 連絡先（メール・LINE）は物件情報をAIに送る経路とは完全に別系統。

const DISCLAIMER = `本ツールが返すのは、一般的な属性から導いた着想の叩き台である。実際の活用可否は、立地の商圏、建物の状態、権利関係、資金計画といった個別事情に左右される。とりわけ相続した不動産は、境界の未確定や未登記の増築など、調査して初めて表面化する論点が少なくない。具体的な検討に進む際は、専門的な視点を外部から添えることをお勧めする。`;

type SubmitState = "idle" | "loading" | "done" | "error";

export default function Disclaimer() {
  const lineUrl = process.env.NEXT_PUBLIC_LINE_ADD_URL;
  const lpUrl =
    process.env.NEXT_PUBLIC_LP_URL ??
    "https://alfa-consulting.co.jp/sozoku-fudosan-katsuyo/";

  const [email, setEmail] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    setMessage("");
    trackEvent("email_submit");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (res.ok) {
        setState("done");
        setMessage("登録しました。メールをご確認ください。");
        setEmail("");
      } else {
        setState("error");
        setMessage(data.error ?? "登録に失敗しました。");
      }
    } catch {
      setState("error");
      setMessage("通信に失敗しました。時間をおいて再度お試しください。");
    }
  };

  return (
    <section className="space-y-6">
      {/* 免責文（出口の前に置く） */}
      <p className="rounded-2xl bg-stone-100 p-5 text-sm leading-relaxed text-stone-700">
        {DISCLAIMER}
      </p>

      {/* 【主役】LINEで相談する */}
      {lineUrl ? (
        <a
          href={lineUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("line_add_click")}
          className="block rounded-2xl bg-[#06C755] px-6 py-5 text-center text-lg font-bold text-white shadow-md transition hover:opacity-90"
        >
          LINEで相談する（無料）
          <span className="mt-1 block text-sm font-normal opacity-90">
            友だち追加して、気になる点をそのまま聞けます
          </span>
        </a>
      ) : null}

      {/* 【副役】結果をメールで受け取る／PDFで保存する */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
        <h3 className="font-semibold text-ink">
          結果をメールで受け取る／PDFで保存する
        </h3>
        <p className="mt-1 text-xs text-stone-500">
          メールアドレスだけで登録できます。物件情報やAIへの送信内容とは別に扱います。
        </p>
        {state === "done" ? (
          <p className="mt-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-200">
            {message}
          </p>
        ) : (
          <form
            onSubmit={handleEmailSubmit}
            className="mt-3 flex flex-col gap-2 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={state === "loading"}
              className="rounded-lg bg-ink px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
            >
              {state === "loading" ? "送信中…" : "受け取る"}
            </button>
          </form>
        )}
        {state === "error" ? (
          <p className="mt-2 text-sm text-enji">{message}</p>
        ) : null}
      </div>

      {/* 【テキストリンク】じっくり相談したい方へ */}
      <p className="text-center text-sm">
        <a
          href={lpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-stone-500 underline underline-offset-2 hover:text-ink"
        >
          じっくり相談したい方へ（相続不動産の活用ページ）
        </a>
      </p>

      <p className="text-center text-xs text-stone-400">
        <a href="/privacy" className="underline underline-offset-2">
          プライバシーポリシー
        </a>
      </p>
    </section>
  );
}
