import React, { useState, useContext, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import InputField from '../components/InputField';
import Screen from '../components/Screen';
import { AuthContext } from '../context/AuthContext';
import CustomAlert from '../components/CustomAlert';

export default function RegisterScreen({ navigation }) {
  const { register, login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const canSubmit = useMemo(
    () => username.trim().length > 0 && password.length > 0,
    [username, password]
  );

  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    showCancel: false,
    onConfirm: null,
  });

  const onSubmit = async () => {
    if (!canSubmit) {
      return setAlert({
        visible: true,
        title: 'ข้อมูลไม่ครบ',
        message: 'โปรดกรอกชื่อผู้ใช้และรหัสผ่านให้ครบ',
        type: 'warning',
        showCancel: false,
        onConfirm: null,
      });
    }

    const res = await register(username.trim(), password);
    if (!res.ok && res.code === 'USER_EXISTS') {
      return setAlert({
        visible: true,
        title: 'สมัครไม่สำเร็จ',
        message: 'มีชื่อผู้ใช้นี้อยู่ในระบบแล้ว',
        type: 'error',
        showCancel: false,
        onConfirm: null,
      });
    }
    if (res.ok) {
      // โชว์ popup สำเร็จ แล้วค่อยเข้าสู่ระบบเมื่อผู้ใช้กด "ตกลง"
      setAlert({
        visible: true,
        title: 'สมัครสำเร็จ 🎉',
        message: 'บัญชีของคุณถูกสร้างแล้ว กด "ตกลง" เพื่อเข้าสู่ระบบ',
        type: 'success',
        showCancel: false, // ปุ่มเดียว
        onConfirm: async () => {
          setAlert(a => ({ ...a, visible: false, onConfirm: null }));
          await login(username.trim(), password); // เข้าสู่ระบบอัตโนมัติ
        },
      });
    }
  };

  return (
    <Screen contentStyle={{ justifyContent: 'center' }}>
      <View style={styles.card}>
        <Text style={styles.title}>สมัครสมาชิก</Text>

        <InputField label="ชื่อผู้ใช้" value={username} onChangeText={setUsername} placeholder="username" required />
        <InputField label="รหัสผ่าน" value={password} onChangeText={setPassword} placeholder="รหัสผ่าน" secureTextEntry required />

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: canSubmit ? '#10B981' : '#A7F3D0' }]}
          onPress={onSubmit}
          disabled={!canSubmit}
        >
          <Ionicons name="person-add" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.btnText}>สมัครและเข้าสู่ระบบ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.ghost} onPress={() => navigation.replace('Login')}>
          <Ionicons name="arrow-back" size={16} color="#2563EB" />
          <Text style={styles.ghostText}>กลับไปหน้าล็อกอิน</Text>
        </TouchableOpacity>
      </View>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        showCancel={alert.showCancel}
        onConfirm={alert.onConfirm}
        onClose={() => setAlert(a => ({ ...a, visible: false, onConfirm: null }))}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#F9FAFB', borderRadius: 18, padding: 22, elevation: 3 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 12 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
  ghost: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12, gap: 6 },
  ghostText: { color: '#2563EB', fontWeight: '600' },
});
