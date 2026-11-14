// withAbiSplits (NOOR 0.0.4): produce one APK per CPU architecture plus a
// universal fallback from a single Gradle build.
//
// Why: the 0.0.3 universal APK carried native libraries for four ABIs
// (arm64-v8a 67.5 MB, armeabi-v7a 40.4 MB, x86_64 66.4 MB, x86 68.1 MB —
// 242 MB of the 332 MB file). A 332 MB sideload download routinely gets
// truncated on mobile networks, and a truncated APK is exactly what Android
// reports as "There's a problem with the app file." Per-architecture APKs
// roughly halve the download (the arm64-v8a build is for devices like the
// Samsung Galaxy A15) without removing any offline content.
const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withAbiSplits(config) {
  return withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.contents.includes('noor-abi-splits')) return cfg;
    cfg.modResults.contents += `
// noor-abi-splits: per-architecture APKs + universal fallback (NOOR 0.0.4)
android {
    splits {
        abi {
            enable true
            reset()
            include "arm64-v8a", "armeabi-v7a", "x86_64", "x86"
            universalApk true
        }
    }
}
`;
    return cfg;
  });
};
