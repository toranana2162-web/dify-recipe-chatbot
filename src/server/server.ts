import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// 環境変数の読み込み
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Dify API設定
const DIFY_API_KEY = process.env.DIFY_API_KEY || '';
const DIFY_API_URL = process.env.DIFY_API_URL || 'https://api.dify.ai/v1';

// ミドルウェア
app.use(cors());
app.use(express.json());

// フロントエンドの静的ファイルを配信
// 開発時: dist/client, 本番時: project/dist
const clientPath = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, '../../project/dist')
  : path.join(__dirname, '../client');
app.use(express.static(clientPath));

// 会話履歴を保持するMap（本番環境ではRedisなどを使用推奨）
const conversationStore = new Map<string, string>();

// チャットメッセージのリクエスト型
interface ChatRequest {
  message: string;
  userId: string;
}

// Dify APIレスポンス型
interface DifyResponse {
  answer: string;
  conversation_id: string;
  message_id: string;
  metadata?: {
    usage?: {
      total_tokens: number;
    };
  };
}

// チャットエンドポイント
app.post('/api/chat', async (req: Request<{}, {}, ChatRequest>, res: Response) => {
  try {
    const { message, userId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'メッセージが必要です' });
    }

    if (!DIFY_API_KEY) {
      return res.status(500).json({ error: 'APIキーが設定されていません' });
    }

    // ユーザーの会話IDを取得（存在しない場合は空文字）
    const conversationId = conversationStore.get(userId) || '';

    // Dify APIにリクエスト送信
    const response = await fetch(`${DIFY_API_URL}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {},
        query: message,
        response_mode: 'blocking',
        conversation_id: conversationId,
        user: userId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Dify API Error:', errorData);
      return res.status(response.status).json({ 
        error: 'Dify APIエラー',
        details: errorData 
      });
    }

    const data: DifyResponse = await response.json();

    // 会話IDを保存
    if (data.conversation_id) {
      conversationStore.set(userId, data.conversation_id);
    }

    res.json({
      answer: data.answer,
      conversationId: data.conversation_id,
      messageId: data.message_id,
    });

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ 
      error: 'サーバーエラーが発生しました',
      details: error instanceof Error ? error.message : '不明なエラー'
    });
  }
});

// 会話リセットエンドポイント
app.post('/api/reset', (req: Request<{}, {}, { userId: string }>, res: Response) => {
  const { userId } = req.body;
  
  if (userId && conversationStore.has(userId)) {
    conversationStore.delete(userId);
  }
  
  res.json({ success: true, message: '会話がリセットされました' });
});

// ヘルスチェック
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    apiConfigured: !!DIFY_API_KEY 
  });
});

// フロントエンドのルーティング（SPAのため全てindex.htmlを返す）
app.get('*', (_req: Request, res: Response) => {
  const indexPath = process.env.NODE_ENV === 'production'
    ? path.join(__dirname, '../../project/dist/index.html')
    : path.join(__dirname, '../client/index.html');
  res.sendFile(indexPath);
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 サーバーが起動しました: http://localhost:${PORT}`);
  console.log(`📡 Dify API URL: ${DIFY_API_URL}`);
  console.log(`🔑 APIキー設定: ${DIFY_API_KEY ? '設定済み' : '未設定'}`);
});

