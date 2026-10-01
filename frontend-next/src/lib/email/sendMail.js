import nodemailer from "nodemailer";

export default async function sendMail(options) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    service: process.env.SMPT_SERVICE,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: process.env.SMPT_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
    ...(options.html ? { html: options.html } : {}),
    ...(options.replyTo ? { replyTo: options.replyTo } : {}),
  };

  await transporter.sendMail(mailOptions);
}
