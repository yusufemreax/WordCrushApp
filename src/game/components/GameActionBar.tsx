import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

type Props = {
  isGameFinished: boolean;
  isResolvingMove: boolean;
  onClearPress: () => void;
  onSubmitPress: () => void;
};

const GameActionBar: React.FC<Props> = ({
  isGameFinished,
  isResolvingMove,
  onClearPress,
  onSubmitPress,
}) => {
  return (
    <View style={styles.actionRow}>
      <TouchableOpacity
        style={[
          styles.secondaryButton,
          (isGameFinished || isResolvingMove) && styles.disabledButton,
        ]}
        onPress={onClearPress}
        disabled={isGameFinished || isResolvingMove}>
        <Text style={styles.secondaryButtonText}>Temizle</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.primaryButton,
          (isGameFinished || isResolvingMove) && styles.disabledButton,
        ]}
        onPress={onSubmitPress}
        disabled={isGameFinished || isResolvingMove}>
        <Text style={styles.primaryButtonText}>Kelimeyi Tamamla</Text>
      </TouchableOpacity>
    </View>
  );
};

export default GameActionBar;

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    flexWrap: 'nowrap',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#8C7B75',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  primaryButton: {
    flex: 2,
    backgroundColor: '#D98E04',
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.5,
  },
});