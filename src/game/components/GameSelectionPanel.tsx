import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

type Props = {
  currentWord: string;
  selectedCount: number;
  activeJokerLabel: string;
};

const GameSelectionPanel: React.FC<Props> = ({
  currentWord,
  selectedCount,
  activeJokerLabel,
}) => {
  return (
    <View style={styles.selectionBox}>
      <Text style={styles.selectionTitle}>Seçilen Harfler</Text>
      <Text style={styles.selectionWord}>
        {currentWord || 'Henüz seçim yapılmadı'}
      </Text>
      <Text style={styles.selectionCount}>Harf Sayısı: {selectedCount}</Text>
      <Text style={styles.selectionHint}>
        Parmağını sürükle, bırakınca kelime tamamlanır.
      </Text>
      <Text style={styles.activeJokerText}>Aktif Joker: {activeJokerLabel}</Text>
    </View>
  );
};

export default GameSelectionPanel;

const styles = StyleSheet.create({
  selectionBox: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6D7BE',
    padding: 12,
    marginBottom: 16,
  },
  selectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B2F2F',
    marginBottom: 6,
  },
  selectionWord: {
    fontSize: 20,
    fontWeight: '800',
    color: '#D98E04',
    marginBottom: 6,
  },
  selectionCount: {
    fontSize: 14,
    color: '#5C4B51',
  },
  selectionHint: {
    fontSize: 13,
    color: '#7A4E00',
    marginTop: 6,
  },
  activeJokerText: {
    fontSize: 13,
    color: '#9F3E5D',
    marginTop: 6,
    fontWeight: '600',
  },
});