#!/usr/bin/env node

import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const FEATURES_DIR = 'src/features';

const features = readdirSync(FEATURES_DIR).filter((name) =>
  statSync(join(FEATURES_DIR, name)).isDirectory(),
);

const missing = features.filter(
  (feature) => !existsSync(join(FEATURES_DIR, feature, 'index.ts')),
);

if (missing.length > 0) {
  console.error('Features missing public barrel (index.ts):');
  for (const m of missing) {
    console.error(`  - ${FEATURES_DIR}/${m}/`);
  }
  console.error(
    '\nEvery feature must expose its public surface via index.ts — see docs/architecture.md §2.',
  );
  process.exit(1);
}

console.log(`✓ All ${features.length} features have an index.ts barrel`);
