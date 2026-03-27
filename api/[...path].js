import app, { appReady } from '../server/index.js'

export default async function handler(request, response) {
  await appReady
  return app(request, response)
}
