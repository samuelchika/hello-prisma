import nodemailer from 'nodemailer';
import  SMTPTransport from 'nodemailer/lib/smtp-transport'
class Email {
  private transporter;
  private smtpConfig: SMTPTransport.Options = {
      host: process.env.SMTP_HOST || '',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    }
  constructor() {
    this.transporter = nodemailer.createTransport(this.smtpConfig)
  }

  async sendEmail(emailOption: SMTPTransport.MailOptions) {
    const info = await this.transporter.sendMail(emailOption);
    return info.response.includes("OK") ? true : false;
  }
}

export default Email;