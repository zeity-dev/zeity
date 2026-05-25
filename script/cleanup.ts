#!/usr/bin/env node

import process from 'node:process';
import { execSync } from 'node:child_process';

async function main() {
  execSync('rm -rf node_modules');
  execSync('rm -rf **/*/node_modules');
  execSync('rm -rf **/*/dist');
  execSync('rm -rf **/*/.nuxt');
  execSync('rm -rf **/*/.output');
  execSync('rm -rf **/*/.data');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
