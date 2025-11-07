import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Contact form validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validationResult = contactSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          errors: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = validationResult.data;

    // TODO: In production, integrate with an email service like Resend, SendGrid, etc.
    // For now, we'll log the message and return success
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'contact@openrevenue.org',
    //   to: 'hello@openrevenue.org',
    //   subject: `Contact Form: ${subject}`,
    //   html: `
    //     <h2>New Contact Form Submission</h2>
    //     <p><strong>From:</strong> ${name} (${email})</p>
    //     <p><strong>Subject:</strong> ${subject}</p>
    //     <p><strong>Message:</strong></p>
    //     <p>${message.replace(/\n/g, '<br>')}</p>
    //   `,
    // });

    // Log the contact form submission (in production, you might want to save to database)
    console.log('Contact form submission:', {
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString(),
    });

    // In production, you might also want to:
    // 1. Save to database for record keeping
    // 2. Send notification to Slack/Discord
    // 3. Add rate limiting per IP/email
    // 4. Implement CAPTCHA verification

    return NextResponse.json(
      {
        message: 'Message sent successfully!',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);

    // Don't expose internal error details to the client
    return NextResponse.json(
      {
        message: 'An error occurred while sending your message. Please try again later.',
      },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}
