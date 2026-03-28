# Agro Yordam

Agro Yordam qishloq xo'jaligi foydalanuvchilari uchun barg kasalliklarini aniqlash, natijani saqlash va keyingi davolash tavsiyalarini ko'rsatish uchun yaratilgan platforma.

Platforma ikki xil foydalanish oqimiga bo'lingan:

- `Web app`: admin boshqaruvi, analytics, user management
- `Android APK`: oddiy foydalanuvchilar uchun mobil scan va natija oqimi

## Nima uchun bu platforma yaratilgan

Ko'p holatda dehqon yoki agronom bargdagi kasallikni tez aniqlash, unga mos tavsiyani olish va keyingi holatlarni tarixda saqlab borishga muhtoj bo'ladi. Agro Yordam aynan shu muammoni hal qilish uchun yaratilgan:

- barg rasmini kameradan yoki galeriyadan olish
- AI yordamida ehtimoliy kasallikni topish
- davolash, pesticide, fertilizer va profilaktika tavsiyalarini ko'rsatish
- tarixni saqlash va keyin qayta ko'rish
- admin tomonda umumiy monitoringni yuritish

## Rollar

### Admin

- faqat `web app` orqali ishlaydi
- userlarni ko'radi, qidiradi, yaratadi, tahrirlaydi, o'chiradi
- umumiy analytics va tizim monitoringini ko'radi

### Oddiy foydalanuvchi

- `APK` orqali ishlaydi
- account yaratadi yoki tizimga kiradi
- bargni scan qiladi
- natijalarni va tarixni ko'radi
- profilini boshqaradi

## Asosiy imkoniyatlar

- real auth: register, login, profile update, password update, account delete
- admin panel: user CRUD va statistik monitoring
- scan tarixi va natijalarni saqlash
- OpenAI Vision mavjud bo'lsa AI analiz
- OpenAI bo'lmasa lokal fallback classifier
- Android native image picker va camera oqimi
- APK ichida admin oqimini bloklash, web-only admin flow
- mobile-safe layout, bottom tab bar, compact user flow

## Texnologiyalar

- `Frontend`: React, Vite, Tailwind
- `Backend`: Express
- `Database`: Supabase Postgres
- `Mobile`: Capacitor Android
- `AI`: OpenAI Vision + lokal fallback
- `Deploy`: Vercel + GitHub

## Admin login

Standart admin account:

- Email: `admin@agro-yordam.uz`
- Password: `admin123`

Server start vaqtida admin `.env` dagi `ADMIN_EMAIL` va `ADMIN_PASSWORD` bilan sync qilinadi.

## Arxitektura

### Web

- admin dashboard
- user management
- analytics

### Mobile

- user scan oqimi
- native camera va galeriya
- compact result/history/profile screens

### Backend

- `/api/auth/*`
- `/api/scans/*`
- `/api/users/*`
- `/api/analytics`
- `/api/health`

## Lokal ishga tushirish

```bash
npm install
npm run dev
```

Ochish:

- Frontend: `http://localhost:5173`
- API: `http://127.0.0.1:8787`

## Muhit o'zgaruvchilari

`.env.example` dan nusxa olib `.env` yarating.

Muhim qiymatlar:

- `DATABASE_URL`
- yoki `SUPABASE_SESSION_POOLER_URL`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `OPENAI_API_KEY`
- `OPENAI_VISION_MODEL`
- `VITE_MOBILE_API_BASE_URL`

## Supabase

Project:

- Project ref: `txbniapddbhaumqbqevw`
- Project URL: `https://txbniapddbhaumqbqevw.supabase.co`

CLI buyruqlari:

```bash
npm run supabase:login
npm run supabase:init
npm run supabase:link
```

Yoki:

```bash
npx supabase login
npx supabase init
npx supabase link --project-ref txbniapddbhaumqbqevw
```

## Vercel deploy

Web va API production uchun Vercel ishlatiladi.

Muhim env'lar:

- `DATABASE_URL` yoki `SUPABASE_SESSION_POOLER_URL`
- `JWT_SECRET`
- `OPENAI_API_KEY`
- `OPENAI_VISION_MODEL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Health check:

```bash
GET /api/health
```

Agar `database: "pg-mem-fallback"` chiqsa, demak production hali real Supabase DB'ga ulanmagan.

## GitHub

Remote repo:

`https://github.com/Tuxtamurod-Jurayev/Agro_yordam.git`

GitHub Actions Android APK build uchun workflow qo'shilgan, lekin lokal build hozircha eng ishonchli yo'l bo'lib turibdi.

## Android APK

Loyiha Capacitor orqali Android APK'ga tayyorlangan.

Muhim mobil qarorlar:

- admin APK ichida ishlamaydi
- oddiy user APK orqali ishlaydi
- rasm yuklash native `Capacitor Camera` orqali ishlaydi
- native ilova production API'ga ulanadi

### APK build qilish

```bash
npm install
npm run mobile:sync
npm run mobile:open
```

Yoki lokal build:

```bash
cd android
gradlew assembleDebug
```

APK odatda shu yerda chiqadi:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## Bu repoda qilingan muhim mobil optimizatsiyalar

- Android native wrapper qo'shildi
- mobile-safe padding va bottom navigation qo'shildi
- admin mobile login web-only qilindi
- kamera va galeriya native plugin orqali ishlaydigan qilindi
- compact mobile home, scan, result, history, account oqimi tayyorlandi
- Android SDK 36 ga mos build sozlandi

## Foydalanish oqimi

### Admin oqimi

1. Web app orqali login qiladi
2. Dashboard va analyticsni ko'radi
3. Userlarni boshqaradi

### User oqimi

1. APK o'rnatadi
2. Login yoki register qiladi
3. Kamera yoki galeriya orqali barg rasmini tanlaydi
4. AI natijani ko'radi
5. Tarix va profil sahifalaridan foydalanadi

## Troubleshooting

### Mobil ilovada rasm yuklash ishlamasa

Endi native Android ilovada rasm tanlash `Capacitor Camera` orqali ishlaydi. WebView `file input` xatolari shu yo'l bilan aylanib o'tiladi.

### Admin mobil ilovada kirib qolsa

Admin session native ilovada avtomatik bloklanadi va web versiyaga yo'naltiriladigan xabar ko'rsatiladi.

### Supabase ulanmasa

Agar `db.<project-ref>.supabase.co` direct URL muammo bersa, `session pooler` URL ishlating.

### Vercel 404 bersa

SPA route rewrite va `/api/*` function route sozlangan bo'lishi kerak. `vercel.json` va `api/[...path].js` shu uchun ishlatiladi.

## Repository ichidagi muhim qismlar

- `src/` - React frontend
- `server/` - Express backend
- `android/` - Android native wrapper
- `api/` - Vercel serverless entry
- `supabase/` - Supabase config

## Yakuniy eslatma

Bu loyiha web admin + mobile user modeliga qurilgan. Shuning uchun:

- admin uchun eng to'g'ri platforma `web`
- oddiy user uchun eng to'g'ri platforma `APK`

Shu ajratish UX, xavfsizlik va support nuqtai nazaridan eng sodda va barqaror yechim beradi.
