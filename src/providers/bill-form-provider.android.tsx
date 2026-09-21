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
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import {
  initialWindowMetrics,
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { BillFormPanel } from '@/components/bill-form/bill-form-panel';
import { ThemedStatusBar } from '@/components/themed-status-bar';
import { BRAND_SEED_COLOR, TabChrome } from '@/constants/brand';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';
import { SnackbarHost } from '@/providers/snackbar-provider';
import type { BillFormValues } from '@/types/bill-form';

const FORM_TOAST_GAP = 12;

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

function resolveInset(live: number, fallback: number, windowInset: number) {
  return Math.max(live, fallback, windowInset);
}

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
  const scheme = useResolvedColorScheme();
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
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <View style={[styles.modalRoot, { backgroundColor: chrome.statusBar }]}>
            <ThemedStatusBar backgroundColor={chrome.statusBar} />
            <Host style={styles.host} seedColor={BRAND_SEED_COLOR} colorScheme={scheme}>
              <AnimatedVisibility
                visible={isOpen}
                enterTransition={ENTER}
                exitTransition={EXIT}
                modifiers={[fillMaxSize()]}>
                <BillFormModalPanel
                  onClose={close}
                  mode={editValues ? 'edit' : 'create'}
                  initialValues={editValues}
                  fallbackTopInset={insets.top}
                  fallbackBottomInset={insets.bottom}
                />
              </AnimatedVisibility>
            </Host>
            <BillFormSnackbarHost fallbackTopInset={insets.top} />
          </View>
        </SafeAreaProvider>
      </Modal>
    </BillFormContext.Provider>
  );
}

function BillFormSnackbarHost({ fallbackTopInset }: { fallbackTopInset: number }) {
  const modalInsets = useSafeAreaInsets();
  const windowTop = initialWindowMetrics?.insets.top ?? 0;
  const topInset = Math.max(modalInsets.top, fallbackTopInset, windowTop);

  return <SnackbarHost topOffset={topInset + FORM_TOAST_GAP} />;
}

function BillFormModalPanel({
  onClose,
  mode,
  initialValues,
  fallbackTopInset,
  fallbackBottomInset,
}: {
  onClose: () => void;
  mode: 'create' | 'edit';
  initialValues: BillFormValues | null;
  fallbackTopInset: number;
  fallbackBottomInset: number;
}) {
  const modalInsets = useSafeAreaInsets();
  const windowInsets = initialWindowMetrics?.insets;

  return (
    <BillFormPanel
      visible
      onClose={onClose}
      mode={mode}
      initialValues={initialValues}
      topInset={resolveInset(modalInsets.top, fallbackTopInset, windowInsets?.top ?? 0)}
      bottomInset={resolveInset(
        modalInsets.bottom,
        fallbackBottomInset,
        windowInsets?.bottom ?? 0
      )}
    />
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
