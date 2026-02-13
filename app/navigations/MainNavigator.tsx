import { createStackNavigator } from "@react-navigation/stack";
import TabsNavigator from "./TabsNavigator";
import UpdateAccountScreen from "@/features/profile/screens/UpdateAccountScreen";
import ChangePasswordScreen from "@/features/profile/screens/ChangePasswordScreen";
import TransactionHistoryScreen from "@/features/profile/screens/TransactionHistoryScreen";
import TransactionDetailsScreen from "@/features/profile/screens/TransactionDetailsScreen";
import TicketVerificationScreen from "@/features/profile/screens/TicketVerificationScreen";
import AllDestinationsScreen from "@/features/discover/screens/AllDestinationsScreen";
import PointDetailScreen from "@/features/discover/screens/PointDetailScreen";
import PointMapSelectionScreen from "@/features/discover/screens/PointMapSelectionScreen";
import ActiveNavigationScreen from "@/features/discover/screens/ActiveNavigationScreen";
import ArrivalConfirmationScreen from "@/features/discover/screens/ArrivalConfirmationScreen";
import AudioGuideScreen from "@/features/discover/screens/AudioGuideScreen";
import { MainStackParamList } from "./NavigationParamTypes";

const Stack = createStackNavigator<MainStackParamList>();

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ animation: "slide_from_right" }}>
      <Stack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="UpdateAccount" component={UpdateAccountScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="TransactionHistory"
        component={TransactionHistoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TransactionDetails"
        component={TransactionDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TicketVerification"
        component={TicketVerificationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AllDestinations"
        component={AllDestinationsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PointDetail"
        component={PointDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PointMapSelection"
        component={PointMapSelectionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ActiveNavigation"
        component={ActiveNavigationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ArrivalConfirmation"
        component={ArrivalConfirmationScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="AudioGuide"
        component={AudioGuideScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
