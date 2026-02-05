// Dify API連携用の関数

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

export interface ChatResponse {
  answer: string;
  conversationId: string;
  messageId: string;
}

// ユーザーIDを生成・取得
export function getUserId(): string {
  const stored = localStorage.getItem('dify_user_id');
  if (stored) return stored;
  
  const newId = 'user_' + Math.random().toString(36).substring(2, 15);
  localStorage.setItem('dify_user_id', newId);
  return newId;
}

// Dify APIにメッセージを送信
export async function sendMessageToDify(message: string): Promise<ChatResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      userId: getUserId(),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'APIエラーが発生しました');
  }

  return response.json();
}

// 会話をリセット
export async function resetConversation(): Promise<void> {
  await fetch('/api/reset', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId: getUserId() }),
  });
}

// ヘルスチェック
export async function checkHealth(): Promise<{ status: string; apiConfigured: boolean }> {
  const response = await fetch('/api/health');
  return response.json();
}

