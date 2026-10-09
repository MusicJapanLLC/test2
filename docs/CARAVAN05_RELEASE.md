# 村長、世界まで行くんですか？ — 開拓巡行18

Changed: village progression now continues across18 settlements. People, personalities, relationships, held cargo, bank resources, research and exploration travel together; local buildings and walls restart. One explicit departure confirmation states this.3simple goals unlock the next stop;18stamps unlock repeat circuits.

Presentation: original pixel departure-office title; persistent varied resident faces and expressive speech portraits;272 authored exchanges/544 lines; original short nonverbal voices;17 procedural BGM themes; snow/rain/sand/fog/steam/ash and distinct region props. A few residents take short breaks. Ground guards use spears; watchtowers require a stationed living guard and assign automatically.

Save: automatic local saving only, with the existing two-step reset. Old same-origin guild-chief-world-v3 saves remain compatible. No save-file operations in player UI. Purchases remain existing preview and no payment was enabled. No Runway or paid generation used.

| 地域 | 遊びの違い |
|---|---|
| 辞令だけは立派な村 | 初めの村 / 道・畑・作業台 |
| 雨漏り検査村 | 雨道を木道で直して運搬 |
| 砂しか勝たん区 | 日よけで暑い日の仕事が速くなる |
| ぬくぬく残業町 | 除雪と暖炉で仕事がはかどる |
| 定時噴火工業団地 | 周期的な灰を排煙塔で解消 |
| 出港未定の港 | 潮の満ち引きと桟橋 |
| 竹より背伸び村 | 木材の収穫増 |
| おかわり果樹町 | 食料が早く再生 |
| 視界良好という村 | 道標で速く歩ける道が広がる |
| 石にも席がある区 | 採石がはかどる |
| 長靴支給待ち村 | 湿原の食料が豊富 |
| 追い風出勤町 | 風向きと進行方向で運搬が速い |
| 湯けむり出張所 | 温泉の近くで回復・作業増 |
| 夜更かし朝礼村 | 村長の夜間採集増 |
| 橋の向こうも同じ村 | 積荷を持った帰り道が速い |
| きのこ議事堂 | 食料と一緒に倒木を拾う |
| 段取り棚田町 | 北の棚田で食料増 |
| 荷ほどき最終候補地 | 納品後に短い作業ブースト |

Tests:42campaign checks,8focused wind checks,19nested-save validation checks;60logistics/social checks including12gate-direction/role cases;27standalone UI/audio/defense checks at360×640/390×844/844×390. Actual pointer-only first house+hire27.3seconds, no resource injection. Three presentation/defense review bugs and one wind-direction bug fixed and independently rechecked.

Evidence in qa/caravan-v5. Screenshots use actual renderer; cast/weather examples are explicitly seeded test fixtures. Tests use Chromium mobile emulation, not physical iPhone hardware or subjective audio listening. Other games and main-domain root must retain their exact baseline artifacts during publication.

Final review: fixed the old200-owner relationship loader to match300resident capacity. Six scoped assertions pass on the actual standalone: all300resident IDs,900ties and300cooldowns survive migration/reload with no errors. Final holistic review disposition PASS.

Published: https://game.music-japan.com/mayor/ via MusicJapanLLC/test PR1015 merge951f7b3fb61c07d7b18909504f9ebfc2449fe145. Target Vercel guild-akari-game succeeded. Official HTTP response matches exact release SHA256403bb75631366b3e3960aace2ff21a19dc74085aab41840dc018639eda66e2bf. Official root unchanged. Live390px browser confirms18destinations,17music tracks, running audio afterStart, no manual-save controls, no horizontal overflow and no runtime errors. Live screenshots and raw evidence inqa/caravan-v5/live-* andpublication.json. Source PR132 remains available for review.
