import { Sparkles, Clock, Heart, Lightbulb } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const features = [
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: '材料から提案',
      description: 'お持ちの材料を入力するだけで、最適なレシピを提案'
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: 'シンプル調理',
      description: '複雑な工程なし、失敗しにくいレシピ'
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: '無駄なし',
      description: '材料を最大限活用、余らせません'
    },
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: 'アレンジ自在',
      description: '美味しく作るコツも一緒にお届け'
    }
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-block p-4 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl shadow-lg">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800">
            料理レシピAI
          </h1>
          <p className="text-lg text-slate-600">
            冷蔵庫の材料を教えてください。<br />
            プロの料理研究家AIが、あなたにぴったりのレシピを提案します。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                  {feature.icon}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-slate-800 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onStart}
          className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-lg font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          レシピを相談する
        </button>

        <div className="text-sm text-slate-500">
          例: 「鶏肉、玉ねぎ、じゃがいもがあります」
        </div>
      </div>
    </div>
  );
}
