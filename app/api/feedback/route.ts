import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { name, email, feedback } = await request.json()

    // Validate required field
    if (!feedback || feedback.trim().length === 0) {
      return NextResponse.json(
        { error: 'Feedback message is required' },
        { status: 400 }
      )
    }

    const recipientEmail = 'feedback@midssat.com'

    // Check if SMTP is configured
    const smtpConfigured = process.env.SMTP_HOST &&
                          process.env.SMTP_USER &&
                          process.env.SMTP_PASS

    if (!smtpConfigured) {
      console.log('SMTP not configured. Feedback would be sent to:', recipientEmail)
      console.log('Feedback data:', { name, email, feedback })
      return NextResponse.json({
        success: true,
        message: 'Feedback logged (SMTP not configured)'
      })
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Prepare email content
    const displayName = name && name.trim() ? name : 'Anonymous'
    const replyToEmail = email && email.trim() ? email : undefined

    // Send email
    const info = await transporter.sendMail({
      from: `"SSAT Prep Feedback" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: recipientEmail,
      ...(replyToEmail && { replyTo: replyToEmail }),
      subject: `Feedback from ${displayName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .field { margin-bottom: 20px; }
              .label { font-weight: bold; color: #667eea; margin-bottom: 5px; }
              .value { background: white; padding: 12px; border-radius: 4px; border-left: 3px solid #667eea; }
              .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin: 0;">📝 New Feedback Received</h2>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">From:</div>
                  <div class="value">${displayName}</div>
                </div>
                ${email ? `
                <div class="field">
                  <div class="label">Email:</div>
                  <div class="value"><a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a></div>
                </div>
                ` : ''}
                <div class="field">
                  <div class="label">Feedback:</div>
                  <div class="value" style="white-space: pre-wrap;">${feedback}</div>
                </div>
                <div class="footer">
                  Sent from SSAT Prep Website Feedback Form<br>
                  <a href="https://www.midssat.com" style="color: #667eea; text-decoration: none;">www.midssat.com</a>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
New Feedback Received

From: ${displayName}
${email ? `Email: ${email}` : ''}

Feedback:
${feedback}

---
Sent from SSAT Prep Website Feedback Form
www.midssat.com
      `,
    })

    console.log('Feedback email sent:', info.messageId)

    return NextResponse.json({
      success: true,
      message: 'Feedback sent successfully'
    })
  } catch (error) {
    console.error('Error sending feedback:', error)
    return NextResponse.json(
      { error: 'Failed to send feedback' },
      { status: 500 }
    )
  }
}
