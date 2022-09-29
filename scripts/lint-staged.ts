#!/usr/bin/env ts-node

import lintStaged from 'lint-staged'
import mm from 'micromatch'

type Commands = string | string[] | Promise<string | string[]>
type Task = (filenames: string[]) => Commands

function matchSome(
  filenames: string[],
  patterns: string[],
  options: mm.Options = { dot: true, basename: true },
): boolean {
  return mm.some(filenames, patterns, options)
}

const commands = {
  prettier: 'prettier --cache --ignore-unknown --write .',
  eslint: 'eslint --cache --fix .',
  wrangler: 'wrangler publish --dry-run',
  vitest: 'vitest run',
  tsc: 'tsc -p tsconfig.json --noEmit',
}

const tasks: Record<string, Task> = {
  prettier: (files) => {
    if (matchSome(files, ['.prettierrc*', 'prettier.config.*'])) {
      return commands.prettier
    } else {
      return `prettier --cache --ignore-unknown --write ${files.join(' ')}`
    }
  },
  eslint: (files) => {
    if (matchSome(files, ['.eslintrc*', 'eslint.config.*'])) {
      return commands.eslint
    } else {
      return `eslint --cache --fix ${files.join(' ')}`
    }
  },
  wrangler: () => commands.wrangler,
  vitest: () => commands.vitest,
  tsc: () => commands.tsc,
}

const config: Record<string, Task> = {
  '{eslint.config.*,.eslintrc.*,*.{js,mjs,cjs,jsx,ts,tsx}}': tasks.eslint,
  '{vitest.config.ts,{src,test}/**/*}': tasks.vitest,
  '{tsconfig*.json,*.ts?(x)}': tasks.tsc,
  'wrangler.toml': tasks.wrangler,
  '*': tasks.prettier,
}

try {
  const result: boolean = lintStaged({
    config: config,
  })
  if (!result) {
    console.error('Linting failed')
  }
} catch (error) {
  console.error(error)
}
