/**
 * seed.js — Run this once to populate the database with sample content.
 * Usage: node seed.js (from the server/ directory)
 */
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const { getDb, initDb } = require('./db');

const SEED_USER_ID = 'seed-system';
const SEED_USER_NAME = 'VICAS Lab';
const SEED_USER_EMAIL = 'admin@iiitd.ac.in';

const projects = [
  {
    title: 'Low-Power SRAM Design for IoT',
    description: 'Designing and optimizing SRAM bitcells for ultra-low power consumption in IoT edge devices. The project focuses on sub-threshold operation, process variation tolerance, and long-term data retention under extreme temperature conditions.',
    metadata: {
      collaborators: 'TCS Research, IIT Bombay',
      funding: 'DST-SERB Core Research Grant',
      tag: 'Memory',
      milestones: 'SPICE simulations complete, Tape-out scheduled for Q2 2024, Test chip evaluation ongoing',
    },
  },
  {
    title: 'High-Speed 12-bit 1GS/s Pipeline ADC',
    description: 'Development of a 1 GS/s 12-bit pipeline analog-to-digital converter targeting next-generation 5G baseband receivers. Key challenges include noise shaping, calibration of inter-stage gain errors, and achieving sub-1 LSB INL across PVT corners.',
    metadata: {
      collaborators: 'NXP Semiconductors, IIITD VLSI Group',
      funding: 'MeitY — National Mission on Power Electronics',
      tag: 'Mixed-Signal',
      milestones: 'Architecture finalized, RTL simulation passing, Layout in progress',
    },
  },
  {
    title: 'AI Hardware Accelerator via Processing-in-Memory',
    description: 'A custom silicon accelerator for DNN inference at the edge, leveraging Processing-in-Memory (PIM) paradigms to drastically reduce data-movement energy. The chip targets ResNet-50 inference at under 5mW.',
    metadata: {
      collaborators: 'Qualcomm Research India, IISc Bangalore',
      funding: 'Intel India Research, IIIT-Delhi Seed Grant',
      tag: 'AI / Architecture',
      milestones: 'PIM macro prototype taped out, RTL integration of systolic array done, Power benchmarking underway',
      externalLink: 'https://arxiv.org/abs/2309.01234',
    },
  },
  {
    title: 'Neuromorphic Spike-Timing Neural Network Chip',
    description: 'A fully spiking neural network (SNN) chip inspired by biological synaptic plasticity. Implements STDP learning on-chip for real-time adaptation in autonomous robotic perception tasks.',
    metadata: {
      collaborators: 'TIFR Mumbai, University of Edinburgh',
      funding: 'DST Indo-UK Joint Research Initiative',
      tag: 'Neuromorphic',
      milestones: 'STDP core verified in UMC 65nm, Fabrication submitted, Demo planned for NeurIPS 2024',
    },
  },
];

const newsItems = [
  {
    title: 'Best Paper Award at IEEE VLSI Symposium 2024',
    description: 'Our paper "Sub-Threshold SRAM Reliability Enhancement via Adaptive Body Biasing" received the Best Paper Award at the prestigious IEEE Symposium on VLSI Technology and Circuits, June 2024. Congratulations to all contributing authors!',
    metadata: {
      date: 'Jun 14, 2024',
      tag: 'Award',
      externalLink: 'https://vlsisymposium.org',
    },
  },
  {
    title: 'New DST-SERB Grant: ₹1.8 Cr for PIM Research',
    description: 'The lab has been awarded a major DST-SERB Core Research Grant of ₹1.8 crore to advance our work on Processing-in-Memory architectures for AI inference. The project will fund three new PhD positions and one postdoctoral researcher over 3 years.',
    metadata: {
      date: 'Apr 01, 2024',
      tag: 'Funding',
    },
  },
  {
    title: 'PhD Graduation — Dr. Priya Sharma',
    description: 'Congratulations to Dr. Priya Sharma on the successful defense of her PhD thesis titled "Energy-Efficient SRAM Design for Sub-1V IoT Applications". Dr. Sharma will be joining Intel Labs Bangalore as a Senior Research Engineer.',
    metadata: {
      date: 'Feb 20, 2024',
      tag: 'People',
    },
  },
];

