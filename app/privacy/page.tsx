import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー｜観光活用 着想ノート",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <h1 className="text-2xl font-bold text-ink">プライバシーポリシー</h1>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-stone-700">
        <section>
          <h2 className="font-semibold text-ink">入力内容の取り扱い</h2>
          <p className="mt-2">
            本アプリの入力フォームに記入された物件の属性および自由記述の内容は、活用案を生成するためにAI（Anthropic社のAPI）へ送信されます。これらのデータは、Anthropic社のAPI利用方針において、モデルの学習には使用されません。
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-ink">特定情報の入力について</h2>
          <p className="mt-2">
            利用者ご自身におかれましても、住所の番地・建物名・お名前・相続にまつわるご事情など、人や場所が特定できる情報は入力しないようご協力をお願いします。本アプリは送信前に簡易なチェックを行いますが、完全に防げるものではありません。
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-ink">連絡先の取り扱い</h2>
          <p className="mt-2">
            メールアドレスの登録は任意です。登録された場合、メール配信サービス（Brevo）の連絡先として保管され、結果のお届けや関連情報のご案内に利用します。LINEでのご相談は、LINEプラットフォーム上で完結します。
          </p>
          <p className="mt-2">
            これらの連絡先は、物件情報をAIへ送信する経路とは完全に別系統で扱い、アイデア生成用のAI（Anthropic）には一切送信しません。
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-ink">アクセス解析</h2>
          <p className="mt-2">
            本アプリでは、利用状況の把握のためにGA4（Google
            アナリティクス）を利用する場合があります。
          </p>
        </section>
      </div>

      <p className="mt-8 text-sm">
        <Link href="/" className="text-enji underline underline-offset-2">
          ← トップに戻る
        </Link>
      </p>
    </main>
  );
}
