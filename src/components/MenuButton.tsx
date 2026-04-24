import { StyleSheet, Text, TouchableOpacity } from "react-native";

type Props = {
    title: string;
    onPress: () => void;
};

const MenuButton: React.FC<Props> = ({title, onPress}) => {
    return (
        <TouchableOpacity style = {styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
};

export default MenuButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#D98E04',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});