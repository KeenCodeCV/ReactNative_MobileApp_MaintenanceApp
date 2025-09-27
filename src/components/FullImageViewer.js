import React, { useRef, useEffect } from 'react';
import { Modal, View, StyleSheet, FlatList, Image, Dimensions, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function FullImageViewer({ visible, images = [], index = 0, onClose }) {
  const listRef = useRef(null);
  const [current, setCurrent] = React.useState(index);

  useEffect(() => {
    if (visible && listRef.current && index < images.length) {
      setTimeout(() => {
        listRef.current?.scrollToIndex({ index, animated: false });
        setCurrent(index);
      }, 0);
    }
  }, [visible, index, images.length]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems?.length) {
      setCurrent(viewableItems[0].index ?? 0);
    }
  }).current;

  const getItemLayout = (_, i) => ({ length: width, offset: width * i, index: i });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <FlatList
          ref={listRef}
          data={images}
          horizontal
          pagingEnabled
          keyExtractor={(_, i) => String(i)}
          getItemLayout={getItemLayout}
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 60 }}
          renderItem={({ item }) => (
            <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
              <Image source={{ uri: item }} style={styles.full} resizeMode="contain" />
            </View>
          )}
        />

        <TouchableOpacity style={styles.close} onPress={onClose} activeOpacity={0.8}>
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>

        {images?.length > 1 && (
          <View style={styles.counter}>
            <Text style={styles.counterText}>{current + 1}/{images.length}</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' },
  full: { width: width, height: height, backgroundColor: 'transparent' },
  close: { position: 'absolute', top: 40, right: 20, backgroundColor: '#11182799', padding: 10, borderRadius: 22 },
  counter: { position: 'absolute', bottom: 28, alignSelf: 'center', backgroundColor: '#11182799', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  counterText: { color: '#fff', fontWeight: '700' },
});
