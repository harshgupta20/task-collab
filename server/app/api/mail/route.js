// app/api/send-mail/route.js
import nodemailer from 'nodemailer';
import { TASK_EMAIL_TEMPLATE } from './templates';
// import { TASK_EMAIL_TEMPLATE } from './mail/templates';

export async function OPTIONS() {
  // Handle preflight request
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // Allow all origins
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request) {
  try {
    // Parse request body
    const res = await request.json();
    const { to, subject, innerSubject, update_type, updated_by, task_status, task_priority, optional_message, task_link  } = res;

    if (!to || !subject) {
      return new Response(JSON.stringify({ message: 'Missing required fields' }), {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_PROVIDER,
      auth: {
        user: process.env.EMAIL,     
        pass: process.env.CODE,       
      },
    });

    // Mail options
    const mailOptions = {
      from: process.env.EMAIL,
      to,
      subject: subject,
      html: TASK_EMAIL_TEMPLATE({
        subject: innerSubject,
        update_type: update_type,
        updated_by: updated_by,
        task_status: task_status,
        task_priority: task_priority,
        optional_message: optional_message,
        task_link: task_link,
      }),
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ message: 'Email sent', info }), {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Error sending email', error: error.message }), {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }
}
