import mm from 'micromatch'

/**
 * @typedef {{string|string[]}} Commands
 * @typedef {(filenames: string[]) => Commands} Task
 */

const commands = {
  prettier: ['prettier', '--cache', '--ignore-unknown', '--write'],
  eslint: ['eslint', '--cache', '--fix'],
  wrangler: ['wrangler', 'publish', '--dry-run'],
  vitest: ['vitest', 'run'],
  tsc: ['tsc', '-p', 'tsconfig.json', '--noEmit'],
  esbuild: [
    'esbuild',
    '--bundle',
    '--outfile=/dev/null',
    '--tsconfig=tsconfig.json',
    'src/index.ts',
  ],
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

/**
 * @param  {...Task} tasks
 * @returns {Task}
 */
function combine(...tasks) {
  return async (filenames) => {
    return await Promise.all(tasks.map((task) => task(filenames)))
  }
}

/** @type {Record<string, Task>} */
const tasks = {
  prettier: async (files) => {
    if (matchSome(files, ['.prettierrc*', 'prettier.config.*'])) {
      return [...commands.prettier, '.'].join(' ')
    } else {
      return [...commands.prettier, ...files].join(' ')
    }
  },
  eslint: async (files) => {
    if (matchSome(files, ['.eslintrc*', 'eslint.config.*'])) {
      return [...commands.eslint, '.'].join(' ')
    } else {
      return [...commands.eslint, ...files].join(' ')
    }
  },
  wrangler: () => commands.wrangler.join(' '),
  vitest: () => commands.vitest.join(' '),
  tsc: () => commands.tsc.join(' '),
  esbuild: () => commands.esbuild.join(' '),
}

const filetypes = {
  js: ['js', 'cjs', 'mjs', 'jsx'],
  ts: ['ts', 'tsx'],
  json: ['json', 'jsonc'],
  md: ['md', 'mdx'],
  yaml: ['yaml', 'yml'],
}

/**
 * @param  {...string} types
 * @returns {string}
 */
function fts(...types) {
  const exts = types.flatMap((type) => filetypes[type])
  return `*.{${exts.join()}}`
}

/**
 * @param  {...string} patterns
 * @returns {string}
 */
function glob(...patterns) {
  return `{${patterns.join()}}`
}

/** @type {Record<string, Task>} */
const config = {
  'src/**/*': tasks.esbuild,
  'tsconfig.json': tasks.tsc,
  'wrangler.toml': combine(tasks.esbuild, tasks.wrangler),
  [glob('vitest.config.ts', '{src,test}/**/*')]: tasks.vitest,
  [glob('eslint.config.*', '.eslintrc.*', fts('js', 'ts'))]: tasks.eslint,
  '*': tasks.prettier,
}

export default config
