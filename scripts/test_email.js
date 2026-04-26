require('dotenv').config({ path: './server/.env' });
const transporter = require('../server/utils/email');

async function testEmail() {
  try {
    console.log('Using SMTP Host:', process.env.SMTP_HOST || 'smtp.ethereal.email');
    console.log('Using SMTP User:', process.env.SMTP_USER || 'ethereal.user@ethereal.email');
    
    const info = await transporter.sendMail({
      from: '"VICAS Hub" <noreply@vicaslab.com>',
      to: 'ad4rush1@gmail.com',
      subject: 'Test Email from VICAS Hub',
      text: 'This is a test email to check if the mailing system is working.',
      html: '<p>This is a test email to check if the mailing system is working.</p>'
    });
    
    console.log('Message sent successfully!');
    console.log('Message ID:', info.messageId);
    
    // If using ethereal, it provides a URL to view the message
    const nodemailer = require('nodemailer');
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

testEmail();
