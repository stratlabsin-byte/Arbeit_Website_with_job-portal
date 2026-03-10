"use client";

import Link from "next/link";
import { useState } from "react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useCmsContent } from "@/hooks/useCmsContent";
import {
  ArrowRight,
  ChevronDown,
  Shield,
  Calculator,
  FileText,
  Clock,
  CheckCircle2,
  Users,
  Building2,
  BarChart3,
  Lock,
  Scale,
  BadgeCheck,
  Banknote,
  ClipboardCheck,
  ServerCog,
  Headphones,
  TrendingUp,
  Globe,
  Zap,
  AlertTriangle,
  Landmark,
} from "lucide-react";

/* ───── Icon Map for CMS ───── */
const iconMap: Record<string, any> = {
  Calculator, Scale, FileText, ClipboardCheck, ServerCog, Headphones,
  Shield, Clock, Lock, Zap, Landmark, Banknote, BadgeCheck, Users,
  Building2, AlertTriangle,
};

/* ───── Core Services ───── */
const coreServices = [
  {
    icon: Calculator,
    title: "Payroll Processing",
    description:
      "End-to-end payroll management — from salary computation, tax deductions, and reimbursements to payslip generation and bank transfers. Accurate, on-time, every cycle.",
    features: ["Multi-entity payroll", "Automated tax calculations", "Digital payslips", "Bank file generation"],
  },
  {
    icon: Scale,
    title: "Statutory Compliance",
    description:
      "Stay compliant with India's complex labour laws. We manage PF, ESI, PT, LWF, gratuity, and all statutory filings — so you never miss a deadline or attract penalties.",
    features: ["PF & ESI management", "Professional Tax filing", "Labour Welfare Fund", "Gratuity administration"],
  },
  {
    icon: FileText,
    title: "Tax & TDS Management",
    description:
      "Comprehensive income tax management for your workforce — investment declarations, proof verification, Form 16 generation, and quarterly TDS returns filed on time.",
    features: ["Investment declaration portal", "TDS computation & filing", "Form 16 / 16A generation", "Tax optimisation advisory"],
  },
  {
    icon: ClipboardCheck,
    title: "Labour Law Compliance",
    description:
      "Navigate central and state-level labour regulations with confidence. We handle shop & establishment registrations, contract labour compliance, and periodic returns.",
    features: ["Shop & Establishment Act", "Contract Labour Act", "Minimum Wages Act", "State-specific regulations"],
  },
  {
    icon: ServerCog,
    title: "HR Technology & HRMS",
    description:
      "Cloud-based payroll and HRMS platforms with employee self-service portals, leave management, attendance integration, and real-time dashboards for your HR team.",
    features: ["Employee self-service portal", "Leave & attendance integration", "Real-time analytics", "Mobile-friendly access"],
  },
  {
    icon: Headphones,
    title: "Employee Helpdesk",
    description:
      "Dedicated query resolution for your employees — payslip inquiries, tax questions, reimbursement status, and compliance-related concerns handled promptly.",
    features: ["Dedicated support team", "Multi-channel access", "SLA-driven resolution", "Knowledge base & FAQs"],
  },
];

/* ───── Why outsource ───── */
const whyOutsource = [
  {
    icon: Shield,
    title: "Zero Compliance Risk",
    stat: "100%",
    description: "On-time statutory filings across all entities, ensuring zero penalties and complete audit readiness.",
  },
  {
    icon: Clock,
    title: "On-Time Every Cycle",
    stat: "99.9%",
    description: "Payroll processed accurately and disbursed on schedule — no delays, no discrepancies.",
  },
  {
    icon: Lock,
    title: "Data Security",
    stat: "ISO 27001",
    description: "Enterprise-grade encryption, role-based access, and SOC-2 compliant infrastructure for your sensitive data.",
  },
  {
    icon: Zap,
    title: "Cost Efficiency",
    stat: "40%",
    description: "Reduce payroll processing costs by up to 40% compared to in-house management — with higher accuracy.",
  },
];

