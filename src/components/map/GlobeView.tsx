'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/clients';
import type { MapUser } from '@/lib/supabase/types';
import { roleLabel } from '@/lib/utils/roles';

// ── Remote GeoJSON ─────────────────────────────────────────────────────────────
const STATES_URL =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_1_states_provinces.geojson';

// ── City data ──────────────────────────────────────────────────────────────────
interface CityDef { name: string; lat: number; lng: number }

const CITIES: CityDef[] = [
  { name: 'New York',      lat: 40.71,  lng: -74.01  },
  { name: 'London',        lat: 51.51,  lng: -0.13   },
  { name: 'Berlin',        lat: 52.52,  lng: 13.40   },
  { name: 'Paris',         lat: 48.86,  lng: 2.35    },
  { name: 'Dubai',         lat: 25.20,  lng: 55.27   },
  { name: 'Mumbai',        lat: 19.08,  lng: 72.88   },
  { name: 'Singapore',     lat: 1.35,   lng: 103.82  },
  { name: 'Tokyo',         lat: 35.69,  lng: 139.69  },
  { name: 'Seoul',         lat: 37.57,  lng: 126.98  },
  { name: 'Sydney',        lat: -33.87, lng: 151.21  },
  { name: 'São Paulo',     lat: -23.55, lng: -46.63  },
  { name: 'Mexico City',   lat: 19.43,  lng: -99.13  },
  { name: 'Toronto',       lat: 43.65,  lng: -79.38  },
  { name: 'Cairo',         lat: 30.04,  lng: 31.24   },
  { name: 'Lagos',         lat: 6.52,   lng: 3.38    },
  { name: 'Nairobi',       lat: -1.29,  lng: 36.82   },
  { name: 'Moscow',        lat: 55.75,  lng: 37.62   },
  { name: 'Cape Town',     lat: -33.93, lng: 18.42   },
  { name: 'Buenos Aires',  lat: -34.60, lng: -58.38  },
  { name: 'Jakarta',       lat: -6.21,  lng: 106.85  },
];

// ── Types ──────────────────────────────────────────────────────────────────────

interface PathItem {
  points: [number, number][]; // [lat, lng]
}

/**
 * Single discriminated type for the entire HTML layer:
 * ocean labels | country labels | city labels | user markers/clusters
 */
interface GlobePoint {
  lat: number; lng: number;
  isCluster: boolean;
  itemType?: 'ocean' | 'country' | 'city' | 'marker';
  // ocean
  oceanName?:   string;
  // country name
  countryName?: string;
  pop_est?:     number;
  // city
  cityName?:    string;
  // user marker
  user?:        MapUser;
  count?:       number;
  users?:       MapUser[];
  elRef?:       HTMLElement;
}

interface GlobeControls {
  autoRotate:       boolean;
  autoRotateSpeed:  number;
  addEventListener: (event: string, fn: () => void) => void;
}

