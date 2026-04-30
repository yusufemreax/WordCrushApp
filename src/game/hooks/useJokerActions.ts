import { use, useCallback, useMemo, useState } from "react";
import { ActiveJokerType, Cell, CellPosition, JokerInventory, JokerType } from "../../types/game"
import { consumeJoker, getActiveJokerLabel, getAllGridCellPositions, getFishRemovalCount, getRandomCellsForFish, getWheelAffectedCells, shuffleGridCells, swapGridCells } from "../services/jokerService";
import { getJokerInventory } from "../../storage/marketStorage";
import { GAME_MESSAGES } from "../constants/gameMessages";
import { isAdjacentCell } from "../utils/cellHelper";
import { Alert } from "react-native";

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

type UseJokerActionsParams = {
  grid: Cell[][];
  gridSize: number;
  setGrid: (grid: Cell[][]) => void;
  setAvailableWords: (words: string[]) => void;
  analyzeGridWords: (grid: Cell[][]) => void;
  animateCellRemoval: (
    args: AnimateCellRemovalArgs,
  ) => Promise<AnimateCellRemovalResult>;
  setLastResultMessage: (message: string) => void;
};

const DEFAULT_JOKER_INVENTORY: JokerInventory = {
  fish: 0,
  wheel: 0,
  lollipop: 0,
  swap: 0,
  shuffle: 0,
  party: 0,
};

