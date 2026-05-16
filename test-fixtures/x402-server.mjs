import http from 'node:http'

const port = Number.parseInt(process.env.PORT || '4186', 10)
const host = process.env.HOST || '127.0.0.1'
const baseUrl = `http://${host}:${port}`

const routes = {
  '/api/x402/invoice': {
    name: 'invoice',
    price: '$0.01',
    method: 'POST',
  },
  '/api/x402/settle': {
    name: 'settle',
    price: '$0.005',
    method: 'POST',
  },
}

function sendJson(res, status, body, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'http://127.0.0.1:4186',
    ...headers,
  })
  res.end(`${JSON.stringify(body)}\n`)
}

function challengeFor(pathname) {
  const route = routes[pathname]
  return {
    x402Version: 2,
    accepts: [
      {
        scheme: 'exact',
        network: 'solana-mainnet',
        asset: 'USDC',
        amount: route.price,
        payTo: 'G21o7DdeBzqMDYswJzbsp2BZ6jGLxbvxDVvtmLvo4N8k',
        resource: `${baseUrl}${pathname}`,
        description: `${route.name} test fixture`,
        extra: {
          resource: `${baseUrl}${pathname}`,
        },
      },
    ],
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, baseUrl)
  const route = routes[url.pathname]

  if (req.method === 'GET' && url.pathname === '/.well-known/x402') {
    sendJson(res, 200, {
      name: 'fixture x402 provider',
      x402Endpoints: Object.fromEntries(
        Object.entries(routes).map(([path, item]) => [item.name, `${baseUrl}${path}`]),
      ),
    })
    return
  }

  if (req.method === 'OPTIONS' && route) {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': 'http://127.0.0.1:4186',
      'Access-Control-Allow-Headers': 'Content-Type,X-PAYMENT',
      'Access-Control-Allow-Methods': route.method,
    })
    res.end()
    return
  }

  if (req.method === route?.method) {
    sendJson(res, 402, challengeFor(url.pathname), {
      'Cache-Control': 'no-store, private',
      Vary: 'Origin, X-PAYMENT',
    })
    return
  }

  sendJson(res, 404, { error: 'not found' })
})

server.listen(port, host, () => {
  console.log(`fixture x402 server listening on ${baseUrl}`)
})

process.on('SIGTERM', () => {
  server.close(() => process.exit(0))
})
