# 💬 NeoNHS Chat System — v2.0 Backend Code Summary

> **Updated:** April 4, 2026 | **Branch:** `huynguyen/chatting` | **Build:** ✅ 0-error compile

---

## 1. Files Modified & Created

| Action | File Path |
|--------|-----------|
| MODIFIED | `document/ChatRoom.java` — added `roomType`, `unreadCounts`, `hiddenBy` |
| MODIFIED | `document/ChatMessage.java` — added `messageType`, `mediaUrl`, `metadata` |
| MODIFIED | `dto/chat/ChatRoomDTO.java` — added `roomType`, `unreadCount`, `isHidden` |
| MODIFIED | `dto/chat/ChatMessageDTO.java` — added `messageType`, `mediaUrl`, `metadata` |
| MODIFIED | `dto/chat/ChatMessageRequest.java` — added `messageType`, `mediaUrl`, `metadata` |
| MODIFIED | `dto/chat/CreateChatRoomRequest.java` — added `roomType` |
| NEW | `dto/chat/ToggleVisibilityRequest.java` — `{ isHidden: boolean }` |
| NEW | `dto/chat/ReadReceiptRequest.java` — `{ chatRoomId, lastReadMessageId }` |
| MODIFIED | `service/ChatService.java` — added `toggleVisibility()`, `markAsRead()` |
| MODIFIED | `service/impl/ChatServiceImpl.java` — full implementation with `MongoTemplate` |
| MODIFIED | `controller/ChatRestController.java` — added PATCH visibility + POST media |
| MODIFIED | `controller/ChatController.java` — added typing + read receipt WebSocket handlers |

---

## 2. Document Schema Changes

### ChatRoom.java — 3 new fields

```java
@Builder.Default
private String roomType = "STANDARD"; // SYSTEM_SUPPORT, VENDOR_CHAT, STANDARD

@Builder.Default
private Map<String, Integer> unreadCounts = new HashMap<>(); // { "userId": 3 }

@Builder.Default
private List<String> hiddenBy = new ArrayList<>(); // users who archived this room
```

### ChatMessage.java — 3 new fields (replaced old comment placeholders)

```java
@Builder.Default
private String messageType = "TEXT"; // TEXT, IMAGE, PRODUCT_SNIPPET

private String mediaUrl; // Cloudinary URL for IMAGE type

private Map<String, Object> metadata; // For PRODUCT_SNIPPET: { workshopId, title, price, thumbnailUrl }
```

---

## 3. Service Layer Changes (`ChatServiceImpl.java`)

### `sendMessage()` — updated logic

```java
// Now saves messageType, mediaUrl, metadata from request
ChatMessage message = ChatMessage.builder()
        .messageType(request.getMessageType() == null ? "TEXT" : request.getMessageType())
        .mediaUrl(request.getMediaUrl())
        .metadata(request.getMetadata())
        // ... existing fields
        .build();

// After saving: increment unread count for all receivers & unhide room
for (String participantId : room.getParticipants()) {
    if (!participantId.equals(senderId)) {
        room.getUnreadCounts().put(participantId,
            room.getUnreadCounts().getOrDefault(participantId, 0) + 1);
        room.getHiddenBy().remove(participantId); // resurface hidden room
    }
}
```

### `toggleVisibility()` — NEW method

```java
public void toggleVisibility(String roomId, String userId, boolean isHidden) {
    ChatRoom room = chatRoomRepository.findById(roomId).orElseThrow(...);
    if (isHidden) {
        room.getHiddenBy().add(userId);
    } else {
        room.getHiddenBy().remove(userId);
    }
    chatRoomRepository.save(room);
}
```

### `markAsRead()` — NEW method (optimized bulk update)

```java
public void markAsRead(String roomId, String userId, String lastReadMessageId) {
    // 1. Reset room-level unread counter
    room.getUnreadCounts().put(userId, 0);
    chatRoomRepository.save(room);

    // 2. Bulk update messages via MongoTemplate (targeted, not full scan)
    Query query = new Query(Criteria
        .where("chatRoomId").is(roomId)
        .and("status").ne(MessageStatus.READ)
        .and("_id").lte(lastReadMessageId)
        .and("senderId").ne(userId));   // don't mark own messages

    Update update = new Update().set("status", MessageStatus.READ);
    mongoTemplate.updateMulti(query, update, ChatMessage.class);
}
```

