# Football pixel-art generation prompts

## Approved direction and provenance

On 2026-10-31 the owner approved replacing all temporary content artwork with original generated pixel art inspired by their attached Brazilian football / Habbo-style reference. This is a task-specific exception to the older no-generated-art guidance, not permission to generate branding. The attachment is a style reference only: its promotional copy, logos and factual claims are not imported.

The built-in image generation tool produced five initial transparent PNG source sheets and one corrective sheet after the approved review round. No external image service is loaded by the panel. These are fictional prototype illustrations, not official Habbo assets, verified game rewards or a claim about final item appearances. No third-party asset license is asserted for these generated replacements. Existing RBG/RCS branding and rank crests are unchanged.

## Export and reproduction

The source sheets remain in the generation session archive; only final sprites ship from `public/assets/`. Generation does not guarantee the requested canvas dimensions or exact row boundaries: inspect the output before extraction. The recorded outputs were 887×1774 for characters, expressions and profile collectibles, 1254×1254 for equipment, and 1774×887 for clubs/coach.

Mechanically extract the four columns and rows with browser Canvas, disabling image smoothing. Fit each complete sprite with a transparent margin in a 64×64 PNG; use 16×16 head portraits from the front character's head and 24×24 club crests. Do not redraw or replace the generated content during export. Profile-sheet row boundaries are fractions `0, .14, .255, .375, .495, .65, .805, .88, 1`; other sheets use equal rows. Check every exported cell for neighboring-cell fragments and clipped features.

Preserve existing filenames: eight players × four views plus eight heads; eight variants of each of the ten item categories; five boot-color aliases; the existing special celebration alias; five club crests plus the starred variant; and the coach. This replaces 133 PNGs. Head portraits come from the same front view. Aliases point to corresponding exported equipment/celebration variants; they are not additional generated designs. The `67` celebration remains an illustrative static demo preview, not a reconstruction of an official animation.

## Prompts

## Approved correction round 1

The owner approved The Mender on 2026-10-31 after review-rangers found that several illustrations contradicted existing colors and names. A sixth transparent source sheet supplied five club kits in the existing label order (green/white, blue/white, yellow/white, red/white, purple/white), a blue frame, volcanic frame, gold-confetti and volcanic banners, ear-listening celebration, belt/meteor/superhero/throne/dragon poses and a night banner. These replace existing files; no additional runtime collection or feature is added. The silver frame was retained at `moldura-0.png`, with the blue reward at `moldura-1.png`. Existing data overrides select named pass and shop illustrations. Banner identity text has an opaque ink field for separation from detailed artwork.

The corrective source sheet is 1254×1254. Extract its four equal rows/columns; the third-row first banner extends to x = 29% of sheet width, so include that complete rectangular scene before export, and start the neighboring listening-character crop at x = 30% to exclude the scene edge. As before, export 64×64 final sprites with smoothing disabled. Existing player portraits and club crests are untouched by the correction round.

```text
Create ONE transparent-background football pixel-art sprite atlas, exactly 1024 by 1024 pixels, a precise grid of 4 columns x 4 rows with 16 equal square cells. No grid lines, labels or text, no letters/numbers/logos. Each sprite or scene centered wholly inside its cell with at least 24 pixels clear padding and no overlap. Match chunky Habbo-inspired human football pixel game art: hard square pixel clusters, dark outlines, 2-3 flat shades, no blur, soft gradients, glows or shadows.
ROW1 left to right: (1) green jersey with white trim, white shorts, green socks; (2) royal blue jersey with white trim, white shorts, blue socks; (3) yellow jersey with white trim, white shorts, yellow socks; (4) red jersey with white trim, white shorts, red socks. All are isolated football kit product arrangements with NO heads or bodies, jersey above shorts above socks.
ROW2: (1) PURPLE goalkeeper jersey with WHITE trim and WHITE shorts and purple socks and black goalkeeper gloves, no body; (2) empty bright BLUE square portrait frame with transparent center, chunky pixel corners; (3) empty charcoal VOLCANIC square portrait frame with flat orange-red lava cracks on the border and transparent center, no flames beyond its border; (4) WIDE horizontal football pitch/stadium banner, 2.5:1 aspect ratio, with a shower of small GOLD CONFETTI shapes above a green football pitch, framed as an actual collectible illustration, NOT UI.
ROW3: (1) WIDE horizontal VOLCANIC FOOTBALL pitch banner, flat orange lava streams and dark volcanic rock behind a pitch, 2.5:1; (2) HUMAN footballer with medium-brown skin and short black curly hair, white jersey/black shorts/white socks/black boots, holding one hand to ear in listening celebration; (3) SAME human footballer standing proudly wearing a championship BELT at waist, MVP pose; (4) SAME footballer in a dynamic athletic jumping pose, with one small meteor-shaped ball behind him, a literal METEOR collectible pose, no text.
ROW4: (1) SAME human footballer in a proud superhero stance, hands on hips with a short neutral cape, no logos; (2) SAME human footballer sitting in a simple pixel chair, hands on knees like a throne MVP pose, no crown; (3) SAME human footballer with a small stylized pixel dragon curling behind his shoulder, MVP pose, dragon contained in cell; (4) WIDE horizontal night football pitch banner with dark-blue sky and distant floodlights.
Humans have recognizable human ears, noses and hands, athletic legs, expressive square human heads, not birds, ducks, beaks or animals. Existing sample product names require the depicted colors and themes, so be literal. Gold and purple belong only to the physical collectible artwork, not interface chrome. Transparent PNG.
```

