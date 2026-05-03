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
    metadata: { collaborators: 'TCS Research, IIT Bombay', funding: 'DST-SERB Core Research Grant', tag: 'Memory', milestones: 'SPICE simulations complete, Tape-out scheduled Q2 2024, Test chip evaluation ongoing' },
  },
  {
    title: 'High-Speed 12-bit 1GS/s Pipeline ADC',
    description: 'Development of a 1 GS/s 12-bit pipeline analog-to-digital converter targeting next-generation 5G baseband receivers. Key challenges include noise shaping, calibration of inter-stage gain errors, and achieving sub-1 LSB INL across PVT corners.',
    metadata: { collaborators: 'NXP Semiconductors, IIITD VLSI Group', funding: 'MeitY — National Mission on Power Electronics', tag: 'Mixed-Signal', milestones: 'Architecture finalized, RTL simulation passing, Layout in progress' },
  },
  {
    title: 'AI Hardware Accelerator via Processing-in-Memory',
    description: 'A custom silicon accelerator for DNN inference at the edge leveraging Processing-in-Memory paradigms to drastically reduce data-movement energy. The chip targets ResNet-50 inference at under 5mW.',
    metadata: { collaborators: 'Qualcomm Research India, IISc Bangalore', funding: 'Intel India Research, IIIT-Delhi Seed Grant', tag: 'AI / Architecture', milestones: 'PIM macro prototype taped out, RTL integration of systolic array done, Power benchmarking underway', externalLink: 'https://arxiv.org/abs/2309.01234' },
  },
  {
    title: 'Neuromorphic Spike-Timing Neural Network Chip',
    description: 'A fully spiking neural network chip inspired by biological synaptic plasticity. Implements STDP learning on-chip for real-time adaptation in autonomous robotic perception tasks.',
    metadata: { collaborators: 'TIFR Mumbai, University of Edinburgh', funding: 'DST Indo-UK Joint Research Initiative', tag: 'Neuromorphic', milestones: 'STDP core verified in UMC 65nm, Fabrication submitted, Demo planned for NeurIPS 2024' },
  },
  {
    title: 'FinFET Reliability Modeling at 7nm Node',
    description: 'Comprehensive reliability analysis framework for 7nm FinFET devices covering BTI, HCI, and electromigration degradation mechanisms. Developing compact aging models for circuit-level lifetime prediction under realistic workloads.',
    metadata: { collaborators: 'GlobalFoundries, IIT Delhi', funding: 'ISRO Advanced Electronics Fund', tag: 'Device Physics', milestones: 'TCAD calibration done, Compact model extraction ongoing, Silicon measurement planned Q3 2024' },
  },
  {
    title: 'Radiation-Hardened Latch Design for Space Applications',
    description: 'Novel latch topologies with single-event upset immunity for satellite and space-grade electronics. Exploring dual-interlocked and DICE-based approaches with minimal area and power overhead.',
    metadata: { collaborators: 'ISRO Satellite Centre, DRDO', funding: 'ISRO RESPOND Programme', tag: 'Radiation-Hardened', milestones: 'Topology selection complete, Post-layout simulation done, Proton beam testing scheduled' },
  },
  {
    title: 'Ultra-Wideband RF Transceiver for 6G',
    description: 'Designing a fully integrated RF transceiver operating in the sub-THz band for future 6G communications. The project targets 140 GHz carrier frequency with 20 Gbps data throughput using advanced beamforming techniques.',
    metadata: { collaborators: 'Samsung Research India, IIT Roorkee', funding: 'DoT India 6G Vision Grant', tag: 'RF / Wireless', milestones: 'LNA design complete, Mixer linearity optimized, PA under design' },
  },
  {
    title: 'Reconfigurable Computing Fabric for Edge AI',
    description: 'A coarse-grained reconfigurable architecture that can dynamically map different neural network topologies with near-ASIC efficiency. Supports CNN, RNN, and Transformer workloads on a single chip.',
    metadata: { collaborators: 'AMD Research, BITS Pilani', funding: 'MeitY Emerging Technology Grant', tag: 'Architecture', milestones: 'CGRA compiler prototype ready, FPGA emulation successful, ASIC synthesis in 28nm underway' },
  },
  {
    title: 'On-Chip Voltage Regulator with 95% Efficiency',
    description: 'Integrated buck converter design achieving 95% peak efficiency for system-on-chip power management. Features adaptive frequency scaling and fast transient response for dynamic voltage-frequency scaling workloads.',
    metadata: { collaborators: 'Texas Instruments India, IISc Bangalore', funding: 'TI University Programme', tag: 'Power Management', milestones: 'Control loop design verified, Inductor integration feasibility study done, Tapeout Q1 2025' },
  },
  {
    title: 'Cryogenic CMOS Interface for Quantum Computing',
    description: 'Developing CMOS control and readout electronics operating at 4K temperature for superconducting qubit systems. Key challenges include minimizing power dissipation at cryogenic temperatures while maintaining signal fidelity.',
    metadata: { collaborators: 'IIT Madras, TU Delft Netherlands', funding: 'DST Quantum-Enabled Science & Technology Grant', tag: 'Quantum Electronics', milestones: 'Cryo transistor characterization done, Amplifier design at 4K verified, Integration with qubit system planned' },
  },
];

