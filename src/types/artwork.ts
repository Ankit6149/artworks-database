export interface Artwork {
  id: number
  title: string | null
  place_of_origin: string | null
  artist_display: string | null
  inscriptions: string | null
  date_start: number | null
  date_end: number | null
}

export interface ArtworksPagination {
  total: number
  limit: number
  currentPage: number
  totalPages: number
}

export interface ArtworksPage {
  data: Artwork[]
  pagination: ArtworksPagination
}
