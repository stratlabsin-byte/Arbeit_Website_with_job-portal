"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  INDUSTRIES,
  JOB_TYPES,
  EXPERIENCE_LEVELS,
  LOCATIONS,
} from "@/types";
import {
  Briefcase,
  X,
  Loader2,
  Eye,
  ArrowLeft,
  Save,
  MapPin,
  IndianRupee,
  Clock,
  Building2,
} from "lucide-react";

const postJobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  jobType: z.string().min(1, "Please select a job type"),
  experienceLevel: z.string().min(1, "Please select experience level"),
  experienceMin: z.coerce.number().min(0).default(0),
  experienceMax: z.coerce.number().optional(),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  salaryCurrency: z.string().default("INR"),
  showSalary: z.boolean().default(true),
  location: z.string().min(1, "Please select a location"),
  isRemote: z.boolean().default(false),
  industry: z.string().min(1, "Please select an industry"),
  department: z.string().optional(),
  vacancies: z.coerce.number().min(1).default(1),
  deadline: z.string().optional(),
});

type PostJobFormData = z.infer<typeof postJobSchema>;

export default function PostJobPage() {
  const router = useRouter();
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PostJobFormData>({
    resolver: zodResolver(postJobSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      requirements: "",
      responsibilities: "",
      jobType: "",
      experienceLevel: "",
      experienceMin: 0,
      salaryCurrency: "INR",
      showSalary: true,
      location: "",
      isRemote: false,
      industry: "",
      department: "",
      vacancies: 1,
      deadline: "",
    },
  });

  const formValues = watch();

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      const newSkill = skillInput.trim();
      if (!skills.includes(newSkill)) {
        setSkills([...skills, newSkill]);
      }
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const onSubmit = async (data: PostJobFormData) => {
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        ...data,
        skills: JSON.stringify(skills),
        experienceMax: data.experienceMax || null,
        salaryMin: data.salaryMin || null,
        salaryMax: data.salaryMax || null,
        deadline: data.deadline || null,
      };

      const res = await fetch("/api/employers/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/employer/manage-jobs");
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to create job posting.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (showPreview) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowPreview(false)}
            className="btn-secondary text-sm px-4 py-2 flex items-center"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Edit
          </button>
          <h1 className="section-heading">Job Preview</h1>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={submitting}
            className="btn-primary text-sm px-6 py-2 flex items-center"
          >
            {submitting ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : (
              <Save size={16} className="mr-2" />
            )}
            {submitting ? "Publishing..." : "Publish Job"}
          </button>
        </div>

        <div className="card p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {formValues.title || "Untitled Position"}
          </h2>
          <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-6">
            {formValues.location && (
              <span className="flex items-center">
                <MapPin size={14} className="mr-1" />
                {formValues.location}
                {formValues.isRemote && " (Remote)"}
              </span>
            )}
            {formValues.jobType && (
              <span className="flex items-center">
                <Clock size={14} className="mr-1" />
                {JOB_TYPES.find((t) => t.value === formValues.jobType)?.label ||
                  formValues.jobType}
              </span>
            )}
            {formValues.industry && (
              <span className="flex items-center">
                <Building2 size={14} className="mr-1" />
                {formValues.industry}
              </span>
            )}
            {formValues.showSalary &&
              (formValues.salaryMin || formValues.salaryMax) && (
                <span className="flex items-center">
                  <IndianRupee size={14} className="mr-1" />
                  {formValues.salaryMin && formValues.salaryMax
                    ? `${formValues.salaryMin.toLocaleString()} - ${formValues.salaryMax.toLocaleString()}`
                    : formValues.salaryMin
                    ? `${formValues.salaryMin.toLocaleString()}+`
                    : `Up to ${formValues.salaryMax?.toLocaleString()}`}{" "}
                  {formValues.salaryCurrency}/year
                </span>
              )}
          </div>

          {skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Required Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {formValues.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Description
              </h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {formValues.description}
              </p>
            </div>
          )}

          {formValues.requirements && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Requirements
              </h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {formValues.requirements}
              </p>
            </div>
          )}

          {formValues.responsibilities && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Responsibilities
              </h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {formValues.responsibilities}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="section-heading">Post a New Job</h1>
        <button
          onClick={() => setShowPreview(true)}
          className="btn-secondary text-sm px-4 py-2 flex items-center"
        >
          <Eye size={16} className="mr-2" />
          Preview
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title *
              </label>
              <input
                type="text"
                {...register("title")}
                placeholder="e.g., Senior Software Engineer"
                className="input-field"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                {...register("description")}
                rows={6}
                placeholder="Provide a detailed description of the role..."
                className="input-field"
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requirements
              </label>
              <textarea
                {...register("requirements")}
                rows={4}
                placeholder="List the requirements for this role..."
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Responsibilities
              </label>
              <textarea
                {...register("responsibilities")}
                rows={4}
                placeholder="List the key responsibilities..."
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleAddSkill}
            placeholder="Type a skill and press Enter..."
            className="input-field"
          />
        </div>

        {/* Job Details */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Job Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Type *
              </label>
              <select {...register("jobType")} className="input-field">
                <option value="">Select type</option>
                {JOB_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.jobType && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.jobType.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience Level *
              </label>
              <select
                {...register("experienceLevel")}
                className="input-field"
              >
                <option value="">Select level</option>
                {EXPERIENCE_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
              {errors.experienceLevel && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.experienceLevel.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience Min (years)
              </label>
              <input
                type="number"
                {...register("experienceMin")}
                min={0}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience Max (years)
              </label>
              <input
                type="number"
                {...register("experienceMax")}
                min={0}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry *
              </label>
              <select {...register("industry")} className="input-field">
                <option value="">Select industry</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
              {errors.industry && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.industry.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                {...register("department")}
                placeholder="e.g., Engineering"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vacancies
              </label>
              <input
                type="number"
                {...register("vacancies")}
                min={1}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Application Deadline
              </label>
              <input
                type="date"
                {...register("deadline")}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Location
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <select {...register("location")} className="input-field">
                <option value="">Select location</option>
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              {errors.location && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.location.message}
                </p>
              )}
            </div>
            <div className="flex items-end">
              <label className="flex items-center space-x-2 text-sm text-gray-700 pb-2">
                <input
                  type="checkbox"
                  {...register("isRemote")}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Remote work available</span>
              </label>
            </div>
          </div>
        </div>

        {/* Salary */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Compensation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary Min
              </label>
              <input
                type="number"
                {...register("salaryMin")}
                placeholder="e.g., 500000"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary Max
              </label>
              <input
                type="number"
                {...register("salaryMax")}
                placeholder="e.g., 1200000"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select {...register("salaryCurrency")} className="input-field">
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="flex items-center space-x-2 text-sm text-gray-700">
              <input
                type="checkbox"
                {...register("showSalary")}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Show salary on job listing</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="btn-secondary px-6 py-2.5 flex items-center"
          >
            <Eye size={18} className="mr-2" />
            Preview
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary px-8 py-2.5 flex items-center disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 size={18} className="mr-2 animate-spin" />
            ) : (
              <Briefcase size={18} className="mr-2" />
            )}
            {submitting ? "Publishing..." : "Publish Job"}
          </button>
        </div>
      </form>
    </div>
  );
}
