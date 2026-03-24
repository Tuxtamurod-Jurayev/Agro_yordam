export const DISEASES = [
  {
    key: 'healthy',
    name: "Sog'lom barg",
    description:
      "Barg yuzasida jiddiy kasallik belgisi topilmadi. O'simlik umumiy holati me'yoriy.",
    causes:
      "Yorug'lik, oziqlanish va namlik muvozanati yaxshi bo'lganda barglar sog'lom ko'rinadi.",
    treatment:
      "Shoshilinch davolash kerak emas. Profilaktik kuzatuv va muntazam inspeksiya yetarli.",
    prevention:
      "Tomchilatib sug'orish, shamollatish va barglarni ortiqcha namlamaslik sog'lom holatni ushlab turadi.",
    fertilizer: 'Muvozanatli NPK, mikroelementlar va organik kompost.',
    pesticide: 'Profilaktika uchun biofungitsid yoki neem asosidagi yengil vosita.',
    irrigation: "Tuproq namligini 65-75% oralig'ida ushlang, ortiqcha sug'orishdan saqlaning.",
    severity: 'Past',
    palette: ['#4ade80', '#15803d'],
  },
  {
    key: 'early_blight',
    name: 'Erta kuyish',
    description:
      "Barglarda qoramtir-jigarrang doiraviy dog'lar va chekkalarda qurish kuzatiladi.",
    causes:
      "Nam muhit, bargda uzoq qoladigan suv tomchilari va ozuqa tanqisligi kasallikni kuchaytiradi.",
    treatment:
      "Zararlangan barglarni ajrating, mis tarkibli fungitsid yoki tavsiya etilgan kontakt preparatlarni qo'llang.",
    prevention:
      "Ekin almashinuvi, toza inventar va ertalabki sug'orish kasallik tarqalishini kamaytiradi.",
    fertilizer: 'Kaliy va kaltsiyga boy oziqlantirish, barg mustahkamligini oshiradi.',
    pesticide: 'Mis oksixlorid yoki mankozeb asosidagi vositalar tavsiya qilinadi.',
    irrigation: "Bargga emas, ildiz zonasiga sug'orish. Haftasiga 2-3 marta chuqur sug'orish.",
    severity: "O'rta",
    palette: ['#f97316', '#7c2d12'],
  },
  {
    key: 'leaf_spot',
    name: "Barg dog'i",
    description:
      "Barg yuzasida mayda qora-qo'ng'ir yoki qizg'ish dog'lar paydo bo'lib, asta-sekin kattalashadi.",
    causes:
      "Zamburug' yoki bakterial infeksiya, zich ekish va namlikning uzoq saqlanishi asosiy omillar.",
    treatment:
      "Kasallangan barglarni olib tashlang, misli fungitsid yoki biologik himoya vositalaridan foydalaning.",
    prevention:
      "Qator oralig'ini ochiq tuting, shamollatishni yaxshilang va begona o'tlarni kamaytiring.",
    fertilizer: 'Fosfor va mikroelementlar bilan bargni tiklashga yordam bering.',
    pesticide: 'Bacillus subtilis yoki misli preparatlar.',
    irrigation: "Qisqa, lekin nazoratli sug'orish. Barg namligini minimal darajada saqlang.",
    severity: "O'rta",
    palette: ['#fb7185', '#881337'],
  },
  {
    key: 'rust',
    name: 'Zang kasalligi',
    description:
      "Bargning pastki yoki yuqori qismida zang rangli kukunsimon nuqtalar paydo bo'ladi.",
    causes:
      "Iliq va nam ob-havo, havo aylanishining pastligi va dalada qoldiq infeksiya manbalari.",
    treatment:
      "Zararlangan barglarni yoping yoki olib tashlang, sistemali fungitsid bilan ishlov bering.",
    prevention:
      "Hosil qoldiqlarini tozalang, chidamli navlardan foydalaning va dala aylanishini saqlang.",
    fertilizer: "Kaliy va magniy barg to'qimasini mustahkamlaydi.",
    pesticide: 'Triazol yoki strobilurin guruhi preparatlari tavsiya etiladi.',
    irrigation: "Tungi sug'orishdan qoching, ertalab erta soatlarda sug'orish afzal.",
    severity: 'Yuqori',
    palette: ['#f59e0b', '#92400e'],
  },
  {
    key: 'powdery_mildew',
    name: 'Un shudringi',
    description:
      "Barg yuzasida oqsimon kukun qatlamlari paydo bo'lib, fotosintez jarayoni pasayadi.",
    causes:
      "Harorat o'zgarishi, yopiq muhit, kuchsiz shamollatish va bargning zich joylashuvi.",
    treatment:
      "Zararlangan qismlarni qisqartiring, oltingugurtli yoki biologik fungitsid bilan ishlov bering.",
    prevention:
      "Shamollatish tizimini kuchaytiring, ekinlar orasidagi masofani saqlang va bargni quruq tuting.",
    fertilizer: "Azotni me'yorida bering, ortiqcha yashil massa chiqishiga yo'l qo'ymang.",
    pesticide: 'Oltingugurt kukuni, kaliy bikarbonat yoki biofungitsid.',
    irrigation: "Tuproq namligini barqaror saqlang, yuqoridan purkashni kamaytiring.",
    severity: "O'rta",
    palette: ['#e2e8f0', '#475569'],
  },
  {
    key: 'bacterial_blight',
    name: 'Bakterial kuyish',
    description:
      "Suvga o'xshash qora dog'lar tez kengayib, barg to'qimasini kuygan ko'rinishga olib keladi.",
    causes:
      "Bakterial infeksiya ko'pincha yomg'ir, jarohatlar va iflos asboblar orqali tarqaladi.",
    treatment:
      "Zararlangan o'simlik qismlarini ajrating, misli preparat va sanitariya choralarini qo'llang.",
    prevention:
      "Asboblarni dezinfeksiya qiling, ortiqcha namlikni kamaytiring va dala gigiyenasiga rioya qiling.",
    fertilizer: "Kaltsiy va kremniy qo'shimchalari barg to'qimasini mustahkamlaydi.",
    pesticide: "Mis gidroksid va bakteritsid ta'sirli vositalar.",
    irrigation: "Yomg'irlatib sug'orishni cheklang, tomchilatib sug'orish afzal.",
    severity: 'Yuqori',
    palette: ['#38bdf8', '#0f172a'],
  },
]

export const DISEASE_MAP = Object.fromEntries(
  DISEASES.map((disease) => [disease.key, disease]),
)

export function getDiseaseByKey(key) {
  return DISEASE_MAP[key] ?? DISEASE_MAP.healthy
}
