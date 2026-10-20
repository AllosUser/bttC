const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'
const SUBJECT = 'New message from BuildTomorrow website'
const FROM_NAME = 'BuildTomorrow Website'

// Web3Forms expects extra CC recipients as one semicolon-separated string.
export function formatCcEmails(ccEmails = '') {
  const list = Array.isArray(ccEmails) ? ccEmails : String(ccEmails).split(/[;,]/)
  return list.map((address) => address.trim()).filter(Boolean).join(';')
}

export function createContactPayload({ accessKey, name, email, message, botcheck = '', ccEmails = '' }) {
  const payload = {
    access_key: accessKey,
    name,
    email,
    message,
    subject: SUBJECT,
    from_name: FROM_NAME,
    botcheck,
  }

  const ccemail = formatCcEmails(ccEmails)
  if (ccemail) payload.ccemail = ccemail

  return payload
}

export async function submitContactForm({
  accessKey,
  name,
  email,
  message,
  botcheck = '',
  ccEmails = '',
  fetchImpl = fetch,
}) {
  if (botcheck) {
    return { success: false, skipped: true }
  }

  if (!accessKey) {
    throw new Error('Contact form is missing its Web3Forms access key.')
  }

  const response = await fetchImpl(WEB3FORMS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(createContactPayload({ accessKey, name, email, message, botcheck, ccEmails })),
  })

  const result = await response.json().catch(() => ({}))

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Message could not be sent. Please try again.')
  }

  return result
}
