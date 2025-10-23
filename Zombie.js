import React, { useRef, useEffect, useState } from 'react';
import { Animated, TouchableOpacity, StyleSheet, Image, View } from 'react-native';

// Zombie component: representa un zombie que cae desde arriba hacia abajo.
// Props:
// - x: posición horizontal inicial
// - startY: posición vertical inicial (normalmente -50)
// - endY: posición final (límite inferior)
// - duration: tiempo que tarda en caer
// - onHit: función llamada cuando el usuario toca el zombie
// - id: identificador único para este zombie

// SPRITES entries can be either a direct require(...) or an object { src: require(...), cols, rows }
// Use only the sprite sheets that exist in /assets (avoid requiring missing files that break bundling)
const SPRITES = [
  { src: require('./assets/1ZombieSpriteSheet.png'), cols: 3, rows: 4 },
  { src: require('./assets/2ZombieSpriteSheet.png'), cols: 3, rows: 4 },
  { src: require('./assets/3ZombieSpriteSheet.png'), cols: 3, rows: 4 },
  { src: require('./assets/4ZombieSpriteSheet.png'), cols: 3, rows: 4 },
  { src: require('./assets/5ZombieSpriteSheet.png'), cols: 3, rows: 4 },
  { src: require('./assets/6ZombieSpriteSheet.png'), cols: 3, rows: 4 },
];

