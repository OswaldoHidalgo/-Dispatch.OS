import nodemailer from 'nodemailer';

export async function sendApplicationEmail({
  to,
  subject,
  bodyText,
  attachmentBuffer,
  attachmentName,
}: {
  to: string;
  subject: string;
  bodyText: string;
  attachmentBuffer?: Buffer;
  attachmentName?: string;
}) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_SENDER_EMAIL,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    },
  });

  const attachments = attachmentBuffer && attachmentName ? [
    {
      filename: attachmentName,
      content: attachmentBuffer,
    }
  ] : [];

  const mailOptions = {
    from: process.env.GMAIL_SENDER_EMAIL,
    to,
    subject,
    text: bodyText,
    attachments,
  };

  const info = await transporter.sendMail(mailOptions);
  return { messageId: info.messageId };
}