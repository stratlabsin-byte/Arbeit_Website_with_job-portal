"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileEdit,
  CheckCircle,
  AlertCircle,
  Loader2,
  RotateCcw,
  Upload,
  ImageIcon,
  X,
  Globe,
  Briefcase,
  Building2,
  Phone,
  Info,
  Calculator,
  Shield,
  Layers,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   DEFAULT CONTENT FOR EVERY PAGE
   ═══════════════════════════════════════════════════════════════ */

const defaultContent: Record<string, any> = {
  /* ─── Global: Navigation ─── */
  navigation: [
    { label: "Home", href: "/", hidden: false },
    {
      label: "Jobs",
      href: "/jobs",
      hidden: false,
      children: [
        { label: "Browse All Jobs", href: "/jobs", hidden: false },
        { label: "Jobs by Industry", href: "/jobs?view=industry", hidden: false },
        { label: "Remote Jobs", href: "/jobs?isRemote=true", hidden: false },
        { label: "Fresher Jobs", href: "/jobs?experienceLevel=ENTRY", hidden: false },
      ],
    },
    { label: "Contracting", href: "/contracting", hidden: false },
    {
      label: "Recruitment",
      href: "/recruitment",
      hidden: false,
      children: [
        { label: "Recruitment Services", href: "/recruitment", hidden: false },
        { label: "Information Technology", href: "/jobs?industry=Information+Technology", hidden: false },
        { label: "Banking & Finance", href: "/jobs?industry=Banking+%26+Financial+Services", hidden: false },
        { label: "AI & Data Science", href: "/jobs?industry=AI+%26+Data+Science", hidden: false },
        { label: "Agriculture", href: "/jobs?industry=Agriculture+%26+Agritech", hidden: false },
      ],
    },
    { label: "About", href: "/about", hidden: false },
    { label: "Contact", href: "/contact", hidden: false },
  ],

  /* ─── Homepage ─── */
  hero: {
    heading: "India's Most Comprehensive Tech-led HR Solutions Company",
    highlightText: "HR Solutions",
    subtitle: "with HR Services & Platforms impacting every part of the employee lifecycle.",
    backgroundImage: "",
    ctaPrimary: { label: "Find Talent Now", href: "/recruitment" },
    ctaSecondary: { label: "Looking For A Job?", href: "/jobs" },
  },
  stats: [
    { label: "Years of Expertise", value: 10, suffix: "+" },
    { label: "Candidates Placed", value: 5000, suffix: "+" },
    { label: "Corporate Clients", value: 200, suffix: "+" },
    { label: "Industries Served", value: 15, suffix: "+" },
  ],
  services: [
    { title: "Staffing Solutions", description: "Permanent, contract and temporary staffing across all levels.", href: "/recruitment", image: "" },
    { title: "Contract Staffing", description: "Build agile teams with our contract staffing.", href: "/contracting", image: "" },
    { title: "Executive Search", description: "Discreet, headhunt-led search for C-suite and senior leadership roles.", href: "/recruitment", image: "" },
    { title: "HR Consulting", description: "From workforce planning to HR transformation.", href: "/about", image: "" },
  ],
  about: {
    heading: "A Bridge Between Talent & Opportunity",
    paragraphs: [
      "Arbeit is a leading recruitment agency headquartered in New Delhi, specialising in permanent, contract and temporary placements across India's most dynamic industries.",
      "We combine rich domain expertise with AI-powered matching technology to deliver the right candidate for every role.",
    ],
    bulletPoints: [
      "AI-powered candidate-role matching",
      "Deep expertise across 15+ industries",
      "End-to-end recruitment process management",
      "Full compliance with Indian labour regulations",
    ],
    image: "",
  },
  industries: [
    { name: "Information Technology", jobs: "500+", image: "" },
    { name: "Banking & Finance", jobs: "300+", image: "" },
    { name: "Healthcare & Pharma", jobs: "180+", image: "" },
    { name: "Manufacturing", jobs: "250+", image: "" },
    { name: "E-commerce & Retail", jobs: "220+", image: "" },
    { name: "AI & Data Science", jobs: "200+", image: "" },
    { name: "Agriculture & Agritech", jobs: "150+", image: "" },
    { name: "Education & Training", jobs: "120+", image: "" },
    { name: "Logistics & Supply Chain", jobs: "140+", image: "" },
  ],
  testimonials: [
    { quote: "Arbeit helped us build an entire engineering team in just 6 weeks.", name: "Priya Sharma", role: "CTO, TechCorp Solutions", avatar: "" },
    { quote: "The quality of candidates sets Arbeit apart from every other agency.", name: "Rahul Verma", role: "HR Director, Finance Plus", avatar: "" },
    { quote: "From initial briefing to final placement, the process was seamless.", name: "Anita Desai", role: "VP Operations, AgriTech India", avatar: "" },
  ],
  clients: [
    { name: "TechCorp", logo: "" },
    { name: "InfoSys", logo: "" },
    { name: "Wipro", logo: "" },
    { name: "HCL Tech", logo: "" },
    { name: "TCS", logo: "" },
    { name: "Cognizant", logo: "" },
    { name: "Accenture", logo: "" },
    { name: "IBM", logo: "" },
    { name: "Deloitte", logo: "" },
    { name: "Capgemini", logo: "" },
    { name: "Oracle", logo: "" },
    { name: "SAP", logo: "" },
  ],

  /* ─── About Page ─── */
  aboutPage: {
    pageHidden: false,
    heroHeading: "About Arbeit",
    heroSubtitle: "India's trusted partner for recruitment, staffing, and HR solutions.",
    heroImage: "",
    mission: "To connect the right talent with the right opportunity — faster, smarter, and with integrity.",
    missionImage: "",
    values: [
      { title: "Integrity", description: "Transparent and ethical practices in every engagement.", icon: "" },
      { title: "Innovation", description: "Leveraging AI and data to transform recruitment.", icon: "" },
      { title: "Excellence", description: "Uncompromising quality in every placement.", icon: "" },
      { title: "Partnership", description: "Building long-term relationships, not transactions.", icon: "" },
    ],
    team: [
      { name: "Team Member 1", role: "Founder & CEO", bio: "", photo: "" },
      { name: "Team Member 2", role: "Head of Operations", bio: "", photo: "" },
      { name: "Team Member 3", role: "Head of Technology", bio: "", photo: "" },
    ],
    stats: [
      { label: "Years of Experience", value: "10+" },
      { label: "Candidates Placed", value: "5,000+" },
      { label: "Companies Served", value: "200+" },
      { label: "Industries Covered", value: "15+" },
    ],
  },

  /* ─── Contact Page ─── */
  contactPage: {
    pageHidden: false,
    heroHeading: "Contact Us",
    heroSubtitle: "Get in touch with our team. We'd love to hear from you and discuss how we can help.",
    heroImage: "",
    formHeading: "Send Us a Message",
    formSubtitle: "Fill out the form below and we'll get back to you within 24 hours.",
    sidebarHeading: "Get in Touch",
    sidebarSubtitle: "Reach out to us through any of the following channels.",
    address: "B-231, First Floor, Greater Kailash-1, New Delhi 110048",
    addressLink: "https://maps.google.com/?q=B-231,+Greater+Kailash-1,+New+Delhi+110048",
    phone: "011-45092961",
    phoneLink: "tel:01145092961",
    email: "info@arbeit.co.in",
    emailLink: "mailto:info@arbeit.co.in",
    website: "www.arbeit.co.in",
    websiteLink: "https://www.arbeit.co.in",
    officeHours: [
      { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM" },
      { day: "Saturday", hours: "10:00 AM - 2:00 PM" },
      { day: "Sunday", hours: "Closed" },
    ],
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.7775610984244!2d77.2310508!3d28.5494305!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce3e564dafffb%3A0x3c1745429aa2b85c!2sGreater%20Kailash%20I%2C%20New%20Delhi%2C%20Delhi%20110048!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
    socialLinks: {
      linkedin: "",
      twitter: "",
      facebook: "",
      instagram: "",
    },
  },

  /* ─── Recruitment / Staffing Page ─── */
  recruitmentPage: {
    pageHidden: false,
    heroHeading: "The Right Talent, Right When You Need It",
    heroHighlight: "Right When",
    heroSubtitle: "From contingent workforce to permanent leadership hires — Arbeit delivers end-to-end staffing and recruitment solutions.",
    heroImage: "",
    introHeading: "India's Trusted Partner for Staffing Excellence",
    introText: "Arbeit is a full-service staffing and recruitment firm that connects top-tier talent with leading organizations across India.",
    introImage: "",
    staffingTypes: [
      { title: "Contingent Staffing", description: "Quickly scale your workforce with skilled contingent professionals.", image: "", features: ["Rapid deployment", "Pre-screened talent", "Flexible models", "Compliance managed"] },
      { title: "Contract Staffing", description: "Engage specialized talent on fixed-term contracts for defined projects.", image: "", features: ["Fixed-term & project-based", "Domain specialists", "Contract management", "Onboarding support"] },
      { title: "Contract-to-Hire", description: "Evaluate talent on the job before making a permanent offer.", image: "", features: ["Try before you hire", "Reduced risk", "Smooth transition", "Performance-based"] },
      { title: "Permanent Recruitment", description: "Find the right people for your most critical roles.", image: "", features: ["Executive hiring", "Niche roles", "Multi-stage assessment", "Replacement guarantee"] },
    ],
    whyChoose: [
      { title: "Deep Talent Network", stat: "50,000+", description: "Extensively curated database of pre-screened professionals." },
      { title: "Rapid Turnaround", stat: "72 hrs", description: "From requirement to shortlist — qualified candidates fast." },
      { title: "Quality Guarantee", stat: "95%", description: "Offer-to-join ratio backed by thorough vetting." },
      { title: "Data-Driven Hiring", stat: "Real-time", description: "Market intelligence and hiring analytics." },
    ],
    processSteps: [
      { title: "Discovery", description: "Deep-dive into hiring needs and culture." },
      { title: "Sourcing", description: "Multi-channel outreach across platforms." },
      { title: "Screening", description: "Technical evaluations and background checks." },
      { title: "Presentation", description: "Curated shortlist with detailed profiles." },
      { title: "Coordination", description: "Interview scheduling and feedback loops." },
      { title: "Onboarding", description: "Offer management and post-joining check-ins." },
    ],
    industries: [
      "Information Technology", "Banking & Financial Services", "Healthcare & Life Sciences",
      "Manufacturing & Engineering", "E-commerce & Retail", "Telecom & Media",
      "Energy & Utilities", "Logistics & Supply Chain", "Education & EdTech",
      "Automotive", "Real Estate & Infrastructure", "FMCG & Consumer Goods",
    ],
  },

  /* ─── HR Advisory Page ─── */
  hrAdvisoryPage: {
    pageHidden: false,
    heroHeading: "HR Advisory Services",
    heroHighlight: "Services",
    heroSubtitle: "Transform your people strategy with expert HR advisory.",
    heroImage: "",
    services: [
      { title: "Organisation Design", description: "Restructure your organisation for agility and growth.", image: "", points: ["Org structure assessment", "Role mapping & grading", "Change management support"] },
      { title: "Workforce Planning", description: "Align your talent pipeline with future business needs.", image: "", points: ["Demand-supply analysis", "Succession planning", "Skill gap assessment"] },
      { title: "HR Policy & Compliance", description: "Build robust HR policies that attract talent and ensure compliance.", image: "", points: ["Policy design & audit", "Statutory compliance", "Employee handbook"] },
      { title: "Compensation & Benefits", description: "Design competitive, equitable pay structures.", image: "", points: ["Salary benchmarking", "Pay equity analysis", "Incentive design"] },
      { title: "Business Transformation", description: "Navigate mergers and restructurings with people at the centre.", image: "", points: ["M&A integration", "Digital HR transformation", "Culture alignment"] },
      { title: "HR Technology Advisory", description: "Select and implement the right HRMS and analytics platforms.", image: "", points: ["HRMS selection", "Process automation", "Analytics dashboards"] },
    ],
    whyChoose: [
      { title: "Strategic Perspective", description: "We connect HR initiatives to business outcomes." },
      { title: "Deep Domain Expertise", description: "15+ years of HR leadership experience across industries." },
      { title: "End-to-End Delivery", description: "From diagnosis to implementation and change management." },
      { title: "Customised Solutions", description: "Every recommendation tailored to your context." },
    ],
    processSteps: [
      { title: "Discovery & Diagnosis", description: "Stakeholder interviews and current-state assessment." },
      { title: "Benchmarking", description: "Industry benchmarking to identify gaps and opportunities." },
      { title: "Solution Design", description: "Collaborative development of frameworks and policies." },
      { title: "Implementation Support", description: "Hands-on rollout and change management support." },
      { title: "Impact Measurement", description: "Post-implementation reviews and KPI tracking." },
    ],
    faqs: [
      { question: "What are HR Advisory Services?", answer: "Strategic consulting to optimise people practices." },
      { question: "Who needs HR Advisory?", answer: "Any organisation going through growth or transformation." },
    ],
  },

  /* ─── Payroll & Compliance Page ─── */
  payrollPage: {
    pageHidden: false,
    heroHeading: "Payroll & Compliance Outsourcing",
    heroHighlight: "Compliance",
    heroSubtitle: "Tech-driven payroll processing and end-to-end statutory compliance management.",
    heroImage: "",
    introHeading: "Hassle-Free Payroll, Total Compliance",
    introText: "Managing payroll and statutory compliance in India is complex. Arbeit takes this burden off your shoulders.",
    introImage: "",
    services: [
      { title: "Payroll Processing", description: "End-to-end payroll management — salary computation to bank transfers.", image: "", features: ["Multi-entity payroll", "Automated tax calculations", "Digital payslips", "Bank file generation"] },
      { title: "Statutory Compliance", description: "PF, ESI, PT, LWF, gratuity, and all statutory filings.", image: "", features: ["PF & ESI management", "Professional Tax filing", "Labour Welfare Fund", "Gratuity administration"] },
      { title: "Tax & TDS Management", description: "Investment declarations, Form 16, and quarterly TDS returns.", image: "", features: ["Investment declaration portal", "TDS computation & filing", "Form 16 generation", "Tax optimisation advisory"] },
      { title: "Labour Law Compliance", description: "Central and state-level labour regulations.", image: "", features: ["Shop & Establishment Act", "Contract Labour Act", "Minimum Wages Act", "State-specific regulations"] },
      { title: "HR Technology & HRMS", description: "Cloud-based payroll and HRMS platforms.", image: "", features: ["Employee self-service", "Leave & attendance", "Real-time analytics", "Mobile-friendly access"] },
      { title: "Employee Helpdesk", description: "Dedicated query resolution for your employees.", image: "", features: ["Dedicated support team", "Multi-channel access", "SLA-driven resolution", "Knowledge base"] },
    ],
    whyOutsource: [
      { title: "Zero Compliance Risk", stat: "100%", description: "On-time statutory filings across all entities." },
      { title: "On-Time Every Cycle", stat: "99.9%", description: "Payroll processed accurately and on schedule." },
      { title: "Data Security", stat: "ISO 27001", description: "Enterprise-grade encryption and compliance." },
      { title: "Cost Efficiency", stat: "40%", description: "Reduce payroll processing costs." },
    ],
    complianceAreas: [
      "Provident Fund (PF)", "Employee State Insurance (ESI)", "Professional Tax (PT)",
      "Tax Deducted at Source (TDS)", "Labour Welfare Fund (LWF)", "Gratuity Act",
      "Shops & Establishment Act", "Contract Labour Act", "Minimum Wages Act",
      "Payment of Wages Act", "Maternity Benefit Act", "Sexual Harassment (POSH)",
    ],
    processSteps: [
      { title: "Data Collection", description: "Attendance, leave, variable pay inputs collected." },
      { title: "Payroll Processing", description: "Salary computation and statutory deductions." },
      { title: "Validation & Approval", description: "Multi-level validation with client sign-off." },
      { title: "Disbursement", description: "Salary credited and payslips generated." },
      { title: "Statutory Filing", description: "PF/ESI returns filed, TDS deposited." },
      { title: "Reporting & Support", description: "MIS reports and employee query resolution." },
    ],
    faqs: [
      { question: "What does payroll outsourcing include?", answer: "Complete payroll lifecycle — salary computation to statutory filings." },
      { question: "Is our employee data secure?", answer: "Yes. ISO 27001 standards with AES-256 encryption." },
    ],
  },

  /* ─── Contracting Page ─── */
  contractingPage: {
    pageHidden: false,
    heroHeading: "Hire Contractors",
    heroSubtitle: "Build a flexible, high-performing workforce with Arbeit's contract staffing solutions. Deploy skilled professionals quickly and scale on demand.",
    heroImage: "",
    benefits: [
      { icon: "Zap", title: "Fast Impact", description: "Contractors bring specialized skills and hit the ground running from day one." },
      { icon: "Clock", title: "Short Notice Periods", description: "Scale your team with agility. Contractors typically have shorter notice periods." },
      { icon: "IndianRupee", title: "Financial Savings", description: "Reduce overhead costs associated with full-time employees." },
      { icon: "FlaskConical", title: "Trial New Roles", description: "Test new roles within your organization before committing to permanent headcount." },
    ],
    journeySteps: [
      { step: 1, title: "Define Framework", description: "Collaborate to understand role requirements, scope, duration, and budget." },
      { step: 2, title: "Candidate Mapping", description: "Identify and map potential contractors from our extensive talent network." },
      { step: 3, title: "Screening", description: "Technical assessments, background verification, and skill validation." },
      { step: 4, title: "Shortlisting", description: "Curated shortlist with detailed profiles and assessment summaries." },
      { step: 5, title: "Client Interview", description: "Coordinated interviews with structured feedback collection." },
      { step: 6, title: "Onboarding", description: "Seamless onboarding with documentation and compliance checks." },
      { step: 7, title: "Post-Placement Care", description: "Regular check-ins to ensure satisfaction and high engagement." },
      { step: 8, title: "Payroll Management", description: "Complete payroll administration including statutory deductions." },
    ],
    helpCards: [
      { icon: "Users", title: "Large Talent Pool", description: "Access thousands of pre-vetted contractors across India." },
      { icon: "Wrench", title: "Tailored Solutions", description: "Bespoke contracting arrangements aligned with your operational model." },
      { icon: "ShieldCheck", title: "Compliance Guarantee", description: "Full compliance with Contract Labour Act, EPF & ESI, and more." },
      { icon: "HeartHandshake", title: "End-to-End Support", description: "Dedicated account manager as your single point of contact." },
    ],
    ctaHeading: "Ready to Build Your Flexible Workforce?",
    ctaSubtitle: "Let Arbeit handle the complexity of contract staffing while you focus on driving your business forward.",
  },

  /* ─── Custom Pages ─── */
  customPages: [],
};

/* ═══════════════════════════════════════════════════════════════
   PAGE GROUPINGS & SECTION METADATA
   ═══════════════════════════════════════════════════════════════ */

type PageGroup = {
  label: string;
  icon: any;
  sections: { key: string; label: string; description: string }[];
};

const pageGroups: PageGroup[] = [
  {
    label: "Global",
    icon: Globe,
    sections: [
      { key: "navigation", label: "Navigation Bar", description: "Top navigation links, dropdowns, and sub-menus." },
    ],
  },
  {
    label: "Homepage",
    icon: Layers,
    sections: [
      { key: "hero", label: "Hero Section", description: "Main banner — heading, subtitle, background image, and CTAs." },
      { key: "stats", label: "Statistics Bar", description: "Numbers strip below the hero." },
      { key: "services", label: "Our Services", description: "Service cards on the homepage." },
      { key: "about", label: "About Us Section", description: "About text, bullet points, and image." },
      { key: "industries", label: "Industries We Serve", description: "Industries grid with names, counts, and images." },
      { key: "testimonials", label: "Client Testimonials", description: "Client quotes with avatars." },
      { key: "clients", label: "Trusted By / Client Logos", description: "Client names and logos." },
    ],
  },
  {
    label: "About Page",
    icon: Info,
    sections: [
      { key: "aboutPage", label: "About Page Content", description: "Hero, mission, values, team, and stats for /about." },
    ],
  },
  {
    label: "Contact Page",
    icon: Phone,
    sections: [
      { key: "contactPage", label: "Contact Page Content", description: "Address, phone, email, office hours, map, and social links." },
    ],
  },
  {
    label: "Staffing & Recruitment",
    icon: Briefcase,
    sections: [
      { key: "recruitmentPage", label: "Recruitment Page Content", description: "Hero, intro, staffing types, process, and industries for /recruitment." },
    ],
  },
  {
    label: "HR Advisory Services",
    icon: Shield,
    sections: [
      { key: "hrAdvisoryPage", label: "HR Advisory Page Content", description: "Hero, services, why choose us, process, and FAQs for /HR-Advisory-Services." },
    ],
  },
  {
    label: "Payroll & Compliance",
    icon: Calculator,
    sections: [
      { key: "payrollPage", label: "Payroll Page Content", description: "Hero, intro, services, compliance areas, process, and FAQs for /Payroll-Compliance-Outsourcing." },
    ],
  },
  {
    label: "Contracting Page",
    icon: Building2,
    sections: [
      { key: "contractingPage", label: "Contracting Page Content", description: "Hero, benefits, hiring journey, help cards, and CTA for /contracting." },
    ],
  },
  {
    label: "Custom Pages",
    icon: FileEdit,
    sections: [
      { key: "customPages", label: "Custom Pages", description: "Create and manage custom pages with dynamic content blocks." },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

type Toast = { type: "success" | "error"; message: string } | null;

export default function AdminContentPage() {
  const [sections, setSections] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [activePage, setActivePage] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  // Load content
  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          const loaded: Record<string, any> = {};
          data.data.forEach((item: any) => {
            loaded[item.section] = item.content;
          });
          const merged = { ...JSON.parse(JSON.stringify(defaultContent)) };
          Object.keys(loaded).forEach((key) => {
            merged[key] = loaded[key];
          });
          setSections(merged);
        } else {
          setSections(JSON.parse(JSON.stringify(defaultContent)));
        }
      })
      .catch(() => setSections(JSON.parse(JSON.stringify(defaultContent))))
      .finally(() => setLoading(false));
  }, []);

  // Toast auto-clear
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // ─── Helpers ───
  const updateField = useCallback((sectionKey: string, path: string, value: any) => {
    setSections((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj = copy[sectionKey];
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return copy;
    });
  }, []);

  const saveSection = async (sectionKey: string) => {
    setSaving(sectionKey);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: sectionKey, content: sections[sectionKey] }),
      });
      if (!res.ok) throw new Error("Save failed");
      setToast({ type: "success", message: `"${sectionKey}" saved successfully!` });
    } catch {
      setToast({ type: "error", message: `Failed to save "${sectionKey}".` });
    } finally {
      setSaving(null);
    }
  };

  const resetSection = (sectionKey: string) => {
    setSections((prev) => ({
      ...prev,
      [sectionKey]: JSON.parse(JSON.stringify(defaultContent[sectionKey])),
    }));
    setToast({ type: "success", message: `"${sectionKey}" reset to defaults.` });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-500">Loading content...</span>
      </div>
    );
  }

  const currentGroup = pageGroups[activePage];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileEdit className="h-6 w-6" />
            Website Content Manager
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Edit every section of every page. Changes appear on the website after saving.
          </p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
            toast.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {toast.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.message}
        </div>
      )}

      {/* Page Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {pageGroups.map((group, i) => (
          <button
            key={group.label}
            onClick={() => { setActivePage(i); setExpandedSection(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activePage === i
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <group.icon className="h-4 w-4" />
            {group.label}
          </button>
        ))}
      </div>

      {/* Sections for current page */}
      <div className="space-y-4">
        {currentGroup.sections.map((sec) => (
          <div key={sec.key} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Section header */}
            <button
              onClick={() => setExpandedSection(expandedSection === sec.key ? null : sec.key)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="text-left">
                <h3 className="text-base font-semibold text-gray-900">{sec.label}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{sec.description}</p>
              </div>
              {expandedSection === sec.key ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>

            {/* Section body */}
            {expandedSection === sec.key && (
              <div className="px-6 pb-6 border-t border-gray-100">
                {/* Action bar */}
                <div className="flex items-center gap-3 py-4 border-b border-gray-100 mb-4">
                  <button
                    onClick={() => saveSection(sec.key)}
                    disabled={saving === sec.key}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {saving === sec.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {saving === sec.key ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => resetSection(sec.key)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset to Default
                  </button>
                </div>

                {/* Dynamic editor */}
                <SectionEditor
                  sectionKey={sec.key}
                  data={sections[sec.key]}
                  updateField={updateField}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION EDITOR — renders fields based on the data shape
   ═══════════════════════════════════════════════════════════════ */

function SectionEditor({
  sectionKey,
  data,
  updateField,
}: {
  sectionKey: string;
  data: any;
  updateField: (sectionKey: string, path: string, value: any) => void;
}) {
  if (!data) return <p className="text-gray-400 italic">No data to edit.</p>;

  // Navigation — special editor
  if (sectionKey === "navigation") {
    return <NavigationEditor data={data} sectionKey={sectionKey} updateField={updateField} />;
  }

  // Custom Pages — special editor
  if (sectionKey === "customPages") {
    return <CustomPagesEditor data={data} sectionKey={sectionKey} updateField={updateField} />;
  }

  // Array of items (stats, services, industries, etc.)
  if (Array.isArray(data)) {
    return (
      <ArrayEditor
        data={data}
        sectionKey={sectionKey}
        updateField={updateField}
        path=""
      />
    );
  }

  // Object — render all fields
  return (
    <ObjectEditor
      data={data}
      sectionKey={sectionKey}
      updateField={updateField}
      path=""
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   OBJECT EDITOR — recursively renders fields for an object
   ═══════════════════════════════════════════════════════════════ */

function ObjectEditor({
  data,
  sectionKey,
  updateField,
  path,
}: {
  data: Record<string, any>;
  sectionKey: string;
  updateField: (sectionKey: string, path: string, value: any) => void;
  path: string;
}) {
  return (
    <div className="space-y-4">
      {Object.entries(data).map(([key, value]) => {
        const fieldPath = path ? `${path}.${key}` : key;
        const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

        // Image fields
        if (
          typeof value === "string" &&
          (key.toLowerCase().includes("image") ||
            key.toLowerCase().includes("photo") ||
            key.toLowerCase().includes("avatar") ||
            key.toLowerCase().includes("logo") ||
            key.toLowerCase().includes("icon"))
        ) {
          return (
            <ImageField
              key={fieldPath}
              label={label}
              value={value}
              onChange={(v) => updateField(sectionKey, fieldPath, v)}
            />
          );
        }

        // String fields
        if (typeof value === "string") {
          const isLong = value.length > 100 || key === "answer" || key === "bio" || key === "description" || key.includes("Text") || key.includes("subtitle") || key.includes("paragraph");
          return (
            <FieldInput
              key={fieldPath}
              label={label}
              value={value}
              multiline={isLong}
              onChange={(v) => updateField(sectionKey, fieldPath, v)}
            />
          );
        }

        // Boolean fields (toggle switches)
        if (typeof value === "boolean") {
          return (
            <ToggleField
              key={fieldPath}
              label={label}
              value={value}
              onChange={(v) => updateField(sectionKey, fieldPath, v)}
            />
          );
        }

        // Number fields
        if (typeof value === "number") {
          return (
            <FieldInput
              key={fieldPath}
              label={label}
              value={String(value)}
              type="number"
              onChange={(v) => updateField(sectionKey, fieldPath, Number(v))}
            />
          );
        }

        // Nested array
        if (Array.isArray(value)) {
          return (
            <div key={fieldPath} className="border-l-2 border-blue-200 pl-4 mt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">{label}</h4>
              <ArrayEditor
                data={value}
                sectionKey={sectionKey}
                updateField={updateField}
                path={fieldPath}
              />
            </div>
          );
        }

        // Nested object
        if (typeof value === "object" && value !== null) {
          return (
            <div key={fieldPath} className="border-l-2 border-gray-200 pl-4 mt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">{label}</h4>
              <ObjectEditor
                data={value}
                sectionKey={sectionKey}
                updateField={updateField}
                path={fieldPath}
              />
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ARRAY EDITOR — handles arrays of items with add/remove
   ═══════════════════════════════════════════════════════════════ */

function ArrayEditor({
  data,
  sectionKey,
  updateField,
  path,
}: {
  data: any[];
  sectionKey: string;
  updateField: (sectionKey: string, path: string, value: any) => void;
  path: string;
}) {
  const fullPath = path || "";

  const addItem = () => {
    if (data.length === 0) return;
    // Clone first item as template, clear string values
    const template = JSON.parse(JSON.stringify(data[0]));
    const clearStrings = (obj: any): any => {
      if (typeof obj === "string") return "";
      if (typeof obj === "number") return 0;
      if (Array.isArray(obj)) return obj.map(clearStrings);
      if (typeof obj === "object" && obj !== null) {
        const cleaned: any = {};
        Object.keys(obj).forEach((k) => { cleaned[k] = clearStrings(obj[k]); });
        return cleaned;
      }
      return obj;
    };
    const newItem = clearStrings(template);
    const newArr = [...data, newItem];
    updateField(sectionKey, fullPath || sectionKey, fullPath ? newArr : newArr);
    // For top-level arrays, we need to set the whole section
    if (!fullPath) {
      // updateField won't work for top-level arrays directly, handle separately
    }
  };

  const removeItem = (index: number) => {
    const newArr = data.filter((_, i) => i !== index);
    if (fullPath) {
      updateField(sectionKey, fullPath, newArr);
    }
  };

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const itemPath = fullPath ? `${fullPath}.${index}` : `${index}`;

        // Simple string array
        if (typeof item === "string") {
          return (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateField(sectionKey, itemPath, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
              <button onClick={() => removeItem(index)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        }

        // Object items
        if (typeof item === "object" && item !== null) {
          const itemLabel = item.title || item.name || item.label || item.question || `Item ${index + 1}`;
          return (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  {index + 1}. {itemLabel}
                </span>
                <button onClick={() => removeItem(index)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <ObjectEditor
                data={item}
                sectionKey={sectionKey}
                updateField={updateField}
                path={itemPath}
              />
            </div>
          );
        }

        return null;
      })}

      <button
        onClick={addItem}
        className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg border border-dashed border-blue-300 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Item
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NAVIGATION EDITOR — 3-level nested menu editor
   ═══════════════════════════════════════════════════════════════ */

function NavigationEditor({
  data,
  sectionKey,
  updateField,
}: {
  data: any[];
  sectionKey: string;
  updateField: (sectionKey: string, path: string, value: any) => void;
}) {
  const addMenuItem = () => {
    const newArr = [...data, { label: "New Item", href: "/", hidden: false }];
    updateField(sectionKey, sectionKey, newArr);
  };

  const removeMenuItem = (index: number) => {
    updateField(sectionKey, sectionKey, data.filter((_, i) => i !== index));
  };

  const addChild = (parentIndex: number) => {
    const copy = JSON.parse(JSON.stringify(data));
    if (!copy[parentIndex].children) copy[parentIndex].children = [];
    copy[parentIndex].children.push({ label: "Sub Item", href: "/", hidden: false });
    updateField(sectionKey, sectionKey, copy);
  };

  const removeChild = (parentIndex: number, childIndex: number) => {
    const copy = JSON.parse(JSON.stringify(data));
    copy[parentIndex].children.splice(childIndex, 1);
    if (copy[parentIndex].children.length === 0) delete copy[parentIndex].children;
    updateField(sectionKey, sectionKey, copy);
  };

  const addSubChild = (parentIndex: number, childIndex: number) => {
    const copy = JSON.parse(JSON.stringify(data));
    if (!copy[parentIndex].children[childIndex].children) {
      copy[parentIndex].children[childIndex].children = [];
    }
    copy[parentIndex].children[childIndex].children.push({ label: "Sub-menu Item", href: "/", hidden: false });
    updateField(sectionKey, sectionKey, copy);
  };

  const removeSubChild = (pi: number, ci: number, si: number) => {
    const copy = JSON.parse(JSON.stringify(data));
    copy[pi].children[ci].children.splice(si, 1);
    if (copy[pi].children[ci].children.length === 0) delete copy[pi].children[ci].children;
    updateField(sectionKey, sectionKey, copy);
  };

  return (
    <div className="space-y-4">
      {data.map((item: any, i: number) => (
        <div key={i} className={`rounded-lg border p-4 ${item.hidden ? "bg-red-50/50 border-red-200" : "bg-gray-50 border-gray-200"}`}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase">Level 1</span>
            <ToggleField
              label="Visible"
              value={!item.hidden}
              onChange={(v: boolean) => {
                const copy = JSON.parse(JSON.stringify(data));
                copy[i].hidden = !v;
                updateField(sectionKey, sectionKey, copy);
              }}
              inline
            />
            <button onClick={() => removeMenuItem(i)} className="ml-auto p-1 text-red-400 hover:text-red-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <FieldInput label="Label" value={item.label} onChange={(v) => updateField(sectionKey, `${i}.label`, v)} />
            <FieldInput label="Href" value={item.href} onChange={(v) => updateField(sectionKey, `${i}.href`, v)} />
          </div>

          {/* Level 2 children */}
          {item.children?.map((child: any, ci: number) => (
            <div key={ci} className={`ml-4 mb-3 border-l-2 pl-4 ${child.hidden ? "border-red-200" : "border-blue-200"}`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold text-blue-400 uppercase">Level 2</span>
                <ToggleField
                  label="Visible"
                  value={!child.hidden}
                  onChange={(v: boolean) => {
                    const copy = JSON.parse(JSON.stringify(data));
                    copy[i].children[ci].hidden = !v;
                    updateField(sectionKey, sectionKey, copy);
                  }}
                  inline
                />
                <button onClick={() => removeChild(i, ci)} className="ml-auto p-1 text-red-400 hover:text-red-600">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <FieldInput label="Label" value={child.label} onChange={(v) => updateField(sectionKey, `${i}.children.${ci}.label`, v)} />
                <FieldInput label="Href" value={child.href} onChange={(v) => updateField(sectionKey, `${i}.children.${ci}.href`, v)} />
              </div>

              {/* Level 3 sub-children */}
              {child.children?.map((sub: any, si: number) => (
                <div key={si} className="ml-4 mb-2 border-l-2 border-purple-200 pl-4">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold text-purple-400 uppercase">Level 3</span>
                    <button onClick={() => removeSubChild(i, ci, si)} className="ml-auto p-1 text-red-400 hover:text-red-600">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FieldInput label="Label" value={sub.label} onChange={(v) => updateField(sectionKey, `${i}.children.${ci}.children.${si}.label`, v)} />
                    <FieldInput label="Href" value={sub.href} onChange={(v) => updateField(sectionKey, `${i}.children.${ci}.children.${si}.href`, v)} />
                  </div>
                </div>
              ))}
              <button onClick={() => addSubChild(i, ci)} className="text-xs text-purple-500 hover:text-purple-700 ml-4 mt-1">
                + Add Sub-menu (Level 3)
              </button>
            </div>
          ))}

          <button onClick={() => addChild(i)} className="text-xs text-blue-500 hover:text-blue-700 ml-4">
            + Add Dropdown Item (Level 2)
          </button>
        </div>
      ))}

      <button
        onClick={addMenuItem}
        className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg border border-dashed border-blue-300"
      >
        <Plus className="h-4 w-4" />
        Add Menu Item
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FIELD INPUT — text / textarea / number
   ═══════════════════════════════════════════════════════════════ */

function FieldInput({
  label,
  value,
  onChange,
  multiline = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-y"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   IMAGE FIELD — upload + preview + URL input
   ═══════════════════════════════════════════════════════════════ */

function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success && data.url) {
        onChange(data.url);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <div className="flex items-start gap-3">
        {/* Preview */}
        <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
          {value ? (
            <img src={value} alt={label} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-gray-300" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          {/* URL input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Image URL or upload..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
            {value && (
              <button onClick={() => onChange("")} className="p-2 text-gray-400 hover:text-red-500">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Upload button */}
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors"
            >
              {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
              {uploading ? "Uploading..." : "Upload Image"}
            </button>
            <span className="text-xs text-gray-400">Max 5MB · JPEG, PNG, WebP, SVG</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CUSTOM PAGES EDITOR — create & manage dynamic pages
   ═══════════════════════════════════════════════════════════════ */

function CustomPagesEditor({
  data,
  sectionKey,
  updateField,
}: {
  data: any[];
  sectionKey: string;
  updateField: (sectionKey: string, path: string, value: any) => void;
}) {
  const [expandedPage, setExpandedPage] = useState<number | null>(null);
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);

  const blockTypes = [
    { value: "hero", label: "Hero Banner" },
    { value: "text", label: "Text Content" },
    { value: "cards", label: "Cards Grid" },
    { value: "faq", label: "FAQ Accordion" },
    { value: "cta", label: "Call to Action" },
    { value: "image-text", label: "Image + Text" },
  ];

  const blockTemplates: Record<string, any> = {
    hero: { type: "hero", hidden: false, heading: "", subtitle: "", backgroundImage: "" },
    text: { type: "text", hidden: false, heading: "", content: "" },
    cards: { type: "cards", hidden: false, heading: "", subtitle: "", items: [{ title: "", description: "", image: "" }] },
    faq: { type: "faq", hidden: false, heading: "", items: [{ question: "", answer: "" }] },
    cta: { type: "cta", hidden: false, heading: "", subtitle: "", buttonText: "Get Started", buttonLink: "/contact", backgroundImage: "" },
    "image-text": { type: "image-text", hidden: false, heading: "", text: "", image: "", imagePosition: "left" },
  };

  const addPage = () => {
    const newPage = {
      slug: "new-page",
      title: "New Page",
      metaDescription: "",
      hidden: false,
      sections: [{ type: "hero", hidden: false, heading: "Page Title", subtitle: "", backgroundImage: "" }],
    };
    updateField(sectionKey, sectionKey, [...data, newPage]);
    setExpandedPage(data.length);
  };

  const removePage = (index: number) => {
    updateField(sectionKey, sectionKey, data.filter((_: any, i: number) => i !== index));
    setExpandedPage(null);
  };

  const addBlock = (pageIndex: number, blockType: string) => {
    const copy = JSON.parse(JSON.stringify(data));
    copy[pageIndex].sections.push(JSON.parse(JSON.stringify(blockTemplates[blockType])));
    updateField(sectionKey, sectionKey, copy);
  };

  const removeBlock = (pageIndex: number, blockIndex: number) => {
    const copy = JSON.parse(JSON.stringify(data));
    copy[pageIndex].sections.splice(blockIndex, 1);
    updateField(sectionKey, sectionKey, copy);
  };

  return (
    <div className="space-y-4">
      {data.length === 0 && (
        <p className="text-sm text-gray-400 italic">No custom pages yet. Click below to create one.</p>
      )}

      {data.map((page: any, pi: number) => (
        <div key={pi} className={`rounded-xl border ${page.hidden ? "border-red-200 bg-red-50/30" : "border-gray-200 bg-white"} overflow-hidden`}>
          <button
            onClick={() => setExpandedPage(expandedPage === pi ? null : pi)}
            className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3 text-left">
              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${page.hidden ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                {page.hidden ? "Hidden" : "Live"}
              </span>
              <div>
                <span className="text-sm font-semibold text-gray-900">{page.title || "Untitled"}</span>
                <span className="ml-2 text-xs text-gray-400">/{page.slug}</span>
              </div>
            </div>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${expandedPage === pi ? "rotate-180" : ""}`} />
          </button>

          {expandedPage === pi && (
            <div className="px-5 pb-5 border-t border-gray-100 space-y-4 pt-4">
              {/* Page settings */}
              <div className="grid grid-cols-2 gap-4">
                <FieldInput label="Page Slug (URL path)" value={page.slug} onChange={(v) => { const c = JSON.parse(JSON.stringify(data)); c[pi].slug = v.toLowerCase().replace(/[^a-z0-9-]/g, "-"); updateField(sectionKey, sectionKey, c); }} />
                <FieldInput label="Page Title" value={page.title} onChange={(v) => { const c = JSON.parse(JSON.stringify(data)); c[pi].title = v; updateField(sectionKey, sectionKey, c); }} />
              </div>
              <FieldInput label="Meta Description" value={page.metaDescription || ""} multiline onChange={(v) => { const c = JSON.parse(JSON.stringify(data)); c[pi].metaDescription = v; updateField(sectionKey, sectionKey, c); }} />
              <div className="flex items-center gap-4">
                <ToggleField label="Page Visible" value={!page.hidden} onChange={(v) => { const c = JSON.parse(JSON.stringify(data)); c[pi].hidden = !v; updateField(sectionKey, sectionKey, c); }} />
                <button onClick={() => removePage(pi)} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Page
                </button>
              </div>

              {/* Sections */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Content Sections</h4>
                <div className="space-y-3">
                  {(page.sections || []).map((block: any, bi: number) => {
                    const blockKey = `${pi}-${bi}`;
                    return (
                      <div key={bi} className={`rounded-lg border ${block.hidden ? "border-red-200 bg-red-50/30" : "border-gray-200 bg-gray-50"} overflow-hidden`}>
                        <button
                          onClick={() => setExpandedBlock(expandedBlock === blockKey ? null : blockKey)}
                          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-700">
                              {block.type}
                            </span>
                            <span className="text-xs text-gray-600">{block.heading || `Section ${bi + 1}`}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ToggleField label="" value={!block.hidden} onChange={(v) => { const c = JSON.parse(JSON.stringify(data)); c[pi].sections[bi].hidden = !v; updateField(sectionKey, sectionKey, c); }} inline />
                            <button onClick={(e) => { e.stopPropagation(); removeBlock(pi, bi); }} className="p-1 text-red-400 hover:text-red-600">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </button>

                        {expandedBlock === blockKey && (
                          <div className="px-4 pb-4 border-t border-gray-200 pt-3 space-y-3">
                            {/* Render fields based on block type */}
                            {block.type === "hero" && (
                              <>
                                <FieldInput label="Heading" value={block.heading || ""} onChange={(v) => { const c = JSON.parse(JSON.stringify(data)); c[pi].sections[bi].heading = v; updateField(sectionKey, sectionKey, c); }} />
                                <FieldInput label="Subtitle" value={block.subtitle || ""} multiline onChange={(v) => { const c = JSON.parse(JSON.stringify(data)); c[pi].sections[bi].subtitle = v; updateField(sectionKey, sectionKey, c); }} />
                                <ImageField label="Background Image" value={block.backgroundImage || ""} onChange={(v) => { const c = JSON.parse(JSON.stringify(data)); c[pi].sections[bi].backgroundImage = v; updateField(sectionKey, sectionKey, c); }} />
                              </>
                            )}
                            {block.type === "text" && (
                              <>
                                <FieldInput label="Heading" value={block.heading || ""} onChange={(v) => { const c = JSON.parse(JSON.stringify(data)); c[pi].sections[bi].heading = v; updateField(sectionKey, sectionKey, c); }} />
                                <FieldInput label="Content" value={block.content || ""} multiline onChange={(v) => { const c = JSON.parse(JSON.stringify(data)); c[pi].sections[bi].content = v; updateField(sectionKey, sectionKey, c); }} />
                              </>
                            )}
                            {block.type === "cards" && (
                              <>
                                <FieldInput label="Heading" value={block.heading || ""} onChange={(v) => { const c = JSON.parse(JSON.stringify(data)); c[pi].sections[bi].heading = v; updateField(sectionKey, sectionKey, c); }} />
                                <FieldInput label="Subtitle" value={block.subtitle || ""} onChange={(v) => { const c = JSON.parse(JSON.stringify(data)); c[pi].sections[bi].subtitle = v; updateField(sectionKey, sectionKey, c); }} />
                                <ArrayEditor data={block.items || []} sectionKey={sectionKey} updateField={(sk, path, val) => { const c = JSON.parse(JSON.stringify(data)); c[pi].sections[bi].items = val; updateField(sectionKey, sectionKey, c); }} path="" />
                              </>
                            )}
                            {block.type === "faq" && (
                              <>
                                <FieldInput label="Heading" value={block.heading || ""} onChange={(v) => { const c = JSON.parse(JSON.stringify(data)); c[pi].sections[bi].heading = v; updateField(sectionKey, sectionKey, c); }} />
                                <ArrayEditor data={block.items || []} sectionKey={sectionKey} updateField={(sk, path, val) => { const c = JSON.parse(JSON.stringify(data)); c[pi].sections[bi].items = val; updateField(sectionKey, sectionKey, c); }} path="" />
                              </>
                            )}
                            {block.type === "cta" && (
                              <>
                                <FieldInput label="Heading" value={block.heading || ""} onChange={(v) => { const c = JSON.parse(JSON.stringify(data)); c[pi].sections[bi].heading = v; updateField(sectionKey, sectionKey, c); }} />
                                <FieldInput label="Subtitle" value={block.subtitle || ""} multiline onChange={(v) => { const c = JSON.parse(JSON.stringify(data)); c[pi].sections[bi].subtitle = v; updateField(sectionKey, sectionKey, c); }} />
                                <div className="grid grid-cols-2 gap-3">
                                  <FieldInput label="Button Text" value={block.buttonText || ""} onChange={(v) => { const c = JSON.parse(JSON.stringify(data)); c[pi].sections[bi].buttonText = v; updateField(sectionKey, sectionKey, c); }} />
                                  <FieldInput label="Button Link" value={block.buttonLink || ""} onChange={(v) => { const c = JSON.parse(JSON.stringify(data)); c[pi].sections[bi].buttonLink = v; updateField(sectionKey, sectionKey, c); }} />
                                </div>
                                <ImageField label="Background Image" value={block.backgroundImage || ""} onChange={(v) => { const c = JSON.parse(JSON.stringify(data)); c[pi].sections[bi].backgroundImage = v; updateField(sectionKey, sectionKey, c); }} />
                              </>
                            )}
                            {block.type === "image-text" && (
                              <>
                                <FieldInput label="Heading" value={block.heading || ""} onChange={(v) => { const c = JSON.parse(JSON.stringify(data)); c[pi].sections[bi].heading = v; updateField(sectionKey, sectionKey, c); }} />
                                <FieldInput label="Text" value={block.text || ""} multiline onChange={(v) => { const c = JSON.parse(JSON.stringify(data)); c[pi].sections[bi].text = v; updateField(sectionKey, sectionKey, c); }} />
                                <ImageField label="Image" value={block.image || ""} onChange={(v) => { const c = JSON.parse(JSON.stringify(data)); c[pi].sections[bi].image = v; updateField(sectionKey, sectionKey, c); }} />
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">Image Position</label>
                                  <select
                                    value={block.imagePosition || "left"}
                                    onChange={(e) => { const c = JSON.parse(JSON.stringify(data)); c[pi].sections[bi].imagePosition = e.target.value; updateField(sectionKey, sectionKey, c); }}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                  >
                                    <option value="left">Image Left</option>
                                    <option value="right">Image Right</option>
                                  </select>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Add section button with type picker */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {blockTypes.map((bt) => (
                    <button
                      key={bt.value}
                      onClick={() => addBlock(pi, bt.value)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 border border-dashed border-blue-300 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      {bt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={addPage}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg border-2 border-dashed border-blue-300 transition-colors w-full justify-center"
      >
        <Plus className="h-4 w-4" />
        Create New Page
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TOGGLE FIELD — boolean on/off switch
   ═══════════════════════════════════════════════════════════════ */

function ToggleField({
  label,
  value,
  onChange,
  inline = false,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  inline?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 ${inline ? "" : "py-1"}`}>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${
          value ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            value ? "translate-x-[18px]" : "translate-x-[3px]"
          }`}
        />
      </button>
      <span className={`text-xs font-medium ${value ? "text-gray-700" : "text-red-500"}`}>
        {inline ? (value ? "On" : "Off") : label}
      </span>
    </div>
  );
}
