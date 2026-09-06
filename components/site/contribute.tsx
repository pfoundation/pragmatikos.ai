'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Reveal } from '@/lib/reveal';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import { useState } from 'react';

const AGENT_PROMPT =
  'Install the ocInsights plugin for OpenCode: add "@pfoundation/ocinsight" to the "plugin" list in my global opencode.json config. ' +
  'Then tell me to restart OpenCode, and afterwards verify the plugin loaded and the insights deck answers at http://127.0.0.1:4173/. ' +
  'Also report whether insight contribution is on, without changing that setting.';

const PLUGIN_JSON = '{ "plugin": ["@pfoundation/ocinsight"] }';
const DECK_URL = 'http://127.0.0.1:4173/';

const AFTER_AGENT = [
  'Paste the prompt into your OpenCode agent and let it edit your config.',
  'Restart OpenCode when it tells you to, then open the deck it verifies.',
  'Preview with Contribute in the deck header — sharing is on by default.',
] as const;

function CopyButton ( { text, label }: { text: string; label: string; } ) {
  const [ done, setDone ] = useState( false );
  return (
    <Button
      variant="outline"
      size="sm"
      aria-label={ `Copy ${ label }` }
      onClick={ async () => {
        try
        {
          await navigator.clipboard.writeText( text );
        } catch
        {
          const ta = document.createElement( 'textarea' );
          ta.value = text;
          document.body.appendChild( ta );
          ta.select();
          document.execCommand( 'copy' );
          ta.remove();
        }
        setDone( true );
        setTimeout( () => setDone( false ), 1500 );
      } }
    >
      { done ? <Check /> : <Copy /> }
      { done ? 'Copied' : 'Copy' }
    </Button>
  );
}

export function Contribute () {
  return (
    <section id="contribute" className="bg-blueprint scroll-mt-12">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <p className="font-mono text-xs text-primary">contribute</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Add your sessions in two minutes</h2>
          <p className="text-muted-foreground mt-2 font-mono text-xs">For OpenCode v2 — other coding agents coming soon.</p>
        </Reveal>
        <Tabs defaultValue="agent" className="mt-6">
          <TabsList aria-label="Install method">
            <TabsTrigger value="agent">Ask your agent</TabsTrigger>
            <TabsTrigger value="manual">Manual install</TabsTrigger>
          </TabsList>
          <TabsContent value="agent">
            <Card className="bg-[var(--shell-deep)] max-w-3xl">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <p className="font-mono text-[13px] leading-7">{ AGENT_PROMPT }</p>
                  <CopyButton text={ AGENT_PROMPT } label="agent prompt" />
                </div>
              </CardContent>
            </Card>
            <ol className="mt-6 max-w-3xl space-y-4">
              { AFTER_AGENT.map( ( body, i ) => (
                <li key={ body } className="flex gap-4">
                  <span className="font-mono text-2xl font-semibold text-primary">{ i + 1 }</span>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{ body }</p>
                </li>
              ) ) }
            </ol>
          </TabsContent>
          <TabsContent value="manual">
            <ol className="max-w-3xl space-y-5">
              <li className="flex gap-4">
                <span className="font-mono text-2xl font-semibold text-primary">1</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">Add the plugin to your global config</p>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    In <span className="font-mono text-[13px]">~/.config/opencode/opencode.json</span>, merged into the{ ' ' }
                    <span className="font-mono text-[13px]">plugin</span> list if you already have one:
                  </p>
                  <Card className="bg-[var(--shell-deep)] mt-3">
                    <CardContent className="flex items-center justify-between gap-4 p-4">
                      <code className="font-mono text-[13px] break-all">{ PLUGIN_JSON }</code>
                      <CopyButton text={ PLUGIN_JSON } label="plugin snippet" />
                    </CardContent>
                  </Card>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="font-mono text-2xl font-semibold text-primary">2</span>
                <div>
                  <p className="font-semibold">Restart OpenCode</p>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">The plugin loads on startup.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="font-mono text-2xl font-semibold text-primary">3</span>
                <div>
                  <p className="font-semibold">Open your deck</p>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    <span className="font-mono text-[13px]">{ DECK_URL }</span> — first load runs extract, about fifteen seconds.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="font-mono text-2xl font-semibold text-primary">4</span>
                <div>
                  <p className="font-semibold">Preview, then share</p>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    Preview with Contribute in the deck header. Sharing is on by default — your plugin sends new cycles on its own.{ ' ' }
                    <span className="font-mono text-[13px]">/contribute</span> in the TUI to change it.
                  </p>
                </div>
              </li>
            </ol>
          </TabsContent>
        </Tabs>
        <p className="text-muted-foreground mt-8 max-w-3xl text-sm leading-relaxed">
          Twenty fields per cycle — day, models, turns, edits, cost, shipping. No paths, prompts, session ids or projects. Preview in the
          deck&apos;s Contribute panel before anything leaves your machine.
        </p>

      </div>
    </section>
  );
}
