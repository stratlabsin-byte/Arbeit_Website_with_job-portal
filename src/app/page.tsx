import Link from "next/link";
import {
  Search,
  Users,
  Building2,
  Award,
  ArrowRight,
  CheckCircle2,
  Monitor,
  Landmark,
  BrainCircuit,
  Sprout,
  Stethoscope,
  ShoppingCart,
  Briefcase,
  UserCheck,
  Target,
  Zap,
} from "lucide-react";
import JobSearchBar from "@/components/jobs/JobSearchBar";

const stats = [
  { label: "Active Jobs", value: "1,200+", icon: Briefcase },
  { label: "Companies Hiring", value: "500+", icon: Building2 },
  { label: "Candidates Placed", value: "10,000+", icon: UserCheck },
  { label: "Industries Covered", value: "15+", icon: Target },
];

const industries = [
  { name: "Information Technology", icon: Monitor, count: "450+ jobs", href: "/jobs?industry=Information+Technology" },
  { name: "Banking & Finance", icon: Landmark, count: "180+ jobs", href: "/jobs?industry=Banking+%26+Financial+Services" },
  { name: "AI & Data Science", icon: BrainCircuit, count: "220+ jobs", href: "/jobs?industry=AI+%26+Data+Science" },
  { name: "Agriculture & Agritech", icon: Sprout, count: "90+ jobs", href: "/jobs?industry=Agriculture+%26+Agritech" },
  { name: "Healthcare & Pharma", icon: Stethoscope, count: "150+ jobs", href: "/jobs?industry=Healthcare+%26+Pharma" },
  { name: "E-commerce & Retail", icon: ShoppingCart, count: "120+ jobs", href: "/jobs?industry=E-commerce+%26+Retail" },
];

const howItWorks = [
  {
    step: "01",
    title: "Create Your Profile",
    description: "Sign up and build your professional profile with skills, experience, and resume.",
    icon: Users,
  },
  {
    step: "02",
    title: "Search & Apply",
    description: "Browse jobs by industry, location, or skill. Apply with one click.",
    icon: Search,
  },
  {
    step: "03",
    title: "Get Matched",
    description: "Our AI matches you with the best-fit roles based on your profile.",
    icon: Zap,
  },
  {
    step: "04",
    title: "Get Hired",
    description: "Interview with top companies and land your dream job.",
    icon: Award,
  },
];

