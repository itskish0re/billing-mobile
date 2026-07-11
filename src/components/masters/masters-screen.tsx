import { Text } from '@expo/ui';
import { View } from 'react-native';

/** Non-Android fallback — Masters ships Android-only for v1. */
export function MastersScreen() {
  return (
    <View>
      <Text>Masters is available on Android.</Text>
    </View>
  );
}
