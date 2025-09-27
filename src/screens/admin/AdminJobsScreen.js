// src/screens/admin/AdminJobsScreen.js
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  Text,
  TextInput,
  Dimensions,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import Screen from '../../components/Screen';
import ReportCard from '../../components/ReportCard';
import CustomAlert from '../../components/CustomAlert';
import api from '../../lib/api';

const { width, height } = Dimensions.get('window');

const STATUS = [
  { key: 'Pending',     label: 'รอดำเนินการ', color: '#F59E0B', icon: 'time' },
  { key: 'In Progress', label: 'กำลังซ่อม',   color: '#3B82F6', icon: 'construct' },
  { key: 'Done',        label: 'เสร็จสิ้น',   color: '#10B981', icon: 'checkmark-circle' },
  { key: 'Cancelled',   label: 'ยกเลิก',     color: '#EF4444', icon: 'close-circle' },
];

export default function AdminJobsScreen() {
  const [reports, setReports] = useState([]);
  const [q, setQ] = useState('');

  // แก้ไขสถานะ
  const [editing, setEditing] = useState(null);
  const [statusKey, setStatusKey] = useState('Pending');
  const [since, setSince] = useState(new Date());
  const [showDate, setShowDate] = useState(false);

  // alert
  const [alert, setAlert] = useState({
    visible: false, title: '', message: '', type: 'info',
    onConfirm: null, showCancel: true, layout: 'row',
  });

  // เล่นอนิเมชันทุกครั้ง
  const [animTick, setAnimTick] = useState(0);

  // viewer รูปเต็มจอ
  const [viewer, setViewer] = useState({ visible:false, index:0, images:[] });

  const sortReports = (arr) =>
    arr.slice().sort((a, b) =>
      new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
    );

  const load = async () => {
    const res = await api.get('/reports?_sort=createdAt&_order=desc');
    setReports(sortReports(res.data || []));
  };

  useFocusEffect(
    React.useCallback(() => {
      load();
      setAnimTick((t) => t + 1);
    }, [])
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return reports;
    const hit = (s) => (s || '').toString().toLowerCase().includes(term);
    return reports.filter(r =>
      hit(r.title) || hit(r.description) || hit(r.code) || hit(r.room) || hit(r.building) || hit(r.status)
    );
  }, [q, reports]);

  const openEditStatus = (item) => {
    setEditing(item);
    setStatusKey(item.status);
    setSince(item.statusSince ? new Date(item.statusSince) : new Date());
  };

  const saveStatus = async () => {
    if (!editing) return;

    const payload = {
      ...editing,
      status: statusKey,
      statusSince: since.toISOString(),
      updatedAt: new Date().toISOString(),   // ใช้อันนี้ในการ sort ให้ขึ้นบนสุดทันที
    };

    // อัปเดตที่เซิร์ฟเวอร์
    await api.put(`/reports/${editing.id}`, payload);

    // ✅ อัปเดตใน state ทันที + จัดอันดับใหม่ → ขึ้นบนสุด
    setReports(prev => {
      const next = prev.map(r => (String(r.id) === String(editing.id) ? payload : r));
      return sortReports(next);
    });

    setEditing(null);
    setAlert({
      visible: true,
      title: 'สำเร็จ',
      message: `อัปเดตสถานะเป็น “${statusKey}” แล้ว`,
      type: 'success',
      showCancel: false,
      onConfirm: null,
      layout: 'row',
    });

    setAnimTick(t => t + 1);

    // (ออปชัน) แจ้งผู้ใช้ ถ้ามี endpoint นี้
    try {
      await api.post('/notifications', {
        userId: payload.userId,
        reportId: payload.id,
        title: 'อัปเดตสถานะงานซ่อม',
        message: `สถานะ: ${payload.status} (ตั้งแต่: ${new Date(payload.statusSince).toLocaleDateString()})`,
        createdAt: new Date().toISOString(),
      });
    } catch {}
  };

  const onDelete = (id) => {
    setAlert({
      visible: true,
      title: 'ยืนยัน',
      message: 'คุณต้องการลบรายการนี้หรือไม่?',
      type: 'error',
      layout: 'center',
      showCancel: true,
      onConfirm: async () => {
        await api.delete(`/reports/${id}`);
        setReports(prev => prev.filter(r => String(r.id) !== String(id)));
        setAlert(a => ({ ...a, visible: false, onConfirm: null }));
        setAnimTick(t => t + 1);
      }
    });
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

  return (
    <Screen>
      <View style={styles.searchWrap}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="ค้นหา ชื่อปัญหา/รหัส/ห้อง/อาคาร/สถานะ/รายละเอียด"
          placeholderTextColor="#9CA3AF"
          style={styles.search}
        />
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyWrap}><Text style={styles.emptyText}>ยังไม่มีรายการ</Text></View>
      ) : (
        <FlatList
          key={`list-${animTick}`}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 16 }}
          data={filtered}
          keyExtractor={(i)=>String(i.id)}
          renderItem={({ item }) => (
            <Animatable.View animation="fadeInUp" duration={450} easing="ease-out-cubic" style={{ marginBottom: 12 }}>
              <ReportCard
                item={item}
                onView={() => showDetails(item)}
                onEdit={() => openEditStatus(item)}
                onDelete={() => onDelete(item.id)}
                onImagePress={() => openImageViewer(item, 0)}   // แตะรูปเพื่อดูรูปใหญ่
                showTapHint={true}
                animKey={animTick}
              />
            </Animatable.View>
          )}
        />
      )}

      {/* Modal แก้ไขสถานะ */}
      <Modal visible={!!editing} transparent animationType="slide" onRequestClose={()=>setEditing(null)}>
        <View style={styles.backdrop}>
          <Animatable.View animation="slideInUp" duration={300} style={styles.sheet}>
            <Text style={styles.sheetTitle}>แก้ไขสถานะ</Text>

            {STATUS.map(s => (
              <TouchableOpacity key={s.key} style={styles.item} onPress={() => setStatusKey(s.key)}>
                <Ionicons name={s.icon} size={20} color={s.color} style={{ width:26 }} />
                <Text style={[styles.itemText, { flex:1 }]}>{s.label}</Text>
                {statusKey === s.key && <Ionicons name="checkmark" size={18} color={s.color} />}
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={[styles.item, { justifyContent:'space-between' }]} onPress={() => setShowDate(true)}>
              <View style={{ flexDirection:'row', alignItems:'center' }}>
                <Ionicons name="calendar" size={20} color="#2563EB" style={{ width:26 }} />
                <Text style={styles.itemText}>สถานะตั้งแต่</Text>
              </View>
              <Text style={[styles.itemText, { fontWeight:'700', color:'#2563EB' }]}>{since.toLocaleDateString()}</Text>
            </TouchableOpacity>

            <View style={{ flexDirection:'row', gap:10, marginTop:12 }}>
              <TouchableOpacity style={[styles.btn,{ backgroundColor:'#E5E7EB', flex:1 }]} onPress={()=>setEditing(null)}>
                <Text style={[styles.btnText,{ color:'#111827' }]}>ปิด</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn,{ backgroundColor:'#10B981', flex:1 }]} onPress={saveStatus}>
                <Text style={styles.btnText}>บันทึก</Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </View>
      </Modal>

      {/* Date picker */}
      <DateTimePickerModal
        isVisible={showDate}
        mode="date"
        date={since}
        onConfirm={(d)=>{ setSince(d); setShowDate(false); }}
        onCancel={()=>setShowDate(false)}
      />

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
                <Image source={{ uri: item }} style={{ width, height }} resizeMode="contain" />
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

      {/* CustomAlert */}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert(a => ({ ...a, visible:false, onConfirm:null }))}
        onConfirm={alert.onConfirm}
        showCancel={alert.showCancel}
        layout={alert.layout}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchWrap:{ paddingTop:16 },
  search:{
    backgroundColor:'#F3F4F6',
    borderColor:'#D1D5DB',
    borderWidth:1,
    borderRadius:12,
    paddingHorizontal:14,
    paddingVertical:10,
    color:'#111827'
  },
  emptyWrap:{ flex:1, alignItems:'center', justifyContent:'center' },
  emptyText:{ fontSize:20, fontWeight:'800', color:'#9CA3AF' },

  backdrop:{ flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'flex-end' },
  sheet:{ backgroundColor:'#fff', borderTopLeftRadius:18, borderTopRightRadius:18, paddingHorizontal:16, paddingTop:14, paddingBottom:18 },
  sheetTitle:{ fontSize:16, fontWeight:'800', color:'#111827', marginBottom:8 },
  item:{ flexDirection:'row', alignItems:'center', paddingVertical:12, borderBottomWidth:1, borderBottomColor:'#F3F4F6' },
  itemText:{ fontSize:16, color:'#111827' },

  btn:{ paddingVertical:12, borderRadius:12, alignItems:'center', justifyContent:'center' },
  btnText:{ color:'#fff', fontSize:16, fontWeight:'700' },
});
