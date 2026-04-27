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

type CellLayout = {
  row: number;
  col: number;
  pageX: number;
  pageY: number;
  width: number;
  height: number;
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

  const cellLayoutsRef = useRef<CellLayout[]>([]);
  const cellRefs = useRef<Record<string, View | null>>({});

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
  const boardSize = gridSize * cellSize + (gridSize - 1) * cellGap;

  const isSelected = (row: number, col: number) => {
    return selectedCells.some(cell => isSameCell(cell, {row, col}));
  };

  const isExploding = (row: number, col: number) => {
    return explodingCells.some(cell => isSameCell(cell, {row, col}));
  };

  const measureCell = (row: number, col: number) => {
    const ref = cellRefs.current[`${row}-${col}`];

    if (!ref) {
      return;
    }

    requestAnimationFrame(() => {
      ref.measure((_x, _y, measuredWidth, measuredHeight, pageX, pageY) => {
        const filteredLayouts = cellLayoutsRef.current.filter(
          item => !(item.row === row && item.col === col),
        );

        cellLayoutsRef.current = [
          ...filteredLayouts,
          {
            row,
            col,
            pageX,
            pageY,
            width: measuredWidth,
            height: measuredHeight,
          },
        ];
      });
    });
  };

  const getTouchedCell = (pageX: number, pageY: number) => {
    const tolerance = 4;

    return (
      cellLayoutsRef.current.find(item => {
        return (
          pageX >= item.pageX - tolerance &&
          pageX <= item.pageX + item.width + tolerance &&
          pageY >= item.pageY - tolerance &&
          pageY <= item.pageY + item.height + tolerance
        );
      }) ?? null
    );
  };

  const handleBoardTouch = async (
    pageX: number,
    pageY: number,
    phase: 'start' | 'move',
  ) => {
    if (isGameFinished || isResolvingMove) {
      return;
    }

    const touchedCell = getTouchedCell(pageX, pageY);

    if (!touchedCell) {
      return;
    }

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

        onMoveShouldSetPanResponder: () =>
          !isGameFinished && !isResolvingMove,

        onPanResponderGrant: event => {
          onGestureActiveChange(true);

          const {pageX, pageY} = event.nativeEvent;
          handleBoardTouch(pageX, pageY, 'start');
        },

        onPanResponderMove: event => {
          const {pageX, pageY} = event.nativeEvent;
          handleBoardTouch(pageX, pageY, 'move');
        },

        onPanResponderRelease: () => {
          onGestureActiveChange(false);
          onSelectionEnd();
        },

        onPanResponderTerminate: () => {
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
        {...panResponder.panHandlers}
        style={[styles.gridColumns, {width: boardSize}]}>
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
                  ref={ref => {
                    cellRefs.current[`${cell.row}-${cell.col}`] = ref;
                  }}
                  onLayout={() => measureCell(cell.row, cell.col)}
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
  gridColumns: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
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