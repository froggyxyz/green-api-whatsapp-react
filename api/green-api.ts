declare const process: { env: Record<string, string | undefined> }

const GREEN_API_HOST =
  process.env.GREEN_API_HOST || 'https://api.green-api.com'

const UPSTREAM_TIMEOUT_MS = 8000

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

interface VercelRequest {
  method?: string
  url?: string
  headers: Record<string, string | string[] | undefined>
  body?: unknown
}

interface VercelResponse {
  status(code: number): VercelResponse
  setHeader(name: string, value: string): void
  json(body: unknown): void
  send(body: string): void
  end(): void
}

function applyCors(res: VercelResponse) {
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    res.setHeader(key, value)
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    applyCors(res)
    res.status(204).end()
    return
  }

  const host = String(req.headers.host || 'localhost')
  const url = new URL(req.url || '/', `https://${host}`)
  const pathFromQuery = url.searchParams.get('path')

  let targetPath: string
  if (pathFromQuery) {
    targetPath = pathFromQuery.startsWith('/')
      ? pathFromQuery
      : `/${pathFromQuery}`
  } else {
    targetPath = url.pathname
      .replace(/^\/api\/green-api/, '')
      .replace(/^\/green-api/, '')
  }

  if (!targetPath || targetPath === '/') {
    applyCors(res)
    res.status(400).json({ error: 'Empty target path' })
    return
  }

  const searchParams = new URLSearchParams(url.search)
  searchParams.delete('path')
  const search = searchParams.toString()
    ? `?${searchParams.toString()}`
    : ''

  const targetUrl = `${GREEN_API_HOST}${targetPath}${search}`

  try {
    const body =
      req.method && req.method !== 'GET' && req.method !== 'HEAD'
        ? typeof req.body === 'string'
          ? req.body
          : JSON.stringify(req.body)
        : undefined

    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    })

    const text = await upstream.text()

    applyCors(res)
    const upstreamType = upstream.headers.get('content-type') || 'application/json'
    res.setHeader('Content-Type', upstreamType)
    res.status(upstream.status).send(text)
  } catch (error) {
    const isTimeout =
      error instanceof DOMException && error.name === 'TimeoutError'

    applyCors(res)
    if (isTimeout) {
      res.status(504).json({
        error: 'upstream_timeout',
        message: `Green API не ответил за ${UPSTREAM_TIMEOUT_MS} мс`,
        targetUrl,
      })
      return
    }

    res.status(502).json({
      error: 'upstream_unreachable',
      message: `Не удалось подключиться к ${GREEN_API_HOST}`,
      targetUrl,
    })
  }
}