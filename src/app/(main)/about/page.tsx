import type { Metadata } from "next";
import {
  Users,
  Briefcase,
  Settings,
  ArrowUpRight,
  Shield,
  Lightbulb,
  Award,
  Handshake,
  TrendingUp,
  Building2,
  UserCheck,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "About Us | Arbeit - Leading Recruitment Agency in India",
  description:
    "Learn about Arbeit, a leading professional recruitment agency based in New Delhi. We specialize in staffing, consulting, and outsourcing across IT, Banking, AI & Data Science, and Agriculture.",
  keywords: [
    "about arbeit",
    "recruitment agency india",
    "staffing company new delhi",
    "consulting services",
    "outsourcing india",
  ],
  openGraph: {
    title: "About Us | Arbeit",
    description:
      "Arbeit is a bridge to fulfill the gap in the volatile job market. Leading professional recruitment agency in New Delhi.",
    type: "website",
  },
};

const defaultServices = [
  {
    icon: "Users",
    title: "Staffing",
    description:
      "We provide permanent, contract, and temporary staffing solutions tailored to your unique workforce requirements. Our deep talent pool ensures you get the right candidates who align with your organizational culture and goals.",
  },
  {
    icon: "Settings",
    title: "Consulting",
    description:
      "From business re-engineering and statistical process control to automation strategy, our consulting services help organizations transform their operations, improve efficiency, and drive sustainable growth.",
  },
  {
    icon: "ArrowUpRight",
    title: "Outsourcing",
    description:
      "Streamline your operations by entrusting non-core functions to our expert teams. We manage end-to-end outsourcing with full compliance, letting you focus on what matters most — growing your business.",
  },
];

const defaultValues = [
  { icon: "Shield", title: "Integrity", description: "We operate with unwavering honesty and transparency in every interaction." },
  { icon: "Lightbulb", title: "Innovation", description: "We leverage modern recruitment technologies and methodologies." },
  { icon: "Award", title: "Excellence", description: "We hold ourselves to the highest standards, continuously refining our processes." },
  { icon: "Handshake", title: "Partnership", description: "We believe in building long-term collaborative relationships." },
];

const defaultStats = [
  { label: "Years of Experience", value: "10+" },
  { label: "Candidates Placed", value: "5,000+" },
  { label: "Companies Served", value: "200+" },
  { label: "Industries Covered", value: "15+" },
];

const defaultTeam = [
  { name: "Team Member 1", role: "Founder & CEO", bio: "Brief bio coming soon.", photo: "" },
  { name: "Team Member 2", role: "Head of Operations", bio: "Brief bio coming soon.", photo: "" },
  { name: "Team Member 3", role: "Head of Technology", bio: "Brief bio coming soon.", photo: "" },
  { name: "Team Member 4", role: "Head of Sales", bio: "Brief bio coming soon.", photo: "" },
];

const iconMap: Record<string, any> = {
  Users, Briefcase, Settings, ArrowUpRight, Shield, Lightbulb, Award, Handshake, TrendingUp, Building2, UserCheck, Globe,
};

const statIconMap = [TrendingUp, UserCheck, Building2, Globe];

async function getAboutContent() {
  try {
    const record = await (prisma as any).siteContent.findUnique({ where: { section: "aboutPage" } });
    if (record) return JSON.parse(record.content);
  } catch {}
  return null;
}

