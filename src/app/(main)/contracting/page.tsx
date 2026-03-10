"use client";

import Link from "next/link";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useCmsContent } from "@/hooks/useCmsContent";
import {
  Zap,
  Clock,
  IndianRupee,
  FlaskConical,
  Users,
  Wrench,
  ShieldCheck,
  HeartHandshake,
  ChevronRight,
} from "lucide-react";

/* ───── Icon Map (resolves CMS string names → components) ───── */
const iconMap: Record<string, any> = {
  Zap,
  Clock,
  IndianRupee,
  FlaskConical,
  Users,
  Wrench,
  ShieldCheck,
  HeartHandshake,
  ChevronRight,
};

/* ───── Default CMS Content ───── */
const defaultContractingCms = {
  heroHeading: "Hire Contractors",
  heroSubtitle:
    "Build a flexible, high-performing workforce with Arbeit's contract staffing solutions. Deploy skilled professionals quickly and scale on demand.",
  heroImage: "",
  benefits: [
    {
      icon: "Zap",
      title: "Fast Impact",
      description:
        "Contractors bring specialized skills and hit the ground running from day one. Skip the lengthy ramp-up period and see immediate contributions to your projects, helping you meet tight deadlines and deliver results faster.",
    },
    {
      icon: "Clock",
      title: "Short Notice Periods",
      description:
        "Scale your team with agility. Contractors typically have shorter notice periods than permanent hires, allowing you to quickly onboard talent when demand spikes and wind down engagements when projects conclude.",
    },
    {
      icon: "IndianRupee",
      title: "Financial Savings",
      description:
        "Reduce overhead costs associated with full-time employees such as long-term benefits, training investments, and severance obligations. Pay only for the skills and duration you need, optimizing your workforce budget.",
    },
    {
      icon: "FlaskConical",
      title: "Trial New Roles",
      description:
        "Thinking of creating a new position but unsure of the commitment? Contractors let you test new roles within your organization, evaluate the impact, and make informed decisions before converting to permanent headcount.",
    },
  ],
  journeySteps: [
    {
      step: 1,
      title: "Define Framework",
      description:
        "We collaborate with you to understand the role requirements, project scope, duration, and budget to craft a clear engagement framework.",
    },
    {
      step: 2,
      title: "Candidate Mapping",
      description:
        "Our recruitment team identifies and maps potential contractors from our extensive talent network across India's key talent hubs.",
    },
    {
      step: 3,
      title: "Screening",
      description:
        "Rigorous technical assessments, background verification, and skill validation ensure only qualified professionals are presented to you.",
    },
    {
      step: 4,
      title: "Shortlisting",
      description:
        "We curate a focused shortlist of the best-matched candidates, complete with detailed profiles and assessment summaries for your review.",
    },
    {
      step: 5,
      title: "Client Interview",
      description:
        "Coordinate interviews at your convenience. We handle scheduling, logistics, and provide structured feedback collection to accelerate decisions.",
    },
    {
      step: 6,
      title: "Onboarding",
      description:
        "Seamless onboarding with all documentation, compliance checks, and induction support handled so your contractor can start contributing immediately.",
    },
    {
      step: 7,
      title: "Post-Placement Care",
      description:
        "Regular check-ins with both you and the contractor to ensure satisfaction, resolve concerns early, and maintain high engagement levels.",
    },
    {
      step: 8,
      title: "Payroll Management",
      description:
        "Complete payroll administration including salary disbursement, statutory deductions (PF, ESI, TDS), and compliance with Indian labour regulations.",
    },
  ],
  helpCards: [
    {
      icon: "Users",
      title: "Large Talent Pool",
      description:
        "Access thousands of pre-vetted contractors across India — from Bengaluru's tech corridors to Delhi-NCR's corporate hubs. Our database spans IT professionals, finance experts, data scientists, engineers, and more, ready to deploy on short notice.",
    },
    {
      icon: "Wrench",
      title: "Tailored Solutions",
      description:
        "No two businesses are alike. We design bespoke contracting arrangements that align with your operational model, whether you need a single specialist for a niche project or an entire team for a large-scale transformation.",
    },
    {
      icon: "ShieldCheck",
      title: "Compliance Guarantee",
      description:
        "Navigate India's complex labour laws with confidence. We ensure full compliance with the Contract Labour Act, EPF & ESI regulations, GST requirements, and state-specific shop and establishment rules — so you stay protected.",
    },
    {
      icon: "HeartHandshake",
      title: "End-to-End Support",
      description:
        "From initial requirement gathering to contract closure, we manage every aspect of the engagement. A dedicated account manager serves as your single point of contact, ensuring smooth operations throughout the assignment.",
    },
  ],
  ctaHeading: "Ready to Build Your Flexible Workforce?",
  ctaSubtitle:
    "Let Arbeit handle the complexity of contract staffing while you focus on driving your business forward. Get in touch today.",
};

