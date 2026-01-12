package com.burakcanaksoy.realestate.security.oauth2;

import com.burakcanaksoy.realestate.model.User;
import com.burakcanaksoy.realestate.model.enums.Role;
import com.burakcanaksoy.realestate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);

        try {
            return processOAuth2User(userRequest, oauth2User);
        } catch (Exception ex) {
            throw new OAuth2AuthenticationException(ex.getMessage());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oauth2User) {
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        OAuth2UserInfo oAuth2UserInfo = getOAuth2UserInfo(registrationId, oauth2User.getAttributes());

        if (oAuth2UserInfo.getEmail() == null || oAuth2UserInfo.getEmail().isEmpty()) {
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }

        Optional<User> userOptional = userRepository.findByEmail(oAuth2UserInfo.getEmail());
        User user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
            // Update existing user
            if (!registrationId.equalsIgnoreCase(user.getProvider())) {
                throw new OAuth2AuthenticationException(
                        "Bu e-posta adresi zaten " + user.getProvider() + " ile kayıtlı. Lütfen " +
                                user.getProvider() + " ile giriş yapın.");
            }
            user = updateExistingUser(user, oAuth2UserInfo);
        } else {
            // Create new user
            user = registerNewUser(userRequest, oAuth2UserInfo);
        }

        return new CustomOAuth2User(user, oauth2User.getAttributes());
    }

    private OAuth2UserInfo getOAuth2UserInfo(String registrationId, java.util.Map<String, Object> attributes) {
        if (registrationId.equalsIgnoreCase("google")) {
            return new GoogleOAuth2UserInfo(attributes);
        } else {
            throw new OAuth2AuthenticationException("Sorry! Login with " + registrationId + " is not supported yet.");
        }
    }

    private User registerNewUser(OAuth2UserRequest userRequest, OAuth2UserInfo oAuth2UserInfo) {
        User user = new User();

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        user.setProvider(registrationId.toUpperCase());
        user.setProviderId(oAuth2UserInfo.getId());

        String name = oAuth2UserInfo.getName();
        String[] nameParts = name != null ? name.split(" ", 2) : new String[] { "", "" };

        user.setName(nameParts.length > 0 ? nameParts[0] : "");
        user.setSurname(nameParts.length > 1 ? nameParts[1] : "");
        user.setEmail(oAuth2UserInfo.getEmail());
        user.setUsername(generateUsername(oAuth2UserInfo.getEmail()));
        user.setProfilePicture(oAuth2UserInfo.getImageUrl());
        user.setEnabled(true);
        user.setRoles(Set.of(Role.ROLE_USER));
        // OAuth users don't have a password
        user.setPassword("");

        return userRepository.save(user);
    }

    private User updateExistingUser(User existingUser, OAuth2UserInfo oAuth2UserInfo) {
        String name = oAuth2UserInfo.getName();
        if (name != null && !name.isEmpty()) {
            String[] nameParts = name.split(" ", 2);
            existingUser.setName(nameParts.length > 0 ? nameParts[0] : existingUser.getName());
            existingUser.setSurname(nameParts.length > 1 ? nameParts[1] : existingUser.getSurname());
        }

        if (oAuth2UserInfo.getImageUrl() != null && !oAuth2UserInfo.getImageUrl().isEmpty()) {
            existingUser.setProfilePicture(oAuth2UserInfo.getImageUrl());
        }

        return userRepository.save(existingUser);
    }

    private String generateUsername(String email) {
        String baseUsername = email.split("@")[0];
        String username = baseUsername;
        int counter = 1;

        while (userRepository.existsByUsername(username)) {
            username = baseUsername + counter;
            counter++;
        }

        return username;
    }
}
