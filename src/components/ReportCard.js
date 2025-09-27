// src/components/ReportCard.js
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

const statusColors = {
  Pending: '#f59e0b',
  'In Progress': '#3b82f6',
  Done: '#10b981',
  Cancelled: '#ef4444'
};

export default function ReportCard({ item, onEdit, onDelete, onView, onImagePress, showTapHint, animKey }) {
  // รองรับหลายรูป: cover = รูปแรกของ images ถ้ามี, ถ้าไม่มีก็ใช้ image เดิม
  const imgs = Array.isArray(item.images) && item.images.length
    ? item.images
    : (item.image ? [item.image] : []);
  const cover = imgs[0] || null;

  return (
    <Animatable.View
      animation="fadeInUp"
      duration={450}
      easing="ease-out-cubic"
      style={styles.card}
      key={`${item.id}-${animKey ?? ''}`}
    >
      {cover ? (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onImagePress ? () => onImagePress(item) : onView}
        >
          <View style={styles.imageWrap}>
            <Image source={{ uri: cover }} style={styles.image} />
            {showTapHint && (
              <View style={styles.tapHint}>
                <Text style={styles.tapHintText}>กดเพื่อดูรูป</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ) : (
        <View style={[styles.image, styles.noImage]}>
          <Ionicons name="image-outline" size={30} color="#9ca3af" />
        </View>
      )}

      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={[styles.badge, { backgroundColor: statusColors[item.status] || '#6b7280' }]}>
            <Text style={styles.badgeText}>{item.status}</Text>
          </View>
        </View>
        {!!item.description && <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>}
        <View style={styles.actions}>
          {onView && (
            <Animatable.View animation="zoomIn" duration={300} delay={30}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#2563EB' }]} onPress={onView}>
                <Ionicons name="eye-outline" size={16} color="#fff" />
                <Text style={styles.btnText}>รายละเอียด</Text>
              </TouchableOpacity>
            </Animatable.View>
          )}
          {onEdit && (
            <Animatable.View animation="zoomIn" duration={300} delay={60}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#3b82f6' }]} onPress={onEdit}>
                <Ionicons name="create-outline" size={16} color="#fff" />
                <Text style={styles.btnText}>แก้ไข</Text>
              </TouchableOpacity>
            </Animatable.View>
          )}
          {onDelete && (
            <Animatable.View animation="zoomIn" duration={300} delay={90}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#ef4444' }]} onPress={onDelete}>
                <Ionicons name="trash-outline" size={16} color="#fff" />
                <Text style={styles.btnText}>ลบ</Text>
              </TouchableOpacity>
            </Animatable.View>
          )}
        </View>
      </View>
    </Animatable.View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, elevation: 3, overflow: 'hidden' },

  imageWrap: { position: 'relative' },
  image: { width: '100%', height: 160 },
  noImage: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' },

  // ป้าย "กดเพื่อดูรูป" มุมขวาล่าง
  tapHint: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: 'rgba(17,24,39,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tapHintText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  info: { padding: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontWeight: 'bold', fontSize: 16, color: '#111827', flex: 1, paddingRight: 8 },
  desc: { color: '#6b7280', marginTop: 6 },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  actions: { flexDirection: 'row', marginTop: 10, gap: 10, flexWrap: 'wrap' },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 9, paddingHorizontal: 12, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '700' }
});
