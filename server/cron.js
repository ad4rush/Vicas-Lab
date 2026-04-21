const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { getDb } = require('./db');

// Configure your SMTP transporter
// In production, use real credentials from environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
    pass: process.env.SMTP_PASS || 'ethereal_password'
  }
});

function initCronJobs() {
  // Run every Sunday at 9:00 AM
  cron.schedule('0 9 * * 0', async () => {
    console.log('[CRON] Running weekly BTP report reminder...');
    const db = await getDb();
    try {
      const activeProjects = await db.all('SELECT * FROM btp_projects');
      
      for (const project of activeProjects) {
        // Get all members for this project
        const members = await db.all(`
          SELECT u.email, u.name 
          FROM users u
          JOIN btp_members m ON u.id = m.user_id
          WHERE m.project_id = ?
        `, project.id);

        for (const member of members) {
          const mailOptions = {
            from: process.env.SMTP_FROM || '"VICAS Lab" <noreply@vicaslab.com>',
            to: member.email,
            subject: `Reminder: Submit Weekly BTP Report for "${project.title}"`,
            text: `Hi ${member.name},\n\nThis is an automated reminder to submit your weekly BTP report for your project: "${project.title}".\n\nPlease log in to the VICAS Hub and submit your report via the BTP Portal: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/btp\n\nBest,\nVICAS Lab`
          };

          try {
            await transporter.sendMail(mailOptions);
            console.log(`[CRON] Sent reminder to ${member.email}`);
          } catch (err) {
            console.error(`[CRON] Failed to send email to ${member.email}:`, err.message);
          }
        }
      }
    } catch (err) {
      console.error('[CRON] Error running weekly job:', err);
    } finally {
      await db.close();
    }
  });

  console.log('Cron jobs initialized.');
}

module.exports = { initCronJobs };
