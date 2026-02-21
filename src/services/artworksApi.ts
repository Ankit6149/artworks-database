import type { Artwork, ArtworksPage } from '../types/artwork'

interface ArticArtworkRecord {
  id: number
  title: string | null
  place_of_origin: string | null
  artist_display: string | null
  inscriptions: string | null
  date_start: number | null
  date_end: number | null
}

interface ArticPagination {
  total: number
  limit: number
  current_page: number
  total_pages: number
}

interface ArticApiResponse {
  data: ArticArtworkRecord[]
  pagination: ArticPagination
}

const BASE_URL = 'https://api.artic.edu/api/v1/artworks'

const normalizeArtwork = (record: ArticArtworkRecord): Artwork => ({
  id: record.id,
  title: record.title,
  place_of_origin: record.place_of_origin,
  artist_display: record.artist_display,
  inscriptions: record.inscriptions,
  date_start: record.date_start,
  date_end: record.date_end,
})

export const fetchArtworksPage = async (page: number): Promise<ArtworksPage> => {
  const response = await fetch(`${BASE_URL}?page=${page}`)

  if (!response.ok) {
    throw new Error(`Failed to load artworks page ${page}`)
  }

  const payload = (await response.json()) as ArticApiResponse

  return {
    data: payload.data.map(normalizeArtwork),
    pagination: {
      total: payload.pagination.total,
      limit: payload.pagination.limit,
      currentPage: payload.pagination.current_page,
      totalPages: payload.pagination.total_pages,
    },
  }
}
