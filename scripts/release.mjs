import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const dryRun = process.argv.includes('--dry-run');
const run = (command, args) => execFileSync(command, args, { encoding: 'utf8' }).trim();
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const tag = `v${version}`;

if (run('git', ['status', '--porcelain'])) throw new Error('Commit pending changes before creating a release.');
if (run('git', ['branch', '--show-current']) !== 'main') throw new Error('Create releases from main.');
const head = run('git', ['rev-parse', 'HEAD']);
const remoteHead = run('git', ['ls-remote', 'origin', 'refs/heads/main']).split(/\s/)[0];
if (head !== remoteHead) throw new Error('Push main before creating a release.');
const hasTag = Boolean(run('git', ['tag', '--list', tag]));
if (hasTag && run('git', ['rev-list', '-n', '1', tag]) !== head) {
  throw new Error(`${tag} points to another commit. Bump the version before releasing changed code.`);
}

function perform(command, args) {
  if (dryRun) console.log([command, ...args].join(' '));
  else execFileSync(command, args, { stdio: 'inherit' });
}

// The initial version has no bump tag yet. Subsequent versions reuse npm version's tag.
if (!hasTag) perform('git', ['tag', '-a', tag, '-m', tag]);
perform('git', ['push', 'origin', `refs/tags/${tag}`]);
perform('gh', ['release', 'create', tag, '--verify-tag', '--title', tag, '--generate-notes']);
