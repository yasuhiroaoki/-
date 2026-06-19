"use client";

import { useState } from "react";
import {
  ACCESS_TYPES,
  AREA_TYPES,
  BUILDING_AGES,
  BUILDING_TYPES,
  FLOOR_AREAS,
  PREFECTURES,
  STATUSES,
  type Option,
} from "@/lib/options";
import { checkFreeText } from "@/lib/validation";
import type { FormInput } from "@/lib/types";

// 自由記述欄の上に出す注意書き（平易・丁寧語）
const FREE_TEXT_NOTE =
  "住所の番地・建物名・お名前・相続のご事情など、人や場所が特定できる情報は書かないでください。「築年数が古い」「駅から遠い」といった、ものの特徴だけで結構です。";

interface Props {
  initial: FormInput;
  loading: boolean;
  onSubmit: (input: FormInput) => void;
}

// ラジオボタン群
function RadioGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: Option[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const selected = value === o.value;
        return (
          <label
            key={o.value}
            className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition ${
              selected
                ? "border-enji bg-enji text-white"
                : "border-stone-300 bg-white text-ink hover:border-enji"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={selected}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        );
      })}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 font-semibold text-ink">{children}</h3>;
}

export default function InputForm({ initial, loading, onSubmit }: Props) {
  const [form, setForm] = useState<FormInput>(initial);
  const [showDetail, setShowDetail] = useState<boolean>(
    Boolean(
      initial.prefecture ||
        initial.floor_area ||
        initial.building_age ||
        initial.status ||
        initial.free_text,
    ),
  );
  const [warning, setWarning] = useState<string | null>(null);

  const set = (patch: Partial<FormInput>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const requiredFilled =
    Boolean(form.area_type) &&
    Boolean(form.building_type) &&
    Boolean(form.access);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requiredFilled || loading) return;

    // 送信前チェック（機微情報の混入を減らす）
    const w = checkFreeText(form.free_text ?? "");
    if (w) {
      setWarning(w);
      return;
    }
    setWarning(null);
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 必須3項目 */}
      <section className="space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
        <div>
          <FieldLabel>所在エリア（必須）</FieldLabel>
          <RadioGroup
            name="area_type"
            options={AREA_TYPES}
            value={form.area_type}
            onChange={(v) => set({ area_type: v })}
          />
        </div>
        <div>
          <FieldLabel>不動産の種別（必須）</FieldLabel>
          <RadioGroup
            name="building_type"
            options={BUILDING_TYPES}
            value={form.building_type}
            onChange={(v) => set({ building_type: v })}
          />
        </div>
        <div>
          <FieldLabel>接道・アクセス（必須）</FieldLabel>
          <RadioGroup
            name="access"
            options={ACCESS_TYPES}
            value={form.access}
            onChange={(v) => set({ access: v })}
          />
        </div>
      </section>

      {/* 任意・折りたたみ */}
      <section>
        <button
          type="button"
          onClick={() => setShowDetail((s) => !s)}
          className="text-sm font-medium text-enji underline-offset-2 hover:underline"
        >
          {showDetail ? "▲ 詳しい指定を閉じる" : "▼ 詳しく指定する（任意）"}
        </button>

        {showDetail ? (
          <div className="mt-4 space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
            <div>
              <FieldLabel>都道府県（任意）</FieldLabel>
              <select
                value={form.prefecture ?? ""}
                onChange={(e) => set({ prefecture: e.target.value })}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">（指定なし）</option>
                {PREFECTURES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-stone-500">
                番地は受け付けません。都道府県のみお選びください。
              </p>
            </div>
            <div>
              <FieldLabel>延床面積帯（任意）</FieldLabel>
              <RadioGroup
                name="floor_area"
                options={FLOOR_AREAS}
                value={form.floor_area ?? ""}
                onChange={(v) => set({ floor_area: v })}
              />
            </div>
            <div>
              <FieldLabel>築年代（任意）</FieldLabel>
              <RadioGroup
                name="building_age"
                options={BUILDING_AGES}
                value={form.building_age ?? ""}
                onChange={(v) => set({ building_age: v })}
              />
            </div>
            <div>
              <FieldLabel>現況（任意）</FieldLabel>
              <RadioGroup
                name="status"
                options={STATUSES}
                value={form.status ?? ""}
                onChange={(v) => set({ status: v })}
              />
            </div>
            <div>
              <FieldLabel>
                この物件の特徴や、やってみたいこと（任意）
              </FieldLabel>
              <div className="mb-2 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 ring-1 ring-amber-200">
                {FREE_TEXT_NOTE}
              </div>
              <textarea
                value={form.free_text ?? ""}
                onChange={(e) => {
                  set({ free_text: e.target.value });
                  if (warning) setWarning(null);
                }}
                rows={3}
                placeholder="例）庭が広い、古い蔵がある、海が見える など"
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>
        ) : null}
      </section>

      {warning ? (
        <p
          role="alert"
          className="rounded-lg bg-enji-light px-4 py-3 text-sm text-enji ring-1 ring-enji-border"
        >
          {warning}
        </p>
      ) : null}

      <div className="flex flex-col items-center gap-2">
        <button
          type="submit"
          disabled={!requiredFilled || loading}
          className="w-full rounded-full bg-enji px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-12"
        >
          {loading ? "生成中…" : "活用アイデアを出す"}
        </button>
        {!requiredFilled ? (
          <p className="text-xs text-stone-500">
            必須の3項目を選ぶと押せます。
          </p>
        ) : null}
      </div>
    </form>
  );
}
