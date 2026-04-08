1. UI/UX Components Requirements
1.1 Global Floating Chat (System Support)
Floating Action Button (FAB): Located in the bottom corner of the screen (above the main tabs). Includes an Assistant/Admin icon. Also includes a small badge displaying the total unread count of the SYSTEM_SUPPORT rooms.

Bottom Sheet: When FAB is clicked, a Bottom Sheet screen (occupying 70-80% of the screen) opens containing the Chat Detail interface with the Admin.

Note: When AI is integrated, this will be where the chat with the AI ​​is displayed. Currently, it maps directly to the SYSTEM_SUPPORT room.

1.2 Screen: Chat List
Top Tabs: Build a tab bar with the following classifications:

All: Displays all chat rooms (isHidden == false).

Support: Only displays roomType == 'SYSTEM_SUPPORT'.

Artist: Only display roomType == 'VENDOR_CHAT'.

UI Item:

Display Avatar, Room/Chat Name, lastMessagePreview, and time.

Unread Badge: If unreadCount > 0, bold the sender's name and display a red dot indicating the number of unread messages.

Swipe Actions: Use the react-native-gesture-handler & react-native-reanimated libraries. Swipe the item to the left to reveal the "Hide" (Archive) button.

1.3 Screen: Chat Detail
Product Snippet Card: If accessed from the Workshop details page, the chat window should render a small card directly above the TextInput displaying thumbnailUrl, title, and price. The card should have a "Send Information" button.

Message Bubbles:

TEXT: Render normal text.

IMAGE: Render a clickable Image component for full-screen viewing (using mediaUrl).

PRODUCT_SNIPPET: Renders the UI as a product card in the chat window. Clicking it allows navigation back to the Workshop details page.

Message Status (Status Ticks): (Only displayed for your messages)

SENT / DELIVERED: 1 gray tick or 2 gray ticks.

READ: 2 green ticks.

Typing Indicator: At the bottom of the message list, when the other person is typing, displays the Lottie "..." animation (Typing).


2. REST API Integration Guide (React Native)
2.1 Creating/Opening Chat Rooms
Depending on the user's entry point, call the API to create a room with the appropriate roomType.

A. From the FAB button (Chat with Admin):
const response = await api.post('/api/chat/rooms', {
    name: "Hỗ trợ khách hàng",
    participantIds: ["admin-uuid"], // Hardcode Admin UUID tạm thời
    roomType: "SYSTEM_SUPPORT"
});
// Mở Bottom Sheet với response.data.id

B. From the Workshop Details screen (Chat with Vendor):
const response = await api.post('/api/chat/rooms', {
    name: workshop.title,
    participantIds: [workshop.vendorId],
    roomType: "VENDOR_CHAT"
});
// Navigate sang Screen Chat Detail với response.data.id


2.2 Hide Conversation (Swipe Action)
When the user presses the "Hide" button after swiping:
// Gọi API để ẩn trên Server
await api.patch(`/api/chat/rooms/${roomId}/visibility`, { isHidden: true });
// Cập nhật State local (Redux/Context): Loại bỏ room này khỏi danh sách hiển thị


2.3 Uploading Images
When the user clicks the 📷 button in the chat window:
1. Open Image Picker.
2. Call the Upload API to the Server:

const formData = new FormData();
formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'photo.jpg'
});
const response = await api.post('/api/chat/media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
const mediaUrl = response.data.mediaUrl;
// Sau đó gửi WebSocket payload với messageType: 'IMAGE' và mediaUrl.

3. WebSocket Integration Guide (Real-time)
3.1 Sending Product Snippet Messages
When the user clicks "Submit Information" on the Product Card:
const payload = {
    chatRoomId: roomId,
    content: "Tôi muốn hỏi về workshop này.",
    messageType: "PRODUCT_SNIPPET",
    metadata: {
        workshopId: "ws-123",
        title: "Làm gốm truyền thống",
        price: 200000,
        thumbnailUrl: "https://..."
    }
};
stompClient.send('/app/chat.send', {}, JSON.stringify(payload));

3.2 Typing Indicator
Handles when the user types:
// Sự kiện onChangeText của TextInput
let typingTimeout = null;

const onType = (text) => {
    setMessageText(text);
    // Gửi sự kiện bắt đầu gõ
    stompClient.send('/app/chat.typing.start', {}, JSON.stringify({ chatRoomId: roomId }));
    
    // Clear timeout cũ và set timeout mới để stop typing
    if(typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        stompClient.send('/app/chat.typing.stop', {}, JSON.stringify({ chatRoomId: roomId }));
    }, 2500); // Ngừng gõ sau 2.5s thì gửi stop
}

Listen to the other person typing (in the useEffect section of the Chat Detail Screen):
stompClient.subscribe(`/topic/room/${roomId}/typing`, (message) => {
    const data = JSON.parse(message.body);
    if (data.senderId !== currentUserId) {
        setIsTyping(data.isTyping); // Cập nhật UI hiển thị "..."
    }
});

3.3 Read Receipts (Read Receipt Notification and Blue Checkmark)
A. Sending a Read Receipt:
When the Chat Detail screen is open OR when a new message is received while it is open:
const markAsRead = (lastMessageId) => {
    stompClient.send('/app/chat.read', {}, JSON.stringify({
        chatRoomId: roomId,
        lastReadMessageId: lastMessageId
    }));
    // Cập nhật Redux: set unreadCount của room này = 0
}

B. Update the Checkmark (Listen from Server) interface:
Because the backend includes READ_RECEIPT in the same message channel, your listening handler needs to check the type field:
stompClient.subscribe('/user/queue/messages', (message) => {
    const data = JSON.parse(message.body);
    
    if (data.type === 'READ_RECEIPT') {
        // Đối phương đã đọc tin nhắn của mình
        if (data.readerId !== currentUserId && data.chatRoomId === currentRoomId) {
            // Update UI list tin nhắn: chuyển status các tin nhắn có id <= data.lastReadMessageId thành 'READ' (2 tick xanh)
            updateMessagesStatusToRead(data.lastReadMessageId);
        }
    } else {
        // Xử lý tin nhắn mới (ChatMessage bình thường)
        handleIncomingMessage(data);
    }
});