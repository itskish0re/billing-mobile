import { Text } from '@expo/ui';
import { useEffect } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { exitApp } from '@/lib/exit-app';

export function OfflineAlertDialog() {
  useEffect(() => {
    Alert.alert(
      'No internet connection',
      'This app requires an active internet connection. Connect to a network and reopen the app.',
      [{ text: 'Close', onPress: exitApp }],
      { cancelable: false }
    );
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.blocker}>
        <Text textStyle={styles.message}>No internet connection</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blocker: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  message: {
    textAlign: 'center',
  },
});