export const useJokerActions = ({
    grid,
    gridSize,
    setGrid,
    setAvailableWords,
    analyzeGridWords,
    animateCellRemoval,
    setLastResultMessage,
} : UseJokerActionsParams) => {
    const [jokerInventory, setJokerInventoryState] = useState<JokerInventory>(DEFAULT_JOKER_INVENTORY);
    const [activeJoker, setActiveJoker] = useState<ActiveJokerType>(null);
    const [pendingSwapCell, setPendingSwapCell] = useState<CellPosition | null>(null);

    const activeJokerLabel = useMemo(() => {
        if (pendingSwapCell) {
            return 'Serbest Değiştirme: ikinci hücreyi seç';
        }

        return getActiveJokerLabel(activeJoker);
    }, [activeJoker, pendingSwapCell]);

    const loadJokerInventory = useCallback(async () => {
        const inventory = await getJokerInventory();
        setJokerInventoryState(inventory);
    }, []);

    const clearActiveJoker = useCallback(() => {
        setActiveJoker(null);
        setPendingSwapCell(null);
    }, []);

    const consumeAndUpdateInventory = useCallback( async (jokerType: JokerType) => {
        const updatedInventory = await consumeJoker(jokerInventory, jokerType);

        setJokerInventoryState(updatedInventory);
    }, [jokerInventory]);

    const handleToggleJoker = useCallback((joker: ActiveJokerType) => {
        setPendingSwapCell(null);
        setActiveJoker(joker);
    }, []);

    const removeCellsWithAnimation = useCallback(async (targetCells: CellPosition[]) => {
        const result = await animateCellRemoval({
            grid,
            targetCells,
            setGrid,
            setAvailableWords,
        });

        analyzeGridWords(result.updatedGrid);

        return result;
    }, [analyzeGridWords, animateCellRemoval, grid, setAvailableWords, setGrid]);

    const handleLollipopJoker = useCallback(async (pressedCell: CellPosition) => {
        await removeCellsWithAnimation([pressedCell]);
        await consumeAndUpdateInventory('lollipop');

        clearActiveJoker();
        setLastResultMessage(GAME_MESSAGES.lollipopUsed);

        return true;
    }, [clearActiveJoker, consumeAndUpdateInventory, removeCellsWithAnimation, setLastResultMessage]);

    const handleFishJoker = useCallback(async () => {
        const randomCells = getRandomCellsForFish(grid, getFishRemovalCount(gridSize));

        await removeCellsWithAnimation(randomCells);
        await consumeAndUpdateInventory('fish');

        clearActiveJoker();
        setLastResultMessage(`Balık Jokeri Kullanıldı. ${randomCells.length} rastgele harf üretildi`);

        return true;
    }, [clearActiveJoker, consumeAndUpdateInventory, grid, removeCellsWithAnimation, setLastResultMessage]);

    const handleWheelJoker = useCallback(async (pressedCell: CellPosition) => {
        const affectedCells = getWheelAffectedCells(gridSize, pressedCell);

        await removeCellsWithAnimation(affectedCells);
        await consumeAndUpdateInventory('wheel');

        clearActiveJoker();
        setLastResultMessage(GAME_MESSAGES.wheelUsed);

        return true;
    }, [clearActiveJoker, consumeAndUpdateInventory, gridSize, removeCellsWithAnimation, setLastResultMessage]);

    const handleShuffleJoker = useCallback(async () => {
        const shuffledGrid = shuffleGridCells(grid);

        setGrid(shuffledGrid);
        analyzeGridWords(shuffledGrid);

        await consumeAndUpdateInventory('shuffle');

        clearActiveJoker();
        setLastResultMessage(GAME_MESSAGES.shuffleUsed);

        return true;
    }, [analyzeGridWords, clearActiveJoker, consumeAndUpdateInventory, grid, setGrid, setLastResultMessage]);

    const handlePartyJoker = useCallback(async () => {
        const allCells = getAllGridCellPositions(gridSize);

        await removeCellsWithAnimation(allCells);
        await consumeAndUpdateInventory('party');

        clearActiveJoker();
        setLastResultMessage(GAME_MESSAGES.partyUsed);

        return true;
    }, [clearActiveJoker, consumeAndUpdateInventory, gridSize, removeCellsWithAnimation, setLastResultMessage]);

    const handleSwapJoker = useCallback(async (pressedCell: CellPosition) => {
        if (!pendingSwapCell) {
            setPendingSwapCell(pressedCell);
            setLastResultMessage(GAME_MESSAGES.firstSwapUsed);

            return true;
        }

        if (pendingSwapCell.row == pressedCell.row && pendingSwapCell.col === pressedCell.col) {
            setLastResultMessage(GAME_MESSAGES.swapSameCell);
            return true;
        }

        if (!isAdjacentCell(pendingSwapCell, pressedCell)) {
            Alert.alert(GAME_MESSAGES.invalidSelectionTitle, GAME_MESSAGES.invalidSelectionNotAdjacent);
            return true;
        }

        const swappedGrid = swapGridCells(grid, pendingSwapCell, pressedCell);

        setGrid(swappedGrid);
        analyzeGridWords(swappedGrid);

        await consumeAndUpdateInventory('swap');

        clearActiveJoker();
        setLastResultMessage(GAME_MESSAGES.secondSwapUsed);

        return true;
    }, [analyzeGridWords, clearActiveJoker, consumeAndUpdateInventory, grid, pendingSwapCell, setGrid, setLastResultMessage]);

    const handleActiveJokerPress = useCallback(async (pressedCell: CellPosition) => {
        if (!activeJoker) {
            return false;
        }

        if (activeJoker === 'lollipop') {
            return handleLollipopJoker(pressedCell);
        }

        if (activeJoker === 'fish') {
            return handleFishJoker();
        }

        if (activeJoker === 'wheel') {
            return handleShuffleJoker();
        }

        if (activeJoker === 'shuffle') {
            return handleShuffleJoker();
        }

        if (activeJoker === 'party') {
            return handlePartyJoker();
        }

        if (activeJoker === 'swap') {
            return handleSwapJoker(pressedCell);
        }

        return false;
    }, [activeJoker, handleFishJoker, handleLollipopJoker, handlePartyJoker, handleShuffleJoker, handleSwapJoker, handleWheelJoker]);

    return {
        jokerInventory,
        activeJoker,
        activeJokerLabel,
        pendingSwapCell,
        loadJokerInventory,
        handleToggleJoker,
        handleActiveJokerPress,
        clearActiveJoker,
    };
};