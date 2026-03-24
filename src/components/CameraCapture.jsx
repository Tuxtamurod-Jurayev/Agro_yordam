import { Camera, ImageUp, RefreshCcw, ScanSearch, Smartphone, XCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error("Faylni o'qib bo'lmadi."))
    reader.readAsDataURL(file)
  })
}

function stopStream(stream) {
  stream?.getTracks().forEach((track) => track.stop())
}

export function CameraCapture({ imageSrc, onImageChange }) {
  const videoRef = useRef(null)
  const fileInputRef = useRef(null)
  const streamRef = useRef(null)

  const [cameraOpen, setCameraOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    return () => {
      stopStream(streamRef.current)
    }
  }, [])

  async function handleStartCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Brauzer kamerani qo‘llab-quvvatlamaydi. Fayl yuklashdan foydalaning.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
        },
        audio: false,
      })

      streamRef.current = stream
      setCameraOpen(true)
      setError('')

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    } catch {
      setError('Kameraga ruxsat berilmadi yoki qurilma kamerasi topilmadi.')
    }
  }

  function handleStopCamera() {
    setCameraOpen(false)
    stopStream(streamRef.current)
    streamRef.current = null
  }

  function handleCapture() {
    if (!videoRef.current) {
      return
    }

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight

    const context = canvas.getContext('2d')
    context.drawImage(videoRef.current, 0, 0)
    onImageChange(canvas.toDataURL('image/jpeg', 0.92))
    handleStopCamera()
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const dataUrl = await readFile(file)
    onImageChange(dataUrl)
    setError('')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={handleStartCamera} className="button-primary">
          <Camera className="h-4 w-4" />
          Kamerani yoqish
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="button-ghost"
        >
          <ImageUp className="h-4 w-4" />
          Fayl yuklash
        </button>
        {imageSrc ? (
          <button type="button" onClick={() => onImageChange('')} className="button-ghost">
            <RefreshCcw className="h-4 w-4" />
            Qayta tanlash
          </button>
        ) : null}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {error ? (
        <div className="rounded-3xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {cameraOpen ? (
        <div className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/80 p-4">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900">
            <video ref={videoRef} autoPlay playsInline muted className="aspect-video w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-slate-950/90 to-transparent px-4 pb-4 pt-12">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs text-white">
                <Smartphone className="h-4 w-4 text-emerald-300" />
                Kamera jonli rejim
              </span>
              <div className="flex gap-2">
                <button type="button" onClick={handleStopCamera} className="button-ghost">
                  <XCircle className="h-4 w-4" />
                  Bekor qilish
                </button>
                <button type="button" onClick={handleCapture} className="button-primary">
                  <ScanSearch className="h-4 w-4" />
                  Rasm olish
                </button>
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-400">
            Kamera ochilgach bargni markazga olib kelib, yetarli yorug‘likda suratga oling.
          </p>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="Tanlangan barg rasmi"
            className="aspect-[4/3] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[4/3] flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.18),_transparent_40%),linear-gradient(135deg,_rgba(15,23,42,0.95),_rgba(30,41,59,0.82))] p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-300/15 ring-1 ring-emerald-300/30">
              <ScanSearch className="h-7 w-7 text-emerald-200" />
            </div>
            <div className="space-y-2">
              <p className="font-display text-2xl text-white">
                Kamera yoki surat yuklash orqali tahlil boshlang
              </p>
              <p className="mx-auto max-w-md text-sm text-slate-300">
                Lokal AI bargdagi rang va tekstura ko‘rsatkichlarini tahlil qilib, ehtimoliy kasallikni aniqlaydi.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
