"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Save,
  Plus,
  Trash2,
  Upload,
  X,
  GripVertical,
  Loader2,
} from "lucide-react";

interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
  grade?: string;
}

interface ExperienceEntry {
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface ProfileFormData {
  headline: string;
  summary: string;
  location: string;
  phone: string;
  linkedinUrl: string;
  portfolioUrl: string;
  noticePeriod: string;
  workStatus: string;
  experienceYears: number;
  currentSalary: string;
  expectedSalary: string;
  skills: string[];
  education: EducationEntry[];
  experience: ExperienceEntry[];
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeName, setResumeName] = useState("");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      headline: "",
      summary: "",
      location: "",
      phone: "",
      linkedinUrl: "",
      portfolioUrl: "",
      noticePeriod: "",
      workStatus: "FRESHER",
      experienceYears: 0,
      currentSalary: "",
      expectedSalary: "",
      skills: [],
      education: [],
      experience: [],
    },
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({ control, name: "education" });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({ control, name: "experience" });

  const skills = watch("skills");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          const profile = data.data;
          if (profile) {
            setValue("headline", profile.headline || "");
            setValue("summary", profile.summary || "");
            setValue("location", profile.location || "");
            setValue("phone", profile.user?.phone || "");
            setValue("linkedinUrl", profile.linkedinUrl || "");
            setValue("portfolioUrl", profile.portfolioUrl || "");
            setValue("noticePeriod", profile.noticePeriod || "");
            setValue("workStatus", profile.workStatus || "FRESHER");
            setValue("experienceYears", profile.experienceYears || 0);
            setValue("currentSalary", profile.currentSalary?.toString() || "");
            setValue("expectedSalary", profile.expectedSalary?.toString() || "");
            setValue(
              "skills",
              profile.skills ? JSON.parse(profile.skills) : []
            );
            setValue(
              "education",
              profile.education ? JSON.parse(profile.education) : []
            );
            setValue(
              "experience",
              profile.experience ? JSON.parse(profile.experience) : []
            );
            if (profile.resumeName) {
              setResumeName(profile.resumeName);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [setValue]);

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      const newSkill = skillInput.trim();
      if (!skills.includes(newSkill)) {
        setValue("skills", [...skills, newSkill]);
      }
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setValue(
      "skills",
      skills.filter((s) => s !== skillToRemove)
    );
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "application/pdf" || file.name.endsWith(".pdf") || file.name.endsWith(".doc") || file.name.endsWith(".docx"))) {
      setResumeFile(file);
      setResumeName(file.name);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setResumeName(file.name);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    setSaveMessage("");

    try {
      const payload = {
        ...data,
        skills: JSON.stringify(data.skills),
        education: JSON.stringify(data.education),
        experience: JSON.stringify(data.experience),
        currentSalary: data.currentSalary ? parseFloat(data.currentSalary) : null,
        expectedSalary: data.expectedSalary ? parseFloat(data.expectedSalary) : null,
      };

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveMessage("Profile saved successfully!");
      } else {
        const errorData = await res.json();
        setSaveMessage(errorData.error || "Failed to save profile.");
      }
    } catch (error) {
      setSaveMessage("An error occurred while saving.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(""), 4000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="section-heading">My Profile</h1>
        {saveMessage && (
          <p
            className={`text-sm font-medium ${
              saveMessage.includes("success")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {saveMessage}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Personal Info */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Headline
              </label>
              <input
                type="text"
                {...register("headline")}
                placeholder="e.g., Senior Software Engineer"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                {...register("phone")}
                placeholder="+91 XXXXXXXXXX"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                {...register("location")}
                placeholder="e.g., Bangalore"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Status
              </label>
              <select {...register("workStatus")} className="input-field">
                <option value="FRESHER">Fresher</option>
                <option value="EXPERIENCED">Experienced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience (years)
              </label>
              <input
                type="number"
                {...register("experienceYears", { valueAsNumber: true })}
                min={0}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Salary (INR/year)
              </label>
              <input
                type="text"
                {...register("currentSalary")}
                placeholder="e.g., 800000"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Salary (INR/year)
              </label>
              <input
                type="text"
                {...register("expectedSalary")}
                placeholder="e.g., 1200000"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notice Period
              </label>
              <input
                type="text"
                {...register("noticePeriod")}
                placeholder="e.g., 30 days"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn URL
              </label>
              <input
                type="url"
                {...register("linkedinUrl")}
                placeholder="https://linkedin.com/in/..."
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Portfolio URL
              </label>
              <input
                type="url"
                {...register("portfolioUrl")}
                placeholder="https://..."
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Professional Summary */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Professional Summary
          </h2>
          <textarea
            {...register("summary")}
            rows={5}
            placeholder="Write a brief summary about your professional background, key skills, and career goals..."
            className="input-field"
          />
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
            placeholder="Type a skill and press Enter to add..."
            className="input-field"
          />
        </div>

        {/* Education */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Education</h2>
            <button
              type="button"
              onClick={() =>
                appendEducation({
                  institution: "",
                  degree: "",
                  field: "",
                  startYear: "",
                  endYear: "",
                  grade: "",
                })
              }
              className="btn-secondary text-sm px-3 py-1.5 flex items-center"
            >
              <Plus size={16} className="mr-1" />
              Add
            </button>
          </div>
          {educationFields.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              No education entries added yet.
            </p>
          )}
          <div className="space-y-4">
            {educationFields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 border border-gray-200 rounded-lg relative"
              >
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Institution
                    </label>
                    <input
                      type="text"
                      {...register(`education.${index}.institution`)}
                      className="input-field"
                      placeholder="University / College name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Degree
                    </label>
                    <input
                      type="text"
                      {...register(`education.${index}.degree`)}
                      className="input-field"
                      placeholder="e.g., B.Tech"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Field of Study
                    </label>
                    <input
                      type="text"
                      {...register(`education.${index}.field`)}
                      className="input-field"
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Start Year
                    </label>
                    <input
                      type="text"
                      {...register(`education.${index}.startYear`)}
                      className="input-field"
                      placeholder="2018"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      End Year
                    </label>
                    <input
                      type="text"
                      {...register(`education.${index}.endYear`)}
                      className="input-field"
                      placeholder="2022"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Grade / CGPA
                    </label>
                    <input
                      type="text"
                      {...register(`education.${index}.grade`)}
                      className="input-field"
                      placeholder="e.g., 8.5 CGPA"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Experience</h2>
            <button
              type="button"
              onClick={() =>
                appendExperience({
                  company: "",
                  title: "",
                  location: "",
                  startDate: "",
                  endDate: "",
                  current: false,
                  description: "",
                })
              }
              className="btn-secondary text-sm px-3 py-1.5 flex items-center"
            >
              <Plus size={16} className="mr-1" />
              Add
            </button>
          </div>
          {experienceFields.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              No experience entries added yet.
            </p>
          )}
          <div className="space-y-4">
            {experienceFields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 border border-gray-200 rounded-lg relative"
              >
                <button
                  type="button"
                  onClick={() => removeExperience(index)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Job Title
                    </label>
                    <input
                      type="text"
                      {...register(`experience.${index}.title`)}
                      className="input-field"
                      placeholder="e.g., Software Engineer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      {...register(`experience.${index}.company`)}
                      className="input-field"
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      {...register(`experience.${index}.location`)}
                      className="input-field"
                      placeholder="e.g., Bangalore"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center space-x-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        {...register(`experience.${index}.current`)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Currently working here</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Start Date
                    </label>
                    <input
                      type="month"
                      {...register(`experience.${index}.startDate`)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      End Date
                    </label>
                    <input
                      type="month"
                      {...register(`experience.${index}.endDate`)}
                      className="input-field"
                      disabled={watch(`experience.${index}.current`)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Description
                    </label>
                    <textarea
                      {...register(`experience.${index}.description`)}
                      rows={3}
                      className="input-field"
                      placeholder="Describe your responsibilities and achievements..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resume Upload */}
        <div className="card p-6" id="resume">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Resume Upload
          </h2>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <Upload
              size={36}
              className="mx-auto text-gray-400 mb-3"
            />
            <p className="text-sm text-gray-600 mb-1">
              Drag and drop your resume here, or{" "}
              <label className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                browse
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </p>
            <p className="text-xs text-gray-400">
              Supported formats: PDF, DOC, DOCX (max 5MB)
            </p>
            {resumeName && (
              <div className="mt-3 inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm">
                <span>{resumeName}</span>
                <button
                  type="button"
                  onClick={() => {
                    setResumeFile(null);
                    setResumeName("");
                  }}
                  className="ml-2 text-green-500 hover:text-green-700"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary px-8 py-2.5 flex items-center disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={18} className="mr-2 animate-spin" />
            ) : (
              <Save size={18} className="mr-2" />
            )}
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
