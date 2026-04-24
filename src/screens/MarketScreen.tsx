import React, {useCallback, useState} from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import {JokerInventory} from '../types/game';
import {JOKER_DEFINITIONS} from '../constants/jokers';
import {
  getGoldAmount,
  getJokerInventory,
  purchaseJoker,
} from '../storage/marketStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'Market'>;

const MarketScreen: React.FC<Props> = ({navigation}) => {
  const [gold, setGold] = useState(0);
  const [inventory, setInventory] = useState<JokerInventory>({
    fish: 0,
    wheel: 0,
    lollipop: 0,
    swap: 0,
    shuffle: 0,
    party: 0,
  });

  const loadMarketData = async () => {
    const currentGold = await getGoldAmount();
    const currentInventory = await getJokerInventory();

    setGold(currentGold);
    setInventory(currentInventory);
  };

  useFocusEffect(
    useCallback(() => {
      loadMarketData();
    }, []),
  );

  const handlePurchase = async (
    jokerKey: keyof JokerInventory,
    price: number,
    jokerName: string,
  ) => {
    const result = await purchaseJoker(jokerKey, price);

    if (result.success) {
      await loadMarketData();
      Alert.alert('Başarılı', `${jokerName} satın alındı.`);
    } else {
      Alert.alert('Yetersiz Altın', result.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Market</Text>
        <Text style={styles.description}>
          Satın aldığın jokerler oyun ekranında kullanılabilir hale gelir.
        </Text>

        <View style={styles.goldCard}>
          <Text style={styles.goldTitle}>Altın Miktarı</Text>
          <Text style={styles.goldAmount}>{gold}</Text>
        </View>

        {JOKER_DEFINITIONS.map(joker => (
          <View key={joker.key} style={styles.itemCard}>
            <Text style={styles.itemTitle}>{joker.name}</Text>
            <Text style={styles.itemText}>{joker.description}</Text>
            <Text style={styles.itemPrice}>Fiyat: {joker.price} altın</Text>
            <Text style={styles.itemOwned}>
              Sahip Olunan: {inventory[joker.key]}
            </Text>

            <TouchableOpacity
              style={styles.buyButton}
              onPress={() =>
                handlePurchase(joker.key, joker.price, joker.name)
              }>
              <Text style={styles.buyButtonText}>Satın Al</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MarketScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F4E8',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#3B2F2F',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#5C4B51',
    marginBottom: 24,
    lineHeight: 24,
  },
  goldCard: {
    backgroundColor: '#FFF7D6',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E7CF77',
    marginBottom: 18,
  },
  goldTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7A4E00',
    marginBottom: 8,
  },
  goldAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#D98E04',
  },
  itemCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E6D7BE',
    marginBottom: 16,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7A4E00',
    marginBottom: 8,
  },
  itemText: {
    fontSize: 15,
    color: '#3B2F2F',
    marginBottom: 8,
    lineHeight: 22,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#D98E04',
    marginBottom: 6,
  },
  itemOwned: {
    fontSize: 14,
    color: '#5C4B51',
    marginBottom: 12,
  },
  buyButton: {
    backgroundColor: '#D98E04',
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  backButton: {
    backgroundColor: '#8C7B75',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});