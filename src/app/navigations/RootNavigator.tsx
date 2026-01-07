import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import type { RootStackParamList } from "./types";
import { useAuth } from "@/features/auth";
import LoadingOverlay from "@/components/Loader/LoadingOverlay";

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, isInitialized, isLoading } = useAuth();

  // Show loading screen while initializing auth state
  if (!isInitialized) {
    return <LoadingOverlay visible={true} message="Initializing..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
