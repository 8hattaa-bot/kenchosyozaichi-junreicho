import React from "react";
import Svg, { Circle, G, Text as SvgText } from "react-native-svg";

export const SEAL_RED = "#BD3B28";

// A round 落款-style seal: heavy outer ring, thin inner ring, and the name set
// vertically down the middle the way a real 印鑑 reads.
//
// SvgText positions by baseline, not by centre, so each glyph is nudged down by
// ~0.35em to sit optically centred on its line.
// Memoised — one of these is drawn for every stamped city in the grid, and its
// props are plain values that rarely change.
function HankoSeal({ label, size = 44, color = SEAL_RED, inked = false }) {
  const chars = Array.from(label);
  const r = size / 2;
  const strokeWidth = Math.max(2, size * 0.07);
  const outerR = r - strokeWidth / 2 - size * 0.015;
  const innerR = outerR - strokeWidth * 0.9;

  const fontSize = chars.length <= 2 ? size * 0.36 : size * 0.26;
  const lineHeight = fontSize * 1.06;
  const firstBaseline = r - (lineHeight * chars.length) / 2 + lineHeight / 2 + fontSize * 0.35;

  const glyphColor = inked ? "#FBF3E4" : color;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle
        cx={r}
        cy={r}
        r={outerR}
        stroke={color}
        strokeWidth={strokeWidth}
        fill={inked ? color : "rgba(189,59,40,0.06)"}
      />
      <Circle
        cx={r}
        cy={r}
        r={innerR}
        stroke={inked ? "rgba(251,243,228,0.55)" : "rgba(189,59,40,0.35)"}
        strokeWidth={Math.max(0.7, size * 0.012)}
        fill="none"
      />
      <G>
        {chars.map((char, i) => (
          <SvgText
            key={`${char}-${i}`}
            x={r}
            y={firstBaseline + i * lineHeight}
            fontSize={fontSize}
            fontWeight="700"
            fill={glyphColor}
            textAnchor="middle"
          >
            {char}
          </SvgText>
        ))}
      </G>
    </Svg>
  );
}

export default React.memo(HankoSeal);
