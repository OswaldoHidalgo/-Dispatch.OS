import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

interface SendEmailParams {
  to: string;
  subject: string;
  bodyText: string;
  attachmentBuffer?: Buffer;
  attachmentFilename?: string;
}

export async function sendApplicationEmail({
  to,
  subject,
  bodyText,
  attachmentBuffer,
  attachmentFilename,
}: SendEmailParams) {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const boundary = 'foo_bar_baz';
  let rawMessage = '';

  if (attachmentBuffer && attachmentFilename) {
    const base64Attachment = attachmentBuffer.toString('base64');
    rawMessage = [
      `To: ${to}`,
      `Subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=utf-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      bodyText,
      '',
      `--${boundary}`,
      `Content-Type: application/pdf; name="${attachmentFilename}"`,
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${attachmentFilename}"`,
      '',
      base64Attachment,
      '',
      `--${boundary}--`,
    ].join('\r\n');
  } else {
    rawMessage = [
      `To: ${to}`,
      `Subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=utf-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      bodyText,
    ].join('\r\n');
  }

  const encodedMessage = Buffer.from(rawMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  });

  return { success: true, messageId: res.data.id };
}