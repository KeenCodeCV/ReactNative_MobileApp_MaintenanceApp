import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import api from '../../lib/api';
import { useFocusEffect } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState({ pending:0, progress:0, done:0, cancelled:0 });

  const load = async () => {
    const res = await api.get('/reports');
    const d = res.data || [];
    setStats({
      pending:   d.filter(r => r.status === 'Pending').length,
      progress:  d.filter(r => r.status === 'In Progress').length,
      done:      d.filter(r => r.status === 'Done').length,
      cancelled: d.filter(r => r.status === 'Cancelled').length,
    });
  };

  useFocusEffect(React.useCallback(() => { load(); }, []));

  return (
    <Screen>
      <Text style={styles.title}>แดชบอร์ดงานซ่อม</Text>
      <View style={styles.grid}>
        <Card title="รอดำเนินการ" count={stats.pending}   color="#F59E0B" icon="time" />
        <Card title="กำลังซ่อม"   count={stats.progress}  color="#3B82F6" icon="construct" />
        <Card title="เสร็จสิ้น"   count={stats.done}      color="#10B981" icon="checkmark-done" />
        <Card title="ยกเลิก"      count={stats.cancelled} color="#EF4444" icon="close-circle" />
      </View>
    </Screen>
  );
}

function Card({ title, count, color, icon }) {
  return (
    <Animatable.View animation="zoomIn" duration={500} style={[styles.card, { shadowColor: color }]}>
      <View style={[styles.iconWrap, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={[styles.count, { color }]}>{count}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
    </Animatable.View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginTop: 16, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '47%', backgroundColor: '#fff', borderRadius: 16, paddingVertical: 20, paddingHorizontal: 14, alignItems: 'center', marginBottom: 14, elevation: 4, shadowOpacity: 0.25, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  iconWrap: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  count: { fontSize: 28, fontWeight: '900' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginTop: 4, textAlign: 'center' },
});
