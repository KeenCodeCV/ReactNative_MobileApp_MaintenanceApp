// src/components/Screen.js
import React from 'react';
import { StatusBar, Platform, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';

export default function Screen({ children, style, contentStyle }) {
  const top = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
  return (
    <SafeAreaView style={styles.root}>
      <Animatable.View
        animation="fadeIn"
        duration={300}
        easing="ease-out-cubic"
        style={[styles.container, { paddingTop: top }, style]}
      >
        <View style={[styles.content, contentStyle]}>{children}</View>
      </Animatable.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 16, paddingBottom: 16 },
});