/* ───── Compliance areas ───── */
const complianceAreas = [
  { name: "Provident Fund (PF)", icon: Landmark },
  { name: "Employee State Insurance (ESI)", icon: Shield },
  { name: "Professional Tax (PT)", icon: Banknote },
  { name: "Tax Deducted at Source (TDS)", icon: Calculator },
  { name: "Labour Welfare Fund (LWF)", icon: Users },
  { name: "Gratuity Act", icon: BadgeCheck },
  { name: "Shops & Establishment Act", icon: Building2 },
  { name: "Contract Labour Act", icon: FileText },
  { name: "Minimum Wages Act", icon: Scale },
  { name: "Payment of Wages Act", icon: Banknote },
  { name: "Maternity Benefit Act", icon: Users },
  { name: "Sexual Harassment (POSH)", icon: AlertTriangle },
];

/* ───── FAQ data ───── */
const faqs = [
  {
    question: "What does payroll outsourcing include?",
    answer:
      "Our payroll outsourcing covers the complete payroll lifecycle — salary computation, statutory deductions (PF, ESI, PT, TDS), reimbursement processing, payslip generation, bank file creation, and all related statutory filings. We also provide employee self-service portals and dedicated helpdesk support.",
  },
  {
    question: "How do you ensure compliance with changing labour laws?",
    answer:
      "Our compliance team continuously monitors regulatory updates across central and state governments. We maintain a proprietary compliance calendar and proactively update all calculations, forms, and filing processes. Clients receive advance alerts about any regulatory changes that impact their workforce.",
  },
  {
    question: "Is our employee data secure?",
    answer:
      "Absolutely. We follow ISO 27001 standards with enterprise-grade encryption (AES-256), role-based access controls, multi-factor authentication, and regular security audits. Our infrastructure is SOC-2 compliant and we maintain strict data privacy agreements with all clients.",
  },
  {
    question: "Can you handle multi-state and multi-entity payroll?",
    answer:
      "Yes. We manage payroll across all Indian states with state-specific statutory compliance — PT rates, LWF contributions, shop & establishment rules, and local labour regulations. Multi-entity structures with different pay structures, policies, and compliance requirements are our speciality.",
  },
  {
    question: "How quickly can you onboard our company?",
    answer:
      "Standard onboarding takes 2-4 weeks depending on complexity. This includes data migration, system setup, compliance registration verification, employee communication, and a parallel payroll run to ensure accuracy before going live.",
  },
  {
    question: "What reports and analytics do you provide?",
    answer:
      "Comprehensive dashboards and reports including payroll summaries, cost-to-company breakdowns, statutory liability reports, headcount analytics, attrition-linked payroll trends, and audit-ready compliance documentation. All reports are available in real-time on our HRMS platform.",
  },
];

/* ───── Process ───── */
const processSteps = [
  { number: "01", title: "Data Collection", description: "Attendance, leave, variable pay inputs, and new joiner/exit data collected via portal or integration." },
  { number: "02", title: "Payroll Processing", description: "Salary computation, statutory deductions, reimbursements, arrears, and full & final settlements." },
  { number: "03", title: "Validation & Approval", description: "Multi-level validation with variance analysis. Client sign-off before disbursement." },
  { number: "04", title: "Disbursement", description: "Salary credited to employee accounts, payslips generated, and all statutory challans prepared." },
  { number: "05", title: "Statutory Filing", description: "PF/ESI returns filed, TDS deposited, PT/LWF paid, and all compliance documentation archived." },
  { number: "06", title: "Reporting & Support", description: "MIS reports delivered, employee queries resolved, and month-end reconciliation completed." },
];

