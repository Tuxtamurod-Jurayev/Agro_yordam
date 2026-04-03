import { Leaf, LoaderCircle, LogIn, ShieldCheck, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isNativeApp } from '../services/runtime'

const loginDefaults = {
  email: '',
  password: '',
}

const registerDefaults = {
  name: '',
  email: '',
  password: '',
}

export function AuthPage() {
  const [mode, setMode] = useState('login')
  const [loginForm, setLoginForm] = useState(loginDefaults)
  const [registerForm, setRegisterForm] = useState(registerDefaults)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from ?? '/scan'

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      if (mode === 'login') {
        await signIn(loginForm)
      } else {
        await signUp(registerForm)
      }

      navigate(redirectTo, { replace: true })
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (isNativeApp) {
    return (
      <div className="native-page">
        <section className="native-card overflow-hidden p-5">
          <div className="rounded-[1.6rem] bg-[linear-gradient(135deg,#f8f5ea_0%,#eef5df_100%)] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[#e4efd2]">
                <Leaf className="h-6 w-6 text-[#50703d]" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#829173]">Ankur style</p>
                <h1 className="font-display text-2xl text-[#22311c]">Plant care login</h1>
              </div>
            </div>
            <div className="mt-5 rounded-[1.5rem] border border-[#dce7d2] bg-white/80 p-4">
              <p className="text-sm leading-7 text-[#516047]">
                Tizimga kirib bargni skan qiling, natijani saqlang va AI tavsiyalarini mobil ilova
                ichida ko'ring.
              </p>
            </div>
          </div>
        </section>

        <section className="native-card p-5">
          <div className="grid grid-cols-2 rounded-full bg-[#edf4df] p-1.5">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`rounded-full px-4 py-2.5 text-sm transition ${
                mode === 'login' ? 'bg-white text-[#22311c] shadow-sm' : 'text-[#6c7c61]'
              }`}
            >
              Kirish
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`rounded-full px-4 py-2.5 text-sm transition ${
                mode === 'register' ? 'bg-white text-[#22311c] shadow-sm' : 'text-[#6c7c61]'
              }`}
            >
              Ro'yxat
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {mode === 'register' ? (
              <label className="block space-y-2">
                <span className="text-sm text-[#506045]">To'liq ism</span>
                <input
                  type="text"
                  value={registerForm.name}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, name: event.target.value }))
                  }
                  required
                  className="native-input"
                  placeholder="Jasur Dehqon"
                />
              </label>
            ) : null}

            <label className="block space-y-2">
              <span className="text-sm text-[#506045]">Email</span>
              <input
                type="email"
                value={mode === 'login' ? loginForm.email : registerForm.email}
                onChange={(event) =>
                  mode === 'login'
                    ? setLoginForm((current) => ({ ...current, email: event.target.value }))
                    : setRegisterForm((current) => ({ ...current, email: event.target.value }))
                }
                required
                className="native-input"
                placeholder="you@example.com"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-[#506045]">Parol</span>
              <input
                type="password"
                value={mode === 'login' ? loginForm.password : registerForm.password}
                onChange={(event) =>
                  mode === 'login'
                    ? setLoginForm((current) => ({ ...current, password: event.target.value }))
                    : setRegisterForm((current) => ({ ...current, password: event.target.value }))
                }
                required
                minLength={6}
                className="native-input"
                placeholder="Kamida 6 ta belgi"
              />
            </label>

            {error ? (
              <div className="rounded-[1.3rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <button type="submit" disabled={submitting} className="native-primary-button w-full">
              {submitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Yuklanmoqda...
                </>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="h-4 w-4" />
                  Tizimga kirish
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Hisob yaratish
                </>
              )}
            </button>
          </form>
        </section>

        <section className="native-card p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 text-[#6f9540]" />
            <div className="space-y-3">
              <p className="text-sm leading-7 text-[#55654b]">
                APK oddiy foydalanuvchilar uchun tayyorlangan. Admin monitoring paneli faqat web
                versiyada ishlaydi.
              </p>
              <div className="native-muted-card px-4 py-3">
                <p className="text-xs uppercase tracking-[0.24em] text-[#7f8e74]">Mobile flow</p>
                <p className="mt-2 text-sm text-[#43533a]">
                  Kamera, galeriya, scan natijasi va tarix ekrani mobil foydalanuvchi uchun
                  optimallashtirilgan.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.92fr_1.08fr]">
      <section className="glass-panel p-8 sm:p-10">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Kirish paneli</p>
        <h1 className="mt-4 font-display text-3xl leading-tight text-white sm:text-4xl">
          Tizimga kirib, barg tahlilini boshlang
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          Loyihada real account oqimi ishlaydi. Yangi foydalanuvchini shu oynadan ro'yxatdan
          o'tkazish yoki mavjud hisob bilan kirish mumkin.
        </p>

        <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 text-emerald-200" />
            <p className="text-sm leading-7 text-slate-300">
              Admin login ma'lumoti faqat loyiha README faylida saqlanadi. Interfeys ichida tayyor
              login ma'lumotlari ko'rsatilmaydi.
            </p>
          </div>
        </div>

        {isNativeApp ? (
          <div className="mt-4 rounded-[1.75rem] border border-amber-300/25 bg-amber-300/10 p-5">
            <p className="text-sm leading-7 text-amber-100">
              APK ilova oddiy foydalanuvchilar uchun tayyorlangan. Admin monitoring paneli faqat
              web versiyada ishlaydi.
            </p>
          </div>
        ) : null}
      </section>

      <section className="glass-panel p-8 sm:p-10">
        <div className="grid grid-cols-2 rounded-full border border-white/10 bg-white/5 p-2">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`rounded-full px-4 py-2 text-center text-sm transition sm:px-5 ${
              mode === 'login'
                ? 'bg-white text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Kirish
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`rounded-full px-4 py-2 text-center text-sm transition sm:px-5 ${
              mode === 'register'
                ? 'bg-white text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Ro'yxatdan o'tish
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {mode === 'register' ? (
            <label className="block space-y-2">
              <span className="text-sm text-slate-300">To'liq ism</span>
              <input
                type="text"
                value={registerForm.name}
                onChange={(event) =>
                  setRegisterForm((current) => ({ ...current, name: event.target.value }))
                }
                required
                className="input-field"
                placeholder="Masalan: Jasur Dehqon"
              />
            </label>
          ) : null}

          <label className="block space-y-2">
            <span className="text-sm text-slate-300">Email</span>
            <input
              type="email"
              value={mode === 'login' ? loginForm.email : registerForm.email}
              onChange={(event) =>
                mode === 'login'
                  ? setLoginForm((current) => ({ ...current, email: event.target.value }))
                  : setRegisterForm((current) => ({ ...current, email: event.target.value }))
              }
              required
              className="input-field"
              placeholder="you@example.com"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-slate-300">Parol</span>
            <input
              type="password"
              value={mode === 'login' ? loginForm.password : registerForm.password}
              onChange={(event) =>
                mode === 'login'
                  ? setLoginForm((current) => ({ ...current, password: event.target.value }))
                  : setRegisterForm((current) => ({ ...current, password: event.target.value }))
              }
              required
              minLength={6}
              className="input-field"
              placeholder="Kamida 6 ta belgi"
            />
          </label>

          {error ? (
            <div className="rounded-3xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <button type="submit" disabled={submitting} className="button-primary w-full justify-center">
            {submitting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Yuklanmoqda...
              </>
            ) : mode === 'login' ? (
              <>
                <LogIn className="h-4 w-4" />
                Tizimga kirish
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Hisob yaratish
              </>
            )}
          </button>
        </form>
      </section>
    </div>
  )
}
