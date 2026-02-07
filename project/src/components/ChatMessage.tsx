import { User, ChefHat } from 'lucide-react';
import type { Message } from '../lib/api';
import ShoppingList from './ShoppingList';

interface ChatMessageProps {
  message: Message;
}

// 買い物リストを抽出する関数
function extractShoppingList(content: string): { items: string[]; contentWithoutList: string } {
  const lines = content.split('\n');
  const shoppingItems: string[] = [];
  const otherLines: string[] = [];
  
  let inShoppingList = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // 買い物リストセクションの開始を検出
    if (
      trimmedLine.includes('買い物リスト') ||
      trimmedLine.includes('買い足し') ||
      trimmedLine.includes('追加で必要') ||
      trimmedLine.includes('購入が必要')
    ) {
      inShoppingList = true;
      otherLines.push(line); // ヘッダー行はそのまま保持
      continue;
    }
    
    // 別のセクションの開始を検出（買い物リストセクションの終了）
    if (inShoppingList && (
      trimmedLine.startsWith('■') ||
      trimmedLine.startsWith('【') ||
      trimmedLine.startsWith('##') ||
      (trimmedLine.length > 0 && !trimmedLine.startsWith('・') && !trimmedLine.startsWith('-') && !trimmedLine.startsWith('•') && !trimmedLine.match(/^\d+[\.\)]/))
    )) {
      // 空行でなく、リストマーカーでもない場合は新しいセクションとみなす
      if (trimmedLine.length > 0) {
        inShoppingList = false;
      }
    }
    
    // 買い物リストのアイテムを抽出
    if (inShoppingList) {
      const itemMatch = trimmedLine.match(/^[・\-•]\s*(.+)/) || trimmedLine.match(/^\d+[\.\)]\s*(.+)/);
      if (itemMatch) {
        shoppingItems.push(itemMatch[1].trim());
        continue; // リストアイテムはotherLinesに追加しない
      }
    }
    
    otherLines.push(line);
  }
  
  return {
    items: shoppingItems,
    contentWithoutList: otherLines.join('\n')
  };
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  // AIメッセージの場合、買い物リストを抽出
  const { items: shoppingItems, contentWithoutList } = !isUser 
    ? extractShoppingList(message.content)
    : { items: [], contentWithoutList: message.content };

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
          {contentWithoutList}
        </div>
        
        {/* 買い物リストがある場合は専用UIで表示 */}
        {shoppingItems.length > 0 && (
          <ShoppingList items={shoppingItems} messageId={message.id} />
        )}
      </div>
    </div>
  );
}
