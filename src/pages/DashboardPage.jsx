import { Activity, BarChart3, Leaf, LoaderCircle, ShieldCheck, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import { platformService } from '../services/platformService'
import { formatDateTime } from '../utils/format'

export function DashboardPage() {
  const { session } = useAuth()
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    if (!session) {
      return
    }
    platformService.getAnalytics(session).then(setAnalytics)
  }, [session])

  if (!analytics) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="glass-panel flex items-center gap-3 px-6 py-4">
          <LoaderCircle className="h-5 w-5 animate-spin text-emerald-300" />
          Dashboard yuklanmoqda...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="glass-panel p-6 sm:p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Admin analytics</p>
        <h1 className="mt-3 font-display text-4xl text-white">Kasallik monitoring paneli</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          Eng ko'p aniqlangan kasalliklar, faol foydalanuvchilar va scan dinamikasi shu sahifada
          jamlangan. Ma'lumotlar real server API va Supabase Postgres orqali olinadi.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Jami scan',
            value: analytics.totals.totalScans,
            icon: Activity,
          },
          {
            label: "O'rtacha ishonch",
            value: `${analytics.totals.avgConfidence}%`,
            icon: ShieldCheck,
          },
          {
            label: 'Faol foydalanuvchi',
            value: analytics.totals.activeUsers,
            icon: Users,
          },
          {
            label: 'Kasallik kutubxonasi',
            value: analytics.totals.diseaseLibrary,
            icon: Leaf,
          },
        ].map((item) => {
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

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-panel p-6">
          <div className="mb-5 flex items-center gap-3">
            <Activity className="h-5 w-5 text-cyan-200" />
            <h2 className="font-display text-2xl text-white">Kunlik scan dinamikasi</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.dailyScans}>
                <defs>
                  <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 20,
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="scans"
                  stroke="#6ee7b7"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#scanGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6">
          <div className="mb-5 flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-amber-200" />
            <h2 className="font-display text-2xl text-white">Kasallik taqsimoti</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.topDiseases}
                  dataKey="count"
                  nameKey="name"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={3}
                >
                  {analytics.topDiseases.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 20,
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-2">
            {analytics.topDiseases.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-slate-200">{item.name}</span>
                </div>
                <span className="text-sm text-slate-400">{item.count} ta</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="glass-panel p-6">
          <div className="mb-5 flex items-center gap-3">
            <Users className="h-5 w-5 text-cyan-200" />
            <h2 className="font-display text-2xl text-white">Foydalanuvchi faolligi</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.userActivity}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 20,
                    color: '#fff',
                  }}
                />
                <Bar dataKey="scans" radius={[12, 12, 0, 0]} fill="#38bdf8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6">
          <div className="mb-5 flex items-center gap-3">
            <Activity className="h-5 w-5 text-emerald-200" />
            <h2 className="font-display text-2xl text-white">So'nggi faollik</h2>
          </div>
          <div className="space-y-3">
            {analytics.recentScans.map((scan) => (
              <div
                key={scan.id}
                className="flex items-center gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-3"
              >
                <img
                  src={scan.imageSrc}
                  alt={scan.diseaseName}
                  className="h-16 w-16 rounded-2xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white">{scan.diseaseName}</p>
                  <p className="text-sm text-slate-400">{scan.userName}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(scan.createdAt)}</p>
                </div>
                <div className="rounded-full bg-emerald-300/10 px-3 py-2 text-sm text-emerald-100">
                  {scan.confidence}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
