package com.burakcanaksoy.realestate.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SmsService {

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.phone-number}")
    private String fromPhoneNumber;

    @PostConstruct
    public void init() {
        if (accountSid != null && !accountSid.equals("YOUR_TWILIO_ACCOUNT_SID") &&
                authToken != null && !authToken.equals("YOUR_TWILIO_AUTH_TOKEN")) {
            Twilio.init(accountSid, authToken);
        }
    }

    public void sendSms(String toPhoneNumber, String messageBody) {
        if (accountSid == null || accountSid.equals("YOUR_TWILIO_ACCOUNT_SID") ||
                authToken == null || authToken.equals("YOUR_TWILIO_AUTH_TOKEN")) {
            System.out.println("Twilio credentials are not configured. Mocking SMS send:");
            System.out.println("To: " + toPhoneNumber);
            System.out.println("Message: " + messageBody);
            return;
        }

        String formattedPhoneNumber = formatPhoneNumber(toPhoneNumber);

        try {
            Message.creator(
                    new PhoneNumber(formattedPhoneNumber),
                    new PhoneNumber(fromPhoneNumber),
                    messageBody).create();
        } catch (Exception e) {
            System.err.println("Error sending SMS via Twilio: " + e.getMessage());
            // Fallback logging for develeopment robustness
            System.out.println("Failed to send real SMS. Log:");
            System.out.println("To: " + toPhoneNumber);
            System.out.println("Message: " + messageBody);
        }
    }

    private String formatPhoneNumber(String phoneNumber) {
        if (phoneNumber == null)
            return null;
        // Remove spaces and non-numeric chars except +
        String cleaned = phoneNumber.replaceAll("[^0-9+]", "");

        // If it starts with 0 (e.g., 0535...), replace 0 with +90
        if (cleaned.startsWith("0")) {
            return "+90" + cleaned.substring(1);
        }
        // If it doesn't start with +, assume it's a local number without leading 0,
        // prepend +90
        else if (!cleaned.startsWith("+")) {
            return "+90" + cleaned;
        }

        return cleaned;
    }
}
