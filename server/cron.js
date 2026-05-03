const cron = require('node-cron');
const { getDb } = require('./db');
const transporter = require('./utils/email');

function initCronJobs() {
  // Run every Sunday at 9:00 AM
  cron.schedule('0 9 * * 0', async () => {
    console.log('[CRON] Running weekly BTP report reminder...');
    const db = await getDb();
    try {
      const activeProjects = await db.all('SELECT * FROM btp_projects');
      
      for (const project of activeProjects) {
        // Calculate week number based on project creation date
        const createdAtDate = new Date(project.created_at);
        const now = new Date();
        const diffTime = Math.abs(now - createdAtDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const weekNumber = Math.floor(diffDays / 7) + 1;

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
            subject: `Reminder: Submit Week ${weekNumber} BTP Report for "${project.title}"`,
            text: `Hi ${member.name},\n\nThis is an automated reminder to submit your Week ${weekNumber} BTP report for your project: "${project.title}".\n\nPlease log in to the VICAS Hub and submit your report via the BTP Portal: ${process.env.FRONTEND_ORIGIN || 'https://vicas-lab.vercel.app'}/btp?project=${project.id}\n\nBest,\nVICAS Lab`
          };

          try {
            await transporter.sendMail(mailOptions);
            console.log(`[CRON] Sent reminder to ${member.email} for Week ${weekNumber} of ${project.title}`);
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
