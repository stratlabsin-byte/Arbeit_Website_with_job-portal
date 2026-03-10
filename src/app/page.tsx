"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Monitor,
  Sprout,
  ShoppingCart,
  Briefcase,
  UserCheck,
  Target,
  Zap,
  Users,
  TrendingUp,
  Globe,
  Phone,
  Star,
  ChevronRight,
  Factory,
  Cpu,
  HeartPulse,
  GraduationCap,
  Truck,
  Banknote,
  Plane,
  Send,
  Award,
  Building2,
} from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import CountUp from "@/components/ui/CountUp";

// Icon map for industries (used when rendering dynamic content)
const industryIconMap: Record<string, any> = {
  "Information Technology": Monitor,
  "Banking & Finance": Banknote,
  "Healthcare & Pharma": HeartPulse,
  Manufacturing: Factory,
  "E-commerce & Retail": ShoppingCart,
  "AI & Data Science": Cpu,
  "Agriculture & Agritech": Sprout,
  "Education & Training": GraduationCap,
  "Logistics & Supply Chain": Truck,
};

// Service icon map
const serviceIconMap: Record<string, any> = {
  "Staffing Solutions": Users,
  "Contract Staffing": Briefcase,
  "Executive Search": Target,
  "HR Consulting": Zap,
};

// ======= Hardcoded defaults (used when DB has no content yet) =======
const defaultHero = {
  heading: "India's Most Comprehensive Tech-led HR Solutions Company",
  highlightText: "HR Solutions",
  subtitle:
    "with HR Services & Platforms impacting every part of the employee lifecycle.",
  ctaPrimary: { label: "Find Talent Now", href: "/recruitment" },
  ctaSecondary: { label: "Looking For A Job?", href: "/jobs" },
};

const defaultStats = [
  { label: "Years of Expertise", value: 10, suffix: "+" },
  { label: "Candidates Placed", value: 5000, suffix: "+" },
  { label: "Corporate Clients", value: 200, suffix: "+" },
  { label: "Industries Served", value: 15, suffix: "+" },
];

const defaultServices = [
  {
    title: "Staffing Solutions",
    description:
      "Permanent, contract and temporary staffing across all levels — from junior talent to CXO leadership.",
    href: "/recruitment",
  },
  {
    title: "Contract Staffing",
    description:
      "Build agile teams with our contract staffing. Fast deployment, compliance-ready, with complete payroll management.",
    href: "/contracting",
  },
  {
    title: "Executive Search",
    description:
      "Discreet, headhunt-led search for C-suite and senior leadership roles that shape organisational direction.",
    href: "/recruitment",
  },
  {
    title: "HR Consulting",
    description:
      "From workforce planning to HR transformation — advisory services that modernise your people strategy.",
    href: "/about",
  },
];

const defaultAbout = {
  heading: "A Bridge Between Talent & Opportunity",
  paragraphs: [
    "Arbeit is a leading recruitment agency headquartered in New Delhi, specialising in permanent, contract and temporary placements across India's most dynamic industries.",
    "We combine rich domain expertise with AI-powered matching technology to deliver the right candidate for every role — faster, smarter, and with higher retention rates.",
  ],
  bulletPoints: [
    "AI-powered candidate-role matching",
    "Deep expertise across 15+ industries",
    "End-to-end recruitment process management",
    "Full compliance with Indian labour regulations",
  ],
};

const defaultIndustries = [
  { name: "Information Technology", jobs: "500+" },
  { name: "Banking & Finance", jobs: "300+" },
  { name: "Healthcare & Pharma", jobs: "180+" },
  { name: "Manufacturing", jobs: "250+" },
  { name: "E-commerce & Retail", jobs: "220+" },
  { name: "AI & Data Science", jobs: "200+" },
  { name: "Agriculture & Agritech", jobs: "150+" },
  { name: "Education & Training", jobs: "120+" },
  { name: "Logistics & Supply Chain", jobs: "140+" },
];

