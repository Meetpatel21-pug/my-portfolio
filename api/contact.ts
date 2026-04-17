import nodemailer from 'nodemailer'

type ContactPayload = {
  name?: string
  email?: string
  subject?: string
  message?: string
}

function getBooleanEnv(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback
  return value.toLowerCase() === 'true'
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const body = (typeof req.body === 'string'
    ? JSON.parse(req.body)
    : req.body) as ContactPayload

  const name = asText(body?.name)
  const email = asText(body?.email)
  const subject = asText(body?.subject)
  const message = asText(body?.message)

  if (!name || !email || !message) {
    res.status(400).json({ error: 'Name, email, and message are required.' })
    return
  }

  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || '587')
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const secure = getBooleanEnv(process.env.SMTP_SECURE, port === 465)
  const fromEmail = process.env.SMTP_FROM_EMAIL || user
  const toEmail = process.env.CONTACT_TO_EMAIL || 'meetparsana211@gmail.com'

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
    res.status(500).json({ error: 'Failed to send message.' })
  }
}