# 🏠 Vesta - Modern İlan Platformu

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-Demo-orange.svg)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.0-green)
![React](https://img.shields.io/badge/React-18-blue)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED)

**Vesta**, kullanıcıların emlak, vasıta, arsa ve işyeri gibi çeşitli kategorilerde güvenle ilan verip arama yapabileceği, modern ve ölçeklenebilir bir Full-Stack web platformudur. Güvenli altyapısı, şık tasarımı ve kullanıcı dostu özellikleriyle uçtan uca eksiksiz bir deneyim sunar.

---

## ✨ Özellikler

*   **Çoklu Kategori Yapısı:** Konut, Arsa, İşyeri ve Vasıta gibi farklı ihtiyaçlara özel ilan tipleri ve detaylı filtreleme seçenekleri.
*   **Güvenli Kimlik Doğrulama:** JWT tabanlı güvenli giriş, kayıt ve oturum yönetimi.
*   **Kullanıcı Paneli:** Profil düzenleme, şifre değişikliği ve hesap yönetimi.
*   **İlan Yönetimi:** Kullanıcıların kolayca ilan oluşturabilmesi, düzenleyebilmesi ve pasife alabilmesi.
*   **Mesajlaşma Sistemi:** Alıcı ve satıcılar arasında platform içi anlık iletişim.
*   **Favoriler:** Beğenilen ilanları kaydetme ve hızlı erişim.
*   **Modern Arayüz:** Mobil uyumlu, hızlı ve estetik tasarım (Tailwind CSS & Lucide Icons).

---

## 📸 Proje Görselleri

Uygulamamızdan bazı ekran görüntüleri:

### 🔐 Giriş ve Kayıt
Kullanıcıların güvenle sisteme dahil olabileceği modern arayüzler.

| Giriş Yap | Kayıt Ol |
|:---:|:---:|
| ![Login Page](assets/login_page.png) | ![Register Page](assets/register_page.png) |

### 🏠 Ana Sayfa ve İlanlar
Kategorilere hızlı erişim ve vitrin ilanları.

| Ana Sayfa | İlan Detayı |
|:---:|:---:|
| ![Home Page](assets/homepage.png) | ![Advert Page](assets/advert_page.png) |

### 👤 Kullanıcı Deneyimi
Kişiselleştirilmiş profil yönetimi ve iletişim.

| Profil Sayfası | Mesajlaşma |
|:---:|:---:|
| ![Profile Page](assets/user_profile_page.png) | ![Message Page](assets/message_page.png) |

---

## 🛠 Teknoloji Yığını (Tech Stack)

### Backend (Java & Spring Boot)
*   **Core:** Java 17, Spring Boot 3
*   **Veritabanı:** PostgreSQL
*   **ORM:** Hibernate / Spring Data JPA
*   **Güvenlik:** Spring Security, JWT Auth
*   **API Dokümantasyonu:** OpenAPI (Swagger)

### Frontend (React & TypeScript)
*   **Core:** React 18, TypeScript
*   **State Management:** Redux Toolkit
*   **Styling:** Tailwind CSS
*   **Form Yönetimi:** React Hook Form, Yup
*   **İkon Seti:** Lucide React

### DevOps & Araçlar
*   **Containerization:** Docker & Docker Compose
*   **Versiyon Kontrol:** Git

---

## 📦 Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için:

### 1. Repoyu Klonlayın
```bash
git clone https://github.com/burakcnaksy0/real-estate.git
cd real-estate
```

### 2. Backend Kurulumu
Veritabanını ve backend servisini başlatın:
```bash
cd backend/real-estate
docker-compose up -d  # PostgreSQL'i başlatır
./mvnw spring-boot:run # Uygulamayı başlatır
```

### 3. Frontend Kurulumu
Arayüzü başlatın:
```bash
cd frontend
npm install
npm start
```
*Frontend: http://localhost:3000 | Backend: http://localhost:8080*

---

## 🤝 Katkıda Bulunma

1. Forklayın
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Commitileyin (`git commit -m 'Yeni özellik eklendi'`)
4. Pushlayın (`git push origin feature/yeni-ozellik`)
5. Pull Request açın

---

## 📄 Lisans

Bu proje MIT lisansı ile korunmaktadır.