export default function HomePage() {
  return (
    <>
      {/* ============== HERO SECTION ============== */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-400 rounded-full blur-3xl" />
        </div>

        <div className="container-main relative z-10 py-20 md:py-28 lg:py-36">
          <div className="max-w-4xl mx-auto text-center mb-10 md:mb-14">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight mb-6">
              Find the Right{" "}
              <span className="text-primary-300">Jobs</span> &{" "}
              <span className="text-primary-300">Talent</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-100 max-w-2xl mx-auto leading-relaxed">
              India&apos;s trusted recruitment platform connecting top talent with
              leading companies across IT, Banking, Data Science, and more.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-5xl mx-auto">
            <JobSearchBar variant="hero" />
          </div>

          {/* Popular Searches */}
          <div className="max-w-3xl mx-auto mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="text-primary-200">Popular:</span>
            {["React Developer", "Data Analyst", "Java", "Python", "DevOps", "Product Manager"].map(
              (term) => (
                <Link
                  key={term}
                  href={`/jobs?keyword=${encodeURIComponent(term)}`}
                  className="px-3 py-1 rounded-full bg-white/10 text-primary-100 hover:bg-white/20 transition-colors"
                >
                  {term}
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* ============== STATS BAR ============== */}
      <section className="bg-white border-b border-gray-100">
        <div className="container-main py-8 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 rounded-xl mb-3">
                  <stat.icon className="w-6 h-6 text-primary-600" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 font-heading">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== WHO WE ARE ============== */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container-main">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="section-heading mb-6">Who We Are</h2>
            <p className="section-subheading mb-8">
              We are the bridge connecting the right candidates with the right
              opportunities. Arbeit is a leading professional recruitment agency
              specializing in permanent, contract, and temporary placements for
              India&apos;s top companies.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {[
                "Staffing Solutions",
                "Technology Consulting",
                "Process Automation",
                "Project Outsourcing",
              ].map((item) => (
                <span key={item} className="flex items-center gap-2 text-sm text-gray-700 bg-white px-4 py-2 rounded-full shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-accent-600" />
                  {item}
                </span>
              ))}
            </div>
            <Link href="/about" className="btn-secondary">
              Learn More About Us
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============== BROWSE BY INDUSTRY ============== */}
      <section className="bg-white py-16 md:py-24">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="section-heading mb-4">Browse by Industry</h2>
            <p className="section-subheading">
              We offer a variety of staffing solutions across India&apos;s top
              industries
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((ind) => (
              <Link
                key={ind.name}
                href={ind.href}
                className="card p-6 flex items-center gap-4 group hover:border-primary-200"
              >
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                  <ind.icon className="w-7 h-7 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {ind.name}
                  </h3>
                  <p className="text-sm text-gray-500">{ind.count}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============== HOW IT WORKS ============== */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="section-heading mb-4">How It Works</h2>
            <p className="section-subheading">
              Your journey from job search to getting hired, simplified
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, i) => (
              <div key={step.step} className="text-center relative">
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] border-t-2 border-dashed border-primary-200" />
                )}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-2xl mb-5 relative z-10">
                  <step.icon className="w-9 h-9 text-primary-600" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== HOW WE CAN HELP ============== */}
      <section className="bg-white py-16 md:py-24">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-heading mb-6">How We Can Help You</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                We combine rich experience and intelligence with AI and ML
                technology — from searching to scoring profiles for the best
                candidate-role fitment.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                With organizations, we work as an embedded team to fulfill hiring
                needs. With candidates, we help create the right resume and match
                you to the right role.
              </p>
              <div className="space-y-4">
                {[
                  "AI-powered candidate-role matching",
                  "End-to-end recruitment process management",
                  "Resume building and career guidance",
                  "Dedicated account managers for employers",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent-600 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-8">
                <Link href="/jobs" className="btn-primary">
                  Find Jobs
                </Link>
                <Link href="/recruitment" className="btn-secondary">
                  Hire Talent
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl p-8 lg:p-12">
                <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Profile Match Score</p>
                      <p className="text-xs text-gray-500">Based on skills & experience</p>
                    </div>
                    <span className="ml-auto text-2xl font-bold text-green-600">92%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-[92%] bg-gradient-to-r from-green-500 to-green-400 rounded-full" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900">45</p>
                      <p className="text-xs text-gray-500">Jobs Matched</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900">12</p>
                      <p className="text-xs text-gray-500">Applied</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900">3</p>
                      <p className="text-xs text-gray-500">Interviews</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== FOR EMPLOYERS CTA ============== */}
      <section className="bg-primary-900 py-16 md:py-20">
        <div className="container-main text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
            Looking to Hire Top Talent?
          </h2>
          <p className="text-primary-200 text-lg mb-8 max-w-2xl mx-auto">
            Post your job openings and reach thousands of qualified candidates.
            Our recruitment experts will help you find the perfect fit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register?role=employer"
              className="btn-primary bg-white text-primary-900 hover:bg-gray-100"
            >
              <Building2 className="w-5 h-5 mr-2" />
              Register as Employer
            </Link>
            <Link href="/recruitment" className="btn-secondary border-white text-white hover:bg-white/10">
              Learn About Our Services
            </Link>
          </div>
        </div>
      </section>

      {/* ============== JOIN OUR TEAM ============== */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container-main">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 md:p-14 text-center">
            <span className="text-primary-200 text-sm font-semibold uppercase tracking-wider">
              Join Our Team
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mt-3 mb-4">
              We&apos;d love to have more talented people on board.
            </h2>
            <p className="text-primary-100 mb-8 max-w-xl mx-auto">
              Be part of a team that&apos;s transforming how India hires. We&apos;re
              always looking for passionate individuals.
            </p>
            <Link href="/contact" className="btn-primary bg-white text-primary-800 hover:bg-gray-100">
              Get in Touch
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