export default async function AboutPage() {
  const cms = await getAboutContent();

  const heroHeading = cms?.heroHeading || "About Us";
  const heroSubtitle = cms?.heroSubtitle || "Building bridges between exceptional talent and forward-thinking organizations across India.";
  const heroImage = cms?.heroImage || "";
  const mission = cms?.mission || "To empower organizations with the right talent and equip professionals with fulfilling career opportunities. We strive to be the most trusted recruitment partner in India by delivering exceptional service, embracing innovation, and fostering lasting relationships that create value for all stakeholders.";
  const missionImage = cms?.missionImage || "";
  const cmsValues = cms?.values || defaultValues;
  const cmsTeam = cms?.team || defaultTeam;
  const cmsStats = cms?.stats || defaultStats;

  if (cms?.pageHidden) {
    return (
      <section className="py-32 text-center">
        <div className="container-main">
          <h1 className="text-3xl font-bold text-gray-900">Page Not Available</h1>
          <p className="mt-4 text-gray-600">This page is currently unavailable. Please check back later.</p>
          <a href="/" className="mt-8 inline-block px-6 py-3 bg-[#3147FF] text-white rounded-lg font-semibold hover:bg-[#2a3de6] transition-colors">Go to Homepage</a>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-24 sm:py-32">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        {heroImage && <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${heroImage})` }} />}
        <div className="container-main relative z-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {heroHeading}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-blue-100">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="container-main">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="section-heading">Who We Are</h2>
            <div className="mt-6 space-y-6 text-lg leading-8 text-gray-600">
              <p>
                <strong className="text-gray-900">Arbeit</strong> is a bridge to
                fulfill the gap in the volatile job market. As a leading
                professional recruitment agency headquartered in New Delhi, we
                connect businesses with the talent they need to thrive and
                empower professionals to find careers that match their
                aspirations.
              </p>
              <p>
                With deep expertise spanning multiple industries and a
                commitment to understanding each client&apos;s unique needs, we
                have established ourselves as a trusted partner for
                organizations of all sizes — from ambitious startups to
                established enterprises across India.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="container-main">
          <div className="text-center">
            <h2 className="section-heading">What We Do</h2>
            <p className="section-subheading">
              Comprehensive workforce solutions designed to drive your business forward.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {defaultServices.map((service) => {
              const Icon = iconMap[service.icon] || Users;
              return (
                <div key={service.title} className="card group hover:shadow-xl transition-shadow duration-300">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-700 group-hover:bg-blue-700 group-hover:text-white transition-colors duration-300">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-gray-900">{service.title}</h3>
                  <p className="mt-4 text-gray-600 leading-7">{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="container-main">
          <div className="mx-auto max-w-4xl">
            <div className="relative rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-900 px-8 py-16 sm:px-16 sm:py-20 text-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
              {missionImage && <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${missionImage})` }} />}
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white sm:text-4xl">Our Mission</h2>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-blue-100">
                  {mission}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="container-main">
          <div className="text-center">
            <h2 className="section-heading">Our Values</h2>
            <p className="section-subheading">The principles that guide everything we do.</p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {cmsValues.map((value: any) => {
              const Icon = iconMap[value.icon] || Shield;
              return (
                <div key={value.title} className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-gray-900">{value.title}</h3>
                  <p className="mt-3 text-gray-600 leading-7">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="container-main">
          <div className="text-center">
            <h2 className="section-heading">Meet Our Team</h2>
            <p className="section-subheading">The dedicated professionals behind Arbeit&apos;s success.</p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {cmsTeam.map((member: any, i: number) => (
              <div key={i} className="card text-center">
                <div className="mx-auto h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {member.photo ? (
                    <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <Users className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">{member.name}</h3>
                <p className="mt-1 text-sm text-blue-600">{member.role}</p>
                <p className="mt-3 text-sm text-gray-500">{member.bio || "Brief bio coming soon."}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-blue-900 to-indigo-900">
        <div className="container-main">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {cmsStats.map((stat: any, i: number) => {
              const Icon = statIconMap[i] || TrendingUp;
              return (
                <div key={stat.label} className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white">
                    <Icon className="h-7 w-7" />
                  </div>
                  <p className="mt-4 text-4xl font-bold text-white">{stat.value}</p>
                  <p className="mt-2 text-blue-200">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="container-main text-center">
          <h2 className="section-heading">Ready to Find Your Next Opportunity?</h2>
          <p className="section-subheading">
            Whether you&apos;re looking for your dream job or the perfect candidate, Arbeit is here to help.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/jobs" className="btn-primary">Browse Jobs</Link>
            <Link href="/contact" className="btn-secondary">Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
