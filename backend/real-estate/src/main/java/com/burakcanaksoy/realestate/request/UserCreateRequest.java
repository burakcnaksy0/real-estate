package com.burakcanaksoy.realestate.request;

import com.burakcanaksoy.realestate.model.enums.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.Set;

@Data
public class UserCreateRequest {

    @NotBlank(message = "Name cannot be blank")
    @Size(max = 50)
    private String name;

    @NotBlank(message = "Surname cannot be blank")
    @Size(max = 50)
    private String surname;

    @NotBlank(message = "Username cannot be blank")
    @Size(min = 3, max = 50)
    private String username;

    @Pattern(
            regexp = "^\\+?[0-9]{10,15}$",
            message = "Phone number must be valid"
    )
    private String phoneNumber;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email must be valid")
    @Size(max = 100)
    private String email;

    @NotBlank(message = "Password cannot be blank")
    @Size(min = 8, max = 255, message = "Password must be at least 8 characters")
    private String password;

    @NotNull(message = "Enabled information must be specified")
    private Boolean enabled = true;

    @NotEmpty(message = "User must have at least one role")
    private Set<Role> roles = Set.of(Role.ROLE_USER);
}
