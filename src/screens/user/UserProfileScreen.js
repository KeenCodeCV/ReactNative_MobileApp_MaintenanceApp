import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { AuthContext } from '../../context/AuthContext';
import api from '../../lib/api';

export default function UserProfileScreen() {
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState({ total:0, pending:0, progress:0, done:0, cancelled:0 });

  useEffect(()=> {
    api.get(`/reports?userId=${user.id}`).then(res=>{
      const d = res.data;
      setStats({
        total: d.length,
        pending: d.filter(x=>x.status==='Pending').length,
        progress: d.filter(x=>x.status==='In Progress').length,
        done: d.filter(x=>x.status==='Done').length,
        cancelled: d.filter(x=>x.status==='Cancelled').length,
      });
    });
  }, []);

  return (
    <Screen>
      <View style={styles.header}>
        <Ionicons name="person-circle" size={72} color="#2563EB" />
        <View>
          <Text style={styles.name}>{user.username}</Text>
          <Text style={styles.role}>Role: {user.role}</Text>
        </View>
      </View>
      <View style={styles.grid}>
        <Card title="ทั้งหมด" n={stats.total} color="#111827"/>
        <Card title="รอดำเนินการ" n={stats.pending} color="#F59E0B"/>
        <Card title="กำลังซ่อม" n={stats.progress} color="#3B82F6"/>
        <Card title="เสร็จสิ้น" n={stats.done} color="#10B981"/>
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
  grid:{ flexDirection:'row', flexWrap:'wrap', gap:10, marginBottom:16 },
  card:{ width:'47%', backgroundColor:'#fff', borderRadius:12, padding:14, borderWidth:2 },
  cardTitle:{ fontWeight:'700' },
  cardNum:{ fontSize:26, fontWeight:'900', marginTop:6 },
  btn:{ flexDirection:'row', alignItems:'center', justifyContent:'center', padding:12, borderRadius:12 },
  btnText:{ color:'#fff', fontWeight:'700' }
});
