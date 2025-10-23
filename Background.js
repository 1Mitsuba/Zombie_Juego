import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function Background({ children }) {
  // Simple decorative particles as absolute positioned views
  const particles = Array.from({ length: 8 }).map((_, i) => {
    const size = 30 + Math.floor(Math.random() * 80);
    const left = Math.floor(Math.random() * (width - size));
    const top = Math.floor(Math.random() * (height - size));
    const opacity = 0.05 + Math.random() * 0.12;
    const bg = i % 2 === 0 ? 'rgba(125,252,252,0.12)' : 'rgba(80,140,180,0.08)';
    return <View key={i} style={[styles.particle, { width: size, height: size, left, top, backgroundColor: bg, opacity }]} />;
  });

  return (
    <View style={styles.container} pointerEvents="box-none">
      <LinearGradient
        colors={["#07080a", "#0f1113", "#121316"]}
        start={[0, 0]}
        end={[0, 1]}
        style={styles.gradient}
      />
      {particles}
      <View style={styles.children} pointerEvents="box-none">{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  particle: { position: 'absolute', borderRadius: 999, zIndex: 0 },
  children: { position: 'relative', zIndex: 2, flex: 1 },
});
