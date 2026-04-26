const { getDb } = require('../server/db');
const { v4: uuidv4 } = require('uuid');

async function seedResearch() {
  const db = await getDb();
  try {
    const researches = [
      {
        title: "Deep Learning for Visual Voice Activity Detection in Noisy Environments",
        description: "This paper proposes a novel deep learning architecture using spatio-temporal features extracted from lip movements to accurately detect voice activity in environments with varying levels of acoustic noise, demonstrating a 15% improvement over state-of-the-art methods.",
        metadata: JSON.stringify({
          date: "2023-11-15",
          author: "Anuj Grover, Shubham Kumar, et al.",
          journal: "IEEE Transactions on Multimedia",
          topic: "Computer Vision, Audio Processing"
        })
      },
      {
        title: "Energy-Efficient SRAM Design for IoT Edge Devices using FinFET Technology",
        description: "An innovative 8T SRAM bitcell design optimized for low-power operation in IoT edge devices. The proposed architecture reduces leakage power by 40% while maintaining robust read/write stability at sub-threshold voltages.",
        metadata: JSON.stringify({
          date: "2024-02-28",
          author: "Aditya, Anuj Grover",
          journal: "International Symposium on Low Power Electronics and Design (ISLPED)",
          topic: "VLSI, IoT, Memory Design"
        })
      },
      {
        title: "Graph Neural Networks for Large-Scale Recommendation Systems",
        description: "We introduce a scalable GNN framework that incorporates temporal dynamics and user interaction patterns to provide highly accurate and personalized recommendations in e-commerce platforms. Tested on multiple large-scale datasets.",
        metadata: JSON.stringify({
          date: "2023-08-10",
          author: "Anish, Shubham Kumar",
          journal: "ACM Conference on Recommender Systems",
          topic: "Machine Learning, Graph Neural Networks"
        })
      },
      {
        title: "Automated Pathological Speech Analysis for Early Dysarthria Detection",
        description: "A comprehensive study utilizing deep learning models to analyze acoustic features of speech for the early detection and classification of dysarthria. The system achieves a 92% classification accuracy on the TORGO database.",
        metadata: JSON.stringify({
          date: "2024-04-12",
          author: "Shubham Kumar, Anuj Grover",
          journal: "Speech Communication",
          topic: "Healthcare AI, Speech Processing"
        })
      }
    ];

    // Find a super admin to assign as the uploader
    let uploader = await db.get("SELECT id, name, email FROM users WHERE role = 'super_admin' LIMIT 1");
    if (!uploader) {
       uploader = { id: uuidv4(), name: 'System Admin', email: 'admin@vicaslab.com' };
       // Create the admin user just in case
       await db.run("INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, 'super_admin')", uploader.id, uploader.name, uploader.email);
    }

    for (const r of researches) {
      const id = uuidv4();
      await db.run(
        `INSERT INTO content_items (id, type, title, description, metadata, uploaded_by, uploader_name, uploader_email, status, created_at)
         VALUES (?, 'research', ?, ?, ?, ?, ?, ?, 'approved', CURRENT_TIMESTAMP)`,
        id, r.title, r.description, r.metadata, uploader.id, uploader.name, uploader.email
      );
    }

    console.log('Successfully inserted 4 fake research records.');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await db.close();
  }
}

seedResearch();
