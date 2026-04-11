import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-background py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-sage/20 to-transparent mb-10" />

        <div className="flex flex-col md:flex-row items-center justify-between w-full gap-8">
          {/* Left: Brand */}
          <div className="flex-1 flex items-center justify-start">
            <div className="flex items-center gap-2.5">
              <img 
                src="/logo.svg" 
                alt="behuddle" 
                className="h-8 w-auto object-contain" 
              />
              <span className="font-display font-bold text-[20px] tracking-tight text-heading leading-none">
                behuddle
              </span>
            </div>
          </div>

          {/* Center: Main Links */}
          <div className="flex-1 flex justify-center items-center gap-6 text-[0.85rem] text-secondary">
            <Link
              href="mailto:contact@behuddle.com"
              className="hover:text-foreground transition-colors duration-200"
            >
              contact@behuddle.com
            </Link>
            <span className="w-1 h-1 rounded-full bg-sage/30" />
            <Link
              href="https://t.me/teamup"
              className="hover:text-foreground transition-colors duration-200 flex items-center gap-1.5"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/telegram.svg" alt="Telegram" className="w-4 h-4 object-contain" />
              Telegram
            </Link>
          </div>

          {/* Right: Legal & Copyright */}
          <div className="flex-1 flex flex-col items-end gap-3">
            <div className="flex flex-wrap justify-end items-center gap-x-4 gap-y-2 text-[12px] text-hint">
              <Link href="/privacy" className="hover:text-secondary transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-secondary transition-colors">Terms</Link>
              <Link href="/cookies" className="hover:text-secondary transition-colors">Cookies</Link>
              <Link href="/legal" className="hover:text-secondary transition-colors">Legal</Link>
            </div>
            <p className="text-[12px] text-hint/80" style={{ letterSpacing: '0.05em' }}>
              © {year} behuddle. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
