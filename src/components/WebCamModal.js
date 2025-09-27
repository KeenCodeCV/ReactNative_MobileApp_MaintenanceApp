// src/components/WebCamModal.js
import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WebCamModal({ visible, onClose, onShot }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!visible) { stop(); return; }

    (async () => {
      setErr('');
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('เบราว์เซอร์ไม่รองรับ getUserMedia หรือไม่ใช่ secure context');
        }
        // เลือกกล้องหน้า (user) ถ้าอยากใช้กล้องหลังเปลี่ยนเป็น 'environment'
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        streamRef.current = stream;
        const v = videoRef.current;
        if (v) {
          v.srcObject = stream;
          const play = () => v.play().catch(() => {});
          if (v.readyState >= 2) play();
          else v.onloadedmetadata = play;
        }
      } catch (e) {
        setErr(e?.message || String(e));
      }
    })();

    return stop;
  }, [visible]);

  const stop = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const capture = () => {
    const v = videoRef.current;
    if (!v) return;
    const canvas = document.createElement('canvas');
    const w = v.videoWidth || 800;
    const h = v.videoHeight || 600;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(v, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    onShot?.(dataUrl);
    onClose?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.box}>
          {/* playsInline + muted จำเป็นสำหรับ iOS Safari ให้เล่นอัตโนมัติ */}
          <video ref={videoRef} autoPlay playsInline muted style={styles.video} />
          {err ? <Text style={styles.err}>ไม่สามารถเปิดกล้อง: {err}</Text> : null}
          <View style={styles.row}>
            <TouchableOpacity style={[styles.btn, { backgroundColor:'#6B7280' }]} onPress={onClose}>
              <Text style={styles.btnText}>ปิด</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor:'#10B981' }]} onPress={capture}>
              <Ionicons name="camera" size={18} color="#fff" />
              <Text style={[styles.btnText, { marginLeft:6 }]}>ถ่าย</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop:{ flex:1, backgroundColor:'rgba(0,0,0,0.85)', justifyContent:'center', alignItems:'center' },
  box:{ width:'92%', maxWidth:480, backgroundColor:'#111827', borderRadius:14, padding:12 },
  video:{ width:'100%', height:360, backgroundColor:'#000', borderRadius:10 },
  row:{ flexDirection:'row', justifyContent:'space-between', marginTop:12, gap:10 },
  btn:{ flex:1, paddingVertical:12, borderRadius:10, alignItems:'center', justifyContent:'center', flexDirection:'row' },
  btnText:{ color:'#fff', fontWeight:'700' },
  err:{ color:'#FCA5A5', textAlign:'center', marginTop:8 },
});
