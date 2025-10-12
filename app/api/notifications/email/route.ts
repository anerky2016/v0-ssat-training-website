import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import nodemailer from 'nodemailer'

/**
 * API Route for sending email notifications
 *
 * This endpoint sends email reminders for lessons due for review.
 * It uses your existing SMTP configuration (PurelyMail).
 */

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { lessonsDue, upcomingReviews } = body

    if (!lessonsDue || !Array.isArray(lessonsDue)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Skip sending if no lessons due
    if (lessonsDue.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No lessons due, email not sent',
        recipient: session.user.email,
        lessonCount: 0
      })
    }

    // Configure SMTP transporter using existing credentials
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Send email
    const info = await transporter.sendMail({
      from: `"SSAT Prep" <${process.env.SMTP_FROM}>`,
      to: session.user.email,
      subject: `${lessonsDue.length} Lesson${lessonsDue.length === 1 ? '' : 's'} Ready for Review`,
      html: generateEmailHTML(session.user.name, lessonsDue, upcomingReviews),
    })

    console.log('Email sent:', info.messageId)

    return NextResponse.json({
      success: true,
      message: 'Email notification sent',
      recipient: session.user.email,
      lessonCount: lessonsDue.length,
      messageId: info.messageId
    })
  } catch (error) {
    console.error('Email notification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Generate HTML email template for review reminders
 */
function generateEmailHTML(
  userName: string | null | undefined,
  lessonsDue: Array<{ topicTitle: string; nextReviewDate: string; reviewCount: number }>,
  upcomingReviews: Array<{ topicTitle: string; nextReviewDate: string; reviewCount: number }>
): string {
  const name = userName || 'Student'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SSAT Study Reminders</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px 20px; border-radius: 0 0 10px 10px; }
    .lesson-card { background: white; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .lesson-card.upcoming { border-left-color: #3b82f6; }
    .lesson-title { font-weight: bold; font-size: 16px; margin-bottom: 5px; }
    .lesson-meta { color: #6b7280; font-size: 14px; }
    .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📚 Study Reminder</h1>
    <p>Time to review your SSAT prep lessons!</p>
  </div>

  <div class="content">
    <p>Hi ${name},</p>

    ${lessonsDue.length > 0 ? `
      <p><strong>You have ${lessonsDue.length} lesson${lessonsDue.length === 1 ? '' : 's'} ready for review:</strong></p>
      ${lessonsDue.map(lesson => `
        <div class="lesson-card">
          <div class="lesson-title">${lesson.topicTitle}</div>
          <div class="lesson-meta">Review #${lesson.reviewCount + 1} • Due today</div>
        </div>
      `).join('')}

      <p>Spaced repetition works best when you review on time. Take a few minutes today to strengthen your knowledge!</p>

      <center>
        <a href="${process.env.NEXTAUTH_URL}/progress" class="cta-button">Review Now</a>
      </center>
    ` : ''}

    ${upcomingReviews && upcomingReviews.length > 0 ? `
      <p style="margin-top: 30px;"><strong>Coming up in the next 7 days:</strong></p>
      ${upcomingReviews.slice(0, 5).map(lesson => `
        <div class="lesson-card upcoming">
          <div class="lesson-title">${lesson.topicTitle}</div>
          <div class="lesson-meta">Review #${lesson.reviewCount + 1} • ${formatReviewDate(lesson.nextReviewDate)}</div>
        </div>
      `).join('')}
    ` : ''}

    <p style="margin-top: 30px;">Keep up the great work! Consistent review is the key to SSAT success.</p>
  </div>

  <div class="footer">
    <p>SSAT Prep - Smart Study with Spaced Repetition</p>
    <p>You're receiving this because you enabled email notifications in your <a href="${process.env.NEXTAUTH_URL}/progress">progress settings</a>.</p>
  </div>
</body>
</html>
  `
}

function formatReviewDate(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Due today'
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Due tomorrow'
  } else {
    const days = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return `Due in ${days} days`
  }
}
