import React, { useState } from "react";
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// Per-icon imports — see the note in App.js on why the barrel import is avoided.
import BedDouble from "lucide-react-native/icons/bed-double";
import ExternalLink from "lucide-react-native/icons/external-link";

import { hotelSearchUrl } from "../config/monetization";

/**
 * その都市周辺の宿を楽天トラベルで探すためのリンク。
 *
 * 「PR」表記について：2023年10月の景品表示法改正（いわゆるステマ規制）により、
 * アフィリエイトリンクなど広告に当たるものは、広告だと分かる表示が必要です。
 * 消す場合は法令上の問題が出るため、外さないでください。
 *
 * ミッションの邪魔にならないよう、罫線1本ぶんの控えめな見た目にしています。
 */
export default function HotelAffiliateLink({ cityName }) {
  const [opening, setOpening] = useState(false);

  const open = async () => {
    if (opening) return;
    setOpening(true);
    const url = hotelSearchUrl(cityName);
    try {
      // 端末の既定ブラウザで開きます（アプリ内WebViewではなく外部ブラウザ）。
      // 楽天側のログイン状態やクッキーをそのまま使えるほうが、
      // 予約導線としても成果計測としても確実なためです。
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert("リンクを開けませんでした", String(e?.message ?? e));
    } finally {
      setOpening(false);
    }
  };

  return (
    <TouchableOpacity style={styles.row} onPress={open} disabled={opening} activeOpacity={0.6}>
      <BedDouble size={14} color="#5C544A" />
      <Text style={styles.label} numberOfLines={1}>
        {cityName}周辺の宿を探す
      </Text>
      <View style={styles.prBadge}>
        <Text style={styles.prText}>PR</Text>
      </View>
      <ExternalLink size={12} color="#9A9186" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 9,
    minHeight: 44,
    paddingHorizontal: 2,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(43,38,33,0.10)",
  },
  label: { flex: 1, fontSize: 12.5, color: "#5C544A" },
  prBadge: {
    borderWidth: 1,
    borderColor: "rgba(43,38,33,0.22)",
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  prText: { fontSize: 9, color: "#9A9186", fontWeight: "700" },
});
