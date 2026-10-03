# UX integration note v0.6.1

User changed movement priority again:
- return to the earliest smooth movement feel
- one-step movement is too stiff
- tap-to-destination is also hard to use

Integration rule:
1. merge/validate continuous drag input first
2. wait for Systems true fractional movement API
3. then swap Input layer from repeated direction feed to direct vector feed
4. keep approved visual baseline and MENU/Typography work intact
5. Audio and Graphics continue independently

New game remains out of scope