const newsItems = [
  {
    title: 'Best Paper Award at IEEE VLSI Symposium 2024',
    description: 'Our paper "Sub-Threshold SRAM Reliability Enhancement via Adaptive Body Biasing" received the Best Paper Award at the prestigious IEEE Symposium on VLSI Technology and Circuits, June 2024.',
    metadata: { date: 'Jun 14, 2024', tag: 'Award', externalLink: 'https://vlsisymposium.org' },
  },
  {
    title: 'New DST-SERB Grant: ₹1.8 Cr for PIM Research',
    description: 'The lab has been awarded a major DST-SERB Core Research Grant of ₹1.8 crore to advance our work on Processing-in-Memory architectures for AI inference. The project will fund three new PhD positions.',
    metadata: { date: 'Apr 01, 2024', tag: 'Funding' },
  },
  {
    title: 'PhD Graduation — Dr. Priya Sharma',
    description: 'Congratulations to Dr. Priya Sharma on the successful defense of her PhD thesis titled "Energy-Efficient SRAM Design for Sub-1V IoT Applications". She joins Intel Labs Bangalore as Senior Research Engineer.',
    metadata: { date: 'Feb 20, 2024', tag: 'People' },
  },
  {
    title: 'VICAS Lab Hosts IEEE VLSI Workshop 2024',
    description: 'IIIT-Delhi hosted the IEEE Workshop on Advanced VLSI Design with over 200 participants from academia and industry. Keynote speakers included Dr. Mark Bohr (Intel Fellow) and Prof. Jan Rabaey (UC Berkeley).',
    metadata: { date: 'Mar 15, 2024', tag: 'Event' },
  },
  {
    title: 'Collaboration Agreement with Samsung Research India',
    description: 'VICAS Lab has signed a 3-year research collaboration MoU with Samsung Research India for joint work on 6G RF transceiver design and sub-THz communication systems.',
    metadata: { date: 'Jan 10, 2024', tag: 'Partnership' },
  },
  {
    title: 'New Lab Equipment: 28 GHz Vector Network Analyzer',
    description: 'The lab has acquired a Keysight PNA-X 28 GHz vector network analyzer funded by the DST-FIST programme, enabling on-wafer RF measurements for our mmWave research projects.',
    metadata: { date: 'Dec 05, 2023', tag: 'Infrastructure' },
  },
  {
    title: 'Two Papers Accepted at DATE 2024',
    description: 'Two papers from VICAS Lab have been accepted at the Design, Automation & Test in Europe (DATE) 2024 conference — one on PIM architectures and another on aging-aware circuit optimization.',
    metadata: { date: 'Nov 22, 2023', tag: 'Publication' },
  },
  {
    title: 'Summer Internship Programme 2024 Open',
    description: 'Applications are now open for the VICAS Lab Summer Research Internship 2024. We are looking for motivated undergraduate students interested in VLSI design, mixed-signal circuits, and AI hardware.',
    metadata: { date: 'Oct 15, 2023', tag: 'Recruitment' },
  },
  {
    title: 'Prof. Anuj Grover Invited Talk at ICCAD 2023',
    description: 'Prof. Anuj Grover delivered an invited talk on "Processing-in-Memory: From Concept to Silicon" at the IEEE/ACM International Conference on Computer-Aided Design in San Francisco.',
    metadata: { date: 'Oct 30, 2023', tag: 'Talk' },
  },
  {
    title: 'Successful Tape-out of Neuromorphic SNN Chip',
    description: 'The VICAS Lab has completed a successful tape-out of its first-generation spiking neural network chip in UMC 65nm technology. The chip implements on-chip STDP learning for real-time robotics applications.',
    metadata: { date: 'Sep 18, 2023', tag: 'Milestone' },
  },
];