// ── GlobeInstance interface ────────────────────────────────────────────────────
interface GlobeInstance {
  width:              (w: number) => GlobeInstance;
  height:             (h: number) => GlobeInstance;
  globeImageUrl:      (url: string) => GlobeInstance;
  backgroundImageUrl: (url: string) => GlobeInstance;
  backgroundColor:    (color: string) => GlobeInstance;
  showAtmosphere:     (show: boolean) => GlobeInstance;
  atmosphereColor:    (color: string) => GlobeInstance;
  atmosphereAltitude: (alt: number) => GlobeInstance;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pointOfView: (pov?: { lat: number; lng: number; altitude: number }, ms?: number) => any;
  controls: () => GlobeControls;
  _destructor?: () => void;
  // Country fill polygons
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  polygonsData:          (data: any[]) => GlobeInstance;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  polygonGeoJsonGeometry:(fn: (d: any) => any) => GlobeInstance;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  polygonCapColor:       (fn: (d: any) => string) => GlobeInstance;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  polygonSideColor:      (fn: (d: any) => string) => GlobeInstance;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  polygonStrokeColor:    (fn: (d: any) => string | boolean) => GlobeInstance;
  polygonAltitude:       (val: number) => GlobeInstance;
  // State/province border paths
  pathsData:          (data: PathItem[]) => GlobeInstance;
  pathPoints:         (fn: (d: PathItem) => [number, number][]) => GlobeInstance;
  pathPointLat:       (fn: (pt: [number, number]) => number) => GlobeInstance;
  pathPointLng:       (fn: (pt: [number, number]) => number) => GlobeInstance;
  pathPointAlt:       (val: number) => GlobeInstance;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pathColor:          (fn: (d: any) => string) => GlobeInstance;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pathStroke:         (val: any) => GlobeInstance;
  pathTransitionDuration: (val: number) => GlobeInstance;
  // HTML layer — ALL text labels + user markers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  htmlElementsData: (data?: GlobePoint[]) => any;
  htmlLat:          (fn: (d: GlobePoint) => number) => GlobeInstance;
  htmlLng:          (fn: (d: GlobePoint) => number) => GlobeInstance;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  htmlAltitude:     (fn: (d: any) => number) => GlobeInstance;
  htmlElement:      (fn: (d: GlobePoint) => HTMLElement) => GlobeInstance;
}

// ── Static HTML-layer items (ocean + city) ─────────────────────────────────────

const OCEAN_GLOBE_POINTS: GlobePoint[] = [
  { lat: 5,   lng: -25,   oceanName: 'ATLANTIC OCEAN', isCluster: false, itemType: 'ocean' },
  { lat: -20, lng: 75,    oceanName: 'INDIAN OCEAN',   isCluster: false, itemType: 'ocean' },
  { lat: 8,   lng: -148,  oceanName: 'PACIFIC OCEAN',  isCluster: false, itemType: 'ocean' },
  { lat: -58, lng: 10,    oceanName: 'SOUTHERN OCEAN', isCluster: false, itemType: 'ocean' },
  { lat: 83,  lng: 0,     oceanName: 'ARCTIC OCEAN',   isCluster: false, itemType: 'ocean' },
];

const CITY_GLOBE_POINTS: GlobePoint[] = CITIES.map((c) => ({
  lat: c.lat, lng: c.lng, isCluster: false, itemType: 'city' as const, cityName: c.name,
}));

// ── Helpers ────────────────────────────────────────────────────────────────────

function roleColor(role: string | null): string {
  return role === 'builder' ? '#1D9E75' : '#378ADD';
}

function statusColor(status: string): string {
  if (status === 'open') return '#10B981';
  if (status === 'busy' || status === 'looking_for_designer') return '#F59E0B';
  return '#9CA3AF';
}

