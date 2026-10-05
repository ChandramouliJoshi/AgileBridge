
import Link from 'next/link';

export default function InfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border/40 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold transition-transform duration-300 hover:scale-105"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-primary"
          >
            <path d="M12 3L4 9V17H20V9L12 3Z" />
            <path d="M8 21V15H16V21" />
            <path d="M10 11H14" />
          </svg>
          <span className="font-bold">AgileBridge</span>
        </Link>
        <div className="flex items-center gap-4"></div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-7xl">
            {children}
        </div>
      </main>
      <footer className="flex items-center justify-center py-6 px-4 md:px-6 border-t border-border/40">
        <div className="container flex items-center justify-between">
            <p className="text-sm text-muted-foreground">&copy; 2024 AgileBridge. All rights reserved.</p>
            <div className="flex items-center gap-4 text-sm">
                <Link href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">Terms of Service</Link>
            </div>
        </div>
      </footer>
    </div>
  );
}