const defaultTestimonials = [
  {
    quote:
      "Arbeit helped us build an entire engineering team in just 6 weeks. Their understanding of the tech landscape is unmatched.",
    name: "Priya Sharma",
    role: "CTO, TechCorp Solutions",
  },
  {
    quote:
      "The quality of candidates and the speed of delivery sets Arbeit apart from every other recruitment agency we've worked with.",
    name: "Rahul Verma",
    role: "HR Director, Finance Plus",
  },
  {
    quote:
      "From initial briefing to final placement, the process was seamless. Arbeit truly understands what businesses need.",
    name: "Anita Desai",
    role: "VP Operations, AgriTech India",
  },
];

const defaultClients = [
  "TechCorp", "InfoSys", "Wipro", "HCL Tech", "TCS", "Cognizant",
  "Accenture", "IBM", "Deloitte", "Capgemini", "Oracle", "SAP",
];

// Helper: highlight a portion of the heading
function renderHeading(heading: string, highlight: string) {
  if (!highlight) return heading;
  const idx = heading.indexOf(highlight);
  if (idx === -1) return heading;
  return (
    <>
      {heading.slice(0, idx)}
      <span className="text-[#3147FF]">{highlight}</span>
      {heading.slice(idx + highlight.length)}
    </>
  );
}

