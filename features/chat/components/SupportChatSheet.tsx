// import React, { useCallback, useEffect, useRef, useState } from "react";
// import { View, FlatList, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Keyboard } from "react-native";
// import BottomSheet, { BottomSheetView, BottomSheetFlatList, BottomSheetTextInput } from "@gorhom/bottom-sheet";
// import { GestureHandlerRootView } from "react-native-gesture-handler";
// import AntDesign from '@expo/vector-icons/AntDesign';
// import { Text } from "@/components/ui/text";
// import { useTheme } from "@/app/providers/ThemeProvider";
// import { THEME } from "@/lib/theme";
// import { useChatContext } from "../context/ChatProvider";
// import { useAuth } from "@/features/auth/context/AuthContext";
// import { ChatRestService } from "../services/chatApiService";
// import { ChatMessageBubble } from "./ChatMessageBubble";
// import { TypingIndicator } from "./TypingIndicator";
// import { ChatMessage, ChatRoomWithDetails } from "../types";
// import { formatChatMessageTime, shouldShowTimestamp } from "../utils/helpers";

// interface SupportChatSheetProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export function SupportChatSheet({ isOpen, onClose }: SupportChatSheetProps) {
//   const { isDarkColorScheme } = useTheme();
//   const theme = isDarkColorScheme ? THEME.dark : THEME.light;

//   const bottomSheetRef = useRef<BottomSheet>(null);
//   const snapPoints = React.useMemo(() => ["75%"], []);

//   const { user } = useAuth();
//   const currentUserId = user?.id?.toString() || "";
//   const [keyboardHeight, setKeyboardHeight] = useState(0);
//   const {
//     rooms,
//     messagesByRoom,
//     setMessagesByRoom,
//     sendMessage: sendWsMessage,
//     createOrOpenRoom,
//     setActiveRoomId,
//     sendTypingStart,
//     sendTypingStop,
//     subscribeToRoomTyping,
//     sendReadReceipt,
//   } = useChatContext();

//   const [supportRoom, setSupportRoom] = useState<ChatRoomWithDetails | null>(null);
//   const [messageText, setMessageText] = useState("");
//   const [isOtherTyping, setIsOtherTyping] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   // ── Open / close logic ───────────────────────────────
//   useEffect(() => {
//     if (isOpen) {
//       bottomSheetRef.current?.expand();
//       initSupportRoom();
//     } else {
//       bottomSheetRef.current?.close();
//       if (supportRoom) setActiveRoomId(null);
//     }
//   }, [isOpen]);

//   const initSupportRoom = async () => {
//     setIsLoading(true);
//     try {
//       // Find existing support room or create one
//       const existingSupport = rooms.find(r => r.roomType === "SYSTEM_SUPPORT");
//       let room: ChatRoomWithDetails;

//       if (existingSupport) {
//         room = existingSupport;
//       } else {
//         room = await createOrOpenRoom("SYSTEM_SUPPORT", [], "Customer Support");
//       }

//       setSupportRoom(room);
//       setActiveRoomId(room.id);

//       // Fetch history
//       const page = await ChatRestService.getRoomMessages(room.id, 0, 50);
//       const historyMsgs = page.content;

//       setMessagesByRoom(prev => {
//         const current = prev[room.id] || [];
//         const msgMap = new Map<string, ChatMessage>();
//         historyMsgs.forEach(m => msgMap.set(m.id, m));
//         current.forEach(m => msgMap.set(m.id, m));
//         const merged = Array.from(msgMap.values()).sort(
//           (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
//         );
//         return { ...prev, [room.id]: merged };
//       });

//       // Read receipt
//       if (historyMsgs.length > 0) {
//         const newest = historyMsgs.reduce((a, b) =>
//           new Date(a.timestamp).getTime() > new Date(b.timestamp).getTime() ? a : b
//         );
//         if (newest.senderId !== currentUserId) {
//           sendReadReceipt(room.id, newest.id);
//         }
//       }
//     } catch (e) {
//       console.error("Failed to init support room", e);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ── Typing subscription ──────────────────────────────
//   useEffect(() => {
//     if (!supportRoom) return;
//     const unsub = subscribeToRoomTyping(supportRoom.id, (data) => {
//       if (data.senderId !== currentUserId) setIsOtherTyping(data.isTyping);
//     });
//     return unsub;
//   }, [supportRoom?.id, currentUserId]);

//   const messages = supportRoom ? (messagesByRoom[supportRoom.id] || []) : [];

//   const handleTextChange = (text: string) => {
//     setMessageText(text);
//     if (!supportRoom) return;
//     sendTypingStart(supportRoom.id);
//     if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
//     typingTimeoutRef.current = setTimeout(() => sendTypingStop(supportRoom.id), 2500);
//   };

//   const handleSend = () => {
//     if (!messageText.trim() || !supportRoom) return;
//     sendTypingStop(supportRoom.id);
//     sendWsMessage(supportRoom.id, messageText.trim());
//     setMessageText("");
//   };

//   const handleSheetChange = useCallback((index: number) => {
//     if (index === -1) onClose();
//   }, [onClose]);

//   const participant = supportRoom?.otherParticipant;

