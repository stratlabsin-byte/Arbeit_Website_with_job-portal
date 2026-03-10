"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Globe,
  Share2,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Building2,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Facebook,
  Twitter,
  Youtube,
} from "lucide-react";

interface SiteSettings {
  siteName: string;
  tagline: string;
  contactEmail: string;
  phone: string;
  address: string;
}

interface SocialLinks {
  linkedin: string;
  facebook: string;
  twitter: string;
  youtube: string;
}

type ToastType = "success" | "error";

interface Toast {
  message: string;
  type: ToastType;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: "",
    tagline: "",
    contactEmail: "",
    phone: "",
    address: "",
  });
  const [social, setSocial] = useState<SocialLinks>({
    linkedin: "",
    facebook: "",
    twitter: "",
    youtube: "",
  });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [loadingSocial, setLoadingSocial] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  function showToast(message: string, type: ToastType) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    // Load site settings
    fetch("/api/admin/content?section=settings")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data?.content) {
          setSettings((prev) => ({ ...prev, ...res.data.content }));
        }
      })
      .catch(console.error)
      .finally(() => setLoadingSettings(false));

    // Load social links
    fetch("/api/admin/content?section=social")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data?.content) {
          setSocial((prev) => ({ ...prev, ...res.data.content }));
        }
      })
      .catch(console.error)
      .finally(() => setLoadingSocial(false));
  }, []);

  async function saveSettings() {
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "settings", content: settings }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Site settings saved successfully.", "success");
      } else {
        showToast(data.error || "Failed to save settings.", "error");
      }
    } catch {
      showToast("Failed to save settings.", "error");
    } finally {
      setSavingSettings(false);
    }
  }

  async function saveSocial() {
    setSavingSocial(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "social", content: social }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Social links saved successfully.", "success");
      } else {
        showToast(data.error || "Failed to save social links.", "error");
      }
    } catch {
      showToast("Failed to save social links.", "error");
    } finally {
      setSavingSocial(false);
    }
  }

  const isLoading = loadingSettings || loadingSocial;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-64 bg-gray-200 rounded-xl" />
        <div className="h-48 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {toast.message}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-7 h-7 text-primary-600" />
          Settings
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage site configuration and social media links.
        </p>
      </div>

      {/* Site Information */}
      <div className="card p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            Site Information
          </h2>
          <button
            onClick={saveSettings}
            disabled={savingSettings}
            className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
          >
            {savingSettings ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Settings
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Building2 className="w-4 h-4 inline mr-1" />
              Site Name
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) =>
                setSettings((s) => ({ ...s, siteName: e.target.value }))
              }
              placeholder="Arbeit"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tagline
            </label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) =>
                setSettings((s) => ({ ...s, tagline: e.target.value }))
              }
              placeholder="India's Most Comprehensive HR Solutions Company"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="w-4 h-4 inline mr-1" />
              Contact Email
            </label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) =>
                setSettings((s) => ({ ...s, contactEmail: e.target.value }))
              }
              placeholder="contact@arbeit.in"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Phone className="w-4 h-4 inline mr-1" />
              Phone
            </label>
            <input
              type="text"
              value={settings.phone}
              onChange={(e) =>
                setSettings((s) => ({ ...s, phone: e.target.value }))
              }
              placeholder="+91 11 1234 5678"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              Address
            </label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) =>
                setSettings((s) => ({ ...s, address: e.target.value }))
              }
              placeholder="New Delhi, India"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-purple-600" />
            Social Media Links
          </h2>
          <button
            onClick={saveSocial}
            disabled={savingSocial}
            className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
          >
            {savingSocial ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Social Links
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Linkedin className="w-4 h-4 inline mr-1" />
              LinkedIn URL
            </label>
            <input
              type="url"
              value={social.linkedin}
              onChange={(e) =>
                setSocial((s) => ({ ...s, linkedin: e.target.value }))
              }
              placeholder="https://linkedin.com/company/arbeit"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Facebook className="w-4 h-4 inline mr-1" />
              Facebook URL
            </label>
            <input
              type="url"
              value={social.facebook}
              onChange={(e) =>
                setSocial((s) => ({ ...s, facebook: e.target.value }))
              }
              placeholder="https://facebook.com/arbeit"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Twitter className="w-4 h-4 inline mr-1" />
              Twitter / X URL
            </label>
            <input
              type="url"
              value={social.twitter}
              onChange={(e) =>
                setSocial((s) => ({ ...s, twitter: e.target.value }))
              }
              placeholder="https://twitter.com/arbeit"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Youtube className="w-4 h-4 inline mr-1" />
              YouTube URL
            </label>
            <input
              type="url"
              value={social.youtube}
              onChange={(e) =>
                setSocial((s) => ({ ...s, youtube: e.target.value }))
              }
              placeholder="https://youtube.com/@arbeit"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