const achievements = [
  {
    title: 'ISSCC 2024 Paper Acceptance',
    description: 'Our work on a 6T SRAM with adaptive write-assist has been accepted at ISSCC 2024 — the premier conference for solid-state circuits. This is the lab\'s second ISSCC paper in three years.',
    metadata: { date: 'Nov 2023', awardedTo: 'Anuj Grover, Aditya Singh, Priya Sharma', awardedBy: 'IEEE International Solid-State Circuits Conference (ISSCC)', externalLink: 'https://isscc.org' },
  },
  {
    title: 'Intel India PhD Fellowship 2023',
    description: 'Anish Kumar has been awarded the prestigious Intel India PhD Fellowship for his outstanding work on neuromorphic computing. The fellowship includes stipend enhancement and internship at Intel Labs.',
    metadata: { date: 'Aug 2023', awardedTo: 'Anish Kumar', awardedBy: 'Intel India Research' },
  },
  {
    title: 'ACM India Outstanding Dissertation Award',
    description: 'Dr. Rohan Mehra\'s doctoral dissertation on low-power ADC design has won the ACM India Outstanding Dissertation Award in the Engineering category for 2023.',
    metadata: { date: 'Oct 2023', awardedTo: 'Dr. Rohan Mehra', awardedBy: 'ACM India' },
  },
  {
    title: 'IEEE Electron Devices Society Best Student Paper',
    description: 'Neha Verma received the Best Student Paper Award at the IEEE International Electron Devices Meeting for her work on FinFET reliability modeling at sub-7nm nodes.',
    metadata: { date: 'Dec 2023', awardedTo: 'Neha Verma', awardedBy: 'IEEE Electron Devices Society' },
  },
  {
    title: 'VLSI Design Conference Best Demo Award 2024',
    description: 'The VICAS Lab team won the Best Demo Award at VLSI Design Conference 2024 for demonstrating real-time object detection on the lab\'s custom PIM accelerator chip consuming under 5mW.',
    metadata: { date: 'Jan 2024', awardedTo: 'Aditya Singh, Ravi Prakash, Meera Jain', awardedBy: 'VLSI Design Conference' },
  },
  {
    title: 'Qualcomm Innovation Fellowship 2023',
    description: 'Ravi Prakash and Meera Jain have been awarded the Qualcomm Innovation Fellowship for their proposal on energy-efficient attention mechanisms in Processing-in-Memory architectures.',
    metadata: { date: 'Jul 2023', awardedTo: 'Ravi Prakash, Meera Jain', awardedBy: 'Qualcomm Research' },
  },
  {
    title: 'IIIT-Delhi Teaching Excellence Award',
    description: 'Prof. Anuj Grover has been recognized with the IIIT-Delhi Teaching Excellence Award for his course on Advanced VLSI Design which received outstanding student feedback scores.',
    metadata: { date: 'May 2023', awardedTo: 'Prof. Anuj Grover', awardedBy: 'IIIT-Delhi' },
  },
  {
    title: 'DAC Young Fellowship 2023',
    description: 'Karan Mehta has been selected as a DAC Young Fellow at the 60th Design Automation Conference in San Francisco for his work on ML-guided physical design optimization.',
    metadata: { date: 'Jun 2023', awardedTo: 'Karan Mehta', awardedBy: 'Design Automation Conference (DAC)' },
  },
  {
    title: 'SERB STAR Award for Research Excellence',
    description: 'VICAS Lab has been recognized with the SERB Science and Technology Award for Research (STAR) for sustained excellence in VLSI circuit design research contributing to India\'s semiconductor ecosystem.',
    metadata: { date: 'Sep 2023', awardedTo: 'VICAS Lab, IIIT-Delhi', awardedBy: 'Science & Engineering Research Board (SERB)' },
  },
  {
    title: 'IEEE CASS Pre-Doctoral Grant',
    description: 'Suman Pandey received the IEEE Circuits and Systems Society Pre-Doctoral Grant for her research on cryogenic CMOS readout circuits for superconducting qubit control.',
    metadata: { date: 'Apr 2023', awardedTo: 'Suman Pandey', awardedBy: 'IEEE Circuits and Systems Society' },
  },
];

