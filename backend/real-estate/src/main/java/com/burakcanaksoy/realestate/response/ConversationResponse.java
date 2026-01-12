package com.burakcanaksoy.realestate.response;

import lombok.Data;

@Data
public class ConversationResponse {

    private Long otherUserId;
    private String otherUserUsername;
    private MessageDetailResponse lastMessage;
    private Integer unreadCount;
    private Long listingId;
    private String listingTitle;
}
