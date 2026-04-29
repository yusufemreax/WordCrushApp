import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {JokerType} from '../types/game';

type Props = {
  jokerKey: JokerType;
  name: string;
  description: string;
  price: number;
  ownedCount: number;
  currentGold: number;
  onBuyPress: () => void;
};

const getJokerIcon = (jokerKey: JokerType): string => {
  switch (jokerKey) {
    case 'fish':
      return '🐟';
    case 'wheel':
      return '⚙️';
    case 'lollipop':
      return '🍭';
    case 'swap':
      return '🔁';
    case 'shuffle':
      return '🔀';
    case 'party':
      return '🎉';
    default:
      return '✨';
  }
};

const MarketJokerCard: React.FC<Props> = ({
  jokerKey,
  name,
  description,
  price,
  ownedCount,
  currentGold,
  onBuyPress,
}) => {
  const canBuy = currentGold >= price;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconBox}>
          <Text style={styles.icon}>{getJokerIcon(jokerKey)}</Text>
        </View>

        <View style={styles.titleArea}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoPill}>
          <Text style={styles.infoLabel}>Fiyat</Text>
          <Text style={styles.priceText}>{price} altın</Text>
        </View>

        <View style={styles.infoPill}>
          <Text style={styles.infoLabel}>Sahip Olunan</Text>
          <Text style={styles.ownedText}>{ownedCount}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.buyButton, !canBuy && styles.buyButtonDisabled]}
        onPress={onBuyPress}
        disabled={!canBuy}>
        <Text style={styles.buyButtonText}>
          {canBuy ? 'Satın Al' : 'Yetersiz Altın'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default MarketJokerCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6D7BE',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFF4E8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E7CF77',
  },
  icon: {
    fontSize: 24,
  },
  titleArea: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#7A4E00',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#5C4B51',
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  infoPill: {
    flex: 1,
    backgroundColor: '#F8F4E8',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EFE2CC',
  },
  infoLabel: {
    fontSize: 12,
    color: '#8C7B75',
    marginBottom: 4,
    fontWeight: '600',
  },
  priceText: {
    fontSize: 15,
    color: '#D98E04',
    fontWeight: '800',
  },
  ownedText: {
    fontSize: 15,
    color: '#3B2F2F',
    fontWeight: '800',
  },
  buyButton: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#D98E04',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyButtonDisabled: {
    backgroundColor: '#C9B9AE',
  },
  buyButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
});