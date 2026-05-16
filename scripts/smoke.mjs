import { execFileSync, spawn } from 'node:child_process'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import http from 'node:http'
import { setTimeout as delay } from 'node:timers/promises'

const port = 4186
const baseUrl = `http://127.0.0.1:${port}`
const reportPath = 'x402-surface-report.md'

function waitForServer() {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + 5000

    function attempt() {
      const req = http.get(`${baseUrl}/.well-known/x402`, res => {
        res.resume()
        if (res.statusCode === 200) {
          resolve()
          return
        }
        retry()
      })
      req.on('error', retry)
    }

    function retry() {
      if (Date.now() > deadline) {
        reject(new Error('fixture server did not become ready'))
        return
      }
      setTimeout(attempt, 100)
    }

    attempt()
  })
}

if (existsSync(reportPath)) {
  rmSync(reportPath)
}

const server = spawn(process.execPath, ['test-fixtures/x402-server.mjs'], {
  stdio: ['ignore', 'pipe', 'inherit'],
  env: {
    ...process.env,
    PORT: String(port),
  },
})

try {
  await waitForServer()

  execFileSync('npx', [
    '--yes',
    'x402-surface-check@0.2.22',
    '--strict-cache',
    '--origin',
    baseUrl,
    '--limit',
    '3',
    `${baseUrl}/.well-known/x402`,
    reportPath,
  ], { stdio: 'inherit' })

  const report = readFileSync(reportPath, 'utf8')
  const required = [
    'No-Payment Challenge Map',
    'invoice',
    'settle',
    '$0.01',
    '$0.005',
    'Cache Policy Map',
    'challenge uses a non-HTTPS resource URL',
  ]

  for (const text of required) {
    if (!report.includes(text)) {
      throw new Error(`Expected report to include ${text}`)
    }
  }
}
finally {
  server.kill('SIGTERM')
  await delay(100)
}