export default function Zombie({ x, startY = -80, endY = 700, duration = 4000, onHit, onMiss, id = 0, bomb = null, scaleMultiplier = 1.6, paused = false }) {
  const translateY = useRef(new Animated.Value(startY)).current;
  const translateX = useRef(new Animated.Value(x)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [frameIndex, setFrameIndex] = useState(0);
  const [phase, setPhase] = useState('walk'); // phases: 'walk' | 'side' | 'final'
  const dirRef = useRef(Math.random() > 0.5 ? 1 : -1); // 1 = right, -1 = left

  // Resolve sprite entry (allow metadata overrides)
  const entry = SPRITES[id % SPRITES.length];
  const sprite = entry && entry.src ? entry.src : entry;
  const cols = entry && entry.cols ? entry.cols : 3;
  const rows = entry && entry.rows ? entry.rows : 4;
  const resolved = Image.resolveAssetSource(sprite) || { width: 192, height: 256 };
  const SHEET_COLS = cols;
  const SHEET_ROWS = rows;
  const totalFrames = SHEET_COLS * SHEET_ROWS;
  const frameW = Math.round(resolved.width / SHEET_COLS);
  const frameH = Math.round(resolved.height / SHEET_ROWS);
  const frameWDisplay = Math.round(frameW * scaleMultiplier);
  const frameHDisplay = Math.round(frameH * scaleMultiplier);
  const resolvedW = Math.round(resolved.width * scaleMultiplier);
  const resolvedH = Math.round(resolved.height * scaleMultiplier);

  // track current translateY value so we can report position on hit
  const currentY = useRef(startY);
  const currentX = useRef(x);
  const missedRef = useRef(false);

  useEffect(() => {
    const idListener = translateY.addListener(({ value }) => {
      currentY.current = value;
      try {
        // detect crossing of the visible threshold (78% of endY) and trigger onMiss early
        const thresholdY = (typeof endY === 'number' ? endY : 0) * 0.78;
        if (!missedRef.current && typeof thresholdY === 'number' && value >= thresholdY) {
          missedRef.current = true;
          console.log('[Zombie] crossed threshold for id=', id, 'value=', value, 'thresholdY=', thresholdY);
          onMiss && onMiss(id);
        }
      } catch (e) {}
    });
    // also listen to translateX changes
    const idListenerX = translateX.addListener(({ value }) => {
      currentX.current = value;
    });
    return () => {
      translateY.removeListener(idListener);
      translateX.removeListener(idListenerX);
    };
  }, [translateY]);

    // Listen for bomb events: if bomb is set and this zombie is within radius -> trigger hit
  useEffect(() => {
    if (!bomb) return;
    let intervalId = null;
    // repeatedly check for overlap while bomb is active (handles zombies moving into radius)
    intervalId = setInterval(() => {
      try {
        const currentXVal = typeof currentX.current === 'number' ? currentX.current : x;
        const currentYVal = typeof currentY.current === 'number' ? currentY.current : startY;

        // use display sizes (scaled) to compute center in screen coords
        const centerX = currentXVal + frameWDisplay / 2;
        const centerY = currentYVal + frameHDisplay / 2;

        const dx = centerX - bomb.x;
        const dy = centerY - bomb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= bomb.radius) {
          // mark as hit: cancel interval and animate death
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
          Animated.sequence([
            Animated.timing(scale, { toValue: 1.3, duration: 80, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 0, duration: 160, useNativeDriver: true }),
          ]).start(() => {
            // try to measure the touchable to compute global window coords for slime placement
            if (touchableRef.current && touchableRef.current.measureInWindow) {
              try {
                touchableRef.current.measureInWindow((winX, winY, w, h) => {
                  const globalX = winX + (w || frameWDisplay) / 2;
                  const globalY = winY + (h || frameHDisplay) / 2;
                  onHit && onHit(id, globalX, globalY);
                });
                return;
              } catch (e) {
                // fallthrough to fallback
              }
            }
            // fallback: pass bomb coords (local) if measuring failed
            onHit && onHit(id, bomb.x, bomb.y);
          });
        }
      } catch (e) {
        // ignore any read errors
      }
    }, 50);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [bomb]);

  // ref to touchable to compute absolute coordinates
  const touchableRef = useRef(null);

  // Cycle frames: use only the first row (front-facing) for all phases to keep sprites facing forward.
  useEffect(() => {
    let interval = null;
    let counter = 0;
    const rowStart = 0; // first row
    interval = setInterval(() => {
      counter = (counter + 1) % SHEET_COLS;
      setFrameIndex(rowStart + counter);
    }, 120);
    return () => clearInterval(interval);
  }, [SHEET_COLS]);

  // Implement manual animation loop so we can pause/resume accurately
  const rafRef = useRef(null);
  const lastTick = useRef(0);
  const elapsed = useRef(0);
  const runningRef = useRef(false);

  const totalDistance = endY - startY;

  function stopLoop() {
    runningRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  function tick() {
    const now = Date.now();
    const delta = Math.max(0, now - lastTick.current);
    lastTick.current = now;
    elapsed.current = elapsed.current + delta;
    const progress = Math.min(1, elapsed.current / duration);
    const y = startY + totalDistance * progress;
    translateY.setValue(y);

    if (progress >= 1) {
      if (!missedRef.current) {
        missedRef.current = true;
        try { onMiss && onMiss(id); } catch (e) { console.log('[Zombie] onMiss error', e); }
      }
      stopLoop();
      return;
    }

    // schedule next frame
    if (runningRef.current) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }

  function startLoop() {
    if (runningRef.current) return;
    runningRef.current = true;
    lastTick.current = Date.now();
    rafRef.current = requestAnimationFrame(tick);
  }

  useEffect(() => {
    // initialize
    elapsed.current = 0;
    missedRef.current = false;
    translateY.setValue(startY);
    if (!paused) startLoop();

    return () => {
      stopLoop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startY, endY, duration, x, id]);

  // react to pause changes
  useEffect(() => {
    if (paused) {
      // pause: stop loop but keep elapsed
      stopLoop();
    } else {
      // resume
      startLoop();
    }
  }, [paused]);

  function handleHit(ev) {
    // ev: nativeEvent with locationX/locationY relative to the touch target
    const localX = ev && typeof ev.locationX === 'number' ? ev.locationX : frameWDisplay / 2;
    const localY = ev && typeof ev.locationY === 'number' ? ev.locationY : frameHDisplay / 2;

    // measure absolute position of the touchable container to compute precise global coords
    if (touchableRef.current && touchableRef.current.measureInWindow) {
      try {
        touchableRef.current.measureInWindow((winX, winY, w, h) => {
          // use the center of the touchable so the slime appears centered on the zombie
          const globalX = winX + w / 2;
          const globalY = winY + h / 2;

          // Animación rápida cuando es tocado
          Animated.sequence([
            Animated.timing(scale, { toValue: 1.3, duration: 80, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 0, duration: 160, useNativeDriver: true }),
          ]).start(() => onHit && onHit(id, globalX, globalY));
        });
        return;
      } catch (e) {
        // fallthrough to fallback
        // console.log('measureInWindow failed', e);
      }
    }

  // fallback: approximate using current animated refs and display frame size (center)
  const globalX = (typeof currentX.current === 'number' ? currentX.current : x) + frameWDisplay / 2;
  const globalY = (currentY.current || startY) + frameHDisplay / 2;
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.3, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0, duration: 160, useNativeDriver: true }),
    ]).start(() => onHit && onHit(id, globalX, globalY));
  }

    return (
    <Animated.View
      style={[
        styles.zombie,
        {
          transform: [
            { translateX },
            { translateY },
            { scale },
          ],
        },
      ]}
    >
  <TouchableOpacity ref={touchableRef} activeOpacity={0.8} onPressIn={(e) => handleHit(e.nativeEvent)} style={{ width: frameWDisplay, height: frameHDisplay }}>
        {/* Sprite sheet rendering: container with overflow hides other frames. */}
        <View style={{ width: frameWDisplay, height: frameHDisplay, overflow: 'hidden' }}>
          <Animated.Image
            source={sprite}
            style={{ width: resolvedW, height: resolvedH, transform: [{ translateX: -(frameIndex % SHEET_COLS) * frameW * scaleMultiplier }, { translateY: -Math.floor(frameIndex / SHEET_COLS) * frameH * scaleMultiplier }] }}
            resizeMode="cover"
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  zombie: {
    position: 'absolute',
    width: 64,
    height: 64,
  },
  body: {
    flex: 1,
    backgroundColor: '#8b0000', // marcador temporal (rojo oscuro)
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3b0000',
  },
});
