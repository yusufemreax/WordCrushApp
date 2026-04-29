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
import ScoreStatCard from '../components/ScoreStatCard';
import {RootStackParamList} from '../types/navigation';
import {GameHistoryItem} from '../types/game';
import {
  clearGameHistory,
  getGameHistory,
} from '../storage/gameHistoryStorage';
import {
  formatDate,
  formatDuration,
  formatTotalDuration,
} from '../game/utils/formatHelpers';

type Props = NativeStackScreenProps<RootStackParamList, 'Scoreboard'>;

const ScoreboardScreen: React.FC<Props> = ({navigation}) => {
  const [history, setHistory] = useState<GameHistoryItem[]>([]);

  const loadHistory = async () => {
    const gameHistory = await getGameHistory();
    setHistory(gameHistory);
  };

  useFocusEffect(
    useCallback(() => {
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
            .filter(word => word && word !== '-')
            .sort((a, b) => b.length - a.length)[0] ?? '-'
        : '-';

    const totalDurationInSeconds = history.reduce(
      (total, item) => total + item.durationInSeconds,
      0,
    );

    const bestGame =
      history.length > 0
        ? [...history].sort((a, b) => b.score - a.score)[0]
        : null;

    return {
      totalGames,
      highestScore,
      averageScore,
      totalFoundWords,
      longestWord,
      totalDurationInSeconds,
      bestGame,
    };
  }, [history]);

  const handleClearHistory = () => {
    if (history.length === 0) {
      Alert.alert('Bilgi', 'Temizlenecek skor kaydı bulunmuyor.');
      return;
    }

    Alert.alert(
      'Skor Geçmişini Temizle',
      'Tüm skor geçmişini silmek istediğine emin misin?',
      [
        {
          text: 'Vazgeç',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await clearGameHistory();
            setHistory([]);
            Alert.alert('Başarılı', 'Skor geçmişi temizlendi.');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Skor Tablosu</Text>
            <Text style={styles.description}>
              Oynadığın oyunların performans özetini burada görebilirsin.
            </Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <ScoreStatCard title="Toplam Oyun" value={summary.totalGames} />
          <ScoreStatCard title="En Yüksek Puan" value={summary.highestScore} />
          <ScoreStatCard title="Ortalama Puan" value={summary.averageScore} />
          <ScoreStatCard
            title="Toplam Kelime"
            value={summary.totalFoundWords}
          />
          <ScoreStatCard
            title="En Uzun Kelime"
            value={summary.longestWord}
          />
          <ScoreStatCard
            title="Toplam Süre"
            value={formatTotalDuration(summary.totalDurationInSeconds)}
          />
        </View>

        {summary.bestGame && (
          <View style={styles.bestGameCard}>
            <Text style={styles.bestGameTitle}>En İyi Oyun</Text>
            <Text style={styles.bestGameScore}>
              {summary.bestGame.score} puan
            </Text>
            <Text style={styles.bestGameText}>
              Grid: {summary.bestGame.gridSize}x{summary.bestGame.gridSize} •{' '}
              Kelime: {summary.bestGame.foundWordCount} • Süre:{' '}
              {formatDuration(summary.bestGame.durationInSeconds)}
            </Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Oyun Geçmişi</Text>

          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearHistory}>
            <Text style={styles.clearButtonText}>Temizle</Text>
          </TouchableOpacity>
        </View>

        {history.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Henüz kayıt yok</Text>
            <Text style={styles.emptyText}>
              Bir oyunu tamamladığında skor geçmişi burada görünecek.
            </Text>
          </View>
        ) : (
          history.map((item, index) => (
            <View key={item.id} style={styles.gameCard}>
              <View style={styles.gameCardHeader}>
                <Text style={styles.gameCardTitle}>
                  Oyun #{history.length - index}
                </Text>
                <Text style={styles.gameDate}>{formatDate(item.playedAt)}</Text>
              </View>

              <View style={styles.gameInfoRow}>
                <Text style={styles.gameScore}>{item.score}</Text>
                <Text style={styles.gameScoreLabel}>puan</Text>
              </View>

              <View style={styles.gameDetails}>
                <Text style={styles.gameCardText}>
                  Grid: {item.gridSize}x{item.gridSize}
                </Text>
                <Text style={styles.gameCardText}>
                  Kelime: {item.foundWordCount}
                </Text>
                <Text style={styles.gameCardText}>
                  En Uzun: {item.longestWord}
                </Text>
                <Text style={styles.gameCardText}>
                  Süre: {formatDuration(item.durationInSeconds)}
                </Text>
              </View>
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
    paddingBottom: 28,
  },
  headerRow: {
    marginBottom: 22,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
  },
  bestGameCard: {
    backgroundColor: '#FFF7D6',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E7CF77',
    marginBottom: 22,
  },
  bestGameTitle: {
    fontSize: 15,
    color: '#7A4E00',
    fontWeight: '700',
    marginBottom: 8,
  },
  bestGameScore: {
    fontSize: 30,
    color: '#D98E04',
    fontWeight: '900',
    marginBottom: 6,
  },
  bestGameText: {
    fontSize: 14,
    color: '#5C4B51',
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#3B2F2F',
  },
  clearButton: {
    backgroundColor: '#8C7B75',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  clearButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
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
    marginBottom: 14,
  },
  gameCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#7A4E00',
  },
  gameDate: {
    fontSize: 13,
    color: '#8C7B75',
    fontWeight: '600',
  },
  gameInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 12,
    marginBottom: 10,
  },
  gameScore: {
    fontSize: 28,
    fontWeight: '900',
    color: '#D98E04',
    marginRight: 6,
  },
  gameScoreLabel: {
    fontSize: 14,
    color: '#5C4B51',
    marginBottom: 4,
  },
  gameDetails: {
    borderTopWidth: 1,
    borderTopColor: '#EFE2CC',
    paddingTop: 10,
  },
  gameCardText: {
    fontSize: 14,
    color: '#3B2F2F',
    marginBottom: 6,
  },
  backButton: {
    backgroundColor: '#D98E04',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});