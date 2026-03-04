type TrainSample = {
  features: number[];
  label: 'CS' | 'IT';
};

const trainingData: TrainSample[] = [
{ features: [3.0, 3.5, 1, 4, 2], label: 'CS' }, // สนใจ Software Developer
  { features: [2.8, 3.2, 1, 3, 5], label: 'CS' }, // สนใจ DevOps
  { features: [4.0, 3.8, 1, 4, 1], label: 'CS' }, // สนใจ AI Innovator (เกรดสูง)
  { features: [3.2, 3.0, 1, 2, 3], label: 'CS' }, // สนใจ Cyber Security
  { features: [3.5, 3.5, 1, 3, 0], label: 'CS' }, // สนใจ Data Scientist
  { features: [2.5, 2.5, 1, 4, 2], label: 'CS' }, // เกรดน้อยแต่เข้าใจหลักสูตรดีและเคยเขียนโปรแกรม

  // --- กลุ่ม IT เพิ่มเติม (เน้นงานระบบและการจัดการ) ---
  { features: [2.5, 2.0, 0, 2, 7], label: 'IT' }, // สนใจ IT Support
  { features: [3.0, 2.5, 0, 3, 4], label: 'IT' }, // สนใจ UX/UI
  { features: [2.0, 2.0, 0, 1, 6], label: 'IT' }, // สนใจ Tester/QA
  { features: [3.5, 3.0, 0, 3, 7], label: 'IT' }, // เกรดดีแต่ไม่เคยเขียนโปรแกรมและชอบ IT Support
  { features: [2.2, 2.4, 0, 2, 8], label: 'IT' }, // ยังไม่แน่ใจ แต่พื้นฐานมาทาง IT
  { features: [3.0, 3.0, 0, 4, 4], label: 'IT' }, // สนใจ UX/UI เข้าใจความต่างชัดเจน
  { features: [2.7, 2.5, 0, 2, 2], label: 'IT' }, // เกรดกลางๆ ไม่เคยเขียนโปรแกรม
  { features: [1.5, 1.8, 0, 0, 8], label: 'IT' }  // พื้นฐานน้อยและยังไม่แน่ใจ
];