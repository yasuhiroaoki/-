// アプリ全体で使う型定義

// 入力フォームの値。必須3項目＋任意項目。
export interface FormInput {
  // 必須（最初から表示）
  area_type: string; // 所在エリア（地域区分）
  building_type: string; // 不動産の種別
  access: string; // 接道・アクセス
  // 任意（「詳しく指定する」で表示）
  prefecture?: string; // 都道府県（番地は受け付けない）
  floor_area?: string; // 延床面積帯
  building_age?: string; // 築年代
  status?: string; // 現況
  free_text?: string; // 自由記述（ものの特徴のみ）
}

// 生成結果の1案
export interface Idea {
  title: string;
  summary: string;
  caution: string;
}

// API（/api/generate）が返す形
export interface GenerateResult {
  ideas: Idea[];
  common_caution: string;
}
