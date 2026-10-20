import assert from 'node:assert/strict'
import { test } from 'node:test'

import { createContactPayload, formatCcEmails, submitContactForm } from './contactForm.js'

test('createContactPayload includes Web3Forms required fields', () => {
  const payload = createContactPayload({
    accessKey: 'test-key',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    message: 'Can we build something?',
    botcheck: '',
  })

  assert.deepEqual(payload, {
    access_key: 'test-key',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    message: 'Can we build something?',
    subject: 'New message from BuildTomorrow website',
    from_name: 'BuildTomorrow Website',
    botcheck: '',
  })
})

test('submitContactForm posts JSON to Web3Forms', async () => {
  let request
  const fetchImpl = async (url, options) => {
    request = { url, options }
    return {
      ok: true,
      json: async () => ({ success: true }),
    }
  }

  const result = await submitContactForm({
    accessKey: 'test-key',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    message: 'Can we build something?',
    botcheck: '',
    fetchImpl,
  })

  assert.equal(result.success, true)
  assert.equal(request.url, 'https://api.web3forms.com/submit')
  assert.equal(request.options.method, 'POST')
  assert.equal(request.options.headers['Content-Type'], 'application/json')
  assert.equal(JSON.parse(request.options.body).access_key, 'test-key')
})

test('submitContactForm throws when Web3Forms returns an error', async () => {
  const fetchImpl = async () => ({
    ok: true,
    json: async () => ({ success: false, message: 'Invalid access key' }),
  })

  await assert.rejects(
    () => submitContactForm({
      accessKey: 'bad-key',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      message: 'Can we build something?',
      botcheck: '',
      fetchImpl,
    }),
    /Invalid access key/,
  )
})

test('submitContactForm skips the request when honeypot is filled', async () => {
  let called = false
  const fetchImpl = async () => {
    called = true
    return {
      ok: true,
      json: async () => ({ success: true }),
    }
  }

  const result = await submitContactForm({
    accessKey: 'test-key',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    message: 'Can we build something?',
    botcheck: 'spam',
    fetchImpl,
  })

  assert.equal(called, false)
  assert.deepEqual(result, { success: false, skipped: true })
})

test('formatCcEmails joins addresses with semicolons and drops blanks', () => {
  assert.equal(formatCcEmails(' hello@buildtomorrow.today, giorgos@buildtomorrow.today ;'), 'hello@buildtomorrow.today;giorgos@buildtomorrow.today')
  assert.equal(formatCcEmails(['a@example.com', ' ', 'b@example.com']), 'a@example.com;b@example.com')
  assert.equal(formatCcEmails(''), '')
})

test('createContactPayload adds ccemail only when CC recipients are set', () => {
  const base = { accessKey: 'test-key', name: 'Ada', email: 'ada@example.com', message: 'Hi' }

  assert.equal('ccemail' in createContactPayload(base), false)
  assert.equal(
    createContactPayload({ ...base, ccEmails: 'hello@buildtomorrow.today,giorgos@buildtomorrow.today' }).ccemail,
    'hello@buildtomorrow.today;giorgos@buildtomorrow.today',
  )
})
