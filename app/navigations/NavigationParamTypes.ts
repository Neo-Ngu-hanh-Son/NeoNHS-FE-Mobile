import type { NavigatorScreenParams } from "@react-navigation/native";

/* ============================================================
   AUTH STACK
   ============================================================ */

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  EnterOtp: { email: string };
  ForgotPasswordOtp: { email: string };
  VerifyEmail: { email?: string; fromRegister?: boolean };
};

/* ============================================================
   TABS STACK
   ============================================================ */

export type TabsStackParamList = {
  Home: undefined;
  Discover: undefined;
  Map: undefined;
  Bookings: undefined;
  Profile: undefined;
  TestCart: undefined;
};

/* ============================================================
   FEATURE ROUTES
   ============================================================ */

/* Blog */
export type BlogRoutes = {
  BlogList: undefined;
  BlogDetails: { blogId: string };
};

/* Account */
export type AccountRoutes = {
  UpdateAccount: undefined;
  ChangePassword: undefined;
  KycVerification: undefined;
};

/* Transactions */
export type TransactionRoutes = {
  TransactionHistory: undefined;
  TransactionDetails: { transactionId: string };
};

/* Tickets */
export type TicketRoutes = {
  TicketVerification: undefined;
};

/* Destinations */
export type DestinationRoutes = {
  AllDestinations: {
    initialTab?: "Points" | "Workshops" | "Events" | "Blogs";
    selectedAttractionId?: string;
  };
};

/* Map / Points */
export type MapRoutes = {
  PointDetail: { pointId: string };
  PointMapSelection: { pointId: string };
  ActiveNavigation: { pointId: string };
  ArrivalConfirmation: { pointId: string };
  AudioGuide: { pointId: string };
};

/* Events */
export type EventRoutes = {
  EventDetail: { eventId: string };
};

/* Workshops */
export type WorkshopRoutes = {
  WorkshopList: undefined;
  WorkshopDetail: { workshopId: string };
};

/* Checkout */
export type CheckoutRoutes = {
  PreCheckout: { selectedIds: string[] };
  Payment: {
    cartItemIds: string[];
    voucherIds: string[];
    amount: number;
    orderCode: string;
  };
};

/* ============================================================
   MAIN STACK (MERGED)
   ============================================================ */

type BaseMainRoutes = {
  Tabs: NavigatorScreenParams<TabsStackParamList>;
};

export type MainStackParamList =
  BaseMainRoutes &
  AccountRoutes &
  TransactionRoutes &
  TicketRoutes &
  DestinationRoutes &
  MapRoutes &
  EventRoutes &
  WorkshopRoutes &
  CheckoutRoutes &
  BlogRoutes;

/* ============================================================
   ROOT STACK
   ============================================================ */

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};