import { User, ChefHat } from 'lucide-react';
import type { Message } from '../lib/api';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 p-4 ${isUser ? 'bg-white' : 'bg-gradient-to-r from-amber-50 to-orange-50'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-slate-200' : 'bg-gradient-to-br from-orange-400 to-amber-500 text-white'
      }`}>
        {isUser ? <User size={18} /> : <ChefHat size={18} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm mb-1 text-slate-700">
          {isUser ? 'あなた' : '料理AI'}
        </div>
        <div className="prose prose-sm max-w-none text-slate-800 whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    </div>
  );
}
