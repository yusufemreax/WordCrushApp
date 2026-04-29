import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

type Props = {
  availableWordCount: number;
  totalFoundWordCount: number;
};

const GameInfoPanel: React.FC<Props> = ({
  availableWordCount,
  totalFoundWordCount,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.infoItem}>
        <Text style={styles.label}>Oluşturulabilir Kelime</Text>
        <Text style={styles.value}>{availableWordCount}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoItem}>
        <Text style={styles.label}>Toplam Bulunan</Text>
        <Text style={styles.value}>{totalFoundWordCount}</Text>
      </View>
    </View>
  );
};

export default GameInfoPanel;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6D7BE',
    padding: 14,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#8C7B75',
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  value: {
    fontSize: 24,
    color: '#D98E04',
    fontWeight: '900',
  },
  divider: {
    width: 1,
    height: 42,
    backgroundColor: '#EFE2CC',
    marginHorizontal: 12,
  },
});