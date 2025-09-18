```markdown
# 🌍 Translation App

FastAPI（バックエンド）と React + TypeScript（フロントエンド）で構築したシンプルな翻訳アプリです。  
ユーザーが入力した文章を自動で言語検出し、指定した言語へ翻訳します。

---

## 🚀 主な機能

- 🌐 入力テキストの翻訳（自動言語検出）
- 🌍 翻訳先言語の選択（主要言語のみ対応）
- ⌨️ Enterキーで翻訳実行（Shift+Enterで改行）
- 🧾 翻訳結果はカード形式で表示（長文はスクロール可能）
- 🧪 フロントエンドとバックエンドを分離したローカル開発構成

---

## 🧩 動作環境（推奨）

- Python 3.10+（ローカルでは 3.12 を想定）
- Node.js 18+ / npm 8+
- Git

---

## 📁 ディレクトリ構成

```plaintext
translation-app/
├── backend/         # FastAPI (Python)
│   ├── main.py
│   └── requirements.txt
├── frontend/        # React + TypeScript
│   ├── package.json
│   └── src/
├── .gitignore
├── README.md
└── LICENSE
```

---

## ⚡ ローカルセットアップ手順

### 1️⃣ リポジトリをクローン

```bash
git clone https://github.com/rentantan/translation-app.git
cd translation-app
```

### 2️⃣ バックエンド起動（FastAPI）

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # macOS / Linux
# venv\Scripts\activate    # Windows

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# → http://localhost:8000 で起動
```

### 3️⃣ フロントエンド起動（React + TypeScript）

```bash
cd ../frontend
npm install
npm start            # CRA の場合
# npm run dev        # Vite の場合
# → http://localhost:3000 または http://localhost:5173 で起動
```

---

## 🔎 API 動作確認（例）

```bash
curl -X POST "http://localhost:8000/translate" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","target_lang":"ja"}'
```

期待されるレスポンス：

```json
{
  "translated_text": "こんにちは世界"
}
```

---

## 🛠 よくあるトラブルと対処法

| 問題 | 対処法 |
|------|--------|
| CORS エラー | バックエンドの CORS 設定を確認（開発時は `allow_origins=["*"]` 推奨） |
| googletrans が不安定 | 長文は分割するか、Google Cloud Translation API / DeepL API の利用を検討 |
| 依存関係の不整合 | 仮想環境の有効化を確認し、`pip install` / `npm install` を再実行 |

---

## 🧾 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

---

## 🧭 開発ルール（推奨）

コミットメッセージは以下の3種類で統一すると履歴が明快になります：

- `feat:` 新機能追加  
- `fix:` バグ修正  
- `chore:` ドキュメント・設定変更など

フロントとバックは同一リポジトリに置きつつ、コミットは分けて管理するのがベストです。

---

## ➕ 拡張アイデア

- 🕘 翻訳履歴を localStorage に保存  
- 👤 ユーザー登録 / 認証機能（簡易 DB 実装）  
- ⏹️ 翻訳中のキャンセル（AbortController の活用）  
- 🎨 UI を TailwindCSS や Chakra UI で強化  
```
