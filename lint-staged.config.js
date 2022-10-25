import mm from 'micromatch'
import { constants as fsConstants } from 'node:fs'
import { access } from 'node:fs/promises'
import path from 'node:path'

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
  devskim: [
    'devskim',
    'analyze',
    '--ignore-globs',
    '**/.git/**,**/bin/**,**/node_modules/**,**/test/**',
    '.',
  ],
  njsscan: ['njsscan'],
  taplo: ['taplo', 'format'],
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

/**
 *
 * @param {import('node:fs').PathLike} p
 * @param {number} mode
 * @returns {Promise<boolean>}
 */
async function tryAccess(p, mode = fsConstants.F_OK) {
  try {
    await access(p, mode)
    return true
  } catch {
    return false
  }
}

/**
 * @param {string} command
 * @returns {Promise<boolean>}
 */
async function hasCommand(command) {
  const PATH = process.env.PATH.split(':')
  const bins = PATH.map((dir) => path.join(dir, command))
  const exists = await Promise.all(
    bins.map((bin) => tryAccess(bin, fsConstants.X_OK)),
  )
  return exists.some(Boolean)
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
  devskim: async () => {
    if (await hasCommand(commands.devskim[0])) {
      return commands.devskim.join(' ')
    } else {
      return 'true'
    }
  },
  njsscan: async (files) => {
    if (await hasCommand(commands.njsscan[0])) {
      return [...commands.njsscan, ...files].join(' ')
    } else {
      return 'true'
    }
  },
  taplo: async (files) => {
    if (await hasCommand(commands.taplo[0])) {
      return [...commands.taplo, ...files].join(' ')
    } else {
      return 'true'
    }
  },
}

const filetypes = {
  js: ['js', 'cjs', 'mjs', 'jsx'],
  ts: ['ts', 'tsx'],
  json: ['json', 'jsonc'],
  md: ['md', 'mdx'],
  yaml: ['yaml', 'yml'],
  toml: ['toml'],
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
  '*!(.spec.ts)': tasks.devskim,
  '*.toml': tasks.taplo,
  [`src/**/${fts('js', 'ts')}`]: tasks.njsscan,
  [glob('vitest.config.ts', '{src,test}/**/*')]: tasks.vitest,
  [glob('eslint.config.*', '.eslintrc.*', fts('js', 'ts'))]: tasks.eslint,
  '*': tasks.prettier,
}

export default config
