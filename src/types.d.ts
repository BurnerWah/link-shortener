interface Bindings {
  USERNAME: string
  PASSWORD: string
  LINKS: KVNamespace
}

interface Env {
  Bindings: Bindings
}

interface Link {
  name?: string
  url: string
}
