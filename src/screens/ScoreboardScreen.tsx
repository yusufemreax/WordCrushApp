import React, {useCallback, useMemo, useState} from 'react';
import {
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
import {GameHistoryItem} from '../types/game';
import {getGameHistory} from '../storage/gameHistoryStorage';
import {
  formatDate,
  formatDuration,
  formatTotalDuration,
} from '../game/utils/formatHelpers';
import { SafeAreaContext } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'Scoreboard'>;

const ScoreboardScreen: React.FC<Props> = ({navigation}) => {
  const [history, setHistory] = useState<GameHistoryItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadHistory = async () => {
        const gameHistory = await getGameHistory();
        setHistory(gameHistory);
      };

      loadHistory();
    }, []),
  );

  const summary = useMemo(() => {
    const totalGames = history.length;
    const highestScore =
      history.length > 0 ? Math.max(...history.map(item => item.score)) : 0;

    const averageScore =
      history.length > 0
        ? Math.round(
            history.reduce((total, item) => total + item.score, 0) /
              history.length,
          )
        : 0;

    const totalFoundWords = history.reduce(
      (total, item) => total + item.foundWordCount,
      0,
    );

    const longestWord =
      history.length > 0
        ? [...history]
            .map(item => item.longestWord)
            .sort((a, b) => b.length - a.length)[0]
        : '-';

    const totalDurationInSeconds = history.reduce(
      (total, item) => total + item.durationInSeconds,
      0,
    );

    return {
      totalGames,
      highestScore,
      averageScore,
      totalFoundWords,
      longestWord,
      totalDurationInSeconds,
    };
  }, [history]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Skor Tablosu</Text>
        <Text style={styles.description}>
          Burada oynadığın oyunların özetini ve geçmiş kayıtlarını görebilirsin.
        </Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Genel Performans</Text>
          <Text style={styles.summaryText}>
            Toplam Oynanan Oyun: {summary.totalGames}
          </Text>
          <Text style={styles.summaryText}>
            En Yüksek Puan: {summary.highestScore}
          </Text>
          <Text style={styles.summaryText}>
            Ortalama Puan: {summary.averageScore}
          </Text>
          <Text style={styles.summaryText}>
            Toplam Bulunan Kelime: {summary.totalFoundWords}
          </Text>
          <Text style={styles.summaryText}>
            En Uzun Kelime: {summary.longestWord}
          </Text>
          <Text style={styles.summaryText}>
            Toplam Süre: {formatTotalDuration(summary.totalDurationInSeconds)}
          </Text>
        </View>

        {history.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Henüz kayıt yok</Text>
            <Text style={styles.emptyText}>
              İlk oyunu bitirdiğinde skor geçmişi burada görünecek.
            </Text>
          </View>
        ) : (
          history.map((item, index) => (
            <View key={item.id} style={styles.gameCard}>
              <Text style={styles.gameCardTitle}>Oyun {history.length - index}</Text>
              <Text style={styles.gameCardText}>
                Tarih: {formatDate(item.playedAt)}
              </Text>
              <Text style={styles.gameCardText}>
                Grid: {item.gridSize}x{item.gridSize}
              </Text>
              <Text style={styles.gameCardText}>Puan: {item.score}</Text>
              <Text style={styles.gameCardText}>
                Kelime Sayısı: {item.foundWordCount}
              </Text>
              <Text style={styles.gameCardText}>
                En Uzun Kelime: {item.longestWord}
              </Text>
              <Text style={styles.gameCardText}>
                Süre: {formatDuration(item.durationInSeconds)}
              </Text>
            </View>
          ))
        )}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ScoreboardScreen;

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
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E6D7BE',
    marginBottom: 18,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7A4E00',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 15,
    color: '#3B2F2F',
    marginBottom: 8,
  },
  emptyCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E6D7BE',
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7A4E00',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#5C4B51',
    lineHeight: 22,
  },
  gameCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E6D7BE',
    marginBottom: 18,
  },
  gameCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7A4E00',
    marginBottom: 12,
  },
  gameCardText: {
    fontSize: 15,
    color: '#3B2F2F',
    marginBottom: 8,
  },
  backButton: {
    backgroundColor: '#D98E04',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});