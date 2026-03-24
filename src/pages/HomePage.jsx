import { motion } from 'framer-motion'
import {
  ArrowRight,
  Camera,
  ChartNoAxesCombined,
  Leaf,
  Sparkles,
  Waves,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DISEASES } from '../data/diseases'
import { platformService } from '../services/platformService'

const features = [
  {
    title: 'Kamera orqali tez skan',
    description:
      "Barg rasmini olish yoki yuklash orqali bir necha soniyada ehtimoliy kasallikni ko'ring.",
    icon: Camera,
  },
  {
    title: 'AI tavsiyalari',
    description:
      "Kasallik sababi, davolash, profilaktika va sug'orish rejasi bir oynada jamlangan.",
    icon: Sparkles,
  },
  {
    title: 'Admin monitoring',
    description:
      "Kunlik, oylik va eng ko'p uchrayotgan kasalliklar bo'yicha real dashboard tayyor.",
    icon: ChartNoAxesCombined,
  },
]

const steps = [
  "Kirish qiling yoki yangi account yarating",
  "Kamera orqali barg rasmini oling yoki galeriyadan tanlang",
  "AI natijasini ko'ring va tavsiyalarni qo'llang",
  "Admin panelda umumiy ko'rsatkichlarni kuzating",
]

export function HomePage() {
  const { session, user } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const MotionDiv = motion.div

  useEffect(() => {
    if (!session) {
      return
    }
    platformService.getAnalytics(session).then(setAnalytics)
  }, [session])

  return (
    <div className="space-y-10 pb-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <MotionDiv
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="glass-panel relative overflow-hidden p-8 sm:p-10"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-300 via-cyan-300 to-amber-200" />
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-emerald-100">
            <Leaf className="h-4 w-4" />
            Qishloq xo'jaligi uchun aqlli monitoring
          </div>

          <div className="max-w-3xl space-y-6">
            <h1 className="font-display text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
              O'simlik kasalliklarini aniqlash va monitoringni bir joyda boshqaring
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Agro Yordam barg rasmlarini tahlil qilib, ehtimoliy kasallikni aniqlaydi, davolash
              bo'yicha tavsiya beradi va admin uchun markazlashgan analytics panelini tayyor
              holatda ko'rsatadi.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={user ? '/scan' : '/auth'} className="button-primary">
              <Camera className="h-4 w-4" />
              {user ? "Skan qilishni boshlash" : 'Kirish va boshlash'}
            </Link>
            <Link to="/history" className="button-ghost">
              Oxirgi natijalarni ko'rish
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Jami scan', value: analytics?.totals.totalScans ?? 0 },
              { label: "O'rtacha ishonch", value: `${analytics?.totals.avgConfidence ?? 0}%` },
              { label: 'Faol foydalanuvchi', value: analytics?.totals.activeUsers ?? 0 },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">{item.label}</p>
                <p className="mt-2 font-display text-3xl text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </MotionDiv>

        <MotionDiv initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="space-y-6">
          <div className="glass-panel overflow-hidden p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Production flow</p>
                <h2 className="mt-2 font-display text-3xl text-white">Real account va analytics tayyor</h2>
              </div>
              <ChartNoAxesCombined className="h-10 w-10 text-emerald-300" />
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Admin imkoniyatlari</p>
                <p className="mt-2 font-medium text-white">Userlarni ko'rish, qidirish va CRUD qilish</p>
                <p className="text-sm text-slate-300">Har bir foydalanuvchi bo'yicha scan statistikasi va monitoring</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Foydalanuvchi imkoniyatlari</p>
                <p className="mt-2 font-medium text-white">Shaxsiy account va scan tarixini boshqarish</p>
                <p className="text-sm text-slate-300">Profil CRUD, parol yangilash va statistika ko'rish</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-300/10 p-3">
                <Waves className="h-6 w-6 text-cyan-200" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Local mode</p>
                <p className="font-display text-2xl text-white">
                  Supabase Postgres va AI bilan tayyor backend
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Tizim real server API orqali ishlaydi. OpenAI kaliti bo'lmagan holatda ham lokal
              fallback classifier mavjud bo'lib, scan jarayonini to'xtatmaydi.
            </p>
          </div>
        </MotionDiv>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon

          return (
            <MotionDiv
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.12 + index * 0.08 }}
              className="glass-panel p-6"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <Icon className="h-6 w-6 text-emerald-200" />
              </div>
              <h3 className="font-display text-2xl text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{feature.description}</p>
            </MotionDiv>
          )
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel p-6 sm:p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Jarayon</p>
          <h2 className="mt-3 font-display text-3xl text-white">4 bosqichli ish jarayoni</h2>
          <div className="mt-6 space-y-4">
            {steps.map((step, index) => (
              <div
                key={step}
                className="flex items-start gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-300/10 font-display text-lg text-emerald-100">
                  {index + 1}
                </div>
                <p className="pt-2 text-sm leading-7 text-slate-200">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 sm:p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Kasallik kutubxonasi</p>
          <h2 className="mt-3 font-display text-3xl text-white">
            Asosiy kasalliklar va profilaktika yo'nalishlari
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {DISEASES.slice(0, 4).map((disease) => (
              <div
                key={disease.key}
                className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5"
              >
                <div
                  className="h-2 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${disease.palette[0]}, ${disease.palette[1]})`,
                  }}
                />
                <h3 className="mt-4 font-display text-2xl text-white">{disease.name}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">{disease.description}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.22em] text-slate-400">
                  Xavf: {disease.severity}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
