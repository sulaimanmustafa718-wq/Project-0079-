import { AppShell } from '@/components/dicbook/AppShell';
import { BusinessProfileView } from '@/components/dicbook/BusinessProfileView';

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell>
      <BusinessProfileView businessId={id} />
    </AppShell>
  );
}
