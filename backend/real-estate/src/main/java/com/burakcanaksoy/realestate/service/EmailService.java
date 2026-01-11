package com.burakcanaksoy.realestate.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@vesta.com}")
    private String fromEmail;

    public void sendPasswordResetCode(String to, String code) {
        // 1. Console Log (Yedek olarak her zaman görünür)
        System.out.println("========================================");
        System.out.println("EMAIL LOG - RESET CODE: " + code);
        System.out.println("To: " + to);
        System.out.println("========================================");

        // 2. Gerçek E-posta Gönderimi (Eğer yapılandırma varsa)
        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(to);
                message.setSubject("Vesta Emlak - Şifre Sıfırlama Kodu");
                message.setText("Merhaba,\n\nŞifrenizi sıfırlamak için gereken kod aşağıdadır:\n\n" + code
                        + "\n\nBu kod 15 dakika süreyle geçerlidir.\n\nİyi günler,\nVesta Emlak Ekibi");

                mailSender.send(message);
                System.out.println("E-posta sunucuya başarıyla iletildi: " + to);
            } catch (Exception e) {
                System.err.println("UYARI: E-posta gönderilemedi (SMTP ayarları hatalı olabilir).");
                System.err.println("Hata Detayı: " + e.getMessage());
            }
        } else {
            System.out.println(
                    "UYARI: JavaMailSender bean'i bulunamadı. SMTP ayarları application.properties dosyasında eksik. E-posta gönderilmedi (Sadece log).");
        }
    }
}
