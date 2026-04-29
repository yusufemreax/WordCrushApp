import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

type Props = {
  title: string;
  value: string | number;
  subtitle?: string;
};

const ScoreStatCard: React.FC<Props> = ({title, value, subtitle}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

export default ScoreStatCard;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E6D7BE',
    marginBottom: 12,
  },
  title: {
    fontSize: 13,
    color: '#8C7B75',
    marginBottom: 8,
    fontWeight: '600',
  },
  value: {
    fontSize: 22,
    color: '#D98E04',
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    color: '#5C4B51',
    marginTop: 4,
  },
});