function initials(name: string | null): string {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function computeCentroid(geometry: any): { lat: number; lng: number } | null {
  let ring: number[][] | null = null;
  if (geometry.type === 'Polygon') {
    ring = geometry.coordinates[0];
  } else if (geometry.type === 'MultiPolygon') {
    for (const poly of geometry.coordinates) {
      if (!ring || poly[0].length > ring.length) ring = poly[0];
    }
  }
  if (!ring || ring.length === 0) return null;
  let lngSum = 0, latSum = 0;
  for (const [lo, la] of ring) { lngSum += lo; latSum += la; }
  return { lat: latSum / ring.length, lng: lngSum / ring.length };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getCountryName(props: any): string {
  return props?.ADMIN ?? props?.admin ?? props?.NAME ?? props?.name ?? '';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractRings(geometry: any): [number, number][][] {
  const rings: [number, number][][] = [];
  if (geometry.type === 'Polygon') {
    for (const ring of geometry.coordinates)
      rings.push(ring.map(([lo, la]: [number, number]) => [la, lo] as [number, number]));
  } else if (geometry.type === 'MultiPolygon') {
    for (const poly of geometry.coordinates)
      for (const ring of poly)
        rings.push(ring.map(([lo, la]: [number, number]) => [la, lo] as [number, number]));
  }
  return rings;
}

function clusterUsers(users: MapUser[], radius = 8): GlobePoint[] {
  const visited = new Set<string>();
  const points: GlobePoint[] = [];
  for (const user of users) {
    if (!user.lat || !user.lng || visited.has(user.id)) continue;
    const nearby = users.filter((u) => {
      if (!u.lat || !u.lng || visited.has(u.id)) return false;
      return (
        Math.abs((user.lat ?? 0) - (u.lat ?? 0)) <= radius &&
        Math.abs((user.lng ?? 0) - (u.lng ?? 0)) <= radius
      );
    });
    nearby.forEach((u) => visited.add(u.id));
    if (nearby.length === 1) {
      points.push({ lat: user.lat, lng: user.lng, user, isCluster: false, itemType: 'marker' });
    } else {
      const avgLat = nearby.reduce((s, u) => s + (u.lat ?? 0), 0) / nearby.length;
      const avgLng = nearby.reduce((s, u) => s + (u.lng ?? 0), 0) / nearby.length;
      points.push({ lat: avgLat, lng: avgLng, count: nearby.length, isCluster: true, itemType: 'marker', users: nearby });
    }
  }
  return points;
}

// ── HTML element factories ─────────────────────────────────────────────────────

/** Ocean label — italic, letter-spaced, cartographic style */
function makeOceanLabelEl(name: string): HTMLElement {
  const el = document.createElement('div');
  Object.assign(el.style, {
    fontFamily: "'DM Sans', Georgia, serif",
    fontSize: '12px', fontWeight: '300', fontStyle: 'italic',
    letterSpacing: '0.25em', textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.15)',
    whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none',
    transition: 'opacity 0.3s ease',
  });
  el.textContent = name;
  return el;
}

/**
 * Country name label — flat HTML, styled like a real dark-map label.
 */
function makeCountryLabelEl(name: string): HTMLElement {
  const el = document.createElement('div');
  Object.assign(el.style, {
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    fontSize: '10.5px', fontWeight: '600',
    letterSpacing: '0.12em', textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.6)',
    textShadow: '0 1px 4px rgba(0,0,0,0.8)',
    whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none',
    transition: 'opacity 0.3s ease',
  });
  el.textContent = name;
  return el;
}

/** City label — small dot + tiny uppercase text */
function makeCityLabelEl(name: string): HTMLElement {
  const wrap = document.createElement('div');
  Object.assign(wrap.style, {
    display: 'flex', alignItems: 'center', gap: '5px',
    pointerEvents: 'none', userSelect: 'none',
    transition: 'opacity 0.3s ease',
  });
  const dot = document.createElement('div');
  Object.assign(dot.style, {
    width: '4px', height: '4px', flexShrink: '0', borderRadius: '50%',
    background: 'rgba(255,255,255,0.85)',
    boxShadow: '0 0 8px rgba(255,255,255,0.5)',
  });
  const text = document.createElement('span');
  Object.assign(text.style, {
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    fontSize: '9.5px', fontWeight: '500', letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)',
    textShadow: '0 1px 3px rgba(0,0,0,0.9)',
    whiteSpace: 'nowrap',
  });
  text.textContent = name;
  wrap.appendChild(dot);
  wrap.appendChild(text);
  return wrap;
}

