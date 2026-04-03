import { motion } from 'framer-motion'
import { Bot, LoaderCircle, ScanSearch, ShieldCheck, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CameraCapture } from '../components/CameraCapture'
import { useAuth } from '../context/AuthContext'
import { analyzePlantImage } from '../services/aiService'
import { platformService } from '../services/platformService'
import { isNativeApp } from '../services/runtime'
import { formatDateTime } from '../utils/format'

const MAX_BATCH_IMAGES = 5

export function ScanPage() {
  const [images, setImages] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [recentScans, setRecentScans] = useState([])
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
  })
  const MotionSection = motion.section

  const { session } = useAuth()
  const navigate = useNavigate()
  const compact = isNativeApp

  useEffect(() => {
    async function loadRecentScans() {
      if (!session) {
        return
      }

      try {
        const scans = await platformService.getUserScans(session)
        setRecentScans(scans.slice(0, 4))
      } catch (loadError) {
        setError(loadError.message)
      }
    }

    loadRecentScans()
  }, [session])

  async function handleAnalyze() {
    if (!images.length) {
      setError("Avval barg rasmini tanlang yoki kameradan suratga oling.")
      return
    }

    if (!session) {
      setError("Sessiya topilmadi. Qayta login qiling.")
      return
    }

    setSubmitting(true)
    setError('')
    setProgress({
      current: 0,
      total: images.length,
    })

    try {
      const createdScans = []

      for (const [index, imageSrc] of images.entries()) {
        setProgress({
          current: index + 1,
          total: images.length,
        })

        const analysis = await analyzePlantImage(imageSrc)
        const scan = await platformService.createScan(session, {
          imageSrc,
          analysis,
        })

        createdScans.push(scan)
      }

      setImages([])
      setRecentScans((current) => [...createdScans.slice().reverse(), ...current].slice(0, 4))

      if (createdScans.length === 1) {
        navigate(`/results/${createdScans[0].id}`)
        return
      }

      navigate('/history', {
        state: {
          createdCount: createdScans.length,
          latestScanId: createdScans.at(-1)?.id ?? null,
        },
      })
    } catch (scanError) {
      setError(scanError.message)
    } finally {
      setSubmitting(false)
      setProgress({
        current: 0,
        total: 0,
      })
    }
  }

  return (
    <div className={compact ? 'space-y-4 pb-4' : 'grid gap-6 xl:grid-cols-[1.05fr_0.95fr]'}>
      <MotionSection
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className={compact ? 'native-card p-5' : 'glass-panel p-6 sm:p-8'}
      >
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className={`text-sm uppercase tracking-[0.24em] ${compact ? 'text-[#7f8f73]' : 'text-slate-400'}`}>
              Kasallikni aniqlash
            </p>
            <h1 className={`mt-3 font-display ${compact ? 'text-2xl text-[#22311c]' : 'text-3xl text-white sm:text-4xl'}`}>
              Barglarni skan qiling
            </h1>
          </div>
          {!compact ? (
            <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-100">
              OpenAI Vision + lokal fallback
            </div>
          ) : (
            <div className="native-chip">AI scan ready</div>
          )}
        </div>

        <CameraCapture images={images} onImagesChange={setImages} maxImages={MAX_BATCH_IMAGES} />

        {error ? (
          <div className="mt-4 rounded-3xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        {submitting && progress.total ? (
          <div
            className={`mt-4 rounded-[1.75rem] px-4 py-4 text-sm ${
              compact
                ? 'border border-[#dce8d1] bg-[#eef5e2] text-[#486038]'
                : 'border border-cyan-300/20 bg-cyan-300/10 text-cyan-100'
            }`}
          >
            {progress.current}/{progress.total} rasm tahlil qilinmoqda...
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={submitting}
            className={compact ? 'native-primary-button w-full' : 'button-primary w-full justify-center sm:w-auto'}
          >
            {submitting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Tahlil qilinmoqda...
              </>
            ) : (
              <>
                <ScanSearch className="h-4 w-4" />
                {images.length > 1
                  ? `${images.length} ta rasmni tahlil qilish`
                  : 'Kasallikni aniqlash'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setImages([])}
            className={compact ? 'native-secondary-button w-full' : 'button-ghost w-full justify-center sm:w-auto'}
          >
            Qayta boshlash
          </button>
        </div>
      </MotionSection>

      <div className={compact ? 'space-y-4' : 'space-y-6'}>
        <section className={compact ? 'native-card p-5' : 'glass-panel p-6'}>
          <div className="flex items-start gap-4">
            <div className="rounded-3xl bg-cyan-300/10 p-3">
              <Bot className="h-6 w-6 text-cyan-200" />
            </div>
            <div>
              <p className={`text-sm uppercase tracking-[0.24em] ${compact ? 'text-[#7f8f73]' : 'text-slate-400'}`}>AI oqimi</p>
              <h2 className={`mt-2 font-display ${compact ? 'text-2xl text-[#22311c]' : 'text-3xl text-white'}`}>
                Yangi analiz tartibi
              </h2>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            {[
              "Rasm avtomatik siqiladi va shu sabab katta fayllar barqarorroq yuboriladi",
              "OpenAI mavjud bo'lsa structured output bilan natija olinadi, bo'lmasa lokal fallback ishlaydi",
              "Bir martada 5 tagacha rasm ketma-ket tahlil qilinib, natijalar tarixga saqlanadi",
            ].map((item) => (
              <div
                key={item}
                className={`rounded-[1.5rem] px-4 py-4 text-sm ${
                  compact
                    ? 'border border-[#e1e9d7] bg-white text-[#58684d]'
                    : 'border border-white/10 bg-white/5 text-slate-300'
                }`}
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className={compact ? 'native-card p-5' : 'glass-panel p-6'}>
          <div className="flex items-center gap-3">
            <Sparkles className={`h-6 w-6 ${compact ? 'text-[#90ab4f]' : 'text-amber-200'}`} />
            <h2 className={`font-display ${compact ? 'text-xl text-[#22311c]' : 'text-2xl text-white'}`}>So'nggi scanlar</h2>
          </div>

          <div className="mt-5 space-y-3">
            {recentScans.length ? (
              recentScans.map((scan) => (
                <button
                  key={scan.id}
                  type="button"
                  onClick={() => navigate(`/results/${scan.id}`)}
                  className={`flex w-full items-center gap-4 rounded-[1.5rem] p-3 text-left transition ${
                    compact
                      ? 'border border-[#e0e8d6] bg-white hover:bg-[#f6f8f1]'
                      : 'border border-white/10 bg-white/5 hover:border-emerald-300/30 hover:bg-white/10'
                  }`}
                >
                  <img
                    src={scan.imageSrc}
                    alt={scan.diseaseName}
                    className="h-16 w-16 rounded-2xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`truncate font-medium ${compact ? 'text-[#22311c]' : 'text-white'}`}>{scan.diseaseName}</p>
                    <p className={`text-sm ${compact ? 'text-[#7d8b74]' : 'text-slate-400'}`}>{formatDateTime(scan.createdAt)}</p>
                  </div>
                  <div className={`rounded-full px-3 py-2 text-sm ${
                    compact ? 'bg-[#edf5df] text-[#5f7c41]' : 'bg-emerald-300/10 text-emerald-100'
                  }`}>
                    {scan.confidence}%
                  </div>
                </button>
              ))
            ) : (
              <div className={`rounded-[1.5rem] px-4 py-5 text-sm ${
                compact
                  ? 'border border-dashed border-[#d8e2cd] text-[#7f8e74]'
                  : 'border border-dashed border-white/10 text-slate-400'
              }`}>
                Hozircha scanlar yo'q. Birinchi tahlilni shu sahifadan boshlang.
              </div>
            )}
          </div>
        </section>

        <section className={compact ? 'native-card p-5' : 'glass-panel p-6'}>
          <div className="flex items-center gap-3">
            <ShieldCheck className={`h-6 w-6 ${compact ? 'text-[#6e9440]' : 'text-emerald-200'}`} />
            <h2 className={`font-display ${compact ? 'text-xl text-[#22311c]' : 'text-2xl text-white'}`}>Sifat bo'yicha tavsiya</h2>
          </div>
          <p className={`mt-4 text-sm leading-7 ${compact ? 'text-[#58684d]' : 'text-slate-300'}`}>
            Oqartirilgan yoki juda qorong'i suratlar ishonch foizini pasaytiradi. Bargni tekis
            fonda, tabiiy yorug'likda, suv tomchilarsiz holatda tasvirga oling.
          </p>
        </section>
      </div>
    </div>
  )
}
