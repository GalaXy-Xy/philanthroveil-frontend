"use client";

import { useState } from "react";
import { usePhilanthroVeil } from "@/hooks/PhilanthroVeilProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateProjectPage() {
  const router = useRouter();
  const { createProject, isLoading: contractLoading } = usePhilanthroVeil();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    goal: "",
    imageUrl: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("Project name is required");
      return;
    }
    
    if (!formData.description.trim()) {
      setError("Project description is required");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const projectId = await createProject(
        formData.name,
        formData.description,
        formData.goal || "",
        formData.imageUrl || ""
      );
      
      alert(`✅ Project created successfully! Project ID: ${projectId}`);
      router.push(`/projects/${projectId}`);
    } catch (error: any) {
      console.error("Failed to create project:", error);
      setError(error.message || "Failed to create project. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/projects" className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center">
          ← Back to Projects
        </Link>
        
        <h1 className="text-4xl font-bold mb-4 text-slate-900">Create Charitable Project</h1>
        <p className="text-slate-600 mb-8">
          Create a new project to receive anonymous encrypted donations on the blockchain.
        </p>

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-900">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-md bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              placeholder="e.g., Clean Water Initiative"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isCreating}
              maxLength={100}
            />
            <p className="text-xs text-slate-500 mt-1">{formData.name.length}/100 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-900">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-md bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              placeholder="Describe your project, its purpose, and how donations will be used..."
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              disabled={isCreating}
              maxLength={1000}
            />
            <p className="text-xs text-slate-500 mt-1">{formData.description.length}/1000 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-900">Goal</label>
            <textarea
              className="w-full px-4 py-3 rounded-md bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              placeholder="What is the goal or target for this project? (optional)"
              rows={3}
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              disabled={isCreating}
              maxLength={500}
            />
            <p className="text-xs text-slate-500 mt-1">{formData.goal.length}/500 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-900">
              Image URL (optional)
            </label>
            <input
              type="url"
              className="w-full px-4 py-3 rounded-md bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              placeholder="https://example.com/image.jpg"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              disabled={isCreating}
            />
            <p className="text-xs text-slate-500 mt-1">
              Provide a URL to an image that represents your project
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-slate-700">
              <strong>Note:</strong> Once created, your project will be publicly visible and can
              receive encrypted donations. You will be the project creator and can close the project
              at any time.
            </p>
          </div>

          <button
            type="submit"
            disabled={isCreating || contractLoading}
            className="btn-primary w-full py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "Creating Project..." : "Create Project"}
          </button>
        </form>
      </div>
    </div>
  );
}

