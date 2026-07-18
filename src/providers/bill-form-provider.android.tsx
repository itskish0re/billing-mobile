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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BillFormPanel } from '@/components/bill-form/bill-form-panel';
import { BRAND_SEED_COLOR } from '@/constants/brand';

type BillFormContextValue = {
  isOpen: boolean;
  openCreate: () => void;
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
  const insets = useSafeAreaInsets();
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearExitTimer = useCallback(() => {
    if (exitTimerRef.current != null) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
  }, []);

  const openCreate = useCallback(() => {
    clearExitTimer();
    setModalVisible(true);
    // Mount Host first, then flip visible so enter transition actually runs.
    requestAnimationFrame(() => {
      setIsOpen(true);
    });
  }, [clearExitTimer]);

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
      close,
    }),
    [isOpen, openCreate, close]
  );

  return (
    <BillFormContext.Provider value={value}>
      {children}
      <Modal
        visible={modalVisible}
        animationType="none"
        transparent
        statusBarTranslucent
        onRequestClose={close}>
        <View
          style={[
            styles.modalRoot,
            { paddingTop: insets.top, paddingBottom: insets.bottom },
          ]}>
          <Host style={styles.host} seedColor={BRAND_SEED_COLOR}>
            <AnimatedVisibility
              visible={isOpen}
              enterTransition={ENTER}
              exitTransition={EXIT}
              modifiers={[fillMaxSize()]}>
              <BillFormPanel visible onClose={close} />
            </AnimatedVisibility>
          </Host>
        </View>
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
