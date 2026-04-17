import nodemailer from 'nodemailer'

type ContactPayload = {
  name?: string
  email?: string
  subject?: string
  message?: string
}

type SmtpError = Error & {
  code?: string
  response?: string
}

function getBooleanEnv(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback
  return value.toLowerCase() === 'true'
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function sanitizeEnv(value: string | undefined): string {
  return (value || '').trim()
}

function sanitizeAppPassword(value: string | undefined): string {
  // Gmail displays app passwords in groups of 4 chars separated by spaces.
  return sanitizeEnv(value).replace(/\s+/g, '')
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  let body: ContactPayload
  try {
    body = (typeof req.body === 'string'
      ? JSON.parse(req.body)
      : req.body) as ContactPayload
  } catch {
    res.status(400).json({ error: 'Invalid JSON payload.' })
    return
  }

  const name = asText(body?.name)
  const email = asText(body?.email)
  const subject = asText(body?.subject)
  const message = asText(body?.message)

  if (!name || !email || !message) {
    res.status(400).json({ error: 'Name, email, and message are required.' })
    return
  }

  const host = sanitizeEnv(process.env.SMTP_HOST)
  const port = Number(sanitizeEnv(process.env.SMTP_PORT) || '587')
  const user = sanitizeEnv(process.env.SMTP_USER)
  const pass = sanitizeAppPassword(process.env.SMTP_PASS)
  const secure = getBooleanEnv(process.env.SMTP_SECURE, port === 465)
  const fromEmail = sanitizeEnv(process.env.SMTP_FROM_EMAIL) || user
  const toEmail = sanitizeEnv(process.env.CONTACT_TO_EMAIL) || 'meetparsana211@gmail.com'

  if (!host || !user || !pass || !fromEmail) {
    res.status(500).json({ error: 'SMTP environment variables are not configured.' })
    return
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    })

    const finalSubject = subject || `Portfolio inquiry from ${name}`

    await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject: finalSubject,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        '',
        message,
      ].join('\n'),
      html: `
        <h3>New Portfolio Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${finalSubject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `,
    })

    res.status(200).json({ ok: true })
  } catch (error) {
    const smtpError = error as SmtpError

    if (smtpError.code === 'EAUTH') {
      res.status(500).json({
        error: 'SMTP authentication failed. Check SMTP_USER and SMTP_PASS (for Gmail app password, spaces are removed automatically).',
      })
      return
    }

    if (smtpError.code === 'ESOCKET' || smtpError.code === 'ETIMEDOUT') {
      res.status(500).json({
        error: 'SMTP connection failed. Check SMTP_HOST, SMTP_PORT, and SMTP_SECURE.',
      })
      return
    }

    res.status(500).json({ error: 'Failed to send message.' })
  }
}