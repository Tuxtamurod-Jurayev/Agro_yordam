import { Camera, ImageUp, RefreshCcw, ScanSearch, Smartphone, Trash2, XCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const MAX_DIMENSION = 1600
const JPEG_QUALITY = 0.86

function stopStream(stream) {
  stream?.getTracks().forEach((track) => track.stop())
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Rasmni o'qib bo'lmadi."))
    image.src = dataUrl
  })
}

async function compressImage(dataUrl) {
  const image = await loadImage(dataUrl)
  const canvas = document.createElement('canvas')
  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height))

  canvas.width = Math.max(1, Math.round(image.width * scale))
  canvas.height = Math.max(1, Math.round(image.height * scale))

  const context = canvas.getContext('2d')
  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error("Faylni o'qib bo'lmadi."))
    reader.readAsDataURL(file)
  })
}

export function CameraCapture({ images, onImagesChange, maxImages = 5 }) {
  const videoRef = useRef(null)
  const fileInputRef = useRef(null)
  const streamRef = useRef(null)

  const [cameraOpen, setCameraOpen] = useState(false)
  const [error, setError] = useState('')

  const imageCount = images.length
  const hasReachedLimit = imageCount >= maxImages
  const primaryImage = images[0] ?? ''

  useEffect(() => {
    return () => {
      stopStream(streamRef.current)
    }
  }, [])

  function applyImages(nextImages) {
    onImagesChange(nextImages.slice(0, maxImages))
  }

  async function handleStartCamera() {
    if (hasReachedLimit) {
      setError(`Bir martada ${maxImages} tagacha rasm yuklash mumkin.`)
      return
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Brauzer kamerani qo'llab-quvvatlamaydi. Fayl yuklashdan foydalaning.")
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

  async function handleCapture() {
    if (!videoRef.current) {
      return
    }

    if (hasReachedLimit) {
      setError(`Bir martada ${maxImages} tagacha rasm yuklash mumkin.`)
      return
    }

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight

    const context = canvas.getContext('2d')
    context.drawImage(videoRef.current, 0, 0)

    const compressed = await compressImage(canvas.toDataURL('image/jpeg', 0.92))
    applyImages([...images, compressed])
    setError('')
    handleStopCamera()
  }

  async function handleFileChange(event) {
    const fileList = Array.from(event.target.files || [])
    const remainingSlots = maxImages - images.length

    if (!fileList.length) {
      event.target.value = ''
      return
    }

    if (remainingSlots <= 0) {
      setError(`Bir martada ${maxImages} tagacha rasm yuklash mumkin.`)
      event.target.value = ''
      return
    }

    try {
      const acceptedFiles = fileList.slice(0, remainingSlots)
      const nextImages = await Promise.all(
        acceptedFiles.map(async (file) => compressImage(await readFile(file))),
      )

      applyImages([...images, ...nextImages])

      if (fileList.length > remainingSlots) {
        setError(`Faqat ${maxImages} ta rasm saqlandi. Qolganlari o'tkazib yuborildi.`)
      } else {
        setError('')
      }
    } catch (fileError) {
      setError(fileError.message)
    } finally {
      // Bir xil fayl qayta tanlanganda ham `change` hodisasi ishlashi uchun reset qilamiz.
      event.target.value = ''
    }
  }

  function handleRemoveImage(index) {
    applyImages(images.filter((_item, itemIndex) => itemIndex !== index))
    setError('')
  }

  function handleReset() {
    applyImages([])
    setError('')
    handleStopCamera()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid w-full gap-3 sm:flex sm:w-auto sm:flex-wrap">
          <button
            type="button"
            onClick={handleStartCamera}
            className="button-primary w-full justify-center sm:w-auto"
          >
            <Camera className="h-4 w-4" />
            Kamerani yoqish
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="button-ghost w-full justify-center sm:w-auto"
          >
            <ImageUp className="h-4 w-4" />
            Rasmlarni yuklash
          </button>
          {imageCount ? (
            <button
              type="button"
              onClick={handleReset}
              className="button-ghost w-full justify-center sm:w-auto"
            >
              <RefreshCcw className="h-4 w-4" />
              Tozalash
            </button>
          ) : null}
        </div>

        <div className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center text-sm text-slate-300 sm:w-auto">
          {imageCount}/{maxImages} rasm tanlandi
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
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
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 bg-gradient-to-t from-slate-950/90 to-transparent px-4 pb-4 pt-12 sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs text-white">
                <Smartphone className="h-4 w-4 text-emerald-300" />
                Kamera jonli rejim
              </span>
              <div className="grid gap-2 sm:flex">
                <button
                  type="button"
                  onClick={handleStopCamera}
                  className="button-ghost w-full justify-center sm:w-auto"
                >
                  <XCircle className="h-4 w-4" />
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={handleCapture}
                  className="button-primary w-full justify-center sm:w-auto"
                >
                  <ScanSearch className="h-4 w-4" />
                  Rasm olish
                </button>
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-400">
            Kamera ochilgach bargni markazga olib kelib, yetarli yorug'likda suratga oling.
          </p>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
        {primaryImage ? (
          <img src={primaryImage} alt="Tanlangan barg rasmi" className="aspect-[4/3] w-full object-cover" />
        ) : (
          <div className="flex aspect-[4/3] flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.18),_transparent_40%),linear-gradient(135deg,_rgba(15,23,42,0.95),_rgba(30,41,59,0.82))] p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-300/15 ring-1 ring-emerald-300/30">
              <ScanSearch className="h-7 w-7 text-emerald-200" />
            </div>
            <div className="space-y-2">
              <p className="font-display text-2xl text-white">
                5 tagacha barg rasmini yuklab tahlilni boshlang
              </p>
              <p className="mx-auto max-w-md text-sm text-slate-300">
                Har bir rasm avtomatik siqiladi va ketma-ket AI tahlilidan o'tadi. Bu yuklashni
                barqaror qiladi va bir xil faylni qayta tanlash muammosini ham hal qiladi.
              </p>
            </div>
          </div>
        )}
      </div>

      {images.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={`${image.slice(0, 48)}-${index}`}
              className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5"
            >
              <img src={image} alt={`Tanlangan rasm ${index + 1}`} className="aspect-[4/3] w-full object-cover" />
              <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-slate-300">Rasm {index + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-100 transition hover:bg-rose-400/15 sm:w-auto"
                >
                  <Trash2 className="h-4 w-4" />
                  Olib tashlash
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
