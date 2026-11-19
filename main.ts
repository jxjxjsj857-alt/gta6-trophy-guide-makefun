// Leonida Legends — entry program for the GTA 6 trophy guide bounty.
// What it does, in plain terms: it gathers the finished guide (app/) and the
// screenshots (screenshots/) from this repository and hands them in as one
// output folder, plus a dossier.json the judge reads. The dossier is built by
// the vendored make.fun library, vendor/makefun-frontend.ts, which must stay
// exactly as the kit shipped it — the scorer rebuilds the dossier itself and
// compares the two byte for byte.
//
// Run it outside the grader like this:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Inside the grader, MAKEFUN_OUTPUT_DIR is unset and /output is used instead.
// The program only uses the Node 22 standard library, and it writes the same
// bytes every time it runs, so the grader's two runs agree.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The repository root is the folder this file sits in.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));

// Where the finished entry goes: the grader's /output, or the caller's folder.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The caps the scorer enforces, so the program refuses an entry the scorer
// would refuse instead of handing in something broken.
const dossierOptions = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

function handInEntry() {
  // Refuse to hand in a guide with no front page, rather than copy a
  // broken app/ and let the scorer be the one to notice.
  if (!existsSync(join(repoRoot, 'app', 'index.html'))) {
    throw new Error('app/index.html is missing — nothing to hand in');
  }
  mkdirSync(outputDir, { recursive: true });

  // Start clean, so a stale file from an earlier run can never leak in.
  const appOut = join(outputDir, 'app');
  const shotsOut = join(outputDir, 'screenshots');
  rmSync(appOut, { recursive: true, force: true });
  rmSync(shotsOut, { recursive: true, force: true });

  // Copy the whole guide, exactly as it is in the repository.
  cpSync(join(repoRoot, 'app'), appOut, { recursive: true });

  // Copy the screenshots, if there are any.
  mkdirSync(shotsOut, { recursive: true });
  const shotsIn = join(repoRoot, 'screenshots');
  if (existsSync(shotsIn)) {
    cpSync(shotsIn, shotsOut, { recursive: true });
  }

  // Write the dossier the judge reads, built from what was just copied.
  const dossier = buildDossier(outputDir, dossierOptions);
  const dossierPath = join(outputDir, 'dossier.json');
  writeFileSync(dossierPath, dossier);
  console.log(`Handed in Leonida Legends to ${outputDir} (dossier.json, ${dossier.length} bytes).`);
}

handInEntry();
