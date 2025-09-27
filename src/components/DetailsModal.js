import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

export default function DetailsModal({ visible, item, onClose, onOpenImage }) {
  if (!item) return null;
  const imgs = item.images?.length ? item.images : (item.image ? [item.image] : []);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Animatable.View animation="zoomIn" duration={220} style={styles.card}>
          <Text style={styles.title}>รายละเอียดงาน</Text>

          <Row label="ชื่อปัญหา" value={item.title} />
          <Row label="รหัส" value={item.code} />
          <Row label="ห้อง" value={item.room} />
          <Row label="อาคาร" value={item.building} />
          <Row label="รายละเอียด" value={item.description} />
          <Row label="สถานะ" value={item.status} />
          <Row
            label="สถานะตั้งแต่"
            value={item.statusSince ? new Date(item.statusSince).toLocaleDateString() : new Date(item.createdAt).toLocaleDateString()}
          />

          {!!imgs.length && (
            <>
              <Text style={[styles.h, { marginTop: 12 }]}>รูปแนบ ({imgs.length})</Text>
              <FlatList
                horizontal
                data={imgs}
                keyExtractor={(_, i) => String(i)}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 6 }}
                ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
                renderItem={({ item: uri, index }) => (
                  <TouchableOpacity onPress={() => onOpenImage(index)} activeOpacity={0.9}>
                    <Image source={{ uri }} style={styles.thumb} />
                  </TouchableOpacity>
                )}
              />
            </>
          )}

          <TouchableOpacity style={styles.ok} onPress={onClose} activeOpacity={0.9}>
            <Text style={styles.okText}>ตกลง</Text>
          </TouchableOpacity>
        </Animatable.View>
      </View>
    </Modal>
  );
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.lb}>{label}</Text>
      <Text style={styles.vl}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, width: '100%' },
  title: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 8 },
  h: { fontSize: 16, fontWeight: '700', color: '#111827' },
  row: { marginTop: 8 },
  lb: { color: '#6B7280', fontSize: 13, marginBottom: 2 },
  vl: { color: '#111827', fontSize: 15, fontWeight: '600' },
  thumb: { width: 88, height: 88, borderRadius: 10, backgroundColor: '#F3F4F6' },
  ok: { marginTop: 14, backgroundColor: '#2563EB', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  okText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
