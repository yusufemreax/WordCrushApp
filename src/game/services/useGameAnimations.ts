import { useRef, useState } from "react";
import { Cell, CellPosition } from "../../types/game";
import { Animated } from "react-native";
import { applyGravity, removeSelectedCells } from "../utils/gridOperations";
import { findWordsInGrid } from "../utils/findWordsInGrid";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getAffectedColumns = (cells: CellPosition[]): number[] => {
    return [...new Set(cells.map(cell => cell.col))];
};

const getColumnDropCounts = (cells: CellPosition[]): Record<number,number> => {
    return cells.reduce<Record<number,number>>((acc, cell) => {
      acc[cell.col] = (acc[cell.col] ?? 0) + 1;
      return acc;
    }, {});
};

export const useGameAnimations = (gridSize: number) => {
    const [isResolvingMove, setIsResolvingMove] = useState(false);
    const [explodingCells, setExplodingCells] = useState<CellPosition[]>([]);

    const columnFallAnimsRef = useRef(Array.from({length:gridSize},() => new Animated.Value(0)));
    const columnOpacityAnimsRef = useRef(Array.from({length: gridSize}, () => new Animated.Value(1)));

    const animateCellRemoval = async ({
        grid,
        targetCells,
        setGrid,
        setAvailableWords,
    } : {
        grid: Cell[][];
        targetCells: CellPosition[];
        setGrid: (grid: Cell[][]) => void;
        setAvailableWords: (words: string[]) => void;
    }) => {
        setIsResolvingMove(true);
        setExplodingCells(targetCells);

        await wait(260);

        const removedGrid = removeSelectedCells(grid, targetCells);
        setGrid(removedGrid as unknown as Cell[][]);
        setExplodingCells([]);

        await wait(180);
        
        const updatedGrid = applyGravity(removedGrid);
        const updatedWords = findWordsInGrid(updatedGrid);
        const affectedColumns = getAffectedColumns(targetCells);
        const columnDropCounts = getColumnDropCounts(targetCells);

        affectedColumns.forEach(col => {
            const removedCount = columnDropCounts[col] ?? 1;
            const dropDistance = -14 - removedCount * 12;

            columnFallAnimsRef.current[col].setValue(dropDistance);
            columnOpacityAnimsRef.current[col].setValue(0.82);
        });

        setGrid(updatedGrid);
        setAvailableWords(updatedWords);        

        await new Promise<void>(resolve => {
            Animated.parallel(
                affectedColumns.flatMap(col => [
                    Animated.sequence([
                        Animated.timing(columnFallAnimsRef.current[col], {
                            toValue: 5,
                            duration: 260,
                            useNativeDriver: true,
                        }),
                        Animated.timing(columnFallAnimsRef.current[col], {
                            toValue: 0,
                            duration: 110,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.timing(columnOpacityAnimsRef.current[col], {
                        toValue: 1,
                        duration: 260,
                        useNativeDriver: true,
                    }),
                ]),
            ).start(() => {
                setIsResolvingMove(false);
                resolve();
            });
        });

        return {
            updatedGrid,
            updatedWords,
        };
    };

    return {
        isResolvingMove,
        explodingCells,
        columnFallAnimsRef,
        columnOpacityAnimsRef,
        animateCellRemoval,
    };
};