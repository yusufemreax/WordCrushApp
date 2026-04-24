import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { NavigationContainer } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { getUsername } from "../storage/userStorage";
import { ActivityIndicator, View } from "react-native";
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import NewGameScreen from "../screens/NewGameScreen";
import ScoreboardScreen from "../screens/ScoreboardScreen";
import MarketScreen from "../screens/MarketScreen";
import GameScreen from "../screens/GameScreen";
const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Onboarding');

    useEffect(() => {
        const checkUser = async () => {
            try {
                const username = await getUsername();
                setInitialRoute(username ? 'Home': 'Onboarding');
            } finally {
                setIsLoading(false);
            }
        };

        checkUser();
    }, []);

    if (isLoading) {
        return (
            <View>
                <ActivityIndicator size="large" />
            </View>
        );
    }
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName={initialRoute}
            >
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="NewGame" component={NewGameScreen} />
                <Stack.Screen name="Scoreboard" component={ScoreboardScreen}/>
                <Stack.Screen name="Market" component={MarketScreen}/>
                <Stack.Screen name="Game" component={GameScreen} options={{ gestureEnabled: false }}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;