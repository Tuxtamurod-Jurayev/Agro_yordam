import { motion } from 'framer-motion'
import {
  ArrowRight,
  Beaker,
  Droplets,
  Leaf,
  LoaderCircle,
  ShieldPlus,
  SprayCan,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { platformService } from '../services/platformService'
import { isNativeApp } from '../services/runtime'
import { formatDateTime } from '../utils/format'

export function ResultPage() {
  const [scan, setScan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const MotionSection = motion.section

  const { scanId } = useParams()
  const { session, user } = useAuth()
  const navigate = useNavigate()
  const compact = isNativeApp

  useEffect(() => {
    async function loadScan() {
      if (!session) {
        return
      }
      const data = await platformService.getScanById(session, scanId)

      if (!data) {
        setError('Natija topilmadi.')
        setLoading(false)
        return
      }

      if (user.role !== 'admin' && data.userId !== user.id) {
        setError("Bu natijani ko'rishga ruxsat yo'q.")
        setLoading(false)
        return
      }

      setScan(data)
      setLoading(false)
    }

    loadScan()
  }, [scanId, session, user])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="glass-panel flex items-center gap-3 px-6 py-4">
          <LoaderCircle className="h-5 w-5 animate-spin text-emerald-300" />
          Natija yuklanmoqda...
        </div>
      </div>
    )
  }

  if (error || !scan) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="glass-panel max-w-xl space-y-4 p-8 text-center">
          <h1 className="font-display text-3xl text-white">Natija mavjud emas</h1>
          <p className="text-sm text-slate-300">{error}</p>
          <button type="button" onClick={() => navigate('/scan')} className="button-primary mx-auto">
            Yangi scan qilish
          </button>
        </div>
      </div>
    )
  }

  const disease = scan.disease
  const aiLabel =
    scan.analysisSource === 'openai-cache'
      ? 'OpenAI cache'
      : scan.analysisSource === 'openai'
        ? 'OpenAI Vision'
        : 'Lokal fallback'

  return (
    <div className={compact ? 'space-y-4 pb-4' : 'grid gap-6 xl:grid-cols-[0.95fr_1.05fr]'}>
      <MotionSection
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className={compact ? 'native-card p-5' : 'glass-panel p-6 sm:p-8'}
      >
        <img
          src={scan.imageSrc}
          alt={scan.diseaseName}
          className="aspect-[4/3] w-full rounded-[2rem] object-cover"
        />

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className={`text-sm uppercase tracking-[0.24em] ${compact ? 'text-[#7f8f73]' : 'text-slate-400'}`}>Aniqlangan natija</p>
            <h1 className={`mt-2 font-display ${compact ? 'text-2xl text-[#22311c]' : 'text-3xl text-white sm:text-4xl'}`}>
              {scan.diseaseName}
            </h1>
            <p className={`mt-2 text-sm ${compact ? 'text-[#6f7e65]' : 'text-slate-300'}`}>{formatDateTime(scan.createdAt)}</p>
          </div>
          <div className={`rounded-[1.75rem] px-5 py-4 text-center ${
            compact
              ? 'border border-[#dce8d2] bg-[#eef5e2]'
              : 'border border-emerald-300/20 bg-emerald-300/10'
          }`}>
            <p className={`text-xs uppercase tracking-[0.22em] ${compact ? 'text-[#6b8c47]' : 'text-emerald-100'}`}>Ishonch</p>
            <p className={`mt-2 font-display text-4xl ${compact ? 'text-[#21321b]' : 'text-white'}`}>{scan.confidence}%</p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-3 rounded-full"
            style={{
              width: `${scan.confidence}%`,
              background: `linear-gradient(90deg, ${disease.palette[0]}, ${disease.palette[1]})`,
            }}
          />
        </div>

        <p className={`mt-6 text-sm leading-7 ${compact ? 'text-[#58684d]' : 'text-slate-300'}`}>{scan.summary}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className={compact ? 'native-chip' : 'rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200'}>
            AI manba: {aiLabel}
          </span>
          {scan.modelUsed ? (
            <span className={compact ? 'native-chip' : 'rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200'}>
              Model: {scan.modelUsed}
            </span>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {scan.indicators.map((indicator) => (
            <span
              key={indicator}
              className={compact ? 'native-chip' : 'rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200'}
            >
              {indicator}
            </span>
          ))}
        </div>

        <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
          <Link to="/scan" className={compact ? 'native-primary-button w-full' : 'button-primary w-full justify-center sm:w-auto'}>
            Yangi scan
          </Link>
          <Link to="/history" className={compact ? 'native-secondary-button w-full' : 'button-ghost w-full justify-center sm:w-auto'}>
            Tarixga qaytish
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </MotionSection>

      <div className={compact ? 'space-y-4' : 'space-y-6'}>
        <section className={compact ? 'native-card p-5' : 'glass-panel p-6'}>
          <div className="flex items-start gap-3">
            <Leaf className={`mt-1 h-6 w-6 ${compact ? 'text-[#6f9540]' : 'text-emerald-200'}`} />
            <div>
              <h2 className={`font-display text-2xl ${compact ? 'text-[#22311c]' : 'text-white'}`}>Sabab va tavsif</h2>
              <p className={`mt-3 text-sm leading-7 ${compact ? 'text-[#58684d]' : 'text-slate-300'}`}>{disease.description}</p>
              <p className={`mt-3 text-sm leading-7 ${compact ? 'text-[#58684d]' : 'text-slate-300'}`}>{disease.causes}</p>
            </div>
          </div>
        </section>

        <section className={`grid gap-4 ${compact ? '' : 'md:grid-cols-3'}`}>
          {[
            {
              icon: ShieldPlus,
              title: 'Davolash',
              value: disease.treatment,
            },
            {
              icon: SprayCan,
              title: 'Pesticide',
              value: disease.pesticide,
            },
            {
              icon: Beaker,
              title: 'Fertilizer',
              value: disease.fertilizer,
            },
          ].map((item) => {
            const Icon = item.icon

            return (
              <div key={item.title} className={compact ? 'native-card p-5' : 'glass-panel p-5'}>
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${compact ? 'bg-[#edf4df]' : 'bg-white/10'}`}>
                  <Icon className={`h-5 w-5 ${compact ? 'text-[#648840]' : 'text-cyan-200'}`} />
                </div>
                <h3 className={`font-display text-xl ${compact ? 'text-[#22311c]' : 'text-white'}`}>{item.title}</h3>
                <p className={`mt-3 text-sm leading-7 ${compact ? 'text-[#58684d]' : 'text-slate-300'}`}>{item.value}</p>
              </div>
            )
          })}
        </section>

        <section className={compact ? 'native-card p-5' : 'glass-panel p-6'}>
          <div className="flex items-start gap-3">
            <Droplets className={`mt-1 h-6 w-6 ${compact ? 'text-[#6e9540]' : 'text-sky-200'}`} />
            <div>
              <h2 className={`font-display text-2xl ${compact ? 'text-[#22311c]' : 'text-white'}`}>Sug'orish va profilaktika</h2>
              <p className={`mt-3 text-sm leading-7 ${compact ? 'text-[#58684d]' : 'text-slate-300'}`}>{disease.irrigation}</p>
              <p className={`mt-3 text-sm leading-7 ${compact ? 'text-[#58684d]' : 'text-slate-300'}`}>{disease.prevention}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
