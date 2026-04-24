import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { GridSize, MoveCount, RootStackParamList } from "../types/navigation";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "../components/BackButton";
import TitleText from "../components/TitleText";
import { useMemo, useState } from "react";
import OptionCard from "../components/OptionCard";

type Props = NativeStackScreenProps<RootStackParamList,'NewGame'>;

const NewGameScreen: React.FC<Props> = ({navigation}) => {
    const [selectedGridSize, setSelectedGridSize] = useState<GridSize | null>(null,);
    const [selectedMoveCount, setSelectedMoveCount] = useState<MoveCount | null>(null,);

    const isStartDisabled = useMemo(() => {
        return !selectedGridSize || !selectedMoveCount;
    }, [selectedGridSize,selectedMoveCount]);

    const handleSelectGridSize = (gridSize: GridSize) => {
        setSelectedGridSize(gridSize);

        if(gridSize === 6) {
            setSelectedMoveCount(15);
        } else if (gridSize === 8) {
            setSelectedMoveCount(20);
        } else {
            setSelectedMoveCount(25);
        }
    };

    const handleStartGame = () => {
        if(!selectedGridSize || !selectedMoveCount) {
            Alert.alert('Eksik Seçim', 'Lütfen grid boyutu ve hamle sayısını seçin.');
            return;
        }

        navigation.navigate('Game', {
            gridSize: selectedGridSize,
            moveCount: selectedMoveCount,
        });
    };
    
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <TitleText title='Yeni Oyun' description='Önce grid boyutunu seç. Hamle sayısı seçilen zorluk seviyesine göre otomatik belirlenir.'/>

                <Text style={styles.sectionTitle}>Grid Boyutu</Text>

                <OptionCard
                    title="6x6 Grid"
                    subtitle="Zor Seviye • 15 Hamle"
                    selected={selectedGridSize === 6}
                    onPress={() => handleSelectGridSize(6)}
                />

                <OptionCard
                    title="8x8 Grid"
                    subtitle="Orta Seviye • 20 Hamle"
                    selected={selectedGridSize === 8}
                    onPress={() => handleSelectGridSize(8)}
                />

                <OptionCard
                    title="10x10 Grid"
                    subtitle="Kolay Seviye • 25 Hamle"
                    selected={selectedGridSize === 10}
                    onPress={() => handleSelectGridSize(10)}
                />
                <TouchableOpacity style={[styles.startButton,isStartDisabled && styles.startButtonDisabled,]} onPress={handleStartGame} disabled={isStartDisabled}>
                    <Text style={styles.startButtonText}>Oyunu Başlat</Text>
                </TouchableOpacity>
                

                <BackButton onPress={() => navigation.goBack()}/>
            </View>
        </SafeAreaView>
    );
};

export default NewGameScreen;

const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor: '#F8F4E8',
    },
    content: {
        flex:1,
        paddingHorizontal:24,
        paddingTop: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#7A4E00',
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding:18,
        borderWidth:1,
        borderColor: '#E6D7BE',
        marginBottom: 24,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#7A4E00',
        marginBottom: 12,
    },
    cardText: {
        fontSize: 15,
        color: '#3B2F2F',
        marginBottom: 8,
    },
    startButton: {
        backgroundColor: '#D98E04',
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    startButtonDisabled: {
        backgroundColor: '#D8C8A7',
    },
    startButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});