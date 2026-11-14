import { AppShell } from '@/components/dicbook/AppShell';
import { MessagesView } from '@/components/dicbook/MessagesView';

export default function MessagesPage() {
  return (
    <AppShell hideRightColumn>
      <MessagesView />
    </AppShell>
  );
}
