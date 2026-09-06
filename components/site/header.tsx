'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';

const NAV = [
  [ 'Rankings', '#score' ],
  [ 'Why', '#why' ],
  [ 'Proof', '#proof' ],
  [ 'How it works', '#anatomy' ],
  [ 'Contribute', '#contribute' ],
] as const;

export function Header () {
  const [ dark, setDark ] = useState( true );
  return (
    <header className="bg-shell border-shell-border sticky top-0 z-20 border-b">
      <div className="mx-auto flex h-[50px] max-w-6xl items-center gap-6 px-6">
        <a href="#top" className="flex items-center gap-3">
          <span className="font-semibold tracking-tight">Pragmatikos</span>
          {/*           <Badge variant="secondary">rankings inside</Badge>
 */}        </a>
        <nav className="hidden items-center gap-4 text-sm md:flex">
          { NAV.map( ( [ label, href ] ) => (
            <a key={ href } href={ href } className="text-muted-foreground hover:text-foreground">
              { label }
            </a>
          ) ) }
        </nav>
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={ dark ? 'Switch to light theme' : 'Switch to dark theme' }
            onClick={ () => {
              document.getElementById( 'theme-root' )?.classList.toggle( 'dark' );
              setDark( ( d ) => !d );
            } }
          >
            { dark ? <Sun /> : <Moon /> }
          </Button>
        </div>
      </div>
    </header>
  );
}
