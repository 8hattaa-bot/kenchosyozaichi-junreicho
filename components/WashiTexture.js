import React, { useMemo } from "react";
import Svg, { Defs, Pattern, Rect, Line, Circle } from "react-native-svg";

// A subtle 和紙 (washi) paper-fiber texture: short flecks and specks tiled
// behind the cream background, standing in for the visible plant fibers
// pressed into real washi. Kept faint (≤6% opacity) so it reads as paper
// grain rather than decoration, and stays out of the way of text contrast.
//
// The fleck positions are seeded (not Math.random on every render) so the
// texture doesn't visibly "swim" on re-render, and so every mounted instance
// tiles identically.
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

const TILE = 180;
const FLECK_COUNT = 26;

function buildFlecks() {
  const rand = seededRandom(20260814);
  const items = [];
  for (let i = 0; i < FLECK_COUNT; i++) {
    const x = rand() * TILE;
    const y = rand() * TILE;
    const isFiber = rand() > 0.4;
    if (isFiber) {
      const len = 4 + rand() * 10;
      const angle = rand() * Math.PI;
      const dx = Math.cos(angle) * len;
      const dy = Math.sin(angle) * len;
      items.push({
        type: "fiber",
        x1: x,
        y1: y,
        x2: x + dx,
        y2: y + dy,
        opacity: 0.35 + rand() * 0.35,
      });
    } else {
      items.push({
        type: "speck",
        x,
        y,
        r: 0.5 + rand() * 1.1,
        opacity: 0.3 + rand() * 0.3,
      });
    }
  }
  return items;
}

// Memoised — this paints a full-screen SVG pattern behind the whole app, so
// re-running it on every parent render is pure waste; its props never change.
function WashiTexture({ color = "#8C7A52", opacity = 0.09 }) {
  const flecks = useMemo(buildFlecks, []);

  return (
    <Svg
      width="100%"
      height="100%"
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      pointerEvents="none"
    >
      <Defs>
        <Pattern id="washiFiber" width={TILE} height={TILE} patternUnits="userSpaceOnUse">
          {flecks.map((f, i) =>
            f.type === "fiber" ? (
              <Line
                key={i}
                x1={f.x1}
                y1={f.y1}
                x2={f.x2}
                y2={f.y2}
                stroke={color}
                strokeWidth={0.6}
                strokeLinecap="round"
                opacity={f.opacity}
              />
            ) : (
              <Circle key={i} cx={f.x} cy={f.y} r={f.r} fill={color} opacity={f.opacity} />
            )
          )}
        </Pattern>
      </Defs>
      <Rect x={0} y={0} width="100%" height="100%" fill="url(#washiFiber)" opacity={opacity} />
    </Svg>
  );
}

export default React.memo(WashiTexture);
