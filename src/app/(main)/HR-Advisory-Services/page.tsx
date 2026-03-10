"use client";

import Link from "next/link";
import { useState } from "react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useCmsContent } from "@/hooks/useCmsContent";
import {
  ArrowRight,
  ChevronDown,
  Building2,
  Users,
  Target,
  BarChart3,
  Shield,
  Lightbulb,
  TrendingUp,
  CheckCircle2,
  Layers,
  Settings,
  Compass,
  Award,
  GitBranch,
  DollarSign,
  FileText,
  Cog,
} from "lucide-react";

/* ───── Icon map for CMS-driven rendering ───── */
const iconMap: Record<string, any> = {
  GitBranch,
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Cog,
  Compass,
  Award,
  Layers,
  Settings,
};

/* ───── CMS defaults (all page content) ───── */
const defaultHrCms = {
  heroHeading: "HR Advisory Services",
  heroHighlight: "Services",
  heroSubtitle:
    "Transform your people strategy with expert HR advisory. From organisation design and workforce planning to compensation strategy and business transformation — Arbeit delivers actionable frameworks that drive real results.",
  heroImage: "",
  services: [
    {
      icon: "GitBranch",
      title: "Organisation Design",
      description:
        "Restructure your organisation for agility and growth. We design optimal reporting structures, role clarity frameworks, and spans of control aligned to your business strategy.",
      points: ["Org structure assessment", "Role mapping & grading", "Change management support"],
    },
    {
      icon: "Users",
      title: "Workforce Planning",
      description:
        "Align your talent pipeline with future business needs. Our data-driven workforce planning identifies skill gaps, succession risks, and hiring priorities across functions.",
      points: ["Demand-supply analysis", "Succession planning", "Skill gap assessment"],
    },
    {
      icon: "FileText",
      title: "HR Policy & Compliance",
      description:
        "Build robust HR policies that attract talent, ensure compliance, and promote fairness. We benchmark against industry best practices and local labour laws.",
      points: ["Policy design & audit", "Statutory compliance", "Employee handbook creation"],
    },
    {
      icon: "DollarSign",
      title: "Compensation & Benefits Strategy",
      description:
        "Design competitive, equitable pay structures that retain top talent. We conduct market benchmarking and build total reward frameworks aligned to your EVP.",
      points: ["Salary benchmarking", "Pay equity analysis", "Incentive programme design"],
    },
    {
      icon: "TrendingUp",
      title: "Business Transformation",
      description:
        "Navigate mergers, restructurings, and digital transformation with people at the centre. We ensure your workforce strategy supports every phase of change.",
      points: ["M&A people integration", "Digital HR transformation", "Culture alignment"],
    },
    {
      icon: "Cog",
      title: "HR Technology Advisory",
      description:
        "Select and implement the right HRMS, ATS, and people analytics platforms. We evaluate, customise, and deploy HR tech that scales with your organisation.",
      points: ["HRMS selection & setup", "Process automation", "Analytics & dashboards"],
    },
  ],
  whyChoose: [
    {
      icon: "Compass",
      title: "Strategic Perspective",
      description:
        "We connect HR initiatives to business outcomes — not just best practices, but right practices for your context.",
    },
    {
      icon: "Award",
      title: "Deep Domain Expertise",
      description:
        "Our consultants bring 15+ years of HR leadership experience across industries including IT, BFSI, manufacturing, and healthcare.",
    },
    {
      icon: "Layers",
      title: "End-to-End Delivery",
      description:
        "From diagnosis to implementation and change management — we stay with you through every phase of the transformation journey.",
    },
    {
      icon: "Settings",
      title: "Customised Solutions",
      description:
        "No cookie-cutter frameworks. Every recommendation is tailored to your company's size, culture, industry, and growth stage.",
    },
  ],
  faqs: [
    {
      question: "What are HR Advisory Services?",
      answer:
        "HR Advisory Services encompass strategic consulting that helps organisations optimise their people practices. This includes organisation design, workforce planning, HR policy development, compensation strategy, and business transformation — all aligned to drive measurable business outcomes.",
    },
    {
      question: "Who needs HR Advisory Services?",
      answer:
        "Any organisation going through growth, restructuring, mergers, digital transformation, or simply looking to professionalise their HR function. From startups scaling rapidly to established enterprises modernising their people practices — our advisory services adapt to your stage and needs.",
    },
    {
      question: "How is HR Advisory different from HR Outsourcing?",
      answer:
        "HR Advisory is strategic and consultative — we help you design the right frameworks, policies, and structures. HR Outsourcing, on the other hand, involves us managing day-to-day HR operations on your behalf. Many clients start with advisory and move to a hybrid model.",
    },
    {
      question: "What industries do you specialise in?",
      answer:
        "Our HR Advisory practice has deep expertise across Information Technology, Banking & Financial Services, Healthcare & Life Sciences, Manufacturing, E-commerce & Retail, and Telecom. We leverage industry-specific benchmarks and regulatory knowledge for every engagement.",
    },
    {
      question: "How long does a typical HR Advisory engagement last?",
      answer:
        "It depends on scope. A focused policy audit may take 4-6 weeks, while a full organisation redesign or M&A integration programme could span 3-6 months. We offer both project-based and retainer models to suit your needs.",
    },
    {
      question: "Do you help with implementation or just strategy?",
      answer:
        "We go beyond strategy. Our team supports implementation, change management, stakeholder communication, and post-implementation reviews. We measure success by adoption and impact, not just the quality of the recommendation deck.",
    },
  ],
  processSteps: [
    { number: "01", title: "Discovery & Diagnosis", description: "Stakeholder interviews, data analysis, and current-state assessment to understand your challenges." },
    { number: "02", title: "Benchmarking", description: "Industry and peer-group benchmarking to identify gaps and opportunities against best practices." },
    { number: "03", title: "Solution Design", description: "Collaborative development of frameworks, policies, and structures tailored to your context." },
    { number: "04", title: "Implementation Support", description: "Hands-on support for rollout, change management, training, and stakeholder alignment." },
    { number: "05", title: "Impact Measurement", description: "Post-implementation reviews, KPI tracking, and continuous improvement recommendations." },
  ],
};

