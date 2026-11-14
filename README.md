# 🌐 翻訳アプリ

ログインして使う、シンプルな多言語翻訳 Web アプリです。
翻訳した内容は自動で履歴に保存され、あとから検索したり再利用したりできます。

**FastAPI** + **React (TypeScript)** / 翻訳エンジンは Google 翻訳（[googletrans](https://pypi.org/project/googletrans/)）

---

## ✨ できること

| | 機能 | 説明 |
|---|---|---|
| 🔤 | **11言語の翻訳** | 日本語・英語・中国語（簡体/繁体）・韓国語・フランス語・スペイン語・ドイツ語・イタリア語・ポルトガル語・ロシア語 |
| 🔍 | **言語の自動検出** | 翻訳元を「自動検出」にすると、判定された言語を表示 |
| ⇄ | **言語の入れ替え** | ワンクリックで翻訳元と翻訳先、原文と訳文を入れ替え |
| 📋 | **コピー** | 翻訳結果をワンクリックでクリップボードへ |
| 📄 | **長文対応** | 最大 5,000 文字。改行や文の区切りを保ったまま翻訳 |
| 🕒 | **翻訳履歴** | 自動保存。キーワード検索・続きの読み込み・個別/一括削除・クリックで再利用 |
| 🔐 | **ログイン** | アカウントごとに履歴を分けて管理（JWT 認証） |

### ⌨️ 操作のコツ

- `Enter` で翻訳、`Shift + Enter` で改行（日本語入力の変換確定では翻訳されません）
- 履歴画面は `Esc` で閉じられます
- 選んだ言語は次回も引き継がれます

---

## 🚀 はじめかた

**必要なもの:** Python 3.10 以上、Node.js 18 以上

### 1. バックエンド

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # SECRET_KEY を書き換える
uvicorn app.main:app --reload --port 8000
```

### 2. フロントエンド（別のターミナルで）

```bash
cd frontend
npm install
npm start
```

ブラウザで **http://localhost:3000** を開き、「新規登録」からアカウントを作れば使い始められます。

> 💡 API ドキュメントは http://localhost:8000/docs で確認できます。

---

## ⚙️ 設定

### バックエンド（`backend/.env`）

| 変数 | デフォルト | 説明 |
|---|---|---|
| `SECRET_KEY` | *（毎回ランダム生成）* | JWT の署名鍵。**未設定だと再起動のたびにログアウトされる**ので必ず設定してください |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | ログインの有効期限（分） |
| `DATABASE_URL` | `sqlite:///./app.db` | データベースの接続先 |
| `CORS_ORIGINS` | `http://localhost:3000` | フロントエンドの URL（カンマ区切りで複数可） |
| `MAX_TEXT_LENGTH` | `5000` | 1 回に翻訳できる最大文字数 |
| `LOGIN_MAX_FAILURES` | `5` | この回数ログインに失敗すると一時的にロック |
| `LOGIN_LOCK_SECONDS` | `300` | ロックする秒数 |
| `TRANSLATE_RATE_LIMIT` | `30` | 1 ユーザーが 1 分間に翻訳できる回数 |

`SECRET_KEY` は次のコマンドで生成できます。

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### フロントエンド（`frontend/.env`）

| 変数 | デフォルト | 説明 |
|---|---|---|
| `REACT_APP_API_URL` | `http://localhost:8000` | バックエンドの URL |

---

## 📡 API

`/register` `/login` `/health` 以外は `Authorization: Bearer <token>` が必要です。

| メソッド | パス | 説明 |
|---|---|---|
| `POST` | `/register` | ユーザー登録（ユーザー名 3〜32 文字、パスワード 6 文字以上） |
| `POST` | `/login` | ログインしてトークンを取得（form 形式） |
| `GET` | `/me` | ログイン中のユーザー情報 |
| `POST` | `/translate` | 翻訳して履歴に保存 |
| `GET` | `/translations/history` | 履歴を新しい順に取得 |
| `DELETE` | `/translations/history/{id}` | 履歴を 1 件削除 |
| `DELETE` | `/translations/history` | 履歴をすべて削除 |
| `GET` | `/health` | 死活監視 |

<details>
<summary><b>リクエスト / レスポンスの例</b></summary>

**翻訳**

```http
POST /translate
{ "text": "こんにちは", "target_lang": "en", "source_lang": "auto" }
```
```json
{ "translated_text": "Hello", "source_lang": "ja" }
```

**履歴の取得** — `skip` / `limit`（最大 100）/ `q`（原文・訳文の部分一致検索）

```http
GET /translations/history?q=こんにちは&skip=0&limit=20
```
```json
{
  "items": [
    {
      "id": 1,
      "source_text": "こんにちは",
      "translated_text": "Hello",
      "source_lang": "ja",
      "target_lang": "en",
      "created_at": "2025-01-01T12:00:00+09:00"
    }
  ],
  "total": 1
}
```

</details>

---

## 🧪 テスト

GitHub へのプッシュ・PR ごとに GitHub Actions（`.github/workflows/ci.yml`）で自動実行されます。

```bash
# バックエンド（翻訳サービスはモックするのでオフラインで動きます）
cd backend
pip install -r requirements-dev.txt
pytest

# フロントエンド
cd frontend
npm test
```

---

## 📁 構成

```
translation-app/
├── backend/
│   ├── app/
│   │   ├── main.py            # アプリ生成・CORS・ルーター登録
│   │   ├── routers/
│   │   │   ├── auth.py        # /register /login /me
│   │   │   └── translations.py # /translate /translations/history
│   │   ├── deps.py            # 共通の依存関係（ログインユーザーの取得）
│   │   ├── translator.py      # 長文の分割と Google 翻訳の呼び出し
│   │   ├── security.py        # パスワードのハッシュ化・JWT
│   │   ├── crud.py            # DB 操作
│   │   ├── models.py          # テーブル定義（users / translations）
│   │   ├── schemas.py         # 入出力の型と入力チェック
│   │   ├── database.py        # DB 接続
│   │   └── config.py          # 環境変数の読み込み
│   └── tests/
└── frontend/src/
    ├── App.tsx            # ルーティング
    ├── api.ts             # API クライアント（期限切れ時は自動でログアウト）
    ├── config.ts          # API の URL・最大文字数
    ├── types.ts           # API の型定義
    ├── hooks/             # useAuth・useToast・useDebounce・usePersistentState
    ├── lib/               # 対応言語の一覧・日時の整形・クリップボード
    ├── App.css            # スタイル
    ├── pages/             # ログイン・新規登録・翻訳画面
    └── components/        # 入力欄・言語選択・翻訳結果・履歴モーダル
```

### 技術スタック

| | |
|---|---|
| **バックエンド** | FastAPI / SQLAlchemy (SQLite) / PyJWT / bcrypt / googletrans |
| **フロントエンド** | React 19 / TypeScript / React Router 7 / Create React App |

---

## ⚠️ 注意

- ログイン・翻訳のレート制限はメモリ上で数えているため、1 プロセスでの運用を前提にしています。複数ワーカーで動かす場合は Redis などに置き換えてください。
- 翻訳には Google 翻訳の非公式 API を使っているため、利用が集中すると一時的に失敗することがあります。業務で使う場合は公式の Cloud Translation API への置き換えを検討してください。
- 対応言語を増やすときは `backend/app/schemas.py` の `SUPPORTED_LANGUAGES` と `frontend/src/lib/languages.ts` の `LANGUAGES` の両方を更新してください。

## 📝 ライセンス

[MIT License](LICENSE)
