import { ScreenShell } from '@/components/screen-shell';
import { MastersScreen } from '@/components/masters/masters-screen';

export default function MastersRoute() {
  return (
    <ScreenShell horizontalPadding={0} topPadding={0}>
      <MastersScreen />
    </ScreenShell>
  );
}
