package com.burakcanaksoy.realestate.request;

import com.burakcanaksoy.realestate.model.enums.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.Set;

@Data
public class UserUpdateRequest {

    @Size(max = 50)
    private String name;

    @Size(max = 50)
    private String surname;

    @Size(min = 3, max = 50)
    private String username;

    @Pattern(
            regexp = "^\\+?[0-9]{10,15}$",
            message = "Phone number must be valid"
    )
    private String phoneNumber;

    @Email(message = "Email must be valid")
    @Size(max = 100)
    private String email;

    @Size(min = 8, max = 255, message = "Password must be at least 8 characters")
    private String password;

    private Boolean enabled;

    private Set<Role> roles;
}