const defaultPayrollCms = {
  heroHeading: "Payroll & Compliance Outsourcing",
  heroHighlight: "Compliance",
  heroSubtitle: "Tech-driven payroll processing and end-to-end statutory compliance management. Eliminate errors, avoid penalties, and let your HR team focus on what matters most — your people.",
  heroImage: "",
  introHeading: "Hassle-Free Payroll, Total Compliance",
  introText: "Managing payroll and statutory compliance in India is complex. Arbeit takes this burden off your shoulders.",
  introImage: "",
  services: [
    { icon: "Calculator", title: "Payroll Processing", description: "End-to-end payroll management — from salary computation, tax deductions, and reimbursements to payslip generation and bank transfers. Accurate, on-time, every cycle.", features: ["Multi-entity payroll", "Automated tax calculations", "Digital payslips", "Bank file generation"] },
    { icon: "Scale", title: "Statutory Compliance", description: "Stay compliant with India's complex labour laws. We manage PF, ESI, PT, LWF, gratuity, and all statutory filings — so you never miss a deadline or attract penalties.", features: ["PF & ESI management", "Professional Tax filing", "Labour Welfare Fund", "Gratuity administration"] },
    { icon: "FileText", title: "Tax & TDS Management", description: "Comprehensive income tax management for your workforce — investment declarations, proof verification, Form 16 generation, and quarterly TDS returns filed on time.", features: ["Investment declaration portal", "TDS computation & filing", "Form 16 / 16A generation", "Tax optimisation advisory"] },
    { icon: "ClipboardCheck", title: "Labour Law Compliance", description: "Navigate central and state-level labour regulations with confidence. We handle shop & establishment registrations, contract labour compliance, and periodic returns.", features: ["Shop & Establishment Act", "Contract Labour Act", "Minimum Wages Act", "State-specific regulations"] },
    { icon: "ServerCog", title: "HR Technology & HRMS", description: "Cloud-based payroll and HRMS platforms with employee self-service portals, leave management, attendance integration, and real-time dashboards for your HR team.", features: ["Employee self-service portal", "Leave & attendance integration", "Real-time analytics", "Mobile-friendly access"] },
    { icon: "Headphones", title: "Employee Helpdesk", description: "Dedicated query resolution for your employees — payslip inquiries, tax questions, reimbursement status, and compliance-related concerns handled promptly.", features: ["Dedicated support team", "Multi-channel access", "SLA-driven resolution", "Knowledge base & FAQs"] },
  ],
  whyOutsource: [
    { icon: "Shield", title: "Zero Compliance Risk", stat: "100%", description: "On-time statutory filings across all entities, ensuring zero penalties and complete audit readiness." },
    { icon: "Clock", title: "On-Time Every Cycle", stat: "99.9%", description: "Payroll processed accurately and disbursed on schedule — no delays, no discrepancies." },
    { icon: "Lock", title: "Data Security", stat: "ISO 27001", description: "Enterprise-grade encryption, role-based access, and SOC-2 compliant infrastructure for your sensitive data." },
    { icon: "Zap", title: "Cost Efficiency", stat: "40%", description: "Reduce payroll processing costs by up to 40% compared to in-house management — with higher accuracy." },
  ],
  complianceAreas: [
    { name: "Provident Fund (PF)", icon: "Landmark" },
    { name: "Employee State Insurance (ESI)", icon: "Shield" },
    { name: "Professional Tax (PT)", icon: "Banknote" },
    { name: "Tax Deducted at Source (TDS)", icon: "Calculator" },
    { name: "Labour Welfare Fund (LWF)", icon: "Users" },
    { name: "Gratuity Act", icon: "BadgeCheck" },
    { name: "Shops & Establishment Act", icon: "Building2" },
    { name: "Contract Labour Act", icon: "FileText" },
    { name: "Minimum Wages Act", icon: "Scale" },
    { name: "Payment of Wages Act", icon: "Banknote" },
    { name: "Maternity Benefit Act", icon: "Users" },
    { name: "Sexual Harassment (POSH)", icon: "AlertTriangle" },
  ],
  faqs: [
    { question: "What does payroll outsourcing include?", answer: "Our payroll outsourcing covers the complete payroll lifecycle — salary computation, statutory deductions (PF, ESI, PT, TDS), reimbursement processing, payslip generation, bank file creation, and all related statutory filings. We also provide employee self-service portals and dedicated helpdesk support." },
    { question: "How do you ensure compliance with changing labour laws?", answer: "Our compliance team continuously monitors regulatory updates across central and state governments. We maintain a proprietary compliance calendar and proactively update all calculations, forms, and filing processes. Clients receive advance alerts about any regulatory changes that impact their workforce." },
    { question: "Is our employee data secure?", answer: "Absolutely. We follow ISO 27001 standards with enterprise-grade encryption (AES-256), role-based access controls, multi-factor authentication, and regular security audits. Our infrastructure is SOC-2 compliant and we maintain strict data privacy agreements with all clients." },
    { question: "Can you handle multi-state and multi-entity payroll?", answer: "Yes. We manage payroll across all Indian states with state-specific statutory compliance — PT rates, LWF contributions, shop & establishment rules, and local labour regulations. Multi-entity structures with different pay structures, policies, and compliance requirements are our speciality." },
    { question: "How quickly can you onboard our company?", answer: "Standard onboarding takes 2-4 weeks depending on complexity. This includes data migration, system setup, compliance registration verification, employee communication, and a parallel payroll run to ensure accuracy before going live." },
    { question: "What reports and analytics do you provide?", answer: "Comprehensive dashboards and reports including payroll summaries, cost-to-company breakdowns, statutory liability reports, headcount analytics, attrition-linked payroll trends, and audit-ready compliance documentation. All reports are available in real-time on our HRMS platform." },
  ],
  processSteps: [
    { number: "01", title: "Data Collection", description: "Attendance, leave, variable pay inputs, and new joiner/exit data collected via portal or integration." },
    { number: "02", title: "Payroll Processing", description: "Salary computation, statutory deductions, reimbursements, arrears, and full & final settlements." },
    { number: "03", title: "Validation & Approval", description: "Multi-level validation with variance analysis. Client sign-off before disbursement." },
    { number: "04", title: "Disbursement", description: "Salary credited to employee accounts, payslips generated, and all statutory challans prepared." },
    { number: "05", title: "Statutory Filing", description: "PF/ESI returns filed, TDS deposited, PT/LWF paid, and all compliance documentation archived." },
    { number: "06", title: "Reporting & Support", description: "MIS reports delivered, employee queries resolved, and month-end reconciliation completed." },
  ],
};

