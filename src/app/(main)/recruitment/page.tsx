"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useCmsContent } from "@/hooks/useCmsContent";
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  Users,
  UserCheck,
  Briefcase,
  Clock,
  FileCheck,
  Building2,
  Target,
  TrendingUp,
  Globe,
  Handshake,
  Search,
  Shield,
  Award,
  ChevronRight,
  Zap,
  BarChart3,
  HeartPulse,
} from "lucide-react";

/* ───── Icon Map (resolves CMS string names → components) ───── */
const iconMap: Record<string, any> = { Clock, FileCheck, Handshake, Target, Search, Zap, Shield, BarChart3 };

/* ───── Form Schema ───── */
const recruitmentSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number").max(15).optional().or(z.literal("")),
  company: z.string().min(2, "Company name is required").max(100),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
  consent: z.literal(true, { errorMap: () => ({ message: "You must agree to proceed" }) }),
});
type RecruitmentFormData = z.infer<typeof recruitmentSchema>;

/* ───── Data & CMS Defaults ───── */
const defaultCmsContent = {
  heroHeading: "The Right Talent, Right When You Need It",
  heroHighlight: "Right When",
  heroSubtitle: "From contingent workforce to permanent leadership hires — Arbeit delivers end-to-end staffing and recruitment solutions that power India's fastest-growing businesses.",
  heroImage: "",
  introHeading: "India's Trusted Partner for Staffing Excellence",
  introText: "Arbeit is a full-service staffing and recruitment firm that connects top-tier talent with leading organizations across India. With deep industry expertise and a technology-driven approach, we deliver hiring solutions that are fast, scalable, and tailored to your business goals.",
  introImage: "",
  staffingTypes: [
    {
      icon: "Clock",
      title: "Contingent Staffing",
      description:
        "Quickly scale your workforce with skilled contingent professionals. We provide flexible staffing solutions that adapt to your project timelines and seasonal demands — without the long-term commitment.",
      features: ["Rapid deployment within days", "Pre-screened talent pool", "Flexible engagement models", "Compliance & payroll managed"],
    },
    {
      icon: "FileCheck",
      title: "Contract Staffing",
      description:
        "Engage specialized talent on fixed-term contracts for defined projects. Ideal for organizations needing niche expertise, project-based roles, or bridging gaps during peak workloads.",
      features: ["Fixed-term & project-based", "Domain-specific specialists", "End-to-end contract management", "Seamless onboarding support"],
    },
    {
      icon: "Handshake",
      title: "Contract-to-Hire",
      description:
        "Evaluate talent on the job before making a permanent offer. Our contract-to-hire model reduces hiring risk by letting you assess cultural fit, performance, and potential in a real work setting.",
      features: ["Try before you hire", "Reduced hiring risk", "Smooth transition to permanent", "Performance-based conversion"],
    },
    {
      icon: "Target",
      title: "Permanent Recruitment",
      description:
        "Find the right people for your most critical roles. Our permanent recruitment service combines deep industry knowledge, rigorous screening, and a vast talent network to deliver candidates who stay and grow.",
      features: ["Executive & leadership hiring", "Technical & niche roles", "Multi-stage assessment", "Replacement guarantee"],
    },
  ],
  whyChoose: [
    {
      icon: "Search",
      title: "Deep Talent Network",
      stat: "50,000+",
      description: "Access our extensively curated database of pre-screened professionals across 15+ industries.",
    },
    {
      icon: "Zap",
      title: "Rapid Turnaround",
      stat: "72 hrs",
      description: "From requirement to shortlist — our streamlined process delivers qualified candidates fast.",
    },
    {
      icon: "Shield",
      title: "Quality Guarantee",
      stat: "95%",
      description: "Offer-to-join ratio backed by thorough vetting, reference checks, and cultural fit assessment.",
    },
    {
      icon: "BarChart3",
      title: "Data-Driven Hiring",
      stat: "Real-time",
      description: "Market intelligence, salary benchmarks, and hiring analytics to make informed decisions.",
    },
  ],
  processSteps: [
    { step: "01", title: "Discovery", description: "We deep-dive into your hiring needs, team dynamics, and organizational culture." },
    { step: "02", title: "Sourcing", description: "Multi-channel outreach across job boards, social platforms, referrals, and our proprietary database." },
    { step: "03", title: "Screening", description: "Technical evaluations, behavioural interviews, background checks, and skill assessments." },
    { step: "04", title: "Presentation", description: "A curated shortlist with detailed profiles, assessment scores, and our expert recommendations." },
    { step: "05", title: "Coordination", description: "We manage interview scheduling, feedback loops, and candidate engagement throughout." },
    { step: "06", title: "Onboarding", description: "Offer management, salary negotiation guidance, and 90-day post-joining check-ins." },
  ],
  industries: [
    "Information Technology",
    "Banking & Financial Services",
    "Healthcare & Life Sciences",
    "Manufacturing & Engineering",
    "E-commerce & Retail",
    "Telecom & Media",
    "Energy & Utilities",
    "Logistics & Supply Chain",
    "Education & EdTech",
    "Automotive",
    "Real Estate & Infrastructure",
    "FMCG & Consumer Goods",
  ],
};

