import { Host } from '@expo/ui';
import {
  AnimatedVisibility,
  EnterTransition,
  ExitTransition,
} from '@expo/ui/jetpack-compose';
import { fillMaxSize } from '@expo/ui/jetpack-compose/modifiers';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { Modal, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BillFormPanel } from '@/components/bill-form/bill-form-panel';
import { BRAND_SEED_COLOR, TabChrome, resolveColorScheme } from '@/constants/brand';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { BillFormValues } from '@/types/bill-form';

type BillFormContextValue = {
  isOpen: boolean;
  openCreate: () => void;
  /** Opens the form prefilled with an existing bill's values (edit mode). */
  openEdit: (values: BillFormValues) => void;
  close: () => void;
};

const BillFormContext = createContext<BillFormContextValue | null>(null);

/** Match Compose slide duration; used to dismiss Modal after exit finishes. */
const EXIT_MS = 320;

const ENTER = EnterTransition.slideInHorizontally({ initialOffsetX: 1 });
const EXIT = ExitTransition.slideOutHorizontally({ targetOffsetX: 1 });

export function useBillForm() {
  const ctx = useContext(BillFormContext);
  if (!ctx) {
    throw new Error('useBillForm must be used within BillFormProvider');
  }
  return ctx;
}

/**
 * Full-screen bill form over tabs/header.
 * Slide runs on the Compose UI thread via AnimatedVisibility (not RN transform
 * of the Host), which avoids the jitter from remounting Compose mid-animation.
 */
export function BillFormProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editValues, setEditValues] = useState<BillFormValues | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const scheme = resolveColorScheme(colorScheme);
  const chrome = TabChrome[scheme];

  const clearExitTimer = useCallback(() => {
    if (exitTimerRef.current != null) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
  }, []);

  const openCreate = useCallback(() => {
    clearExitTimer();
    setEditValues(null);
    setModalVisible(true);
    // Mount Host first, then flip visible so enter transition actually runs.
    requestAnimationFrame(() => {
      setIsOpen(true);
    });
  }, [clearExitTimer]);

  const openEdit = useCallback(
    (values: BillFormValues) => {
      clearExitTimer();
      setEditValues(values);
      setModalVisible(true);
      requestAnimationFrame(() => {
        setIsOpen(true);
      });
    },
    [clearExitTimer]
  );

  const close = useCallback(() => {
    if (!isOpen) {
      return;
    }
    setIsOpen(false);
    clearExitTimer();
    exitTimerRef.current = setTimeout(() => {
      setModalVisible(false);
      exitTimerRef.current = null;
    }, EXIT_MS);
  }, [clearExitTimer, isOpen]);

  useEffect(() => {
    if (!modalVisible) {
      return;
    }

    SystemUI.setBackgroundColorAsync(chrome.statusBar).catch(() => undefined);
  }, [chrome.statusBar, modalVisible]);

  const value = useMemo(
    () => ({
      isOpen,
      openCreate,
      openEdit,
      close,
    }),
    [isOpen, openCreate, openEdit, close]
  );

  return (
    <BillFormContext.Provider value={value}>
      {children}
      <Modal
        visible={modalVisible}
        animationType="none"
        transparent
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={close}>
        <SafeAreaProvider>
          <View style={[styles.modalRoot, { backgroundColor: chrome.statusBar }]}>
            <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
            <Host style={styles.host} seedColor={BRAND_SEED_COLOR} colorScheme={scheme}>
              <AnimatedVisibility
                visible={isOpen}
                enterTransition={ENTER}
                exitTransition={EXIT}
                modifiers={[fillMaxSize()]}>
                <BillFormPanel
                  visible
                  onClose={close}
                  mode={editValues ? 'edit' : 'create'}
                  initialValues={editValues}
                  topInset={insets.top}
                  bottomInset={insets.bottom}
                />
              </AnimatedVisibility>
            </Host>
          </View>
        </SafeAreaProvider>
      </Modal>
    </BillFormContext.Provider>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  host: {
    flex: 1,
  },
});
