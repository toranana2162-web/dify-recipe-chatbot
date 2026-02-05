# Dify チャットボット Web アプリ

Dify APIと連携するTypeScriptベースのチャットボットWebアプリケーションです。

## 機能

- 🤖 Dify AIチャットボットとのリアルタイム対話
- 🌙 ダーク/ライトテーマ切り替え
- 💬 会話履歴の維持（セッション内）
- 📱 レスポンシブデザイン（モバイル対応）
- ⚡ タイピングインジケーター
- 🔒 バックエンドでのAPIキー管理（セキュア）

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example`をコピーして`.env`ファイルを作成し、Dify APIキーを設定してください。

```bash
cp .env.example .env
```

`.env`ファイルを編集:

```env
# Dify APIキー（必須）
DIFY_API_KEY=your-dify-api-key-here

# Dify APIのURL（オプション、デフォルト: https://api.dify.ai/v1）
DIFY_API_URL=https://api.dify.ai/v1

# サーバーポート（オプション、デフォルト: 3000）
PORT=3000
```

### 3. Dify APIキーの取得方法

1. [Dify](https://dify.ai)にログイン
2. チャットボットアプリを作成または選択
3. 左サイドバーから「API Access」を選択
4. 「APIキーを作成」をクリック
5. 生成されたAPIキーをコピーして`.env`に設定

## 起動方法

### 開発モード

```bash
npm run dev
```

### 本番モード

```bash
# TypeScriptをコンパイル
npm run build

# サーバーを起動
npm start
```

ブラウザで http://localhost:3000 を開いてください。

## プロジェクト構造

```
├── src/
│   ├── client/          # フロントエンド
│   │   ├── index.html   # メインHTML
│   │   ├── styles.css   # スタイルシート
│   │   ├── main.ts      # TypeScriptソース
│   │   └── main.js      # コンパイル済みJS
│   └── server/
│       └── server.ts    # Expressサーバー
├── .env.example         # 環境変数テンプレート
├── package.json
├── tsconfig.json
└── README.md
```

## API エンドポイント

| エンドポイント | メソッド | 説明 |
|---------------|---------|------|
| `/api/chat` | POST | チャットメッセージ送信 |
| `/api/reset` | POST | 会話リセット |
| `/api/health` | GET | ヘルスチェック |

### チャットAPI リクエスト例

```json
POST /api/chat
{
  "message": "こんにちは",
  "userId": "user_abc123"
}
```

### レスポンス例

```json
{
  "answer": "こんにちは！何かお手伝いできることはありますか？",
  "conversationId": "conv_xyz789",
  "messageId": "msg_def456"
}
```

## カスタマイズ

### UIのカスタマイズ

`src/client/styles.css`のCSS変数を編集することで、簡単にテーマをカスタマイズできます：

```css
:root {
  --accent-primary: #6366f1;    /* メインカラー */
  --bg-primary: #0f0f12;        /* 背景色 */
  --text-primary: #fafafa;      /* テキスト色 */
  /* ... その他の変数 */
}
```

### Bolt.new UIの統合

Bolt.newで作成したUIを使用する場合は、`src/client/`内のHTML/CSSファイルを置き換えてください。JavaScriptの関数名とイベントリスナーが一致していることを確認してください。

## トラブルシューティング

### 「APIキー未設定」と表示される

- `.env`ファイルが存在するか確認
- `DIFY_API_KEY`が正しく設定されているか確認
- サーバーを再起動

### 「サーバーに接続できません」と表示される

- サーバーが起動しているか確認
- ポート番号が正しいか確認
- ファイアウォールの設定を確認

### Dify APIエラー

- APIキーの有効性を確認
- Dify APIのURL設定を確認
- レート制限に達していないか確認

## ライセンス

MIT License