const achievements = [
  {
    title: 'ISSCC 2024 Paper Acceptance',
    description: 'Our work on a 6T SRAM with adaptive write-assist has been accepted at ISSCC 2024 — the premier conference for solid-state circuits. This is the lab\'s second ISSCC paper in three years.',
    metadata: {
      date: 'Nov 2023',
      awardedTo: 'Anuj Grover, Aditya Singh, Priya Sharma',
      awardedBy: 'IEEE International Solid-State Circuits Conference (ISSCC)',
      externalLink: 'https://isscc.org',
    },
  },
  {
    title: 'Intel India PhD Fellowship 2023',
    description: 'Anish Kumar has been awarded the prestigious Intel India PhD Fellowship for his outstanding work on neuromorphic computing. The fellowship includes a stipend enhancement and an internship opportunity at Intel Labs Bangalore.',
    metadata: {
      date: 'Aug 2023',
      awardedTo: 'Anish Kumar',
      awardedBy: 'Intel India Research',
    },
  },
  {
    title: 'ACM India Outstanding Dissertation Award',
    description: 'Dr. Rohan Mehra\'s doctoral dissertation on low-power ADC design has won the ACM India Outstanding Dissertation Award in the Engineering category for 2023.',
    metadata: {
      date: 'Oct 2023',
      awardedTo: 'Dr. Rohan Mehra',
      awardedBy: 'ACM India',
    },
  },
];

async function seed() {
  await initDb();
  const db = await getDb();

  try {
    // Temporarily disable FK checks so we can insert the seed user without a password_hash
    await db.run('PRAGMA foreign_keys = OFF');

    // Ensure seed system user exists
    await db.run(
      `INSERT OR IGNORE INTO users (id, name, email, role) VALUES (?, ?, ?, 'super_admin')`,
      SEED_USER_ID, SEED_USER_NAME, SEED_USER_EMAIL
    );

    // Re-enable FK checks
    await db.run('PRAGMA foreign_keys = ON');

    console.log('Checking existing seed data…');
    const existing = await db.get("SELECT COUNT(*) as cnt FROM content_items WHERE uploaded_by = ?", SEED_USER_ID);
    if (existing.cnt > 0) {
      console.log(`Found ${existing.cnt} existing seed items. Skipping (delete them manually to re-seed).`);
      return;
    }

    console.log('Seeding projects…');
    for (const p of projects) {
      await db.run(
        `INSERT INTO content_items (id, type, title, description, image_url, storage_path, metadata, uploaded_by, uploader_name, uploader_email, status)
         VALUES (?, 'project', ?, ?, NULL, NULL, ?, ?, ?, ?, 'approved')`,
        uuidv4(), p.title, p.description, JSON.stringify(p.metadata),
        SEED_USER_ID, SEED_USER_NAME, SEED_USER_EMAIL
      );
    }

    console.log('Seeding news…');
    for (const n of newsItems) {
      await db.run(
        `INSERT INTO content_items (id, type, title, description, image_url, storage_path, metadata, uploaded_by, uploader_name, uploader_email, status)
         VALUES (?, 'news', ?, ?, NULL, NULL, ?, ?, ?, ?, 'approved')`,
        uuidv4(), n.title, n.description, JSON.stringify(n.metadata),
        SEED_USER_ID, SEED_USER_NAME, SEED_USER_EMAIL
      );
    }

    console.log('Seeding achievements…');
    for (const a of achievements) {
      await db.run(
        `INSERT INTO content_items (id, type, title, description, image_url, storage_path, metadata, uploaded_by, uploader_name, uploader_email, status)
         VALUES (?, 'achievement', ?, ?, NULL, NULL, ?, ?, ?, ?, 'approved')`,
        uuidv4(), a.title, a.description, JSON.stringify(a.metadata),
        SEED_USER_ID, SEED_USER_NAME, SEED_USER_EMAIL
      );
    }

    console.log('✅ Seed complete! Added:', projects.length, 'projects,', newsItems.length, 'news,', achievements.length, 'achievements.');
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    await db.close();
  }
}

seed();