export default function HRAdvisoryServicesPage() {
  const cms = useCmsContent<any>("hrAdvisoryPage", defaultHrCms);
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
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#3147FF]/10 blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#3147FF]/8 blur-3xl translate-y-1/2 -translate-x-1/3" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.04]" />
        {cms.heroImage && <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${cms.heroImage})` }} />}

        <div className="container-main relative z-10 py-24 sm:py-32 lg:py-40">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection animation="fade-up">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3147FF]/15 text-[#7B8FFF] text-sm font-medium mb-6">
                <Lightbulb className="h-4 w-4" />
                Strategic HR Consulting
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
                  : <>HR Advisory <span className="text-[#3147FF]">Services</span></>}
              </h1>
              <p className="mt-6 text-lg text-gray-300 leading-relaxed max-w-xl">
                {cms.heroSubtitle || defaultHrCms.heroSubtitle}
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-[42px] py-[18px] rounded-[45px] bg-[#3147FF] text-white text-[15px] font-semibold hover:bg-[#2a3de6] transition-colors"
                >
                  Schedule a Consultation
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#services"
                  className="inline-flex items-center gap-2 px-[42px] py-[18px] rounded-[45px] border-2 border-white/20 text-white text-[15px] font-semibold hover:bg-white/10 transition-colors"
                >
                  Explore Services
                </a>
              </div>
            </AnimatedSection>

            {/* Hero right — key metrics */}
            <div className="hidden lg:block">
              <AnimatedSection animation="fade-up" delay={200}>
                <div className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { icon: Building2, value: "200+", label: "Organisations Advised" },
                      { icon: Users, value: "50K+", label: "Employees Impacted" },
                      { icon: Target, value: "15+", label: "Industries Served" },
                      { icon: BarChart3, value: "95%", label: "Client Satisfaction" },
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

      {/* ════════ SERVICES GRID ════════ */}
      <section id="services" className="py-20 sm:py-28 bg-white">
        <div className="container-main">
          <AnimatedSection animation="fade-up">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-[#3147FF] text-sm font-semibold uppercase tracking-wider">What We Offer</span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#0A102F]">
                Comprehensive HR Advisory Solutions
              </h2>
              <p className="mt-4 text-gray-600 text-lg">
                Our advisory practice covers every dimension of the people function —
                helping you build an HR framework that attracts, develops, and retains talent.
              </p>
            </div>
          </AnimatedSection>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {(cms.services || defaultHrCms.services).map((service: any, index: number) => {
              const Icon = iconMap[service.icon] || Shield;
              return (
                <AnimatedSection key={service.title} animation="fade-up" delay={index * 80}>
                  <div className="bg-white rounded-2xl p-8 h-full border border-gray-100 hover:border-[#3147FF]/20 hover:shadow-xl transition-all duration-300 group">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3147FF]/10 text-[#3147FF] group-hover:bg-[#3147FF] group-hover:text-white transition-colors duration-300">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="mt-6 text-xl font-bold text-[#0A102F]">{service.title}</h3>
                    <p className="mt-3 text-gray-600 leading-relaxed text-[15px]">{service.description}</p>
                    <ul className="mt-5 space-y-2">
                      {service.points.map((point: string) => (
                        <li key={point} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="h-4 w-4 text-[#3147FF] shrink-0" />
                          {point}
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

      {/* ════════ WHY CHOOSE ARBEIT ════════ */}
      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection animation="fade-up">
              <span className="text-[#3147FF] text-sm font-semibold uppercase tracking-wider">Why Arbeit</span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#0A102F] leading-tight">
                Strategic HR Consulting That{" "}
                <span className="text-[#3147FF]">Delivers Results</span>
              </h2>
              <p className="mt-6 text-gray-600 leading-relaxed text-[17px]">
                We don&apos;t just advise — we partner. Our consultants embed within your
                team, understand your culture, and co-create solutions that your people
                actually adopt. Every recommendation is backed by data, benchmarked against
                industry standards, and designed for measurable impact.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {["BFSI", "IT & SaaS", "Healthcare", "Manufacturing", "Retail", "Telecom"].map((tag) => (
                  <span key={tag} className="px-4 py-2 rounded-full bg-[#3147FF]/8 text-[#3147FF] text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                href="/contact"
                className="mt-8 inline-flex items-center gap-2 px-[42px] py-[18px] rounded-[45px] bg-[#3147FF] text-white text-[15px] font-semibold hover:bg-[#2a3de6] transition-colors"
              >
                Talk to Our Consultants
                <ArrowRight className="h-4 w-4" />
              </Link>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={150}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {(cms.whyChoose || defaultHrCms.whyChoose).map((item: any) => {
                  const Icon = iconMap[item.icon] || Compass;
                  return (
                    <div
                      key={item.title}
                      className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#3147FF]/20 hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3147FF]/10 text-[#3147FF] group-hover:bg-[#3147FF] group-hover:text-white transition-colors duration-300">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="mt-4 text-base font-bold text-[#0A102F]">{item.title}</h3>
                      <p className="mt-2 text-sm text-gray-600 leading-relaxed">{item.description}</p>
                    </div>
                  );
                })}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ════════ OUR PROCESS ════════ */}
      <section className="py-20 sm:py-28 bg-[#0A102F] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#3147FF]/8 blur-3xl" />
        <div className="container-main relative z-10">
          <AnimatedSection animation="fade-up">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-[#3147FF] text-sm font-semibold uppercase tracking-wider">Our Approach</span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
                How We Deliver Impact
              </h2>
              <p className="mt-4 text-gray-400 text-lg">
                A structured, collaborative approach refined over years of successful HR transformations.
              </p>
            </div>
          </AnimatedSection>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {(cms.processSteps || defaultHrCms.processSteps).map((step: any, index: number) => (
              <AnimatedSection key={step.number} animation="fade-up" delay={index * 100}>
                <div className="relative bg-white/[0.05] backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/[0.08] transition-colors duration-300 h-full text-center">
                  <span className="text-4xl font-bold text-[#3147FF]/30">{step.number}</span>
                  <h3 className="mt-3 text-base font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-gray-400 text-sm leading-relaxed">{step.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ FAQ SECTION ════════ */}
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
            {(cms.faqs || defaultHrCms.faqs).map((faq: any, index: number) => (
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
                    <span className="text-[16px] font-semibold text-[#0A102F] pr-4">
                      {faq.question}
                    </span>
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

      {/* ════════ CTA SECTION ════════ */}
      <section className="py-20 sm:py-24 bg-gradient-to-r from-[#3147FF] to-[#1a2eb3] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.06]" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="container-main relative z-10 text-center">
          <AnimatedSection animation="fade-up">
            <Shield className="h-12 w-12 text-white/60 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Ready to Transform Your People Strategy?
            </h2>
            <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
              Let&apos;s discuss how Arbeit&apos;s HR Advisory Services can help you build a
              stronger, more agile organisation.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-[42px] py-[18px] rounded-[45px] bg-white text-[#3147FF] text-[15px] font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Started Today
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/recruitment"
                className="inline-flex items-center gap-2 px-[42px] py-[18px] rounded-[45px] border-2 border-white/30 text-white text-[15px] font-semibold hover:bg-white/10 transition-colors"
              >
                Explore Staffing Services
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
