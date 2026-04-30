import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GameHistoryItem } from "../../types/game";
import { formatDuration } from "../utils/formatHelpers";

type Props = {
    visible: boolean;
    result: GameHistoryItem | null;
    onGoHome: () => void;
};

const GameEndModal: React.FC<Props> = ({visible, result, onGoHome}) => {
    if (!result) {
        return null;
    }

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.backdrop}>
                <View style={styles.card}>
                    <View style={styles.iconBox}>
                        <Text style={styles.icon}>🏆</Text>
                    </View>

                    <Text style={styles.title}>Oyun Bitti</Text>
                    <Text style={styles.description}>Sonucun skor tablosuna kaydedildi</Text>

                    <View style={styles.scoreCard}>
                        <Text style={styles.scoreLabel}>Skor</Text>
                        <Text style={styles.scoreValue}>{result.score}</Text>
                    </View>

                    <View style={styles.detailGrid}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>En Uzun Kelime</Text>
                            <Text style={styles.detailValue}>{result.longestWord}</Text>
                        </View>

                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Toplam Süre</Text>
                            <Text style={styles.detailValue}>{formatDuration(result.durationInSeconds)}</Text>
                        </View>

                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Bulunan Kelime</Text>
                            <Text style={styles.detailValue}>{result.foundWordCount}</Text>
                        </View>

                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Grid</Text>
                            <Text style={styles.detailValue}>{result.gridSize}x{result.gridSize}</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.homeButton} onPress={onGoHome}>
                        <Text style={styles.homeButtonText}>Ana Ekrana Dön</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default GameEndModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(59, 47, 47, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E6D7BE',
    alignItems: 'center',
  },
  iconBox: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: '#FFF7D6',
    borderWidth: 1,
    borderColor: '#E7CF77',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  icon: {
    fontSize: 34,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#3B2F2F',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#5C4B51',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 18,
  },
  scoreCard: {
    width: '100%',
    backgroundColor: '#FFF7D6',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E7CF77',
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#7A4E00',
    fontWeight: '700',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 40,
    color: '#D98E04',
    fontWeight: '900',
  },
  detailGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  detailItem: {
    flexGrow: 1,
    flexBasis: '47%',
    backgroundColor: '#F8F4E8',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE2CC',
    padding: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#8C7B75',
    fontWeight: '700',
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 16,
    color: '#3B2F2F',
    fontWeight: '900',
  },
  homeButton: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    backgroundColor: '#D98E04',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
});