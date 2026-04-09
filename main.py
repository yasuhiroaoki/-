#!/usr/bin/env python3
"""
観光ガイドには載っていないとっておきの観光スポットを自動生成してXにポストするアプリ
"""

import os
import time
import random
import logging
import argparse
from datetime import datetime

import anthropic
import tweepy
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# 投稿テーマのバリエーション（多様性を出すため）
SPOT_THEMES = [
    "地元の人だけが知る路地裏の名所",
    "SNSにまだ出回っていない秘境スポット",
    "観光客がほぼ訪れない穴場の自然スポット",
    "地域の歴史が息づく知られざる史跡",
    "地元民御用達の隠れた絶景ポイント",
    "旅行雑誌には載らないローカルグルメスポット",
    "夜に輝く知る人ぞ知る夜景スポット",
    "季節限定で美しい秘密の花畑や景勝地",
    "地元アーティストが集う知られざるスペース",
    "観光地の裏側にある本当の穴場スポット",
]

SYSTEM_PROMPT = """あなたは日本全国の隠れた観光スポットを熟知した旅行ブロガーです。
観光ガイドブックやメジャーな旅行サイトには載っていない、地元の人だけが知るとっておきのスポットを紹介することが得意です。

投稿の特徴：
- 具体的な地名や特徴を含める（架空でも臨場感があること）
- 地元の人目線で語る温かみのある文体
- 思わず行きたくなるような魅力的な描写
- ハッシュタグを効果的に使用
- 280文字以内に収める（日本語）
- 絵文字を適度に使用して視覚的に魅力的にする

投稿は必ず1つの場所に焦点を当て、その場所の魅力を具体的に伝えてください。"""


def generate_tourist_spot_post(client: anthropic.Anthropic, theme: str) -> str:
    """Claude APIを使って隠れた観光スポットの投稿を生成する"""
    logger.info(f"投稿を生成中... テーマ: {theme}")

    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=500,
        thinking={"type": "adaptive"},
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"次のテーマで観光ガイドには載っていない秘密のスポットについてXへの投稿を1つ作成してください。\n\nテーマ: {theme}\n\n注意事項:\n- 280文字以内\n- ハッシュタグを2〜4個含める\n- 投稿文のみを返してください（前置きや説明は不要）",
            }
        ],
    )

    post_text = ""
    for block in response.content:
        if block.type == "text":
            post_text = block.text.strip()
            break

    return post_text


def post_to_x(client: tweepy.Client, text: str, dry_run: bool = False) -> dict | None:
    """Xに投稿する"""
    if dry_run:
        logger.info(f"[DRY RUN] 投稿内容:\n{text}")
        logger.info(f"[DRY RUN] 文字数: {len(text)}")
        return {"dry_run": True, "text": text}

    try:
        response = client.create_tweet(text=text)
        tweet_id = response.data["id"]
        logger.info(f"投稿成功! Tweet ID: {tweet_id}")
        return response.data
    except tweepy.TweepyException as e:
        logger.error(f"X投稿エラー: {e}")
        raise


def create_anthropic_client() -> anthropic.Anthropic:
    """Anthropicクライアントを作成する"""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY が設定されていません")
    return anthropic.Anthropic(api_key=api_key)


def create_x_client() -> tweepy.Client:
    """X (Twitter) クライアントを作成する"""
    required_vars = [
        "X_API_KEY",
        "X_API_SECRET",
        "X_ACCESS_TOKEN",
        "X_ACCESS_TOKEN_SECRET",
    ]
    missing = [var for var in required_vars if not os.getenv(var)]
    if missing:
        raise ValueError(f"X APIキーが設定されていません: {', '.join(missing)}")

    return tweepy.Client(
        bearer_token=os.getenv("X_BEARER_TOKEN"),
        consumer_key=os.getenv("X_API_KEY"),
        consumer_secret=os.getenv("X_API_SECRET"),
        access_token=os.getenv("X_ACCESS_TOKEN"),
        access_token_secret=os.getenv("X_ACCESS_TOKEN_SECRET"),
    )


def run_once(dry_run: bool = False, theme: str | None = None) -> None:
    """1回だけ投稿を生成してXにポストする"""
    anthropic_client = create_anthropic_client()

    selected_theme = theme or random.choice(SPOT_THEMES)
    logger.info(f"選択されたテーマ: {selected_theme}")

    post_text = generate_tourist_spot_post(anthropic_client, selected_theme)
    logger.info(f"生成された投稿 ({len(post_text)}文字):\n{post_text}")

    if dry_run:
        post_to_x(None, post_text, dry_run=True)
    else:
        x_client = create_x_client()
        post_to_x(x_client, post_text, dry_run=False)


def run_scheduled(interval_minutes: int, dry_run: bool = False) -> None:
    """指定した間隔で定期的に投稿する"""
    logger.info(f"スケジュール投稿を開始します。間隔: {interval_minutes}分")

    anthropic_client = create_anthropic_client()
    x_client = None if dry_run else create_x_client()

    theme_index = 0

    while True:
        try:
            now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            logger.info(f"=== 投稿開始: {now} ===")

            theme = SPOT_THEMES[theme_index % len(SPOT_THEMES)]
            theme_index += 1

            # ランダム性を加えるため50%の確率でランダムテーマに変更
            if random.random() < 0.5:
                theme = random.choice(SPOT_THEMES)

            post_text = generate_tourist_spot_post(anthropic_client, theme)
            logger.info(f"生成された投稿 ({len(post_text)}文字):\n{post_text}")

            post_to_x(x_client, post_text, dry_run=dry_run)

            logger.info(f"次の投稿まで {interval_minutes}分 待機します...")
            time.sleep(interval_minutes * 60)

        except KeyboardInterrupt:
            logger.info("スケジュール投稿を停止しました")
            break
        except Exception as e:
            logger.error(f"エラーが発生しました: {e}")
            retry_wait = 5
            logger.info(f"{retry_wait}分後にリトライします...")
            time.sleep(retry_wait * 60)


def main():
    parser = argparse.ArgumentParser(
        description="観光ガイドには載っていない隠れた観光スポットをXに自動投稿するアプリ"
    )
    parser.add_argument(
        "--mode",
        choices=["once", "schedule"],
        default="once",
        help="実行モード: once=1回だけ投稿, schedule=定期投稿 (デフォルト: once)",
    )
    parser.add_argument(
        "--interval",
        type=int,
        default=int(os.getenv("POST_INTERVAL_MINUTES", "60")),
        help="定期投稿の間隔（分）。--mode schedule 時に有効 (デフォルト: 60)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Xへの実際の投稿を行わず、生成された投稿内容のみを表示する",
    )
    parser.add_argument(
        "--theme",
        type=str,
        default=None,
        help="投稿テーマを指定する（指定しない場合はランダム選択）",
    )
    parser.add_argument(
        "--list-themes",
        action="store_true",
        help="利用可能なテーマ一覧を表示する",
    )

    args = parser.parse_args()

    if args.list_themes:
        print("利用可能なテーマ一覧:")
        for i, theme in enumerate(SPOT_THEMES, 1):
            print(f"  {i}. {theme}")
        return

    if args.dry_run:
        logger.info("=== DRY RUNモード: Xへの実際の投稿は行いません ===")

    if args.mode == "once":
        run_once(dry_run=args.dry_run, theme=args.theme)
    elif args.mode == "schedule":
        run_scheduled(interval_minutes=args.interval, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
