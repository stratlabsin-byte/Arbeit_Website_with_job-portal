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
} from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container-main py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="text-2xl font-heading font-bold text-white">
                arbe<span className="text-primary-400">it</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Your bridge to the right career. We specialize in permanent,
              contract, and temporary placements across top industries in India.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://www.linkedin.com/company/arbeitassociates/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/Arbeit-112596254780496"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com/arbeitasso"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com/channel/UCvJiOFfF7WXscr8fdSq3Cpw"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-white font-heading font-semibold text-lg mb-6">
              Quick Links
            </h5>
            <ul className="space-y-3">
              {[
                { label: "Home", href: "/" },
                { label: "Browse Jobs", href: "/jobs" },
                { label: "About Us", href: "/about" },
                { label: "Contracting", href: "/contracting" },
                { label: "Recruitment Services", href: "/recruitment" },
                { label: "Contact Us", href: "/contact" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Job Seekers / Employers */}
          <div>
            <h5 className="text-white font-heading font-semibold text-lg mb-6">
              Resources
            </h5>
            <ul className="space-y-3">
              {[
                { label: "Register as Job Seeker", href: "/register" },
                { label: "Post a Job", href: "/register?role=employer" },
                { label: "Fresher Jobs", href: "/jobs?experienceLevel=ENTRY" },
                { label: "Remote Jobs", href: "/jobs?isRemote=true" },
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms of Use", href: "/terms-of-use" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="text-white font-heading font-semibold text-lg mb-6">
              Contact Us
            </h5>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  B-231, First Floor, Greater Kailash-1,
                  <br />
                  New Delhi 110048 (India)
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <a
                  href="tel:01145092961"
                  className="text-sm hover:text-primary-400 transition-colors"
                >
                  011-45092961
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <a
                  href="mailto:info@arbeit.co.in"
                  className="text-sm hover:text-primary-400 transition-colors"
                >
                  info@arbeit.co.in
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span className="text-sm">www.arbeit.co.in</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container-main py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Arbeit. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <Link
              href="/privacy-policy"
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-use"
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Terms of Use
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll to Top */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 w-12 h-12 bg-primary-600 text-white rounded-full shadow-lg
                   flex items-center justify-center hover:bg-primary-700 transition-all duration-300
                   opacity-0 hover:opacity-100 focus:opacity-100 z-40"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </footer>
  );
}
