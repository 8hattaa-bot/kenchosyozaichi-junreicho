// react-native-google-mobile-ads has no web implementation. Metro picks this
// file over AdBanner.native.js when bundling for web, which keeps the native
// ads package out of the web bundle entirely — without this split,
// `expo start --web` fails to bundle at all.
export default function AdBanner() {
  return null;
}
