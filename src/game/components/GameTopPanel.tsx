import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
    gridSize: number;
    remainingMoves: number;
    score: number;
    onExitPress: () => void;
    isGameFinished: boolean;
};

const GameTopPanel: React.FC<Props> = ({
    gridSize,
    remainingMoves,
    score,
    onExitPress,
    isGameFinished,
}) => {
    return(
        <>
        <View style={styles.topBar}>
            <TouchableOpacity style={styles.exitButton} onPress={onExitPress}>
            <Text style={styles.exitButtonText}>Oyundan Çık</Text>
            </TouchableOpacity>
        </View>

        <Text style={styles.header}>
            Grid: {gridSize}x{gridSize} | Kalan Hamle: {remainingMoves}
        </Text>

        <Text style={styles.scoreText}>Skor: {score}</Text>

        {isGameFinished && (
            <View style={styles.gameOverBox}>
            <Text style={styles.gameOverTitle}>Oyun Bitti</Text>
            <Text style={styles.gameOverText}>
                Oyun sonucu skor tablosuna kaydedildi.
            </Text>
            </View>
        )}
        </>
    );
};

export default GameTopPanel;

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  exitButton: {
    backgroundColor: '#8C7B75',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  exitButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  header: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#3B2F2F',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D98E04',
    marginBottom: 12,
  },
  gameOverBox: {
    backgroundColor: '#FFF4E8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D98E04',
    padding: 12,
    marginBottom: 16,
  },
  gameOverTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#A35F00',
    marginBottom: 6,
  },
  gameOverText: {
    fontSize: 14,
    color: '#5C4B51',
    lineHeight: 20,
  },
});