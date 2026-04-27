import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {ActiveJokerType, JokerInventory} from '../../types/game';

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
  const isDisabled = (count: number) => {
    return count <= 0 || isResolvingMove || isGameFinished;
  };

  return (
    <View style={styles.jokerBar}>
      <TouchableOpacity
        style={[
          styles.jokerButton,
          activeJoker === 'fish' && styles.jokerButtonActive,
          inventory.fish <= 0 && styles.jokerButtonDisabled,
        ]}
        onPress={() => onToggleJoker(activeJoker === 'fish' ? null : 'fish')}
        disabled={isDisabled(inventory.fish)}>
        <Text style={styles.jokerButtonText}>Balık ({inventory.fish})</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.jokerButton,
          activeJoker === 'wheel' && styles.jokerButtonActive,
          inventory.wheel <= 0 && styles.jokerButtonDisabled,
        ]}
        onPress={() => onToggleJoker(activeJoker === 'wheel' ? null : 'wheel')}
        disabled={isDisabled(inventory.wheel)}>
        <Text style={styles.jokerButtonText}>Tekerlek ({inventory.wheel})</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.jokerButton,
          activeJoker === 'lollipop' && styles.jokerButtonActive,
          inventory.lollipop <= 0 && styles.jokerButtonDisabled,
        ]}
        onPress={() =>
          onToggleJoker(activeJoker === 'lollipop' ? null : 'lollipop')
        }
        disabled={isDisabled(inventory.lollipop)}>
        <Text style={styles.jokerButtonText}>
          Lolipop ({inventory.lollipop})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.jokerButton,
          activeJoker === 'shuffle' && styles.jokerButtonActive,
          inventory.shuffle <= 0 && styles.jokerButtonDisabled,
        ]}
        onPress={() =>
          onToggleJoker(activeJoker === 'shuffle' ? null : 'shuffle')
        }
        disabled={isDisabled(inventory.shuffle)}>
        <Text style={styles.jokerButtonText}>
          Karıştır ({inventory.shuffle})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.jokerButton,
          activeJoker === 'party' && styles.jokerButtonActive,
          inventory.party <= 0 && styles.jokerButtonDisabled,
        ]}
        onPress={() => onToggleJoker(activeJoker === 'party' ? null : 'party')}
        disabled={isDisabled(inventory.party)}>
        <Text style={styles.jokerButtonText}>Parti ({inventory.party})</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.jokerButton,
          activeJoker === 'swap' && styles.jokerButtonActive,
          inventory.swap <= 0 && styles.jokerButtonDisabled,
        ]}
        onPress={() => onToggleJoker(activeJoker === 'swap' ? null : 'swap')}
        disabled={isDisabled(inventory.swap)}>
        <Text style={styles.jokerButtonText}>Değiştir ({inventory.swap})</Text>
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