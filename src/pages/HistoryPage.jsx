import { Clock3, ScanSearch, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { platformService } from '../services/platformService'
import { isNativeApp } from '../services/runtime'
import { formatDateTime } from '../utils/format'

export function HistoryPage() {
  const [scans, setScans] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const { session } = useAuth()
  const location = useLocation()
  const createdCount = location.state?.createdCount ?? 0
  const latestScanId = location.state?.latestScanId ?? null
  const compact = isNativeApp

  useEffect(() => {
    async function loadScans() {
      if (!session) {
        return
      }

      try {
        setError('')
        const nextScans = await platformService.getUserScans(session, search ? { search } : {})
        setScans(nextScans)
      } catch (loadError) {
        setError(loadError.message)
      }
    }

    loadScans()
  }, [search, session])

  return (
    <div className={compact ? 'space-y-4 pb-4' : 'space-y-6'}>
      <section className={`glass-panel ${compact ? 'p-5' : 'p-6 sm:p-8'}`}>
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Scan tarixi</p>
        <h1 className={`mt-3 font-display text-white ${compact ? 'text-2xl' : 'text-4xl'}`}>
          Oxirgi tahlillar
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
          Bu bo'limda foydalanuvchining barcha scanlari saqlanadi. Admin butun tizim bo'yicha
          natijalarni ko'ra oladi.
        </p>
        <label className="relative mt-6 block max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            className="input-field pl-11"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Kasallik nomi yoki xulosa bo'yicha qidirish"
          />
        </label>
      </section>

      {createdCount ? (
        <section className="rounded-[2rem] border border-emerald-300/20 bg-emerald-300/10 px-6 py-5 text-sm text-emerald-100">
          {createdCount} ta rasm muvaffaqiyatli tahlil qilindi va tarixga saqlandi.
          {latestScanId ? (
            <Link to={`/results/${latestScanId}`} className="ml-2 underline decoration-emerald-200/60 underline-offset-4">
              Oxirgi natijani ochish
            </Link>
          ) : null}
        </section>
      ) : null}

      {error ? (
        <section className="rounded-[2rem] border border-rose-400/30 bg-rose-400/10 px-6 py-5 text-sm text-rose-100">
          {error}
        </section>
      ) : null}

      {scans.length ? (
        <section className={`grid gap-4 ${compact ? '' : 'md:grid-cols-2 xl:grid-cols-3'}`}>
          {scans.map((scan) => (
            <Link
              key={scan.id}
              to={`/results/${scan.id}`}
              className="glass-panel overflow-hidden p-4 transition hover:-translate-y-1"
            >
              <img
                src={scan.imageSrc}
                alt={scan.diseaseName}
                className="aspect-[4/3] w-full rounded-[1.5rem] object-cover"
              />
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-2xl text-white">{scan.diseaseName}</h2>
                  <span className="rounded-full bg-emerald-300/10 px-3 py-2 text-sm text-emerald-100">
                    {scan.confidence}%
                  </span>
                </div>
                <p className="text-sm leading-7 text-slate-300">{scan.summary}</p>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Clock3 className="h-4 w-4" />
                  {formatDateTime(scan.createdAt)}
                </div>
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <section className="glass-panel flex flex-col items-center justify-center gap-4 p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-300/10">
            <ScanSearch className="h-7 w-7 text-emerald-200" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-3xl text-white">Hozircha tarix bo'sh</h2>
            <p className="max-w-md text-sm text-slate-300">
              Birinchi barg rasmini yuklab, tizim qanday ishlashini sinab ko'ring.
            </p>
          </div>
          <Link to="/scan" className="button-primary">
            Birinchi scan
          </Link>
        </section>
      )}
    </div>
  )
}
