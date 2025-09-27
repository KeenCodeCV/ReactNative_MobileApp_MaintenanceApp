import React, { useState, useContext, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import InputField from '../components/InputField';
import Screen from '../components/Screen';
import { AuthContext } from '../context/AuthContext';
import CustomAlert from '../components/CustomAlert';

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const canSubmit = useMemo(
    () => username.trim().length > 0 && password.length > 0,
    [username, password]
  );

  // popup state
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
    const res = await login(username.trim(), password);
    if (!res.ok) {
      setAlert({
        visible: true,
        title: 'เข้าสู่ระบบไม่สำเร็จ',
        message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
        type: 'error',
        showCancel: false,
        onConfirm: null,
      });
    }
    // ถ้า ok ระบบจะพาเข้าแท็บโดยอัตโนมัติจาก Router
  };

  return (
    <Screen contentStyle={{ justifyContent: 'center' }}>
      <View style={styles.card}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>MaintenanceApp</Text>

        <InputField label="ชื่อผู้ใช้" value={username} onChangeText={setUsername} placeholder="username" required />
        <InputField label="รหัสผ่าน" value={password} onChangeText={setPassword} placeholder="รหัสผ่าน" secureTextEntry required />

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: canSubmit ? '#2563EB' : '#93C5FD' }]}
          onPress={onSubmit}
          disabled={!canSubmit}
        >
          <Ionicons name="log-in" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.btnText}>เข้าสู่ระบบ</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>ยังไม่มีบัญชี? สมัครสมาชิก</Text>
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
  logo: { width: 64, height: 64, alignSelf: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 12 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
  link: { color: '#2563EB', textAlign: 'center', marginTop: 12, textDecorationLine: 'underline' },
});
