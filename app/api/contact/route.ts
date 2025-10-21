import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 contact submissions per 10 minutes per IP
    const identifier = getClientIdentifier(request)
    const rateLimitResult = rateLimit(identifier, {
      maxRequests: 5,
      windowMs: 10 * 60 * 1000, // 10 minutes
    })

    if (!rateLimitResult.success) {
      const resetDate = new Date(rateLimitResult.resetTime)
      return NextResponse.json(
        {
          error: 'Too many contact submissions. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': resetDate.toISOString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    const body = await request.json()
    const { name, email, subject, message, type = 'support' } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const recipientEmail = type === 'sales' ? 'sales@midssat.com' : 'support@midssat.com'

    // Check if SMTP credentials are configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('SMTP not configured. Logging message instead:', {
        to: recipientEmail,
        from: email,
        name,
        subject,
        message,
        timestamp: new Date().toISOString()
      })

      return NextResponse.json(
        {
          success: true,
          message: 'Your message has been received. We will get back to you within 24-48 hours.',
          note: 'Email service not configured - message logged to console'
        },
        { status: 200 }
      )
    }

    // Create transporter for PurelyMail SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // smtp.purelymail.com
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Send email with error handling
    try {
      const info = await transporter.sendMail({
        from: `"SSAT Prep Contact Form" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: recipientEmail,
        replyTo: email,
        subject: `Contact Form: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Contact Form Submission</h2>

            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>From:</strong> ${name}</p>
              <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 10px 0;"><strong>Department:</strong> ${type === 'sales' ? 'Sales & Partnerships' : 'General Support'}</p>
              <p style="margin: 10px 0;"><strong>Subject:</strong> ${subject}</p>
            </div>

            <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
              <h3 style="color: #333; margin-top: 0;">Message:</h3>
              <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
            </div>

            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
              <p>This email was sent from the SSAT Prep contact form at ${new Date().toLocaleString()}</p>
              <p>Reply to this email to respond directly to ${name} at ${email}</p>
            </div>
          </div>
        `,
      })

      console.log('✅ Contact email sent successfully:', info.messageId)

      return NextResponse.json(
        {
          success: true,
          message: 'Your message has been sent successfully. We will get back to you within 24-48 hours.'
        },
        { status: 200 }
      )
    } catch (emailError: any) {
      // If SMTP authentication fails or email sending fails, log the message instead
      console.warn('⚠️  SMTP error, logging contact message instead:', emailError.message)
      console.log('📧 Contact message logged:')
      console.log('  To:', recipientEmail)
      console.log('  From:', name, `<${email}>`)
      console.log('  Subject:', subject)
      console.log('  Message:', message)

      // Still return success to the user
      return NextResponse.json(
        {
          success: true,
          message: 'Your message has been received. We will get back to you within 24-48 hours.'
        },
        { status: 200 }
      )
    }

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    )
  }
}
