import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Plus, Trash2 } from 'lucide-react';
import { sendMessageToDify, resetConversation, checkHealth, type Message, type Conversation } from './lib/api';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import WelcomeScreen from './components/WelcomeScreen';

function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [apiStatus, setApiStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 会話履歴をlocalStorageから読み込み
  useEffect(() => {
    loadConversations();
    checkApiStatus();
  }, []);

  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId);
      setShowWelcome(false);
    }
  }, [currentConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkApiStatus = async () => {
    try {
      const health = await checkHealth();
      if (health.status === 'ok' && health.apiConfigured) {
        setApiStatus('connected');
      } else {
        setApiStatus('error');
      }
    } catch {
      setApiStatus('error');
    }
  };

  const loadConversations = () => {
    const stored = localStorage.getItem('conversations');
    if (stored) {
      setConversations(JSON.parse(stored));
    }
  };

  const saveConversations = (convs: Conversation[]) => {
    localStorage.setItem('conversations', JSON.stringify(convs));
    setConversations(convs);
  };

  const loadMessages = (conversationId: string) => {
    const stored = localStorage.getItem(`messages_${conversationId}`);
    if (stored) {
      setMessages(JSON.parse(stored));
    } else {
      setMessages([]);
    }
  };

  const saveMessages = (conversationId: string, msgs: Message[]) => {
    localStorage.setItem(`messages_${conversationId}`, JSON.stringify(msgs));
    setMessages(msgs);
  };

  const createNewConversation = async () => {
    // Difyの会話もリセット
    await resetConversation();
    
    const newConversation: Conversation = {
      id: 'conv_' + Date.now(),
      title: '新しいレシピ相談',
      updated_at: new Date().toISOString(),
    };

    const updatedConvs = [newConversation, ...conversations];
    saveConversations(updatedConvs);
    setCurrentConversationId(newConversation.id);
    setMessages([]);
  };

  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // メッセージも削除
    localStorage.removeItem(`messages_${id}`);
    
    const updatedConvs = conversations.filter(c => c.id !== id);
    saveConversations(updatedConvs);

    if (currentConversationId === id) {
      setCurrentConversationId(null);
      setMessages([]);
      setShowWelcome(true);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!currentConversationId) return;

    setIsLoading(true);

    // ユーザーメッセージを追加
    const userMessage: Message = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    saveMessages(currentConversationId, updatedMessages);

    // 最初のメッセージの場合、会話タイトルを更新
    if (messages.length === 0) {
      const updatedConvs = conversations.map(c =>
        c.id === currentConversationId
          ? { ...c, title: content.slice(0, 30) + (content.length > 30 ? '...' : ''), updated_at: new Date().toISOString() }
          : c
      );
      saveConversations(updatedConvs);
    }

    try {
      // Dify APIにメッセージを送信
      const response = await sendMessageToDify(content);

      // AIの応答を追加
      const assistantMessage: Message = {
        id: response.messageId || 'msg_' + Date.now() + '_ai',
        role: 'assistant',
        content: response.answer,
        created_at: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      saveMessages(currentConversationId, finalMessages);

      // 会話の更新日時を更新
      const updatedConvs = conversations.map(c =>
        c.id === currentConversationId
          ? { ...c, updated_at: new Date().toISOString() }
          : c
      );
      saveConversations(updatedConvs);

    } catch (error) {
      // エラーメッセージを表示
      const errorMessage: Message = {
        id: 'msg_' + Date.now() + '_error',
        role: 'assistant',
        content: `エラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
        created_at: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, errorMessage];
      saveMessages(currentConversationId, finalMessages);
    }

    setIsLoading(false);
  };

  const handleStartChat = () => {
    createNewConversation();
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <button
            onClick={createNewConversation}
            className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg"
          >
            <Plus size={18} />
            新しい相談
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {conversations.map(conversation => (
            <div
              key={conversation.id}
              onClick={() => setCurrentConversationId(conversation.id)}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 group flex items-center justify-between ${
                currentConversationId === conversation.id
                  ? 'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200'
                  : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <MessageCircle size={16} className="flex-shrink-0 text-slate-400" />
                <span className="text-sm text-slate-700 truncate">
                  {conversation.title}
                </span>
              </div>
              <button
                onClick={(e) => deleteConversation(conversation.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
              >
                <Trash2 size={14} className="text-red-500" />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-200 text-xs text-slate-500">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${
              apiStatus === 'connected' ? 'bg-green-400' :
              apiStatus === 'error' ? 'bg-red-400' : 'bg-yellow-400 animate-pulse'
            }`}></div>
            <span>
              {apiStatus === 'connected' ? 'Dify API接続済み' :
               apiStatus === 'error' ? 'API未接続' : '接続確認中...'}
            </span>
          </div>
          <p className="leading-relaxed">
            材料を入力してレシピを相談できます
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {showWelcome ? (
          <WelcomeScreen onStart={handleStartChat} />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto">
                {messages.map(message => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div className="flex gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-amber-500 text-white">
                      <MessageCircle size={18} className="animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm mb-2 text-slate-700">
                        料理AI
                      </div>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <ChatInput onSend={handleSendMessage} disabled={isLoading} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
