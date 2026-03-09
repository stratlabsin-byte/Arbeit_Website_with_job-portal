"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Building2,
  Upload,
  Loader2,
  AlertCircle,
  Briefcase,
  GraduationCap,
} from "lucide-react";

// ---- Schemas ----

const jobSeekerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    phone: z
      .string()
      .regex(/^[+]?[\d\s()-]{7,15}$/, "Please enter a valid phone number")
      .optional()
      .or(z.literal("")),
    workStatus: z.enum(["FRESHER", "EXPERIENCED"], {
      required_error: "Please select your work status",
    }),
    terms: z.literal(true, {
      errorMap: () => ({
        message: "You must accept the Terms & Privacy Policy",
      }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const employerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    phone: z
      .string()
      .regex(/^[+]?[\d\s()-]{7,15}$/, "Please enter a valid phone number")
      .optional()
      .or(z.literal("")),
    companyName: z.string().min(2, "Company name must be at least 2 characters"),
    terms: z.literal(true, {
      errorMap: () => ({
        message: "You must accept the Terms & Privacy Policy",
      }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type JobSeekerFormData = z.infer<typeof jobSeekerSchema>;
type EmployerFormData = z.infer<typeof employerSchema>;

// ---- Component ----

export default function RegisterPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"JOB_SEEKER" | "EMPLOYER">(
    "JOB_SEEKER"
  );
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // Job Seeker form
  const jobSeekerForm = useForm<JobSeekerFormData>({
    resolver: zodResolver(jobSeekerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      workStatus: "FRESHER",
    },
  });

  // Employer form
  const employerForm = useForm<EmployerFormData>({
    resolver: zodResolver(employerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      companyName: "",
    },
  });

  const currentForm = activeTab === "JOB_SEEKER" ? jobSeekerForm : employerForm;
  const isSubmitting = currentForm.formState.isSubmitting;

  const submitRegistration = async (
    data: JobSeekerFormData | EmployerFormData
  ) => {
    setError(null);

    try {
      const payload: Record<string, string> = {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone || "",
        role: activeTab,
      };

      if (activeTab === "JOB_SEEKER" && "workStatus" in data) {
        payload.workStatus = data.workStatus;
      }

      if (activeTab === "EMPLOYER" && "companyName" in data) {
        payload.companyName = data.companyName;
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Registration failed. Please try again.");
        return;
      }

      // Auto sign-in after successful registration
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Registration succeeded but auto-login failed — redirect to login
        router.push("/login?registered=true");
        return;
      }

      router.push(
        activeTab === "EMPLOYER" ? "/dashboard/employer" : "/dashboard"
      );
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setError("Google sign-up failed. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setResumeFile(file);
  };

  // Shared input renderer for DRY-ness
  const renderInput = (
    id: string,
    label: string,
    type: string,
    placeholder: string,
    icon: React.ReactNode,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerFn: any,
    errorMsg?: string,
    extra?: React.ReactNode
  ) => (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          className={`input-field pl-11 ${
            extra ? "pr-11" : ""
          } w-full h-12 rounded-xl border bg-white px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition ${
            errorMsg ? "border-red-400" : "border-gray-300"
          }`}
          {...registerFn}
        />
        {extra}
      </div>
      {errorMsg && (
        <p className="mt-1.5 text-sm text-red-600">{errorMsg}</p>
      )}
    </div>
  );

  const passwordToggle = (
    shown: boolean,
    toggle: () => void
  ) => (
    <button
      type="button"
      onClick={toggle}
      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition"
    >
      {shown ? (
        <EyeOff className="h-5 w-5" />
      ) : (
        <Eye className="h-5 w-5" />
      )}
    </button>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Create your account
          </h1>
          <p className="mt-2 text-gray-600">
            Join thousands of professionals on Arbeit
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab("JOB_SEEKER");
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition ${
              activeTab === "JOB_SEEKER"
                ? "bg-white text-primary-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            Job Seeker
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("EMPLOYER");
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition ${
              activeTab === "EMPLOYER"
                ? "bg-white text-primary-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Building2 className="h-4 w-4" />
            Employer
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ===== JOB SEEKER FORM ===== */}
        {activeTab === "JOB_SEEKER" && (
          <form
            onSubmit={jobSeekerForm.handleSubmit(submitRegistration)}
            className="space-y-5"
          >
            {renderInput(
              "js-name",
              "Full Name",
              "text",
              "John Doe",
              <User className="h-5 w-5 text-gray-400" />,
              jobSeekerForm.register("name"),
              jobSeekerForm.formState.errors.name?.message
            )}

            {renderInput(
              "js-email",
              "Email address",
              "email",
              "you@example.com",
              <Mail className="h-5 w-5 text-gray-400" />,
              jobSeekerForm.register("email"),
              jobSeekerForm.formState.errors.email?.message
            )}

            {/* Password row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderInput(
                "js-password",
                "Password",
                showPassword ? "text" : "password",
                "Min. 8 characters",
                <Lock className="h-5 w-5 text-gray-400" />,
                jobSeekerForm.register("password"),
                jobSeekerForm.formState.errors.password?.message,
                passwordToggle(showPassword, () =>
                  setShowPassword(!showPassword)
                )
              )}
              {renderInput(
                "js-confirm",
                "Confirm Password",
                showConfirmPassword ? "text" : "password",
                "Re-enter password",
                <Lock className="h-5 w-5 text-gray-400" />,
                jobSeekerForm.register("confirmPassword"),
                jobSeekerForm.formState.errors.confirmPassword?.message,
                passwordToggle(showConfirmPassword, () =>
                  setShowConfirmPassword(!showConfirmPassword)
                )
              )}
            </div>

            {renderInput(
              "js-phone",
              "Phone Number (optional)",
              "tel",
              "+91 98765 43210",
              <Phone className="h-5 w-5 text-gray-400" />,
              jobSeekerForm.register("phone"),
              jobSeekerForm.formState.errors.phone?.message
            )}

            {/* Work Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Work Status
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                    jobSeekerForm.watch("workStatus") === "FRESHER"
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    value="FRESHER"
                    className="sr-only"
                    {...jobSeekerForm.register("workStatus")}
                  />
                  <GraduationCap
                    className={`h-5 w-5 ${
                      jobSeekerForm.watch("workStatus") === "FRESHER"
                        ? "text-primary-600"
                        : "text-gray-400"
                    }`}
                  />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Fresher
                    </div>
                    <div className="text-xs text-gray-500">
                      Less than 1 year
                    </div>
                  </div>
                </label>
                <label
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                    jobSeekerForm.watch("workStatus") === "EXPERIENCED"
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    value="EXPERIENCED"
                    className="sr-only"
                    {...jobSeekerForm.register("workStatus")}
                  />
                  <Briefcase
                    className={`h-5 w-5 ${
                      jobSeekerForm.watch("workStatus") === "EXPERIENCED"
                        ? "text-primary-600"
                        : "text-gray-400"
                    }`}
                  />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Experienced
                    </div>
                    <div className="text-xs text-gray-500">1+ years</div>
                  </div>
                </label>
              </div>
              {jobSeekerForm.formState.errors.workStatus && (
                <p className="mt-1.5 text-sm text-red-600">
                  {jobSeekerForm.formState.errors.workStatus.message}
                </p>
              )}
            </div>

            {/* Resume upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Resume (optional)
              </label>
              <label className="flex items-center justify-center gap-3 w-full h-24 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 cursor-pointer transition">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeChange}
                  className="sr-only"
                />
                <Upload className="h-5 w-5 text-gray-400" />
                <div className="text-sm text-gray-600">
                  {resumeFile ? (
                    <span className="font-medium text-primary-600">
                      {resumeFile.name}
                    </span>
                  ) : (
                    <>
                      <span className="font-medium text-primary-600">
                        Upload resume
                      </span>{" "}
                      &mdash; PDF, DOC (max 5MB)
                    </>
                  )}
                </div>
              </label>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 transition"
                {...jobSeekerForm.register("terms")}
              />
              <span className="text-sm text-gray-600">
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-primary-600 hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-primary-600 hover:underline"
                >
                  Privacy Policy
                </Link>
              </span>
            </label>
            {jobSeekerForm.formState.errors.terms && (
              <p className="text-sm text-red-600 -mt-3">
                {jobSeekerForm.formState.errors.terms.message}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Job Seeker Account"
              )}
            </button>
          </form>
        )}

        {/* ===== EMPLOYER FORM ===== */}
        {activeTab === "EMPLOYER" && (
          <form
            onSubmit={employerForm.handleSubmit(submitRegistration)}
            className="space-y-5"
          >
            {renderInput(
              "emp-name",
              "Full Name",
              "text",
              "Jane Smith",
              <User className="h-5 w-5 text-gray-400" />,
              employerForm.register("name"),
              employerForm.formState.errors.name?.message
            )}

            {renderInput(
              "emp-email",
              "Email address",
              "email",
              "you@company.com",
              <Mail className="h-5 w-5 text-gray-400" />,
              employerForm.register("email"),
              employerForm.formState.errors.email?.message
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderInput(
                "emp-password",
                "Password",
                showPassword ? "text" : "password",
                "Min. 8 characters",
                <Lock className="h-5 w-5 text-gray-400" />,
                employerForm.register("password"),
                employerForm.formState.errors.password?.message,
                passwordToggle(showPassword, () =>
                  setShowPassword(!showPassword)
                )
              )}
              {renderInput(
                "emp-confirm",
                "Confirm Password",
                showConfirmPassword ? "text" : "password",
                "Re-enter password",
                <Lock className="h-5 w-5 text-gray-400" />,
                employerForm.register("confirmPassword"),
                employerForm.formState.errors.confirmPassword?.message,
                passwordToggle(showConfirmPassword, () =>
                  setShowConfirmPassword(!showConfirmPassword)
                )
              )}
            </div>

            {renderInput(
              "emp-phone",
              "Phone Number (optional)",
              "tel",
              "+91 98765 43210",
              <Phone className="h-5 w-5 text-gray-400" />,
              employerForm.register("phone"),
              employerForm.formState.errors.phone?.message
            )}

            {renderInput(
              "emp-company",
              "Company Name",
              "text",
              "Acme Corporation",
              <Building2 className="h-5 w-5 text-gray-400" />,
              employerForm.register("companyName"),
              employerForm.formState.errors.companyName?.message
            )}

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 transition"
                {...employerForm.register("terms")}
              />
              <span className="text-sm text-gray-600">
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-primary-600 hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-primary-600 hover:underline"
                >
                  Privacy Policy
                </Link>
              </span>
            </label>
            {employerForm.formState.errors.terms && (
              <p className="text-sm text-red-600 -mt-3">
                {employerForm.formState.errors.terms.message}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Employer Account"
              )}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-gray-50 px-4 text-gray-500">
              Or sign up with
            </span>
          </div>
        </div>

        {/* Google sign-up */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isGoogleLoading}
          className="w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isGoogleLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Sign up with Google
        </button>

        {/* Login link */}
        <p className="text-center text-sm text-gray-600 pb-8">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary-600 hover:text-primary-700 transition"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
