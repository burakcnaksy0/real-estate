package com.burakcanaksoy.realestate.request;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private String surname;
    private String phoneNumber;
    private String email;
}
