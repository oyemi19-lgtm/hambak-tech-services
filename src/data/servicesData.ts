import { Service } from "../types";

export const fallbackServices: Service[] = [
  {
    _id: "6a261861ef1e9022b50056cd",
    title: "Computer Training & ICT Education",
    name: "Computer Training & ICT Education",
    category: "ICT Training Services",
    description: "Practical desktop publishing, computing baseline, and professional digital skills training with accredited certificates.",
    status: "active",
    available: true,
    duration: "1 to 3 Months",
    pricing: [
      { item: "Basic Computer Training (1 Month)", priceDisplay: "25000" },
      { item: "Advanced Computer Training (2 Months)", priceDisplay: "45000" },
      { item: "Microsoft Word Training", priceDisplay: "15000" },
      { item: "Microsoft Excel Training", priceDisplay: "20000" },
      { item: "Microsoft PowerPoint Training", priceDisplay: "15000" },
      { item: "Internet & Email Training", priceDisplay: "10000" },
      { item: "Complete ICT Certificate Course", priceDisplay: "75000" },
      { item: "One-on-One Training (Per Session)", priceDisplay: "10000" }
    ],
    requirements: ["Valid ID or Passport photograph", "Notebook and writing materials", "Enrollment form"],
    benefits: ["Recognized Certification", "Hands-on laboratory access", "Job-ready competency"]
  },
  {
    _id: "hts_online_reg",
    title: "Online Exam & Portal Registrations",
    name: "Online Exam & Portal Registrations",
    category: "Registration Services",
    description: "Accredited registration center for WAEC, NECO, JAMB, NABTEB, NYSC, Post-UTME, and university admissions portals.",
    status: "active",
    available: true,
    duration: "Same Day / Immediate",
    pricing: [
      { item: "JAMB UTME / Direct Entry Profile & Reg", priceDisplay: "7500" },
      { item: "WAEC GCE Registration + Biometrics", priceDisplay: "28500" },
      { item: "NECO SSCE External Registration", priceDisplay: "26000" },
      { item: "NYSC Mobilization & Call-up Processing", priceDisplay: "4500" },
      { item: "Post-UTME Portal Application Screening", priceDisplay: "3500" }
    ],
    requirements: ["O-Level results", "NIN Slip / details", "Passport photograph"],
    benefits: ["Zero-error portal submission", "Instant printout verification", "Direct confirmation SMS"]
  },
  {
    _id: "hts_nin_nimc",
    title: "NIN Enrollment & Modification Services",
    name: "NIN Enrollment & Modification Services",
    category: "NIN & Identity",
    description: "Official National Identification Number (NIN) enrollment, slip reprint, correction of date of birth, name, and phone linkage.",
    status: "active",
    available: true,
    duration: "10 - 30 Minutes",
    pricing: [
      { item: "New NIN Enrollment & Biometric Capture", priceDisplay: "3000" },
      { item: "Standard NIN Slip Print (Color & Plastic Laminated)", priceDisplay: "1500" },
      { item: "Premium Plastic ID Card Printing", priceDisplay: "2500" },
      { item: "NIN Phone Number / Address Correction", priceDisplay: "5000" },
      { item: "NIN Date of Birth Modification (NIMC)", priceDisplay: "15000" }
    ],
    requirements: ["Birth Certificate or Age Declaration", "Valid Phone number", "Current NIN or BVN"],
    benefits: ["Official NIMC portal verification", "Durable PVC card finish", "Quick processing"]
  },
  {
    _id: "hts_print_press",
    title: "Commercial Printing & Graphic Design",
    name: "Commercial Printing & Graphic Design",
    category: "Printing & Design",
    description: "High-resolution digital color printing, document lamination, spiral binding, branded banners, and corporate flyers.",
    status: "active",
    available: true,
    duration: "Express Delivery",
    pricing: [
      { item: "A4 Black & White Printing / Copying (Per Page)", priceDisplay: "100" },
      { item: "A4 Full Color Laser Printing (Per Page)", priceDisplay: "300" },
      { item: "Document Lamination (A4 Waterproof)", priceDisplay: "500" },
      { item: "Spiral Book Binding (Up to 100 pages)", priceDisplay: "1200" },
      { item: "Custom Business Cards (Pack of 100)", priceDisplay: "8500" },
      { item: "Flex Banner Design & Large Format Print", priceDisplay: "12000" }
    ],
    requirements: ["Digital file (PDF, Word, or Image) or physical copy"],
    benefits: ["Crisp resolution output", "Durable cardstock & coatings", "Volume discounts available"]
  },
  {
    _id: "hts_vtu_recharge",
    title: "VTU Data Bundles, Airtime & Cable TV",
    name: "VTU Data Bundles, Airtime & Cable TV",
    category: "VTU & Utilities",
    description: "Automated instant top-up for MTN, Airtel, Glo, 9mobile, DSTV, GOTV, Startimes, and prepaid electricity tokens.",
    status: "active",
    available: true,
    duration: "Instant / 30 Seconds",
    pricing: [
      { item: "MTN SME Data (1GB - 30 Days)", priceDisplay: "350" },
      { item: "MTN SME Data (2GB - 30 Days)", priceDisplay: "700" },
      { item: "Airtel Corporate Data (1GB)", priceDisplay: "350" },
      { item: "Glo SME Data (1GB)", priceDisplay: "350" },
      { item: "Electricity Token Recharge (IKEDC / EKEDC)", priceDisplay: "Convenience Fee ₦100" },
      { item: "GOTV / DSTV Subscription Renewal", priceDisplay: "Official Tariff" }
    ],
    requirements: ["Phone number or Smartcard / Meter number"],
    benefits: ["Instant automated dispatch", "24/7 reliability", "Receipt confirmation"]
  },
  {
    _id: "hts_pos_terminal",
    title: "Agency Banking & POS Cash Terminal",
    name: "Agency Banking & POS Cash Terminal",
    category: "Financial Services",
    description: "Secure agency banking cash withdrawals, instant bank transfers, utility bill collections, and account opening assistance.",
    status: "active",
    available: true,
    duration: "Instant",
    pricing: [
      { item: "Cash Withdrawal (₦1,000 - ₦10,000)", priceDisplay: "100 - 200" },
      { item: "Cash Withdrawal (₦10,000 - ₦20,000)", priceDisplay: "300" },
      { item: "Instant Interbank Fund Transfer", priceDisplay: "100" },
      { item: "Bill & Government Remita Payment Processing", priceDisplay: "500" }
    ],
    requirements: ["ATM Card or Account Details for transfer"],
    benefits: ["High cash availability", "Instant printed receipt", "Bank-grade security"]
  }
];
