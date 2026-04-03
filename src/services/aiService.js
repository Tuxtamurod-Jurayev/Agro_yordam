import axios from 'axios'
import { getDiseaseByKey } from '../data/diseases'
import { toApiUrl } from './runtime'

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

export async function analyzePlantImage(imageSrc) {
  try {
    const { data } = await axios.post(
      toApiUrl('/api/analyze-plant'),
      { imageSrc },
      {
        timeout: 60000,
      },
    )

    const disease = getDiseaseByKey(data.diseaseKey ?? 'healthy')

    return {
      diseaseKey: disease.key,
      diseaseName: disease.name,
      confidence: clamp(Number(data.confidence ?? 80), 1, 99),
      summary: data.summary ?? `${disease.name} bo'yicha AI natijasi qaytdi.`,
      indicators: data.indicators ?? ['Online AI orqali tahlil qilindi'],
      disease,
      source: data.source ?? 'plantnet',
      model: data.model ?? 'online-ai',
      cacheHit: Boolean(data.cacheHit),
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || error.message || "AI serveriga ulanib bo'lmadi.")
    }

    throw new Error(error instanceof Error ? error.message : "AI serveriga ulanib bo'lmadi.")
  }
}
