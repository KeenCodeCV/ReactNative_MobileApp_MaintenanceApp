// src/screens/user/UserHomeScreen.js
import React, { useState, useContext } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView as HScrollView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import InputField from '../../components/InputField';
import Screen from '../../components/Screen';
import { AuthContext } from '../../context/AuthContext';
import api from '../../lib/api';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import CustomAlert from '../../components/CustomAlert';
import WebCamModal from '../../components/WebCamModal'; // กล้องบนเว็บ

export default function UserHomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [room, setRoom] = useState('');
  const [building, setBuilding] = useState('');
  const [description, setDescription] = useState('');

  // หลายรูป + รูปหลักที่กำลังพรีวิว
  const [images, setImages] = useState([]); // data URL[]
  const [currentIdx, setCurrentIdx] = useState(0);

  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    showCancel: false,
  });

  // เปิดกล้องบนเว็บ
  const [webCamOpen, setWebCamOpen] = useState(false);

  /** -------------------- Helpers: แปลงไฟล์เป็น Base64 -------------------- */
  const uriToDataUrlWeb = async (uri) => {
    const res = await fetch(uri);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result); // data:image/...;base64,xxxx
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
    // เผื่อกรณีสุดท้าย
    return a?.uri ?? null;
  };

  /** -------------------- เลือกรูป/ถ่ายรูป -------------------- */
  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      selectionLimit: 6,
      base64: true,      // ✅ เอา base64 มาตรง ๆ
      quality: 0.7,
    });
    if (!res.canceled) {
      const list = [];
      for (const a of res.assets) {
        const dataUrl = await assetToDataUrl(a);
        if (dataUrl) list.push(dataUrl);
      }
      setImages((prev) => {
        const merged = [...prev, ...list].slice(0, 10);
        if (prev.length === 0) setCurrentIdx(0);
        return merged;
      });
    }
  };

  const takePhoto = async () => {
    // ✅ บนเว็บเปิดโมดอลเว็บแคม แทน file picker
    if (Platform.OS === 'web') {
      setWebCamOpen(true);
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      base64: true,     // ✅ เอา base64 มาตรง ๆ
      quality: 0.7,
    });
    if (!res.canceled) {
      const dataUrl = await assetToDataUrl(res.assets[0]);
      if (dataUrl) {
        setImages((prev) => {
          const merged = [...prev, dataUrl].slice(0, 10);
          if (prev.length === 0) setCurrentIdx(0);
          return merged;
        });
      }
    }
  };

  // ---- ลบรูป ----
  const removeImageAt = (idx) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      const newIdx = Math.max(0, Math.min(currentIdx, next.length - 1));
      setCurrentIdx(newIdx);
      return next;
    });
  };
  const removeCurrent = () => {
    if (images.length) removeImageAt(currentIdx);
  };

  const resetForm = () => {
    setTitle('');
    setCode('');
    setRoom('');
    setBuilding('');
    setDescription('');
    setImages([]);
    setCurrentIdx(0);
    setDate(new Date());
  };

  const submit = async () => {
    if (!title.trim()) {
      return setAlert({
        visible: true,
        title: 'ข้อมูลไม่ครบ',
        message: 'กรุณากรอกชื่อปัญหา',
        type: 'warning',
        showCancel: false,
        onConfirm: null,
      });
    }

    await api.post('/reports', {
      title,
      code,
      room,
      building,
      description,
      image: images[0] || null, // เข้ากันได้กับของเดิม
      images,                   // ✅ ส่งหลายรูป
      status: 'Pending',
      userId: String(user.id),
      createdAt: date.toISOString(),
    });

    setAlert({
      visible: true,
      title: 'สำเร็จ',
      message: 'ส่งแจ้งซ่อมแล้ว 🎉',
      type: 'success',
      showCancel: false,
      onConfirm: () => {
        setAlert((prev) => ({ ...prev, visible: false, onConfirm: null }));
        navigation.navigate('Reports');
      },
    });

    resetForm();
  };

  const cover = images[currentIdx] || null;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}>
        <Text style={styles.title}>แจ้งซ่อมครุภัณฑ์</Text>

        <InputField
          label="ชื่อปัญหา"
          required
          value={title}
          onChangeText={setTitle}
          placeholder="เช่น โต๊ะพัง"
        />
        <InputField
          label="รหัสครุภัณฑ์"
          value={code}
          onChangeText={setCode}
          placeholder="รหัส..."
        />
        <InputField
          label="ห้อง"
          value={room}
          onChangeText={setRoom}
          placeholder="เช่น 101"
        />
        <InputField
          label="อาคาร"
          value={building}
          onChangeText={setBuilding}
          placeholder="ชื่ออาคาร"
        />
        <InputField
          label="รายละเอียด"
          value={description}
          onChangeText={setDescription}
          placeholder="รายละเอียดเพิ่มเติม"
          multiline
        />

        {/* เลือกวันที่ */}
        <Text style={styles.label}>วันที่แจ้ง</Text>
        <TouchableOpacity
          onPress={() => setDatePickerVisibility(true)}
          style={[styles.btn, { backgroundColor: '#2563EB' }]}
        >
          <Ionicons name="calendar" size={18} color="#fff" />
          <Text style={styles.btnText}> {date.toLocaleDateString()}</Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          date={date}
          onConfirm={(selectedDate) => {
            setDate(selectedDate);
            setDatePickerVisibility(false);
          }}
          onCancel={() => setDatePickerVisibility(false)}
        />

        {/* แนบรูป: พรีวิวรูปหลัก + แถบ thumbnail */}
        <Text style={styles.label}>รูปภาพแนบ</Text>
        {cover ? (
          <View style={{ position: 'relative' }}>
            <Image source={{ uri: cover }} style={styles.preview} resizeMode="cover" />
            {/* ปุ่มลบรูปใหญ่ */}
            <TouchableOpacity onPress={removeCurrent} style={styles.rmBig} activeOpacity={0.85}>
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.preview, styles.noImage]}>
            <Ionicons name="image-outline" size={32} color="#9CA3AF" />
          </View>
        )}

        {images.length > 1 && (
          <HScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {images.map((uri, idx) => (
                <View key={idx} style={{ position: 'relative' }}>
                  <TouchableOpacity onPress={() => setCurrentIdx(idx)} activeOpacity={0.9}>
                    <Image
                      source={{ uri }}
                      style={[styles.thumb, idx === currentIdx && styles.thumbActive]}
                    />
                  </TouchableOpacity>
                  {/* ปุ่มลบ thumbnail */}
                  <TouchableOpacity
                    onPress={() => removeImageAt(idx)}
                    style={styles.rmThumb}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </HScrollView>
        )}

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: '#3B82F6', flex: 1 }]}
            onPress={pickImage}
          >
            <Ionicons name="images" size={18} color="#fff" />
            <Text style={styles.btnText}> เลือกรูป</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: '#F59E0B', flex: 1 }]}
            onPress={takePhoto}
          >
            <Ionicons name="camera" size={18} color="#fff" />
            <Text style={styles.btnText}> ถ่ายรูป</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.btn, { backgroundColor: '#10B981' }]} onPress={submit}>
          <Ionicons name="send" size={18} color="#fff" />
          <Text style={styles.btnText}> ส่งแจ้งซ่อม</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Popup */}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert((a) => ({ ...a, visible: false, onConfirm: null }))}
        onConfirm={alert.onConfirm}
        showCancel={alert.showCancel}
      />

      {/* กล้องสำหรับเว็บ */}
      <WebCamModal
        visible={webCamOpen}
        onClose={() => setWebCamOpen(false)}
        onShot={(dataUrl) => {
          setImages((prev) => {
            const merged = [...prev, dataUrl].slice(0, 10);
            if (prev.length === 0) setCurrentIdx(0);
            return merged;
          });
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 12 },
  label: { color: '#111827', fontWeight: '600', marginTop: 10, marginBottom: 6 },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginBottom: 6,
  },
  noImage: { alignItems: 'center', justifyContent: 'center' },

  thumb: { width: 64, height: 64, borderRadius: 10, backgroundColor: '#F3F4F6' },
  thumbActive: { borderWidth: 2, borderColor: '#2563EB' },

  // ปุ่มลบรูปใหญ่
  rmBig: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#11182799',
    padding: 6,
    borderRadius: 14,
  },
  // ปุ่มลบรูปเล็ก (thumbnail)
  rmThumb: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#111827AA',
    padding: 4,
    borderRadius: 10,
  },

  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginVertical: 6,
  },
  btnText: { color: '#fff', fontWeight: '700' },
});
