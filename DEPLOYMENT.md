# Vesta Projesi Dağıtım (Deployment) Rehberi

Bu proje Frontend (React) ve Backend (Spring Boot) olmak üzere iki ana parçadan oluşmaktadır. Bu iki parça farklı platformlarda barındırılacaktır.

## 1. Frontend Dağıtımı (Vercel)

Frontend (React) uygulaması Vercel üzerinde ücretsiz olarak barındırılabilir.

### Adımlar:
1.  **GitHub'a Yükleme:**
    *   Projenin son halini GitHub'a pushladığından emin ol. Frontend klasörü ana dizinde (`/frontend`) bulunmalı.
2.  **Vercel Hesabı:**
    *   [vercel.com](https://vercel.com) adresine git ve GitHub hesabınla giriş yap.
3.  **Yeni Proje:**
    *   "Add New..." -> "Project" butonuna tıkla.
    *   GitHub reponu seç "Import" de.
4.  **Ayarlar (Önemli):**
    *   **Framework Preset:** `Create React App` seçili olmalı.
    *   **Root Directory:** `Edit` butonuna tıkla ve `frontend` klasörünü seç. (Çünkü React uygulaması bu klasörün içinde).
    *   **Build & Output Settings:** Otomatik algılanır, değiştirmene gerek yok.
    *   **Environment Variables:**
        *   Backend'i canlıya aldıktan sonra buraya tekrar gelip `REACT_APP_API_URL` eklemen gerekecek. Şimdilik boş geçebilirsin veya `http://localhost:8080/api` (kendi bilgisayarın için) kalabilir ama canlıda çalışmaz.
5.  **Deploy:** "Deploy" butonuna bas.

*Not: Az önce eklediğim `vercel.json` dosyası sayesinde sayfa yenilendiğinde "404 Hatası" almayacaksın.*

---

## 2. Backend Dağıtımı (Railway veya Render)

Java Spring Boot uygulamaları Vercel'de çalışmaz. Bunun için **Railway** (önerilen) veya **Render** kullanabilirsin.

### Seçenek A: Railway (Daha Kolay ve Hızlı)
1.  [railway.app](https://railway.app) adresine GitHub ile giriş yap.
2.  "New Project" -> "Deploy from GitHub repo" seçeneğini seç.
3.  Reponu seçtikten sonra, Railway otomatik olarak `Dockerfile` veya `pom.xml` dosyasını algılayıp kurulum yapmaya çalışacaktır.
    *   **Root Directory:** Settings kısmından Root Directory'yi `backend/real-estate` olarak ayarlaman gerekebilir (pom.xml nerede ise).
4.  **Veritabanı (PostgreSQL):**
    *   Railway proje ekranında "New" -> "Database" -> "PostgreSQL" ekle.
    *   Oluşan veritabanının bağlantı bilgilerini (URL, User, Pass) al.
    *   Spring Boot uygulamanın "Variables" kısmına bu bilgileri `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME` vb. olarak ekle.
    *   *Alternatif:* `application.properties` dosyanı Railway'in verdiği çevre değişkenlerini (Environment Variables) okuyacak şekilde güncellemen gerekebilir.

### Seçenek B: Render (Ücretsiz Planı Var)
1.  [render.com](https://render.com) adresine git.
2.  "New Web Service" oluştur.
3.  GitHub reponu bağla.
4.  **Root Directory:** `backend/real-estate`
5.  **Build Command:** `mvn clean install -DskipTests`
6.  **Start Command:** `java -jar target/vesta-0.0.1-SNAPSHOT.jar`
7.  Ayrıca Render üzerinde bir de "PostgreSQL" servisi açıp backend'e bağlaman gerekir.

---

## 3. Bağlantıyı Kurma

Backend deploy edildiğinde sana `https://vesta-backend-production.up.railway.app` gibi bir URL verecekler.

1.  Vercel'e (Frontend paneline) geri dön.
2.  Settings -> Environment Variables kısmına gel.
3.  Yeni değişken ekle:
    *   **Key:** `REACT_APP_API_URL`
    *   **Value:** `https://senin-backend-adresin.app/api` (Sonunda `/api` olduğuna dikkat et, controller yapına göre değişebilir).
4.  Vercel'de "Redeploy" yap (Deployments sekmesinden son deploy'un yanındaki üç noktadan).

Artık canlıdaki Frontend, canlıdaki Backend ile konuşacaktır!
