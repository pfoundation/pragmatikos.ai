import { Anatomy } from '@/components/site/anatomy';
import { Blindspot } from '@/components/site/blindspot';
import { Caveats } from '@/components/site/caveats';
import { Contribute } from '@/components/site/contribute';
import { ContributionFlow } from '@/components/site/contribution-flow';
import { Header } from '@/components/site/header';
import { Hero } from '@/components/site/hero';
import { Recorder } from '@/components/site/recorder';
import { Scorecard } from '@/components/site/scorecard';
import { Join } from '@/components/site/join';
import { Triptych } from '@/components/site/triptych';
import { HotProvider } from '@/lib/hot';

export default function Page() {
  return (
    <>
      <Header />
      <HotProvider>
        <main id="top">
          <Hero />
          <Scorecard />
          <Join />
          <Triptych />
          <Blindspot />
          <Anatomy />
          <Recorder />
          <Caveats />
          <Contribute />
          <ContributionFlow />
          <footer className="border-border border-t">
            <div className="text-muted-foreground mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-8 font-mono text-xs">
              <span>Pragmatikos · real sessions, pooled</span>
              <a href="https://p.foundation" target="_blank" rel="noreferrer" className="hover:text-foreground hover:underline">
                © P Foundation
              </a>
            </div>
          </footer>
        </main>
      </HotProvider>
    </>
  );
}
