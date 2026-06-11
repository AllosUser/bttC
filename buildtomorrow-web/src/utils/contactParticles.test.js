import assert from 'node:assert/strict'
import { test } from 'node:test'

import { triggerContactParticles } from './contactParticles.js'

test('triggerContactParticles skips when the form element is missing', () => {
  assert.equal(triggerContactParticles(null), false)
})

test('triggerContactParticles skips when the submit button is missing', () => {
  const formElement = {
    querySelector: () => null,
  }

  assert.equal(triggerContactParticles(formElement), false)
})
