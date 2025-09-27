// src/lib/api.js
import axios from 'axios';
import { Platform } from 'react-native';

const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3000', // Android Emulator
  ios:     '192.168.1.102:3000', // iOS Simulator
  web:     'http://localhost:3000'
});

const api = axios.create({ baseURL: BASE_URL, timeout: 15000 });
export default api;
