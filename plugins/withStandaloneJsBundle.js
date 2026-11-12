// Force the JS bundle and Metro assets to be embedded in ALL variants,
// including debug.
//
// By default the React Native Gradle plugin lists 'debug' in
// `debuggableVariants`, which SKIPS bundling of the JS bundle and assets for
// that variant — the debug APK then contains no JavaScript at all and can only
// run against a Metro dev server. Sideloaded onto a device it sits on the
// native splash screen forever. Setting `debuggableVariants = []` makes every
// assembled APK self-contained.
const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withStandaloneJsBundle(config) {
  return withAppBuildGradle(config, (cfg) => {
    let src = cfg.modResults.contents;
    const anchor = '// debuggableVariants = ["liteDebug", "prodDebug"]';
    const fallback = 'bundleCommand = "export:embed"';
    if (src.includes(anchor)) {
      src = src.replace(anchor, 'debuggableVariants = [] // embedded JS bundle: standalone APK');
    } else if (src.includes(fallback)) {
      src = src.replace(fallback, fallback + '\n    debuggableVariants = [] // embedded JS bundle: standalone APK');
    } else {
      throw new Error('withStandaloneJsBundle: no anchor found in android/app/build.gradle');
    }
    cfg.modResults.contents = src;
    return cfg;
  });
};
