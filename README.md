# Yerel geliştirme ortamı

MySQL ve Next.js, `vtys` adlı Docker Compose grubu altında çalışır.
Next.js klasörü yalnızca `npx create-next-app@latest` başlangıç şablonudur.

## Başlatma

Docker Desktop açıkken bu klasörde çalıştır:

```powershell
docker compose up -d
```

- Next.js: http://localhost:3000
- MySQL: `127.0.0.1:3307` (yerel 3306 portu kullanılamadığı için)
- Veritabanı ve kullanıcı: `vtys`
- Parolalar: yerel `.env` dosyasında (Git'e dahil edilmez).

Başka bir makinede ilk kurulum için `.env.example` dosyasını `.env` olarak
kopyala ve parolaları değiştir.

Next.js konteynerinde MySQL adresi `mysql:3306` olur. `DB_HOST`, `DB_PORT`,
`DB_NAME`, `DB_USER`, `DB_PASSWORD` ortam değişkenleri hazırdır. Veritabanı
sürücüsü, ORM ve uygulama bağlantı kodu eklenmemiştir.

Kaynak dosyalar `nextjs/` klasöründedir; değişiklikler geliştirme sunucusuna
yansır. Bağımlılıklar, Next.js önbelleği ve MySQL verileri Docker volume'lerinde
tutulur. Bağımlılıklar ilk başlatmada `npm ci` ile kurulur. Bağımlılıklar
değiştiğinde `docker compose exec nextjs npm ci` komutunu çalıştır.

## Yönetim

```powershell
docker compose logs -f
docker compose stop
docker compose start
docker compose down
```

`docker compose down` veritabanını korur; `docker compose down -v` verileri de siler.

Next.js konteynerinde terminal açmak için:

```powershell
docker compose exec nextjs sh
```