//   // Keyboard height
//   useEffect(() => {
//     const keyboardDidShowListener = Keyboard.addListener(
//       'keyboardDidShow',
//       (e) => setKeyboardHeight(e.endCoordinates.height)
//     );
//     const keyboardDidHideListener = Keyboard.addListener(
//       'keyboardDidHide',
//       () => setKeyboardHeight(0)
//     );

//     return () => {
//       keyboardDidShowListener.remove();
//       keyboardDidHideListener.remove();
//     };
//   }, []);


//   return (
//     <BottomSheet
//       ref={bottomSheetRef}
//       index={isOpen ? 0 : -1}
//       snapPoints={snapPoints}
//       onChange={handleSheetChange}
//       enablePanDownToClose
//       keyboardBehavior="interactive"
//       keyboardBlurBehavior="restore"
//       android_keyboardInputMode="adjustResize"
//       backgroundStyle={{ backgroundColor: theme.background }}
//       handleIndicatorStyle={{ backgroundColor: theme.mutedForeground }}
//     >
//       <View style={{ flex: 1 }}>
//         {/* Header */}
//         <View
//           className="flex-row items-center px-4 pb-3 border-b"
//           style={{ borderColor: theme.border, height: 60 }}
//         >
//           <View className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: theme.primary }}>
//             <AntDesign name="message" size={24} color="white" />
//           </View>
//           <View className="ml-3 flex-1">
//             <Text className="text-base font-bold" style={{ color: theme.foreground }}>
//               {participant?.fullname || "Customer Support"}
//             </Text>
//             {isOtherTyping ? (
//               <Text className="text-xs" style={{ color: theme.primary }}>typing...</Text>
//             ) : (
//               <Text className="text-xs" style={{ color: theme.mutedForeground }}>
//                 {participant ? "Admin" : "We're here to help"}
//               </Text>
//             )}
//           </View>
//           <TouchableOpacity onPress={onClose} className="p-2">
//             <AntDesign name="close" size={22} color={theme.foreground} />
//           </TouchableOpacity>
//         </View>

//         {isLoading ? (
//           <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
//             <Text style={{ color: theme.mutedForeground }}>Connecting to support...</Text>
//           </View>
//         ) : (
//           <View style={{ flex: 1 }}>
//             {/* Messages — flex: 1 makes it fill remaining space, input stays pinned at bottom */}
//             <BottomSheetFlatList<ChatMessage>
//               data={messages}
//               keyExtractor={(item: ChatMessage) => item.id}
//               inverted
//               showsVerticalScrollIndicator={false}
//               contentContainerStyle={{ paddingVertical: 12 }}
//               style={{ flex: 1 }}
//               ListHeaderComponent={isOtherTyping ? <TypingIndicator /> : null}
//               renderItem={({ item, index }: { item: ChatMessage; index: number }) => {
//                 const isMine = item.senderId === currentUserId;
//                 const prevMsg = messages[index + 1];
//                 const nextMsg = messages[index - 1];
//                 let showTs = true;
//                 if (prevMsg) showTs = shouldShowTimestamp(item.timestamp, prevMsg.timestamp);
//                 let showAvatar = true;
//                 if (nextMsg && nextMsg.senderId === item.senderId && !shouldShowTimestamp(nextMsg.timestamp, item.timestamp)) {
//                   showAvatar = false;
//                 }
//                 return (
//                   <ChatMessageBubble
//                     message={item}
//                     isMine={isMine}
//                     showAvatar={showAvatar}
//                     showTimestamp={showTs}
//                     timestampString={formatChatMessageTime(item.timestamp)}
//                     participantAvatar={participant?.avatarUrl}
//                   />
//                 );
//               }}
//             />

//             {/* Input — naturally pinned at bottom since FlatList takes all remaining flex space */}
//             <View
//               className="px-4 py-3 flex-row items-end border-t"
//               style={{
//                 borderColor: theme.border,
//                 backgroundColor: theme.background,
//                 paddingBottom: Platform.OS === 'ios' ? 20 : 12
//               }}
//             >
//               <View
//                 className="flex-1 min-h-[40px] max-h-[100px] rounded-2xl px-4 py-2 flex-row items-center border"
//                 style={{ backgroundColor: theme.background, borderColor: theme.border }}
//               >
//                 {/* SỬA Ở ĐÂY: Dùng BottomSheetTextInput thay cho TextInput */}
//                 <BottomSheetTextInput
//                   className="flex-1 text-base leading-5"
//                   style={{ color: theme.foreground, paddingTop: 0, paddingBottom: 0 }}
//                   placeholder="Ask for help..."
//                   placeholderTextColor={theme.mutedForeground}
//                   multiline
//                   value={messageText}
//                   onChangeText={handleTextChange}
//                 />
//               </View>
//               <TouchableOpacity
//                 className="ml-3 w-10 h-10 items-center justify-center rounded-full"
//                 style={{ backgroundColor: messageText.trim() ? theme.primary : theme.muted }}
//                 onPress={handleSend}
//                 disabled={!messageText.trim()}
//               >
//                 <AntDesign name="send" size={16} color={messageText.trim() ? "#FFFFFF" : theme.mutedForeground} style={{ marginLeft: 1 }} />
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}
//       </View>
//     </BottomSheet>
//   );
// }
