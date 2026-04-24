import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {ActiveJokerType, JokerInventory, JokerType} from '../../types/game';


type Props = {
  inventory: JokerInventory;
  activeJoker: ActiveJokerType;
  isResolvingMove: boolean;
  isGameFinished: boolean;
  onToggleJoker: (joker: ActiveJokerType) => void;
};

const JokerBar: React.FC<Props> = ({
  inventory,
  activeJoker,
  isResolvingMove,
  isGameFinished,
  onToggleJoker,
}) => {
  return (
    <View style={styles.jokerBar}>
      <TouchableOpacity
        style={[
          styles.jokerButton,
          activeJoker === 'fish' && styles.jokerButtonActive,
          inventory.fish <= 0 && styles.jokerButtonDisabled,
        ]}
        onPress={() => onToggleJoker('fish')}
        disabled={inventory.fish <= 0 || isResolvingMove || isGameFinished}>
        <Text style={styles.jokerButtonText}>Balık ({inventory.fish})</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.jokerButton,
          activeJoker === 'lollipop' && styles.jokerButtonActive,
          inventory.lollipop <= 0 && styles.jokerButtonDisabled,
        ]}
        onPress={() =>
          onToggleJoker('lollipop')
        }
        disabled={
          inventory.lollipop <= 0 || isResolvingMove || isGameFinished
        }>
        <Text style={styles.jokerButtonText}>
          Lolipop ({inventory.lollipop})
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default JokerBar;

const styles = StyleSheet.create({
  jokerBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  jokerButton: {
    backgroundColor: '#C86B85',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  jokerButtonActive: {
    backgroundColor: '#9F3E5D',
  },
  jokerButtonDisabled: {
    opacity: 0.45,
  },
  jokerButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});