package com.burakcanaksoy.realestate.request;

import lombok.Data;

@Data
public class ForgotPasswordRequest {
    private String email;
    private String phoneNumber;
    private String method; // "EMAIL" or "SMS"
}
