# GUILD∞ Pixel Sprite Kit

前提: `GUILD_RULES.md` / `COLLAB.md` / `ART_DIRECTION.md` を読んでから利用してください

## 目的

現行 `index.html` の幾何プリミティブ中心のプレイヤー/NPC描画を、高密度ドットキャラクターへ段階的に置き換えるための共通部品です

ロマンシング サガ系の「小さいキャラでも役割と個性が読める」考え方と、ブレイブリーデフォルト系の奥行きある背景に負けない輪郭を抽象化してGUILD∞向けに実装しています

既存作品のスプライトは使用していません

## ファイル

`src/guild-pixel-sprites.js`

グローバルに `window.GuildPixelSprites` を公開します

## 基本利用

```html
<script src="./src/guild-pixel-sprites.js"></script>
```

```js
GuildPixelSprites.drawCharacter(ctx, x, y, {
  role: 'guildmaster',
  dir: 'down',
  moving: true,
  tick: performance.now(),
  scale: 2
})
```

## role

- `guildmaster`
- `warrior`
- `mage`
- `scout`

色だけでなく、武器・杖・装飾などシルエット側にも差を入れています

## dir

- `down`
- `left`
- `right`
- `up`

## animation

現フェーズはルール通り最低限の

- idle
- walk 2frame

だけです

人数やモーション種類を先に増やさず、既存キャラの品質を上げます

## 統合推奨順

1. `src/guild-pixel-sprites.js` を読み込む
2. まず主人公だけ置換
3. iPhoneで4方向移動時の見え方確認
4. 既存NPCを少人数だけ置換
5. HD-2D班の光/影と組み合わせて輪郭確認
6. 問題がなければ職業バリエーション追加

## 注意

- `scale` は整数を使う
- `imageSmoothingEnabled=false` を維持
- キャラだけ高解像度補間しない
- エフェクトを重ねて輪郭を潰さない
- 100人表示を目標にしない
- まず主人公1体の完成度を上げる

## Graphics班へ

このファイルは最終アートを固定するものではありません

目的は「矩形仮キャラ」から「本物のピクセルスプライト方式」へ描画パイプラインを変えることです

髪・服・武器・陰影・フレーム数はGraphics班側でどんどん改善してください