const researchItems = [
  {
    title: 'Adaptive Body Biasing for Sub-Threshold SRAM Reliability Enhancement',
    description: 'This paper proposes a novel adaptive body biasing scheme that dynamically adjusts NMOS and PMOS body voltages to compensate for process variations in sub-threshold SRAMs, achieving 3x improvement in read stability with minimal area overhead.',
    metadata: { date: '2024-06-15', topic: 'Memory Design', author: 'A. Grover, P. Sharma, A. Singh', journal: 'IEEE Symposium on VLSI Technology and Circuits 2024', externalLink: 'https://doi.org/10.1109/VLSITechnologyandCir46783.2024' },
  },
  {
    title: 'Energy-Efficient Processing-in-Memory Architecture for Edge DNN Inference',
    description: 'We present a PIM macro that performs multiply-accumulate operations directly within SRAM arrays. Our prototype achieves 12.4 TOPS/W efficiency for 8-bit integer inference of ResNet-50, demonstrating 5.2x energy reduction over conventional digital accelerators.',
    metadata: { date: '2024-02-18', topic: 'AI Hardware', author: 'A. Singh, R. Prakash, A. Grover', journal: 'IEEE International Solid-State Circuits Conference (ISSCC) 2024', externalLink: 'https://doi.org/10.1109/ISSCC49657.2024' },
  },
  {
    title: 'On-Chip STDP Learning in 65nm CMOS Spiking Neural Network',
    description: 'A fully integrated spiking neural network processor implementing spike-timing-dependent plasticity with 256 neurons and 64K synapses in UMC 65nm CMOS. The chip demonstrates real-time unsupervised feature extraction at 2.3 mW total power.',
    metadata: { date: '2024-01-10', topic: 'Neuromorphic Computing', author: 'A. Kumar, A. Grover', journal: 'IEEE Journal of Solid-State Circuits (JSSC) 2024', externalLink: 'https://doi.org/10.1109/JSSC.2024.3345678' },
  },
  {
    title: 'Aging-Aware Standard Cell Library for Reliable 7nm FinFET Design',
    description: 'We develop an aging-aware standard cell library that incorporates BTI and HCI degradation models into timing characterization. Our approach enables accurate lifetime prediction and enables designers to meet 10-year reliability targets without excessive guardbanding.',
    metadata: { date: '2024-03-25', topic: 'Reliability', author: 'N. Verma, A. Grover', journal: 'Design, Automation & Test in Europe (DATE) 2024' },
  },
  {
    title: 'A 12-bit 800MS/s Pipeline ADC with Digital Background Calibration',
    description: 'This work presents a 12-bit 800MS/s pipeline ADC in 28nm CMOS featuring digital background calibration for inter-stage gain and offset errors. The ADC achieves 66.2 dB SNDR and 78.1 dB SFDR while consuming 42 mW from a 0.9V supply.',
    metadata: { date: '2023-11-20', topic: 'Mixed-Signal', author: 'R. Mehra, A. Grover', journal: 'IEEE Transactions on Circuits and Systems I (TCAS-I)', externalLink: 'https://doi.org/10.1109/TCSI.2023.3298765' },
  },
  {
    title: 'DICE-Based Radiation-Hardened Flip-Flop with Sub-Threshold Operation',
    description: 'A novel dual-interlocked storage cell flip-flop design optimized for sub-threshold operation in space-grade electronics. Achieves complete single-event upset immunity while operating at 0.3V supply with only 28% area overhead compared to standard DFF.',
    metadata: { date: '2023-09-12', topic: 'Radiation-Hardened', author: 'S. Pandey, A. Grover', journal: 'IEEE Transactions on Nuclear Science' },
  },
  {
    title: 'Coarse-Grained Reconfigurable Architecture for Multi-Model AI Inference',
    description: 'We propose a CGRA-based accelerator supporting dynamic reconfiguration across CNN, RNN, and Transformer workloads. FPGA emulation results show 8.5x better energy-delay product compared to GPU baselines for edge deployment scenarios.',
    metadata: { date: '2024-03-25', topic: 'Architecture', author: 'K. Mehta, R. Prakash, A. Grover', journal: 'Design, Automation & Test in Europe (DATE) 2024' },
  },
  {
    title: 'Sub-THz Low-Noise Amplifier Design for 6G Front-End Receivers',
    description: 'A 140 GHz LNA in 22nm FDSOI achieving 18.5 dB gain and 5.2 dB noise figure. The design employs neutralization capacitors and optimized layout parasitics extraction for reliable operation at sub-THz frequencies.',
    metadata: { date: '2023-06-15', topic: 'RF / Wireless', author: 'M. Jain, A. Grover', journal: 'IEEE Radio Frequency Integrated Circuits Symposium (RFIC) 2023' },
  },
  {
    title: 'Cryogenic CMOS Characterization and Modeling for Quantum Computing Interfaces',
    description: 'Comprehensive characterization of commercial 28nm CMOS transistors at temperatures from 300K down to 4K. We develop compact models capturing the cryogenic behavior including carrier freeze-out, threshold voltage shift, and mobility enhancement.',
    metadata: { date: '2023-12-10', topic: 'Quantum Electronics', author: 'S. Pandey, A. Grover', journal: 'IEEE International Electron Devices Meeting (IEDM) 2023', externalLink: 'https://doi.org/10.1109/IEDM49372.2023' },
  },
  {
    title: 'Integrated Buck Converter with Adaptive Frequency Scaling for SoC Power Management',
    description: 'A fully integrated digitally controlled buck converter achieving 95.2% peak efficiency with 100MHz switching frequency. Features sub-microsecond transient response for DVFS workloads and occupies only 0.12mm² in 65nm CMOS.',
    metadata: { date: '2023-08-22', topic: 'Power Management', author: 'A. Singh, A. Grover', journal: 'IEEE Custom Integrated Circuits Conference (CICC) 2023' },
  },
];

async function seed() {
  await initDb();
  const db = await getDb();

  try {
    await db.run('PRAGMA foreign_keys = OFF');
    await db.run(
      `INSERT OR IGNORE INTO users (id, name, email, role) VALUES (?, ?, ?, 'super_admin')`,
      SEED_USER_ID, SEED_USER_NAME, SEED_USER_EMAIL
    );
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

    console.log('Seeding research publications…');
    for (const r of researchItems) {
      await db.run(
        `INSERT INTO content_items (id, type, title, description, image_url, storage_path, metadata, uploaded_by, uploader_name, uploader_email, status)
         VALUES (?, 'research', ?, ?, NULL, NULL, ?, ?, ?, ?, 'approved')`,
        uuidv4(), r.title, r.description, JSON.stringify(r.metadata),
        SEED_USER_ID, SEED_USER_NAME, SEED_USER_EMAIL
      );
    }

    console.log('✅ Seed complete! Added:', projects.length, 'projects,', newsItems.length, 'news,', achievements.length, 'achievements,', researchItems.length, 'research.');
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    await db.close();
  }
}

seed();
