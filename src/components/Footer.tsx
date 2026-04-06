import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-background py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Brand */}
        <span className="font-display text-lg font-bold tracking-tight text-black">
          behuddle
        </span>

        {/* Links */}
        <div className="flex items-center gap-6 text-[0.82rem] text-neutral-400">
          <Link
            href="mailto:contact@behuddle.com"
            className="hover:text-black transition-colors duration-150"
          >
            contact@behuddle.com
          </Link>
          <span className="w-px h-3 bg-neutral-200" />
          <Link
            href="https://t.me/teamup"
            className="hover:text-black transition-colors duration-150"
          >
            Telegram
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-[0.75rem] text-neutral-300 tracking-wide">
          © {year} behuddle
        </p>
      </div>
    </footer>
  );
}
