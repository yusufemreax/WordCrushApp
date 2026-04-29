import React, {useCallback, useMemo, useState} from 'react';
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
import MarketJokerCard from '../components/MarketJokerCard';
import {RootStackParamList} from '../types/navigation';
import {JokerInventory} from '../types/game';
import {JOKER_DEFINITIONS} from '../constants/jokers';
import {
  getGoldAmount,
  getJokerInventory,
  purchaseJoker,
} from '../storage/marketStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'Market'>;

const defaultInventory: JokerInventory = {
  fish: 0,
  wheel: 0,
  lollipop: 0,
  swap: 0,
  shuffle: 0,
  party: 0,
};

const MarketScreen: React.FC<Props> = ({navigation}) => {
  const [gold, setGold] = useState(0);
  const [inventory, setInventory] = useState<JokerInventory>(defaultInventory);

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

  const marketSummary = useMemo(() => {
    const totalJokers = Object.values(inventory).reduce(
      (total, count) => total + count,
      0,
    );

    const ownedJokerTypes = Object.values(inventory).filter(
      count => count > 0,
    ).length;

    const mostExpensiveJoker = [...JOKER_DEFINITIONS].sort(
      (a, b) => b.price - a.price,
    )[0];

    return {
      totalJokers,
      ownedJokerTypes,
      mostExpensiveJoker,
    };
  }, [inventory]);

  const handlePurchase = async (
    jokerKey: keyof JokerInventory,
    price: number,
    jokerName: string,
  ) => {
    const result = await purchaseJoker(jokerKey, price);

    if (result.success) {
      await loadMarketData();
      Alert.alert('Başarılı', `${jokerName} satın alındı.`);
      return;
    }

    Alert.alert('Yetersiz Altın', result.message);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Market</Text>
          <Text style={styles.description}>
            Joker satın al, oyun sırasında zor durumlarda avantaj kazan.
          </Text>
        </View>

        <View style={styles.goldCard}>
          <View>
            <Text style={styles.goldLabel}>Altın Miktarı</Text>
            <Text style={styles.goldAmount}>{gold}</Text>
          </View>

          <View style={styles.goldIconBox}>
            <Text style={styles.goldIcon}>🪙</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Toplam Joker</Text>
            <Text style={styles.summaryValue}>{marketSummary.totalJokers}</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Joker Türü</Text>
            <Text style={styles.summaryValue}>
              {marketSummary.ownedJokerTypes}
            </Text>
          </View>
        </View>

        {marketSummary.mostExpensiveJoker && (
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Market İpucu</Text>
            <Text style={styles.tipText}>
              En pahalı joker: {marketSummary.mostExpensiveJoker.name} (
              {marketSummary.mostExpensiveJoker.price} altın). Güçlü jokerleri
              zor oyunlarda kullanmak daha avantajlıdır.
            </Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Jokerler</Text>
          <Text style={styles.sectionSubtitle}>
            Satın aldıkların oyun ekranında görünür.
          </Text>
        </View>

        {JOKER_DEFINITIONS.map(joker => (
          <MarketJokerCard
            key={joker.key}
            jokerKey={joker.key}
            name={joker.name}
            description={joker.description}
            price={joker.price}
            ownedCount={inventory[joker.key]}
            currentGold={gold}
            onBuyPress={() =>
              handlePurchase(joker.key, joker.price, joker.name)
            }
          />
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
    paddingBottom: 28,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#3B2F2F',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#5C4B51',
    lineHeight: 22,
  },
  goldCard: {
    backgroundColor: '#FFF7D6',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E7CF77',
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goldLabel: {
    fontSize: 14,
    color: '#7A4E00',
    fontWeight: '700',
    marginBottom: 6,
  },
  goldAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#D98E04',
  },
  goldIconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E7CF77',
  },
  goldIcon: {
    fontSize: 30,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E6D7BE',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#8C7B75',
    fontWeight: '600',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 24,
    color: '#D98E04',
    fontWeight: '900',
  },
  tipCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E6D7BE',
    marginBottom: 20,
  },
  tipTitle: {
    fontSize: 15,
    color: '#7A4E00',
    fontWeight: '800',
    marginBottom: 6,
  },
  tipText: {
    fontSize: 14,
    color: '#5C4B51',
    lineHeight: 20,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#3B2F2F',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#5C4B51',
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