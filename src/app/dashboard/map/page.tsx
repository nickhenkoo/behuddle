import GlobeLoader from '@/components/map/GlobeLoader';

export default function MapPage() {
  return (
    <div className="flex-1 overflow-y-auto pb-20 md:pb-8">
      <div className="px-4 md:px-8 py-8">

        {/* Header */}
        <div className="max-w-2xl mb-6">
          <h1 className="font-display text-[24px] font-semibold tracking-tight text-neutral-900">Globe</h1>
          <p className="text-[13.5px] text-neutral-500 mt-0.5">
            Builders &amp; contributors around the world. Click a dot to connect.
          </p>
        </div>

        {/* Globe card — full column width, 2× taller */}
        <div
          className="relative rounded-2xl overflow-hidden w-full"
          style={{ background: '#070b14', height: 680 }}
        >
          {/* Vignette — edge darkening for depth */}
          <div
            className="absolute inset-0 pointer-events-none z-[1]"
            style={{
              background:
                'radial-gradient(ellipse 80% 75% at 50% 52%, transparent 35%, rgba(7,11,20,0.7) 80%, #070b14 100%)',
            }}
          />

          {/* Globe WebGL canvas */}
          <div className="absolute inset-0 z-0">
            <GlobeLoader />
          </div>

          {/* Legend — bottom left, on top of vignette */}
          <div className="absolute bottom-5 left-5 z-10 pointer-events-none space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1D9E75]" />
              <span className="text-[11.5px] text-white/50 font-medium">Builder</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#378ADD]" />
              <span className="text-[11.5px] text-white/50 font-medium">Contributor</span>
            </div>
          </div>

          {/* Hint — bottom right */}
          <p className="absolute bottom-5 right-5 z-10 text-[11px] text-white/20 pointer-events-none tracking-wide">
            Drag · Scroll · Click
          </p>
        </div>

      </div>
    </div>
  );
}
