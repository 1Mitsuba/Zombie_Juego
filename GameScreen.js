import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Platform, Image, Pressable } from 'react-native';
import Background from './Background';
// Audio
import { Audio } from 'expo-av';
import Zombie from './Zombie';
import PauseModal from './PauseModal';
import LevelClearModal from './LevelClearModal';
import GameOverModal from './GameOverModal';

const { width, height } = Dimensions.get('window');

export default function GameScreen({ onExitToMenu, onGameEnd }) {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [killsBeforeFirstDeath, setKillsBeforeFirstDeath] = useState(0);
  const [zombies, setZombies] = useState([]); // lista de zombies activos {id,x,startTime,duration}
  const [playing, setPlaying] = useState(true);
  const [paused, setPaused] = useState(false);
  const [showLevelClear, setShowLevelClear] = useState(false);
  const [slime, setSlime] = useState(null); // { x, y, id }
  const [bombMode, setBombMode] = useState(false);
  const [bomb, setBomb] = useState(null); // placed bomb visual (before explosion)
  const [activeBomb, setActiveBomb] = useState(null); // explosion event passed to zombies
  const [bombCount, setBombCount] = useState(1);
  const [meatCount, setMeatCount] = useState(0);
  // Lightning (rayo) power: inicia en 10, se consume por uso y se recarga una unidad cada 2 minutos (120000 ms)
  const [lightningCount, setLightningCount] = useState(10);
  const lightningMax = 10;
  const lightningRefillMs = 120000; // 2 minutes
  const lightningTimerRef = useRef(null);
  const [lightningProgress, setLightningProgress] = useState(0); // 0..1 progress to next unit
  const [pickups, setPickups] = useState([]); // { id, x, y, type }
  const [hitLine, setHitLine] = useState(false);
  // store sound objects plus a loaded flag
  const soundRefs = useRef({ hit: { sound: null, loaded: false }, miss: { sound: null, loaded: false }, music: { sound: null, loaded: false }, explosion: { sound: null, loaded: false } });

  const nextZombieId = useRef(1);
  const spawnInterval = useRef(null);
  const playAreaRef = useRef(null);

  // Start a refill timer that increments progress towards next lightning charge
  useEffect(() => {
    // clear existing timer
    if (lightningTimerRef.current) {
      clearInterval(lightningTimerRef.current);
      lightningTimerRef.current = null;
    }

    // if full, no progress required
    if (lightningCount >= lightningMax) {
      setLightningProgress(0);
      return;
    }

    const start = Date.now();
    lightningTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(1, elapsed / lightningRefillMs);
      setLightningProgress(p);
      if (p >= 1) {
        setLightningCount((c) => Math.min(lightningMax, c + 1));
        // restart timer for next unit if still not full
        clearInterval(lightningTimerRef.current);
        lightningTimerRef.current = null;
      }
    }, 1000);

    return () => {
      if (lightningTimerRef.current) {
        clearInterval(lightningTimerRef.current);
        lightningTimerRef.current = null;
      }
    };
  }, [lightningCount]);

  function useLightning() {
    // consume one lightning if available
    if (lightningCount <= 0) return false;
    setLightningCount((c) => Math.max(0, c - 1));
    // start refill progress immediately
    setLightningProgress(0);
    // ensure effect re-runs by updating lightningCount above
    return true;
  }

  useEffect(() => {
    startSpawning();
    return () => stopSpawning();
  }, [level, paused]);

  // Load audio assets (if present in assets folder). If files missing, try/catch prevents crash.
  useEffect(() => {
    let mounted = true;
    async function loadSounds() {
      // Try local assets first; if missing, fall back to remote URIs (CC0/example placeholders)
      const remote = {
        hit: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_3d6f3b4b2d.mp3?filename=pop-4-110568.mp3',
        miss: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_2b3f6b7f4d.mp3?filename=error-2-110571.mp3',
        music: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_9b1f8e3c2a.mp3?filename=arcade-bleeps-110569.mp3',
      };

  // create sound instances using wrapper (prefers expo-audio if available)
  // If createSound() returns null, provide a safe stub that implements the same async API
  // Use expo-av Audio.Sound directly to ensure playback of local files
  const hit = new Audio.Sound();
  const miss = new Audio.Sound();
  const music = new Audio.Sound();

      // try local filenames for hit only (no remote fallback) to avoid 403 logs
      // Prefer Slime.wav for hit if present (user requested using slime sound)
      try {
        console.log('Trying to load hit from ./assets/Slime.wav (preferred)');
        await hit.loadAsync(require('./assets/Slime.wav'));
        try { await hit.setVolumeAsync(1.0); } catch (v) {}
        soundRefs.current.hit = { sound: hit, loaded: true };
        console.log('Hit loaded OK (Slime.wav)');
      } catch (sErr) {
        // fallback to original sfx_hit.wav
        try {
          console.log('Slime.wav not available, trying sfx_hit.wav');
          await hit.loadAsync(require('./assets/sfx_hit.wav'));
          try { await hit.setVolumeAsync(1.0); } catch (v) {}
          soundRefs.current.hit = { sound: hit, loaded: true };
          console.log('Hit loaded OK (sfx_hit.wav)');
        } catch (e1) {
          console.log('Error loading sfx_hit.wav:', e1 && e1.message ? e1.message : e1);
          try {
            console.log('Trying to load hit from ./assets/hit.wav');
            await hit.loadAsync(require('./assets/hit.wav'));
            try { await hit.setVolumeAsync(1.0); } catch (v) {}
            soundRefs.current.hit = { sound: hit, loaded: true };
            console.log('Hit loaded OK (hit.wav)');
          } catch (e2) {
            console.log('Error loading hit.wav:', e2 && e2.message ? e2.message : e2);
            console.log('Hit sound not found locally (tried Slime.wav, sfx_hit.wav, hit.wav). Please add a local SFX in assets.');
            soundRefs.current.hit = { sound: null, loaded: false };
          }
        }
      }

      // try local filenames for miss only (no remote fallback)
      try {
        console.log('Trying to load miss from ./assets/sfx_miss.wav');
        await miss.loadAsync(require('./assets/sfx_miss.wav'));
        soundRefs.current.miss = { sound: miss, loaded: true };
  try { await miss.setVolumeAsync(1.0); } catch (v) {}
  console.log('Miss loaded OK');
      } catch (e1) {
        try {
          console.log('Trying to load miss from ./assets/miss.wav');
          await miss.loadAsync(require('./assets/miss.wav'));
          soundRefs.current.miss = { sound: miss, loaded: true };
          console.log('Miss loaded OK (miss.wav)');
        } catch (e2) {
          console.log('Miss sound not found locally (tried sfx_miss.wav, miss.wav). Please add a local SFX in assets.');
          soundRefs.current.miss = { sound: null, loaded: false };
        }
      }

      // try several candidate local filenames for music (mp3, wav)
      try {
        await music.loadAsync(require('./assets/music_loop.mp3'));
        soundRefs.current.music = { sound: music, loaded: true };
      } catch (e1) {
        try {
          await music.loadAsync(require('./assets/music_loop.wav'));
          soundRefs.current.music = { sound: music, loaded: true };
        } catch (e2) {
          try {
            await music.loadAsync({ uri: remote.music });
            soundRefs.current.music = { sound: music, loaded: true };
          } catch (err) {
            console.log('Failed loading music remote/local', err.message || err);
            soundRefs.current.music = { sound: null, loaded: false };
          }
        }
      }

      try {
        await music.setIsLoopingAsync(true);
      } catch (er) {
        // ignore if not supported by loaded source
      }

      // try to load explosion SFX if present
      try {
        const ex = new Audio.Sound();
        console.log('Trying to load explosion from ./assets/sfx_explosion.wav');
        await ex.loadAsync(require('./assets/sfx_explosion.wav'));
        try { await ex.setVolumeAsync(1.0); } catch (v) {}
        soundRefs.current.explosion = { sound: ex, loaded: true };
        console.log('Explosion SFX loaded');
      } catch (e) {
        console.log('Explosion SFX not found or failed to load:', e && e.message ? e.message : e);
        soundRefs.current.explosion = { sound: null, loaded: false };
      }

      if (!mounted) return;
      // ensure refs remain consistent if not explicitly set above
      soundRefs.current.hit = soundRefs.current.hit || { sound: null, loaded: false };
      soundRefs.current.miss = soundRefs.current.miss || { sound: null, loaded: false };
      soundRefs.current.music = soundRefs.current.music || { sound: null, loaded: false };
      music.setVolumeAsync(0.2);
      try {
        if (soundRefs.current.music.loaded && soundRefs.current.music.sound) {
          soundRefs.current.music.sound.playAsync();
        }
      } catch (er) {
        // autoplay may be blocked in some environments
      }
    }
    loadSounds();

    return () => {
      mounted = false;
      const s = soundRefs.current;
      try {
        if (s.hit && s.hit.sound && s.hit.sound.unloadAsync) s.hit.sound.unloadAsync();
      } catch (e) {
        // ignore
      }
      try {
        if (s.miss && s.miss.sound && s.miss.sound.unloadAsync) s.miss.sound.unloadAsync();
      } catch (e) {
        // ignore
      }
      try {
        if (s.music && s.music.sound && s.music.sound.unloadAsync) s.music.sound.unloadAsync();
      } catch (e) {
        // ignore
      }
      try {
        if (s.explosion && s.explosion.sound && s.explosion.sound.unloadAsync) s.explosion.sound.unloadAsync();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  useEffect(() => {
    // Si lives llega a 0 -> Game Over
    if (lives <= 0) {
      setPlaying(false);
      // No poner paused = true aquí para evitar que aparezca el modal de PAUSE momentáneamente
      setPaused(false);
      stopSpawning();
      // clear remaining entities so they don't trigger further misses
      setZombies([]);
      setPickups([]);
      setBomb(null);
      setActiveBomb(null);
      // mostrar Game Over después de un pequeño retardo (rápido) para dar tiempo a limpiar
      setTimeout(() => setShowGameOver(true), 120);
    }
  }, [lives]);

  const [showGameOver, setShowGameOver] = useState(false);
  const reportedRef = useRef(false);
  const hadFirstDeathRef = useRef(false);

  function handleGameRestart() {
    // al reiniciar desde Game Over, consumir una carga de rayo por intento (si hay)
    setShowGameOver(false);
    setLightningCount((c) => {
      if (c > 0) {
        console.log('[GameScreen] consume lightning on retry, before=', c);
        return c - 1;
      }
      console.log('[GameScreen] no lightning to consume on retry');
      return 0;
    });
    // onRestart reinicia estado de juego (score, level, lives, zombies)
    onRestart();
  }

  function handleGameMenu() {
    setShowGameOver(false);
    onExitToMenu();
  }

  // cuando showGameOver se active, reportar el score al padre (solo 1 vez)
  useEffect(() => {
    if (showGameOver && !reportedRef.current) {
      reportedRef.current = true;
      try {
        if (typeof onGameEnd === 'function') onGameEnd({ score, killsBeforeFirstDeath });
      } catch (e) {}
    }
    if (!showGameOver) reportedRef.current = false;
  }, [showGameOver]);

  useEffect(() => {
    // ejemplo sencillo: si llegamos a 10 puntos, nivel clear
    if (score > 0 && score % 10 === 0) {
      // detener juego y mostrar Level Clear
      setShowLevelClear(true);
      setPaused(true);
      setPlaying(false);
    }
  }, [score]);

  function startSpawning() {
    if (paused) return;
    stopSpawning();
    // la velocidad de aparición depende del nivel
    // base spawnRate disminuye con el nivel. Nivel alto -> más rápidos y más por aparición
    const baseRate = Math.max(450, 1800 - level * 120); // ms entre tick
    const speedDuration = Math.max(900, 4200 - level * 220); // tiempo de caída base

    spawnInterval.current = setInterval(() => {
      // spawn multiple zombies per tick dependiendo del nivel
      const multi = level >= 8 ? 3 : level >= 5 ? 2 : 1;
      for (let i = 0; i < multi; i++) {
        const id = nextZombieId.current++;
        const x = Math.random() * (width - 64);
        // small random variance to duration
        const duration = Math.max(600, speedDuration + Math.floor(Math.random() * 400) - 200);
        setZombies((z) => [...z, { id, x, duration }]);
      }

      // limpiar zombies viejos ocasionalmente
      setZombies((items) => items.slice(-40));
    }, baseRate);
  }

  function stopSpawning() {
    if (spawnInterval.current) {
      clearInterval(spawnInterval.current);
      spawnInterval.current = null;
    }
  }

  function handleZombieHit(id, gx, gy) {
    // quitar zombie
    setZombies((z) => z.filter((item) => item.id !== id));
    setScore((s) => s + 1);
    // use provided global coordinates for slime
    if (typeof gx === 'number' && typeof gy === 'number') {
      // convert global/window coords to playArea-local coords so slime aligns correctly
      try {
        if (playAreaRef.current && playAreaRef.current.measureInWindow) {
          playAreaRef.current.measureInWindow((wx, wy) => {
            const localX = gx - wx;
            const localY = gy - wy;
            const slimeOffset = Math.round(Math.min(72, height * 0.09));
            setSlime({ x: localX, y: localY + slimeOffset, id });
            setTimeout(() => setSlime(null), 700);
          });
        } else {
          const slimeOffset = Math.round(Math.min(72, height * 0.09));
          setSlime({ x: gx, y: gy + slimeOffset, id });
          setTimeout(() => setSlime(null), 700);
        }
      } catch (e) {
        // fallback
  const slimeOffset = Math.round(Math.min(72, height * 0.09));
  setSlime({ x: gx, y: gy + slimeOffset, id });
        setTimeout(() => setSlime(null), 700);
      }
    }
    // play hit sfx
    try {
      const s = soundRefs.current && soundRefs.current.hit;
      console.log('Attempting to play hit sfx, loaded=', s ? s.loaded : 'no-s');
      if (s && s.loaded && s.sound) {
        const sound = s.sound;
        console.log('Playing hit sound...');
        if (sound.replayAsync) {
          sound.replayAsync().catch((err) => console.log('hit replay error', err && err.message ? err.message : err));
        } else {
          sound.stopAsync().then(() => sound.setPositionAsync(0)).then(() => sound.playAsync()).catch((err) => console.log('hit play error', err && err.message ? err.message : err));
        }
      } else {
        console.log('Hit sound not available to play');
      }
    } catch (e) {
      console.log('play hit error', e.message || e);
    }
    // aumentar carne por cada zombie muerto
    try { addMeat(1); } catch (e) {}
    // contar kills antes de la primera muerte
    try {
      if (!hadFirstDeathRef.current) setKillsBeforeFirstDeath((k) => k + 1);
    } catch (e) {}
  }

  // incrementar carne cuando matas un zombie
  function addMeat(amount = 1) {
    setMeatCount((m) => Math.max(0, m + amount));
  }

  function handleZombieMiss(id) {
    // si un zombie llega abajo
    console.log('[GameScreen] handleZombieMiss called for id=', id, ' current zombies=', zombies.length);
    setZombies((z) => z.filter((item) => item.id !== id));
    setLives((l) => {
      if (l <= 0) {
        console.log('[GameScreen] lives already 0, ignoring further miss for id=', id);
        return 0;
      }
      console.log('[GameScreen] lives before decrement =', l);
      const nl = Math.max(0, l - 1);
      console.log('[GameScreen] lives after decrement =', nl);
      // marcar que ya tuvimos la primera muerte
      try { hadFirstDeathRef.current = true; } catch (e) {}
      return nl;
    });
    // pulse the threshold line to show life lost
    setHitLine(true);
    setTimeout(() => setHitLine(false), 400);
    try {
      const s = soundRefs.current && soundRefs.current.miss;
      console.log('Attempting to play miss sfx, loaded=', s ? s.loaded : 'no-s');
      if (s && s.loaded && s.sound) {
        const sound = s.sound;
        console.log('Playing miss sound...');
        if (sound.replayAsync) {
          sound.replayAsync().catch((err) => console.log('miss replay error', err && err.message ? err.message : err));
        } else {
          sound.stopAsync().then(() => sound.setPositionAsync(0)).then(() => sound.playAsync()).catch((err) => console.log('miss play error', err && err.message ? err.message : err));
        }
      } else {
        console.log('Miss sound not available to play');
      }
    } catch (e) {
      console.log('play miss error', e.message || e);
    }
  }

  function onPause() {
    setPaused(true);
    setPlaying(false);
    stopSpawning();
  }

  function onResume() {
    setPaused(false);
    setPlaying(true);
    setShowLevelClear(false);
    startSpawning();
  }

  function onRestart() {
    setScore(0);
    setLevel(1);
    setLives(3);
    setZombies([]);
    setPaused(false);
    setPlaying(true);
    setShowLevelClear(false);
    // reset meat counter on restart
    setMeatCount(0);
    startSpawning();
  }

  // Bomb (grenade) logic: toggle bombMode, then player taps screen to detonate
  function toggleBombMode() {
    setBombMode((b) => !b);
  }

  function handleBombDropAt(x, y) {
    if (bombCount <= 0) {
      // nothing to throw
      console.log('No bombs available');
      setBombMode(false);
      return;
    }

    // consume one
    setBombCount((c) => Math.max(0, c - 1));
    setBombMode(false);

  // apply small downward offset so the bomb appears where the user expects (slightly lower)
  const downward = Math.round(Math.min(80, height * 0.07));
  const placed = { id: Date.now(), x, y: y + downward };
    setBomb(placed);

    // after small delay, trigger explosion (activeBomb) which zombies listen to
    const radius = Math.round(Math.min(width, height) * 0.18); // explosion radius
      setTimeout(() => {
      // show explosion visual briefly by using activeBomb
      const explosion = { id: placed.id, x: placed.x, y: placed.y, radius };
      setActiveBomb(explosion);
      // clear placed visual
      setBomb(null);

      // cleanup activeBomb after short window so zombies can react
      setTimeout(() => setActiveBomb(null), 250);
  // extend activeBomb window slightly to catch late-arriving zombies
  // (clear after 400ms total)
  // Note: the setActiveBomb(null) above clears after 250ms; schedule a backup to ensure 400ms max
  setTimeout(() => setActiveBomb(null), 400);

      // play explosion/hit sound if available
        try {
          const ex = soundRefs.current && soundRefs.current.explosion;
          if (ex && ex.loaded && ex.sound) {
            const sx = ex.sound;
            if (sx.replayAsync) sx.replayAsync().catch(() => {});
            else sx.stopAsync().then(() => sx.setPositionAsync(0)).then(() => sx.playAsync()).catch(() => {});
          } else {
            // fallback to hit sound if explosion not present
            const s = soundRefs.current && soundRefs.current.hit;
            if (s && s.loaded && s.sound) {
              const sound = s.sound;
              if (sound.replayAsync) sound.replayAsync().catch(() => {});
              else sound.stopAsync().then(() => sound.setPositionAsync(0)).then(() => sound.playAsync()).catch(() => {});
            }
          }
        } catch (e) {}
    }, 600);
  }

  // Spawn pickups occasionally: bombs appear on screen to collect
  useEffect(() => {
    const pickupInterval = setInterval(() => {
      // small chance to spawn (e.g., 12% every interval)
      if (Math.random() < 0.12) {
        const id = Date.now() + Math.floor(Math.random() * 1000);
        const px = Math.random() * (width - 64) + 32;
        const py = 120 + Math.random() * (height - 300);
        setPickups((p) => [...p, { id, x: px, y: py, type: 'bomb' }]);
        // auto-remove after 10s
        setTimeout(() => setPickups((p) => p.filter((pp) => pp.id !== id)), 10000);
      }
    }, 3000);
    return () => clearInterval(pickupInterval);
  }, []);

  function collectPickup(id, type) {
    setPickups((p) => p.filter((pp) => pp.id !== id));
    if (type === 'bomb') {
      setBombCount((c) => c + 1);
    }
  }

  return (
    <Background>
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.level}>Level {level}</Text>
          <Text style={styles.score}>SCORE: {score}</Text>
        </View>

        <View style={styles.topRight}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {Array.from({ length: lives }).map((_, i) => (
              <Image key={i} source={require('./assets/Corazon.png')} style={styles.heartImg} />
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.pauseBtn} onPress={onPause}>
        <Image source={require('./assets/Pausa.png')} style={styles.pauseImg} />
      </TouchableOpacity>

      {/* Fallback para web: Modal a veces no se muestra correctamente en react-native-web,
          así que renderizamos un overlay inline cuando estamos en web y 'paused' es true */}
      {Platform.OS === 'web' && paused && !showLevelClear && (
        <View style={styles.webOverlay} pointerEvents="box-none">
          <View style={styles.webBox}>
            <Text style={styles.title}>PAUSE</Text>
            <View style={styles.row}>
              <TouchableOpacity style={styles.actionBtn} onPress={onResume}>
                <Text style={styles.actionText}>RESUME</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={onRestart}>
                <Text style={styles.actionText}>RESTART</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => onExitToMenu()}>
                <Text style={styles.actionText}>MENU</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <View style={styles.playArea} ref={playAreaRef}>
        {/* Threshold line: when zombies cross this Y they count as missed */}
        <View style={[styles.threshold, hitLine ? styles.thresholdPulse : null]} pointerEvents="none" />
        {zombies.map((z) => (
          <Zombie
            key={z.id}
            id={z.id}
            x={z.x}
            duration={z.duration}
            endY={height}
            bomb={activeBomb}
            paused={paused}
            onHit={(id, gx, gy) => handleZombieHit(id, gx, gy)}
            onMiss={(id) => handleZombieMiss(id)}
          />
        ))}

        {/* UI lateral de power-ups (iconos desde assets) */}
        <View style={styles.powerPanel}>
          <View style={styles.powerRow}>
            <Image source={require('./assets/Carne.png')} style={styles.powerIcon} />
            <Text style={styles.power}> x{meatCount}</Text>
          </View>
          <View style={styles.powerRow}>
            <Image source={require('./assets/Rayo.png')} style={styles.powerIcon} />
            <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <Text style={styles.power}> x{lightningCount}</Text>
              {/* progress bar and label under the lightning icon */}
              {lightningCount < lightningMax && (
                <View style={{ marginTop: 4, width: 42 }}>
                  <View style={styles.lightProgressBg}>
                    <View style={[styles.lightProgressFill, { width: `${Math.round(lightningProgress * 100)}%` }]} />
                  </View>
                  <Text style={styles.lightProgressText}>{Math.max(0, Math.ceil((1 - lightningProgress) * (lightningRefillMs / 1000)))}s</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.powerRow}>
            <Image source={require('./assets/Granada.png')} style={styles.powerIcon} />
            <Text style={styles.power}> x{bombCount}</Text>
          </View>
        </View>
        {/* Bomb button: single large button to enter aiming mode */}
        <View style={styles.bombPanel} pointerEvents="box-none">
          <TouchableOpacity
            style={[styles.bombBtn, bombMode ? styles.bombBtnActive : null]}
            onPress={toggleBombMode}
            activeOpacity={0.8}
          >
            <Image source={require('./assets/Granada.png')} style={styles.bombImg} />
          </TouchableOpacity>
        </View>
        {/* When in bombMode, capture taps on the play area to detonate. This overlay will sit above zombies
            so player can choose where to throw the bomb. */}
        {bombMode && (
          <Pressable
            style={styles.aimOverlay}
            onPress={(e) => {
              const ev = e && e.nativeEvent ? e.nativeEvent : {};
              // Prefer locationX/locationY relative to the pressable; if pageX/pageY present, convert to playArea coords
              if (playAreaRef.current && typeof ev.pageX === 'number' && typeof ev.pageY === 'number') {
                try {
                  playAreaRef.current.measureInWindow((wx, wy) => {
                    const relX = ev.pageX - wx;
                    const relY = ev.pageY - wy;
                    handleBombDropAt(relX, relY);
                  });
                } catch (err) {
                  const px = typeof ev.locationX === 'number' ? ev.locationX : width / 2;
                  const py = typeof ev.locationY === 'number' ? ev.locationY : height / 2;
                  handleBombDropAt(px, py);
                }
              } else {
                const px = typeof ev.locationX === 'number' ? ev.locationX : width / 2;
                const py = typeof ev.locationY === 'number' ? ev.locationY : height / 2;
                handleBombDropAt(px, py);
              }
            }}
          >
            <View style={styles.aimHint} pointerEvents="none">
              <Text style={{ color: '#fff', fontWeight: '700' }}>Toca para lanzar la bomba</Text>
            </View>
          </Pressable>
        )}
      </View>
      {/* Slime effect on hit */}
      {slime && (
        <Image source={require('./assets/Slime.png')} style={[styles.slime, { left: slime.x, top: slime.y }]} />
      )}

      {/* Bomb explosion visual (use same grenade image as requested) */}
      {bomb && (
        <Image source={require('./assets/Granada.png')} style={[styles.bombVisual, { left: bomb.x - 20, top: bomb.y - 20, transform: [{ scale: 1.1 }] }]} />
      )}

      {/* explosion visual (use Slime as splash) */}
      {activeBomb && (
        <Image source={require('./assets/Slime.png')} style={[styles.explosionVisual, { left: activeBomb.x - activeBomb.radius, top: activeBomb.y - activeBomb.radius, width: activeBomb.radius * 2, height: activeBomb.radius * 2 }]} />
      )}

      {/* pickups rendering (bomb pickups) */}
      {pickups.map((p) => (
        <TouchableOpacity key={p.id} style={[styles.pickup, { left: p.x - 18, top: p.y - 18 }]} onPress={() => collectPickup(p.id, p.type)}>
          <Image source={require('./assets/Granada.png')} style={{ width: 36, height: 36, resizeMode: 'contain' }} />
        </TouchableOpacity>
      ))}
        {/* Mostrar PauseModal solo si estamos en pausa y NO es Game Over ni Level Clear */}
        <PauseModal
          visible={paused && !showLevelClear && !showGameOver}
          onResume={onResume}
          onRestart={onRestart}
          onMenu={() => onExitToMenu()}
        />

        <LevelClearModal
          visible={showLevelClear}
          score={score}
          onMenu={() => onExitToMenu()}
          onRestart={onRestart}
          onNext={() => {
            setLevel((l) => l + 1);
            setShowLevelClear(false);
            setPaused(false);
            setPlaying(true);
            startSpawning();
          }}
        />
        {/* Game Over modal: solo dos opciones (Restart, Menu) */}
  <GameOverModal visible={showGameOver} onRestart={handleGameRestart} onMenu={handleGameMenu} />
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101216',
  },
  topBar: {
    paddingTop: 24,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  level: {
    color: '#7dfcfc',
    fontWeight: '900',
    fontSize: 16,
  },
  score: {
    color: '#fff',
    fontWeight: '700',
  },
  topRight: {
    alignItems: 'flex-end',
  },
  lives: {
    fontSize: 18,
  },
  heartImg: {
    width: 22,
    height: 22,
    marginLeft: 6,
    resizeMode: 'contain',
  },
  pauseImg: {
    width: 34,
    height: 34,
    resizeMode: 'contain',
  },
  pauseBtn: {
    position: 'absolute',
    left: 12,
    top: 84, // movido más abajo
    padding: 14,
    width: 64,
    height: 64,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    zIndex: 50,
  },
  pauseIcon: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  playArea: {
    flex: 1,
    overflow: 'hidden',
  },
  powerPanel: {
    position: 'absolute',
    right: 8,
    top: 120,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 8,
    borderRadius: 8,
  },
  powerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  powerIcon: {
    width: 26,
    height: 26,
    marginRight: 6,
    resizeMode: 'contain',
  },
  power: {
    color: '#fff',
    marginVertical: 4,
  },
  lightProgressBg: {
    width: 40,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  lightProgressFill: {
    height: 6,
    backgroundColor: 'rgba(120,200,255,0.9)',
  },
  lightProgressText: {
    color: '#9fbfdc',
    fontSize: 10,
    marginTop: 2,
  },
  bombPanel: {
    position: 'absolute',
    left: 12,
    top: 120,
    zIndex: 60,
  },
  bombBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  bombBtnActive: {
    backgroundColor: 'rgba(255,80,80,0.16)',
  },
  bombImg: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
  },
  aimOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aimHint: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 8,
  },
  bombVisual: {
    position: 'absolute',
    width: 40,
    height: 40,
    resizeMode: 'contain',
    zIndex: 70,
  },
  explosionVisual: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.95,
    zIndex: 90,
  },
  pickup: {
    position: 'absolute',
    width: 36,
    height: 36,
    zIndex: 70,
  },
  slime: {
    position: 'absolute',
    width: 88,
    height: 88,
    resizeMode: 'contain',
    transform: [{ translateX: -44 }, { translateY: -44 }],
  },
  threshold: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: 'rgba(0,200,80,0.15)',
    top: '78%',
    zIndex: 40,
  },
  thresholdPulse: {
    backgroundColor: 'rgba(0,200,80,0.35)',
    height: 10,
    shadowColor: '#0f0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  debugPanel: {
    position: 'absolute',
    left: 12,
    bottom: 20,
    flexDirection: 'row',
    gap: 8,
  },
  debugBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  debugText: {
    color: '#fff',
    fontSize: 12,
  },
  webOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 100,
  },
  webBox: {
    width: '80%',
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
});
