import { LoaderCircle, Plus, Search, Trash2, UserCog, Users } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { platformService } from '../services/platformService'
import { formatDateTime } from '../utils/format'

const formDefaults = {
  name: '',
  email: '',
  password: '',
  role: 'user',
  phone: '',
  region: '',
  farmName: '',
  status: 'active',
}

export function AdminUsersPage() {
  const { session, user } = useAuth()
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({})
  const [selectedUserId, setSelectedUserId] = useState('')
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(formDefaults)
  const [editForm, setEditForm] = useState(formDefaults)
  const selectedUser = users.find((item) => item.id === selectedUserId)

  const loadUsers = useCallback(async (filters = {}) => {
    setLoading(true)
    try {
      const result = await platformService.listUsers(session, filters)
      setUsers(result)
      setSelectedUserId((current) => current || result[0]?.id || '')
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  useEffect(() => {
    async function loadStats() {
      if (!selectedUserId) {
        return
      }
      const nextStats = await platformService.getUserStats(session, selectedUserId)
      setStats(nextStats)
    }

    loadStats()
  }, [selectedUserId, session])

  useEffect(() => {
    if (!selectedUser) {
      setEditForm(formDefaults)
      return
    }

    setEditForm({
      name: selectedUser.name ?? '',
      email: selectedUser.email ?? '',
      password: '',
      role: selectedUser.role ?? 'user',
      phone: selectedUser.phone ?? '',
      region: selectedUser.region ?? '',
      farmName: selectedUser.farmName ?? '',
      status: selectedUser.status ?? 'active',
    })
  }, [selectedUser])

  async function handleSearch(event) {
    event.preventDefault()
    await loadUsers({
      search,
      role,
    })
  }

  async function handleCreateUser(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const createdUser = await platformService.createUser(session, form)
      setForm(formDefaults)
      await loadUsers({
        search,
        role,
      })
      setSelectedUserId(createdUser.id)
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateUser(event) {
    event.preventDefault()
    if (!selectedUser) {
      return
    }
    setUpdating(true)
    setError('')

    try {
      await platformService.updateUser(session, selectedUser.id, editForm)
      await loadUsers({ search, role })
    } catch (updateError) {
      setError(updateError.message)
    } finally {
      setUpdating(false)
    }
  }

  async function handleToggleStatus(targetUser) {
    try {
      await platformService.updateUser(session, targetUser.id, {
        ...targetUser,
        name: targetUser.name,
        farmName: targetUser.farmName,
        status: targetUser.status === 'active' ? 'inactive' : 'active',
      })
      await loadUsers({ search, role })
    } catch (updateError) {
      setError(updateError.message)
    }
  }

  async function handleDeleteUser(targetUser) {
    const confirmed = window.confirm(`${targetUser.name} foydalanuvchisini o'chirmoqchimisiz?`)

    if (!confirmed) {
      return
    }

    try {
      await platformService.deleteUser(session, targetUser.id)
      await loadUsers({ search, role })
      if (selectedUserId === targetUser.id) {
        setSelectedUserId('')
        setStats({})
      }
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }
  return (
    <div className="space-y-6">
      <section className="glass-panel p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Admin user management</p>
            <h1 className="mt-3 font-display text-4xl text-white">Userlar CRUD va statistika</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              Admin foydalanuvchilarni qidirishi, yangi user yaratishi, statusini boshqarishi va
              har bir userning scan statistikalarini ko'rishi mumkin.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4 text-right">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Admin</p>
            <p className="mt-2 font-medium text-white">{user?.name}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <form onSubmit={handleSearch} className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  className="input-field pl-11"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Ism yoki email bo'yicha qidirish"
                />
              </label>
              <select className="input-field" value={role} onChange={(event) => setRole(event.target.value)}>
                <option value="">Barcha rollar</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
              <button type="submit" className="button-primary justify-center">
                Qidirish
              </button>
            </form>
          </div>

          <div className="glass-panel p-6">
            <div className="mb-5 flex items-center gap-3">
              <Users className="h-5 w-5 text-cyan-200" />
              <h2 className="font-display text-2xl text-white">Foydalanuvchilar ro'yxati</h2>
            </div>
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <LoaderCircle className="h-4 w-4 animate-spin text-emerald-300" />
                  Yuklanmoqda...
                </div>
              ) : (
                users.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedUserId(item.id)}
                    className={`w-full rounded-[1.5rem] border px-4 py-4 text-left transition ${
                      selectedUserId === item.id
                        ? 'border-emerald-300/35 bg-emerald-300/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{item.name}</p>
                        <p className="text-sm text-slate-400">{item.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.role}</p>
                        <p className="text-sm text-slate-300">{item.scanCount} ta scan</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="mb-5 flex items-center gap-3">
              <Plus className="h-5 w-5 text-emerald-200" />
              <h2 className="font-display text-2xl text-white">Yangi user yaratish</h2>
            </div>
            <form onSubmit={handleCreateUser} className="grid gap-4 md:grid-cols-2">
              <input className="input-field" placeholder="To'liq ism" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
              <input className="input-field" placeholder="Email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
              <input className="input-field" placeholder="Parol" type="password" minLength={6} value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required />
              <select className="input-field" value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <input className="input-field" placeholder="Telefon" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
              <input className="input-field" placeholder="Hudud" value={form.region} onChange={(event) => setForm((current) => ({ ...current, region: event.target.value }))} />
              <input className="input-field md:col-span-2" placeholder="Xo'jalik nomi" value={form.farmName} onChange={(event) => setForm((current) => ({ ...current, farmName: event.target.value }))} />
              <button type="submit" disabled={saving} className="button-primary md:col-span-2 justify-center">
                {saving ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Saqlanmoqda...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    User yaratish
                  </>
                )}
              </button>
            </form>
            {error ? (
              <div className="mt-4 rounded-3xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6">
            <div className="mb-5 flex items-center gap-3">
              <UserCog className="h-5 w-5 text-amber-200" />
              <h2 className="font-display text-2xl text-white">Tanlangan user</h2>
            </div>
            {selectedUser ? (
              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <p className="font-medium text-white">{selectedUser.name}</p>
                  <p className="text-sm text-slate-400">{selectedUser.email}</p>
                  <p className="mt-2 text-sm text-slate-300">Hudud: {selectedUser.region || '-'}</p>
                  <p className="text-sm text-slate-300">Xo'jalik: {selectedUser.farmName || '-'}</p>
                  <p className="text-sm text-slate-300">Yaratilgan: {formatDateTime(selectedUser.createdAt)}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-slate-400">Jami scan</p>
                    <p className="mt-2 font-display text-4xl text-white">{stats?.totals?.totalScans ?? 0}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-slate-400">O'rtacha ishonch</p>
                    <p className="mt-2 font-display text-4xl text-white">{stats?.totals?.avgConfidence ?? 0}%</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {(stats?.topDiseases ?? []).map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <span className="text-sm text-slate-200">{item.name}</span>
                      <span className="text-sm text-slate-400">{item.count} ta</span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleUpdateUser} className="grid gap-4 md:grid-cols-2">
                  <input className="input-field" value={editForm.name} onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))} placeholder="To'liq ism" required />
                  <input className="input-field" type="email" value={editForm.email} onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" required />
                  <input className="input-field" value={editForm.phone} onChange={(event) => setEditForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Telefon" />
                  <input className="input-field" value={editForm.region} onChange={(event) => setEditForm((current) => ({ ...current, region: event.target.value }))} placeholder="Hudud" />
                  <input className="input-field md:col-span-2" value={editForm.farmName} onChange={(event) => setEditForm((current) => ({ ...current, farmName: event.target.value }))} placeholder="Xo'jalik nomi" />
                  <select className="input-field" value={editForm.role} onChange={(event) => setEditForm((current) => ({ ...current, role: event.target.value }))}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <select className="input-field" value={editForm.status} onChange={(event) => setEditForm((current) => ({ ...current, status: event.target.value }))}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <button type="submit" disabled={updating} className="button-primary md:col-span-2 justify-center">
                    {updating ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Yangilanmoqda...
                      </>
                    ) : (
                      <>
                        <UserCog className="h-4 w-4" />
                        Userni yangilash
                      </>
                    )}
                  </button>
                </form>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(selectedUser)}
                    className="button-ghost"
                  >
                    {selectedUser.status === 'active' ? "Nofaol qilish" : 'Faollashtirish'}
                  </button>
                  {selectedUser.id !== user?.id ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(selectedUser)}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-400/10 px-5 py-3 text-sm font-medium text-rose-100 transition hover:bg-rose-400/15"
                    >
                      <Trash2 className="h-4 w-4" />
                      Userni o'chirish
                    </button>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Statistikani ko'rish uchun user tanlang.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