### characters

```text
Create ONE production pixel-art character sprite atlas PNG with genuinely transparent background. Canvas exactly 1024 wide by 2048 high. A precise regular grid of 4 columns x 8 rows, each cell exactly 256x256 pixels. NO dividers, NO text labels, NO margins outside the grid. Every character entirely contained and centered in their own cell, with at least 24 pixels of transparent space from cell edge. The same standing full-body HUMAN FOOTBALLER in each row, four views left to right: FRONT, RIGHT-facing profile, BACK, LEFT-facing profile. Eight different characters one per row.
Art direction: authentic chunky Habbo-inspired Brazilian football pixel art like an isometric social hotel game, large expressive square HUMAN heads, visible ears, eyes and eyebrows, SHORT human noses, human hands, full-length legs, football shorts and knee-high socks and boots. NOT ducks, birds, beaks, animals, chibi blobs, generic RPG sprites. Strong black pixel outlines, crisp square pixel clusters, 2-3 flat shades per material, no antialiasing, no gradients, no glows, no ground shadows or stage props. Reference world: football fans and players on a neighborhood Brazilian pitch. Approx 48x64 logical pixels per sprite scaled 3x or 4x, aim head 1/3 of total figure height, human athletic proportions. Same figure size and baseline in all cells; consistent body volume and costume across directions.
Rows from top:
1 medium-brown skin, short black curly hair, white jersey with black collar, black shorts, white socks, black boots; protagonist.
2 dark-brown skin, short natural afro, green jersey, dark shorts, green socks, white boots.
3 light tan skin, brown side-part hair, blue jersey, white shorts, blue socks, black boots.
4 tan skin, dark ponytail, red jersey, black shorts, red socks, white boots.
5 deep brown skin, shaved head, yellow goalkeeper jersey, black goalkeeper gloves, dark shorts, yellow socks.
6 light skin, auburn bob haircut, white jersey with green trim, green shorts, white socks.
7 medium brown skin, black wavy hair, black jersey with white trim, white shorts, black socks.
8 dark skin, close black hair, burgundy jersey with cream trim, cream shorts, burgundy socks.
No logos, no sponsorship, no lettering, no numerals, no UI, no speech bubbles. Deliver clean cohesive professional game sprite sheet; four views of each row MUST visibly depict the SAME person.
```

### equipment

```text
Create ONE professional game sprite atlas on a genuinely transparent background, exactly 1024x1024 pixels, precise 4 columns x 4 rows grid of equal 256x256 cells. No grid lines, labels, lettering, UI or background. Each sprite centered completely within its cell, with generous 24px minimum transparent padding. Authentic Brazilian football, chunky HABBO-style pixel art, hard square black outlines and flat 2-3 shade clusters, no blur, antialiasing, shadows, gradients or glow. All objects are tangible football equipment drawn in coherent slightly isometric pixel perspective.
First two rows: EIGHT hanging short-sleeved football kits, jersey above matching shorts and knee socks, NO human bodies or heads, no logos or writing. Row1 cells left to right white with black trim, green with white trim, royal blue with white trim, red with black trim. Row2 yellow goalkeeper kit, white with green trim, black with white trim, burgundy with cream trim.
Last two rows: EIGHT pairs of football boots, each pair side by side diagonally with visible laces and studs, no legs. Row3 black boots with white detailing, blue boots with white detailing, green boots with black detailing, red boots with white detailing. Row4 white boots with dark detailing, cream boots with green detailing, burgundy boots with cream detailing, graphite boots with silver detailing.
Looks like real equipment in a pixel football social game, not tiny generic RPG icons, no ducks or animals. Pixel artwork occupies around 70% of each cell. Crisp limited palette and thick readable outlines.
```

### expressions

