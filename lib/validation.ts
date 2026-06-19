// 送信前チェック（4.1 機微情報の混入を減らす・第二段の防御）
// 完全には防げないが、うっかりの混入を大幅に減らす。

const WARNING_MESSAGE =
  "個人や場所が特定できそうな内容が含まれているかもしれません。ものの特徴だけにして、もう一度お試しください。";

// 個人を指す語・住所/番地らしき語
const SENSITIVE_WORDS = [
  "相続",
  "名前",
  "氏名",
  "様",
  "さん",
  "丁目",
  "番地",
];

// 自由記述に機微情報らしきものが含まれていれば警告文を返す。問題なければ null。
export function checkFreeText(text: string): string | null {
  const value = (text ?? "").trim();
  if (!value) return null;

  // 「丁目」「番地」「番」＋数字（番地らしきもの）
  if (/[丁番]\s*\d/.test(value) || /\d\s*[丁番]/.test(value)) {
    return WARNING_MESSAGE;
  }

  // 3桁以上の数字の並び（番地・電話番号らしきもの）
  if (/\d{3,}/.test(value)) {
    return WARNING_MESSAGE;
  }

  // 個人を指す語・相続の事情を示す語
  if (SENSITIVE_WORDS.some((w) => value.includes(w))) {
    return WARNING_MESSAGE;
  }

  return null;
}
