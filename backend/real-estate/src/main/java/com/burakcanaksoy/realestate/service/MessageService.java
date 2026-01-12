package com.burakcanaksoy.realestate.service;

import com.burakcanaksoy.realestate.exception.ResourceNotFoundException;
import com.burakcanaksoy.realestate.model.Message;
import com.burakcanaksoy.realestate.model.User;
import com.burakcanaksoy.realestate.repository.MessageRepository;
import com.burakcanaksoy.realestate.repository.UserRepository;
import com.burakcanaksoy.realestate.request.MessageCreateRequest;
import com.burakcanaksoy.realestate.response.ConversationResponse;
import com.burakcanaksoy.realestate.response.MessageDetailResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Transactional
    public MessageDetailResponse sendMessage(MessageCreateRequest request, Long senderId) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));

        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found"));

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(request.getContent());
        message.setIsRead(false);

        // Note: Listing association will be added in a future update
        // For now, messages are not linked to listings

        Message savedMessage = messageRepository.save(message);
        return toMessageDetailResponse(savedMessage);
    }

    @Transactional(readOnly = true)
    public List<ConversationResponse> getConversations(Long userId) {
        List<User> participants = messageRepository.findConversationParticipants(userId);

        return participants.stream()
                .map(otherUser -> {
                    List<Message> conversation = messageRepository.findConversationBetweenUsers(userId,
                            otherUser.getId());

                    ConversationResponse response = new ConversationResponse();
                    response.setOtherUserId(otherUser.getId());
                    response.setOtherUserUsername(otherUser.getUsername());

                    if (!conversation.isEmpty()) {
                        Message lastMessage = conversation.get(conversation.size() - 1);
                        response.setLastMessage(toMessageDetailResponse(lastMessage));

                        if (lastMessage.getListing() != null) {
                            response.setListingId(lastMessage.getListing().getId());
                            response.setListingTitle(lastMessage.getListing().getTitle());
                        }

                        long unreadCount = conversation.stream()
                                .filter(m -> m.getReceiver().getId().equals(userId) && !m.getIsRead())
                                .count();
                        response.setUnreadCount((int) unreadCount);
                    }

                    return response;
                })
                .sorted((a, b) -> {
                    if (a.getLastMessage() == null)
                        return 1;
                    if (b.getLastMessage() == null)
                        return -1;
                    return b.getLastMessage().getCreatedAt().compareTo(a.getLastMessage().getCreatedAt());
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MessageDetailResponse> getConversationWithUser(Long userId, Long otherUserId) {
        List<Message> messages = messageRepository.findConversationBetweenUsers(userId, otherUserId);
        return messages.stream()
                .map(this::toMessageDetailResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        if (!message.getReceiver().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only mark your own messages as read");
        }

        message.setIsRead(true);
        messageRepository.save(message);
    }

    @Transactional(readOnly = true)
    public Long getUnreadCount(Long userId) {
        return messageRepository.countUnreadMessages(userId);
    }

    private MessageDetailResponse toMessageDetailResponse(Message message) {
        MessageDetailResponse response = new MessageDetailResponse();
        response.setId(message.getId());
        response.setSenderId(message.getSender().getId());
        response.setSenderUsername(message.getSender().getUsername());
        response.setReceiverId(message.getReceiver().getId());
        response.setReceiverUsername(message.getReceiver().getUsername());
        response.setContent(message.getContent());
        response.setIsRead(message.getIsRead());
        response.setCreatedAt(message.getCreatedAt());

        if (message.getListing() != null) {
            response.setListingId(message.getListing().getId());
            response.setListingTitle(message.getListing().getTitle());
        }

        return response;
    }
}
