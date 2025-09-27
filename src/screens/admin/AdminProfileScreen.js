import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { AuthContext } from '../../context/AuthContext';
import api from '../../lib/api';

export default function AdminProfileScreen() {
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState({ total:0, users:0 });

  useEffect(() => {
    Promise.all([api.get('/reports'), api.get('/users')]).then(([r,u])=>{
      setStats({ total:r.data.length, users:u.data.length });
    });
  }, []);

  return (
    <Screen>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={72} color="#10B981"/>
        <View>
          <Text style={styles.name}>{user.username}</Text>
          <Text style={styles.role}>Role: {user.role}</Text>
        </View>
      </View>
      <View style={styles.grid}>
        <Card title="จำนวนงานทั้งหมด" n={stats.total} color="#2563EB"/>
        <Card title="ผู้ใช้งานทั้งหมด" n={stats.users} color="#F59E0B"/>
      </View>
      <TouchableOpacity style={[styles.btn,{backgroundColor:'#EF4444'}]} onPress={logout}>
        <Ionicons name="log-out" size={18} color="#fff"/><Text style={styles.btnText}> ออกจากระบบ</Text>
      </TouchableOpacity>
    </Screen>
  );
}

function Card({title, n, color}) {
  return (
    <View style={[styles.card,{borderColor:color}]}>
      <Text style={[styles.cardTitle,{color}]}>{title}</Text>
      <Text style={[styles.cardNum,{color}]}>{n}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header:{ flexDirection:'row', alignItems:'center', gap:12, marginTop:16, marginBottom:14 },
  name:{ fontSize:20, fontWeight:'800', color:'#111827' },
  role:{ color:'#6B7280' },
  grid:{ flexDirection:'row', gap:10, marginBottom:16 },
  card:{ flex:1, backgroundColor:'#fff', borderRadius:12, padding:14, borderWidth:2 },
  cardTitle:{ fontWeight:'700' },
  cardNum:{ fontSize:26, fontWeight:'900', marginTop:6 },
  btn:{ flexDirection:'row', alignItems:'center', justifyContent:'center', padding:12, borderRadius:12 },
  btnText:{ color:'#fff', fontWeight:'700' }
});
