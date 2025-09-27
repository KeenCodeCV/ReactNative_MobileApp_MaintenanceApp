// src/components/CustomAlert.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';

export default function CustomAlert({
  visible,
  onClose,
  title,
  message,
  type = "info",
  onConfirm,          // ถ้ามี = เป็น confirm
  showCancel = true,  // หน้าแรกหลังส่งสำเร็จ -> ส่ง false ให้เหลือปุ่มเดียว
  okText = "ตกลง",
  cancelText = "ยกเลิก",
  layout = "row",     // 'row' (ปุ่มคู่) | 'center' (ยืนยันกลาง + ยกเลิกเป็นลิงก์)
}) {
  const colors = {
    success: "#10B981",
    error:   "#EF4444",
    warning: "#F59E0B",
    info:    "#3B82F6",
  };

  const iconName =
    type === "success" ? "checkmark-circle" :
    type === "error"   ? "close-circle"     :
    type === "warning" ? "alert-circle"     :
                         "information-circle";

  const handleOk = () => {
    if (onConfirm) onConfirm();
    else if (onClose) onClose();
  };

  const TwoButtons = onConfirm && showCancel;

  return (
    <Modal
      isVisible={visible}
      animationIn="zoomIn"
      animationOut="zoomOut"
      backdropTransitionOutTiming={0}
      onBackdropPress={onClose}
      useNativeDriver
    >
      <View style={styles.modal}>
        <Ionicons name={iconName} size={48} color={colors[type]} style={{ marginBottom:10 }} />
        <Text style={styles.title}>{title}</Text>
        {!!message && <Text style={styles.message}>{message}</Text>}

        {TwoButtons && layout === 'center' ? (
          <>
            {/* ปุ่มยืนยันอยู่กลาง (ไม่มีไอคอน) */}
            <TouchableOpacity
              style={[styles.btn, styles.btnSingle, { backgroundColor: colors[type] }]}
              onPress={handleOk}
              activeOpacity={0.9}
            >
              <Text style={styles.btnText}>{okText}</Text>
            </TouchableOpacity>

            {/* ยกเลิกเป็นลิงก์ด้านล่าง */}
            <TouchableOpacity style={styles.linkBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.linkText}>{cancelText}</Text>
            </TouchableOpacity>
          </>
        ) : TwoButtons ? (
          // โหมดปุ่มคู่แบบเดิม (ไม่มีไอคอนในปุ่ม)
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, { backgroundColor: "#E5E7EB" }]} onPress={onClose} activeOpacity={0.8}>
              <Text style={[styles.btnText, { color: "#111827" }]}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors[type] }]} onPress={handleOk} activeOpacity={0.85}>
              <Text style={styles.btnText}>{okText}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // ปุ่มเดียว (ไม่มีไอคอน)
          <TouchableOpacity
            style={[styles.btn, styles.btnSingle, { backgroundColor: colors[type] }]}
            onPress={handleOk}
            activeOpacity={0.9}
          >
            <Text style={styles.btnText}>{okText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal:   { backgroundColor:"#fff", padding:20, borderRadius:16, alignItems:"center" },
  title:   { fontSize:18, fontWeight:"800", marginBottom:6, color:"#111827", textAlign:"center" },
  message: { fontSize:15, textAlign:"center", color:"#374151", marginBottom:14 },

  actions: { flexDirection:"row", gap:10, alignSelf:"stretch" },

  btn:     { paddingVertical:12, paddingHorizontal:16, borderRadius:10, alignItems:"center", justifyContent:"center" },
  btnText: { color:"#fff", fontSize:16, fontWeight:"700", textAlign:"center" },

  btnSingle:{ alignSelf:"center", minWidth:140, maxWidth:"80%", paddingHorizontal:22 },
  linkBtn:{ marginTop:10, paddingVertical:6, paddingHorizontal:8 },
  linkText:{ color:"#6B7280", fontSize:15, fontWeight:"700" },
});