/** User cluster / avatar marker */
function makeMarkerEl(point: GlobePoint): HTMLElement {
  const el = document.createElement('div');
  if (point.isCluster) {
    Object.assign(el.style, {
      width: '34px', height: '34px',
      background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)',
      borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontSize: '11px', fontWeight: '700', fontFamily: 'sans-serif',
      cursor: 'pointer', pointerEvents: 'all', userSelect: 'none',
      boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
    });
    el.textContent = `+${point.count}`;
  } else {
    const user = point.user!;
    if (user.avatar_url) {
      Object.assign(el.style, {
        width: '32px', height: '32px', borderRadius: '50%',
        backgroundImage: `url(${user.avatar_url})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        border: '2px solid rgba(255,255,255,0.8)',
        cursor: 'pointer', pointerEvents: 'all',
        boxShadow: '0 2px 10px rgba(0,0,0,0.6)',
      });
    } else {
      Object.assign(el.style, {
        width: '28px', height: '28px',
        background: roleColor(user.role), borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontSize: '10px', fontWeight: '700', fontFamily: 'sans-serif',
        cursor: 'pointer', pointerEvents: 'all', userSelect: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
      });
      el.textContent = initials(user.full_name);
    }
  }
  return el;
}

/** Route to the correct factory based on itemType */
function makeHtmlEl(point: GlobePoint): HTMLElement {
  if (point.itemType === 'ocean'   && point.oceanName)   return makeOceanLabelEl(point.oceanName);
  if (point.itemType === 'country' && point.countryName) return makeCountryLabelEl(point.countryName);
  if (point.itemType === 'city'    && point.cityName)    return makeCityLabelEl(point.cityName);
  return makeMarkerEl(point);
}

/** htmlAltitude — keeps HTML elements above the polygon surface at all zoom levels */
function htmlAlt(d: GlobePoint): number {
  if (d.itemType === 'ocean')   return 0.02;
  if (d.itemType === 'country') return 0.025;
  if (d.itemType === 'city')    return 0.018;
  return 0.03; // markers — above everything
}

// ── Full profile (fetched on tooltip open) ─────────────────────────────────────
interface FullProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  bio: string | null;
  location: string | null;
  status: string;
  availability_hours: number | null;
  is_verified: boolean;
  profile_skills: { skills: { name: string } | null }[];
}

// ── Tooltip ────────────────────────────────────────────────────────────────────
function UserTooltip({
  user, position, containerRef, onClose,
}: {
  user: MapUser;
  position: { x: number; y: number };
  containerRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<FullProfile | null>(null);

  useEffect(() => {
    setProfile(null);
    createClient()
      .from('profiles')
      .select('id, full_name, avatar_url, role, bio, location, status, availability_hours, is_verified, profile_skills(skills(name))')
      .eq('id', user.id)
      .single()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }) => { if (data) setProfile(data as any); });
  }, [user.id]);

  const W   = 280;
  const GAP = 18; // gap between icon and card edge
  const cw  = containerRef.current?.clientWidth  ?? 800;
  const ch  = containerRef.current?.clientHeight ?? 600;

  // Compute position ONCE (memo keyed on position, not profile) so card doesn't jump on load
  const [pos] = useState(() => {
    // Prefer left of click; fall back to right if no room
    const xLeft  = position.x - W - GAP;
    const xRight = position.x + GAP;
    const finalX = xLeft >= 8 ? xLeft : Math.min(xRight, cw - W - 8);

    // Vertically: center on click point, clamp inside container
    const CARD_H = 280; // approximate max height
    const rawY   = position.y - CARD_H / 2;
    const finalY = Math.max(8, Math.min(rawY, ch - CARD_H - 8));

    return { x: finalX, y: finalY };
  });

  const p = profile ?? user;
  const skills = profile?.profile_skills
    ?.map((ps) => ps.skills?.name)
    .filter((n): n is string => Boolean(n))
    .slice(0, 4) ?? [];

  const STATUS_LABEL: Record<string, string> = {
    open:                 'Open to match',
    looking_for_designer: 'Looking for designer',
    busy:                 'Busy',
    away:                 'Away',
  };

  return (
    <motion.div
      className="absolute bg-white rounded-2xl border border-neutral-200/80 shadow-[0_12px_48px_rgba(0,0,0,0.22)] overflow-hidden"
      style={{ left: pos.x, top: pos.y, width: W, zIndex: 9999 }}
      onClick={(e) => e.stopPropagation()}
      layout
      initial={{ opacity: 0, scale: 0.92, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 6 }}
      transition={{ duration: 0.18, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {/* Header strip */}
      <div className="px-4 pt-4 pb-3 flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-white text-[15px] font-bold overflow-hidden border-2 border-white shadow-sm"
          style={{ background: roleColor(user.role) }}
        >
          {user.avatar_url
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            : initials(user.full_name)
          }
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-[14px] font-bold text-[#1A1918] leading-tight truncate">
              {p.full_name ?? 'Anonymous'}
            </p>
            {user.is_verified && (
              <img
                src="/icons/iconsax-star-3-acb2d2d1d45f-.svg"
                alt="Verified"
                className="w-3.5 h-3.5 shrink-0"
                style={{ filter: 'invert(75%) sepia(60%) saturate(500%) hue-rotate(10deg) brightness(1.1)' }}
              />
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                p.role === 'builder'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {roleLabel(p.role)}
            </span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: statusColor(user.status) }} />
              <span className="text-[11px] text-neutral-500">
                {STATUS_LABEL[user.status] ?? user.status}
              </span>
            </div>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>

      {/* Body */}
      {!profile ? (
        <div className="px-4 pb-4">
          <div className="space-y-2 animate-pulse">
            <div className="h-3 bg-neutral-100 rounded-full w-3/4" />
            <div className="h-3 bg-neutral-100 rounded-full w-1/2" />
          </div>
        </div>
      ) : (
        <motion.div
          className="px-4 pb-4 space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        >

          {/* Bio */}
          {profile.bio && (
            <p className="text-[12.5px] text-neutral-500 leading-relaxed line-clamp-2">
              {profile.bio}
            </p>
          )}

          {/* Location + availability */}
          <div className="flex items-center gap-3 text-[12px] text-neutral-400">
            {profile.location && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5"/>
                </svg>
                {profile.location}
              </span>
            )}
            {profile.availability_hours && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
                {profile.availability_hours}h/wk
              </span>
            )}
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {skills.map((s) => (
                <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* Action */}
          <button
            onClick={() => router.push(`/dashboard/matches`)}
            className="w-full bg-[#1A1918] hover:bg-neutral-800 text-white text-[12.5px] font-semibold rounded-full py-2.5 transition-colors mt-1"
          >
            View matches →
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function GlobeView({ hideLegend }: { hideLegend?: boolean } = {}) {
  const containerRef      = useRef<HTMLDivElement>(null);
  const globeRef          = useRef<GlobeInstance | null>(null);
  const cleanupRef        = useRef<(() => void) | null>(null);
  /** Country label points — populated after GeoJSON loads */
  const countryHtmlRef    = useRef<GlobePoint[]>([]);
  /** Always holds the latest fetched users so the globe init can use them even if data arrived first */
  const usersRef          = useRef<MapUser[]>([]);

  const [users,        setUsers]        = useState<MapUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<MapUser | null>(null);
  const [tooltipPos,   setTooltipPos]   = useState({ x: 0, y: 0 });

  const handleDismissTooltip = useCallback(() => setSelectedUser(null), []);

  /** Rebuild the full HTML elements array from all sources */
  const rebuildHtml = useCallback((globe: GlobeInstance, userPoints: GlobePoint[]) => {
    globe.htmlElementsData([
      ...OCEAN_GLOBE_POINTS,
      ...countryHtmlRef.current,
      ...CITY_GLOBE_POINTS,
      ...userPoints,
    ]);
  }, []);

  // Fetch users
  useEffect(() => {
    createClient()
      .from('map_users')
      .select('id, full_name, role, status, avatar_url, is_verified, lat, lng')
      .limit(500)
      .then(({ data }) => {
        if (data) {
          usersRef.current = data as MapUser[];
          setUsers(data as MapUser[]);
        }
      });
  }, []);

  // Init globe
  useEffect(() => {
    if (!containerRef.current) return;
    let active = true;

    (async () => {
      const GlobeModule = await import('globe.gl');
      const Globe = GlobeModule.default as unknown as (
        opts?: Record<string, unknown>
      ) => (el: HTMLElement) => GlobeInstance;

      if (!active || !containerRef.current) return;

      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;

      // Flat 2×2 canvas for ocean surface (no texture seams)
      const cv = document.createElement('canvas');
      cv.width = 2; cv.height = 2;
      const cx = cv.getContext('2d')!;
      cx.fillStyle = '#070b14'; // Deep dark ocean
      cx.fillRect(0, 0, 2, 2);

      const globe = Globe()(containerRef.current)
        .width(w).height(h)
        .globeImageUrl(cv.toDataURL())
        .backgroundImageUrl('')
        .backgroundColor('#070b14') // Match ocean and page background
        .showAtmosphere(true)
        .atmosphereColor('rgba(200,210,230,0.05)')
        .atmosphereAltitude(0.14)
        // ── Country fill polygons ─────────────────────────────
        .polygonsData([])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .polygonGeoJsonGeometry((d: any) => d.geometry)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .polygonCapColor((_d: any) => '#131722') // Dark sleek landmass
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .polygonSideColor((_d: any) => 'rgba(0,0,0,0)')  // no side artifacts
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .polygonStrokeColor((_d: any) => 'rgba(255,255,255,0.15)') // Subtle glowing borders
        .polygonAltitude(0.006)
        // ── State/province border paths ───────────────────────
        .pathsData([])
        .pathPoints((d: PathItem) => d.points)
        .pathPointLat((pt: [number, number]) => pt[0])
        .pathPointLng((pt: [number, number]) => pt[1])
        .pathPointAlt(0.009)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .pathColor((_d: any) => 'rgba(255,255,255,0.06)')
        .pathStroke(0.5)
        .pathTransitionDuration(0)
        // ── HTML layer: ocean + country + city + user markers ──
        .htmlElementsData([...OCEAN_GLOBE_POINTS, ...CITY_GLOBE_POINTS])
        .htmlLat((d: GlobePoint) => d.lat)
        .htmlLng((d: GlobePoint) => d.lng)
        .htmlAltitude((d: GlobePoint) => htmlAlt(d))
        .htmlElement((d: GlobePoint) => {
          const el = makeHtmlEl(d);
          d.elRef = el; // Save reference for zoom-dependent opacity

          // Click handler only for user markers
          if (d.itemType === 'marker') {
            el.addEventListener('click', (e) => {
              e.stopPropagation();
              const ev = e as MouseEvent;
              if (d.isCluster) {
                globeRef.current?.pointOfView({ lat: d.lat, lng: d.lng, altitude: 1.0 }, 600);
              } else if (d.user) {
                const rect = containerRef.current?.getBoundingClientRect();
                setTooltipPos({
                  x: ev.clientX - (rect?.left ?? 0),
                  y: ev.clientY - (rect?.top ?? 0),
                });
                setSelectedUser(d.user);
              }
            });
          }
          return el;
        });

      // ── Zoom-dependent label visibility ───────────────────
      let rafId: number;
      const updateLabels = () => {
        if (!active) return;
        rafId = requestAnimationFrame(updateLabels);
        if (!globeRef.current) return;

        const pov = globeRef.current.pointOfView();
        if (!pov) return;
        const alt = pov.altitude;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const points = (globeRef.current as any).htmlElementsData() as GlobePoint[];
        points.forEach((d) => {
          if (!d.elRef) return;
          
          if (d.itemType === 'country') {
            const pop = d.pop_est || 0;
            if (pop > 50000000) {
              // Large: always visible
              d.elRef.style.opacity = '1';
            } else if (pop > 10000000) {
              // Medium: fade in between alt 2.0 and 1.5
              const op = Math.max(0, Math.min(1, (2.0 - alt) / 0.5));
              d.elRef.style.opacity = op.toString();
            } else {
              // Small: fade in between alt 1.4 and 1.0
              const op = Math.max(0, Math.min(1, (1.4 - alt) / 0.4));
              d.elRef.style.opacity = op.toString();
            }
          } else if (d.itemType === 'city') {
            // Cities: fade in between alt 1.2 and 0.8
            const op = Math.max(0, Math.min(1, (1.2 - alt) / 0.4));
            d.elRef.style.opacity = op.toString();
          } else if (d.itemType === 'ocean') {
            // Oceans: fade out slightly when very close (alt < 1.0)
            const op = Math.max(0, Math.min(1, alt / 1.0));
            d.elRef.style.opacity = op.toString();
          }
        });
      };
      updateLabels();

      // ── Three.js lighting ─────────────────────────────────
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scene = (globe as any).scene?.();
      if (scene) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        scene.children.forEach((child: any) => {
          if (child.isAmbientLight)     child.intensity = 0.06;
          if (child.isDirectionalLight) child.intensity = 0.20;
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const THREE = (GlobeModule as any).THREE;
        if (THREE) {
          const front = new THREE.PointLight(0xffffff, 2.2, 900);
          front.position.set(0, 0, 380);
          scene.add(front);
          const fill = new THREE.PointLight(0x8899cc, 0.4, 600);
          fill.position.set(-200, 150, 200);
          scene.add(fill);
        }
      }

      globe.pointOfView({ lat: 45, lng: 15, altitude: 2.4 });
      const controls = globe.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.25;
      controls.addEventListener('start', () => { controls.autoRotate = false; });

      globeRef.current = globe;

      // ── Load GeoJSON layers ───────────────────────────────
      const [countriesRes, statesRes] = await Promise.allSettled([
        fetch('/countries.geojson').then((r) => r.json()),
        fetch(STATES_URL).then((r) => r.json()),
      ]);

      if (!active) return;

      // Countries — fill polygons + HTML name labels
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const countryFeatures: any[] = [];
      const countryLabelPoints: GlobePoint[] = [];

      if (countriesRes.status === 'fulfilled') {
        for (const f of countriesRes.value.features ?? []) {
          countryFeatures.push(f);
          const centroid = computeCentroid(f.geometry);
          const name     = getCountryName(f.properties);
          if (centroid && name) {
            const pop = f.properties?.POP_EST ?? f.properties?.pop_est ?? 0;
            countryLabelPoints.push({
              lat: centroid.lat, lng: centroid.lng,
              isCluster: false, itemType: 'country', countryName: name,
              pop_est: pop,
            });
          }
        }
      } else {
        console.error('[GlobeView] countries fetch failed:', countriesRes.reason);
      }

      // States — path lines only (no polygon mesh → no Z-fighting, light on GPU)
      const statePaths: PathItem[] = [];

      if (statesRes.status === 'fulfilled') {
        for (const f of statesRes.value.features ?? []) {
          for (const points of extractRings(f.geometry)) {
            if (points.length > 1) statePaths.push({ points });
          }
        }
      } else {
        console.warn('[GlobeView] states fetch failed:', statesRes.reason);
      }

      countryHtmlRef.current = countryLabelPoints;

      globe.polygonsData(countryFeatures);
      globe.pathsData(statePaths);
      // Rebuild HTML with country labels + any users that already arrived
      rebuildHtml(globe, clusterUsers(usersRef.current));

      // Resize
      const handleResize = () => {
        if (containerRef.current)
          globe.width(containerRef.current.clientWidth).height(containerRef.current.clientHeight);
      };
      window.addEventListener('resize', handleResize);
      cleanupRef.current = () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener('resize', handleResize);
        globe._destructor?.();
      };
    })();

    return () => {
      active = false;
      cleanupRef.current?.();
      cleanupRef.current = null;
      globeRef.current   = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update user markers when data arrives
  useEffect(() => {
    if (!globeRef.current) return;
    rebuildHtml(globeRef.current, clusterUsers(users));
  }, [users, rebuildHtml]);

  return (
    <div className="relative w-full h-full bg-[#070b14]" onClick={handleDismissTooltip}>
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing [&_canvas]:!cursor-inherit"
      />

      <AnimatePresence>
        {selectedUser && (
          <UserTooltip
            key={selectedUser.id}
            user={selectedUser}
            position={tooltipPos}
            containerRef={containerRef}
            onClose={handleDismissTooltip}
          />
        )}
      </AnimatePresence>

      {!hideLegend && (
        <div className="absolute bottom-5 left-5 z-10 space-y-1.5 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1D9E75]" />
            <span className="text-[11.5px] text-white/40 font-medium">Visionary</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#378ADD]" />
            <span className="text-[11.5px] text-white/40 font-medium">Builder</span>
          </div>
        </div>
      )}
    </div>
  );
}
