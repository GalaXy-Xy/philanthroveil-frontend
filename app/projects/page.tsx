"use client";

import Link from "next/link";
import { usePhilanthroVeil } from "@/hooks/PhilanthroVeilProvider";
import { useEffect, useState } from "react";

interface Project {
  id: number;
  name: string;
  description: string;
  goal: string;
  imageUrl: string;
  creator: string;
  donorCount: number;
  isActive: boolean;
  createdAt: number;
}

export default function ProjectsPage() {
  const { contract, isLoading: contractLoading } = usePhilanthroVeil();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      if (!contract) {
        setIsLoading(false);
        return;
      }

      try {
        const count = await contract.projectCount();
        const projectsData: Project[] = [];

        for (let i = 0; i < Number(count); i++) {
          const projectData = await contract.getProject(i);
          projectsData.push({
            id: i,
            name: projectData[0],
            description: projectData[1],
            goal: projectData[2],
            imageUrl: projectData[3],
            creator: projectData[4],
            donorCount: Number(projectData[5]),
            // projectData[6] is totalDonations (euint64) - skip it
            isActive: projectData[7],
            createdAt: Number(projectData[8]),
          });
        }

        setProjects(projectsData);
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [contract]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 text-slate-900">Charitable Projects</h1>
          <p className="text-slate-600 text-lg">Browse and support anonymous charitable projects</p>
        </div>

        {isLoading || contractLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-600">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-6xl mb-6">📦</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">No Projects Yet</h2>
            <p className="text-slate-600 mb-8">
              Be the first to create a charitable project on PhilanthroVeil!
            </p>
            <Link href="/projects/create" className="btn-primary px-8 py-3 inline-block">
              ➕ Create First Project
            </Link>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="glass-card p-6 hover:shadow-xl transition-shadow flex flex-col"
                >
                  {project.imageUrl && (
                    <div className="mb-4 h-48 rounded-lg overflow-hidden bg-slate-200">
                      <img
                        src={project.imageUrl}
                        alt={project.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <h3 className="text-xl font-semibold mb-2 text-slate-900">
                    {project.name}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4 flex-grow line-clamp-3">
                    {project.description}
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>👥 {project.donorCount} donors</span>
                      <span>
                        {project.isActive ? (
                          <span className="text-green-600 font-medium">● Active</span>
                        ) : (
                          <span className="text-red-600 font-medium">● Closed</span>
                        )}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Created: {formatDate(project.createdAt)}
                    </div>
                  </div>
                  <Link
                    href={`/projects/${project.id}`}
                    className="btn-primary text-sm px-4 py-2 text-center block"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link href="/projects/create" className="btn-primary px-6 py-3 inline-block">
                ➕ Create New Project
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