export default function PayrollCompliancePage() {
  const cms = useCmsContent<any>("payrollPage", defaultPayrollCms);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  if (cms.pageHidden) {
    return (
      <section className="py-32 text-center">
        <div className="container-main">
          <h1 className="text-3xl font-bold text-gray-900">Page Not Available</h1>
          <p className="mt-4 text-gray-600">This page is currently unavailable. Please check back later.</p>
          <a href="/" className="mt-8 inline-block px-6 py-3 bg-[#3147FF] text-white rounded-lg font-semibold hover:bg-[#2a3de6] transition-colors">
            Go to Homepage
          </a>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* ════════ HERO ════════ */}
      <section className="relative overflow-hidden bg-[#0A102F] min-h-[560px] flex items-center">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#3147FF]/10 blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#3147FF]/8 blur-3xl translate-y-1/2 -translate-x-1/3" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.04]" />
        {cms.heroImage && <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${cms.heroImage})` }} />}

        <div className="container-main relative z-10 py-24 sm:py-32 lg:py-40">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection animation="fade-up">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3147FF]/15 text-[#7B8FFF] text-sm font-medium mb-6">
                <Calculator className="h-4 w-4" />
                Payroll & Compliance Solutions
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-bold text-white leading-[1.12] tracking-tight">
                {cms.heroHighlight && cms.heroHeading
                  ? cms.heroHeading.split(cms.heroHighlight).map((part: string, idx: number, arr: string[]) =>
                      idx < arr.length - 1 ? (
                        <span key={idx}>{part}<span className="text-[#3147FF]">{cms.heroHighlight}</span></span>
                      ) : (
                        <span key={idx}>{part}</span>
                      )
                    )
                  : <>Payroll & <span className="text-[#3147FF]">Compliance</span> Outsourcing</>}
              </h1>
              <p className="mt-6 text-lg text-gray-300 leading-relaxed max-w-xl">
                {cms.heroSubtitle || defaultPayrollCms.heroSubtitle}
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-[42px] py-[18px] rounded-[45px] bg-[#3147FF] text-white text-[15px] font-semibold hover:bg-[#2a3de6] transition-colors"
                >
                  Request a Proposal
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#services"
                  className="inline-flex items-center gap-2 px-[42px] py-[18px] rounded-[45px] border-2 border-white/20 text-white text-[15px] font-semibold hover:bg-white/10 transition-colors"
                >
                  View Services
                </a>
              </div>
            </AnimatedSection>

            {/* Hero stats card */}
            <div className="hidden lg:block">
              <AnimatedSection animation="fade-up" delay={200}>
                <div className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { icon: Building2, value: "500+", label: "Companies Managed" },
                      { icon: Users, value: "1L+", label: "Payslips Monthly" },
                      { icon: Globe, value: "28", label: "States Covered" },
                      { icon: TrendingUp, value: "99.9%", label: "Accuracy Rate" },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center p-4">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#3147FF]/20 text-[#3147FF] mb-3">
                          <stat.icon className="h-6 w-6" />
                        </div>
                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                        <p className="mt-1 text-sm text-gray-400">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ INTRO SECTION ════════ */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection animation="fade-up">
              <span className="text-[#3147FF] text-sm font-semibold uppercase tracking-wider">About Our Service</span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#0A102F] leading-tight">
                {cms.introHeading || "Hassle-Free Payroll,"}{" "}
                <span className="text-[#3147FF]">Total Compliance</span>
              </h2>
              <p className="mt-6 text-gray-600 leading-relaxed text-[17px]">
                {cms.introText || "Managing payroll and statutory compliance in India is complex. Arbeit takes this burden off your shoulders."}
              </p>
              {cms.introImage && (
                <img src={cms.introImage} alt="Payroll" className="mt-4 rounded-xl w-full max-h-60 object-cover" />
              )}
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  "Zero penalties guaranteed",
                  "Multi-state compliance",
                  "Dedicated account manager",
                  "Real-time dashboards",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#3147FF] shrink-0" />
                    <span className="text-sm font-medium text-[#0A102F]">{item}</span>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={150}>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0A102F] rounded-2xl p-6 text-white">
                  <Shield className="h-8 w-8 text-[#3147FF]" />
                  <p className="mt-4 text-3xl font-bold">100%</p>
                  <p className="mt-1 text-sm text-gray-300">Compliance Rate</p>
                </div>
                <div className="bg-[#3147FF] rounded-2xl p-6 text-white">
                  <Clock className="h-8 w-8 text-white/80" />
                  <p className="mt-4 text-3xl font-bold">10+</p>
                  <p className="mt-1 text-sm text-white/80">Years Experience</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 col-span-2">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#3147FF]/10 text-[#3147FF]">
                      <BarChart3 className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-[#0A102F]">Technology + Expertise</p>
                      <p className="text-sm text-gray-500">Cloud HRMS with dedicated compliance professionals</p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ════════ CORE SERVICES ════════ */}
      <section id="services" className="py-20 sm:py-28 bg-gray-50">
        <div className="container-main">
          <AnimatedSection animation="fade-up">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-[#3147FF] text-sm font-semibold uppercase tracking-wider">Our Services</span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#0A102F]">
                End-to-End Payroll & Compliance Management
              </h2>
              <p className="mt-4 text-gray-600 text-lg">
                From salary processing to statutory filings — we manage every aspect of your
                payroll operations with precision and technology.
              </p>
            </div>
          </AnimatedSection>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {(cms.services || defaultPayrollCms.services).map((service: any, index: number) => {
              const Icon = iconMap[service.icon] || Calculator;
              return (
                <AnimatedSection key={service.title} animation="fade-up" delay={index * 80}>
                  <div className="bg-white rounded-2xl p-8 h-full border border-gray-100 hover:border-[#3147FF]/20 hover:shadow-xl transition-all duration-300 group">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3147FF]/10 text-[#3147FF] group-hover:bg-[#3147FF] group-hover:text-white transition-colors duration-300">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="mt-6 text-xl font-bold text-[#0A102F]">{service.title}</h3>
                    <p className="mt-3 text-gray-600 leading-relaxed text-[15px]">{service.description}</p>
                    <ul className="mt-5 space-y-2">
                      {service.features.map((feature: string) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="h-4 w-4 text-[#3147FF] shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════ WHY OUTSOURCE ════════ */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="container-main">
          <AnimatedSection animation="fade-up">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-[#3147FF] text-sm font-semibold uppercase tracking-wider">Why Outsource</span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#0A102F]">
                The Arbeit Advantage
              </h2>
              <p className="mt-4 text-gray-600 text-lg">
                Why 500+ companies trust Arbeit for their payroll and compliance needs.
              </p>
            </div>
          </AnimatedSection>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(cms.whyOutsource || defaultPayrollCms.whyOutsource).map((item: any, index: number) => {
              const Icon = iconMap[item.icon] || Shield;
              return (
                <AnimatedSection key={item.title} animation="fade-up" delay={index * 80}>
                  <div className="relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#3147FF]/20 hover:shadow-lg transition-all duration-300 text-center h-full group">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3147FF]/10 text-[#3147FF] group-hover:bg-[#3147FF] group-hover:text-white transition-colors duration-300">
                      <Icon className="h-7 w-7" />
                    </div>
                    <p className="mt-4 text-3xl font-bold text-[#3147FF]">{item.stat}</p>
                    <h3 className="mt-2 text-lg font-semibold text-[#0A102F]">{item.title}</h3>
                    <p className="mt-3 text-sm text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════ COMPLIANCE COVERAGE ════════ */}
      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection animation="fade-up">
              <span className="text-[#3147FF] text-sm font-semibold uppercase tracking-wider">Compliance Coverage</span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#0A102F] leading-tight">
                Every Labour Law,{" "}
                <span className="text-[#3147FF]">Every State</span>
              </h2>
              <p className="mt-6 text-gray-600 leading-relaxed text-[17px]">
                India&apos;s labour law landscape is one of the most complex in the world —
                with 40+ central acts and hundreds of state-specific rules. Our compliance
                engine tracks every regulation, deadline, and rate change so you don&apos;t have to.
              </p>
              <Link
                href="/contact"
                className="mt-8 inline-flex items-center gap-2 px-[42px] py-[18px] rounded-[45px] bg-[#3147FF] text-white text-[15px] font-semibold hover:bg-[#2a3de6] transition-colors"
              >
                Get a Compliance Audit
                <ArrowRight className="h-4 w-4" />
              </Link>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={150}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(cms.complianceAreas || defaultPayrollCms.complianceAreas).map((area: any) => {
                  const Icon = iconMap[area.icon] || FileText;
                  return (
                    <div
                      key={area.name}
                      className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl bg-white border border-gray-100 hover:border-[#3147FF]/30 hover:shadow-sm transition-all duration-200"
                    >
                      <Icon className="h-4 w-4 text-[#3147FF] shrink-0" />
                      <span className="text-xs font-medium text-[#0A102F] leading-tight">{area.name}</span>
                    </div>
                  );
                })}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ════════ PROCESS ════════ */}
      <section className="py-20 sm:py-28 bg-[#0A102F] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#3147FF]/8 blur-3xl" />
        <div className="container-main relative z-10">
          <AnimatedSection animation="fade-up">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-[#3147FF] text-sm font-semibold uppercase tracking-wider">Monthly Cycle</span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
                How Your Payroll Gets Processed
              </h2>
              <p className="mt-4 text-gray-400 text-lg">
                A streamlined 6-step process executed with precision every single month.
              </p>
            </div>
          </AnimatedSection>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(cms.processSteps || defaultPayrollCms.processSteps).map((step: any, index: number) => (
              <AnimatedSection key={step.number} animation="fade-up" delay={index * 80}>
                <div className="relative bg-white/[0.05] backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/[0.08] transition-colors duration-300 h-full">
                  <span className="text-5xl font-bold text-[#3147FF]/20">{step.number}</span>
                  <h3 className="mt-3 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-gray-400 leading-relaxed text-sm">{step.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ FAQ ════════ */}
      <section className="py-20 sm:py-28 bg-[#F9FAFB]">
        <div className="container-main">
          <AnimatedSection animation="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-[#3147FF] text-sm font-semibold uppercase tracking-wider">FAQs</span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#0A102F]">
                Frequently Asked Questions
              </h2>
            </div>
          </AnimatedSection>

          <div className="max-w-3xl mx-auto space-y-4">
            {(cms.faqs || defaultPayrollCms.faqs).map((faq: any, index: number) => (
              <AnimatedSection key={index} animation="fade-up" delay={index * 60}>
                <div
                  className={`bg-white rounded-xl border transition-all duration-300 ${
                    openFaq === index ? "border-[#3147FF]/30 shadow-md" : "border-gray-200"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="flex items-center justify-between w-full px-6 py-5 text-left"
                  >
                    <span className="text-[16px] font-semibold text-[#0A102F] pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-[#3147FF] shrink-0 transition-transform duration-300 ${
                        openFaq === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openFaq === index ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-6 pb-5">
                      <p className="text-[15px] text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ CTA ════════ */}
      <section className="py-20 sm:py-24 bg-gradient-to-r from-[#3147FF] to-[#1a2eb3] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.06]" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="container-main relative z-10 text-center">
          <AnimatedSection animation="fade-up">
            <Calculator className="h-12 w-12 text-white/60 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Ready to Simplify Your Payroll?
            </h2>
            <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
              Let Arbeit handle your payroll and compliance so you can focus on growing your business.
              Get a free assessment today.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-[42px] py-[18px] rounded-[45px] bg-white text-[#3147FF] text-[15px] font-semibold hover:bg-gray-100 transition-colors"
              >
                Get a Free Assessment
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/HR-Advisory-Services"
                className="inline-flex items-center gap-2 px-[42px] py-[18px] rounded-[45px] border-2 border-white/30 text-white text-[15px] font-semibold hover:bg-white/10 transition-colors"
              >
                Explore HR Advisory
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
