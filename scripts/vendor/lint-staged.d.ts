declare module 'lint-staged' {
  type Commands = string | string[] | Promise<string | string[]>
  type Task = (filenames: string[]) => Commands

  interface Init {
    allowEmpty?: boolean
    concurrent?: boolean
    configPath?: string
    cwd?: string
    debug?: boolean
    maxArgLength?: number
    quiet?: boolean
    relative?: boolean
    shell?: boolean
    stash?: boolean
    verbose?: boolean
    config?: Record<string, Task>
  }

  const lintStaged: (init: Init) => boolean
  export default lintStaged
}
