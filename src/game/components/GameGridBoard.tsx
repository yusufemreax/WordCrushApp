import React, {useMemo, useRef} from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {Cell, CellPosition} from '../../types/game';
import {isSameCell} from '../utils/cellHelper';
import {getSpecialTileLabel} from '../utils/specialTileHelpers';

type CellTouchArea = {
  row: number;
  col: number;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
};

type Props = {
  grid: (Cell | null)[][];
  gridSize: number;
  isGameFinished: boolean;
  isResolvingMove: boolean;
  selectedCells: CellPosition[];
  explodingCells: CellPosition[];
  columnFallAnimsRef: React.MutableRefObject<Animated.Value[]>;
  columnOpacityAnimsRef: React.MutableRefObject<Animated.Value[]>;
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
  const {width} = useWindowDimensions();

  const lastTouchedCellKeyRef = useRef<string | null>(null);

  const cellSize = useMemo(() => {
    const horizontalPadding = 32;
    const boardHorizontalMargin = 8;
    const availableWidth = width - horizontalPadding - boardHorizontalMargin;

    const rawSize = (availableWidth - gridSize * 4) / gridSize;

    if (gridSize === 10) {
      return Math.max(26, Math.min(32, rawSize));
    }

    if (gridSize === 8) {
      return Math.max(30, Math.min(40, rawSize));
    }

    return Math.max(38, Math.min(50, rawSize));
  }, [gridSize, width]);

  const cellGap = 4;
  const fullCellSize = cellSize + cellGap;
  const boardSize = gridSize * fullCellSize;

  const cellTouchAreas = useMemo<CellTouchArea[]>(() => {
    const areas: CellTouchArea[] = [];

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        areas.push({
          row,
          col,
          x1: col * fullCellSize,
          x2: (col + 1) * fullCellSize,
          y1: row * fullCellSize,
          y2: (row + 1) * fullCellSize,
        });
      }
    }

    return areas;
  }, [gridSize, fullCellSize]);

  const getTouchedCellFromLocalPoint = (
    x: number,
    y: number,
  ): CellPosition | null => {
    if (x < 0 || y < 0 || x >= boardSize || y >= boardSize) {
      return null;
    }

    const area = cellTouchAreas.find(item => {
      return x >= item.x1 && x < item.x2 && y >= item.y1 && y < item.y2;
    });

    if (!area) {
      return null;
    }

    return {
      row: area.row,
      col: area.col,
    };
  };

  const isSelected = (row: number, col: number) => {
    return selectedCells.some(cell => isSameCell(cell, {row, col}));
  };

  const isExploding = (row: number, col: number) => {
    return explodingCells.some(cell => isSameCell(cell, {row, col}));
  };

  const handleBoardTouch = async (
    x: number,
    y: number,
    phase: 'start' | 'move',
  ) => {
    if (isGameFinished || isResolvingMove) {
      return;
    }

    const touchedCell = getTouchedCellFromLocalPoint(x, y);

    if (!touchedCell) {
      return;
    }

    const touchedKey = `${touchedCell.row}-${touchedCell.col}`;

    if (lastTouchedCellKeyRef.current === touchedKey) {
      return;
    }

    lastTouchedCellKeyRef.current = touchedKey;

    if (phase === 'start') {
      await onSelectionStart(touchedCell.row, touchedCell.col);
      return;
    }

    await onSelectionMove(touchedCell.row, touchedCell.col);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () =>
          !isGameFinished && !isResolvingMove,

        onStartShouldSetPanResponderCapture: () =>
          !isGameFinished && !isResolvingMove,

        onMoveShouldSetPanResponder: () =>
          !isGameFinished && !isResolvingMove,

        onMoveShouldSetPanResponderCapture: () =>
          !isGameFinished && !isResolvingMove,

        onPanResponderGrant: event => {
          onGestureActiveChange(true);
          lastTouchedCellKeyRef.current = null;

          const {locationX, locationY} = event.nativeEvent;
          handleBoardTouch(locationX, locationY, 'start');
        },

        onPanResponderMove: event => {
          const {locationX, locationY} = event.nativeEvent;
          handleBoardTouch(locationX, locationY, 'move');
        },

        onPanResponderRelease: () => {
          lastTouchedCellKeyRef.current = null;
          onGestureActiveChange(false);
          onSelectionEnd();
        },

        onPanResponderTerminate: () => {
          lastTouchedCellKeyRef.current = null;
          onGestureActiveChange(false);
          onSelectionEnd();
        },

        onShouldBlockNativeResponder: () => true,
      }),
    [
      isGameFinished,
      isResolvingMove,
      onGestureActiveChange,
      onSelectionEnd,
      handleBoardTouch,
    ],
  );

  return (
    <View style={styles.grid}>
      <View
        style={[
          styles.board,
          {
            width: boardSize,
            height: boardSize,
          },
        ]}>
        <View style={styles.gridColumns}>
          {Array.from({length: gridSize}, (_, colIndex) => (
            <Animated.View
              key={`col-${colIndex}`}
              style={[
                styles.column,
                {
                  transform: [
                    {translateY: columnFallAnimsRef.current[colIndex]},
                  ],
                  opacity: columnOpacityAnimsRef.current[colIndex],
                },
              ]}>
              {grid.map((row, rowIndex) => {
                const cell = row[colIndex];

                if (!cell) {
                  return (
                    <View
                      key={`empty-${rowIndex}-${colIndex}`}
                      style={[
                        styles.cellEmpty,
                        {
                          width: cellSize,
                          height: cellSize,
                          margin: cellGap / 2,
                        },
                      ]}
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
                        margin: cellGap / 2,
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
                            : 16,
                        },
                        selected && styles.letterSelected,
                        exploding && styles.letterExploding,
                      ]}>
                      {cell.specialTile
                        ? `${cell.letter} ${getSpecialTileLabel(
                            cell.specialTile,
                          )}`
                        : cell.letter}
                    </Text>
                  </View>
                );
              })}
            </Animated.View>
          ))}
        </View>

        <View style={styles.touchOverlay} {...panResponder.panHandlers} />
      </View>
    </View>
  );
};

export default GameGridBoard;

const styles = StyleSheet.create({
  grid: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  board: {
    position: 'relative',
    overflow: 'visible',
  },
  gridColumns: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  touchOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    backgroundColor: 'transparent',
  },
  cell: {
    backgroundColor: '#FFF',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6D7BE',
    overflow: 'hidden',
  },
  specialCell: {
    backgroundColor: '#F7E7B4',
    borderColor: '#D4A017',
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
    backgroundColor: '#F3E6D3',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E6D7BE',
    opacity: 0.75,
  },
});