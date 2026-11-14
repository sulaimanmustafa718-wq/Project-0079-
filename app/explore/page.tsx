import { Suspense } from 'react';
import { AppShell } from '@/components/dicbook/AppShell';
import { ExploreView } from '@/components/dicbook/ExploreView';

export default function ExplorePage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-sm text-slate-500">
            Loading search...
          </div>
        }
      >
        <ExploreView />
      </Suspense>
    </AppShell>
  );
}
