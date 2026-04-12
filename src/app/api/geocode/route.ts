import { NextRequest, NextResponse } from 'next/server'

export interface GeoResult {
  lat: number
  lng: number
  label: string
  city: string
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json([])

  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'behuddle/1.0 (contact@behuddle.com)',
        'Accept-Language': 'en',
      },
      next: { revalidate: 86400 },
    })
    if (!res.ok) return NextResponse.json([])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any[] = await res.json()

    const results: GeoResult[] = data.map((item) => {
      const addr = item.address ?? {}
      // Build a short human label: "City, Country"
      const city =
        addr.city ?? addr.town ?? addr.village ?? addr.county ?? addr.state ?? item.display_name.split(',')[0]
      const country = addr.country ?? ''
      const label = country ? `${city}, ${country}` : city

      return {
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        label,
        city,
      }
    })

    // Deduplicate by label
    const seen = new Set<string>()
    const unique = results.filter((r) => {
      if (seen.has(r.label)) return false
      seen.add(r.label)
      return true
    })

    return NextResponse.json(unique)
  } catch {
    return NextResponse.json([])
  }
}
