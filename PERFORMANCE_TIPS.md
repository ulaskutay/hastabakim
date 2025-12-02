# Performans Optimizasyon Rehberi

## Veritabanı Bağlantı Hızını Artırma

### 1. Connection Pooling URL Kullanın

**Çok Önemli:** Supabase Connection Pooling URL'i kullanmalısınız (port 6543). Bu serverless ortamlar için optimize edilmiştir.

**Yanlış (Yavaş):**
```
postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
```

**Doğru (Hızlı):**
```
postgresql://postgres.xxxxx:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 2. Vercel Environment Variables Kontrolü

1. Vercel Dashboard → Settings → Environment Variables
2. `DATABASE_URL` değişkenini kontrol edin
3. Connection Pooling URL kullanıldığından emin olun
4. Yeni deployment başlatın

### 3. Connection String Parametreleri

Connection string'inize şu parametreleri ekleyebilirsiniz:

```
?pgbouncer=true&connection_limit=5&pool_timeout=5&connect_timeout=5
```

### 4. Cold Start Optimizasyonu

Serverless ortamlarda ilk istek yavaş olabilir (cold start). Bu normaldir. Sonraki istekler hızlı olacaktır.

### 5. Query Optimizasyonu

- Gereksiz `include` kullanmayın
- Sadece ihtiyacınız olan alanları seçin
- `select` kullanarak belirli alanları getirin

### 6. Cache Kullanımı

Frontend'de React Query veya SWR gibi cache kütüphaneleri kullanabilirsiniz.

## Hız Kontrolü

1. Browser Developer Tools → Network sekmesini açın
2. `/api/kategoriler` endpoint'ini çağırın
3. Response time'ı kontrol edin

**Hedef:**
- İlk istek (cold start): < 2 saniye
- Sonraki istekler: < 500ms

## Sorun Giderme

Eğer hala yavaşsa:

1. **Connection Pooling URL kullanıyor musunuz?**
   - Supabase Dashboard → Settings → Database → Connection Pooling
   - Port 6543 olmalı

2. **Vercel Logs kontrol edin**
   - Dashboard → Deployments → Logs
   - Connection hatalarını kontrol edin

3. **Health Check endpoint'ini test edin**
   - `https://your-app.vercel.app/api/health`
   - Database connection durumunu kontrol edin

4. **Region uyumu**
   - Supabase projenizin region'ı ile Vercel region'ının uyumlu olması önemli
   - Mümkünse aynı region'ı kullanın

