import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import Types
import { MainStackParamList } from './NavigationParamTypes';

// Import Navigators & Screens
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
import EventAllReviewsScreen from '@/features/event/screens/EventAllReviewsScreen';
import EventTimeLineMapScreen from '@/features/event/screens/EventTimeLineMapScreen';
import { WorkshopListScreen, WorkshopDetailScreen } from '@/features/workshops/screens';
import WorkshopAllReviewsScreen from '@/features/workshops/screens/WorkshopAllReviewsScreen';
import BlogListScreen from '@/features/blog/screens/BlogListScreen';
import BlogDetailsScreen from '@/features/blog/screens/BlogDetailsScreen';
import PanoramaScreen from '@/features/panorama/screens/PanoramaScreen';
import PointHistoryAudioScreen from '@/features/point/screens/PointHistoryAudioScreen';
import CheckinCameraScreen from '@/features/checkin/screens/CheckinCameraScreen';
import CheckinCompleteScreen from '@/features/checkin/screens/CheckinCompleteScreen';
import CheckinGalleryScreen from '@/features/profile/screens/CheckinGalleryScreen';
import ChatScreen from '@/features/chat/screens/ChatScreen';
import { FloatingChatButton } from '@/features/chat/components/FloatingChatButton';
import NotificationsScreen from '@/features/notifications/screens/NotificationsScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainNavigator() {
  return (
    <>
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // Set default for all screens to keep code DRY
          animation: 'slide_from_right',
          animationDuration: 300,
        }}>
        {/* Root Tabs */}
        <Stack.Screen name="Tabs" component={TabsNavigator} options={{ animationTypeForReplace: 'pop' }} />

        {/* Profile & Account */}
        <Stack.Screen name="UpdateAccount" component={UpdateAccountScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="KycVerification" component={KycVerificationScreen} />
        <Stack.Screen name="Withdraw" component={WithdrawScreen} />
        <Stack.Screen name="CheckinGallery" component={CheckinGalleryScreen} />

        {/* Transactions & Tickets */}
        <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
        <Stack.Screen name="TransactionDetails" component={TransactionDetailsScreen} />
        <Stack.Screen name="TicketVerification" component={TicketVerificationScreen} />

        {/* Cart & Checkout */}
        <Stack.Screen name="PreCheckout" component={PreCheckoutScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />

        {/* Discover & Points */}
        <Stack.Screen name="AllDestinations" component={AllDestinationsScreen} />
        <Stack.Screen name="PointDetail" component={PointDetailScreen} />
        <Stack.Screen name="PointMapSelection" component={PointMapSelectionScreen} />
        <Stack.Screen name="ActiveNavigation" component={ActiveNavigationScreen} />
        <Stack.Screen name="ArrivalConfirmation" component={ArrivalConfirmationScreen} />
        <Stack.Screen
          name="PointHistoryAudio"
          component={PointHistoryAudioScreen}
          options={{
            headerShown: false,
            headerTitle: 'History audios',
            headerTitleAlign: 'left',
          }}
        />

        {/* Events & Workshops */}
        <Stack.Screen name="EventDetail" component={EventDetailScreen} />
        <Stack.Screen name="EventAllReviews" component={EventAllReviewsScreen} />
        <Stack.Screen name="EventTimeLineMap" component={EventTimeLineMapScreen} />
        <Stack.Screen name="WorkshopList" component={WorkshopListScreen} />
        <Stack.Screen name="WorkshopDetail" component={WorkshopDetailScreen} />
        <Stack.Screen name="WorkshopAllReviews" component={WorkshopAllReviewsScreen} />

        {/* Content & Features */}
        <Stack.Screen name="BlogList" component={BlogListScreen} />
        <Stack.Screen name="BlogDetails" component={BlogDetailsScreen} />
        <Stack.Screen name="Panorama" component={PanoramaScreen} />

        {/* Map & Check-in */}
        <Stack.Screen name="CheckinCamera" component={CheckinCameraScreen} />
        <Stack.Screen name="CheckinComplete" component={CheckinCompleteScreen} />

        <Stack.Screen name="ChatRoom" component={ChatScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ headerShown: true, title: 'Notifications', headerBackTitle: 'Back' }}
        />
      </Stack.Navigator>
      <FloatingChatButton />
    </>
  );
}
