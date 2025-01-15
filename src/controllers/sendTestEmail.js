import transporter from "../config/email.config.js";

const sendTestEmail = async () => {
  try {
    const info = await transporter.sendMail({
      from: '"Dokaan Tech" <dokaan.tech@gmail.com>', // Sender address
      to: 'redoxop45@gmail.com', // Recipient email
      subject: 'Test Email', // Subject line
      text: 'Hello, this is a test email from Dokaan Tech.', // Plain text body
      html: '<b>Hello, this is a test email from Dokaan Tech.</b>', // HTML body
    });

    console.log('Email sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

sendTestEmail();
