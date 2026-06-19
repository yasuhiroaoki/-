"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import InputForm from "@/components/InputForm";
import ResultCard from "@/components/ResultCard";
import Disclaimer from "@/components/Disclaimer";
import { trackEvent } from "@/lib/analytics";
import type { FormInput, GenerateResult } from "@/lib/types";

// URLパラメータ ⇔ FormInput の相互変換。
// 生成条件をURLに保持し、「条件を変えて出し直す」が前回値を保ったまま開けるようにする（4.1）。
const PARAM_KEYS: (keyof FormInput)[] = [
  "area_type",
  "building_type",
  "access",
  "prefecture",
  "floor_area",
  "building_age",
  "status",
  "free_text",
];

function fromParams(params: URLSearchParams): FormInput {
  const get = (k: keyof FormInput) => params.get(k) ?? "";
  return {
    area_type: get("area_type"),
    building_type: get("building_type"),
    access: get("access"),
    prefecture: get("prefecture"),
    floor_area: get("floor_area"),
    building_age: get("building_age"),
    status: get("status"),
    free_text: get("free_text"),
  };
}

function toQuery(input: FormInput): string {
  const params = new URLSearchParams();
  for (const k of PARAM_KEYS) {
    const v = input[k];
    if (v) params.set(k, v);
  }
  return params.toString();
}

export default function HomeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = useMemo(() => fromParams(searchParams), [searchParams]);

  const [result, setResult] = useState<GenerateResult | null>(null);
  const [lastInput, setLastInput] = useState<FormInput>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (input: FormInput) => {
    setLoading(true);
    setError(null);
    setLastInput(input);
    trackEvent("generate_click");

    // 生成条件をURLに保持
    router.replace(`/?${toQuery(input)}`, { scroll: false });

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = (await res.json().catch(() => ({}))) as
        | GenerateResult
        | { error?: string };

      if (res.ok && "ideas" in data) {
        setResult(data);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setError(
          ("error" in data && data.error) ||
            "生成に失敗しました。もう一度お試しください。",
        );
      }
    } catch {
      setError("通信に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  // 「条件を変えて出し直す」— 前回値を保持したまま入力画面へ戻る
  const reset = () => {
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      {/* ヘッダー */}
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          観光活用 着想ノート
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          相続した不動産の属性から、観光活用のアイデアと「専門家の注意点」をセットでお返しします。
        </p>
      </header>

      {/* 入力時の注意書き（平易・丁寧語） */}
      {!result ? (
        <p className="mb-6 rounded-xl bg-amber-50 p-4 text-xs leading-relaxed text-amber-900 ring-1 ring-amber-200">
          このアプリは、入力された内容をAIに送って活用案を作ります。住所の番地や建物の名前、持ち主のお名前、相続にまつわるご事情など、人や場所が特定できる情報は書かないでください。「築年数が古い」「駅から遠い」「日当たりが良い」といった、ものの特徴だけをお書きいただければ十分です。
        </p>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="mb-6 rounded-lg bg-enji-light px-4 py-3 text-sm text-enji ring-1 ring-enji-border"
        >
          {error}
        </p>
      ) : null}

      {!result ? (
        <InputForm initial={lastInput} loading={loading} onSubmit={generate} />
      ) : (
        <div className="space-y-8">
          {/* アイデアカード */}
          <div className="space-y-4">
            {result.ideas.map((idea, i) => (
              <ResultCard key={i} idea={idea} />
            ))}
          </div>

          {/* 共通して気をつけたいこと（相続特有の注意点） */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
            <h2 className="font-bold text-ink">共通して気をつけたいこと</h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">
              {result.common_caution}
            </p>
          </div>

          {/* 条件を変えて出し直す */}
          <div className="text-center">
            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-stone-300 bg-white px-6 py-2 text-sm font-medium text-ink transition hover:border-enji"
            >
              条件を変えて出し直す
            </button>
          </div>

          {/* 出口・相談導線 */}
          <Disclaimer />
        </div>
      )}
    </main>
  );
}
