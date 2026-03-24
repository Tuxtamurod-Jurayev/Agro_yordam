import { LoaderCircle, LogIn, ShieldCheck, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.92fr_1.08fr]">
      <section className="glass-panel p-8 sm:p-10">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Kirish paneli</p>
        <h1 className="mt-4 font-display text-4xl leading-tight text-white">
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
      </section>

      <section className="glass-panel p-8 sm:p-10">
        <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-2">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`rounded-full px-5 py-2 text-sm transition ${
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
            className={`rounded-full px-5 py-2 text-sm transition ${
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