export default function ContractingPage() {
  const cms = useCmsContent<any>("contractingPage", defaultContractingCms);

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

  const benefits =(cms.benefits || defaultContractingCms.benefits).map(
    (benefit: any) => ({
      ...benefit,
      Icon: iconMap[benefit.icon] || Zap,
    })
  );

  const journeySteps =
    cms.journeySteps || defaultContractingCms.journeySteps;

  const helpCards = (cms.helpCards || defaultContractingCms.helpCards).map(
    (card: any) => ({
      ...card,
      Icon: iconMap[card.icon] || Users,
    })
  );

  return (
    <>
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-24 sm:py-32">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="container-main relative z-10 text-center">
          {cms.heroImage && (
            <img
              src={cms.heroImage}
              alt={cms.heroHeading}
              className="mx-auto mb-8 max-h-64 object-contain"
            />
          )}
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {cms.heroHeading}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-blue-100">
            {cms.heroSubtitle}
          </p>
          <div className="mt-10">
            <Link href="/contact" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits of Hiring Contractors */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="container-main">
          <div className="text-center">
            <h2 className="section-heading">Why Hire Contractors?</h2>
            <p className="section-subheading">
              Strategic advantages that make contract staffing a smart choice for
              modern businesses.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            {benefits.map((benefit: any) => (
              <AnimatedSection key={benefit.title}>
                <div className="card group hover:shadow-xl transition-shadow duration-300">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-700 group-hover:bg-blue-700 group-hover:text-white transition-colors duration-300">
                    <benefit.Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-gray-900">
                    {benefit.title}
                  </h3>
                  <p className="mt-4 text-gray-600 leading-7">
                    {benefit.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Hiring Journey Timeline */}
      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="container-main">
          <div className="text-center">
            <h2 className="section-heading">Your Hiring Journey</h2>
            <p className="section-subheading">
              A streamlined 8-step process that takes you from requirement to
              result.
            </p>
          </div>
          <div className="mt-16 relative">
            {/* Vertical line for desktop */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-blue-200 -translate-x-1/2" />

            <div className="space-y-8 lg:space-y-12">
              {journeySteps.map((step: any, index: number) => (
                <AnimatedSection key={step.step}>
                  <div
                    className={`relative flex flex-col lg:flex-row items-start lg:items-center gap-6 ${
                      index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                    }`}
                  >
                    {/* Content */}
                    <div
                      className={`flex-1 ${
                        index % 2 === 0
                          ? "lg:text-right lg:pr-12"
                          : "lg:text-left lg:pl-12"
                      }`}
                    >
                      <div
                        className={`card inline-block w-full ${
                          index % 2 === 0 ? "lg:ml-auto" : "lg:mr-auto"
                        } max-w-lg`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
                            {step.step}
                          </span>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {step.title}
                          </h3>
                        </div>
                        <p className="mt-3 text-gray-600 leading-7 text-left">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Center dot */}
                    <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 h-5 w-5 items-center justify-center rounded-full bg-blue-700 ring-4 ring-white">
                      <ChevronRight className="h-3 w-3 text-white" />
                    </div>

                    {/* Spacer for alternating layout */}
                    <div className="hidden lg:block flex-1" />
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How Arbeit Contracting Can Help */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="container-main">
          <div className="text-center">
            <h2 className="section-heading">
              How Arbeit Contracting Can Help
            </h2>
            <p className="section-subheading">
              Partner with us for a seamless contract staffing experience built
              for India&apos;s dynamic business landscape.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            {helpCards.map((card: any) => (
              <AnimatedSection key={card.title}>
                <div className="card group hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-blue-700">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                      <card.Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {card.title}
                      </h3>
                      <p className="mt-3 text-gray-600 leading-7">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-blue-900 to-indigo-900">
        <div className="container-main text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            {cms.ctaHeading}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100">
            {cms.ctaSubtitle}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/contact"
              className="btn-primary bg-white text-blue-900 hover:bg-gray-100"
            >
              Talk to Our Team
            </Link>
            <Link
              href="/jobs"
              className="btn-secondary border-white text-white hover:bg-white/10"
            >
              View Open Positions
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