export default function StaffingRecruitmentPage() {
  const cms = useCmsContent<any>("recruitmentPage", defaultCmsContent);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const { register, handleSubmit, reset, formState: { errors } } = useForm<RecruitmentFormData>({
    resolver: zodResolver(recruitmentSchema),
  });

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

  const onSubmit = async (data: RecruitmentFormData) => {
    setSubmitStatus("loading");
    setErrorMessage("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type: "recruitment" }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }
      setSubmitStatus("success");
      reset();
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to submit. Please try again.");
    }
  };

  return (
    <>
      {/* ════════ HERO ════════ */}
      <section className="relative overflow-hidden bg-[#0A102F] min-h-[600px] flex items-center">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#3147FF]/10 blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#3147FF]/8 blur-3xl translate-y-1/2 -translate-x-1/3" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.04]" />

        <div className="container-main relative z-10 py-24 sm:py-32 lg:py-40">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <AnimatedSection animation="fade-up">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3147FF]/15 text-[#7B8FFF] text-sm font-medium mb-6">
                  <Briefcase className="h-4 w-4" />
                  Staffing & Recruiting Solutions
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-white leading-[1.1] tracking-tight">
                  {cms.heroHighlight
                    ? cms.heroHeading?.split(cms.heroHighlight).map((part: string, i: number, arr: string[]) =>
                        i < arr.length - 1 ? (
                          <span key={i}>{part}<span className="text-[#3147FF]">{cms.heroHighlight}</span></span>
                        ) : (
                          <span key={i}>{part}</span>
                        )
                      )
                    : cms.heroHeading || "The Right Talent, Right When You Need It"}
                </h1>
                <p className="mt-6 text-lg text-gray-300 leading-relaxed max-w-xl">
                  {cms.heroSubtitle || "From contingent workforce to permanent leadership hires — Arbeit delivers end-to-end staffing and recruitment solutions."}
                </p>
                <div className="mt-10 flex flex-wrap gap-4">
                  <a
                    href="#hiring-form"
                    className="inline-flex items-center gap-2 px-[42px] py-[18px] rounded-[45px] bg-[#3147FF] text-white text-[15px] font-semibold hover:bg-[#2a3de6] transition-colors"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <Link
                    href="/jobs"
                    className="inline-flex items-center gap-2 px-[42px] py-[18px] rounded-[45px] border-2 border-white/20 text-white text-[15px] font-semibold hover:bg-white/10 transition-colors"
                  >
                    View Open Roles
                  </Link>
                </div>
              </AnimatedSection>
            </div>

            {/* Hero right — stats card */}
            <div className="hidden lg:block">
              <AnimatedSection animation="fade-up" delay={200}>
                <div className="relative">
                  <div className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                    <div className="grid grid-cols-2 gap-6">
                      {[
                        { icon: TrendingUp, value: "10+", label: "Years Experience" },
                        { icon: UserCheck, value: "5,000+", label: "Placements Made" },
                        { icon: Building2, value: "200+", label: "Companies Served" },
                        { icon: Globe, value: "15+", label: "Industries Covered" },
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
                  {/* Floating accent */}
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-2xl bg-[#3147FF]/20 blur-2xl" />
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ INTRO / ABOUT SECTION ════════ */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection animation="fade-up">
              <span className="text-[#3147FF] text-sm font-semibold uppercase tracking-wider">Who We Are</span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#0A102F] leading-tight">
                {cms.introHeading || "India's Trusted Partner for"}{" "}
                <span className="text-[#3147FF]">Staffing Excellence</span>
              </h2>
              <p className="mt-6 text-gray-600 leading-relaxed text-[17px]">
                {cms.introText || "Arbeit is a full-service staffing and recruitment firm that connects top-tier talent with leading organizations across India."}
              </p>
              {cms.introImage && (
                <img src={cms.introImage} alt="Staffing" className="mt-4 rounded-xl w-full max-h-60 object-cover" />
              )}
              <div className="mt-8 flex flex-wrap gap-3">
                {["IT & Engineering", "BFSI", "Healthcare", "Manufacturing", "Retail", "Telecom"].map((tag) => (
                  <span key={tag} className="px-4 py-2 rounded-full bg-[#3147FF]/8 text-[#3147FF] text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={150}>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0A102F] rounded-2xl p-6 text-white">
                  <Users className="h-8 w-8 text-[#3147FF]" />
                  <p className="mt-4 text-3xl font-bold">50K+</p>
                  <p className="mt-1 text-sm text-gray-300">Talent Pool</p>
                </div>
                <div className="bg-[#3147FF] rounded-2xl p-6 text-white">
                  <Award className="h-8 w-8 text-white/80" />
                  <p className="mt-4 text-3xl font-bold">95%</p>
                  <p className="mt-1 text-sm text-white/80">Client Retention</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 col-span-2">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#3147FF]/10 text-[#3147FF]">
                      <HeartPulse className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-[#0A102F]">Relationship-First Approach</p>
                      <p className="text-sm text-gray-500">We build partnerships, not just fill positions</p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ════════ STAFFING TYPES — Flairdeck style cards ════════ */}
      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="container-main">
          <AnimatedSection animation="fade-up">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-[#3147FF] text-sm font-semibold uppercase tracking-wider">Our Services</span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#0A102F]">
                Comprehensive Staffing Solutions
              </h2>
              <p className="mt-4 text-gray-600 text-lg">
                From temporary staffing to executive search, we offer flexible engagement
                models designed to meet your unique workforce requirements.
              </p>
            </div>
          </AnimatedSection>

          <div className="mt-16 grid gap-8 lg:grid-cols-2">
            {(cms.staffingTypes || defaultCmsContent.staffingTypes).map((type: any, index: number) => {
              const Icon = iconMap[type.icon] || Clock;
              return (
                <AnimatedSection key={type.title} animation="fade-up" delay={index * 100}>
                  <div className="bg-white rounded-2xl p-8 sm:p-10 h-full border border-gray-100 hover:border-[#3147FF]/20 hover:shadow-xl transition-all duration-300 group">
                    <div className="flex items-start gap-5">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#3147FF]/10 text-[#3147FF] group-hover:bg-[#3147FF] group-hover:text-white transition-colors duration-300">
                        <Icon className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#0A102F]">{type.title}</h3>
                        <p className="mt-3 text-gray-600 leading-relaxed">{type.description}</p>
                      </div>
                    </div>
                    <div className="mt-6 pl-[76px]">
                      <div className="grid grid-cols-2 gap-3">
                        {type.features.map((feature: string) => (
                          <div key={feature} className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#3147FF] shrink-0" />
                            <span className="text-sm text-gray-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════ WHY ARBEIT — with stat highlights ════════ */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="container-main">
          <AnimatedSection animation="fade-up">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-[#3147FF] text-sm font-semibold uppercase tracking-wider">Why Choose Arbeit</span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#0A102F]">
                Built for Speed, Designed for Quality
              </h2>
              <p className="mt-4 text-gray-600 text-lg">
                Our technology-driven recruitment process combines human expertise with
                data intelligence to deliver exceptional hiring outcomes.
              </p>
            </div>
          </AnimatedSection>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(cms.whyChoose || defaultCmsContent.whyChoose).map((item: any, index: number) => {
              const Icon = iconMap[item.icon] || Clock;
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

      {/* ════════ PROCESS TIMELINE ════════ */}
      <section className="py-20 sm:py-28 bg-[#0A102F] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#3147FF]/8 blur-3xl" />
        <div className="container-main relative z-10">
          <AnimatedSection animation="fade-up">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-[#3147FF] text-sm font-semibold uppercase tracking-wider">Our Process</span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
                How We Work
              </h2>
              <p className="mt-4 text-gray-400 text-lg">
                A proven 6-step methodology refined over a decade of successful placements.
              </p>
            </div>
          </AnimatedSection>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(cms.processSteps || defaultCmsContent.processSteps).map((step: any, index: number) => (
              <AnimatedSection key={step.step} animation="fade-up" delay={index * 80}>
                <div className="relative bg-white/[0.05] backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/[0.08] transition-colors duration-300 h-full">
                  <span className="text-5xl font-bold text-[#3147FF]/20">{step.step}</span>
                  <h3 className="mt-3 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-gray-400 leading-relaxed text-sm">{step.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ INDUSTRIES WE SERVE ════════ */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="container-main">
          <AnimatedSection animation="fade-up">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-[#3147FF] text-sm font-semibold uppercase tracking-wider">Industries</span>
                <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#0A102F]">
                  Cross-Industry Expertise
                </h2>
                <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                  Our recruiters specialize across sectors, understanding the unique talent
                  landscape, compliance requirements, and skills demanded by each industry.
                </p>
                <Link
                  href="/contact"
                  className="mt-8 inline-flex items-center gap-2 text-[#3147FF] font-semibold hover:gap-3 transition-all"
                >
                  Discuss Your Industry Needs
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(cms.industries || defaultCmsContent.industries).map((industry: string) => (
                  <div
                    key={industry}
                    className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-sm font-medium text-[#0A102F] hover:border-[#3147FF]/30 hover:bg-[#3147FF]/5 transition-colors duration-200 text-center"
                  >
                    {industry}
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ════════ CTA BANNER ════════ */}
      <section className="py-20 sm:py-24 bg-gradient-to-r from-[#3147FF] to-[#1a2eb3] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.06]" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="container-main relative z-10 text-center">
          <AnimatedSection animation="fade-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Ready to Build Your Dream Team?
            </h2>
            <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
              Whether you need one specialist or an entire department — let&apos;s talk about
              how Arbeit can transform your hiring.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a
                href="#hiring-form"
                className="inline-flex items-center gap-2 px-[42px] py-[18px] rounded-[45px] bg-white text-[#3147FF] text-[15px] font-semibold hover:bg-gray-100 transition-colors"
              >
                Start Hiring Now
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-[42px] py-[18px] rounded-[45px] border-2 border-white/30 text-white text-[15px] font-semibold hover:bg-white/10 transition-colors"
              >
                Talk to an Expert
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ════════ HIRING FORM ════════ */}
      <section id="hiring-form" className="py-20 sm:py-28 bg-gray-50">
        <div className="container-main">
          <div className="mx-auto max-w-2xl">
            <AnimatedSection animation="fade-up">
              <div className="text-center">
                <span className="text-[#3147FF] text-sm font-semibold uppercase tracking-wider">Get In Touch</span>
                <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#0A102F]">
                  Tell Us Your Hiring Needs
                </h2>
                <p className="mt-4 text-gray-600 text-lg">
                  Fill in the form below and our recruitment team will get back to you within 24 hours.
                </p>
              </div>
            </AnimatedSection>

            {submitStatus === "success" && (
              <div className="mt-8 flex items-start gap-3 rounded-xl bg-green-50 border border-green-200 p-4">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-green-800">Inquiry submitted successfully!</p>
                  <p className="mt-1 text-sm text-green-700">Our recruitment team will contact you shortly.</p>
                </div>
              </div>
            )}

            {submitStatus === "error" && (
              <div className="mt-8 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-red-800">Submission failed</p>
                  <p className="mt-1 text-sm text-red-700">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    {...register("firstName")}
                    className="mt-1.5 block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#3147FF] focus:ring-2 focus:ring-[#3147FF]/20 focus:outline-none transition-colors"
                    placeholder="John"
                  />
                  {errors.firstName && <p className="mt-1.5 text-sm text-red-600">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    {...register("lastName")}
                    className="mt-1.5 block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#3147FF] focus:ring-2 focus:ring-[#3147FF]/20 focus:outline-none transition-colors"
                    placeholder="Doe"
                  />
                  {errors.lastName && <p className="mt-1.5 text-sm text-red-600">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    className="mt-1.5 block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#3147FF] focus:ring-2 focus:ring-[#3147FF]/20 focus:outline-none transition-colors"
                    placeholder="john@company.com"
                  />
                  {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    className="mt-1.5 block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#3147FF] focus:ring-2 focus:ring-[#3147FF]/20 focus:outline-none transition-colors"
                    placeholder="+91 98765 43210"
                  />
                  {errors.phone && <p className="mt-1.5 text-sm text-red-600">{errors.phone.message}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                  Company <span className="text-red-500">*</span>
                </label>
                <input
                  id="company"
                  type="text"
                  {...register("company")}
                  className="mt-1.5 block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#3147FF] focus:ring-2 focus:ring-[#3147FF]/20 focus:outline-none transition-colors"
                  placeholder="Acme Inc."
                />
                {errors.company && <p className="mt-1.5 text-sm text-red-600">{errors.company.message}</p>}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Hiring Requirements <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  rows={5}
                  {...register("message")}
                  className="mt-1.5 block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#3147FF] focus:ring-2 focus:ring-[#3147FF]/20 focus:outline-none transition-colors resize-y"
                  placeholder="Tell us about the roles you're looking to fill, number of positions, required experience level, etc."
                />
                {errors.message && <p className="mt-1.5 text-sm text-red-600">{errors.message.message}</p>}
              </div>

              <div className="flex items-start gap-3">
                <input
                  id="consent"
                  type="checkbox"
                  {...register("consent")}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#3147FF] focus:ring-[#3147FF]"
                />
                <label htmlFor="consent" className="text-sm text-gray-600">
                  I agree that Arbeit may collect and use my information to respond to this inquiry
                  in accordance with their{" "}
                  <a href="/privacy-policy" className="text-[#3147FF] hover:underline">Privacy Policy</a>.
                </label>
              </div>
              {errors.consent && <p className="text-sm text-red-600">{errors.consent.message}</p>}

              <button
                type="submit"
                disabled={submitStatus === "loading"}
                className="inline-flex items-center gap-2 px-[42px] py-[18px] rounded-[45px] bg-[#3147FF] text-white text-[15px] font-semibold hover:bg-[#2a3de6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitStatus === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Inquiry
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
