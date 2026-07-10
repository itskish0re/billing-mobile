import { ScreenShell } from '@/components/screen-shell';
import { SettingsScreen } from '@/components/settings/settings-screen';

export default function SettingsRoute() {
  return (
    <ScreenShell>
      <SettingsScreen />
    </ScreenShell>
  );
}
