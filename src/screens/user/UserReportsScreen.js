// src/screens/user/UserReportsScreen.js
import React, { useState, useContext, useMemo } from 'react';
import {
  FlatList,
  Text,
  StyleSheet,
  View,
  TextInput,
  Modal,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView as VScrollView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Screen from '../../components/Screen';
import ReportCard from '../../components/ReportCard';
import api from '../../lib/api';
import { AuthContext } from '../../context/AuthContext';
import InputField from '../../components/InputField';
import CustomAlert from '../../components/CustomAlert';
import WebCamModal from '../../components/WebCamModal';

const { width, height } = Dimensions.get('window');

export default function UserReportsScreen() {
  const { user } = useContext(AuthContext);

  const [reports, setReports] = useState([]);
  const [q, setQ] = useState('');

  // modal แก้ไข
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '',
    code: '',
    room: '',
    building: '',
    description: '',
  });
  const [editImages, setEditImages] = useState([]); // รูปในโมดอลแก้ไข
  const [editCoverIdx, setEditCoverIdx] = useState(0);

  // alert
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    showCancel: true,
    layout: 'row',
  });

  // รีเฟรชอนิเมชันทุกครั้งเมื่อกลับเข้าหน้า
  const [animTick, setAnimTick] = useState(0);

  // viewer รูปเต็มจอ
  const [viewer, setViewer] = useState({ visible:false, index:0, images:[] });

  // กล้องบนเว็บ (ตอนแก้ไข)
  const [webCamEditOpen, setWebCamEditOpen] = useState(false);

  const sortReports = (arr) =>
    arr.slice().sort((a, b) =>
      new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
    );

  const load = async () => {
    const res = await api.get(
      `/reports?userId=${encodeURIComponent(String(user.id))}&_sort=createdAt&_order=desc`
    );
    setReports(sortReports(res.data || []));
  };

  useFocusEffect(
    React.useCallback(() => {
      load();
      setAnimTick((t) => t + 1);
    }, [user.id])
  );

  /** ---------- Helpers: แปลงไฟล์รูปเป็น Base64 (ไม่มี expo-image-manipulator) ---------- */
  const uriToDataUrlWeb = async (uri) => {
    const res = await fetch(uri);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const assetToDataUrl = async (a) => {
    if (a?.base64) {
      const mime = a.mimeType || 'image/jpeg';
      return `data:${mime};base64,${a.base64}`;
    }
    if (Platform.OS === 'web' && a?.uri) {
      return await uriToDataUrlWeb(a.uri);
    }
    return a?.uri ?? null;
  };

  /** ---------- เลือก/ถ่ายรูป ตอนแก้ไข ---------- */
  const pickEditImages = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      selectionLimit: 6,
      base64: true,
      quality: 0.7,
    });
    if (!res.canceled) {
      const list = [];
      for (const a of res.assets) {
        const dataUrl = await assetToDataUrl(a);
        if (dataUrl) list.push(dataUrl);
      }
      setEditImages(prev => {
        const next = [...prev, ...list].slice(0, 10);
        if (prev.length === 0) setEditCoverIdx(0);
        return next;
      });
    }
  };

  const takeEditPhoto = async () => {
    if (Platform.OS === 'web') { setWebCamEditOpen(true); return; }
    const res = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.7,
    });
    if (!res.canceled) {
      const dataUrl = await assetToDataUrl(res.assets[0]);
      setEditImages(prev => {
        const next = [...prev, dataUrl].slice(0, 10);
        if (prev.length === 0) setEditCoverIdx(0);
        return next;
      });
    }
  };

  const removeEditImage = (idx) => {
    setEditImages(prev => {
      const next = prev.filter((_, i) => i !== idx);
      if (editCoverIdx >= next.length) setEditCoverIdx(Math.max(0, next.length - 1));
      return next;
    });
  };

  const onDelete = (id) => {
    setAlert({
      visible: true,
      title: 'ยืนยัน',
      message: 'คุณต้องการลบรายการนี้หรือไม่?',
      type: 'error',
      showCancel: true,
      layout: 'center',
      onConfirm: async () => {
        await api.delete(`/reports/${id}`);
        setAlert((a) => ({ ...a, visible: false, onConfirm: null }));
        load();
        setAnimTick((t) => t + 1);
      },
    });
  };

  const onEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title,
      code: item.code,
      room: item.room,
      building: item.building,
      description: item.description,
    });
    const imgs = Array.isArray(item.images) && item.images.length
      ? item.images
      : (item.image ? [item.image] : []);
    setEditImages(imgs);
    setEditCoverIdx(0);
  };

  const saveEdit = async () => {
    if (!editing) return;

    const payload = {
      ...editing,
      ...form,
      images: editImages,
      image: editImages[0] || null,
      updatedAt: new Date().toISOString()
    };

    await api.put(`/reports/${editing.id}`, payload);

    setReports(prev => {
      const next = prev.map(r => (String(r.id) === String(editing.id) ? payload : r));
      return sortReports(next);
    });

    setEditing(null);
    setAlert({
      visible: true,
      title: 'สำเร็จ',
      message: 'อัปเดตรายละเอียดเรียบร้อยแล้ว',
      type: 'success',
      showCancel: false,
      onConfirm: null,
      layout: 'row',
    });
    setAnimTick(t => t + 1);
  };

  const showDetails = (item) => {
    const sinceText = item.statusSince
      ? new Date(item.statusSince).toLocaleDateString()
      : new Date(item.createdAt).toLocaleDateString();

    setAlert({
      visible: true,
      title: 'รายละเอียดงาน',
      message:
        `ชื่อปัญหา: ${item.title}\n` +
        `รหัส: ${item.code}\n` +
        `ห้อง: ${item.room}\n` +
        `อาคาร: ${item.building}\n` +
        `รายละเอียด: ${item.description}\n` +
        `สถานะ: ${item.status}\n` +
        `สถานะตั้งแต่: ${sinceText}`,
      type: 'info',
      showCancel: false,
      onConfirm: null,
      layout: 'row',
    });
  };

  const openImageViewer = (item, startIndex = 0) => {
    const imgs = Array.isArray(item.images) && item.images.length
      ? item.images
      : (item.image ? [item.image] : []);
    if (!imgs.length) return;
    setViewer({ visible:true, index:startIndex, images:imgs });
  };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return reports;
    const hit = (s) => (s || '').toString().toLowerCase().includes(term);
    return reports.filter(
      (r) =>
        hit(r.title) ||
        hit(r.description) ||
        hit(r.code) ||
        hit(r.room) ||
        hit(r.building) ||
        hit(r.status)
    );
  }, [q, reports]);

  return (
    <Screen>
      <View style={styles.searchWrap}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="ค้นหาจาก ชื่อปัญหา/รหัส/ห้อง/อาคาร/สถานะ/รายละเอียด"
          placeholderTextColor="#9CA3AF"
          style={styles.search}
        />
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>ยังไม่มีรายการแจ้งซ่อม</Text>
        </View>
      ) : (
        <FlatList
          key={`list-${animTick}`}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 16 }}
          data={filtered}
          keyExtractor={(i) => String(i.id)}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 12 }}>
              <ReportCard
                item={item}
                onDelete={() => onDelete(item.id)}
                onView={() => showDetails(item)}
                onEdit={() => onEdit(item)}
                onImagePress={() => openImageViewer(item, 0)}
                showTapHint={true}
                animKey={animTick}
              />
            </View>
          )}
        />
      )}

      {/* Modal แก้ไขรายละเอียด + รูปภาพ */}
      <Modal
        visible={!!editing}
        transparent
        animationType="slide"
        onRequestClose={() => setEditing(null)}
      >
        <View style={styles.modalWrap}>
          <View style={styles.modalBox}>
            <VScrollView contentContainerStyle={{ paddingBottom: 10 }}>
              <Text style={styles.modalTitle}>แก้ไขรายละเอียด</Text>
              <InputField label="ชื่อปัญหา" value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} />
              <InputField label="รหัสครุภัณฑ์" value={form.code} onChangeText={(v) => setForm({ ...form, code: v })} />
              <InputField label="ห้อง" value={form.room} onChangeText={(v) => setForm({ ...form, room: v })} />
              <InputField label="อาคาร" value={form.building} onChangeText={(v) => setForm({ ...form, building: v })} />
              <InputField label="รายละเอียด" value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} multiline />

              {/* รูปภาพใน modal */}
              <Text style={{ fontWeight:'700', color:'#111827', marginTop:8, marginBottom:6 }}>รูปภาพ</Text>

              {editImages.length > 0 ? (
                <View style={{ position:'relative' }}>
                  <Image
                    source={{ uri: editImages[editCoverIdx] }}
                    style={{ width:'100%', height:160, borderRadius:12, backgroundColor:'#F3F4F6' }}
                  />
                  {/* ✅ กากบาทลบ "รูปใหญ่" */}
                  <TouchableOpacity
                    onPress={() => removeEditImage(editCoverIdx)}
                    style={styles.rmBig}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="close" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ width:'100%', height:160, borderRadius:12, backgroundColor:'#F3F4F6', alignItems:'center', justifyContent:'center' }}>
                  <Ionicons name="image-outline" size={32} color="#9CA3AF" />
                </View>
              )}

              {editImages.length > 1 && (
                <View style={{ flexDirection:'row', gap:8, marginTop:8, flexWrap:'wrap' }}>
                  {editImages.map((uri, idx) => (
                    <View key={idx} style={{ position:'relative' }}>
                      <TouchableOpacity onPress={() => setEditCoverIdx(idx)}>
                        <Image source={{ uri }} style={[styles.thumb, idx === editCoverIdx && styles.thumbActive]} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => removeEditImage(idx)} style={styles.rm}>
                        <Ionicons name="close" size={14} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <View style={{ flexDirection:'row', gap:8, marginTop:8 }}>
                <TouchableOpacity style={[styles.btn, { backgroundColor: '#3B82F6', flex:1 }]} onPress={pickEditImages}>
                  <Ionicons name="images" size={18} color="#fff" />
                  <Text style={styles.btnText}> เลือกรูป</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, { backgroundColor: '#F59E0B', flex:1 }]} onPress={takeEditPhoto}>
                  <Ionicons name="camera" size={18} color="#fff" />
                  <Text style={styles.btnText}> ถ่ายรูป</Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                <TouchableOpacity style={[styles.btn, { backgroundColor: '#10B981', flex:1 }]} onPress={saveEdit}>
                  <Ionicons name="save" size={18} color="#fff" />
                  <Text style={styles.btnText}> บันทึก</Text>
                </TouchableOpacity>
                <View style={{ width:8 }} />
                <TouchableOpacity style={[styles.btn, { backgroundColor: '#EF4444', flex:1 }]} onPress={() => setEditing(null)}>
                  <Ionicons name="close" size={18} color="#fff" />
                  <Text style={styles.btnText}> ปิด</Text>
                </TouchableOpacity>
              </View>
            </VScrollView>
          </View>
        </View>
      </Modal>

      {/* Full Image Viewer */}
      <Modal
        visible={viewer.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setViewer(v => ({ ...v, visible:false }))}
      >
        <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.95)' }}>
          <FlatList
            data={viewer.images}
            horizontal
            pagingEnabled
            keyExtractor={(_, i) => String(i)}
            initialScrollIndex={viewer.index}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            renderItem={({ item }) => (
              <View style={{ width, height, alignItems:'center', justifyContent:'center' }}>
                <Image source={{ uri: item }} style={{ width, height, backgroundColor:'transparent' }} resizeMode="contain" />
              </View>
            )}
          />
          <TouchableOpacity
            onPress={() => setViewer(v => ({ ...v, visible:false }))}
            style={{ position:'absolute', top:40, right:20, backgroundColor:'#11182799', padding:10, borderRadius:20 }}
            activeOpacity={0.85}
          >
            <Ionicons name="close" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* กล้องเว็บสำหรับแก้ไข */}
      <WebCamModal
        visible={webCamEditOpen}
        onClose={() => setWebCamEditOpen(false)}
        onShot={(dataUrl) => {
          setEditImages(prev => {
            const next = [...prev, dataUrl].slice(0, 10);
            if (prev.length === 0) setEditCoverIdx(0);
            return next;
          });
        }}
      />

      {/* Custom Alert */}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert((a) => ({ ...a, visible: false, onConfirm: null }))}
        onConfirm={alert.onConfirm}
        showCancel={alert.showCancel}
        layout={alert.layout}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchWrap: { paddingTop: 16 },
  search: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#111827',
  },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 20, fontWeight: '800', color: '#9CA3AF' },

  modalWrap: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: { backgroundColor: '#fff', borderRadius: 16, padding: 16, width: '92%' },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },

  btn: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 10, justifyContent:'center' },
  btnText: { color: '#fff', fontWeight: '700', marginLeft: 6 },

  thumb: { width: 64, height: 64, borderRadius: 10, backgroundColor: '#F3F4F6' },
  thumbActive: { borderWidth: 2, borderColor: '#2563EB' },
  rm: { position:'absolute', top:4, right:4, backgroundColor:'#111827AA', borderRadius:10, padding:4 },

  // ปุ่มลบรูปใหญ่ในโมดัลแก้ไข
  rmBig: {
    position:'absolute',
    top:8,
    right:8,
    backgroundColor:'#11182799',
    padding:6,
    borderRadius:14,
  },
});