export default function HomePage() {
  const [content, setContent] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setContent(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const hero = content?.hero || defaultHero;
  const stats = content?.stats || defaultStats;
  const services = content?.services || defaultServices;
  const about = content?.about || defaultAbout;
  const industries = content?.industries || defaultIndustries;
  const testimonials = content?.testimonials || defaultTestimonials;
  const clientLogos = content?.clients || defaultClients;

  return (
    <>
      {/* ============== HERO SECTION ============== */}
      <section className="relative bg-white overflow-hidden min-h-[85vh] flex items-center">
        {/* Decorative background — subtle geometric shapes like CIEL HR */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          {/* Large decorative circle */}
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-[700px] h-[700px] rounded-full bg-[#3147FF]/[0.03]" />
          {/* Smaller accent circles */}
          <div className="absolute top-[10%] right-[15%] w-[200px] h-[200px] rounded-full bg-[#3147FF]/[0.04]" />
          <div className="absolute bottom-[15%] left-[5%] w-[150px] h-[150px] rounded-full bg-[#3147FF]/[0.03]" />
          {/* Scattered decorative icons */}
          <Send className="absolute top-[15%] right-[35%] w-6 h-6 text-[#3147FF]/15 rotate-[-30deg]" />
          <Plane className="absolute top-[10%] right-[18%] w-8 h-8 text-[#3147FF]/20 rotate-[15deg]" />
          <Send className="absolute top-[25%] right-[10%] w-5 h-5 text-[#0A102F]/10 rotate-[45deg]" />
          <Plane className="absolute top-[8%] right-[25%] w-5 h-5 text-[#3147FF]/10 rotate-[-15deg]" />
          <Send className="absolute bottom-[30%] right-[15%] w-7 h-7 text-[#3147FF]/15 rotate-[20deg]" />
          <Plane className="absolute bottom-[20%] right-[28%] w-6 h-6 text-[#0A102F]/10 rotate-[-40deg]" />
          <Send className="absolute top-[40%] right-[8%] w-4 h-4 text-[#3147FF]/10 rotate-[60deg]" />
          <Send className="absolute top-[20%] left-[5%] w-5 h-5 text-[#3147FF]/[0.08] rotate-[-20deg]" />
          <Plane className="absolute bottom-[15%] left-[8%] w-6 h-6 text-[#3147FF]/[0.08] rotate-[10deg]" />
          {/* Dot grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#3147FF 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        </div>

        <div className="container-main relative z-10 py-16 lg:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <div className="max-w-xl">
              <h1 className="animate-fade-in-up text-4xl md:text-5xl lg:text-[3.5rem] xl:text-[4rem] font-heading font-extrabold text-[#0A102F] leading-[1.1] mb-6">
                {renderHeading(hero.heading, hero.highlightText)}
              </h1>

              <p className="animate-fade-in-up animate-delay-200 text-gray-500 text-lg leading-relaxed mb-10">
                {hero.subtitle}
              </p>

              <div className="animate-fade-in-up animate-delay-300 flex flex-col sm:flex-row gap-4">
                <Link
                  href={hero.ctaPrimary?.href || "/recruitment"}
                  className="inline-flex items-center justify-center px-[42px] py-[18px] bg-[#3147FF] text-white font-semibold rounded-[45px]
                             hover:bg-[#2a3de6] transition-all duration-300 shadow-lg shadow-[#3147FF]/25 text-[15px]"
                >
                  {hero.ctaPrimary?.label || "Find Talent Now"}
                </Link>
                <Link
                  href={hero.ctaSecondary?.href || "/jobs"}
                  className="inline-flex items-center justify-center px-[42px] py-[18px] font-semibold rounded-[45px]
                             border-2 border-[#3147FF] text-[#3147FF] hover:bg-[#3147FF] hover:text-white transition-all duration-300 text-[15px]"
                >
                  {hero.ctaSecondary?.label || "Looking For A Job?"}
                </Link>
              </div>
            </div>

            {/* Right: Stat cards */}
            <div className="hidden lg:flex justify-center items-center relative">
              <div className="relative w-full max-w-md">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-[#0A102F] to-[#1a2760] rounded-2xl p-6 text-white animate-fade-in-up">
                    <Users className="w-10 h-10 mb-4 text-blue-300" />
                    <div className="text-3xl font-bold font-heading mb-1">5000+</div>
                    <div className="text-blue-200/70 text-sm">Candidates Placed</div>
                  </div>
                  <div className="bg-gradient-to-br from-[#3147FF] to-[#2563eb] rounded-2xl p-6 text-white mt-8 animate-fade-in-up animate-delay-200">
                    <Building2 className="w-10 h-10 mb-4 text-blue-200" />
                    <div className="text-3xl font-bold font-heading mb-1">200+</div>
                    <div className="text-blue-100/70 text-sm">Corporate Clients</div>
                  </div>
                  <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-xl animate-fade-in-up animate-delay-300">
                    <Award className="w-10 h-10 mb-4 text-[#3147FF]" />
                    <div className="text-3xl font-bold font-heading text-[#0A102F] mb-1">96%</div>
                    <div className="text-gray-500 text-sm">Client Satisfaction</div>
                  </div>
                  <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-xl -mt-4 animate-fade-in-up animate-delay-400">
                    <Globe className="w-10 h-10 mb-4 text-[#3147FF]" />
                    <div className="text-3xl font-bold font-heading text-[#0A102F] mb-1">15+</div>
                    <div className="text-gray-500 text-sm">Industries Served</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0A102F]" />
          <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
        </div>
      </section>

      {/* ============== STATS STRIP ============== */}
      <section className="bg-[#0A102F] py-10">
        <div className="container-main">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat: any) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white font-heading">
                  <CountUp end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-blue-200/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== SERVICES SECTION ============== */}
      <section className="bg-white py-20 md:py-28">
        <div className="container-main">
          <AnimatedSection className="text-center mb-14">
            <p className="text-[#3147FF] text-sm font-semibold uppercase tracking-widest mb-3">
              What We Do
            </p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#0A102F] mb-4">
              Our Services
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Comprehensive workforce solutions designed to meet the dynamic needs of modern businesses.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service: any, i: number) => {
              const IconComp = serviceIconMap[service.title] || Briefcase;
              return (
                <AnimatedSection key={service.title} delay={i * 100}>
                  <Link
                    href={service.href}
                    className="group block bg-white rounded-2xl border border-gray-200 p-7 h-full
                               hover:shadow-xl hover:border-[#3147FF]/20 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-5
                                    group-hover:bg-[#3147FF] transition-colors duration-300">
                      <IconComp className="w-7 h-7 text-[#3147FF] group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0A102F] mb-2 group-hover:text-[#3147FF] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">
                      {service.description}
                    </p>
                    <span className="inline-flex items-center text-sm font-semibold text-[#3147FF]">
                      Learn More
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============== ABOUT / WHO WE ARE ============== */}
      <section className="bg-gray-50 py-20 md:py-28">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection animation="fade-left">
              <p className="text-[#3147FF] text-sm font-semibold uppercase tracking-widest mb-3">
                About Us
              </p>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#0A102F] mb-6 leading-tight">
                {about.heading?.includes("&") ? (
                  <>
                    {about.heading.split("&")[0].trim()}
                    <br />
                    <span className="text-[#3147FF]">
                      {about.heading.split("&")[0].trim().split(" ").pop()}
                    </span>{" "}
                    &{" "}
                    <span className="text-[#3147FF]">
                      {about.heading.split("&")[1].trim()}
                    </span>
                  </>
                ) : (
                  about.heading
                )}
              </h2>

              {about.paragraphs?.map((para: string, idx: number) => (
                <p
                  key={idx}
                  className={`text-gray-${idx === 0 ? "600" : "500"} mb-4 leading-relaxed`}
                >
                  {idx === 0 && para.includes("Arbeit") ? (
                    <>
                      <strong className="text-[#0A102F]">Arbeit</strong>
                      {para.replace("Arbeit", "")}
                    </>
                  ) : (
                    para
                  )}
                </p>
              ))}

              <div className="space-y-3 mb-8 mt-6">
                {about.bulletPoints?.map((item: string) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/about"
                className="inline-flex items-center px-[42px] py-[18px] bg-[#3147FF] text-white font-semibold rounded-[45px] hover:bg-[#2a3de6] transition-colors text-[15px]"
              >
                Know More
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </AnimatedSection>

            <AnimatedSection animation="fade-right" delay={200}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "10+", label: "Years Experience", icon: TrendingUp, bg: "bg-blue-50", iconColor: "text-blue-600" },
                  { value: "5000+", label: "Placements Done", icon: UserCheck, bg: "bg-green-50", iconColor: "text-green-600" },
                  { value: "96%", label: "Client Satisfaction", icon: Star, bg: "bg-amber-50", iconColor: "text-amber-600" },
                  { value: "21 Days", label: "Avg. Time to Hire", icon: Zap, bg: "bg-violet-50", iconColor: "text-violet-600" },
                ].map((card) => (
                  <div
                    key={card.label}
                    className={`${card.bg} rounded-2xl p-6 text-center hover:shadow-lg transition-shadow duration-300`}
                  >
                    <card.icon className={`w-8 h-8 ${card.iconColor} mx-auto mb-3`} />
                    <div className="text-2xl font-bold text-[#0A102F] font-heading">{card.value}</div>
                    <div className="text-xs text-gray-500 mt-1">{card.label}</div>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ============== INDUSTRIES WE SERVE ============== */}
      <section className="bg-white py-20 md:py-28">
        <div className="container-main">
          <AnimatedSection className="text-center mb-14">
            <p className="text-[#3147FF] text-sm font-semibold uppercase tracking-widest mb-3">
              Industries
            </p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#0A102F] mb-4">
              Industries We Serve
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Deep sector knowledge across India&apos;s fastest-growing industries.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {industries.map((ind: any, i: number) => {
              const IconComp = industryIconMap[ind.name] || Globe;
              return (
                <AnimatedSection key={ind.name} delay={i * 60}>
                  <Link
                    href={`/jobs?industry=${encodeURIComponent(ind.name)}`}
                    className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-5 group
                               hover:border-[#3147FF] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center
                                    group-hover:bg-[#3147FF] transition-colors duration-300 shrink-0">
                      <IconComp className="w-6 h-6 text-[#3147FF] group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-[#0A102F] group-hover:text-[#3147FF] transition-colors">
                        {ind.name}
                      </h3>
                      <p className="text-xs text-gray-400">{ind.jobs} placements</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#3147FF] transition-colors shrink-0" />
                  </Link>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============== CLIENT LOGOS ============== */}
      <section className="bg-gray-50 py-16">
        <div className="container-main">
          <AnimatedSection className="text-center mb-10">
            <p className="text-sm text-gray-400 uppercase tracking-widest font-semibold">
              Trusted by Leading Brands
            </p>
          </AnimatedSection>
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll-x gap-12 items-center">
              {[...clientLogos, ...clientLogos].map((logo: string, i: number) => (
                <div
                  key={`${logo}-${i}`}
                  className="shrink-0 px-6 py-4 bg-white rounded-lg border border-gray-200/80 shadow-sm"
                >
                  <span className="text-lg font-bold text-gray-300 whitespace-nowrap select-none">
                    {logo}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============== HOW IT WORKS ============== */}
      <section className="bg-white py-20 md:py-28">
        <div className="container-main">
          <AnimatedSection className="text-center mb-14">
            <p className="text-[#3147FF] text-sm font-semibold uppercase tracking-widest mb-3">
              Process
            </p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#0A102F] mb-4">
              How We Work
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              A streamlined, efficient recruitment process that delivers results.
            </p>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Understand", desc: "We study your business, culture and talent requirements in detail." },
              { step: "02", title: "Source", desc: "AI-powered sourcing across our database and external channels." },
              { step: "03", title: "Screen", desc: "Rigorous technical and behavioural assessments by domain experts." },
              { step: "04", title: "Deliver", desc: "Shortlisted candidates presented with full profiles and analytics." },
            ].map((item, i) => (
              <AnimatedSection key={item.step} delay={i * 120}>
                <div className="text-center group">
                  <div className="relative inline-flex items-center justify-center w-16 h-16 mb-5">
                    <div className="absolute inset-0 bg-[#3147FF]/10 rounded-full group-hover:bg-[#3147FF] transition-colors duration-300" />
                    <span className="text-xl font-bold text-[#3147FF] group-hover:text-white transition-colors duration-300 relative">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0A102F] mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============== TESTIMONIALS ============== */}
      <section className="bg-gray-50 py-20 md:py-28">
        <div className="container-main">
          <AnimatedSection className="text-center mb-14">
            <p className="text-[#3147FF] text-sm font-semibold uppercase tracking-widest mb-3">
              Testimonials
            </p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#0A102F] mb-4">
              What Our Clients Say
            </h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t: any, i: number) => (
              <AnimatedSection key={t.name} delay={i * 120}>
                <div className="bg-white rounded-2xl border border-gray-200 p-8 h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed flex-1">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0A102F] rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0A102F]">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============== JOB SEEKERS CTA ============== */}
      <section className="relative overflow-hidden bg-[#3147FF]">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="container-main relative z-10 py-16 md:py-20">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="lg:max-w-xl">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
                Looking for Your Next Career Move?
              </h2>
              <p className="text-blue-100/80 leading-relaxed">
                Explore thousands of job openings across India. Our job portal
                connects you with top employers in IT, Finance, Data Science, and more.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center px-[42px] py-[18px] bg-white text-[#3147FF] font-semibold rounded-[45px]
                           hover:bg-gray-50 transition-colors shadow-lg text-[15px]"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Browse All Jobs
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-[42px] py-[18px] font-semibold rounded-[45px]
                           border-2 border-white/40 text-white hover:bg-white/10 transition-colors text-[15px]"
              >
                Upload Your Resume
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============== FOR EMPLOYERS CTA ============== */}
      <section className="bg-[#0A102F] py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/15 rounded-full blur-[120px]" />
        <div className="container-main relative z-10 text-center">
          <AnimatedSection>
            <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3">
              For Employers
            </p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-5">
              Looking to Hire Top Talent?
            </h2>
            <p className="text-blue-200/60 mb-10 max-w-2xl mx-auto leading-relaxed">
              Whether you need one specialist or an entire team, Arbeit has the
              expertise and network to deliver.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/recruitment"
                className="inline-flex items-center justify-center px-[42px] py-[18px] bg-[#3147FF] text-white font-semibold rounded-[45px]
                           hover:bg-[#2a3de6] transition-colors text-[15px]"
              >
                Recruitment Services
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-[42px] py-[18px] font-semibold rounded-[45px]
                           border-2 border-white/20 text-white hover:bg-white/10 transition-colors text-[15px]"
              >
                <Phone className="w-4 h-4 mr-2" />
                Get in Touch
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============== CONTACT TEASER ============== */}
      <section className="bg-white py-20 md:py-28">
        <div className="container-main">
          <AnimatedSection animation="zoom-in">
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-10 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#0A102F] mb-4">
                Let&apos;s Work Together
              </h2>
              <p className="text-gray-500 mb-8 max-w-xl mx-auto">
                Whether you&apos;re an employer looking for talent or a
                professional seeking your next opportunity — we&apos;re here to help.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-[42px] py-[18px] bg-[#3147FF] text-white font-semibold rounded-[45px]
                           hover:bg-[#2a3de6] transition-colors text-[15px]"
              >
                Contact Us
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
