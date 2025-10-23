import React, { useState, useEffect } from 'react';
import { StatusBar, View, Text, StyleSheet, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MenuScreen from './MenuScreen';
import GameScreen from './GameScreen';
import HelpModal from './HelpModal';
import HighScoreScreen from './HighScoreScreen';

export default function App() {
  const [screen, setScreen] = useState('menu'); // 'menu' | 'game'
  const [initialProps, setInitialProps] = useState({});
  const [showHelp, setShowHelp] = useState(false);
  const [highScore, setHighScore] = useState(null);
  const [bestBeforeFirstDeath, setBestBeforeFirstDeath] = useState(null);
  const [justUpdatedHigh, setJustUpdatedHigh] = useState(false);

  useEffect(() => {
    // cargar high score desde AsyncStorage
    let mounted = true;
    async function load() {
      try {
        const val = await AsyncStorage.getItem('@apoca_highscore');
        const val2 = await AsyncStorage.getItem('@apoca_best_before_first_death');
        if (!mounted) return;
        if (val !== null) setHighScore(parseInt(val, 10));
        if (val2 !== null) setBestBeforeFirstDeath(parseInt(val2, 10));
      } catch (e) {
        console.log('Failed loading high score', e && e.message ? e.message : e);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  async function handleGameEnd(results) {
    try {
      // results: { score, killsBeforeFirstDeath }
      const finalScore = typeof results === 'object' && typeof results.score === 'number' ? results.score : (typeof results === 'number' ? results : null);
      const kBefore = typeof results === 'object' && typeof results.killsBeforeFirstDeath === 'number' ? results.killsBeforeFirstDeath : null;
      if (typeof finalScore === 'number' && (highScore === null || finalScore > highScore)) {
        await AsyncStorage.setItem('@apoca_highscore', String(finalScore));
        setHighScore(finalScore);
        setJustUpdatedHigh(true);
        setTimeout(() => setJustUpdatedHigh(false), 3000);
      }
      if (typeof kBefore === 'number' && (bestBeforeFirstDeath === null || kBefore > bestBeforeFirstDeath)) {
        await AsyncStorage.setItem('@apoca_best_before_first_death', String(kBefore));
        setBestBeforeFirstDeath(kBefore);
      }
    } catch (e) {
      console.log('Failed saving high score', e && e.message ? e.message : e);
    }
  }

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <View style={styles.header}>
        <Text style={styles.headerText}>APOCALIPSIS TAP — {screen === 'menu' ? 'MENU' : 'GAME'}</Text>
      </View>
      {screen === 'menu' && (
        <MenuScreen
          onPlay={() => setScreen('game')}
          onHelp={() => setShowHelp(true)}
          onHighScore={() => setScreen('highscore')}
          onSettings={() => setScreen('settings')}
          highScore={highScore}
          justUpdatedHigh={justUpdatedHigh}
          bestBeforeFirstDeath={bestBeforeFirstDeath}
        />
      )}

      <HelpModal visible={showHelp} onClose={() => setShowHelp(false)} />

      {screen === 'game' && (
        <GameScreen
          onExitToMenu={() => setScreen('menu')}
          onGameEnd={(score) => handleGameEnd(score)}
        />
      )}

      {/* settings screen removed per user request */}

      {screen === 'highscore' && (
        <HighScoreScreen highScore={highScore} bestBeforeFirstDeath={bestBeforeFirstDeath} onBack={() => setScreen('menu')} onReset={async () => {
          try { await AsyncStorage.removeItem('@apoca_highscore'); await AsyncStorage.removeItem('@apoca_best_before_first_death'); setHighScore(null); setBestBeforeFirstDeath(null); } catch (e) { console.log('reset hs err', e); }
        }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, ...(Platform.OS === 'web' ? { minHeight: '100vh' } : {}), backgroundColor: '#101216' },
  header: { height: 56, alignItems: 'center', justifyContent: 'center', backgroundColor: '#07080a' },
  headerText: { color: '#7dfcfc', fontWeight: '700' },
});
