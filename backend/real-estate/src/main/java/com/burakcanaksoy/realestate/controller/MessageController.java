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
}
