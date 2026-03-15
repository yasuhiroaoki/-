# 隠れた観光スポット自動投稿ボット

観光ガイドには載っていないとっておきの観光スポットをAIが自動生成し、X（Twitter）に投稿するアプリです。

---

## 必要なもの

- Python 3.10 以上
- Anthropic アカウント（Claude API利用）
- X（Twitter）開発者アカウント（投稿用）

---

## Step 1: リポジトリの準備

```bash
# リポジトリをクローン
git clone <リポジトリURL>
cd <フォルダ名>

# 依存パッケージをインストール
pip install -r requirements.txt
```

---

## Step 2: Anthropic APIキーの取得

1. [console.anthropic.com](https://console.anthropic.com) にアクセスしてアカウントを作成またはログイン
2. 左メニューから **「API Keys」** をクリック
3. **「Create Key」** ボタンをクリック
4. キーに名前をつけて（例: `tourist-bot`）**「Create Key」** を押す
5. 表示された `sk-ant-...` から始まるキーをコピーして安全な場所に保存

> ⚠️ APIキーは一度しか表示されません。必ずコピーしてください。

---

## Step 3: X (Twitter) APIキーの取得

### 3-1. 開発者アカウントの申請

1. [developer.x.com](https://developer.x.com) にアクセス
2. **「Sign up」** → X（Twitter）アカウントでログイン
3. 利用目的を選択（個人利用なら **「Hobbyist」→「Making a bot」**）
4. 必要事項を入力して申請（数分〜数時間で承認されることが多い）

### 3-2. アプリの作成

1. 承認後、**「Dashboard」** → **「Projects & Apps」** → **「+ Add App」**
2. アプリ名を入力（例: `tourist-spot-bot`）して作成
3. 表示される以下の3つの値をコピーして保存：
   - **API Key**（＝Consumer Key）
   - **API Key Secret**（＝Consumer Secret）
   - **Bearer Token**

### 3-3. 投稿権限の設定（重要）

1. 作成したアプリの設定ページで **「Settings」** タブをクリック
2. **「User authentication settings」** の **「Set up」** をクリック
3. **App permissions** で **「Read and write」** を選択
4. **Type of App** で **「Web App, Automated App or Bot」** を選択
5. Callback URI に `https://example.com`（ダミーでOK）を入力して保存

### 3-4. アクセストークンの生成

1. **「Keys and Tokens」** タブに移動
2. **「Access Token and Secret」** の欄で **「Generate」** をクリック
3. 以下の2つをコピーして保存：
   - **Access Token**
   - **Access Token Secret**

> ⚠️ 権限設定（3-3）を変更した場合はトークンを再生成してください。

---

## Step 4: .env ファイルの設定

```bash
# テンプレートをコピー
cp .env.example .env
```

`.env` ファイルをテキストエディタで開き、各キーを貼り付けます：

```env
# Anthropic API Key（Step 2 で取得）
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx

# X (Twitter) API Keys（Step 3 で取得）
X_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx         # API Key
X_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # API Key Secret
X_ACCESS_TOKEN=xxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Access Token
X_ACCESS_TOKEN_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Access Token Secret
X_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Bearer Token

# 定期投稿の間隔（分）。省略すると60分になります
POST_INTERVAL_MINUTES=60
```

---

## Step 5: 動作確認（dry-run）

実際にXへ投稿せずに、生成される投稿内容だけ確認します。

```bash
python main.py --dry-run
```

**期待される出力例：**

```
2024-01-15 12:00:00 [INFO] 選択されたテーマ: 地元の人だけが知る路地裏の名所
2024-01-15 12:00:01 [INFO] 投稿を生成中... テーマ: 地元の人だけが知る路地裏の名所
2024-01-15 12:00:05 [INFO] 生成された投稿 (142文字):
🗺️ 京都の観光地から1本入った小道に、地元民が密かに通う小さな甘味処があります。
築70年の町家で出されるわらび餅は、観光地の10分の1の値段で本物の味。
地元のおじいさんたちが将棋を指しながら過ごす、本当の京都がここに。#京都穴場 #隠れ家 #ローカルグルメ #旅の記録
2024-01-15 12:00:05 [INFO] [DRY RUN] 投稿内容:
...
```

内容が意図通りなら次のステップへ進みます。

---

## Step 6: 実際に1回投稿する

```bash
python main.py --mode once
```

X（Twitter）のアカウントに投稿が表示されれば成功です。

**テーマを指定して投稿することもできます：**

```bash
# テーマ一覧を確認
python main.py --list-themes

# テーマを指定して投稿
python main.py --mode once --theme "夜に輝く知る人ぞ知る夜景スポット"
```

---

## Step 7: 定期自動投稿

60分ごとに自動投稿し続けます：

```bash
python main.py --mode schedule --interval 60
```

**停止するには `Ctrl + C` を押します。**

**間隔の目安：**

| 投稿頻度 | コマンド |
|---------|---------|
| 30分ごと | `--interval 30` |
| 1時間ごと | `--interval 60` |
| 3時間ごと | `--interval 180` |
| 1日1回 | `--interval 1440` |

> 📌 X APIの無料プランは月500ポストまでの制限があります。
> 1時間ごとなら月約720ポストになるため、`--interval 100`（約100分）以上を推奨します。

---

## トラブルシューティング

### `ANTHROPIC_API_KEY が設定されていません` というエラー

`.env` ファイルが作成されているか、APIキーが正しく貼り付けられているか確認してください。

```bash
# 設定を確認（値は表示されません）
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('OK' if os.getenv('ANTHROPIC_API_KEY') else 'NG')"
```

### X投稿時に `403 Forbidden` エラー

アクセス権限が **「Read only」** になっています。
Step 3-3 に戻り **「Read and write」** に変更し、Step 3-4 でトークンを再生成してください。

### 投稿が280文字を超えてしまう

まず `--dry-run` で内容を確認し、問題が頻発する場合は `main.py` の
`SYSTEM_PROMPT` の文字数制限の指示を強めてください。

### `ModuleNotFoundError` が出る

```bash
pip install -r requirements.txt
```

を再実行してください。

---

## コマンド一覧

```bash
# 1回だけ投稿
python main.py --mode once

# 1回だけ投稿（テスト・Xには送信しない）
python main.py --dry-run

# テーマを指定して投稿
python main.py --mode once --theme "テーマ名"

# テーマ一覧を表示
python main.py --list-themes

# 60分ごとに定期投稿
python main.py --mode schedule --interval 60

# 定期投稿（テスト・Xには送信しない）
python main.py --mode schedule --interval 60 --dry-run
```
