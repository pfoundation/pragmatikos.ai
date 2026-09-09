import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Pragmatikos — what actually works',
  description:
    'Benchmarks rank models. Usage dashboards rank adoption. Pragmatikos measures what developers feel: how many turns it takes to ship, which planner-builder pair gets there, and what a delivered outcome costs.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('pragmatikos-theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body>
        <div id="theme-root" className="font-sans bg-background text-foreground min-h-screen antialiased">
          {children}
        </div>
      </body>
    </html>
  );
}