### `toRoomDTO()` — now user-aware

```java
private ChatRoomDTO toRoomDTO(ChatRoom room, String requesterId) {
    return ChatRoomDTO.builder()
            // ... existing fields
            .roomType(room.getRoomType())
            .unreadCount(room.getUnreadCounts().getOrDefault(requesterId, 0))
            .isHidden(room.getHiddenBy().contains(requesterId))
            .build();
}
```

---

## 4. REST Endpoints Added (`ChatRestController.java`)

### PATCH `/api/chat/rooms/{roomId}/visibility` — Hide/Archive room

```java
@PatchMapping("/rooms/{roomId}/visibility")
public ResponseEntity<?> toggleVisibility(
        @PathVariable String roomId,
        @AuthenticationPrincipal UserPrincipal currentUser,
        @RequestBody ToggleVisibilityRequest request) {
    chatService.toggleVisibility(roomId, currentUser.getId().toString(), request.isHidden());
    return ResponseEntity.ok().build();
}
```

### POST `/api/chat/media` — Upload image via Cloudinary

```java
@PostMapping(value = "/media", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<Map<String, String>> uploadMedia(@RequestParam("file") MultipartFile file) {
    String url = cloudinaryImageUploadService.uploadImage(file);
    Map<String, String> response = new HashMap<>();
    response.put("mediaUrl", url);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
}
```

---

## 5. WebSocket Handlers Added (`ChatController.java`)

### Typing Indicators — `/app/chat.typing.start` & `/app/chat.typing.stop`

```java
@MessageMapping("/chat.typing.start")
public void startTyping(@Payload Map<String, String> payload, Principal principal) {
    String chatRoomId = payload.get("chatRoomId");
    Map<String, Object> response = new HashMap<>();
    response.put("isTyping", true);
    response.put("senderId", principal.getName());
    messagingTemplate.convertAndSend("/topic/room/" + chatRoomId + "/typing", (Object) response);
}
// .typing.stop is identical with isTyping = false
```

### Read Receipts — `/app/chat.read`

```java
@MessageMapping("/chat.read")
public void markAsRead(@Payload ReadReceiptRequest request, Principal principal) {
    // 1. Update DB (reset unread + bulk update message statuses)
    chatService.markAsRead(request.getChatRoomId(), principal.getName(), request.getLastReadMessageId());

    // 2. Broadcast READ_RECEIPT to all participants for real-time tick updates
    Map<String, Object> receipt = new HashMap<>();
    receipt.put("type", "READ_RECEIPT");
    receipt.put("readerId", principal.getName());
    receipt.put("lastReadMessageId", request.getLastReadMessageId());
    receipt.put("chatRoomId", request.getChatRoomId());

    List<String> participants = chatService.getRoomParticipants(request.getChatRoomId());
    for (String participantId : participants) {
        messagingTemplate.convertAndSendToUser(participantId, "/queue/messages", receipt);
    }
}
```

---

## 6. Complete REST API Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/chat/rooms` | Create room (with `roomType`) |
| GET | `/api/chat/rooms` | List user's rooms (with `unreadCount`, `isHidden`) |
| GET | `/api/chat/rooms/{roomId}/messages?page=0&size=20` | Paginated message history |
| GET | `/api/chat/users/{userId}` | Get participant info |
| PATCH | `/api/chat/rooms/{roomId}/visibility` | **NEW** — Hide/unhide room |
| POST | `/api/chat/media` | **NEW** — Upload image, returns `{ mediaUrl }` |

## 7. Complete WebSocket Reference

| Destination | Direction | Purpose |
|-------------|-----------|---------|
| `/app/chat.send` | Client → Server | Send message (TEXT / IMAGE / PRODUCT_SNIPPET) |
| `/app/chat.typing.start` | Client → Server | **NEW** — Notify typing started |
| `/app/chat.typing.stop` | Client → Server | **NEW** — Notify typing stopped |
| `/app/chat.read` | Client → Server | **NEW** — Mark messages as read |
| `/user/queue/messages` | Server → Client | Receive messages + READ_RECEIPT events |
| `/topic/room/{roomId}/typing` | Server → Client | **NEW** — Receive typing status |

---

## 8. Build Verification

- ✅ `mvn compile -DskipTests` — 0 errors
- ✅ All existing endpoints remain backwards compatible
- ✅ New `MongoTemplate` dependency injected via `@RequiredArgsConstructor`
