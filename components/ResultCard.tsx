import type { Idea } from "@/lib/types";

// 生成結果の1案を表示するカード（4.2）
// 「専門家の注意点」を臙脂系の色で囲むのがこのカードの肝。
export default function ResultCard({ idea }: { idea: Idea }) {
  return (
    <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
      <h3 className="text-lg font-bold text-ink">{idea.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-stone-700">
        {idea.summary}
      </p>
      <div className="mt-4 rounded-xl bg-enji-light p-4 ring-1 ring-enji-border">
        <p className="text-xs font-semibold tracking-wide text-enji">
          専門家の注意点
        </p>
        <p className="mt-1 text-sm leading-relaxed text-enji">{idea.caution}</p>
      </div>
    </article>
  );
}
