import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

type Props = {
  message: string;
};

const GameResultPanel: React.FC<Props> = ({message}) => {
  return (
    <View style={styles.resultBox}>
      <Text style={styles.resultTitle}>Son Kontrol</Text>
      <Text style={styles.resultText}>{message}</Text>
    </View>
  );
};

export default GameResultPanel;

const styles = StyleSheet.create({
  resultBox: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6D7BE',
    padding: 12,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B2F2F',
    marginBottom: 6,
  },
  resultText: {
    fontSize: 14,
    color: '#5C4B51',
    lineHeight: 20,
  },
});