const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin@arbeit2024", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@arbeit.co.in" },
    update: {},
    create: {
      name: "Arbeit Admin",
      email: "admin@arbeit.co.in",
      hashedPassword: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });
  console.log("Created admin:", admin.email);

  // Create sample employer
  const employerPassword = await bcrypt.hash("employer123", 12);
  const employer = await prisma.user.upsert({
    where: { email: "hr@techcorp.in" },
    update: {},
    create: {
      name: "Priya Sharma",
      email: "hr@techcorp.in",
      hashedPassword: employerPassword,
      role: "EMPLOYER",
      phone: "9876543210",
      emailVerified: new Date(),
    },
  });

  const company = await prisma.company.upsert({
    where: { slug: "techcorp-solutions" },
    update: {},
    create: {
      userId: employer.id,
      name: "TechCorp Solutions",
      slug: "techcorp-solutions",
      description:
        "Leading IT services company specializing in cloud computing, AI, and digital transformation.",
      industry: "Information Technology",
      size: "201-500",
      founded: "2015",
      location: "Bangalore",
      website: "https://techcorp.in",
      email: "hr@techcorp.in",
      phone: "080-12345678",
      isVerified: true,
    },
  });
  console.log("Created employer:", employer.email, "Company:", company.name);

  // Create second employer
  const employer2Password = await bcrypt.hash("employer123", 12);
  const employer2 = await prisma.user.upsert({
    where: { email: "recruit@financeplus.in" },
    update: {},
    create: {
      name: "Rahul Verma",
      email: "recruit@financeplus.in",
      hashedPassword: employer2Password,
      role: "EMPLOYER",
      phone: "9876543211",
      emailVerified: new Date(),
    },
  });

  const company2 = await prisma.company.upsert({
    where: { slug: "finance-plus" },
    update: {},
    create: {
      userId: employer2.id,
      name: "Finance Plus",
      slug: "finance-plus",
      description:
        "Innovative fintech company transforming digital payments and banking solutions across India.",
      industry: "Banking & Financial Services",
      size: "51-200",
      founded: "2018",
      location: "Mumbai",
      website: "https://financeplus.in",
      email: "recruit@financeplus.in",
      isVerified: true,
    },
  });

  // Create sample job seeker
  const seekerPassword = await bcrypt.hash("seeker123", 12);
  const seeker = await prisma.user.upsert({
    where: { email: "amit.kumar@gmail.com" },
    update: {},
    create: {
      name: "Amit Kumar",
      email: "amit.kumar@gmail.com",
      hashedPassword: seekerPassword,
      role: "JOB_SEEKER",
      phone: "9999888877",
      emailVerified: new Date(),
      profile: {
        create: {
          headline: "Full Stack Developer | React | Node.js",
          summary:
            "Passionate software developer with 3+ years of experience in building scalable web applications.",
          workStatus: "EXPERIENCED",
          experienceYears: 3,
          currentSalary: 800000,
          expectedSalary: 1200000,
          location: "New Delhi",
          skills: JSON.stringify([
            "React",
            "Node.js",
            "TypeScript",
            "PostgreSQL",
            "AWS",
            "Docker",
            "Git",
          ]),
          education: JSON.stringify([
            {
              degree: "B.Tech Computer Science",
              institution: "Delhi Technological University",
              year: "2021",
            },
          ]),
          experience: JSON.stringify([
            {
              title: "Software Developer",
              company: "InfoTech Solutions",
              duration: "2021 - Present",
              description: "Building full-stack web applications using React and Node.js",
            },
          ]),
          noticePeriod: "30 days",
        },
      },
    },
  });
  console.log("Created job seeker:", seeker.email);

  // Create sample jobs
  const sampleJobs = [
    {
      companyId: company.id,
      title: "Senior React Developer",
      slug: "senior-react-developer-techcorp",
      description:
        "We are looking for an experienced React developer to join our frontend team. You will be responsible for building user-facing features, optimizing components for performance, and collaborating with backend engineers.\n\nAs a Senior React Developer, you will lead the development of our flagship product's frontend architecture, mentor junior developers, and contribute to technical decisions.",
      requirements:
        "- 5+ years of experience with React.js\n- Strong proficiency in TypeScript\n- Experience with state management (Redux, Zustand, or Context API)\n- Familiarity with Next.js\n- Understanding of RESTful APIs and GraphQL\n- Experience with testing frameworks (Jest, React Testing Library)\n- Strong problem-solving skills",
      responsibilities:
        "- Design and implement user-facing features using React.js\n- Build reusable components and front-end libraries\n- Optimize applications for maximum speed and scalability\n- Collaborate with backend developers and designers\n- Mentor junior team members\n- Participate in code reviews and architectural discussions",
      skills: JSON.stringify(["React", "TypeScript", "Next.js", "Redux", "GraphQL", "Jest"]),
      jobType: "FULL_TIME",
      experienceLevel: "SENIOR",
      experienceMin: 5,
      experienceMax: 8,
      salaryMin: 1500000,
      salaryMax: 2500000,
      location: "Bangalore",
      isRemote: false,
      industry: "Information Technology",
      department: "Engineering",
      vacancies: 2,
      status: "ACTIVE",
      featured: true,
      views: 245,
      postedAt: new Date("2026-03-01"),
    },
    {
      companyId: company.id,
      title: "DevOps Engineer",
      slug: "devops-engineer-techcorp",
      description:
        "Join our infrastructure team to build and maintain CI/CD pipelines, manage cloud infrastructure, and ensure high availability of our services.\n\nYou'll work with cutting-edge cloud technologies and help us scale our platform to serve millions of users.",
      requirements:
        "- 3+ years in DevOps/SRE role\n- Strong knowledge of AWS/GCP/Azure\n- Experience with Docker, Kubernetes\n- CI/CD pipeline management (Jenkins, GitHub Actions)\n- Infrastructure as Code (Terraform, CloudFormation)\n- Linux administration\n- Monitoring tools (Prometheus, Grafana, ELK)",
      responsibilities:
        "- Build and maintain CI/CD pipelines\n- Manage cloud infrastructure on AWS\n- Implement monitoring and alerting\n- Ensure security best practices\n- Automate operational tasks\n- Support development teams with infrastructure needs",
      skills: JSON.stringify(["AWS", "Docker", "Kubernetes", "Terraform", "Jenkins", "Linux"]),
      jobType: "FULL_TIME",
      experienceLevel: "MID",
      experienceMin: 3,
      experienceMax: 6,
      salaryMin: 1200000,
      salaryMax: 2000000,
      location: "Bangalore",
      isRemote: true,
      industry: "Information Technology",
      department: "Infrastructure",
      vacancies: 1,
      status: "ACTIVE",
      featured: false,
      views: 120,
      postedAt: new Date("2026-03-03"),
    },
    {
      companyId: company.id,
      title: "Data Scientist - Machine Learning",
      slug: "data-scientist-ml-techcorp",
      description:
        "We're looking for a Data Scientist to develop and deploy machine learning models that power our recommendation engine and analytics platform.\n\nYou'll work with large datasets, build predictive models, and collaborate with product teams to deliver data-driven solutions.",
      requirements:
        "- Master's/PhD in Computer Science, Statistics, or related field\n- 2+ years of ML experience\n- Proficiency in Python, TensorFlow/PyTorch\n- Experience with NLP or Computer Vision\n- Strong statistical knowledge\n- Experience with big data tools (Spark, Hadoop)",
      skills: JSON.stringify(["Python", "TensorFlow", "PyTorch", "NLP", "SQL", "Spark"]),
      jobType: "FULL_TIME",
      experienceLevel: "MID",
      experienceMin: 2,
      experienceMax: 5,
      salaryMin: 1400000,
      salaryMax: 2200000,
      location: "Hyderabad",
      isRemote: false,
      industry: "AI & Data Science",
      department: "Data Science",
      vacancies: 3,
      status: "ACTIVE",
      featured: true,
      views: 340,
      postedAt: new Date("2026-03-05"),
    },
    {
      companyId: company2.id,
      title: "Product Manager - Payments",
      slug: "product-manager-payments-financeplus",
      description:
        "Lead the product strategy for our digital payments platform. You'll define the product roadmap, work with engineering and design teams, and drive growth metrics.",
      requirements:
        "- 4+ years in product management\n- Experience in fintech/payments\n- Strong analytical skills\n- Excellent communication\n- Understanding of UPI, NEFT, RTGS payment systems\n- MBA preferred",
      skills: JSON.stringify(["Product Strategy", "Fintech", "UPI", "Agile", "Data Analysis", "Stakeholder Management"]),
      jobType: "FULL_TIME",
      experienceLevel: "SENIOR",
      experienceMin: 4,
      experienceMax: 8,
      salaryMin: 2000000,
      salaryMax: 3500000,
      location: "Mumbai",
      isRemote: false,
      industry: "Banking & Financial Services",
      department: "Product",
      vacancies: 1,
      status: "ACTIVE",
      featured: true,
      views: 180,
      postedAt: new Date("2026-03-02"),
    },
    {
      companyId: company2.id,
      title: "Risk Analyst",
      slug: "risk-analyst-financeplus",
      description:
        "Analyze credit risk models, develop fraud detection algorithms, and support risk management decisions for our lending platform.",
      requirements:
        "- 1-3 years in risk analytics\n- Strong SQL and Excel skills\n- Experience with Python/R for statistical modeling\n- Understanding of credit risk frameworks\n- FRM/CFA certification is a plus",
      skills: JSON.stringify(["Risk Analysis", "SQL", "Python", "Statistical Modeling", "Excel", "Credit Risk"]),
      jobType: "FULL_TIME",
      experienceLevel: "JUNIOR",
      experienceMin: 1,
      experienceMax: 3,
      salaryMin: 600000,
      salaryMax: 1000000,
      location: "Mumbai",
      isRemote: false,
      industry: "Banking & Financial Services",
      department: "Risk",
      vacancies: 2,
      status: "ACTIVE",
      featured: false,
      views: 95,
      postedAt: new Date("2026-03-07"),
    },
    {
      companyId: company.id,
      title: "Frontend Developer Intern",
      slug: "frontend-developer-intern-techcorp",
      description:
        "A great opportunity for fresh graduates to kickstart their career in frontend development. You'll learn from experienced developers and work on real projects.",
      requirements:
        "- B.Tech/BCA in Computer Science or related field\n- Basic knowledge of HTML, CSS, JavaScript\n- Familiarity with React is a plus\n- Eagerness to learn\n- Good communication skills",
      skills: JSON.stringify(["HTML", "CSS", "JavaScript", "React", "Git"]),
      jobType: "INTERNSHIP",
      experienceLevel: "ENTRY",
      experienceMin: 0,
      experienceMax: 1,
      salaryMin: 15000,
      salaryMax: 25000,
      location: "Bangalore",
      isRemote: true,
      industry: "Information Technology",
      department: "Engineering",
      vacancies: 5,
      status: "ACTIVE",
      featured: false,
      views: 420,
      postedAt: new Date("2026-03-08"),
    },
    {
      companyId: company.id,
      title: "Agritech Business Analyst",
      slug: "agritech-business-analyst-techcorp",
      description:
        "Join our agritech vertical to analyze market trends, develop business strategies, and work with farming communities to bring technology-driven solutions.",
      requirements:
        "- 2+ years in business analysis\n- Understanding of agriculture sector\n- Data analysis skills\n- Experience with market research\n- Hindi/regional language proficiency preferred",
      skills: JSON.stringify(["Business Analysis", "Market Research", "Excel", "Agriculture", "Data Analysis"]),
      jobType: "FULL_TIME",
      experienceLevel: "JUNIOR",
      experienceMin: 2,
      experienceMax: 4,
      salaryMin: 500000,
      salaryMax: 900000,
      location: "New Delhi",
      isRemote: false,
      industry: "Agriculture & Agritech",
      department: "Business",
      vacancies: 1,
      status: "ACTIVE",
      featured: false,
      views: 67,
      postedAt: new Date("2026-03-06"),
    },
    {
      companyId: company2.id,
      title: "Compliance Officer",
      slug: "compliance-officer-financeplus",
      description:
        "Ensure regulatory compliance across all operations. Work with RBI guidelines, KYC/AML frameworks, and internal audit processes.",
      requirements:
        "- 5+ years in compliance/regulatory role\n- Deep knowledge of RBI regulations\n- Experience with KYC/AML\n- CS/LLB/CA qualification preferred\n- Strong attention to detail",
      skills: JSON.stringify(["Regulatory Compliance", "RBI Guidelines", "KYC", "AML", "Audit", "Risk Management"]),
      jobType: "FULL_TIME",
      experienceLevel: "SENIOR",
      experienceMin: 5,
      experienceMax: 10,
      salaryMin: 1500000,
      salaryMax: 2500000,
      location: "Mumbai",
      isRemote: false,
      industry: "Banking & Financial Services",
      department: "Legal & Compliance",
      vacancies: 1,
      status: "ACTIVE",
      featured: false,
      views: 55,
      postedAt: new Date("2026-03-04"),
    },
  ];

  for (const job of sampleJobs) {
    await prisma.job.upsert({
      where: { slug: job.slug },
      update: {},
      create: job,
    });
  }
  console.log(`Created ${sampleJobs.length} sample jobs`);

  // Create a sample application
  await prisma.application.upsert({
    where: {
      jobId_userId: {
        jobId: (await prisma.job.findUnique({ where: { slug: "senior-react-developer-techcorp" } }))
          .id,
        userId: seeker.id,
      },
    },
    update: {},
    create: {
      jobId: (await prisma.job.findUnique({ where: { slug: "senior-react-developer-techcorp" } }))
        .id,
      userId: seeker.id,
      coverLetter:
        "I am excited to apply for the Senior React Developer position. With 3+ years of experience in React and TypeScript, I believe I would be a strong addition to your team.",
      status: "SHORTLISTED",
    },
  });
  console.log("Created sample application");

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
