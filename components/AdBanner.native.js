import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { isRunningInExpoGo } from "expo";

import { ADMOB_BANNER_UNIT_ID } from "../config/monetization";

// react-native-google-mobile-ads must never be imported at module scope.
// It runs TurboModuleRegistry.getEnforcing('RNAppModule') on import, which
// hard-fails wherever the native side isn't compiled in (Expo Go) — a failure
// JS try/catch cannot intercept. So it is required lazily, after mount, and
// only once we know we're not in Expo Go.
//
// In an EAS build (development / preview / production) the native module is
// present and the banner renders normally.
const CAN_SHOW_ADS = !isRunningInExpoGo();

export default function AdBanner() {
  const [ads, setAds] = useState(null);

  useEffect(() => {
    if (!CAN_SHOW_ADS) return;
    let cancelled = false;
    (async () => {
      try {
        const mod = require("react-native-google-mobile-ads");
        await mod.default().initialize();
        if (!cancelled) setAds(mod);
      } catch (e) {
        // An ad that fails to load must never take the app down with it.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!CAN_SHOW_ADS || !ads) return null;

  const { BannerAd, BannerAdSize } = ads;
  return (
    <View style={{ alignItems: "center", backgroundColor: "#F3ECDC", paddingVertical: 4 }}>
      <BannerAd unitId={ADMOB_BANNER_UNIT_ID} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}
