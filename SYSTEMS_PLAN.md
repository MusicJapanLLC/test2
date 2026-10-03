# GUILD∞ Systems Plan

作業前に `COLLAB.md` と `ART_DIRECTION.md` を確認すること

## 今回のSystems強化

1. `window.GUILD_API` を追加
2. 現在状態をsnapshotとして取得可能にする
3. localStorageへ自動保存
4. ページ再読込時に自動復帰
5. 他担当が内部変数を直接壊さずに接続できる入口を用意

## API予定

- `GUILD_API.getState()`
- `GUILD_API.save()`
- `GUILD_API.load()`
- `GUILD_API.spawnAdventurer()`
- `GUILD_API.setSpeed(multiplier)`

## 保存対象

- Gold / Wood / Food
- Guild Level
- Player position
- World speed
- Fever残時間
- NPC人数と各NPCの位置・状態

## 方針

GUILD∞の「1つの世界が永久に育つ」を強くするため、セーブはメニュー操作を要求せず自動保存を基本とする
