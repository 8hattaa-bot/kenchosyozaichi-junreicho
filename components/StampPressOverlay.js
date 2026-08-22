import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import HankoSeal, { SEAL_RED } from "./HankoSeal";
import InkBlot from "./InkBlot";

// Timeline, in ms from mount. The seal falls, lands, the ink blooms outward,
// then the whole thing lifts away. IMPACT_AT is the moment of contact —
// everything that reacts to the hit is scheduled off it.
const DESCENT = 300;
const IMPACT_AT = DESCENT;
const HOLD_UNTIL = 1450;
const EXIT = 300;

const SEAL_SIZE = 168;

export default function StampPressOverlay({ label, caption, onFinished }) {
  const backdrop = useSharedValue(0);
  const sealScale = useSharedValue(2.6);
  const sealY = useSharedValue(-90);
  const sealRotate = useSharedValue(-14);
  const sealOpacity = useSharedValue(0);
  const inkBloom = useSharedValue(0);
  const shockScale = useSharedValue(0.45);
  const shockOpacity = useSharedValue(0);
  const captionOpacity = useSharedValue(0);

  useEffect(() => {
    backdrop.value = withSequence(
      withTiming(1, { duration: 140 }),
      withDelay(HOLD_UNTIL, withTiming(0, { duration: EXIT }))
    );

    // Fall: accelerate in, overshoot slightly, squash on contact, settle.
    sealY.value = withSequence(
      withTiming(0, { duration: DESCENT, easing: Easing.in(Easing.cubic) }),
      withDelay(HOLD_UNTIL - DESCENT, withTiming(-70, { duration: EXIT, easing: Easing.out(Easing.cubic) }))
    );
    sealScale.value = withSequence(
      withTiming(1.05, { duration: DESCENT, easing: Easing.in(Easing.cubic) }),
      withTiming(0.93, { duration: 70 }),
      withSpring(1, { damping: 9, stiffness: 200 })
    );
    sealRotate.value = withSequence(
      withTiming(3, { duration: DESCENT, easing: Easing.in(Easing.cubic) }),
      withSpring(0, { damping: 11, stiffness: 160 })
    );
    sealOpacity.value = withSequence(
      withTiming(0.42, { duration: 120 }),
      withDelay(DESCENT - 120, withTiming(1, { duration: 260 })),
      withDelay(HOLD_UNTIL - DESCENT - 260, withTiming(0, { duration: EXIT }))
    );

    // Ink soaking into the paper, and the shockwave ring leaving the contact point.
    inkBloom.value = withDelay(IMPACT_AT, withTiming(1, { duration: 420, easing: Easing.out(Easing.quad) }));
    shockScale.value = withDelay(IMPACT_AT, withTiming(2.5, { duration: 520, easing: Easing.out(Easing.quad) }));
    shockOpacity.value = withDelay(
      IMPACT_AT,
      withSequence(withTiming(0.5, { duration: 60 }), withTiming(0, { duration: 460 }))
    );
    captionOpacity.value = withDelay(IMPACT_AT + 160, withTiming(1, { duration: 260 }));

    // Teardown is driven by a plain timer rather than an animation callback.
    // A completion callback attached to an animation nested inside
    // withSequence/withDelay does not reliably fire, and when it silently
    // doesn't, the overlay never unmounts and covers the app for good.
    const finish = setTimeout(() => {
      if (onFinished) onFinished();
    }, HOLD_UNTIL + EXIT + 40);

    const hit = setTimeout(() => {
      // Haptics are unavailable on web and on devices without a vibrator, and
      // the failure mode varies (sync throw vs rejected promise). It is pure
      // garnish — never let it interrupt the stamp.
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)?.catch?.(() => {});
      } catch (e) {}
    }, IMPACT_AT);
    return () => {
      clearTimeout(finish);
      clearTimeout(hit);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value }));
  const sealStyle = useAnimatedStyle(() => ({
    opacity: sealOpacity.value,
    transform: [
      { translateY: sealY.value },
      { scale: sealScale.value },
      { rotate: `${sealRotate.value}deg` },
    ],
  }));
  const bloomStyle = useAnimatedStyle(() => ({
    opacity: inkBloom.value * 0.16,
    transform: [{ scale: 0.9 + inkBloom.value * 0.35 }],
  }));
  const shockStyle = useAnimatedStyle(() => ({
    opacity: shockOpacity.value,
    transform: [{ scale: shockScale.value }],
  }));
  const captionStyle = useAnimatedStyle(() => ({ opacity: captionOpacity.value }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]} />
      <View style={styles.center}>
        <Animated.View style={[styles.bloom, bloomStyle]}>
          <InkBlot size={SEAL_SIZE * 1.6} color={SEAL_RED} />
        </Animated.View>
        <Animated.View style={[styles.shock, shockStyle]} />
        <Animated.View style={sealStyle}>
          <HankoSeal label={label} size={SEAL_SIZE} inked />
        </Animated.View>
        <Animated.View style={[styles.captionWrap, captionStyle]}>
          <Text style={styles.captionMain}>押印</Text>
          {!!caption && <Text style={styles.captionSub}>{caption}</Text>}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: "rgba(22,20,17,0.55)" },
  center: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  bloom: {
    position: "absolute",
    width: SEAL_SIZE * 1.6,
    height: SEAL_SIZE * 1.6,
    alignItems: "center",
    justifyContent: "center",
  },
  shock: {
    position: "absolute",
    width: SEAL_SIZE,
    height: SEAL_SIZE,
    borderRadius: SEAL_SIZE / 2,
    borderWidth: 3,
    borderColor: SEAL_RED,
  },
  captionWrap: { position: "absolute", top: "50%", marginTop: SEAL_SIZE * 0.62, alignItems: "center" },
  captionMain: { color: "#F4EAD0", fontSize: 20, fontWeight: "800", letterSpacing: 6 },
  captionSub: { color: "rgba(244,234,208,0.75)", fontSize: 13, fontWeight: "700", marginTop: 4 },
});
