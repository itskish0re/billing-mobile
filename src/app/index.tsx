import { HomeScreen } from '@/components/home/home-screen';
import { ScreenShell } from '@/components/screen-shell';

export default function HomeRoute() {
  return (
    <ScreenShell horizontalPadding={0} topPadding={0}>
      <HomeScreen />
    </ScreenShell>
  );
}
