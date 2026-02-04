#!/usr/bin/env node

import process from 'node:process';
import { execSync } from 'node:child_process';
import { promises as fsp } from 'node:fs';
import { resolve } from 'node:path';

export async function loadPackage(dir: string) {
  const pkgPath = resolve(dir, 'package.json');
  const data = JSON.parse(
    await fsp.readFile(pkgPath, 'utf-8').catch(() => '{}'),
  );
  const save = () =>
    fsp.writeFile(pkgPath, JSON.stringify(data, null, 2) + '\n');

  return {
    dir,
    data,
    save,
  };
}

export async function loadWorkspace(dir: string) {
  const workspacePkg = await loadPackage(dir);

  const setVersion = (newVersion: string) => {
    workspacePkg.data.version = newVersion;
  };

  const save = () => workspacePkg.save();

  return {
    dir,
    workspacePkg,
    setVersion,
    save,
  };
}

async function main() {
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
    encoding: 'utf-8',
  }).trim();

  if (currentBranch !== 'main') {
    throw new Error('You can only bump version on main branch!');
  }

  const workspace = await loadWorkspace(process.cwd());

  const newVersion = process.argv[2];
  if (!newVersion) {
    throw new Error('Please provide version!');
  }

  workspace.setVersion(newVersion!);

  await workspace.save();

  execSync(`git add ${resolve(workspace.dir, 'package.json')}`);
  execSync(`git commit -m "chore: bump version to ${newVersion}"`);
  execSync(`git tag v${newVersion} -m "v${newVersion}"`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
