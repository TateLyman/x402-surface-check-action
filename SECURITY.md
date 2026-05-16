# Security Policy

## Reporting

Report security issues privately by email:

hello@tateprograms.com

Do not open a public issue with private keys, payment payloads, API keys, customer data, logs containing secrets, or exploit details for third-party systems.

## Scope

This repository is a GitHub Action wrapper around `x402-surface-check`. The action is intended for no-payment review of public payment-agent launch surfaces owned or authorized by the workflow operator.

The action should not send payment headers, wallet signatures, private keys, API keys, or paid retries.
