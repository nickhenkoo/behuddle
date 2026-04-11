'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

const GlobeView = dynamic(() => import('@/components/map/GlobeView'), {
  ssr: false,
  loading: () => <div className="w-full h-full" style={{ background: '#070b14' }} />,
});

export function GlobeWidget() {
  return (
    <div className="relative rounded-2xl overflow-hidden h-[340px]" style={{ background: '#070b14' }}>
      <GlobeView />

      {/* Header overlay */}
      <div className="absolute top-3 left-4 z-20 pointer-events-none">
        <span className="text-[12px] font-semibold text-white/70 uppercase tracking-widest">
          People
        </span>
      </div>

      {/* Footer link */}
      <Link
        href="/dashboard/map"
        className="absolute bottom-3 right-4 z-20 text-[12px] text-white/50 hover:text-white/90 transition-colors font-medium"
      >
        View map →
      </Link>
    </div>
  );
}
