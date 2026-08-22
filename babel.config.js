module.exports = function (api) {
  api.cache(true);
  return {
    // babel-preset-expo auto-detects react-native-reanimated and injects its
    // (now react-native-worklets-backed) plugin — adding it again here double
    // -applies the worklets transform and breaks worklet init at runtime.
    presets: ["babel-preset-expo"],
  };
};
