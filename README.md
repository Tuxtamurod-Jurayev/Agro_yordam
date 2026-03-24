# Agro Yordam

Qishloq xo'jaligi kasalliklarini aniqlash, monitoring qilish va foydalanuvchilarni boshqarish uchun tayyor React + Express + Supabase Postgres loyiha.

## Asosiy imkoniyatlar

- Real account tizimi: register, login, profile update, password update, account delete
- Admin panel: userlarni ko'rish, qidirish, create, update, delete qilish
- Har bir user bo'yicha scan statistikasi va monitoring
- Kamera yoki fayl orqali barg rasmi olish
- OpenAI Vision integratsiyasi va avtomatik lokal fallback
- Scan tarixi va qidiruv
- Supabase Postgres bilan real backend ulanishi

## Admin login

- Email: `admin@agro-yordam.uz`
- Password: `admin123`

## Muhitni ishga tushirish

```bash
npm install
npm run dev
```

Ochish:

- Frontend: `http://localhost:5173`
- API server: `http://127.0.0.1:8787`

## Muhit fayli

Lokal ishga tushirish uchun `.env` tayyorlangan. Agar boshqa serverga ko'chirsangiz:

1. `.env.example` dan `.env` yarating
2. `DATABASE_URL` ni Supabase direct connection string bilan to'ldiring
3. `JWT_SECRET` ni yangilang
4. Ixtiyoriy: `OPENAI_API_KEY` kiriting

## GitHub

Remote repo:

`https://github.com/Tuxtamurod-Jurayev/Agro_yordam.git`

## Supabase

- Project name: `Agro_yordam`
- Project URL: `https://txbniapddbhaumqbqevw.supabase.co`

Server start vaqtida kerakli jadval va seedlar avtomatik yaratiladi.
