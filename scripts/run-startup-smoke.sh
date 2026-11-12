#!/usr/bin/env bash
# Compiles the real startup modules (src/lib/store.ts, src/lib/startup.ts) and
# runs scripts/startup-smoke.test.cjs against them with stubbed AsyncStorage.
set -euo pipefail
cd "$(dirname "$0")/.."

SMOKE=.smoke
rm -rf "$SMOKE/lib" "$SMOKE/types.js" "$SMOKE/node_modules"
mkdir -p "$SMOKE/node_modules/react" "$SMOKE/node_modules/@react-native-async-storage/async-storage"

cat > "$SMOKE/node_modules/react/index.js" << 'EOF'
exports.useSyncExternalStore = function () { throw new Error('hooks not available in smoke test'); };
EOF
echo '{"name":"react","version":"0.0.0","main":"index.js"}' > "$SMOKE/node_modules/react/package.json"

cat > "$SMOKE/node_modules/@react-native-async-storage/async-storage/index.js" << 'EOF'
const store = {
  async getItem(key) {
    const b = globalThis.__AS_BEHAVIOR__ || 'ok';
    if (b === 'reject') throw new Error('storage offline');
    if (b === 'hang') return new Promise(() => {});
    return (globalThis.__AS_DATA__ || {})[key] ?? null;
  },
  async setItem() {},
};
module.exports = store;
module.exports.default = store;
EOF
echo '{"name":"@react-native-async-storage/async-storage","version":"0.0.0","main":"index.js"}' \
  > "$SMOKE/node_modules/@react-native-async-storage/async-storage/package.json"

npx tsc src/lib/startup.ts --ignoreConfig --module commonjs --target es2020 \
  --moduleResolution node10 --ignoreDeprecations 6.0 --esModuleInterop --skipLibCheck --outDir "$SMOKE"

node scripts/startup-smoke.test.cjs
