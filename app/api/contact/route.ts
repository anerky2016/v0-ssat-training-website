import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message, type } = body

    // Validate required fields
    if (!name || !email || !subject || !message || !type) {
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

    const emailAddress = type === 'sales' ? 'sales@midssat.com' : 'support@midssat.com'

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.log('RESEND_API_KEY not configured. Logging message instead:', {
        to: emailAddress,
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

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'SSAT Prep Contact Form <onboarding@resend.dev>', // Use your verified domain
      to: [emailAddress],
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

    if (error) {
      console.error('Resend API error:', error)
      return NextResponse.json(
        { error: 'Failed to send message. Please try again later.' },
        { status: 500 }
      )
    }

    console.log('Email sent successfully:', data)

    return NextResponse.json(
      {
        success: true,
        message: 'Your message has been sent successfully. We will get back to you within 24-48 hours.'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    )
  }
}
