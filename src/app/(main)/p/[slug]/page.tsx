"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export default function CustomPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch("/api/content?section=customPages")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const found = data.data.find((p: any) => p.slug === slug && !p.hidden);
          if (found) {
            setPage(found);
          } else {
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <section className="py-32 text-center">
        <div className="container-main">
          <h1 className="text-4xl font-bold text-gray-900">Page Not Found</h1>
          <p className="mt-4 text-gray-600">The page you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/" className="mt-8 inline-block px-6 py-3 bg-[#3147FF] text-white rounded-lg font-semibold hover:bg-[#2a3de6] transition-colors">
            Go to Homepage
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      {page.sections?.filter((s: any) => !s.hidden).map((section: any, i: number) => (
        <DynamicSection key={i} section={section} />
      ))}
    </>
  );
}

function DynamicSection({ section }: { section: any }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  switch (section.type) {
    case "hero":
      return (
        <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-24 sm:py-32">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
          {section.backgroundImage && <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${section.backgroundImage})` }} />}
          <div className="container-main relative z-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {section.heading}
            </h1>
            {section.subtitle && (
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-blue-100">
                {section.subtitle}
              </p>
            )}
          </div>
        </section>
      );

    case "text":
      return (
        <section className="py-20 sm:py-28 bg-white">
          <div className="container-main">
            <div className="mx-auto max-w-3xl">
              {section.heading && <h2 className="text-3xl font-bold text-[#0A102F] mb-6">{section.heading}</h2>}
              <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                {section.content}
              </div>
            </div>
          </div>
        </section>
      );

    case "cards":
      return (
        <section className="py-20 sm:py-28 bg-gray-50">
          <div className="container-main">
            {section.heading && (
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl font-bold text-[#0A102F]">{section.heading}</h2>
                {section.subtitle && <p className="mt-4 text-gray-600 text-lg">{section.subtitle}</p>}
              </div>
            )}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {section.items?.map((card: any, ci: number) => (
                <div key={ci} className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-shadow">
                  {card.image && <img src={card.image} alt={card.title} className="w-full h-48 object-cover rounded-xl mb-6" />}
                  <h3 className="text-xl font-bold text-[#0A102F]">{card.title}</h3>
                  <p className="mt-3 text-gray-600 leading-relaxed">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "faq":
      return (
        <section className="py-20 sm:py-28 bg-white">
          <div className="container-main">
            {section.heading && (
              <h2 className="text-3xl font-bold text-[#0A102F] text-center mb-12">{section.heading}</h2>
            )}
            <div className="max-w-3xl mx-auto space-y-4">
              {section.items?.map((faq: any, fi: number) => (
                <div key={fi} className={`bg-white rounded-xl border transition-all ${openFaq === fi ? "border-[#3147FF]/30 shadow-md" : "border-gray-200"}`}>
                  <button
                    onClick={() => setOpenFaq(openFaq === fi ? null : fi)}
                    className="flex items-center justify-between w-full px-6 py-5 text-left"
                  >
                    <span className="text-base font-semibold text-[#0A102F] pr-4">{faq.question}</span>
                    <ChevronDown className={`h-5 w-5 text-[#3147FF] shrink-0 transition-transform ${openFaq === fi ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`overflow-hidden transition-all ${openFaq === fi ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="px-6 pb-5">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "cta":
      return (
        <section className="py-20 sm:py-24 bg-gradient-to-r from-[#3147FF] to-[#1a2eb3] relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.06]" />
          {section.backgroundImage && <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${section.backgroundImage})` }} />}
          <div className="container-main relative z-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">{section.heading}</h2>
            {section.subtitle && <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">{section.subtitle}</p>}
            {section.buttonText && (
              <Link
                href={section.buttonLink || "/contact"}
                className="mt-10 inline-flex items-center gap-2 px-[42px] py-[18px] rounded-[45px] bg-white text-[#3147FF] text-[15px] font-semibold hover:bg-gray-100 transition-colors"
              >
                {section.buttonText}
              </Link>
            )}
          </div>
        </section>
      );

    case "image-text":
      return (
        <section className="py-20 sm:py-28 bg-white">
          <div className="container-main">
            <div className={`grid lg:grid-cols-2 gap-16 items-center ${section.imagePosition === "right" ? "" : "direction-rtl"}`}>
              <div className={section.imagePosition === "right" ? "" : "order-2 lg:order-1"}>
                {section.heading && <h2 className="text-3xl font-bold text-[#0A102F] mb-6">{section.heading}</h2>}
                <div className="text-gray-600 leading-relaxed text-[17px] whitespace-pre-wrap">{section.text}</div>
              </div>
              <div className={section.imagePosition === "right" ? "" : "order-1 lg:order-2"}>
                {section.image && (
                  <img src={section.image} alt={section.heading || "Image"} className="w-full rounded-2xl shadow-lg" />
                )}
              </div>
            </div>
          </div>
        </section>
      );

    default:
      return null;
  }
}
