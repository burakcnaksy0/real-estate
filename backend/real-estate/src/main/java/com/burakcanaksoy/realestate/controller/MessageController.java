package com.burakcanaksoy.realestate.controller;

import com.burakcanaksoy.realestate.request.MessageCreateRequest;
import com.burakcanaksoy.realestate.response.ConversationResponse;
import com.burakcanaksoy.realestate.response.MessageDetailResponse;
import com.burakcanaksoy.realestate.security.AuthService;
import com.burakcanaksoy.realestate.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final AuthService authService;

    @PostMapping
    public ResponseEntity<MessageDetailResponse> sendMessage(
            @Valid @RequestBody MessageCreateRequest request) {
        Long senderId = authService.getCurrentUser().getId();
        MessageDetailResponse response = messageService.sendMessage(request, senderId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationResponse>> getConversations() {
        Long userId = authService.getCurrentUser().getId();
        List<ConversationResponse> conversations = messageService.getConversations(userId);
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/conversation/{otherUserId}")
    public ResponseEntity<List<MessageDetailResponse>> getConversationWithUser(
            @PathVariable Long otherUserId) {
        Long userId = authService.getCurrentUser().getId();
        List<MessageDetailResponse> messages = messageService.getConversationWithUser(userId, otherUserId);
        return ResponseEntity.ok(messages);
    }

    @PutMapping("/{messageId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long messageId) {
        Long userId = authService.getCurrentUser().getId();
        messageService.markAsRead(messageId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        Long userId = authService.getCurrentUser().getId();
        Long count = messageService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PostMapping("/share-listing")
    public ResponseEntity<MessageDetailResponse> shareListing(
            @Valid @RequestBody com.burakcanaksoy.realestate.request.ShareListingRequest request) {
        Long senderId = authService.getCurrentUser().getId();
        MessageDetailResponse response = messageService.shareListing(
                senderId,
                request.getRecipientId(),
                request.getListingId(),
                request.getListingType(),
                request.getMessage());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/shareable-contacts")
    public ResponseEntity<List<Map<String, Object>>> getShareableContacts() {
        Long userId = authService.getCurrentUser().getId();
        List<com.burakcanaksoy.realestate.model.User> contacts = messageService.getShareableContacts(userId);

        List<Map<String, Object>> contactList = contacts.stream()
                .map(user -> Map.of(
                        "id", (Object) user.getId(),
                        "username", user.getUsername(),
                        "email", user.getEmail() != null ? user.getEmail() : ""))
                .toList();

        return ResponseEntity.ok(contactList);
    }

    @DeleteMapping("/conversation/{otherUserId}")
    public ResponseEntity<Void> deleteConversation(@PathVariable Long otherUserId) {
        Long userId = authService.getCurrentUser().getId();
        messageService.deleteConversation(userId, otherUserId);
        return ResponseEntity.ok().build();
    }
}
