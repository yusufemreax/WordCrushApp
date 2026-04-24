import { StyleSheet, Text, TouchableOpacity } from "react-native";

type Props = {
    title: string;
    subtitle: string;
    selected: boolean;
    onPress: () => void;
};

const OptionCard: React.FC<Props> = ({title,subtitle,selected,onPress}) => {
    return(
        <TouchableOpacity style={[styles.card, selected && styles.cardSelected]} onPress={onPress}>
            <Text style={[styles.title, selected && styles.titleSelected]}>{title}</Text>
            <Text style={[styles.subtitle, selected && styles.subtitleSelected]}>{subtitle}</Text>
        </TouchableOpacity>
    )
}

export default OptionCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: '#E6D7BE',
    marginBottom: 14,
  },
  cardSelected: {
    borderColor: '#D98E04',
    backgroundColor: '#FFF7E8',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B2F2F',
    marginBottom: 6,
  },
  titleSelected: {
    color: '#A35F00',
  },
  subtitle: {
    fontSize: 14,
    color: '#5C4B51',
    lineHeight: 20,
  },
  subtitleSelected: {
    color: '#7A4E00',
  },
});