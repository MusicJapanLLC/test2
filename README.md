# GUILD∞ — 灯の街

共同開発の正本は `GUILD_RULES.md`。開始前に `GUILD_RULES.md` → `COLLAB.md` → `ART_DIRECTION.md` を読む
v0.5の差分・検証・他班との接続は `FINAL_POLISH_HANDOFF.md`

4方向のドット絵で歩くギルド都市。冒険者が自動で依頼に出かけ、資源を持ち帰る。設備を強化すると街が成長する

## 遊ぶ

`python3 -m http.server 8080` で配信してブラウザで開く
スマホは行きたい場所をタップ/建物をタップして調べる。PCはWASD/矢印=移動、A/Space/Enter=調べる、B/Escape=移動停止/戻る、X=台帳、Y=状況
BGMは♪で開始。15秒ごとにこのブラウザへ自動記録

`npm run build` で `dist/guild_infinity_v05.html` を出力。ネット接続なしで実行できる単一HTML

## 検証

```
npm ci
npx playwright install --with-deps chromium
npm run check
npm run test:audio
npm test
```

実機iPhone/Safariの音とsafe-area確認は未実施。GitHub Pagesの公開成功も未確認
