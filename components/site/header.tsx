'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GithubIcon } from '@/components/ui/github-icon';
import { GITHUB_REPO } from '@/lib/site';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

const NAV = [
  ['Rankings', '#score'],
  ['Why', '#why'],
  ['Proof', '#proof'],
  ['How it works', '#anatomy'],
  ['Caveats', '#caveats'],
  ['Contribute', '#contribute'],
] as const;

export function Header() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);
  return (
    <header className="bg-shell border-shell-border sticky top-0 z-20 border-b">
      <div className="mx-auto flex h-[50px] max-w-6xl items-center gap-6 px-6">
        <a href="#top" className="flex items-center gap-3">
          <span className="font-semibold tracking-tight">Pragmatikos</span>
          {/*           <Badge variant="secondary">rankings inside</Badge>
           */}{' '}
        </a>
        <nav className="hidden items-center gap-4 text-sm md:flex">
          {NAV.map(([label, href]) => (
            <a key={href} href={href} className="text-muted-foreground hover:text-foreground">
              {label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
            onClick={() => {
              const next = !dark;
              setDark(next);
              document.documentElement.classList.toggle('dark', next);
              document.getElementById('theme-root')?.classList.toggle('dark', next);
              try {
                localStorage.setItem('pragmatikos-theme', next ? 'dark' : 'light');
              } catch {
                // storage unavailable (private mode) — theme still applies for this visit
              }
            }}
          >
            {dark ? <Sun /> : <Moon />}
          </Button>
          <Button variant="ghost" size="icon-sm" asChild>
            <a href={GITHUB_REPO} target="_blank" rel="noreferrer" aria-label="GitHub repository">
              <GithubIcon />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
