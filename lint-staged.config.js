import mm from 'micromatch'

/**
 * @typedef {{string|string[]|Promise<string|string[]>}} Commands
 * @typedef {(filenames: string[]) => Commands} Task
 */

const commands = {
  prettier: 'prettier --cache --ignore-unknown --write .',
  eslint: 'eslint --cache --fix .',
  wrangler: 'wrangler publish --dry-run',
  vitest: 'vitest run',
  tsc: 'tsc -p tsconfig.json --noEmit',
}

/**
 * @param {string[]} filenames
 * @param {string[]} patterns
 * @param {import('micromatch').Options} options
 * @returns {boolean}
 */
function matchSome(
  filenames,
  patterns,
  options = { dot: true, basename: true },
) {
  return mm.some(filenames, patterns, options)
}

/** @type {Record<string, Task>} */
const tasks = {
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

/** @type {Record<string, Task>} */
const config = {
  '{eslint.config.*,.eslintrc.*,*.{js,mjs,cjs,jsx,ts,tsx}}': tasks.eslint,
  '{vitest.config.ts,{src,test}/**/*}': tasks.vitest,
  '{tsconfig*.json,*.ts?(x)}': tasks.tsc,
  'wrangler.toml': tasks.wrangler,
  '*': tasks.prettier,
}

export default config
