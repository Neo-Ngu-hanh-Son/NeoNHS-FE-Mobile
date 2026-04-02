import { createStackNavigator } from '@react-navigation/stack';
import TabsNavigator from './TabsNavigator';
import UpdateAccountScreen from '@/features/profile/screens/UpdateAccountScreen';
import ChangePasswordScreen from '@/features/profile/screens/ChangePasswordScreen';
import TransactionHistoryScreen from '@/features/profile/screens/TransactionHistoryScreen';
import TransactionDetailsScreen from '@/features/profile/screens/TransactionDetailsScreen';
import TicketVerificationScreen from '@/features/profile/screens/TicketVerificationScreen';
import KycVerificationScreen from '@/features/profile/screens/KycVerificationScreen';
import WithdrawScreen from '@/features/profile/screens/WithdrawScreen';
import PreCheckoutScreen from '@/features/cart/screens/PreCheckoutScreen';
import PaymentScreen from '@/features/cart/screens/PaymentScreen';
import AllDestinationsScreen from '@/features/discover/screens/AllDestinationsScreen';
import PointDetailScreen from '@/features/point/screens/PointDetailScreen';
import PointMapSelectionScreen from '@/features/discover/screens/PointMapSelectionScreen';
import ActiveNavigationScreen from '@/features/discover/screens/ActiveNavigationScreen';
import ArrivalConfirmationScreen from '@/features/discover/screens/ArrivalConfirmationScreen';
import EventDetailScreen from '@/features/event/screens/EventDetailScreen';
import { WorkshopListScreen, WorkshopDetailScreen } from '@/features/workshops/screens';
import WorkshopAllReviewsScreen from '@/features/workshops/screens/WorkshopAllReviewsScreen';
import BlogListScreen from '@/features/blog/screens/BlogListScreen';
import BlogDetailsScreen from '@/features/blog/screens/BlogDetailsScreen';
import { MainStackParamList } from './NavigationParamTypes';
import PanoramaScreen from '@/features/panorama/screens/PanoramaScreen';
import PointHistoryAudioScreen from '@/features/point/screens/PointHistoryAudioScreen';
import CheckinCameraScreen from '@/features/map/screens/CheckinCameraScreen';
import CheckinCompleteScreen from '@/features/map/screens/CheckinCompleteScreen';
import CheckinGalleryScreen from '@/features/profile/screens/CheckinGalleryScreen';
import ChatScreen from '@/features/chat/screens/ChatScreen';

const Stack = createStackNavigator<MainStackParamList>();

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ animation: 'slide_from_right' }}>
      <Stack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="UpdateAccount"
        component={UpdateAccountScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="KycVerification"
        component={KycVerificationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Withdraw" component={WithdrawScreen} options={{ headerShown: false }} />
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
        name="PreCheckout"
        component={PreCheckoutScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ headerShown: false }} />
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
        name="PointHistoryAudio"
        component={PointHistoryAudioScreen}
        options={{
          headerShown: false,
          headerTitleAlign: 'left',
          headerTitle: 'History audios',
        }}
      />

      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WorkshopList"
        component={WorkshopListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WorkshopDetail"
        component={WorkshopDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WorkshopAllReviews"
        component={WorkshopAllReviewsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="BlogList" component={BlogListScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="BlogDetails"
        component={BlogDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Panorama" component={PanoramaScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="CheckinCamera"
        component={CheckinCameraScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CheckinComplete"
        component={CheckinCompleteScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CheckinGallery"
        component={CheckinGalleryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChatRoom"
        component={ChatScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
