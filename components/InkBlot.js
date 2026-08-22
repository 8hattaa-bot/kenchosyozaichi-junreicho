import React, { useMemo } from "react";
import Svg, { Path } from "react-native-svg";

// A hand-shaped ink-bleed blob instead of a perfect circle — real 朱肉 (red
// ink pad) soaks into washi unevenly, so a circular "bloom" under the seal
// reads as obviously synthetic. The outline is built from points scattered
// around a circle with per-point radius jitter, then connected with
// quadratic curves through each point's midpoint so the result is a smooth
// closed blob rather than a spiky polygon.
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function buildBlobPath(size, seed, jitter) {
  const rand = seededRandom(seed);
  const cx = size / 2;
  const cy = size / 2;
  const baseR = size / 2;
  const pointCount = 11;

  const points = [];
  for (let i = 0; i < pointCount; i++) {
    const angle = (i / pointCount) * Math.PI * 2;
    const r = baseR * (1 - jitter / 2 + rand() * jitter);
    points.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
  }

  const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const start = mid(points[points.length - 1], points[0]);
  let d = `M ${start.x} ${start.y}`;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const next = points[(i + 1) % points.length];
    const m = mid(p, next);
    d += ` Q ${p.x} ${p.y} ${m.x} ${m.y}`;
  }
  d += " Z";
  return d;
}

export default function InkBlot({ size, color, seed = 7, jitter = 0.34 }) {
  const path = useMemo(() => buildBlobPath(size, seed, jitter), [size, seed, jitter]);
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Path d={path} fill={color} />
    </Svg>
  );
}
