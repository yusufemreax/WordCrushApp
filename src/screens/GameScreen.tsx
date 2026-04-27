import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { ActiveJokerType, Cell, CellPosition, JokerInventory } from "../types/game";
import { useEffect, useMemo, useRef, useState } from "react";
import { generateGrid } from "../game/utils/generateGrid";
import { Alert, BackHandler, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { findWordsInGrid } from "../game/utils/findWordsInGrid";
import { isAdjacentCell, isCellSelected, isSameCell } from "../game/utils/cellHelper";
import { isValidWord } from "../game/utils/wordValidation";
import { getJokerInventory} from "../storage/marketStorage";
import { buildGameHistoryItem, saveGameHistoryItem } from "../game/services/gameResultService";
import { useGameAnimations } from "../game/services/useGameAnimations";
import { consumeJoker, getActiveJokerLabel, getAllGridCellPositions, getFishRemovalCount, getRandomCellsForFish, getWheelAffectedCells, shuffleGridCells, swapGridCells } from "../game/services/jokerService";
import GameTopPanel from "../game/components/GameTopPanel";
import GameGridBoard from "../game/components/GameGridBoard";
import GameSelectionPanel from "../game/components/GameSelectionPanel";
import GameResultPanel from "../game/components/GameResultPanel";
import JokerBar from "../game/components/JokerBar";
import { calculateComboResult } from "../game/utils/comboHelpers";
import { applySpecialTileToLastCell, collectSpecialTileAffectedCells, getSpecialTileByWordLength } from "../game/utils/specialTileHelpers";
import { getAllSpecialTilePositions, hasAnySpecialTile } from "../game/utils/gridStateHelpers";
import { GAME_MESSAGES } from "../game/constants/gameMessages";
import { getTriggeredSpecialCellsFromSelection, getTriggeredSpecialTileCountFromSelection } from "../game/utils/specialTileTriggerHelpers";
import { uniqueCellPositions } from "../game/utils/cellPositionHelpers";

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

const GameScreen: React.FC<Props> = ({route, navigation}) => {
  const {gridSize, moveCount} = route.params;

  const [grid, setGrid] = useState<Cell[][]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<CellPosition[]>([]);
  const [remainingMoves, setRemainingMoves] = useState(Number.parseInt(moveCount.toString()));
  const [lastResultMessage, setLastResultMessage] = useState('Henüz kelime kontrol edilmedi.');
  const [score, setScore] = useState(0);
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [jokerInventory, setLocalJokerInventory] = useState<JokerInventory>({
    fish: 0,
    wheel:0,
    lollipop:0,
    swap:0,
    shuffle:0,
    party:0,
  });
  const [activeJoker, setActiveJoker] = useState<ActiveJokerType>(null);
  const [isBoardGestureActive, setIsBoardGestureActive] = useState(false);
  const [pendingSwapCell, setPendingSwapCell] = useState<CellPosition | null>(null,);

  const gameStartedAtRef = useRef(Date.now());
  const hasSavedGameRef = useRef(false);
  const selectedCellsRef = useRef<CellPosition[]>([]);

  useEffect(() => {
    selectedCellsRef.current = selectedCells;
  }, [selectedCells]);

  const {
    animateCellRemoval,
    columnFallAnimsRef,
    columnOpacityAnimsRef,
    explodingCells,
    isResolvingMove,
  } = useGameAnimations(gridSize);

  useEffect(() => {
    const initiliazeGame = async () => {
      const generated = generateGrid(gridSize);
      
      const foundWords = findWordsInGrid(generated);
      
      refreshGridState(generated, foundWords);

      const inventory = await getJokerInventory();
      setLocalJokerInventory(inventory);
    }

    initiliazeGame();
  }, [gridSize]);

  useEffect(() => {
    if(remainingMoves === 0) {
      setIsGameFinished(true);
      setLastResultMessage('Oyun bitti. Hamle Hakkın tükendi.')
    }
  }, [remainingMoves]);

  useEffect(() => {
    const saveFinishedGame = async () => {
      if(!isGameFinished || hasSavedGameRef.current) {
        return;
      }

      await saveGameResult();
    }
    
    saveFinishedGame();
  }, [isGameFinished]);

  const currentWord = useMemo(() => {
      return selectedCells
          .map(position => {
            const cell = grid[position.row]?.[position.col];

            if (!cell) {
              return '';
            }

            return cell.letter ?? '';
          })
          .join('');
  }, [grid, selectedCells]);

  useEffect(() => {
    const handleNoAvailableWords = async () => {
      if (grid.length === 0 || isGameFinished || isResolvingMove) {
        return;
      }
      
      const specialTileExists = hasAnySpecialTile(grid);
      
      if (availableWords.length !== 0) return;

      if (specialTileExists) {
        await triggerAllSpecialTilesAutomatically();
        return;
      }
      
      let regeneratedGrid = generateGrid(gridSize);
      let regenaretedWords = findWordsInGrid(regeneratedGrid);
      let retryCount = 0;

      while (regenaretedWords.length === 0 && retryCount < 5) {
        regeneratedGrid = generateGrid(gridSize);
        regenaretedWords = findWordsInGrid(regeneratedGrid);
        retryCount++;
      }
      
      refreshGridState(regeneratedGrid,regenaretedWords);
      setSelectedCells([]);
      setLastResultMessage(GAME_MESSAGES.regeneratedNoWordsNoSpecials);
    };

    handleNoAvailableWords();
  }, [availableWords, grid, gridSize, isGameFinished, isResolvingMove]);

  useEffect(() => {
    const backAction = () => {
      handleExitGame();
      return true;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => subscription.remove();
  }, [score, foundWords, gridSize]);

  const resetSelection = () => {
    if(isGameFinished || isResolvingMove) {
      return;
    }
    selectedCellsRef.current = [];
    setSelectedCells([]);
  };

  const handleToggleJoker = (joker: ActiveJokerType) => {
    setPendingSwapCell(null);
    setActiveJoker(joker);
  };

  const handleActiveJokerPress = async (
    joker: ActiveJokerType,
    pressedCell: CellPosition,
  ) => {
    if (joker === 'lollipop') {
      const updatedInventory = await consumeJoker(jokerInventory, 'lollipop');

      await animateCellRemoval({
        grid,
        targetCells: [pressedCell],
        setGrid,
        setAvailableWords,
      });

      setLocalJokerInventory(updatedInventory);
      setActiveJoker(null);
      setPendingSwapCell(null);
      setLastResultMessage(GAME_MESSAGES.lollipopUsed);
      return true;
    }

    if (joker === 'fish') {
      const randomCells = getRandomCellsForFish(
        grid,
        getFishRemovalCount(gridSize),
      );

      const updatedInventory = await consumeJoker(jokerInventory, 'fish');

      await animateCellRemoval({
        grid,
        targetCells: randomCells,
        setGrid,
        setAvailableWords,
      });

      setLocalJokerInventory(updatedInventory);
      setActiveJoker(null);
      setPendingSwapCell(null);
      setLastResultMessage(
        `Balık jokeri kullanıldı. ${randomCells.length} rastgele harf yok edildi.`,
      );
      return true;
    }

    if (joker === 'wheel') {
      const affectedCells = getWheelAffectedCells(gridSize, pressedCell);
      const updatedInventory = await consumeJoker(jokerInventory, 'wheel');

      await animateCellRemoval({
        grid,
        targetCells: affectedCells,
        setGrid,
        setAvailableWords,
      });

      setLocalJokerInventory(updatedInventory);
      setActiveJoker(null);
      setPendingSwapCell(null);
      setLastResultMessage(
        'Tekerlek jokeri kullanıldı. Seçilen hücrenin satırı ve sütunu temizlendi.',
      );
      return true;
    }

    if (joker === 'shuffle') {
      const shuffledGrid = shuffleGridCells(grid);
      const updatedWords = findWordsInGrid(shuffledGrid);
      const updatedInventory = await consumeJoker(jokerInventory, 'shuffle');

      setGrid(shuffledGrid);
      setAvailableWords(updatedWords);
      setLocalJokerInventory(updatedInventory);
      setActiveJoker(null);
      setPendingSwapCell(null);
      setLastResultMessage('Harf Karıştırma kullanıldı. Grid karıştırıldı.');
      return true;
    }

    if (joker === 'party') {
      const allCells = getAllGridCellPositions(gridSize);
      const updatedInventory = await consumeJoker(jokerInventory, 'party');

      await animateCellRemoval({
        grid,
        targetCells: allCells,
        setGrid,
        setAvailableWords,
      });

      setLocalJokerInventory(updatedInventory);
      setActiveJoker(null);
      setPendingSwapCell(null);
      setLastResultMessage(
        'Parti Güçlendiricisi kullanıldı. Tüm grid yenilendi.',
      );
      return true;
    }

    if (joker === 'swap') {
      if (!pendingSwapCell) {
        setPendingSwapCell(pressedCell);
        setLastResultMessage(
          'Serbest Değiştirme aktif. Şimdi komşu ikinci hücreyi seç.',
        );
        return true;
      }

      if (
        pendingSwapCell.row === pressedCell.row &&
        pendingSwapCell.col === pressedCell.col
      ) {
        setLastResultMessage('Aynı hücre seçilemez. Komşu bir hücre seç.');
        return true;
      }

      if (!isAdjacentCell(pendingSwapCell, pressedCell)) {
        Alert.alert(
          'Geçersiz Seçim',
          'Serbest değiştirme için komşu bir hücre seçmelisin.',
        );
        return true;
      }

      const swappedGrid = swapGridCells(grid, pendingSwapCell, pressedCell);
      const updatedWords = findWordsInGrid(swappedGrid);
      const updatedInventory = await consumeJoker(jokerInventory, 'swap');

      setGrid(swappedGrid);
      setAvailableWords(updatedWords);
      setLocalJokerInventory(updatedInventory);
      setPendingSwapCell(null);
      setActiveJoker(null);
      setLastResultMessage(
        'Serbest Değiştirme kullanıldı. İki komşu hücrenin yeri değiştirildi.',
      );

      return true;
    }

    return false;
  };

  const handleSelectionStart = async (row: number, col: number) => {
    if (isGameFinished || isResolvingMove) {
      return;
    }

    const pressedCell: CellPosition = {row, col};

    if (activeJoker) {
      const handled = await handleActiveJokerPress(activeJoker, pressedCell);

      if (handled) {
        return;
      }
    }

    selectedCellsRef.current = [pressedCell];
    setSelectedCells([pressedCell]);
  };

  const handleSelectionMove = async (row: number, col: number) => {
    if (isGameFinished || isResolvingMove) {
      return;
    }

    const pressedCell: CellPosition = {row, col};
    const currentSelectedCells = selectedCellsRef.current;

    if (currentSelectedCells.length === 0) {
      selectedCellsRef.current = [pressedCell];
      setSelectedCells([pressedCell]);
      return;
    }

    const lastSelectedCell =
      currentSelectedCells[currentSelectedCells.length - 1];

    // Aynı son hücrenin içinde kalıyorsak hiçbir şey yapma
    if (isSameCell(lastSelectedCell, pressedCell)) {
      return;
    }

    // Geri gelme kontrolü:
    // A -> B -> C seçiliyken kullanıcı tekrar B'ye gelirse C kaldırılır
    if (currentSelectedCells.length >= 2) {
      const previousCell =
        currentSelectedCells[currentSelectedCells.length - 2];

      if (isSameCell(previousCell, pressedCell)) {
        const nextCells = currentSelectedCells.slice(0, -1);

        selectedCellsRef.current = nextCells;
        setSelectedCells(nextCells);
        return;
      }
    }

    // Daha önce seçilmiş ama bir önceki olmayan hücrelere geri dönmeye izin verme
    if (isCellSelected(currentSelectedCells, pressedCell)) {
      return;
    }

    if (!isAdjacentCell(lastSelectedCell, pressedCell)) {
      return;
    }

    const nextCells = [...currentSelectedCells, pressedCell];

    selectedCellsRef.current = nextCells;
    setSelectedCells(nextCells);
  };

  const handleSelectionEnd = async () => {
    if (isGameFinished || isResolvingMove) {
      return;
    }

    if (selectedCellsRef.current.length === 0) {
      return;
    }

    await handleSubmitSelection();
  };

  const handleSubmitSelection = async () => {
    if(isGameFinished || isResolvingMove || remainingMoves <= 0) {
      Alert.alert('Oyun bitti', 'Hamle hakkın kalmadı.');
      return;
    }
    const selectedCellsSnapshot = [...selectedCellsRef.current];

    if(selectedCellsSnapshot.length < 3) {
      setRemainingMoves(prev => Math.max(prev - 1, 0));
      setLastResultMessage(GAME_MESSAGES.invalidShortSelectionMoveLost);

      resetSelection();
      return;
    }

    const word = selectedCellsSnapshot
      .map(position => grid[position.row]?.[position.col]?.letter ?? '')
      .join('');

    const valid = isValidWord(word);

    setRemainingMoves(prev => Math.max(prev -1, 0));

    if(valid) {
      const comboResult = calculateComboResult(word);
      const lastCell = selectedCellsSnapshot[selectedCellsSnapshot.length - 1];
      
      selectedCellsRef.current = [];
      setSelectedCells([]);
      
      const triggeredSpecialCount = getTriggeredSpecialTileCountFromSelection(grid, selectedCellsSnapshot);

      const uniqueCellsToRemove = getTriggeredSpecialCellsFromSelection(grid, selectedCellsSnapshot);

      const animationResult = await animateCellRemoval({
        grid, 
        targetCells: uniqueCellsToRemove,
        setGrid,
        setAvailableWords,
      });

      const specialTile = getSpecialTileByWordLength(word.length);

      if (specialTile && lastCell) {
        const gridWithSpecialTile = applySpecialTileToLastCell(
          animationResult.updatedGrid,
          lastCell,
          specialTile,
        );

        setGrid(gridWithSpecialTile);
      }

      setScore(prev => prev + comboResult.totalScore);
      setFoundWords(prev => [...prev, word]);

      const comboLabel = comboResult.words.length > 1 ? ` • ${comboResult.words.length}x combo` : '';

      const specialTileLabel = specialTile ? ` • Özel Güç Oluştu: ${specialTile}` : '';

      const triggeredLabel = triggeredSpecialCount > 0 ? ` • Tetiklenen Güç Sayısı: ${triggeredSpecialCount}` : '';

    setLastResultMessage(`Geçerli kelime: ${word}${comboLabel} • +${comboResult.totalScore} puan • Kelimeler: ${comboResult.words.join(', ')}${specialTileLabel}${triggeredLabel} • Harfler patlatıldı • 1 hamle düşüldü.`,);
    } else {
      setLastResultMessage(`Geçersiz kelime: ${word} • 1 hamle düşüldü.`);
      Alert.alert('Geçersiz kelime', `"${word}" sözlükte bulunamadı.\n\nSeçim sıfırlandı ve 1 hamle düşüldü.`);
    }

    resetSelection();
  };

  const handleExitGame = () => {
    Alert.alert(GAME_MESSAGES.exitConfirmTitle, GAME_MESSAGES.exitConfirmMessage,
      [
        {
          text: 'Hayır',
          style: 'cancel',
        },
        {
          text: 'Evet',
          onPress: async () => {
            await saveGameResult();
            navigation.navigate('Home');
          },
        },
      ],
    );
  };

  const triggerAllSpecialTilesAutomatically = async () => {
    const specialTilePositions = getAllSpecialTilePositions(grid);

    if (specialTilePositions.length === 0) {
      return;
    }

    let affectedCells: CellPosition[] = [];

    specialTilePositions.forEach(position => {
      const cell = grid[position.row]?.[position.col];

      if (!cell?.specialTile) {
        return;
      }

      const collected = collectSpecialTileAffectedCells(grid, position, cell.specialTile);

      affectedCells = [...affectedCells, ...collected];
    });

    const uniqueCellsToRemove = uniqueCellPositions(affectedCells);

    if (uniqueCellsToRemove.length === 0) {
      return;
    }

    await animateCellRemoval({
      grid,
      targetCells: uniqueCellsToRemove,
      setGrid,
      setAvailableWords,
    });

    setLastResultMessage(`${GAME_MESSAGES.autoTriggeredSpecials} (${specialTilePositions.length})`,);
  };

  const saveGameResult = async () => {
    if (hasSavedGameRef.current) {
      return;
    }

    hasSavedGameRef.current = true;

    const historyItem = buildGameHistoryItem({
      gridSize,
      score,
      foundWords,
      startedAt: gameStartedAtRef.current,
    });

    await saveGameHistoryItem(historyItem);
  };

  const refreshGridState = (updatedGrid: Cell[][], updatedWords: string[]) => {
    setGrid(updatedGrid);
    setAvailableWords(updatedWords);
  };

  const activeJokerLabel = pendingSwapCell ? 'Serbest Değiştirme: ikinci hücreyi seç': getActiveJokerLabel(activeJoker);

  return(
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} scrollEnabled={!isBoardGestureActive}>

        <GameTopPanel
          gridSize={gridSize}
          remainingMoves={remainingMoves}
          score={score}
          onExitPress={handleExitGame}
          isGameFinished={isGameFinished}
        />

        <Text style={styles.subHeader}>Harfleri seçip kelime oluştur</Text>
        <Text style={styles.wordCountText}>Gridde Oluşturulabilir Kelime Sayısı: {availableWords.length}</Text>

        {availableWords.length > 0 && gridSize !== 10 && (
            <View style={styles.debugBox}>
                <Text style={styles.debugTitle}>Bulunan Kelimeler (test için)</Text>
                <Text style={styles.debugWords}>
                    {availableWords.slice(0, 10).join(', ')}
                </Text>
            </View>
        )}

        <GameSelectionPanel
          currentWord={currentWord}
          selectedCount={selectedCells.length}
          activeJokerLabel={activeJokerLabel}
        />

        <GameResultPanel message={lastResultMessage}/>
        
        <JokerBar
          inventory={jokerInventory}
          activeJoker={activeJoker}
          isResolvingMove={isResolvingMove}
          isGameFinished={isGameFinished}
          onToggleJoker={handleToggleJoker}
        />

        <GameGridBoard
          grid={grid}
          gridSize={gridSize}
          isGameFinished={isGameFinished}
          isResolvingMove={isResolvingMove}
          selectedCells={selectedCells}
          explodingCells={explodingCells}
          columnFallAnimsRef={columnFallAnimsRef}
          columnOpacityAnimsRef={columnOpacityAnimsRef}
          onSelectionStart={handleSelectionStart}
          onSelectionMove={handleSelectionMove}
          onSelectionEnd={handleSelectionEnd}
          onGestureActiveChange={setIsBoardGestureActive}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

export default GameScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F4E8',
    padding: 16,
  },
  subHeader: {
    fontSize: 14,
    color: '#6B5B57',
    marginBottom: 16,
  },
  wordCountText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#7A4E00',
    marginBottom: 12,
  },
  debugBox: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6D7BE',
    padding: 12,
    marginBottom: 16,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B2F2F',
    marginBottom: 6,
  },
  debugWords: {
    fontSize: 14,
    color: '#5C4B51',
    lineHeight: 20,
  },
  scrollContent: {
    paddingBottom: 24,
  },
});