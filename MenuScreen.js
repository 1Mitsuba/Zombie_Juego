import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Background from './Background';

export default function MenuScreen({ onPlay, onHelp, onHighScore, highScore, justUpdatedHigh, bestBeforeFirstDeath }) {
  return (
    <Background>
    <View style={styles.container}>
      {/* Tarjeta visible para debugging en web */}
      <View style={styles.card}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>APOCALIPSIS</Text>
          <Text style={[styles.logo, styles.logoAccent]}>TAP</Text>
        </View>

        {/* High Score and best streak hidden from menu by user request. Use the HIGH SCORE button to view details. */}

        <Text style={styles.shortHelp}>Rayo = reintentos (se gastan al reiniciar). Carne = zombies matados.</Text>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.btn} onPress={onPlay}>
            <Text style={styles.btnText}>PLAY</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={onHelp}>
            <Text style={styles.btnText}>HELP</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={onHighScore}>
            <Text style={styles.btnText}>HIGH SCORE</Text>
          </TouchableOpacity>

          {/* Settings removed by user request */}
        </View>
      </View>

      {/* footer icons removed */}
    </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101216',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 48,
    color: '#fff',
    fontWeight: '900',
    // Usar textShadow en web, y textShadow* en natvie
    ...(Platform.OS === 'web'
      ? { textShadow: '0px 0px 8px #0ff' }
      : { textShadowColor: '#0ff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 }),
  },
  logoAccent: {
    fontSize: 60,
    color: '#7dfcfc',
  },
  buttons: {
    width: '100%',
    alignItems: 'center',
  },
  btn: {
    backgroundColor: '#1f1f1f',
    width: '80%',
    paddingVertical: 16,
    marginVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  btnText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  card: {
    width: 360,
    height: '78%',
    backgroundColor: '#22262b',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderWidth: 2,
    borderColor: '#3b3b3b',
  },
  bottomIcons: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    flexDirection: 'row',
  },
  icon: {
    fontSize: 24,
    marginLeft: 10,
  },
  iconSpacing: {
    marginLeft: 6,
  },
  high: {
    color: '#fff',
    fontWeight: '800',
    marginBottom: 8,
  },
  shortHelp: {
    color: '#cfe',
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  updateBanner: {
    backgroundColor: '#143',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  updateText: { color: '#cfffcc', fontWeight: '800' },
  small: { color: '#dfe', fontSize: 12, marginBottom: 10 },
});
