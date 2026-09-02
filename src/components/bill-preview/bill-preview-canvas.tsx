import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  PanGestureHandler,
  type PanGestureHandlerStateChangeEvent,
  PinchGestureHandler,
  type PinchGestureHandlerStateChangeEvent,
  State,
} from 'react-native-gesture-handler';

import { BILL_MEMO_WIDTH, BillMemoTemplate } from '@/components/bill-preview/bill-memo-template';
import type { BillPreviewModel } from '@/types/bill-preview';

const MIN_SCALE = 0.2;
const MAX_SCALE = 3;
const ZOOM_STEP = 1.2;
const CANVAS_PADDING = 24;

type BillPreviewCanvasProps = {
  data: BillPreviewModel;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Renders the memo template on a pan/pinch-zoomable surface. Uses the legacy
 * gesture-handler component API with the RN Animated driver so it works without
 * the reanimated/worklets babel setup.
 */
export function BillPreviewCanvas({ data }: BillPreviewCanvasProps) {
  const [container, setContainer] = useState({ width: 0, height: 0 });
  const didFit = useRef(false);

  const { baseScale, pinchScale, translateX, translateY } = useMemo(
    () => ({
      baseScale: new Animated.Value(1),
      pinchScale: new Animated.Value(1),
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
    }),
    []
  );
  const lastScale = useRef(1);
  const lastPan = useRef({ x: 0, y: 0 });
  const scale = useMemo(() => Animated.multiply(baseScale, pinchScale), [baseScale, pinchScale]);

  const pinchRef = useRef(null);
  const panRef = useRef(null);

  const setScale = useCallback(
    (next: number, animate = true) => {
      const clamped = clamp(next, MIN_SCALE, MAX_SCALE);
      lastScale.current = clamped;
      pinchScale.setValue(1);
      if (animate) {
        Animated.spring(baseScale, {
          toValue: clamped,
          useNativeDriver: true,
          friction: 8,
          tension: 80,
        }).start();
      } else {
        baseScale.setValue(clamped);
      }
    },
    [baseScale, pinchScale]
  );

  const resetPan = useCallback(() => {
    lastPan.current = { x: 0, y: 0 };
    translateX.setOffset(0);
    translateX.setValue(0);
    translateY.setOffset(0);
    translateY.setValue(0);
  }, [translateX, translateY]);

  const fitToWidth = useCallback(
    (width = container.width, animate = true) => {
      if (!width) {
        return;
      }
      const target = clamp((width - CANVAS_PADDING) / BILL_MEMO_WIDTH, MIN_SCALE, MAX_SCALE);
      setScale(target, animate);
      resetPan();
    },
    [container.width, resetPan, setScale]
  );

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      setContainer({ width, height });
      if (!didFit.current && width) {
        didFit.current = true;
        fitToWidth(width, false);
      }
    },
    [fitToWidth]
  );

  const onPinchEvent = useMemo(
    () => Animated.event([{ nativeEvent: { scale: pinchScale } }], { useNativeDriver: true }),
    [pinchScale]
  );

  const onPinchStateChange = useCallback(
    (event: PinchGestureHandlerStateChangeEvent) => {
      if (event.nativeEvent.oldState === State.ACTIVE) {
        const next = clamp(lastScale.current * event.nativeEvent.scale, MIN_SCALE, MAX_SCALE);
        lastScale.current = next;
        baseScale.setValue(next);
        pinchScale.setValue(1);
      }
    },
    [baseScale, pinchScale]
  );

  const onPanEvent = useMemo(
    () =>
      Animated.event(
        [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
        { useNativeDriver: true }
      ),
    [translateX, translateY]
  );

  const onPanStateChange = useCallback(
    (event: PanGestureHandlerStateChangeEvent) => {
      if (event.nativeEvent.oldState === State.ACTIVE) {
        lastPan.current.x += event.nativeEvent.translationX;
        lastPan.current.y += event.nativeEvent.translationY;
        translateX.setOffset(lastPan.current.x);
        translateX.setValue(0);
        translateY.setOffset(lastPan.current.y);
        translateY.setValue(0);
      }
    },
    [translateX, translateY]
  );

  const zoomIn = useCallback(() => setScale(lastScale.current * ZOOM_STEP), [setScale]);
  const zoomOut = useCallback(() => setScale(lastScale.current / ZOOM_STEP), [setScale]);

  return (
    <View style={styles.root}>
      <PanGestureHandler
        ref={panRef}
        simultaneousHandlers={pinchRef}
        onGestureEvent={onPanEvent}
        onHandlerStateChange={onPanStateChange}
        minPointers={1}
        maxPointers={2}
        avgTouches>
        <Animated.View style={styles.gestureLayer} onLayout={onLayout}>
          <PinchGestureHandler
            ref={pinchRef}
            simultaneousHandlers={panRef}
            onGestureEvent={onPinchEvent}
            onHandlerStateChange={onPinchStateChange}>
            <Animated.View style={styles.viewport}>
              <Animated.View
                style={{
                  transform: [{ translateX }, { translateY }, { scale }],
                }}>
                <BillMemoTemplate data={data} />
              </Animated.View>
            </Animated.View>
          </PinchGestureHandler>
        </Animated.View>
      </PanGestureHandler>

      <View style={styles.toolbar} pointerEvents="box-none">
        <Pressable
          style={styles.fitButton}
          onPress={() => fitToWidth()}
          hitSlop={8}
          accessibilityLabel="Fit to width">
          <Text style={styles.fitButtonText}>Fit width</Text>
        </Pressable>
        <View style={styles.zoomGroup}>
          <Pressable
            style={[styles.zoomButton, styles.zoomButtonLeft]}
            onPress={zoomOut}
            hitSlop={8}
            accessibilityLabel="Zoom out">
            <Text style={styles.zoomButtonText}>{'\u2212'}</Text>
          </Pressable>
          <View style={styles.zoomDivider} />
          <Pressable
            style={[styles.zoomButton, styles.zoomButtonRight]}
            onPress={zoomIn}
            hitSlop={8}
            accessibilityLabel="Zoom in">
            <Text style={styles.zoomButtonText}>+</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  gestureLayer: {
    flex: 1,
  },
  viewport: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbar: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fitButton: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: 'rgba(17,17,17,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fitButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  zoomGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(17,17,17,0.82)',
    overflow: 'hidden',
  },
  zoomButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomButtonLeft: {},
  zoomButtonRight: {},
  zoomDivider: {
    width: StyleSheet.hairlineWidth,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  zoomButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 24,
  },
});
