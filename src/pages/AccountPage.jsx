import { AlertTriangle, KeyRound, LoaderCircle, Save, Trash2, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isNativeApp } from '../services/runtime'

const profileDefaults = {
  name: '',
  email: '',
  phone: '',
  region: '',
  farmName: '',
}

export function AccountPage() {
  const { session, user, refreshSession, updateProfile, updatePassword, deleteAccount } = useAuth()
  const [profileForm, setProfileForm] = useState(profileDefaults)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    nextPassword: '',
  })
  const [stats, setStats] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()
  const compact = isNativeApp

  useEffect(() => {
    setProfileForm({
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      region: user?.region ?? '',
      farmName: user?.farmName ?? '',
    })
    setStats(session?.stats ?? null)
  }, [session, user])

  async function handleProfileSave(event) {
    event.preventDefault()
    setSavingProfile(true)
    setError('')
    setMessage('')

    try {
      await updateProfile(profileForm)
      const nextSession = await refreshSession()
      setStats(nextSession?.stats ?? null)
      setMessage('Profil muvaffaqiyatli yangilandi.')
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSavingProfile(false)
    }
  }

  async function handlePasswordSave(event) {
    event.preventDefault()
    setSavingPassword(true)
    setError('')
    setMessage('')

    try {
      await updatePassword(passwordForm)
      setPasswordForm({
        currentPassword: '',
        nextPassword: '',
      })
      setMessage("Parol muvaffaqiyatli yangilandi.")
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSavingPassword(false)
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Hisobingiz va unga tegishli barcha scanlar o'chiriladi. Davom etasizmi?",
    )

    if (!confirmed) {
      return
    }

    setDeleting(true)
    setError('')

    try {
      await deleteAccount()
      navigate('/auth', { replace: true })
    } catch (submitError) {
      setError(submitError.message)
      setDeleting(false)
    }
  }

  return (
    <div className={compact ? 'space-y-4 pb-4' : 'grid gap-6 xl:grid-cols-[0.9fr_1.1fr]'}>
      <section className="space-y-6">
        <div className={compact ? 'native-card p-5' : 'glass-panel p-6 sm:p-8'}>
          <div className="flex items-start gap-4">
            <div className="rounded-3xl bg-emerald-300/10 p-3">
              <UserRound className="h-6 w-6 text-emerald-200" />
            </div>
            <div>
              <p className={`text-sm uppercase tracking-[0.24em] ${compact ? 'text-[#7f8f73]' : 'text-slate-400'}`}>Account</p>
              <h1 className={`mt-2 font-display ${compact ? 'text-2xl text-[#22311c]' : 'text-3xl text-white sm:text-4xl'}`}>
                Profil boshqaruvi
              </h1>
              <p className={`mt-3 text-sm leading-7 ${compact ? 'text-[#58684d]' : 'text-slate-300'}`}>
                Ism, email va xo'jalik ma'lumotlarini yangilashingiz mumkin.
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="mt-8 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-1">
              <span className={`text-sm ${compact ? 'text-[#58684d]' : 'text-slate-300'}`}>To'liq ism</span>
              <input
                className={compact ? 'native-input' : 'input-field'}
                value={profileForm.name}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, name: event.target.value }))
                }
                required
              />
            </label>
            <label className="space-y-2 md:col-span-1">
              <span className={`text-sm ${compact ? 'text-[#58684d]' : 'text-slate-300'}`}>Email</span>
              <input
                className={compact ? 'native-input' : 'input-field'}
                type="email"
                value={profileForm.email}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, email: event.target.value }))
                }
                required
              />
            </label>
            <label className="space-y-2 md:col-span-1">
              <span className={`text-sm ${compact ? 'text-[#58684d]' : 'text-slate-300'}`}>Telefon</span>
              <input
                className={compact ? 'native-input' : 'input-field'}
                value={profileForm.phone}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, phone: event.target.value }))
                }
              />
            </label>
            <label className="space-y-2 md:col-span-1">
              <span className={`text-sm ${compact ? 'text-[#58684d]' : 'text-slate-300'}`}>Hudud</span>
              <input
                className={compact ? 'native-input' : 'input-field'}
                value={profileForm.region}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, region: event.target.value }))
                }
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className={`text-sm ${compact ? 'text-[#58684d]' : 'text-slate-300'}`}>Xo'jalik nomi</span>
              <input
                className={compact ? 'native-input' : 'input-field'}
                value={profileForm.farmName}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, farmName: event.target.value }))
                }
              />
            </label>

            {error ? (
              <div className="rounded-3xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100 md:col-span-2">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="rounded-3xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100 md:col-span-2">
                {message}
              </div>
            ) : null}

            <div className="md:col-span-2">
              <button type="submit" disabled={savingProfile} className={compact ? 'native-primary-button w-full' : 'button-primary w-full justify-center sm:w-auto'}>
                {savingProfile ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Saqlanmoqda...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Profilni saqlash
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className={compact ? 'native-card p-5' : 'glass-panel p-6 sm:p-8'}>
          <div className="flex items-start gap-4">
            <div className="rounded-3xl bg-cyan-300/10 p-3">
              <KeyRound className="h-6 w-6 text-cyan-200" />
            </div>
            <div>
              <h2 className={`font-display ${compact ? 'text-2xl text-[#22311c]' : 'text-3xl text-white'}`}>
                Parolni almashtirish
              </h2>
              <p className={`mt-3 text-sm leading-7 ${compact ? 'text-[#58684d]' : 'text-slate-300'}`}>
                Xavfsizlik uchun joriy parolni kiriting va yangisini belgilang.
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordSave} className="mt-8 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className={`text-sm ${compact ? 'text-[#58684d]' : 'text-slate-300'}`}>Joriy parol</span>
              <input
                className={compact ? 'native-input' : 'input-field'}
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    currentPassword: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label className="space-y-2">
              <span className={`text-sm ${compact ? 'text-[#58684d]' : 'text-slate-300'}`}>Yangi parol</span>
              <input
                className={compact ? 'native-input' : 'input-field'}
                type="password"
                value={passwordForm.nextPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    nextPassword: event.target.value,
                  }))
                }
                required
                minLength={6}
              />
            </label>
            <div className="md:col-span-2">
              <button type="submit" disabled={savingPassword} className={compact ? 'native-primary-button w-full' : 'button-primary w-full justify-center sm:w-auto'}>
                {savingPassword ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Yangilanmoqda...
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    Parolni yangilash
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="space-y-6">
        <div className={compact ? 'native-card p-5' : 'glass-panel p-6 sm:p-8'}>
          <p className={`text-sm uppercase tracking-[0.24em] ${compact ? 'text-[#7f8f73]' : 'text-slate-400'}`}>Shaxsiy statistika</p>
          <h2 className={`mt-3 font-display ${compact ? 'text-2xl text-[#22311c]' : 'text-3xl text-white'}`}>
            Faollik ko'rsatkichlari
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className={compact ? 'native-muted-card p-4' : 'rounded-[1.5rem] border border-white/10 bg-white/5 p-4'}>
              <p className={`text-sm ${compact ? 'text-[#7f8f73]' : 'text-slate-400'}`}>Jami scan</p>
              <p className={`mt-2 font-display text-4xl ${compact ? 'text-[#22311c]' : 'text-white'}`}>{stats?.totals?.totalScans ?? 0}</p>
            </div>
            <div className={compact ? 'native-muted-card p-4' : 'rounded-[1.5rem] border border-white/10 bg-white/5 p-4'}>
              <p className={`text-sm ${compact ? 'text-[#7f8f73]' : 'text-slate-400'}`}>O'rtacha ishonch</p>
              <p className={`mt-2 font-display text-4xl ${compact ? 'text-[#22311c]' : 'text-white'}`}>{stats?.totals?.avgConfidence ?? 0}%</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {(stats?.topDiseases ?? []).map((item) => (
              <div
                key={item.name}
                className={compact ? 'native-muted-card flex items-center justify-between px-4 py-3' : 'flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3'}
              >
                <span className={`text-sm ${compact ? 'text-[#22311c]' : 'text-slate-200'}`}>{item.name}</span>
                <span className={`text-sm ${compact ? 'text-[#7f8f73]' : 'text-slate-400'}`}>{item.count} ta</span>
              </div>
            ))}
          </div>
        </div>

        <div className={compact ? 'native-card border border-rose-200 p-5' : 'glass-panel border border-rose-400/20 p-6 sm:p-8'}>
          <div className="flex items-start gap-4">
            <div className="rounded-3xl bg-rose-400/10 p-3">
              <AlertTriangle className="h-6 w-6 text-rose-200" />
            </div>
            <div>
              <h2 className={`font-display ${compact ? 'text-2xl text-[#22311c]' : 'text-3xl text-white'}`}>
                Accountni o'chirish
              </h2>
              <p className={`mt-3 text-sm leading-7 ${compact ? 'text-[#58684d]' : 'text-slate-300'}`}>
                Bu amal ortga qaytmaydi. Hisob, scan tarixi va bog'liq ma'lumotlar o'chiriladi.
              </p>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-rose-400/30 bg-rose-400/10 px-5 py-3 text-sm font-medium text-rose-100 transition hover:bg-rose-400/15 sm:w-auto"
              >
                {deleting ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    O'chirilmoqda...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Accountni o'chirish
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
