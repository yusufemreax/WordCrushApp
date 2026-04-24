import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { saveUsername } from "../storage/userStorage";
import { SafeAreaView } from "react-native-safe-area-context";
import TitleText from "../components/TitleText";

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
    const [username, setUsername] = useState('');

    const handleContinue = async () => {
        const trimmedUsername = username.trim();

        if(trimmedUsername.length < 2) {
            Alert.alert('Hata','Lütfen en az 2 karakterli bir kullanıcı adı girin.');
            return;
        }

        try {
            await saveUsername(trimmedUsername);
            navigation.replace('Home');
        } catch {
            Alert.alert('Hata', 'Kullanıcı adı kaydedilirken bir sorun oluştu.');
        }
    };

    return(
        <SafeAreaView style = {styles.container}>
            <View style = {styles.content}>
                <TitleText title="Word Crush"/>
                <Text style = {styles.subtitle}>Oyuna başlamak için kullanıcı adını gir.</Text>

                <TextInput
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Kullanıcı adı"
                    placeholderTextColor="#888"
                    style = {styles.input}
                    autoCapitalize="words"
                />
                
                <TouchableOpacity style = {styles.button} onPress={handleContinue}>
                    <Text style = {styles.buttonText}>Devam Et</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor: '#F8F4E8',
    },
    content: {
        flex:1,
        justifyContent: 'center',
        paddingHorizontal:24,
    },
    title: {
        fontSize: 34,
        fontWeight: '800',
        color: '#3B2F2F',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#5C4B51',
        textAlign: 'center',
        marginBottom: 24,
    },
    input: {
        height: 52,
        borderWidth: 1,
        borderColor: '#D6C7AE',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#222',
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#D98E04',
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color:'#FFF',
        fontSize: 16,
        fontWeight: '700'
    },
});