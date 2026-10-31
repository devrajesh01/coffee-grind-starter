# Reference Analysis

## Source and Confidence

The only supplied reference is `public/assets/WhatsApp Video 2026-10-31 at 9.19.16 AM (1).mp4`. It is a 14.1-second, 480 x 864 handheld recording of a laptop screen, not a clean screen capture. The screen is tilted, partially obscured by laptop edges, reflections, and camera movement. The timestamps below are approximate clip times; they describe the visible site content, not verified scroll progress.

## Scene Notes

| Approx. time | Visible content | Motion and composition |
| --- | --- | --- |
| 0:00 | Warm off-white page with oversized black GRIND type and a centered metallic grinder. A small section label sits above the headline. | The camera is already moving slightly because the reference is filmed by hand. Grinder dominates the center and overlaps the headline. |
| 0:02-0:04 | Grinder components separate vertically and laterally; grounds or small particles fall below the mechanism. | Parts appear suspended in an exploded view while the headline remains large behind them. |
| 0:05-0:08 | Pour-over setup: metal kettle, cone dripper, glass carafe, and a visible amber coffee stream. Terracotta and cream vessels sit around the carafe. | The composition shifts from the grinder to a warm tabletop still life; the stream is the clearest active movement. |
| 0:08-0:11 | A large handmade-looking terracotta cup appears over bold typography. Small white roast/flavor information panels flank it. | Cup is centered and enlarged; information panels float near its sides. |
| 0:11-0:14 | Scene darkens into a creator/brand end card with a social mark and wordmark. | The product scene fades down; centered branding becomes the last visible element. |

## Visual System

- Primary backgrounds: warm ivory in the grinder scene, then a soft warm tabletop with clay, cream, and coffee-brown objects.
- Typography: very large, tightly spaced uppercase black display lettering behind the product; small uppercase section labels; compact information panels.
- Product placement: isolated centered hero objects, large enough to overlap the typography. Objects have metallic, glass, liquid, and ceramic materials rather than flat icon styling.
- The handheld capture makes exact font, color, spacing, scroll position, and transition timing uncertain. The visible page appears to use continuous scene transitions rather than unrelated marketing sections.

## Rendering Decisions

- Use one pinned GSAP/ScrollTrigger story timeline so forward and reverse scrolling follow the same scene sequence.
- Keep the page shell and text server-rendered; place animation and any WebGL work inside client scene components only.
- Use supplied grinder and bean assets where they help maintain continuity. Use CSS/SVG for simple typography and annotation layers; reserve Three.js for scene objects only when the dependency and rendering cost are justified.
- Do not embed the reference MP4 in the final page. It contains the laptop and camera movement, so it is evidence for analysis rather than usable production footage.
- No clean grinder, kettle, dripper, carafe, cup, texture, or logo assets were supplied. Any recreated product geometry is an approximation until licensed or original high-quality assets are available.

## Known Limitations and Follow-up

- A direct screen capture or higher-resolution reference would materially improve typography, transition timing, and layout matching.
- The closing branding is partially obscured by the laptop recording and cannot be transcribed confidently.
- The current project has a stylized SVG grinder and bean only; exact photorealistic product matching cannot be claimed from those assets.
- Visual verification should compare the implementation at representative scroll positions with the sampled frames, while accounting for the reference's perspective distortion.