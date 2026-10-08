import './WorldPrototype.css';
import { useState } from 'react';
const areas = [{
  n: 'へそ曲がりの森',
  e: '01',
  c: '#597548',
  r: '曲がった木',
  s: '歩いて採る → 次の土地へ'
}, {
  n: '石頭の峡谷',
  e: '02',
  c: '#a16b44',
  r: '鉄鉱石',
  s: '森の標本を5個集める'
}, {
  n: '会議の長い沼',
  e: '03',
  c: '#3c7168',
  r: '夜光キノコ',
  s: '峡谷の標本を5個集める'
}, {
  n: '噴火待ち火山',
  e: '04',
  c: '#784a44',
  r: '火山ガラス',
  s: '沼の標本を5個集める'
}];
export const GeneratedComponent = () => {
  const [tab, T] = useState('世界');
  const [selected, S] = useState(-1);
  const [party, P] = useState<string[]>([]);
  const [msg, M] = useState('');
  const tabs = ['世界', '遠征', '村長商会'];
  const toggle = (n: string) => P(p => p.includes(n) ? p.filter(x => x !== n) : p.length < 3 ? [...p, n] : p);
  return <main className="world-proto min-h-screen w-full bg-[#e7dfc4] text-[#282c21] font-mono pb-24" style={{
    maxWidth: 460,
    margin: 'auto'
  }}><header className="bg-[#26372e] px-5 pt-8 pb-5 text-[#f5ebca]"><div className="flex justify-between text-xs tracking-widest"><span>村営・世界開拓局</span><span>第 003 号</span></div><h1 className="text-2xl font-black leading-tight mt-4">村長、世界まで<br />行くんですか？</h1><div className="mt-4 text-xs border-t border-[#8d936d] pt-3">DAY 08　木 128　石 76　鉄 12</div></header><nav className="flex border-b-2 border-[#29382d]">{tabs.map(t => <button key={t} onClick={() => {
        T(t);
        S(-1);
        M('');
      }} className={`flex-1 py-4 text-sm font-bold ${t === tab ? 'bg-[#d5aa50]' : 'bg-[#f0e7c8]'}`}>{t}</button>)}</nav><section className="p-5"><p className="text-[10px] tracking-[.2em] mb-2">EXPLORE / 村の外にも仕事がある</p><h2 className="text-2xl font-bold mb-2">{tab === '世界' ? '出張のついでに、冒険' : tab === '遠征' ? '出張費は、ごはんです' : '村長だけ、様子がおかしい'}</h2><p className="text-xs leading-6 mb-5">{tab === '村長商会' ? '全エリア無料 / お好みで買い切り / この画面はデザイン試作' : tab === '遠征' ? '最大3人を派遣　遠征中は村の仕事をお休み' : '止まると採集　危なくなったらいつでも帰村'}</p>{tab === '世界' && <><div className="h-32 mb-5 bg-[#6e8154] relative overflow-hidden border-2 border-[#303e2a]"><div className="absolute bg-[#bfa374] w-full h-4 top-16 -rotate-6" />{[18, 68, 138, 192, 280].map((x, i) => <div key={x} className="absolute" style={{
            left: x,
            top: i % 2 ? 65 : 16
          }}><div className="w-7 h-8 bg-[#304d38] border-b-8 border-[#466340]" /><div className="h-3 w-2 bg-[#72513c] ml-3" /></div>)}<span className="absolute bottom-2 right-3 text-xs text-white bg-[#273c30] px-2 py-1">現在地：わが村</span></div>{areas.map((a, i) => <article key={a.n} className="mb-3 border-2 border-[#a79f7e] bg-[#f5edcf]"><button className="w-full p-4 text-left flex gap-3" onClick={() => S(selected === i ? -1 : i)}><span className="text-3xl font-bold" style={{
              color: a.c
            }}>{a.e}</span><span><strong className="block text-base">{a.n}</strong><small className="block mt-1 text-[#6b6b51]">特産品 / {a.r}</small></span><span className="ml-auto">↗</span></button>{selected === i && <div className="px-4 pb-4 text-xs"><p className="mb-3">{a.s}</p><button className="bg-[#314c38] text-white w-full p-3" onClick={() => M(`${a.n}へ出発する導線です — 実装版では操作できるマップへ移動`)}>ここへ出かける</button></div>}</article>)}</>}{tab === '遠征' && <><div className="border-2 border-[#aaa07b] bg-[#f5edcf] p-4 mb-4"><b>へそ曲がりの森 / 90秒</b><p className="text-xs mt-2">報酬：木材・曲がった木・住民経験値</p></div>{['ハチベエ / 心配性', 'トメ / 大食い', 'タロ吉 / 天才肌'].map(n => <button key={n} onClick={() => toggle(n)} className={`w-full text-left border-2 p-4 mb-3 ${party.includes(n) ? 'border-[#526841] bg-[#ced4ab]' : 'border-[#afa786] bg-[#f5edcf]'}`}>{party.includes(n) ? '☑' : '□'} {n}</button>)}<button disabled={!party.length} onClick={() => M(`${party.length}人で遠征を開始する導線です`)} className="w-full bg-[#314c38] text-white py-4 disabled:opacity-40">{party.length}人を派遣する / ごはん12</button></>}{tab === '村長商会' && [{
        n: '村長への差し入れ',
        p: 300,
        d: '肩書きと紙吹雪　ご近所から二度見される'
      }, {
        n: '黄金の決裁印',
        p: 980,
        d: '村長の攻撃4倍＋衝撃波　承認が物理になる'
      }, {
        n: '村長ロボ',
        p: 1980,
        d: '出動中6倍＋シールド＋範囲攻撃　予算が歩く'
      }].map((p, i) => <article key={p.n} className="border-2 border-[#a69a6e] bg-[#f8edc9] mb-4 p-4"><small className="text-[#827044]">村営備品 No.{i + 1} / 買い切り</small><h3 className="text-xl font-bold my-2">{p.n}</h3><p className="text-xs leading-6 mb-4">{p.d}</p><button onClick={() => M('デザイン試作のため決済しません　実装版はStripeの確認画面へ進みます')} className="w-full bg-[#d2a74c] border-2 border-[#6a582c] py-3 font-bold">詳細を見る　¥{p.p.toLocaleString()}</button></article>)}{msg && <div role="status" className="mt-4 p-4 border-2 border-[#566544] bg-[#dce2bd] text-xs leading-6">{msg}<button className="block underline mt-2" onClick={() => M('')}>閉じる</button></div>}<p className="text-center text-[10px] tracking-widest mt-8 text-[#727057]">村長の器より、世界のほうが広い</p></section><footer className="fixed bottom-0 max-w-[460px] w-full flex border-t-2 border-[#17281e] bg-[#2c3c30] text-[#f6ecc8]">{['建てる', '住民', '世界', '村長室'].map(n => <button key={n} className={`flex-1 py-5 text-xs ${n === '世界' ? 'bg-[#5f714d]' : ''}`} onClick={() => n === '世界' ? T('世界') : M(`${n}の画面へ戻る導線です`)}>{n}</button>)}</footer></main>;
};