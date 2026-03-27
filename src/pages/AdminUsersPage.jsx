import {
  Activity,
  LoaderCircle,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserCog,
  UserX,
  Users,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
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

function UserModal({
  open,
  form,
  saving,
  onClose,
  onChange,
  onSubmit,
}) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-slate-950 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Yangi user</p>
            <h2 className="mt-2 font-display text-3xl text-white">Foydalanuvchi yaratish</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-3 text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            className="input-field"
            placeholder="To'liq ism"
            value={form.name}
            onChange={(event) => onChange('name', event.target.value)}
            required
          />
          <input
            className="input-field"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(event) => onChange('email', event.target.value)}
            required
          />
          <input
            className="input-field"
            placeholder="Parol"
            type="password"
            minLength={6}
            value={form.password}
            onChange={(event) => onChange('password', event.target.value)}
            required
          />
          <select className="input-field" value={form.role} onChange={(event) => onChange('role', event.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <input
            className="input-field"
            placeholder="Telefon"
            value={form.phone}
            onChange={(event) => onChange('phone', event.target.value)}
          />
          <input
            className="input-field"
            placeholder="Hudud"
            value={form.region}
            onChange={(event) => onChange('region', event.target.value)}
          />
          <input
            className="input-field md:col-span-2"
            placeholder="Xo'jalik nomi"
            value={form.farmName}
            onChange={(event) => onChange('farmName', event.target.value)}
          />
          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="button-ghost">
              Bekor qilish
            </button>
            <button type="submit" disabled={saving} className="button-primary">
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
          </div>
        </form>
      </div>
    </div>
  )
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
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [form, setForm] = useState(formDefaults)
  const [editForm, setEditForm] = useState(formDefaults)

  const selectedUser = users.find((item) => item.id === selectedUserId)
  const totalUsers = users.length
  const activeUsers = users.filter((item) => item.status === 'active').length
  const inactiveUsers = users.filter((item) => item.status === 'inactive').length
  const adminUsers = users.filter((item) => item.role === 'admin').length
  const totalScans = users.reduce((sum, item) => sum + Number(item.scanCount || 0), 0)

  const summaryCards = useMemo(
    () => [
      {
        label: 'Userlar',
        value: totalUsers,
        icon: Users,
      },
      {
        label: 'Faol',
        value: activeUsers,
        icon: UserCheck,
      },
      {
        label: 'Scanlar',
        value: totalScans,
        icon: Activity,
      },
      {
        label: 'Adminlar',
        value: adminUsers,
        icon: ShieldCheck,
      },
      {
        label: 'Nofaol',
        value: inactiveUsers,
        icon: UserX,
      },
    ],
    [activeUsers, adminUsers, inactiveUsers, totalScans, totalUsers],
  )

  const loadUsers = useCallback(
    async (filters = {}) => {
      setLoading(true)
      setError('')

      try {
        const result = await platformService.listUsers(session, filters)
        setUsers(result)
        setSelectedUserId((current) => {
          if (!result.length) {
            return ''
          }

          const stillExists = result.some((item) => item.id === current)
          return stillExists ? current : result[0].id
        })
      } catch (loadError) {
        setError(loadError.message)
      } finally {
        setLoading(false)
      }
    },
    [session],
  )

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  useEffect(() => {
    async function loadStats() {
      if (!selectedUserId) {
        setStats({})
        return
      }

      try {
        const nextStats = await platformService.getUserStats(session, selectedUserId)
        setStats(nextStats)
      } catch (loadError) {
        setError(loadError.message)
      }
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

  function updateCreateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

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
      setCreateModalOpen(false)
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
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  return (
    <div className="space-y-6">
      <UserModal
        open={createModalOpen}
        form={form}
        saving={saving}
        onClose={() => {
          setCreateModalOpen(false)
          setForm(formDefaults)
        }}
        onChange={updateCreateForm}
        onSubmit={handleCreateUser}
      />

      <section className="glass-panel p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Admin</p>
            <h1 className="mt-3 font-display text-4xl text-white">Userlar</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4 text-right">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Admin</p>
              <p className="mt-2 font-medium text-white">{user?.name}</p>
            </div>
            <button type="button" onClick={() => setCreateModalOpen(true)} className="button-primary">
              <Plus className="h-4 w-4" />
              Yangi user
            </button>
            <button type="button" onClick={() => loadUsers({ search, role })} className="button-ghost">
              <RefreshCcw className="h-4 w-4" />
              Yangilash
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map((item) => {
          const Icon = item.icon

          return (
            <div key={item.label} className="glass-panel p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className="mt-3 font-display text-4xl text-white">{item.value}</p>
                </div>
                <div className="rounded-2xl bg-emerald-300/10 p-3">
                  <Icon className="h-5 w-5 text-emerald-200" />
                </div>
              </div>
            </div>
          )
        })}
      </section>

      {error ? (
        <section className="rounded-[1.75rem] border border-rose-400/30 bg-rose-400/10 px-5 py-4 text-sm text-rose-100">
          {error}
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
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
              <h2 className="font-display text-2xl text-white">Ro'yxat</h2>
            </div>
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <LoaderCircle className="h-4 w-4 animate-spin text-emerald-300" />
                  Yuklanmoqda...
                </div>
              ) : users.length ? (
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
                        <p className="mt-1 text-xs text-slate-500">
                          {item.lastLoginAt
                            ? `Oxirgi kirish: ${formatDateTime(item.lastLoginAt)}`
                            : 'Hali login qilmagan'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.role}</p>
                        <p className="text-sm text-slate-300">{item.scanCount} ta scan</p>
                        <p
                          className={`mt-1 text-xs ${
                            item.status === 'active' ? 'text-emerald-200' : 'text-amber-200'
                          }`}
                        >
                          {item.status === 'active' ? 'Faol' : 'Nofaol'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-white/10 px-4 py-8 text-sm text-slate-400">
                  Qidiruv bo'yicha foydalanuvchi topilmadi.
                </div>
              )}
            </div>
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
                  <p className="text-sm text-slate-300">
                    Oxirgi kirish: {selectedUser.lastLoginAt ? formatDateTime(selectedUser.lastLoginAt) : '-'}
                  </p>
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
                  {(stats?.topDiseases ?? []).length ? (
                    stats.topDiseases.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3"
                      >
                        <span className="text-sm text-slate-200">{item.name}</span>
                        <span className="text-sm text-slate-400">{item.count} ta</span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[1.5rem] border border-dashed border-white/10 px-4 py-6 text-sm text-slate-400">
                      Hozircha kasallik statistikasi yo'q.
                    </div>
                  )}
                </div>

                <form onSubmit={handleUpdateUser} className="grid gap-4 md:grid-cols-2">
                  <input
                    className="input-field"
                    value={editForm.name}
                    onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="To'liq ism"
                    required
                  />
                  <input
                    className="input-field"
                    type="email"
                    value={editForm.email}
                    onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="Email"
                    required
                  />
                  <input
                    className="input-field"
                    value={editForm.phone}
                    onChange={(event) => setEditForm((current) => ({ ...current, phone: event.target.value }))}
                    placeholder="Telefon"
                  />
                  <input
                    className="input-field"
                    value={editForm.region}
                    onChange={(event) => setEditForm((current) => ({ ...current, region: event.target.value }))}
                    placeholder="Hudud"
                  />
                  <input
                    className="input-field md:col-span-2"
                    value={editForm.farmName}
                    onChange={(event) => setEditForm((current) => ({ ...current, farmName: event.target.value }))}
                    placeholder="Xo'jalik nomi"
                  />
                  <select
                    className="input-field"
                    value={editForm.role}
                    onChange={(event) => setEditForm((current) => ({ ...current, role: event.target.value }))}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <select
                    className="input-field"
                    value={editForm.status}
                    onChange={(event) => setEditForm((current) => ({ ...current, status: event.target.value }))}
                  >
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
                        Saqlash
                      </>
                    )}
                  </button>
                </form>

                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => handleToggleStatus(selectedUser)} className="button-ghost">
                    {selectedUser.status === 'active' ? 'Nofaol qilish' : 'Faollashtirish'}
                  </button>
                  {selectedUser.id !== user?.id ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(selectedUser)}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-400/10 px-5 py-3 text-sm font-medium text-rose-100 transition hover:bg-rose-400/15"
                    >
                      <Trash2 className="h-4 w-4" />
                      O'chirish
                    </button>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Ma'lumotlarni ko'rish uchun user tanlang.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
