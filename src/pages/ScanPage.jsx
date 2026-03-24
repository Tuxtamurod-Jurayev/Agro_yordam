import { motion } from 'framer-motion'
import { Bot, LoaderCircle, ScanSearch, ShieldCheck, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CameraCapture } from '../components/CameraCapture'
import { useAuth } from '../context/AuthContext'
import { analyzePlantImage } from '../services/aiService'
import { platformService } from '../services/platformService'
import { formatDateTime } from '../utils/format'

export function ScanPage() {
  const [imageSrc, setImageSrc] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [recentScans, setRecentScans] = useState([])
  const MotionSection = motion.section

  const { session, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!session) {
      return
    }
    platformService.getUserScans(session).then((scans) => {
      setRecentScans(scans.slice(0, 4))
    })
  }, [session, user])

  async function handleAnalyze() {
    if (!imageSrc) {
      setError("Avval barg rasmini tanlang yoki kameradan suratga oling.")
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const analysis = await analyzePlantImage(imageSrc)
      if (!session) {
        throw new Error("Sessiya topilmadi. Qayta login qiling.")
      }
      const scan = await platformService.createScan(session, {
        imageSrc,
        analysis,
      })

      navigate(`/results/${scan.id}`)
    } catch (scanError) {
      setError(scanError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <MotionSection
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 sm:p-8"
      >
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Kasallikni aniqlash</p>
            <h1 className="mt-3 font-display text-4xl text-white">Bargni skan qiling</h1>
          </div>
          <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-100">
            OpenAI Vision + fallback AI
          </div>
        </div>

        <CameraCapture imageSrc={imageSrc} onImageChange={setImageSrc} />

        {error ? (
          <div className="mt-4 rounded-3xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={submitting}
            className="button-primary"
          >
            {submitting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Tahlil qilinmoqda...
              </>
            ) : (
              <>
                <ScanSearch className="h-4 w-4" />
                Kasallikni aniqlash
              </>
            )}
          </button>
          <button type="button" onClick={() => setImageSrc('')} className="button-ghost">
            Qayta boshlash
          </button>
        </div>
      </MotionSection>

      <div className="space-y-6">
        <section className="glass-panel p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-3xl bg-cyan-300/10 p-3">
              <Bot className="h-6 w-6 text-cyan-200" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">AI oqimi</p>
              <h2 className="mt-2 font-display text-3xl text-white">Tahlil qanday ishlaydi?</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            {[
              "Rasm 48x48 o'lchamga tushiriladi va piksel rang balansi olinadi",
              "OpenAI server mavjud bo'lsa multimodal tahlil ishlaydi, bo'lmasa lokal fallback yoqiladi",
              "Natija kasallik tavsifi va davolash bo'yicha tavsiyalar bilan birga qaytadi",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-300"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel p-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-amber-200" />
            <h2 className="font-display text-2xl text-white">So'nggi scanlar</h2>
          </div>

          <div className="mt-5 space-y-3">
            {recentScans.length ? (
              recentScans.map((scan) => (
                <button
                  key={scan.id}
                  type="button"
                  onClick={() => navigate(`/results/${scan.id}`)}
                  className="flex w-full items-center gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-3 text-left transition hover:border-emerald-300/30 hover:bg-white/10"
                >
                  <img
                    src={scan.imageSrc}
                    alt={scan.diseaseName}
                    className="h-16 w-16 rounded-2xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white">{scan.diseaseName}</p>
                    <p className="text-sm text-slate-400">{formatDateTime(scan.createdAt)}</p>
                  </div>
                  <div className="rounded-full bg-emerald-300/10 px-3 py-2 text-sm text-emerald-100">
                    {scan.confidence}%
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-white/10 px-4 py-5 text-sm text-slate-400">
                Hozircha scanlar yo'q. Birinchi tahlilni shu sahifadan boshlang.
              </div>
            )}
          </div>
        </section>

        <section className="glass-panel p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-emerald-200" />
            <h2 className="font-display text-2xl text-white">Sifat bo'yicha tavsiya</h2>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Oqartirilgan yoki juda qorong'i suratlar ishonch foizini pasaytiradi. Bargni tekis
            fonda, tabiiy yorug'likda, suv tomchilarsiz holatda tasvirga oling.
          </p>
        </section>
      </div>
    </div>
  )
}
