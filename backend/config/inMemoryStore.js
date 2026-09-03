import bcrypt from "bcryptjs";

/* In-memory fallback database for AI Studio environment */

export const inMemoryUsers = new Map();
export const inMemoryServices = [
  {
    _id: "srv_nin_enrolment",
    name: "NIN Enrolment & Processing",
    slug: "nin-enrolment",
    description: "Full National Identification Number enrolment, biometric capture and tracking slip generation.",
    category: "NIN",
    price: 3000,
    discountPrice: 2500,
    currency: "NGN",
    image: "",
    available: true,
    featured: true,
    duration: "Same day",
    requirements: ["Valid phone number", "Birth certificate or Age declaration"],
    benefits: ["NIMC verified", "Fast processing", "Official reprint"]
  },
  {
    _id: "srv_nin_mod",
    name: "NIN Modification & Validation",
    slug: "nin-modification",
    description: "Correction of name, date of birth, address, or phone number update on existing NIN record.",
    category: "NIN",
    price: 3500,
    discountPrice: 3000,
    currency: "NGN",
    image: "",
    available: true,
    featured: true,
    duration: "24-48 hours",
    requirements: ["Current NIN slip", "Supporting legal documents (Affidavit, Newspaper publication)"],
    benefits: ["Official NIMC clearance", "Instant update notification"]
  },
  {
    _id: "srv_printing",
    name: "Digital Color Printing & Photocopy",
    slug: "digital-printing",
    description: "High-definition color printing, black & white printing, large documents, and photocopy.",
    category: "Printing",
    price: 500,
    discountPrice: 400,
    currency: "NGN",
    image: "",
    available: true,
    featured: false,
    duration: "Instant",
    requirements: ["Digital copy (PDF, DOCX, JPG) via flash or email"],
    benefits: ["Crisp resolution", "Standard 80gsm paper", "Bulk discount"]
  },
  {
    _id: "srv_vtu",
    name: "VTU Airtime & Data Bundles",
    slug: "vtu-recharge",
    description: "Instant airtime top-up and discounted internet data bundles for MTN, Airtel, Glo, and 9mobile.",
    category: "VTU",
    price: 1000,
    discountPrice: 950,
    currency: "NGN",
    image: "",
    available: true,
    featured: true,
    duration: "Instant (under 1 min)",
    requirements: ["Recipient phone number", "Network selection"],
    benefits: ["24/7 automated delivery", "Cheapest rates", "Instant receipt"]
  },
  {
    _id: "srv_waec",
    name: "WAEC / JAMB / NECO Registration",
    slug: "online-exam-registration",
    description: "Accredited e-portal registration for WAEC, JAMB UTME/DE, NECO and GCE candidates.",
    category: "Registration",
    price: 5000,
    discountPrice: 4500,
    currency: "NGN",
    image: "",
    available: true,
    featured: true,
    duration: "1-2 hours",
    requirements: ["Passport photograph", "O-Level results", "NIN"],
    benefits: ["Zero errors guarantee", "Slip printout included", "SMS alert updates"]
  },
  {
    _id: "srv_training_web",
    name: "Web Development Training (Full Stack)",
    slug: "web-development-training",
    description: "Hands-on ICT training in modern frontend and backend development: HTML5, CSS3, JavaScript, Node.js and MongoDB.",
    category: "Training",
    price: 50000,
    discountPrice: 45000,
    currency: "NGN",
    image: "",
    available: true,
    featured: true,
    duration: "3 Months",
    requirements: ["Personal laptop", "Basic computer literacy"],
    benefits: ["Certificate upon completion", "Real projects portfolio", "Mentorship"]
  },
  {
    _id: "srv_graphics",
    name: "Graphics Design & Corporate Branding",
    slug: "graphic-design",
    description: "Professional creative design for business logos, flyers, banners, social media kits, and corporate identity.",
    category: "Design",
    price: 5000,
    discountPrice: 4000,
    currency: "NGN",
    image: "",
    available: true,
    featured: false,
    duration: "24 hours",
    requirements: ["Brand brief", "Text copy and preferred colors"],
    benefits: ["Print-ready vector files", "Unlimited revisions", "High-res PNG & PDF"]
  },
  {
    _id: "srv_pos",
    name: "POS Banking & Cash Withdrawal",
    slug: "pos-services",
    description: "Instant ATM card withdrawal, inter-bank transfers, utility bill payments and wallet funding.",
    category: "POS",
    price: 500,
    discountPrice: 500,
    currency: "NGN",
    image: "",
    available: true,
    featured: false,
    duration: "Instant",
    requirements: ["Debit Card or Bank Details"],
    benefits: ["Reliable network", "Physical receipt issued", "Zero failed transaction fee"]
  }
];

export const inMemoryTransactions = [];

// Seed default admin and demo user
const defaultHashedPassword = await bcrypt.hash("admin123", 10);
const demoHashedPassword = await bcrypt.hash("password123", 10);

const adminUser = {
  _id: "usr_admin_default",
  name: "HAMBAK Administrator",
  username: "admin",
  email: "admin@hambak.com",
  phone: "09155104724",
  password: defaultHashedPassword,
  role: "admin",
  wallet: 150000,
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

const demoUser = {
  _id: "usr_demo_customer",
  name: "Demo Customer",
  username: "demouser",
  email: "customer@hambak.com",
  phone: "08012345678",
  password: demoHashedPassword,
  role: "customer",
  wallet: 25000,
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

inMemoryUsers.set(adminUser._id, adminUser);
inMemoryUsers.set(adminUser.email, adminUser);
inMemoryUsers.set(adminUser.username, adminUser);

inMemoryUsers.set(demoUser._id, demoUser);
inMemoryUsers.set(demoUser.email, demoUser);
inMemoryUsers.set(demoUser.username, demoUser);
