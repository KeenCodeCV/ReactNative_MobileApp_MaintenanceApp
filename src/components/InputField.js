import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function InputField({
  label, value, onChangeText, placeholder,
  secureTextEntry=false, keyboardType='default',
  multiline=false, required=false,
}) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);

  return (
    <View style={styles.wrapper}>
      {!!label && (
        <Text style={styles.label}>
          {label}{required && <Text style={{color:'#ef4444'}}> *</Text>}
        </Text>
      )}
      <View style={[styles.inputWrap, focused && styles.inputWrapFocused, multiline && {height:110, alignItems:'flex-start'}]}>
        <TextInput
          style={[styles.input, multiline && {height:'100%', textAlignVertical:'top'}]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={secureTextEntry && !show}
          keyboardType={keyboardType}
          onFocus={()=>setFocused(true)}
          onBlur={()=>setFocused(false)}
          multiline={multiline}
          autoCapitalize="none"
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={()=>setShow(s=>!s)} style={styles.eye}>
            <Ionicons name={show ? 'eye-off' : 'eye'} size={18} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:{ marginBottom:12 },
  label:{ color:'#111827', marginBottom:6, fontWeight:'600' },
  inputWrap:{
    backgroundColor:'#F3F4F6',
    borderRadius:12,
    borderWidth:1,
    borderColor:'#D1D5DB',
    paddingHorizontal:14,
    minHeight:48,
    flexDirection:'row',
    alignItems:'center'
  },
  inputWrapFocused:{ borderColor:'#2563EB', backgroundColor:'#fff' },
  input:{ flex:1, color:'#111827', fontSize:16 },
  eye:{ marginLeft:8 }
});
