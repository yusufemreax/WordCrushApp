import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { clearUsername, getUsername } from "../storage/userStorage";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MenuButton from "../components/MenuButton";

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
    const [username, setUsername] = useState('');

    useFocusEffect(
        useCallback(() => {
            const loadUsername = async () => {
                const storedUsername = await getUsername();
                if(storedUsername) {
                    setUsername(storedUsername);
                }
            };

            loadUsername();
        }, []),
    );

    const handleChangeUsername = () => {
        Alert.alert(
            'Kullanıcı Adını Değiştir','Kullanıcı adını değiştirmek istiyor musun ?',
            [
                { text: 'Vazgeç', style: 'cancel'},
                {
                    text: 'Evet',
                    onPress: async () => {
                        await clearUsername();
                        navigation.replace('Onboarding');
                    },
                },
            ],
        );
    };

    return(
        <SafeAreaView style ={styles.container}>
            <View style ={styles.header}>
                <TouchableOpacity onPress={handleChangeUsername}>
                    <Text style = {styles.usernameText}>{username || 'Oyuncu'}</Text>
                </TouchableOpacity>
            </View>

            <View style = {styles.content}>
                <Text style = {styles.title}>Word Crush</Text>

                <MenuButton title="Yeni Oyun" onPress={() => navigation.navigate('NewGame')}/>
                <MenuButton title="Skor Tablosu" onPress={() => navigation.navigate('Scoreboard')}/>
                <MenuButton title="Market" onPress={() => navigation.navigate('Market')}/>
                
            </View>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F4E8'
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    usernameText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#7A4E00',
    },
    content: {
        flex:1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        textAlign: 'center',
        color: '#3B2F2F',
        marginBottom: 40,
    },
    menuButton: {
        backgroundColor: '#D98E04',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    menuButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700'
    },
});
export default HomeScreen;