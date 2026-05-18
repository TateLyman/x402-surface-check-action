# x402 Surface Check Action

GitHub Action wrapper for [`x402-surface-check`](https://www.npmjs.com/package/x402-surface-check), a no-payment checker for public x402, MPP, Pay.sh, Cloudflare Worker, AgentCore-style payment, and HTTP `402 Payment Required` launch surfaces.

The action probes manifests, OpenAPI specs, resource catalogs, or direct paid endpoints without sending payment headers, wallet signatures, API keys, or paid calls. It is meant for projects you own or are authorized to review before an agent or wallet can spend real value.

## Usage

```yaml
name: x402 surface

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  x402-surface:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: TateLyman/x402-surface-check-action@v1
        with:
          target: https://api.example.com/.well-known/x402
          origin: https://app.example.com
          strict-cache: true
          output: x402-surface-report.md
```

For one direct paid endpoint:

```yaml
- uses: TateLyman/x402-surface-check-action@v1
  with:
    endpoint: true
    method: POST
    target: https://api.example.com/api/x402/invoice
    origin: https://app.example.com
    strict-cache: true
```

## Inputs

| Input | Default | Description |
| --- | --- | --- |
| `target` | required | Manifest, OpenAPI spec, resource catalog, or direct paid endpoint URL. |
| `output` | empty | Optional report path. Writes Markdown by default or JSON when `json: true`. |
| `endpoint` | `false` | Set to `true` when `target` is one direct paid endpoint. |
| `method` | `POST` | HTTP method for direct endpoint mode. |
| `body` | empty | Optional JSON request body for direct endpoint mode. Do not put secrets here. |
| `origin` | empty | Browser `Origin` used for CORS preflight checks. |
| `limit` | `6` | Maximum endpoints to probe from a manifest or OpenAPI document. |
| `strict-cache` | `false` | Flags missing `Cache-Control` on no-payment 402 challenge responses. |
| `json` | `false` | Prints JSON instead of Markdown. |
| `version` | `latest` | npm version of `x402-surface-check` to run. |

## What It Checks

- Public manifest, OpenAPI, resource catalog, and direct endpoint shape.
- No-payment 402 challenge readability and price/network/resource fields.
- MPP `WWW-Authenticate: Payment` headers and x402 V2 requirements headers.
- Browser preflight for payment headers such as `X-PAYMENT`.
- HTTPS resource binding.
- Declared-price drift between docs and live challenge responses.
- Placeholder payees, staging rails, and metadata leakage signals.
- Cache policy maps, including optional strict-cache findings.

## Guardrails

Use this action only on systems you own or are authorized to inspect.

The action does not send:

- `X-PAYMENT`
- `Payment-Signature`
- wallet signatures
- private keys
- API keys
- paid retries

## Private Review

For a private payment-agent launch review, use the scope builder:

https://tateprograms.com/agent-payment-launch-review.html

If this action finds a concrete blocker and you want a private re-check or one small authorized fix, use the fixed-scope sprint page:

https://tateprograms.com/x402-fix-sprint.html

Machine-readable service catalog:

https://tateprograms.com/services.json

Related free tools:

- Surface checker: https://tateprograms.com/x402-surface-check.html
- AgentCore payment policy builder: https://tateprograms.com/agentcore-payment-policy.html
- x402 attack map: https://tateprograms.com/x402-attack-map-2026.html
- Cache-safe Worker guide: https://tateprograms.com/cloudflare-x402-worker.html
