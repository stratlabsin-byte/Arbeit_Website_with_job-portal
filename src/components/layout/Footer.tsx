"use client";

import Link from "next/link";
import {
  Linkedin,
  Facebook,
  Twitter,
  Youtube,
  MapPin,
  Phone,
  Mail,
  Globe,
  ArrowUp,
  ChevronRight,
} from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#0A102F] text-gray-300">
      {/* Main Footer */}
      <div className="container-main py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-5">
              <div className="w-9 h-9 bg-[#3147FF] rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-lg leading-none">A</span>
              </div>
              <span className="text-xl font-heading font-bold">
                <span className="text-white">arbe</span>
                <span className="text-blue-400">it</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Your bridge to the right career. Specialising in permanent,
              contract and temporary placements across India&apos;s top industries.
            </p>
            <div className="flex space-x-2">
              {[
                { icon: Linkedin, href: "https://www.linkedin.com/company/arbeitassociates/", label: "LinkedIn" },
                { icon: Facebook, href: "https://www.facebook.com/Arbeit-112596254780496", label: "Facebook" },
                { icon: Twitter, href: "https://twitter.com/arbeitasso", label: "Twitter" },
                { icon: Youtube, href: "https://www.youtube.com/channel/UCvJiOFfF7WXscr8fdSq3Cpw", label: "YouTube" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 rounded-md flex items-center justify-center hover:bg-[#3147FF] transition-colors duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-white font-heading font-semibold mb-5 text-sm uppercase tracking-wider">
              Company
            </h5>
            <ul className="space-y-3">
              {[
                { label: "About Us", href: "/about" },
                { label: "Our Services", href: "/recruitment" },
                { label: "Contract Staffing", href: "/contracting" },
                { label: "Browse Jobs", href: "/jobs" },
                { label: "Contact Us", href: "/contact" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3 h-3 text-gray-600" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h5 className="text-white font-heading font-semibold mb-5 text-sm uppercase tracking-wider">
              Job Seekers
            </h5>
            <ul className="space-y-3">
              {[
                { label: "Register Now", href: "/register" },
                { label: "Fresher Jobs", href: "/jobs?experienceLevel=ENTRY" },
                { label: "Remote Jobs", href: "/jobs?isRemote=true" },
                { label: "IT Jobs", href: "/jobs?industry=Information+Technology" },
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms of Use", href: "/terms-of-use" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3 h-3 text-gray-600" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="text-white font-heading font-semibold mb-5 text-sm uppercase tracking-wider">
              Get in Touch
            </h5>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-400">
                  B-231, First Floor, Greater Kailash-1,
                  <br />
                  New Delhi 110048
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <a
                  href="tel:01145092961"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  011-45092961
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a
                  href="mailto:info@arbeit.co.in"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  info@arbeit.co.in
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-sm text-gray-400">www.arbeit.co.in</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-main py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Arbeit Associates. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <Link href="/privacy-policy" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-use" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll to Top */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 w-10 h-10 bg-[#3147FF] text-white rounded-lg shadow-lg
                   flex items-center justify-center hover:bg-[#2a3de6] transition-colors duration-200 z-40"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-4 h-4" />
      </button>
    </footer>
  );
}
