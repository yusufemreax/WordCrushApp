import { StyleSheet, Text, TouchableOpacity } from "react-native";

type Props = {
    onPress: () => void;
};

const BackButton: React.FC<Props> = ({onPress}) => {
    return(
        <TouchableOpacity style={styles.button} onPress={onPress}> 
            <Text style={styles.buttonText}>Geri Dön</Text>
        </TouchableOpacity>
    );
};

export default BackButton;

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#D98E04',
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700'
    },
})