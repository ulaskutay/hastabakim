# Vercel + Supabase Bağlantı Sorunu Çözümü

## Sorun
Vercel'deki uygulama Supabase veritabanına bağlanamıyor:
```
Can't reach database server at db.nfntrapxxhvfxroxnxni.supabase.co:5432
```

**Neden?** Port 5432 (direkt bağlantı) Vercel'den Supabase'e bağlanmak için IP allowlist gerektirir ve sorun çıkarabilir.

## Çözüm: Connection Pooling URL Kullanın

Supabase'de **Connection Pooling** özelliği Vercel gibi serverless ortamlar için tasarlanmıştır ve IP allowlist gerektirmez.

### Adım 1: Supabase'den Pooling URL'ini Alın

1. **Supabase Dashboard**'a gidin: https://supabase.com/dashboard
2. Projenizi seçin
3. Sol menüden **Settings** > **Database** seçin
4. **Connection string** bölümünde **Connection Pooling** sekmesine tıklayın
5. **Transaction Mode** seçeneğini seçin (Prisma için uygun)
6. Connection string'i kopyalayın

**Doğru format şöyle olmalı:**
```
postgresql://postgres.nfntrapxxhvfxroxnxni:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Önemli farklar:**
- ✅ Port: `6543` (Pooling portu)
- ✅ Host: `pooler.supabase.com` (pooler kullanıyor)
- ✅ Parametre: `?pgbouncer=true` (mutlaka olmalı)
- ❌ Port `5432` değil
- ❌ Host `db.supabase.co` değil

### Adım 2: Vercel'de Environment Variable Güncelleyin

1. **Vercel Dashboard**'a gidin: https://vercel.com/dashboard
2. Projenizi seçin
3. **Settings** > **Environment Variables** sekmesine gidin
4. `DATABASE_URL` değişkenini bulun veya yeni ekleyin
5. **Value** kısmına Connection Pooling URL'ini yapıştırın:

```
postgresql://postgres.nfntrapxxhvfxroxnxni:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Notlar:**
- `[YOUR-PASSWORD]` → Supabase şifrenizi yazın
- `[REGION]` → Projenizin bölgesi (örn: `eu-central-1`, `us-east-1`)
- Özel karakterler varsa URL encode edilmeli

### Adım 3: Environment Seçeneklerini Ayarlayın

Vercel'de environment variable eklerken:
- ✅ **Production** seçili olmalı
- ✅ **Preview** seçili olmalı  
- ✅ **Development** seçili olmalı

(Hepsini seçin ki tüm deployment'larda çalışsın)

### Adım 4: Yeni Deployment Başlatın

1. Vercel Dashboard'da projenize gidin
2. **Deployments** sekmesine tıklayın
3. En son deployment'ın yanındaki **...** menüsünden **Redeploy** seçin
4. Veya yeni bir commit push edin

### Adım 5: Kontrol Edin

Deployment sonrası:
1. `https://hastabakimetic.vercel.app/api/health` adresini açın
2. Veritabanı bağlantı durumunu kontrol edin
3. Admin panelinde kategori eklemeyi deneyin

## Örnek URL Karşılaştırması

### ❌ Yanlış (Direkt Bağlantı - Port 5432)
```
postgresql://postgres:password@db.nfntrapxxhvfxroxnxni.supabase.co:5432/postgres
```
Bu URL Vercel'de çalışmayabilir!

### ✅ Doğru (Connection Pooling - Port 6543)
```
postgresql://postgres.nfntrapxxhvfxroxnxni:password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```
Bu URL Vercel'de çalışır!

## Neden Connection Pooling?

1. **IP Allowlist Gerektirmez**: Vercel'in dinamik IP'lerini manuel eklemeye gerek yok
2. **Daha Güvenilir**: Connection pooling bağlantıları yönetir
3. **Serverless İçin Optimize**: Vercel gibi serverless ortamlar için tasarlanmış
4. **Daha Hızlı**: Bağlantı havuzu sayesinde daha hızlı bağlanır

## Hala Çalışmıyor mu?

1. **Health Check** endpoint'ini kontrol edin: `/api/health`
2. **Vercel Logs**'u kontrol edin: Dashboard > Deployments > Logs
3. **Supabase Dashboard**'da connection string'i tekrar kontrol edin
4. **Password'de özel karakterler** varsa URL encode edin

## Migration İçin

Migration çalıştırmak için direkt connection (port 5432) gerekebilir. Bu durumda:
- Normal işlemler için: Pooling URL (port 6543)
- Migration için: Direkt URL (port 5432) - sadece local'de kullanın

