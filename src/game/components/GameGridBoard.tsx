import React, { useMemo, useRef } from 'react';
import {Animated, LayoutChangeEvent, PanResponder, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View} from 'react-native';
import {Cell, CellPosition} from '../../types/game';
import {isSameCell} from '../utils/cellHelper';
import { getSpecialTileLabel } from '../utils/specialTileHelpers';
import { getCellFromTouch } from '../utils/gridTouchHelpers';

type Props = {
  grid: (Cell | null)[][];
  gridSize: number;
  isGameFinished: boolean;
  isResolvingMove: boolean;
  selectedCells: CellPosition[];
  explodingCells: CellPosition[];
  columnFallAnimsRef: React.RefObject<Animated.Value[]>;
  columnOpacityAnimsRef: React.RefObject<Animated.Value[]>;
  onSelectionStart: (row: number, col: number) => void | Promise<void>;
  onSelectionMove: (row: number, col: number) => void | Promise<void>;
  onSelectionEnd: () => void | Promise<void>;
  onGestureActiveChange: (active: boolean) => void;
};

const GameGridBoard: React.FC<Props> = ({
  grid,
  gridSize,
  isGameFinished,
  isResolvingMove,
  selectedCells,
  explodingCells,
  columnFallAnimsRef,
  columnOpacityAnimsRef,
  onSelectionStart,
  onSelectionMove,
  onSelectionEnd,
  onGestureActiveChange,
}) => {
  const isSelected = (row: number, col: number) => {
    return selectedCells.some(cell => isSameCell(cell, {row, col}));
  };

  const isExploding = (row: number, col: number) => {
    return explodingCells.some(cell => isSameCell(cell, {row, col}));
  };

  const {width} = useWindowDimensions();

  const cellSize = useMemo(() => {
    const horizontalPadding = 32;
    const boardHorizontalMargin = 8;
    const totalGapSpace = gridSize * 4;
    const availableWidth = width - horizontalPadding - boardHorizontalMargin;

    const rawSize = (availableWidth - totalGapSpace) / gridSize;

    if (gridSize === 10) {
      return Math.max(26, Math.min(32, rawSize));
    }

    if (gridSize === 8) {
      return Math.max(30, Math.min(40, rawSize));
    }

    return Math.max(38, Math.min(50, rawSize));
  }, [gridSize, width]);

  const cellGap = 4;

  const boardLayoutRef = useRef({
    pageX: 0,
    pageY: 0,
    width: 0,
    height: 0,
  });

  const handleBoardTouch = async (pageX: number, pageY: number, phase: 'start' | 'move') => {
    if (isGameFinished || isResolvingMove) {
      return;
    }

    const localX = pageX - boardLayoutRef.current.pageX;
    const localY = pageY - boardLayoutRef.current.pageY;
    const touchedCell = getCellFromTouch({x: localX, y: localY, cellSize, cellGap, gridSize});

    if (!touchedCell) {
      return;
    }

    if (phase === 'start') {
      await onSelectionStart(touchedCell.row, touchedCell.col);
      return;
    }

    await onSelectionMove(touchedCell.row, touchedCell.col);
  };

  const boardRef = useRef<View | null>(null);

  const handleLayout = (_event: LayoutChangeEvent) => {
    requestAnimationFrame(() => {
      boardRef.current?.measure((x, y, width, height, pageX, pageY) => {
        boardLayoutRef.current = {
          pageX,
          pageY,
          width,
          height,
        };
      });
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isGameFinished && !isResolvingMove,
      onMoveShouldSetPanResponder: () => !isGameFinished && !isResolvingMove,
      onPanResponderGrant: event => {
        onGestureActiveChange(true);
        const {pageX, pageY} = event.nativeEvent;
        handleBoardTouch(pageX, pageY, 'start');
      },
      onPanResponderMove: event => {
        const {pageX, pageY} = event.nativeEvent;
        handleBoardTouch(pageX, pageY, 'move');
      },
      onPanResponderRelease: async () => {
        onGestureActiveChange(false);
        await onSelectionEnd();
      },
      onPanResponderTerminate: async () => {
        onGestureActiveChange(false);
        await onSelectionEnd();
      },
    }),
  ).current;

  return (
    <View style={styles.grid}>
      <View 
        ref={boardRef}
        onLayout={handleLayout}
        {...panResponder.panHandlers}
        style={[styles.gridColumns, {width: gridSize * (cellSize + cellGap)}]}
      >
        {Array.from({length: gridSize}, (_, colIndex) => (
          <Animated.View
            key={`col-${colIndex}`}
            style={[
              styles.column,
              {
                transform: [{translateY: columnFallAnimsRef.current[colIndex]}],
                opacity: columnOpacityAnimsRef.current[colIndex],
              },
            ]}>
            {grid.map((row, rowIndex) => {
              const cell = row[colIndex];

              if (!cell) {
                return (
                  <View
                    key={`empty-${rowIndex}-${colIndex}`}
                    style={[styles.cellEmpty, {width: cellSize, height: cellSize}]}
                  />
                );
              }

              const selected = isSelected(cell.row, cell.col);
              const exploding = isExploding(cell.row, cell.col);

              return (
                <View
                  key={`${cell.row}-${cell.col}`}
                  style={[
                    styles.cell,
                    {
                      width: cellSize,
                      height: cellSize,
                    },
                    cell.specialTile && styles.specialCell,
                    selected && styles.cellSelected,
                    exploding && styles.cellExploding,
                ]}>
                  <Text
                    style={[
                      styles.letter,
                      {
                        fontSize: cell.specialTile
                          ? gridSize === 10 
                            ? 9
                            : gridSize === 8
                              ? 10
                              : 11
                          : gridSize === 10
                            ? 12
                            : gridSize === 8 
                              ? 14
                              : 16
                      },
                      selected && styles.letterSelected,
                      exploding && styles.letterExploding,
                    ]}>
                    {cell.specialTile ?`${cell.letter} ${getSpecialTileLabel(cell.specialTile)}`  : cell.letter}
                  </Text>
                </View>
              );
            })}
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

export default GameGridBoard;

const styles = StyleSheet.create({
  grid: {
    flex: 1,
    justifyContent: 'center',
  },
  gridColumns: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  cell: {
    margin: 2,
    backgroundColor: '#FFF',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6D7BE',
    overflow: 'hidden',
  },
  cellSelected: {
    backgroundColor: '#D98E04',
    borderColor: '#A35F00',
  },
  cellExploding: {
    transform: [{scale: 0.68}],
    opacity: 0.12,
  },
  letter: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B2F2F',
    textAlign: 'center',
  },
  letterSelected: {
    color: '#FFF',
  },
  letterExploding: {
    opacity: 0,
  },
  cellEmpty: {
    margin: 2,
    backgroundColor: '#F3E6D3',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E6D7BE',
    opacity: 0.75,
  },
  specialCell: {
    backgroundColor: '#F7E7B4',
    borderColor: '#D4A017',
  },
});