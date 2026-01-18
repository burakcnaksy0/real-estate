package com.burakcanaksoy.realestate.service;

import com.burakcanaksoy.realestate.exception.ResourceNotFoundException;
import com.burakcanaksoy.realestate.model.Message;
import com.burakcanaksoy.realestate.model.User;
import com.burakcanaksoy.realestate.model.Vehicle;
import com.burakcanaksoy.realestate.model.RealEstate;
import com.burakcanaksoy.realestate.model.Land;
import com.burakcanaksoy.realestate.model.Workplace;
import com.burakcanaksoy.realestate.repository.MessageRepository;
import com.burakcanaksoy.realestate.repository.UserRepository;
import com.burakcanaksoy.realestate.repository.VehicleRepository;
import com.burakcanaksoy.realestate.repository.RealEstateRepository;
import com.burakcanaksoy.realestate.repository.LandRepository;
import com.burakcanaksoy.realestate.repository.WorkplaceRepository;
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
    private final VehicleRepository vehicleRepository;
    private final RealEstateRepository realEstateRepository;
    private final LandRepository landRepository;
    private final WorkplaceRepository workplaceRepository;

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

    @Transactional
    public MessageDetailResponse shareListing(Long senderId, Long recipientId, Long listingId,
            String listingType, String customMessage) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));

        User receiver = userRepository.findById(recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipient not found"));

        // Fetch listing details
        String listingTitle = "\u0130lan";

        try {
            switch (listingType.toUpperCase()) {
                case "VEHICLE":
                    Vehicle vehicle = vehicleRepository.findById(listingId)
                            .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
                    listingTitle = vehicle.getTitle();
                    break;
                case "REAL_ESTATE":
                    RealEstate realEstate = realEstateRepository.findById(listingId)
                            .orElseThrow(() -> new ResourceNotFoundException("Real estate not found"));
                    listingTitle = realEstate.getTitle();
                    break;
                case "LAND":
                    Land land = landRepository.findById(listingId)
                            .orElseThrow(() -> new ResourceNotFoundException("Land not found"));
                    listingTitle = land.getTitle();
                    break;
                case "WORKPLACE":
                    Workplace workplace = workplaceRepository.findById(listingId)
                            .orElseThrow(() -> new ResourceNotFoundException("Workplace not found"));
                    listingTitle = workplace.getTitle();
                    break;
            }
        } catch (Exception e) {
            // If listing not found, continue without details
            listingTitle = "İlan";
        }

        // Create message with listing link
        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setSharedListingType(listingType);
        message.setIsRead(false);

        // Format message content
        String listingUrl = getListingUrl(listingType, listingId);
        String messageContent = customMessage != null && !customMessage.trim().isEmpty()
                ? customMessage + "\n\n" + listingUrl + "\n" + listingId
                : "İlan paylaştı: " + listingUrl + "\n" + listingId;

        message.setContent(messageContent);

        Message savedMessage = messageRepository.save(message);

        // Create response with listing details
        MessageDetailResponse response = toMessageDetailResponse(savedMessage);
        response.setSharedListingTitle(listingTitle);
        response.setSharedListingImageUrl(String.valueOf(listingId)); // Frontend will fetch image using listingId

        return response;
    }

    @Transactional(readOnly = true)
    public List<User> getShareableContacts(Long userId) {
        // Get all users that the current user has had conversations with
        return messageRepository.findConversationParticipants(userId);
    }

    private String getListingUrl(String listingType, Long listingId) {
        String baseUrl = "/"; // Frontend will handle the full URL
        switch (listingType.toUpperCase()) {
            case "VEHICLE":
                return baseUrl + "vehicles/" + listingId;
            case "REAL_ESTATE":
                return baseUrl + "real-estates/" + listingId;
            case "LAND":
                return baseUrl + "lands/" + listingId;
            case "WORKPLACE":
                return baseUrl + "workplaces/" + listingId;
            default:
                return baseUrl + "listings/" + listingId;
        }
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

        // Add shared listing type if present
        if (message.getSharedListingType() != null) {
            response.setSharedListingType(message.getSharedListingType());
        }

        return response;
    }
}
