import { Button } from '@expo/ui';

import { ScreenShell } from '@/components/screen-shell';
import { useAuth } from '@/providers/auth-provider';
import { useAppStore } from '@/stores/app-store';

export default function SettingsScreen() {
  const { profile, signOut } = useAuth();
  const themeMode = useAppStore((state) => state.themeMode);
  const activeFinancialYearId = useAppStore((state) => state.activeFinancialYearId);

  return (
    <ScreenShell
      title="Settings"
      subtitle={`Signed in as ${profile?.full_name ?? 'Unknown'} (${profile?.role_display_name ?? '—'}) · Theme: ${themeMode} · Active FY: ${activeFinancialYearId ?? 'not set'}`}>
      <Button label="Sign out" variant="outlined" onPress={() => signOut()} />
    </ScreenShell>
  );
}
