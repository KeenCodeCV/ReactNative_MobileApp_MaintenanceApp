// src/context/AuthContext.js
import React, { createContext, useState } from 'react';
import api from '../lib/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // ล็อกอิน: สำเร็จ -> setUser และคืน { ok:true }, ไม่สำเร็จ -> { ok:false, code:'INVALID_CREDENTIALS' }
  const login = async (username, password) => {
    try {
      const u = encodeURIComponent(username);
      const p = encodeURIComponent(password);
      const res = await api.get(`/users?username=${u}&password=${p}`);
      if (res.data && res.data.length) {
        const me = res.data[0];
        setUser(me);
        return { ok: true, user: me };
      }
      return { ok: false, code: 'INVALID_CREDENTIALS' };
    } catch (err) {
      return { ok: false, code: 'NETWORK_ERROR', error: err };
    }
  };

  // สมัคร: ไม่เซ็ต user ทันที ให้หน้าจอแสดง popup ก่อน แล้วค่อยเรียก login ตามที่ต้องการ
  const register = async (username, password) => {
    try {
      const u = encodeURIComponent(username);
      const exists = await api.get(`/users?username=${u}`);
      if (exists.data && exists.data.length) {
        return { ok: false, code: 'USER_EXISTS' };
      }
      const res = await api.post('/users', {
        username,
        password,
        role: 'user',
        createdAt: new Date().toISOString(),
      });
      return { ok: true, user: res.data };
    } catch (err) {
      return { ok: false, code: 'NETWORK_ERROR', error: err };
    }
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
