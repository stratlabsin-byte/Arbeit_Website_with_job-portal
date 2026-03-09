import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-8xl font-heading font-bold text-primary-600 mb-4">
          404
        </h1>
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Link>
          <Link href="/jobs" className="btn-secondary">
            <Search className="w-4 h-4 mr-2" />
            Browse Jobs
          </Link>
        </div>
      </div>
    </div>
  );
}
