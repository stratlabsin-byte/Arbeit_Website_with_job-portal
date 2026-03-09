"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import {
  Search,
  Target,
  Handshake,
  TrendingUp,
  Monitor,
  Landmark,
  BrainCircuit,
  Wheat,
  Factory,
  Stethoscope,
  ShoppingBag,
  Truck,
  GraduationCap,
  Building2,
  UserCheck,
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  Users,
  Award,
  ClipboardList,
  FileSearch,
  UserPlus,
  CalendarCheck,
  BadgeCheck,
  HeartPulse,
} from "lucide-react";

const recruitmentSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number").max(15).optional().or(z.literal("")),
  jobTitle: z.string().max(100).optional().or(z.literal("")),
  company: z.string().min(2, "Company name is required").max(100),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000),
  consent: z.literal(true, {
    errorMap: () => ({
      message: "You must agree to proceed",
    }),
  }),
});

type RecruitmentFormData = z.infer<typeof recruitmentSchema>;

const whyPartner = [
  {
    icon: Target,
    title: "Precision Matching",
    description:
      "Our deep industry knowledge and rigorous screening process ensures you get candidates who not only have the right skills but also fit your company culture.",
  },
  {
    icon: TrendingUp,
    title: "Market Intelligence",
    description:
      "Stay ahead with real-time insights on salary benchmarks, talent availability, and hiring trends across India's key employment markets.",
  },
  {
    icon: Handshake,
    title: "Dedicated Partnership",
    description:
      "Every client gets a dedicated account manager who understands your business inside out and acts as an extension of your HR team.",
  },
  {
    icon: Search,
    title: "Extensive Reach",
    description:
      "Our multi-channel sourcing strategy covers job portals, social networks, campus partnerships, and referral programs to find talent others miss.",
  },
];

const industries = [
  { icon: Monitor, name: "Information Technology", count: "500+" },
  { icon: Landmark, name: "Banking & Finance", count: "300+" },
  { icon: BrainCircuit, name: "AI & Data Science", count: "200+" },
  { icon: Wheat, name: "Agriculture & Agritech", count: "150+" },
  { icon: Factory, name: "Manufacturing", count: "250+" },
  { icon: Stethoscope, name: "Healthcare & Pharma", count: "180+" },
  { icon: ShoppingBag, name: "Retail & E-Commerce", count: "220+" },
  { icon: Truck, name: "Logistics & Supply Chain", count: "170+" },
];

const processSteps = [
  {
    icon: ClipboardList,
    title: "Requirement Analysis",
    description: "We study your job description, team dynamics, and growth plans to create a precise candidate profile.",
  },
  {
    icon: FileSearch,
    title: "Talent Sourcing",
    description: "Multi-channel outreach across our database, job boards, social platforms, and professional networks.",
  },
  {
    icon: BadgeCheck,
    title: "Screening & Assessment",
    description: "Technical evaluations, behavioural interviews, and background checks to validate every candidate.",
  },
  {
    icon: UserPlus,
    title: "Shortlist Presentation",
    description: "A curated shortlist with detailed candidate profiles, assessment scores, and our recommendations.",
  },
  {
    icon: CalendarCheck,
    title: "Interview Coordination",
    description: "We manage scheduling, logistics, and feedback loops to keep the process moving efficiently.",
  },
  {
    icon: HeartPulse,
    title: "Offer & Onboarding Support",
    description: "Salary negotiation guidance, offer management, and post-joining check-ins for a smooth transition.",
  },
];

const stats = [
  { icon: TrendingUp, value: "10+", label: "Years of Experience" },
  { icon: UserCheck, value: "5,000+", label: "Candidates Placed" },
  { icon: Building2, value: "200+", label: "Companies Served" },
  { icon: Globe, value: "15+", label: "Industries Covered" },
];

