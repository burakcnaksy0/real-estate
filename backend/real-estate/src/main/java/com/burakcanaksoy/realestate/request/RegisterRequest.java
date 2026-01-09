package com.burakcanaksoy.realestate.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Ad boş olamaz")
    @Size(max = 50, message = "Ad 50 karakterden uzun olamaz")
    private String name;

    @NotBlank(message = "Soyad boş olamaz")
    @Size(max = 50, message = "Soyad 50 karakterden uzun olamaz")
    private String surname;

    @NotBlank(message = "Kullanıcı adı boş olamaz")
    @Size(min = 3, max = 50, message = "Kullanıcı adı 3-50 karakter arasında olmalıdır")
    private String username;

    @NotBlank(message = "Email boş olamaz")
    @Email(message = "Geçerli bir email adresi giriniz")
    @Size(max = 100, message = "Email 100 karakterden uzun olamaz")
    private String email;

    @Size(max = 20, message = "Telefon numarası 20 karakterden uzun olamaz")
    private String phoneNumber;

    @NotBlank(message = "Şifre boş olamaz")
    @Size(min = 6, message = "Şifre en az 6 karakter olmalıdır")
    private String password;
}