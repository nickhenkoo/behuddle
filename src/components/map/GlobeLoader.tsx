'use client';

import dynamic from 'next/dynamic';

const GlobeView = dynamic(() => import('@/components/map/GlobeView'), {
  ssr: false,
  loading: () => <div className="w-full h-full" style={{ background: '#070b14' }} />,
});

export default function GlobeLoader() {
  return (
    <div className="w-full h-full">
      <GlobeView hideLegend />
    </div>
  );
}