export default function RecruitmentPage() {
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RecruitmentFormData>({
    resolver: zodResolver(recruitmentSchema),
  });

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
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to submit. Please try again."
      );
    }
  };

  return (
    <>
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-24 sm:py-32">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="container-main relative z-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Recruitment Services
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-blue-100">
            End-to-end recruitment solutions that help you find, attract, and
            retain the best talent across India.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a href="#hiring-form" className="btn-primary">
              Start Hiring
            </a>
            <Link href="/jobs" className="btn-secondary border-white text-white hover:bg-white/10">
              View Open Roles
            </Link>
          </div>
        </div>
      </section>

      {/* Why Partner with Arbeit */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="container-main">
          <div className="text-center">
            <h2 className="section-heading">Why Partner with Arbeit</h2>
            <p className="section-subheading">
              We go beyond filling vacancies — we build workforces that drive
              growth.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            {whyPartner.map((item) => (
              <div
                key={item.title}
                className="card group hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-700 group-hover:bg-blue-700 group-hover:text-white transition-colors duration-300">
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-4 text-gray-600 leading-7">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries We Recruit For */}
      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="container-main">
          <div className="text-center">
            <h2 className="section-heading">Industries We Recruit For</h2>
            <p className="section-subheading">
              Deep sector expertise across India&apos;s most dynamic industries.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {industries.map((industry) => (
              <div
                key={industry.name}
                className="card text-center group hover:shadow-lg transition-shadow duration-300"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-700 group-hover:bg-blue-700 group-hover:text-white transition-colors duration-300">
                  <industry.icon className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {industry.name}
                </h3>
                <p className="mt-1 text-sm text-blue-600 font-medium">
                  {industry.count} placements
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recruitment Process Timeline */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="container-main">
          <div className="text-center">
            <h2 className="section-heading">Our Recruitment Process</h2>
            <p className="section-subheading">
              A proven 6-step methodology refined over years of successful
              placements.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {processSteps.map((step, index) => (
              <div key={step.title} className="relative">
                <div className="card h-full">
                  <div className="flex items-center gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                      <step.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-gray-600 leading-7">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Campus Drives & Job Fairs */}
      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="container-main">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="section-heading text-left">
                Campus Drives & Job Fairs
              </h2>
              <div className="mt-6 space-y-4 text-gray-600 leading-7">
                <p>
                  Arbeit organizes and participates in campus recruitment drives
                  across India&apos;s top universities and engineering colleges.
                  We bridge the gap between academic institutions and industry,
                  helping organizations tap into fresh, ambitious talent.
                </p>
                <p>
                  Our campus recruitment programmes are designed to identify
                  high-potential graduates through structured assessments, group
                  discussions, and technical interviews — ensuring you get
                  candidates who are ready to contribute from day one.
                </p>
                <p>
                  We also host and participate in job fairs that bring together
                  hundreds of job seekers and employers under one roof, creating
                  efficient hiring opportunities at scale.
                </p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-6 w-6 text-blue-700" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">50+</p>
                    <p className="text-sm text-gray-500">Campus Partnerships</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-blue-700" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">2,000+</p>
                    <p className="text-sm text-gray-500">Graduates Placed</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="h-6 w-6 text-blue-700" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">20+</p>
                    <p className="text-sm text-gray-500">Job Fairs Annually</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-6 w-6 text-blue-700" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">100+</p>
                    <p className="text-sm text-gray-500">Employer Partners</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-900 p-8 sm:p-12 text-white">
              <GraduationCap className="h-12 w-12 text-blue-300" />
              <h3 className="mt-6 text-2xl font-bold">
                Host a Campus Drive with Arbeit
              </h3>
              <p className="mt-4 text-blue-100 leading-7">
                Let us manage your entire campus recruitment process — from
                college selection and pre-placement talks to assessment design
                and final offer rollout. Focus on evaluating candidates while we
                handle the logistics.
              </p>
              <Link
                href="/contact"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-900 hover:bg-gray-100 transition-colors"
              >
                Plan a Campus Drive
                <Send className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Are You Hiring? Form */}
      <section id="hiring-form" className="py-20 sm:py-28 bg-white">
        <div className="container-main">
          <div className="mx-auto max-w-2xl">
            <div className="text-center">
              <h2 className="section-heading">Are You Hiring?</h2>
              <p className="section-subheading">
                Tell us about your recruitment needs and our team will get back
                to you within 24 hours.
              </p>
            </div>

            {submitStatus === "success" && (
              <div className="mt-8 flex items-start gap-3 rounded-lg bg-green-50 border border-green-200 p-4">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-green-800">
                    Inquiry submitted successfully!
                  </p>
                  <p className="mt-1 text-sm text-green-700">
                    Our recruitment team will contact you shortly to discuss your
                    hiring needs.
                  </p>
                </div>
              </div>
            )}

            {submitStatus === "error" && (
              <div className="mt-8 flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-4">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-red-800">Submission failed</p>
                  <p className="mt-1 text-sm text-red-700">{errorMessage}</p>
                </div>
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-8 space-y-6"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    {...register("firstName")}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    {...register("lastName")}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
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
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
                    placeholder="john@company.com"
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
                    placeholder="+91 98765 43210"
                  />
                  {errors.phone && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
                    Your Designation
                  </label>
                  <input
                    id="jobTitle"
                    type="text"
                    {...register("jobTitle")}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
                    placeholder="HR Manager"
                  />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="company"
                    type="text"
                    {...register("company")}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
                    placeholder="Acme Inc."
                  />
                  {errors.company && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.company.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Hiring Requirements <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  rows={5}
                  {...register("message")}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors resize-y"
                  placeholder="Tell us about the roles you're looking to fill, number of positions, required experience level, etc."
                />
                {errors.message && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.message.message}</p>
                )}
              </div>

              <div className="flex items-start gap-3">
                <input
                  id="consent"
                  type="checkbox"
                  {...register("consent")}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="consent" className="text-sm text-gray-600">
                  I agree that Arbeit may collect and use my information to respond
                  to this inquiry in accordance with their{" "}
                  <a href="/privacy-policy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                  .
                </label>
              </div>
              {errors.consent && (
                <p className="text-sm text-red-600">{errors.consent.message}</p>
              )}

              <button
                type="submit"
                disabled={submitStatus === "loading"}
                className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Stats Section */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-blue-900 to-indigo-900">
        <div className="container-main">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white">
                  <stat.icon className="h-7 w-7" />
                </div>
                <p className="mt-4 text-4xl font-bold text-white">
                  {stat.value}
                </p>
                <p className="mt-2 text-blue-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="container-main text-center">
          <h2 className="section-heading">
            Let&apos;s Build Your Dream Team
          </h2>
          <p className="section-subheading">
            Whether you need one specialist or an entire department, Arbeit has
            the expertise and network to deliver.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/contact" className="btn-primary">
              Contact Our Team
            </Link>
            <Link href="/employers" className="btn-secondary">
              Employer Solutions
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
