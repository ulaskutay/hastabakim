# Hasta Bakım & Yaşlı Bakım Hizmetleri Web Uygulaması

Profesyonel hasta bakım ve yaşlı bakım hizmetleri için modern bir web arayüzü ve admin paneli.

## Özellikler

### Ana Web Sitesi
- Modern ve responsive tasarım
- Hizmetler bölümü
- Hakkımızda sayfası
- İletişim formu
- Mobil uyumlu arayüz

### Admin Paneli
- Dashboard (istatistikler)
- Hasta yönetimi (ekleme, düzenleme, silme, arama)
- Randevu yönetimi (planlama, takip, durum yönetimi)
- Personel yönetimi (ekleme, düzenleme, silme)
- SMTP Yönetimi (e-posta gönderim ayarları)

## Teknolojiler

- **Next.js 14** - React framework
- **TypeScript** - Tip güvenliği
- **Tailwind CSS** - Styling
- **React Icons** - İkonlar
- **Nodemailer** - E-posta gönderimi
- **Prisma** - ORM (Veritabanı yönetimi)
- **PostgreSQL** - Veritabanı (Supabase)

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Veritabanını yapılandırın:
   - Supabase hesabı oluşturun: https://supabase.com
   - Yeni proje oluşturun
   - Database URL'i alın
   - Aşağıdaki "Veritabanı Kurulumu" bölümüne bakın

3. Environment variables dosyası oluşturun:
   - Proje kök dizininde `.env.local` dosyası oluşturun
   - Aşağıdaki örnek yapılandırmayı kullanın

4. Veritabanı tablolarını oluşturun:
```bash
npx prisma migrate dev
```

5. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

6. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin.

## Kullanım

### Ana Sayfa
- Ana sayfa: `/`
- Hizmetler: `/#hizmetler`
- Hakkımızda: `/#hakkimizda`
- İletişim: `/#iletisim`

### Admin Paneli
- Dashboard: `/admin`
- Hastalar: `/admin/hastalar`
- Randevular: `/admin/randevular`
- Personel: `/admin/personel`
- SMTP Yönetimi: `/admin/smtp`

## SMTP Mail Ayarları

İletişim formundan gelen mesajların e-posta ile gönderilmesi için SMTP ayarları yapılmalıdır.

### Yöntem 1: Admin Paneli Üzerinden

1. Admin paneline giriş yapın: `/admin/smtp`
2. SMTP bilgilerinizi girin
3. Test e-postası göndererek bağlantıyı kontrol edin
4. Ayarları kaydedin

### Yöntem 2: Environment Variables (.env.local)

Proje kök dizininde `.env.local` dosyası oluşturun:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=ornek@email.com
SMTP_PASS=your_app_password_here
RECIPIENT_EMAIL=info@hastabakim.com
```

### Popüler SMTP Servisleri

**Gmail:**
- Host: `smtp.gmail.com`
- Port: `587` (TLS) veya `465` (SSL)
- Güvenli: Port 465 için aktif
- Uygulama şifresi kullanılmalı (Google Hesabı > Güvenlik > 2 Adımlı Doğrulama > Uygulama şifreleri)

**Outlook/Office365:**
- Host: `smtp.office365.com`
- Port: `587`
- Güvenli: Pasif (TLS kullanılır)

**Yandex:**
- Host: `smtp.yandex.com`
- Port: `465`
- Güvenli: Aktif

## Veritabanı Kurulumu (Supabase + Vercel)

### Adım 1: Supabase Hesabı Oluşturma

1. https://supabase.com adresine gidin
2. "Start your project" butonuna tıklayın
3. GitHub hesabınızla giriş yapın
4. Yeni proje oluşturun:
   - Project name: `hasta-bakim` (veya istediğiniz isim)
   - Database Password: Güçlü bir şifre belirleyin (kaydedin!)
   - Region: En yakın bölgeyi seçin
   - Plan: Free tier yeterli

### Adım 2: Database URL'i Alma

1. Supabase dashboard'a gidin
2. Sol menüden "Settings" > "Database" seçin
3. "Connection string" bölümünde "URI" sekmesine tıklayın
4. Connection string'i kopyalayın (örnek formatı aşağıda)

### Adım 3: Environment Variables Ayarlama

Proje kök dizininde `.env.local` dosyası oluşturun:

```env
# Supabase Database URL
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# SMTP Ayarları
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=ornek@email.com
SMTP_PASS=your_app_password_here
RECIPIENT_EMAIL=info@hastabakim.com
```

**Önemli:** `[YOUR-PASSWORD]` ve `[PROJECT-REF]` kısımlarını kendi değerlerinizle değiştirin.

### Adım 4: Veritabanı Tablolarını Oluşturma

```bash
# Prisma Client'ı oluştur
npx prisma generate

# Veritabanı migration'ını çalıştır
npx prisma migrate dev --name init
```

Bu komutlar şu tabloları oluşturur:
- `kategoriler`
- `hastalar`
- `personel`
- `randevular`

### Adım 5: Vercel'e Deploy

1. Projenizi GitHub'a push edin
2. https://vercel.com adresine gidin
3. "Import Project" butonuna tıklayın
4. GitHub repository'nizi seçin
5. Environment Variables ekleyin:
   - `DATABASE_URL`: Supabase'den aldığınız connection string
   - `SMTP_HOST`, `SMTP_PORT`, vb. SMTP ayarları
6. "Deploy" butonuna tıklayın

### Adım 6: Production Migration

Vercel'e deploy ettikten sonra:

```bash
# Production veritabanına migration uygula
npx prisma migrate deploy
```

Veya Vercel'de environment variable olarak ekleyip, build sırasında otomatik çalıştırabilirsiniz.

## Notlar

- Veritabanı bağlantı bilgileri güvenli bir şekilde saklanmalıdır
- `.env.local` dosyası git'e commit edilmemelidir (zaten .gitignore'da)
- Admin paneli için kimlik doğrulama eklenebilir
- SMTP şifreleri güvenli bir şekilde saklanmalıdır

## Geliştirme

Projeyi geliştirmek için:

```bash
# Geliştirme modu
npm run dev

# Production build
npm run build

# Production sunucusu
npm start
```

## Lisans

Bu proje özel kullanım içindir.

