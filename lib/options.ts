// 選択肢マスタ（4章 画面設計に対応）
// value はプロンプト・URLパラメータで使う安定したキー、label は画面表示。

export interface Option {
  value: string;
  label: string;
}

// 1. 所在エリア（地域区分）— 必須
export const AREA_TYPES: Option[] = [
  { value: "urban", label: "都市部" },
  { value: "resort", label: "温泉地・観光地" },
  { value: "suburb", label: "郊外・住宅地" },
  { value: "remote", label: "山間・離島部" },
];

// 2. 不動産の種別 — 必須
export const BUILDING_TYPES: Option[] = [
  { value: "house", label: "一戸建て住宅" },
  { value: "kominka", label: "古民家・町家" },
  { value: "akiya", label: "空き家" },
  { value: "land", label: "土地（更地）" },
  { value: "apartment", label: "アパート・共同住宅" },
  { value: "shop", label: "店舗・事務所" },
  { value: "other_building", label: "その他建物" },
];

// 3. 接道・アクセス — 必須
export const ACCESS_TYPES: Option[] = [
  { value: "main_road", label: "主要道路に面する" },
  { value: "local_road", label: "生活道路のみ" },
  { value: "near_station", label: "最寄り駅・IC近い" },
  { value: "poor_transit", label: "公共交通が乏しい" },
];

// 4. 都道府県（任意・番地は受け付けない）
export const PREFECTURES: Option[] = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
].map((p) => ({ value: p, label: p }));

// 5. 延床面積帯（任意）
export const FLOOR_AREAS: Option[] = [
  { value: "u50", label: "〜50㎡" },
  { value: "50_100", label: "50〜100㎡" },
  { value: "100_200", label: "100〜200㎡" },
  { value: "200_500", label: "200〜500㎡" },
  { value: "o500", label: "500㎡〜" },
];

// 6. 築年代（任意）
export const BUILDING_AGES: Option[] = [
  { value: "new_seismic", label: "新耐震（1981年6月以降）" },
  { value: "old_seismic", label: "旧耐震（それ以前）" },
  { value: "unknown", label: "不明" },
  { value: "vacant_land", label: "更地" },
];

// 7. 現況（任意）
export const STATUSES: Option[] = [
  { value: "vacant", label: "空き家・未使用" },
  { value: "rented", label: "賃貸中" },
  { value: "self_use", label: "自己利用中" },
  { value: "other", label: "その他" },
];

// value から label を引く（プロンプト組み立てで使用）
export function labelOf(options: Option[], value: string | undefined): string {
  if (!value) return "（指定なし）";
  return options.find((o) => o.value === value)?.label ?? value;
}
