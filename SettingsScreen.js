import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';

export default function SettingsScreen({ onBack }) {
  const [musicEnabled, setMusicEnabled] = React.useState(true);
  const [sfxEnabled, setSfxEnabled] = React.useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Music</Text>
        <Switch value={musicEnabled} onValueChange={setMusicEnabled} />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>SFX</Text>
        <Switch value={sfxEnabled} onValueChange={setSfxEnabled} />
      </View>

      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101216', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { color: '#7dfcfc', fontSize: 22, fontWeight: '800', marginBottom: 24 },
  row: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
  label: { color: '#fff', fontSize: 16 },
  backBtn: { marginTop: 28, backgroundColor: '#222', paddingVertical: 12, paddingHorizontal: 22, borderRadius: 8 },
  backText: { color: '#fff', fontWeight: '700' },
});
