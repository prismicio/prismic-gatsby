export namespace APIResponse {
  export interface Repository {
    refs: Ref[]
    bookmarks: { [key: string]: string }
    languages: Language[]
    types: { [key: string]: string }
    tags: string[]
    // forms: { [key: string]: Form };
    experiments: unknown
    oauth_initiate: string
    oauth_token: string
    version: string
    licence: string
  }

  export interface Search {
    page: number
    results_per_page: number
    results_size: number
    total_results_size: number
    total_pages: number
    next_page: string
    prev_page: string
    results: Document[]
  }
}

export interface Ref {
  ref: string
  label: string
  isMasterRef: boolean
  scheduledAt: string
  id: string
}

export interface Language {
  id: string
  name: string
}

export interface Document<Data = unknown> {
  id: string
  uid?: string
  url?: string
  type: string
  href: string
  tags: string[]
  slugs: string[]
  lang?: string
  alternate_languages: AlternateLanguage[]
  first_publication_date: string | null
  last_publication_date: string | null
  data: Data
}

export interface AlternateLanguage {
  id: string
  uid?: string
  type: string
  lang: string
}
