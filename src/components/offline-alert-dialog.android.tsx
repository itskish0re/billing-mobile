import { Host } from '@expo/ui';
import {
  AlertDialog,
  Icon,
  Text,
  TextButton,
} from '@expo/ui/jetpack-compose';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { exitApp } from '@/lib/exit-app';

const WIFI_OFF_ICON = require('@/assets/icons/wifi_off.xml');

export function OfflineAlertDialog() {
  return (
    <SafeAreaView style={styles.container}>
      <Host style={styles.host}>
        <AlertDialog
          onDismissRequest={exitApp}
          properties={{
            dismissOnClickOutside: false,
            dismissOnBackPress: true,
          }}>
          <AlertDialog.Icon>
            <Icon source={WIFI_OFF_ICON} size={28} />
          </AlertDialog.Icon>
          <AlertDialog.Title>
            <Text>No internet connection</Text>
          </AlertDialog.Title>
          <AlertDialog.Text>
            <Text>
              This app requires an active internet connection. Connect to a network and reopen the
              app.
            </Text>
          </AlertDialog.Text>
          <AlertDialog.ConfirmButton>
            <TextButton onClick={exitApp}>
              <Text>Close</Text>
            </TextButton>
          </AlertDialog.ConfirmButton>
        </AlertDialog>
      </Host>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  host: {
    flex: 1,
  },
});
