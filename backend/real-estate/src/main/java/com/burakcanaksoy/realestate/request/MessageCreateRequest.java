package com.burakcanaksoy.realestate.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MessageCreateRequest {

    @NotNull(message = "Receiver ID is required")
    private Long receiverId;

    private Long listingId; // Optional - context of the message

    @NotBlank(message = "Message content cannot be empty")
    @Size(max = 2000, message = "Message cannot exceed 2000 characters")
    private String content;
}