```text
Create ONE cohesive HUMAN football character performance sprite atlas with genuinely transparent background, exactly 1024x2048 pixels. A precise 4 columns x 8 rows grid, each cell exactly 256x256. No labels, no text, no dividers. Each complete figure centered in own cell with at least 20px transparent padding; no overlap or clipped hands. Habbo-inspired Brazilian futebol pixel art: expressive square HUMAN head, short curly black hair, brown skin, white jersey with black collar, black shorts, white knee socks, black football boots. Human nose, human ears, eyebrows and hands, tall athletic legs, head about 1/3 total height, same person in every cell, standing approx 180px high; hard chunky square pixel clusters, black outlines, 2-3 flat tones, no soft shading or antialiasing. NO ducks, beaks, animals, babies, RPG adventurers, logos, numerals, signage, glows or shadows.
Rows1-2: eight distinct MVP poses, one pose per cell left to right: hands on hips; arms folded; one hand on hip and other raised; arms raised triumphantly; kneeling one knee; pointing forward; football tucked under arm; standing proudly with small ordinary football trophy (no podium).
Rows3-4: eight celebration snapshots: pointing to ear; both arms lifted; hands making heart at chest; seated cross-legged meditation; jumping with fist raised; arms wide; finger pointing upward; hands on waist leaning back.
Rows5-6: eight entrance snapshots: walking confidently; jogging; waving to supporters; checking boot laces; stretching shoulder; hands clapping; running with ball at feet; captain adjusting armband.
Rows7-8: eight VS presentation snapshots: front arms crossed; three-quarter arms crossed; ready stance fists on hips; right profile standing; hands behind back; chin raised with hands at sides; pointing at camera; left profile hands on hips.
Every cell has ONE full-body character only. No backgrounds or text. Matchday football culture, authentic consistent game sprites.
```

### profile

```text
Create ONE professional pixel-art collectible customization atlas, genuinely transparent PNG, exactly 1024x2048 pixels. Precise regular grid 4 columns x 8 rows; each cell 256x256 pixels. NO grid lines, labels, text, letters, numerals, logos, prices or UI. Each item is wholly inside own cell with at least 24px transparent padding, centered. Cohesive Habbo-inspired Brazilian football pixel aesthetic, black pixel outlines, chunky square clusters, flat 2-3 shades, absolutely no blur, gradients, light halos or cast shadows.
Rows1-2: eight WIDE horizontal profile banner artworks, each aspect ratio 2.5:1 centered in cell: green grass pitch with white markings; orange volcanic rocks and small red lava stream in blocky flat colors; rainy stadium terrace with floodlight; night urban football court; blue tiled locker room; close packed supporters terrace with diverse human pixel fans; neighborhood pitch with buildings; green-and-white pennants by stadium fence. Scene art only, no text.
Rows3-4: eight empty square avatar portrait FRAME objects with clearly transparent centers: pale-blue simple beveled pixel frame; slate silver frame; green laurel frame; black-white checkered football frame; deep-blue star detail frame; red brick urban frame; green corner-flag frame; cream laurel frame. Frames are actual collectible items, no full cards behind them.
Rows5-6: eight VERTICAL football trading cards, each aspect ratio 2:3, with a HUMAN footballer portrait in middle and small plain blank bottom panel without any letters. Silver bordered card with white/black kit; blue card blue kit; green card green kit; red card red kit; cream card burgundy kit; black card white kit; orange volcanic card black kit; muted gold card white kit. People have square human heads, short human noses, varied skin tones/hair. No animals.
Rows7-8: eight small horizontal collectible TITLE PLAQUES, aspect ratio 3:1, each with a small football-related pixel emblem centered and EMPTY space either side, no words: black/silver with football; green/cream with captain armband; blue/silver with boot; burgundy/cream with laurel; graphite/white with goal net; green/white with whistle; blue/white with crossed pennants; cream/charcoal with tiny trophy.
Real game collectibles, one item per cell, precise pixel clusters, no ducks, no speech balloons.
```

### clubs

```text
Create ONE transparent-background game sprite sheet exactly 1024x512 pixels. Precise grid of 4 columns by 2 rows, each cell 256x256. No grid lines, labels, letters, numbers, words or existing logos. All sprites centered and wholly inside their own cell with 24px transparent padding. Authentic chunky football pixel art: hard square clusters, black outlines, 2-3 flat shades per color, no anti aliasing, no glows, no shadows.
Top row: four ORIGINAL FICTIONAL amateur club crests: cell1 green-and-cream shield with single small football at center; cell2 blue-and-white circular crest with simple diagonal stripe; cell3 burgundy-and-cream shield with small laurel; cell4 orange-and-black round crest with two simple stripes.
Bottom row: cell1 black-and-white shield with stylized geometric football; cell2 SAME burgundy-and-cream shield as top row third cell with ONE small gold star centered above, keep entire star within cell; cell3 HUMAN male football coach full-body, middle-aged brown skin, close-cropped black hair and dark stubble, green track jacket with white sleeve stripe, black track pants, white trainers, standing hands on hips, Habbo-inspired square human head 1/3 body height, recognizable ears and nose; cell4 same coach holding a small clipboard with NO text. No ducks, birds, beaks or animals. Style fits human pixel footballers from a Brazilian neighborhood social football game. Crests are only temporary fictional club identities, not RBG or RCS branding.
```
