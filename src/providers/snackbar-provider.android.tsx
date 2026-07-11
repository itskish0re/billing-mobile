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
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BRAND_SEED_COLOR, TabChrome } from '@/constants/brand';
import { BottomTabInset } from '@/constants/theme';

export type SnackbarVariant = 'success' | 'error';

export type ShowSnackbarOptions = {
  variant?: SnackbarVariant;
  /** Auto-dismiss duration in ms (default 4000). */
  durationMs?: number;
};

type ActiveToast = {
  message: string;
  variant: SnackbarVariant;
  durationMs: number;
  token: number;
};

type SnackbarContextValue = {
  showSnackbar: (message: string, options?: ShowSnackbarOptions) => Promise<void>;
};

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

const SNACKBAR_ABOVE_TABS = 12;

const VARIANT_STYLES = {
  success: {
    background: TabChrome.light.headerBackground,
    text: TabChrome.light.onHeader,
    accent: BRAND_SEED_COLOR,
    dismiss: TabChrome.light.onHeaderMuted,
  },
  error: {
    background: '#F9DEDC',
    text: '#410E0B',
    accent: '#B3261E',
    dismiss: '#8C1D18',
  },
} as const;

function ToastCard({
  toast,
  onFinished,
}: {
  toast: ActiveToast;
  onFinished: (token: number) => void;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(1)).current;
  const finishedRef = useRef(false);
  const colors = VARIANT_STYLES[toast.variant];

  const finish = useCallback(
    (animated: boolean) => {
      if (finishedRef.current) {
        return;
      }
      finishedRef.current = true;
      progress.stopAnimation();

      if (!animated) {
        onFinished(toast.token);
        return;
      }

      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(() => {
        onFinished(toast.token);
      });
    },
    [onFinished, opacity, progress, toast.token]
  );

  useEffect(() => {
    finishedRef.current = false;
    opacity.setValue(0);
    progress.setValue(1);

    Animated.timing(opacity, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();

    const animation = Animated.timing(progress, {
      toValue: 0,
      duration: toast.durationMs,
      easing: Easing.linear,
      useNativeDriver: false,
    });

    animation.start(({ finished }) => {
      if (finished) {
        finish(true);
      }
    });

    return () => {
      animation.stop();
    };
  }, [finish, opacity, progress, toast.durationMs, toast.token]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.toastWrap, { opacity }]}>
      <View style={[styles.toast, { backgroundColor: colors.background }]}>
        <View style={styles.toastRow}>
          <Text style={[styles.message, { color: colors.text }]} numberOfLines={3}>
            {toast.message}
          </Text>
          <Pressable
            accessibilityLabel="Dismiss"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => {
              finish(true);
            }}
            style={styles.dismissButton}>
            <Text style={[styles.dismissLabel, { color: colors.dismiss }]}>✕</Text>
          </Pressable>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: `${colors.accent}33` }]}>
          <Animated.View
            style={[
              styles.progressFill,
              { backgroundColor: colors.accent, width: progressWidth },
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
}

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ActiveToast | null>(null);
  const tokenRef = useRef(0);
  const finishResolverRef = useRef<(() => void) | null>(null);
  const finishedTokenRef = useRef<number | null>(null);

  const clearToast = useCallback((token: number) => {
    if (finishedTokenRef.current === token) {
      return;
    }
    finishedTokenRef.current = token;
    setToast((current) => (current?.token === token ? null : current));
    const resolve = finishResolverRef.current;
    finishResolverRef.current = null;
    resolve?.();
  }, []);

  const showSnackbar = useCallback(
    async (message: string, options?: ShowSnackbarOptions) => {
      const trimmed = message.trim();
      if (!trimmed) {
        return;
      }

      finishResolverRef.current?.();
      finishResolverRef.current = null;

      const token = tokenRef.current + 1;
      tokenRef.current = token;
      finishedTokenRef.current = null;

      await new Promise<void>((resolve) => {
        finishResolverRef.current = resolve;
        setToast({
          message: trimmed,
          variant: options?.variant ?? 'success',
          durationMs: options?.durationMs ?? 4000,
          token,
        });
      });
    },
    []
  );

  const value = useMemo(() => ({ showSnackbar }), [showSnackbar]);

  return (
    <SnackbarContext.Provider value={value}>
      <View style={styles.container}>
        {children}
        {toast ? (
          <View pointerEvents="box-none" style={styles.host}>
            <ToastCard key={toast.token} toast={toast} onFinished={clearToast} />
          </View>
        ) : null}
      </View>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const context = useContext(SnackbarContext);

  if (!context) {
    throw new Error('useSnackbar must be used within SnackbarProvider');
  }

  return context;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  host: {
    bottom: BottomTabInset + SNACKBAR_ABOVE_TABS,
    elevation: 12,
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 1000,
  },
  toastWrap: {
    paddingHorizontal: 16,
  },
  toast: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  toastRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingLeft: 16,
    paddingRight: 4,
    paddingVertical: 12,
  },
  message: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  dismissButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  dismissLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressTrack: {
    height: 3,
    width: '100%',
  },
  progressFill: {
    height: 3,
  },
});
