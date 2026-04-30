import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, BackHandler, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { generateGrid } from "../game/utils/generateGrid";
import { isAdjacentCell, isCellSelected, isSameCell } from "../game/utils/cellHelper";
import { findWordPathsInGrid } from "../game/utils/findWordPathsInGrid";
import { selectNonOverlappingWords } from "../game/utils/nonOverlappingWordHelpers";
import { regeneratePlayableGridPreservingSpecialTiles } from "../game/utils/gridRefreshHelpers";

import { buildGameHistoryItem, saveGameHistoryItem } from "../game/services/gameResultService";

import { useGameAnimations } from "../game/services/useGameAnimations";

import { RootStackParamList } from "../types/navigation";
import { Cell, CellPosition, GameHistoryItem } from "../types/game";

import { GAME_MESSAGES } from "../game/constants/gameMessages";

import { useJokerActions } from "../game/hooks/useJokerActions";
import { useWordSelectionActions } from "../game/hooks/useWordSelectionActions";

import GameTopPanel from "../game/components/GameTopPanel";
import GameGridBoard from "../game/components/GameGridBoard";
import GameSelectionPanel from "../game/components/GameSelectionPanel";
import GameResultPanel from "../game/components/GameResultPanel";
import JokerBar from "../game/components/JokerBar";
import GameInfoPanel from "../game/components/GameInfoPanel";
import GameEndModal from "../game/components/GameEndModal";

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
  const [isBoardGestureActive, setIsBoardGestureActive] = useState(false);
  const [availableNonOverlappingWords, setAvailableNonOverlappingWords] = useState<string[]>([]);
  const [isEndModalVisible, setIsEndModalVisible] = useState(false);
  const [gameEndResult, setGameEndResult] = useState<GameHistoryItem | null>(null);
  
  const gameStartedAtRef = useRef(Date.now());
  const hasSavedGameRef = useRef(false);
  const selectedCellsRef = useRef<CellPosition[]>([]);
  const scoreRef = useRef(0);
  const foundWordsRef = useRef<string[]>([]);
  const isFinishingGameRef = useRef(false);

  const analyzeGridWords = (targetGrid: Cell[][]) => {
    const wordPaths = findWordPathsInGrid(targetGrid);
    const foundWords = wordPaths.map(item => item.word);
    const nonOverlappingWords = selectNonOverlappingWords(wordPaths).map(item => item.word);

    setAvailableWords(foundWords);
    setAvailableNonOverlappingWords(nonOverlappingWords);

    return {foundWords, nonOverlappingWords};
  };

  const {
    animateCellRemoval,
    columnFallAnimsRef,
    columnOpacityAnimsRef,
    explodingCells,
    isResolvingMove,
  } = useGameAnimations(gridSize);
  
  const { jokerInventory, activeJoker, activeJokerLabel, loadJokerInventory, handleToggleJoker, handleActiveJokerPress} = useJokerActions({grid, gridSize, setGrid, setAvailableWords, analyzeGridWords, animateCellRemoval, setLastResultMessage});

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    foundWordsRef.current = foundWords;
  }, [foundWords]);

  useEffect(() => {
    selectedCellsRef.current = selectedCells;
  }, [selectedCells]);

  useEffect(() => {
    const initiliazeGame = async () => {
      const generated = generateGrid(gridSize);
      setGrid(generated);
      analyzeGridWords(generated);

      await loadJokerInventory();
    }

    initiliazeGame();
  }, [gridSize, loadJokerInventory]);

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
    const handleNoAvailableWords = () => {
      if (grid.length === 0 || isGameFinished || isResolvingMove) {
        return;
      }

      if (availableWords.length > 0) {
        return;
      }

      const {regeneratedGrid, regeneratedWords} =
        regeneratePlayableGridPreservingSpecialTiles(grid, gridSize);

      setGrid(regeneratedGrid);

      analyzeGridWords(regeneratedGrid);

      setSelectedCells([]);
      selectedCellsRef.current = [];

      setLastResultMessage(
        'Gridde oluşturulabilir kelime kalmadı. Grid yenilendi. Varsa özel güçlerin konumu korundu.',
      );
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

  const handleSelectionStart = async (row: number, col: number) => {
    if (isGameFinished || isResolvingMove) {
      return;
    }

    const pressedCell: CellPosition = {row, col};

    if (activeJoker) {
      const handled = await handleActiveJokerPress(pressedCell);

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

    const lastSelectedCell = currentSelectedCells[currentSelectedCells.length - 1];

    if (isSameCell(lastSelectedCell, pressedCell)) {
      return;
    }

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
            navigation.replace('Home');
          },
        },
      ],
    );
  };

  const saveGameResult = async (): Promise<GameHistoryItem> => {

    const historyItem = buildGameHistoryItem({
      gridSize,
      score: scoreRef.current,
      foundWords: foundWordsRef.current,
      startedAt: gameStartedAtRef.current,
    });

    if (hasSavedGameRef.current) {
      return historyItem;
    }

    hasSavedGameRef.current = true;
    await saveGameHistoryItem(historyItem);

    return historyItem;
  };

  const finishGameAndGoHome = async () => {
    if (isFinishingGameRef.current) {
      return;
    }

    isFinishingGameRef.current = true;

    setIsGameFinished(true);
    setLastResultMessage('Oyun bitti. Sonuç skor tablosuna kaydedildi.');

    const historyItem = await saveGameResult();

    setGameEndResult(historyItem);
    setIsEndModalVisible(true);
  };

  const handleEndModalGoHome = () => {
    setIsEndModalVisible(false);
    navigation.replace('Home');
  };

  const { resetSelection, handleSubmitSelection} = useWordSelectionActions({
    grid,
    remainingMoves,
    isGameFinished,
    isResolvingMove,
    selectedCellsRef,
    scoreRef,
    foundWordsRef,
    setSelectedCells,
    setRemainingMoves,
    setGrid,
    setAvailableWords,
    setScore,
    setFoundWords,
    setLastResultMessage,
    analyzeGridWords,
    animateCellRemoval,
    finishGameAndGoHome,
  });

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

        <GameInfoPanel
          availableWordCount={availableNonOverlappingWords.length}
          totalFoundWordCount={foundWords.length}
        />

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
          currentWord={currentWord}
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

      <GameEndModal
        visible={isEndModalVisible}
        result={gameEndResult}
        onGoHome={handleEndModalGoHome}
      />
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
  scrollContent: {
    paddingBottom: 24,
  },
});