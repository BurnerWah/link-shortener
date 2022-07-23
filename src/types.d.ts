export interface Bindings {
  USERNAME: string
  PASSWORD: string
  LINKS: KVNamespace
}

export interface Link {
  name?: string
  url: string
}
