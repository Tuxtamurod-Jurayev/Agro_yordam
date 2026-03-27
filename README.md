# Agro Yordam

Qishloq xo'jaligi kasalliklarini aniqlash, monitoring qilish va foydalanuvchilarni boshqarish uchun tayyor React + Express + Supabase Postgres loyiha.

## Asosiy imkoniyatlar

- Real account tizimi: register, login, profile update, password update, account delete
- Admin panel: userlarni ko'rish, qidirish, create, update, delete qilish
- Har bir user bo'yicha scan statistikasi va monitoring
- Kamera yoki fayl orqali barg rasmi olish
- OpenAI Vision integratsiyasi va avtomatik lokal fallback
- AI cache: bir xil rasm qayta yuborilganda natija tezroq qaytadi
- Scan tarixi va qidiruv
- Supabase Postgres bilan real backend ulanishi

## Admin login

- Email: `admin@agro-yordam.uz`
- Password: `admin123`

Server ishga tushganda shu admin hisob bazaga avtomatik sync qilinadi. Agar oldin boshqa parol bilan
yaratilgan bo'lsa ham, `.env` dagi `ADMIN_EMAIL` va `ADMIN_PASSWORD` qiymatlari ustun bo'ladi.

## Muhitni ishga tushirish

```bash
npm install
npm run dev
```

Ochish:

- Frontend: `http://localhost:5173`
- API server: `http://127.0.0.1:8787`

## Mobil APK

Loyiha oddiy foydalanuvchilar uchun Android APK yo'liga tayyorlandi:

- Mobil wrapper: Capacitor
- Native build paytida API manzili: `VITE_MOBILE_API_BASE_URL`
- Standart mobile API: `https://agro-yordam.vercel.app`

Tayyorlash buyruqlari:

```bash
npm install
npm run mobile:sync
npm run mobile:open
```

Android Studio ichida:

1. `Build > Build Bundle(s) / APK(s) > Build APK(s)`
2. Yoki `Generate Signed Bundle / APK` orqali release APK chiqaring

Eslatma:

- Hozirgi muhitda Java/Gradle/Android SDK yo'qligi sabab bu yerning o'zida `.apk` faylni final build qilib bera olmadim.
- Lekin kod, Capacitor config va Android sync oqimi APK chiqarishga tayyor holatga keltirildi.
- Mobil ilova ichida `/api` so'rovlari adashib lokalga ketmasligi uchun native rejimda production API avtomatik ishlatiladi.

## Muhit fayli

Lokal ishga tushirish uchun `.env` tayyorlangan. Agar boshqa serverga ko'chirsangiz:

1. `.env.example` dan `.env` yarating
2. `DATABASE_URL` yoki `SUPABASE_SESSION_POOLER_URL` ni Supabase Connect sahifasidagi connection
   string bilan to'ldiring
3. `JWT_SECRET` ni yangilang
4. Ixtiyoriy: `OPENAI_API_KEY` kiriting
5. Ixtiyoriy: `OPENAI_VISION_MODEL=gpt-4.1-mini` yoki siz ishlatayotgan modelni belgilang

Muhim:

- `db.<project-ref>.supabase.co` ko'rinishidagi direct Postgres URL ko'pincha IPv6 bo'ladi.
- Agar server logida `ENOTFOUND` yoki `pg-mem-fallback` ko'rinsa, Supabase Connect sahifasidan
  `session pooler` URL'ni oling va `.env` ga qo'ying.
- `GET /api/health` endi `databaseError` maydoni orqali fallback sababini ham ko'rsatadi.

## Supabase CLI

Loyihada Supabase CLI uchun lokal konfiguratsiya ham qo'shildi:

- Project ref: `txbniapddbhaumqbqevw`
- Project URL: `https://txbniapddbhaumqbqevw.supabase.co`
- Publishable key: `sb_publishable_Qww195wGQ9S1dEs1cs-ZtQ_ZvVl3biu`
- Direct DB URL: `postgresql://postgres:[YOUR-PASSWORD]@db.txbniapddbhaumqbqevw.supabase.co:5432/postgres`

CLI buyruqlari:

```bash
npm run supabase:login
npm run supabase:init
npm run supabase:link
```

Yoki to'g'ridan-to'g'ri:

```bash
npx supabase login
npx supabase init
npx supabase link --project-ref txbniapddbhaumqbqevw
```

Eslatma:

- `supabase login` uchun Supabase account access token kerak bo'ladi.
- `supabase link --project-ref txbniapddbhaumqbqevw` ishlashi uchun avval login qilingan bo'lishi kerak.
- Direct DB URL uchun `[YOUR-PASSWORD]` o'rniga database password qo'yiladi.
- IPv4 tarmoqda backend uchun ko'pincha `session pooler` URL barqarorroq ishlaydi.

## GitHub

Remote repo:

`https://github.com/Tuxtamurod-Jurayev/Agro_yordam.git`

## Supabase

- Project name: `Agro_yordam`
- Project URL: `https://txbniapddbhaumqbqevw.supabase.co`

Server start vaqtida kerakli jadval va seedlar avtomatik yaratiladi.









1. dasturda faqat admin web app da kira olsin 
2. user foydalanuvchilar apk filelidan foydalanishlari kerak boladi
3. barcha hatoliklarni va .apk filedagi buglarni to'g'irla va menga jonat 
4.  tizimni barcha qisimlarni boshqattan ko'rb chiq va optimal holatga keltir har haqan android qurulmalari uchun tizim qurayotganimizni esingda chiqarma va dzayinga o'zgatirish kiritish kerak emas 
5.  Menga shu yerda apk file tayyor holatga keltir har qanday qoshimcha dastur yoki toolslar o'rnatishing mumkin
men senga ishonaman  sen buni uddalaysan
