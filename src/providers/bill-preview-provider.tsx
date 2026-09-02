import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BillPreviewCanvas } from '@/components/bill-preview/bill-preview-canvas';
import type { BillPreviewModel } from '@/types/bill-preview';

type BillPreviewContextValue = {
  /** Opens the preview sheet with the supplied (controlled) memo data. */
  open: (data: BillPreviewModel) => void;
  close: () => void;
};

const BillPreviewContext = createContext<BillPreviewContextValue | null>(null);

export function useBillPreview(): BillPreviewContextValue {
  const context = useContext(BillPreviewContext);
  if (!context) {
    throw new Error('useBillPreview must be used within a BillPreviewProvider');
  }
  return context;
}

const SLIDE_OFFSET = Dimensions.get('window').height;

export function BillPreviewProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<BillPreviewModel | null>(null);

  // Backdrop fades in; the sheet slides up — driven by two independent values.
  const { fade, slide } = useMemo(
    () => ({ fade: new Animated.Value(0), slide: new Animated.Value(0) }),
    []
  );

  const open = useCallback(
    (next: BillPreviewModel) => {
      setData(next);
      fade.setValue(0);
      slide.setValue(0);
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(slide, {
          toValue: 1,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    },
    [fade, slide]
  );

  const close = useCallback(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 0,
        duration: 200,
        delay: 40,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 260,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setData(null);
      }
    });
  }, [fade, slide]);

  const value = useMemo<BillPreviewContextValue>(() => ({ open, close }), [open, close]);

  const translateY = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [SLIDE_OFFSET, 0],
  });

  return (
    <BillPreviewContext.Provider value={value}>
      {children}
      <Modal
        visible={data != null}
        transparent
        animationType="none"
        statusBarTranslucent
        navigationBarTranslucent
        // Intentionally a no-op: the sheet only closes via the header close button.
        onRequestClose={() => undefined}>
        <View style={styles.root}>
          <Animated.View style={[styles.backdrop, { opacity: fade }]} />
          <Animated.View
            style={[styles.sheet, { paddingBottom: insets.bottom, transform: [{ translateY }] }]}>
            <GestureHandlerRootView style={styles.sheetInner}>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Bill preview</Text>
                <Pressable
                  style={styles.closeButton}
                  onPress={close}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Close preview">
                  <Text style={styles.closeIcon}>{'\u2715'}</Text>
                </Pressable>
              </View>
              <View style={styles.canvasWrap}>
                {data ? <BillPreviewCanvas data={data} /> : null}
              </View>
            </GestureHandlerRootView>
          </Animated.View>
        </View>
      </Modal>
    </BillPreviewContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    height: '80%',
    backgroundColor: '#e9eaee',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  sheetInner: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 12,
    height: 56,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.12)',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  canvasWrap: {
    flex: 1,
  },
});
