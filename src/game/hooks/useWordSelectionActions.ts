import { Dispatch, RefObject, SetStateAction, useCallback } from "react";
import { Cell, CellPosition } from "../../types/game"
import { calculateComboResult } from "../utils/comboHelpers";
import { getTriggeredSpecialCellsFromSelection, getTriggeredSpecialTileCountFromSelection } from "../utils/specialTileTriggerHelpers";
import { applySpecialTileToLastCell, getSpecialTileByWordLength } from "../utils/specialTileHelpers";
import { GAME_MESSAGES } from "../constants/gameMessages";
import { isValidWord } from "../utils/wordValidation";

type AnimateCellRemovalArgs = {
    grid: Cell[][];
    targetCells: CellPosition[];
    setGrid: (grid: Cell[][]) => void;
    setAvailableWords: (words: string[]) => void;
};

type AnimateCellRemovalResult = {
    updatedGrid: Cell[][];
    updatedWords: string[];
};

type UseWordSelectionActionsParams = {
  grid: Cell[][];
  remainingMoves: number;
  isGameFinished: boolean;
  isResolvingMove: boolean;
  selectedCellsRef: RefObject<CellPosition[]>;
  scoreRef: RefObject<number>;
  foundWordsRef: RefObject<string[]>;
  setSelectedCells: Dispatch<SetStateAction<CellPosition[]>>;
  setRemainingMoves: Dispatch<SetStateAction<number>>;
  setGrid: Dispatch<SetStateAction<Cell[][]>>;
  setAvailableWords: Dispatch<SetStateAction<string[]>>;
  setScore: Dispatch<SetStateAction<number>>;
  setFoundWords: Dispatch<SetStateAction<string[]>>;
  setLastResultMessage: Dispatch<SetStateAction<string>>;
  analyzeGridWords: (grid: Cell[][]) => void;
  animateCellRemoval: (
    args: AnimateCellRemovalArgs,
  ) => Promise<AnimateCellRemovalResult>;
  finishGameAndGoHome: () => Promise<void>;
};

export const useWordSelectionActions = ({
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
} : UseWordSelectionActionsParams) => {
    const resetSelection = useCallback(() => {
        if (isGameFinished || isResolvingMove) {
            return;
        }

        selectedCellsRef.current = [];
        setSelectedCells([]);
    }, [isGameFinished, isResolvingMove, selectedCellsRef, setSelectedCells]);

    const clearSelectionForce = useCallback(() => {
        selectedCellsRef.current = [];
        setSelectedCells([]);
    }, [selectedCellsRef, setSelectedCells]);

    const buildWordFromSelection = useCallback((selectedCellsSnapshot: CellPosition[]) => {
        return selectedCellsSnapshot.map(position => grid[position.row]?.[position.col]?.letter ?? '').join('');
    }, [grid]);

    const handleValidWordSelection = useCallback(async (word: string, selectedCellsSnapshot: CellPosition[], nextRemainingMoves: number) => {
        const comboResult = calculateComboResult(word);
        const lastCell = selectedCellsSnapshot[selectedCellsSnapshot.length - 1];

        clearSelectionForce();

        const trigerredSpecialCount = getTriggeredSpecialTileCountFromSelection(grid, selectedCellsSnapshot);

        const uniqueCellsToRemove = getTriggeredSpecialCellsFromSelection(grid, selectedCellsSnapshot);

        const animationResult = await animateCellRemoval({
            grid,
            targetCells: uniqueCellsToRemove,
            setGrid,
            setAvailableWords,
        });

        const specialTile = getSpecialTileByWordLength(word.length);
        let finalGrid = animationResult.updatedGrid;

        if (specialTile && lastCell) {
            finalGrid = applySpecialTileToLastCell(animationResult.updatedGrid,  lastCell, specialTile);

            setGrid(finalGrid);
        }

        analyzeGridWords(finalGrid);

        const updatedScore = scoreRef.current + comboResult.totalScore;
        const updatedFoundWords = [...foundWordsRef.current, word];

        scoreRef.current = updatedScore;
        foundWordsRef.current = updatedFoundWords;

        setScore(updatedScore);
        setFoundWords(updatedFoundWords);

        const comboLabel = comboResult.words.length > 1 ? ` • ${comboResult.words.length}x combo` : '';

        const specialTileLabel = specialTile ? ` • Özel Güç oluştu: ${specialTile}`: '';

        const triggeredLabel = trigerredSpecialCount > 0 ? ` • Tetiklenen güç sayısı: ${trigerredSpecialCount}` : '';

        setLastResultMessage(`Geçerli kelime: ${word}${comboLabel} • +${comboResult.totalScore} puan • Kelimeler: ${comboResult.words.join(', ')}${specialTileLabel}${triggeredLabel} • Harfler patlatıldı • 1 hamle düşüldü`);

        if (nextRemainingMoves === 0) {
            await finishGameAndGoHome();
        }
    }, [
        analyzeGridWords,
        animateCellRemoval,
        clearSelectionForce,
        finishGameAndGoHome,
        foundWordsRef,
        grid,
        scoreRef,
        setAvailableWords,
        setFoundWords,
        setGrid,
        setLastResultMessage,
        setScore,
    ]);

    const handleInvalidWordSelection = useCallback(async (word: string, nextRemainingWords: number) => {
        clearSelectionForce();

        setLastResultMessage(`${GAME_MESSAGES.invalidSelectionTitle} ${word} • 1 hamle düşüldü`);

        if (nextRemainingWords === 0) {
            await finishGameAndGoHome();
        }
    }, [clearSelectionForce, finishGameAndGoHome, setLastResultMessage]);

    const handleSubmitSelection = useCallback(async () => {
        if (isGameFinished || isResolvingMove || remainingMoves <= 0) {
            return;
        }

        const nextRemainingMoves = Math.max(remainingMoves - 1, 0);
        const selectedCellsSnapshot = [...selectedCellsRef.current];

        if (selectedCellsSnapshot.length < 3) {
            setRemainingMoves(nextRemainingMoves);
            setLastResultMessage(GAME_MESSAGES.invalidShortSelectionMoveLost);
            clearSelectionForce();
            
            if (nextRemainingMoves === 0) {
                await finishGameAndGoHome();
            }

            return;
        }

        const word = buildWordFromSelection(selectedCellsSnapshot);
        const valid = isValidWord(word);

        setRemainingMoves(nextRemainingMoves);

        if (valid) {
            await handleValidWordSelection(word, selectedCellsSnapshot, nextRemainingMoves);

            return;
        }

        await handleInvalidWordSelection(word, nextRemainingMoves);
    }, [
        buildWordFromSelection,
        clearSelectionForce,
        finishGameAndGoHome,
        handleInvalidWordSelection,
        handleValidWordSelection,
        isGameFinished,
        isResolvingMove,
        remainingMoves,
        selectedCellsRef,
        setLastResultMessage,
        setRemainingMoves,
    ]);

    return {resetSelection, handleSubmitSelection};
};