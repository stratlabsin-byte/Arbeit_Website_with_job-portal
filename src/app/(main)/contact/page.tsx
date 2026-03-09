"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
} from "lucide-react";

// Metadata must be in a separate file for client components or set via generateMetadata in layout
// Export is handled by the parent layout or a separate metadata file

const contactSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be under 50 characters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be under 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .max(15, "Phone number is too long")
    .optional()
    .or(z.literal("")),
  jobTitle: z.string().max(100).optional().or(z.literal("")),
  company: z.string().max(100).optional().or(z.literal("")),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be under 2000 characters"),
  consent: z.literal(true, {
    errorMap: () => ({
      message: "You must agree to our privacy policy to submit this form",
    }),
  }),
});

type ContactFormData = z.infer<typeof contactSchema>;

const contactDetails = [
  {
    icon: MapPin,
    label: "Office Address",
    value: "B-231, First Floor, Greater Kailash-1, New Delhi 110048",
    href: "https://maps.google.com/?q=B-231,+Greater+Kailash-1,+New+Delhi+110048",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "011-45092961",
    href: "tel:01145092961",
  },
  {
    icon: Mail,
    label: "Email",
    value: "info@arbeit.co.in",
    href: "mailto:info@arbeit.co.in",
  },
  {
    icon: Globe,
    label: "Website",
    value: "www.arbeit.co.in",
    href: "https://www.arbeit.co.in",
  },
];

const officeHours = [
  { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM" },
  { day: "Saturday", hours: "10:00 AM - 2:00 PM" },
  { day: "Sunday", hours: "Closed" },
];

export default function ContactPage() {
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setSubmitStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
        error instanceof Error ? error.message : "Failed to submit the form. Please try again."
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
            Contact Us
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-blue-100">
            Get in touch with our team. We&apos;d love to hear from you and
            discuss how we can help.
          </p>
        </div>
      </section>

      {/* Contact Form & Details */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="container-main">
          <div className="grid gap-12 lg:grid-cols-5">
            {/* Form */}
            <div className="lg:col-span-3">
              <h2 className="section-heading text-left">Send Us a Message</h2>
              <p className="mt-2 text-gray-600">
                Fill out the form below and we&apos;ll get back to you within 24
                hours.
              </p>

              {submitStatus === "success" && (
                <div className="mt-6 flex items-start gap-3 rounded-lg bg-green-50 border border-green-200 p-4">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-green-800">
                      Message sent successfully!
                    </p>
                    <p className="mt-1 text-sm text-green-700">
                      Thank you for reaching out. Our team will get back to you
                      shortly.
                    </p>
                  </div>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="mt-6 flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-4">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-red-800">
                      Failed to send message
                    </p>
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
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700"
                    >
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
                      <p className="mt-1.5 text-sm text-red-600">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700"
                    >
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
                      <p className="mt-1.5 text-sm text-red-600">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      {...register("email")}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-sm text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700"
                    >
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
                      <p className="mt-1.5 text-sm text-red-600">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="jobTitle"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Job Title
                    </label>
                    <input
                      id="jobTitle"
                      type="text"
                      {...register("jobTitle")}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
                      placeholder="Software Engineer"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="company"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Company
                    </label>
                    <input
                      id="company"
                      type="text"
                      {...register("company")}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
                      placeholder="Acme Inc."
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    {...register("message")}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors resize-y"
                    placeholder="Tell us how we can help you..."
                  />
                  {errors.message && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {errors.message.message}
                    </p>
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
                    I agree that Arbeit may collect and use my personal
                    information in accordance with their{" "}
                    <a
                      href="/privacy-policy"
                      className="text-blue-600 hover:underline"
                    >
                      Privacy Policy
                    </a>{" "}
                    to respond to my inquiry.
                  </label>
                </div>
                {errors.consent && (
                  <p className="text-sm text-red-600">
                    {errors.consent.message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitStatus === "loading"}
                  className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitStatus === "loading" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Details */}
            <div className="lg:col-span-2">
              <h2 className="section-heading text-left">Get in Touch</h2>
              <p className="mt-2 text-gray-600">
                Reach out to us through any of the following channels.
              </p>

              <div className="mt-8 space-y-6">
                {contactDetails.map((detail) => (
                  <a
                    key={detail.label}
                    href={detail.href}
                    target={detail.icon === MapPin || detail.icon === Globe ? "_blank" : undefined}
                    rel={detail.icon === MapPin || detail.icon === Globe ? "noopener noreferrer" : undefined}
                    className="flex items-start gap-4 group"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                      <detail.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {detail.label}
                      </p>
                      <p className="mt-1 text-gray-900 group-hover:text-blue-700 transition-colors">
                        {detail.value}
                      </p>
                    </div>
                  </a>
                ))}
              </div>

              {/* Office Hours */}
              <div className="mt-10">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-700" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Office Hours
                  </h3>
                </div>
                <div className="mt-4 space-y-3">
                  {officeHours.map((schedule) => (
                    <div
                      key={schedule.day}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-gray-600">{schedule.day}</span>
                      <span
                        className={`font-medium ${
                          schedule.hours === "Closed"
                            ? "text-red-500"
                            : "text-gray-900"
                        }`}
                      >
                        {schedule.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Google Map */}
              <div className="mt-10">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Find Us on the Map
                </h3>
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.7775610984244!2d77.2310508!3d28.5494305!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce3e564dafffb%3A0x3c1745429aa2b85c!2sGreater%20Kailash%20I%2C%20New%20Delhi%2C%20Delhi%20110048!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Arbeit Office Location - Greater Kailash-1, New Delhi"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
