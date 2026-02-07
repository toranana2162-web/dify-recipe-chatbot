import { useState, useEffect } from 'react';
import { ShoppingCart, Check } from 'lucide-react';

interface ShoppingListProps {
  items: string[];
  messageId: string;
}

export default function ShoppingList({ items, messageId }: ShoppingListProps) {
  const storageKey = `shopping_${messageId}`;
  
  const [checkedItems, setCheckedItems] = useState<Set<number>>(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
    return new Set();
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify([...checkedItems]));
  }, [checkedItems, storageKey]);

  const toggleItem = (index: number) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const checkedCount = checkedItems.size;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  return (
    <div className="mt-3 bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart size={18} className="text-amber-600" />
          <span className="font-semibold text-amber-800">買い物リスト</span>
        </div>
        <span className="text-sm text-amber-600">
          {checkedCount} / {totalCount} 完了
        </span>
      </div>
      
      {/* プログレスバー */}
      <div className="h-1 bg-amber-100">
        <div 
          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* リスト */}
      <ul className="divide-y divide-slate-100">
        {items.map((item, index) => (
          <li 
            key={index}
            onClick={() => toggleItem(index)}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-slate-50 ${
              checkedItems.has(index) ? 'bg-green-50' : ''
            }`}
          >
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
              checkedItems.has(index) 
                ? 'bg-green-500 border-green-500' 
                : 'border-slate-300 hover:border-amber-400'
            }`}>
              {checkedItems.has(index) && (
                <Check size={14} className="text-white" />
              )}
            </div>
            <span className={`flex-1 transition-all duration-200 ${
              checkedItems.has(index) 
                ? 'text-slate-400 line-through' 
                : 'text-slate-700'
            }`}>
              {item}
            </span>
          </li>
        ))}
      </ul>
      
      {/* フッター */}
      {checkedCount === totalCount && totalCount > 0 && (
        <div className="bg-green-50 px-4 py-2 text-center text-green-600 text-sm font-medium">
          ✨ 買い物完了！
        </div>
      )}
    </div>
  );
}

