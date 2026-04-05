import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-12 w-full mt-auto bg-background">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="font-display text-xl font-bold tracking-tight text-black">
          TeamUp
        </div>
        
        <div className="flex items-center gap-6">
          <Link href="mailto:hello@teamup.com" className="text-neutral-500 hover:text-black transition-colors duration-200">
            hello@teamup.com
          </Link>
          <Link href="https://t.me/teamup" className="text-neutral-500 hover:text-black transition-colors duration-200">
            Telegram
          </Link>
        </div>
      </div>
    </footer>
  );
}
