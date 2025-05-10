import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Github,
  ExternalLink,
  Code,
  Database,
  Layers,
  FileType,
  Star,
  GitFork,
  Eye,
  Bug,
  User,
  Calendar,
  Clock,
  Users,
  Package,
  Tag,
  Link as LinkIcon,
  Globe,
  GitBranch,
  FolderGit,
  Copyright,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkEmoji from "remark-emoji";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

import "./App.css";
import Navbar from "./components/Navbar";

// Define types for our data
interface TechItem {
  name: string;
  icon: string;
  color: string;
}

interface RepoInfo {
  name: string;
  owner: string;
  description: string;
  stars: number;
  forks: number;
  watchers: number;
  issues: number;
  createdAt: string;
  updatedAt: string;
  readme?: string;
  licenseInfo?: string;
  language?: string;
  topics?: string[];
  collaborators?: { login: string; avatar_url: string }[];
  branches?: string[];
  defaultBranch?: string;
  releases?: {
    name: string;
    tag_name: string;
    published_at: string;
    url: string;
  }[];
  packages?: { name: string; package_type: string; html_url: string }[];
  homepage?: string;
  website?: string;
}

interface TechData {
  languages: TechItem[];
  frameworks: TechItem[];
  apis: TechItem[];
  resources: TechItem[];
  repoInfo: RepoInfo;
}

// Tech stack data - this would come from your web scraping API
const mockTechData: TechData = {
  languages: [
    { name: "Python", icon: "🐍", color: "bg-blue-100 border-blue-400" },
    {
      name: "JavaScript",
      icon: "🟨",
      color: "bg-yellow-100 border-yellow-400",
    },
    { name: "TypeScript", icon: "🔷", color: "bg-blue-100 border-blue-400" },
  ],
  frameworks: [
    { name: "React", icon: "⚛️", color: "bg-blue-100 border-blue-400" },
    { name: "Next.js", icon: "▲", color: "bg-slate-100 border-slate-400" },
    { name: "TailwindCSS", icon: "🌊", color: "bg-cyan-100 border-cyan-400" },
    { name: "shadcn/ui", icon: "🎨", color: "bg-slate-100 border-slate-400" },
  ],
  apis: [
    {
      name: "GitHub API",
      icon: "🐙",
      color: "bg-purple-100 border-purple-400",
    },
    { name: "REST API", icon: "🔄", color: "bg-green-100 border-green-400" },
  ],
  resources: [
    { name: "Font Awesome", icon: "🔤", color: "bg-red-100 border-red-400" },
    { name: "Google Fonts", icon: "🔠", color: "bg-blue-100 border-blue-400" },
    { name: "Unsplash", icon: "📸", color: "bg-gray-100 border-gray-400" },
  ],
  repoInfo: {
    name: "what-the-tech",
    owner: "KYLEKHAI",
    description:
      "A tool to analyze GitHub repositories and discover their tech stack",
    stars: 42,
    forks: 8,
    watchers: 5,
    issues: 3,
    createdAt: "2023-08-15",
    updatedAt: "2024-02-22",
  },
};

// Function to fetch GitHub repository data
const fetchGitHubRepo = async (
  owner: string,
  repo: string
): Promise<RepoInfo | null> => {
  try {
    // Fetch repository information
    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`
    );

    if (!repoResponse.ok) {
      throw new Error(`GitHub API error: ${repoResponse.status}`);
    }

    const repoData = await repoResponse.json();

    // Fetch README content
    const readmeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`
    );
    let readmeContent = "";

    if (readmeResponse.ok) {
      const readmeData = await readmeResponse.json();
      // Base64 decode the README content
      readmeContent = atob(readmeData.content);
    }

    // Fetch contributors/collaborators
    const contributorsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contributors`
    );
    let collaborators = [];

    if (contributorsResponse.ok) {
      collaborators = await contributorsResponse.json();
    }

    // Fetch branches
    const branchesResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/branches`
    );
    let branches = [];

    if (branchesResponse.ok) {
      const branchesData = await branchesResponse.json();
      branches = branchesData.map((branch: any) => branch.name);
    }

    // Fetch releases
    const releasesResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases`
    );
    let releases = [];

    if (releasesResponse.ok) {
      const releasesData = await releasesResponse.json();
      releases = releasesData.map((release: any) => ({
        name: release.name || release.tag_name,
        tag_name: release.tag_name,
        published_at: new Date(release.published_at).toLocaleDateString(),
        url: release.html_url,
      }));
    }

    // Fetch packages
    const packagesResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/packages`
    );
    let packages = [];

    if (packagesResponse.ok) {
      const packagesData = await packagesResponse.json();
      packages = packagesData.map((pkg: any) => ({
        name: pkg.name,
        package_type: pkg.package_type,
        html_url: pkg.html_url,
      }));
    }

    // Extract homepage URL
    const homepage = repoData.homepage;

    // Look for website links in description or readme
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const descriptionLinks = repoData.description
      ? repoData.description.match(urlRegex)
      : null;
    const website =
      descriptionLinks && descriptionLinks.length > 0
        ? descriptionLinks[0]
        : null;

    return {
      name: repoData.name,
      owner: repoData.owner.login,
      description: repoData.description || "No description provided",
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      watchers: repoData.watchers_count,
      issues: repoData.open_issues_count,
      createdAt: new Date(repoData.created_at).toLocaleDateString(),
      updatedAt: new Date(repoData.updated_at).toLocaleDateString(),
      readme: readmeContent,
      licenseInfo: repoData.license
        ? repoData.license.name
        : "No license information",
      language: repoData.language || "Not specified",
      topics: repoData.topics || [],
      collaborators: collaborators.slice(0, 10),
      branches: branches,
      defaultBranch: repoData.default_branch,
      releases: releases.slice(0, 5),
      packages: packages.slice(0, 5),
      homepage: homepage,
      website: website,
    };
  } catch (error) {
    console.error("Error fetching GitHub data:", error);
    return null;
  }
};

function App() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [techData, setTechData] = useState<TechData | null>(null);
  const [activeTab, setActiveTab] = useState("tech");
  const [readmeView, setReadmeView] = useState("rendered");

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault();

    if (!url) {
      setError("Please enter a GitHub repository URL");
      return;
    }

    if (!url.includes("github.com/")) {
      setError("Please enter a valid GitHub repository URL");
      return;
    }

    setError(null);
    setIsLoading(true);

    // Extract owner and repo from GitHub URL
    const repoDetails = getRepoDetailsFromUrl(url);

    if (!repoDetails) {
      setError("Could not parse GitHub repository URL");
      setIsLoading(false);
      return;
    }

    try {
      // Fetch real GitHub data
      const repoInfo = await fetchGitHubRepo(
        repoDetails.owner,
        repoDetails.repo
      );

      if (!repoInfo) {
        throw new Error("Failed to fetch repository information");
      }

      // Update tech data with fetched repo info
      const updatedTechData = {
        ...mockTechData,
        repoInfo,
      };

      setTechData(updatedTechData);
      setIsLoading(false);
    } catch (err) {
      setError(
        "Failed to analyze repository. Please check the URL and try again."
      );
      setIsLoading(false);
    }
  };

  // Function to extract repo details from GitHub URL
  const getRepoDetailsFromUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/").filter(Boolean);
      if (pathParts.length >= 2) {
        return {
          owner: pathParts[0],
          repo: pathParts[1],
        };
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      <Navbar />
      <main className="min-h-screen flex flex-col items-center justify-start px-4 pt-24 pb-16 bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">What the Tech!</h1>

        <p className="text-lg mb-10 max-w-xl leading-relaxed text-center">
          Ever wondered{" "}
          <span className="line-through">
            <i>what the heck</i>
          </span>{" "}
          <span className="font-semibold text-600 shiny-text">
            what the tech
          </span>{" "}
          is behind a project on GitHub?
          <span className="block mt-2">
            Easily scan repos to analyze and understand their tech stacks!
          </span>
        </p>

        {!techData ? (
          <Card className="w-full max-w-xl border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl">
            <CardContent className="pt-6 pb-8 px-6 md:px-8">
              {/* GitHub Header */}
              <div className="flex items-center justify-center mb-6">
                <Github
                  size={28}
                  className="text-gray-800 dark:text-gray-200 mr-3"
                />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Enter a GitHub Repository URL
                </h2>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6 text-left">
                <div className="space-y-4">
                  {/* Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      className="w-full pl-12 pr-4 py-6 text-base border-2 border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-gray-500 transition-colors duration-200"
                      placeholder="https://github.com/username/repository"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Error Alert */}
                  {error && (
                    <Alert variant="destructive">
                      <AlertTitle>Invalid URL</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Button */}
                <Button
                  type="submit"
                  className="w-full py-5 text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Repository"
                  )}
                </Button>
              </form>

              {/* Demo link */}
              <div className="mt-6 text-sm text-gray-500 text-center">
                Demo:{" "}
                <span
                  className="text-blue-600 hover:underline cursor-pointer"
                  onClick={() =>
                    setUrl("https://github.com/KYLEKHAI/what-the-tech")
                  }
                >
                  https://github.com/KYLEKHAI/what-the-tech
                </span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="w-full max-w-4xl">
            {/* Repository Info */}
            <Card className="mb-6 border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {techData?.repoInfo.owner}/{techData?.repoInfo.name}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {techData?.repoInfo.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="mx-auto mt-2 bg-[#24292f] text-white hover:bg-[#24292f] hover:text-white hover:scale-105 transition-transform duration-150 ease-in-out"
                  >
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <span>View GitHub</span>
                      <ExternalLink size={16} className="text-white" />
                    </a>
                  </Button>
                </div>
              </div>

              <CardContent className="pt-4 pb-6 px-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold flex items-center justify-center gap-1">
                      <Star className="w-5 h-5" /> {techData?.repoInfo.stars}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Stars
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold flex items-center justify-center gap-1">
                      <GitFork className="w-5 h-5" /> {techData?.repoInfo.forks}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Forks
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold flex items-center justify-center gap-1">
                      <Eye className="w-5 h-5" /> {techData?.repoInfo.watchers}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Watchers
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold flex items-center justify-center gap-1">
                      <Bug className="w-5 h-5" /> {techData?.repoInfo.issues}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Issues
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <div className="w-full">
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center justify-center rounded-md bg-muted p-1 w-full max-w-[400px]">
                  <button
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 w-full ${
                      activeTab === "tech"
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setActiveTab("tech")}
                  >
                    Technology Stack
                  </button>
                  <button
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 w-full ${
                      activeTab === "details"
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setActiveTab("details")}
                  >
                    Repository Details
                  </button>
                </div>
              </div>

              {/* Technology Stack Tab Content */}
              {activeTab === "tech" && (
                <div className="space-y-6">
                  {/* Languages Section */}
                  <Card className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="py-4 border-b border-gray-200 dark:border-gray-800">
                      <div className="flex items-center">
                        <Code className="mr-2 h-5 w-5" />
                        <CardTitle>Languages</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 pb-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {techData?.languages.map((lang) => (
                          <Card
                            key={lang.name}
                            className="border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-md transition-all"
                          >
                            <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                              <div className="text-3xl mb-2">{lang.icon}</div>
                              <h3 className="font-medium">{lang.name}</h3>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Frameworks Section */}
                  <Card className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="py-4 border-b border-gray-200 dark:border-gray-800">
                      <div className="flex items-center">
                        <Layers className="mr-2 h-5 w-5" />
                        <CardTitle>Frameworks & Libraries</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 pb-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {techData?.frameworks.map((framework) => (
                          <Card
                            key={framework.name}
                            className="border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-md transition-all"
                          >
                            <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                              <div className="text-3xl mb-2">
                                {framework.icon}
                              </div>
                              <h3 className="font-medium">{framework.name}</h3>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* APIs Section */}
                  <Card className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="py-4 border-b border-gray-200 dark:border-gray-800">
                      <div className="flex items-center">
                        <Database className="mr-2 h-5 w-5" />
                        <CardTitle>APIs</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 pb-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {techData?.apis.map((api) => (
                          <Card
                            key={api.name}
                            className="border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-md transition-all"
                          >
                            <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                              <div className="text-3xl mb-2">{api.icon}</div>
                              <h3 className="font-medium">{api.name}</h3>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Resources Section */}
                  <Card className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="py-4 border-b border-gray-200 dark:border-gray-800">
                      <div className="flex items-center">
                        <FileType className="mr-2 h-5 w-5" />
                        <CardTitle>Resources</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 pb-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {techData?.resources.map((resource) => (
                          <Card
                            key={resource.name}
                            className="border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-md transition-all"
                          >
                            <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                              <div className="text-3xl mb-2">
                                {resource.icon}
                              </div>
                              <h3 className="font-medium">{resource.name}</h3>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Repository Details Tab Content */}
              {activeTab === "details" && (
                <Card className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl">
                  <CardHeader className="flex justify-center">
                    <CardTitle>Repository Details</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <div className="space-y-6 w-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-center">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                            <User className="w-4 h-4" /> Owner
                          </h3>
                          <p className="text-base mt-1">
                            {techData?.repoInfo.owner}
                          </p>
                        </div>
                        <div className="text-center">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                            <FolderGit className="w-4 h-4" /> Repository Name
                          </h3>
                          <p className="text-base mt-1">
                            {techData?.repoInfo.name}
                          </p>
                        </div>
                        <div className="text-center">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                            <Calendar className="w-4 h-4" /> Created At
                          </h3>
                          <p className="text-base mt-1">
                            {techData?.repoInfo.createdAt}
                          </p>
                        </div>
                        <div className="text-center">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                            <Clock className="w-4 h-4" /> Last Updated
                          </h3>
                          <p className="text-base mt-1">
                            {techData?.repoInfo.updatedAt}
                          </p>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      {/* Additional Repository Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-center">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                            <Code className="w-4 h-4" /> Primary Language
                          </h3>
                          <p className="text-base mt-1">
                            {techData?.repoInfo.language || "Not specified"}
                          </p>
                        </div>
                        <div className="text-center">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                            <Copyright className="w-4 h-4" /> License
                          </h3>
                          <p className="text-base mt-1">
                            {techData?.repoInfo.licenseInfo || "Not specified"}
                          </p>
                        </div>
                      </div>

                      {/* Links Section */}
                      {(techData?.repoInfo.homepage ||
                        techData?.repoInfo.website) && (
                        <>
                          <Separator className="my-4" />
                          <div className="text-center">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1 mb-3">
                              <Globe className="w-4 h-4" /> Links
                            </h3>
                            <div className="flex flex-wrap justify-center gap-3">
                              {techData.repoInfo.homepage && (
                                <a
                                  href={techData.repoInfo.homepage}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm transition-colors"
                                >
                                  <LinkIcon className="w-4 h-4" />
                                  <span>{techData.repoInfo.homepage}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              {techData.repoInfo.website && (
                                <a
                                  href={techData.repoInfo.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm transition-colors max-w-full"
                                >
                                  <LinkIcon className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">
                                    {techData.repoInfo.website}
                                  </span>
                                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                </a>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Topics */}
                      {techData?.repoInfo.topics &&
                        techData.repoInfo.topics.length > 0 && (
                          <>
                            <Separator className="my-4" />
                            <div className="text-center">
                              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1 mb-2">
                                <Tag className="w-4 h-4" /> Topics
                              </h3>
                              <div className="flex flex-wrap justify-center gap-2">
                                {techData.repoInfo.topics.map((topic) => (
                                  <span
                                    key={topic}
                                    className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium"
                                  >
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                      {/* Releases Section */}
                      {techData?.repoInfo.releases &&
                        techData.repoInfo.releases.length > 0 && (
                          <>
                            <Separator className="my-4" />
                            <div className="text-center">
                              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1 mb-3">
                                <Tag className="w-4 h-4" /> Releases
                              </h3>
                              <div className="flex flex-col items-center gap-2">
                                {techData.repoInfo.releases.map((release) => (
                                  <a
                                    key={release.tag_name}
                                    href={release.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg w-full max-w-md transition-colors"
                                  >
                                    <Tag className="w-4 h-4 flex-shrink-0" />
                                    <div className="flex-1 text-left">
                                      <div className="font-medium">
                                        {release.name}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {release.tag_name} •{" "}
                                        {release.published_at}
                                      </div>
                                    </div>
                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                      {/* Packages Section */}
                      {techData?.repoInfo.packages &&
                        techData.repoInfo.packages.length > 0 && (
                          <>
                            <Separator className="my-4" />
                            <div className="text-center">
                              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1 mb-3">
                                <Package className="w-4 h-4" /> Packages
                              </h3>
                              <div className="flex flex-col items-center gap-2">
                                {techData.repoInfo.packages.map((pkg) => (
                                  <a
                                    key={pkg.name}
                                    href={pkg.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg w-full max-w-md transition-colors"
                                  >
                                    <Package className="w-4 h-4 flex-shrink-0" />
                                    <div className="flex-1 text-left">
                                      <div className="font-medium">
                                        {pkg.name}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {pkg.package_type}
                                      </div>
                                    </div>
                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                      {/* Branches */}
                      {techData?.repoInfo.branches &&
                        techData.repoInfo.branches.length > 0 && (
                          <>
                            <Separator className="my-4" />
                            <div className="text-center">
                              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1 mb-2">
                                <GitBranch className="w-4 h-4" /> Branches
                              </h3>
                              <div className="flex flex-wrap justify-center gap-2">
                                {techData.repoInfo.branches.map((branch) => (
                                  <span
                                    key={branch}
                                    className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium"
                                  >
                                    {branch}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                      {/* Collaborators */}
                      {techData?.repoInfo.collaborators &&
                        techData.repoInfo.collaborators.length > 0 && (
                          <>
                            <Separator className="my-4" />
                            <div className="text-center">
                              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1 mb-2">
                                <Users className="w-4 h-4" /> Contributors
                              </h3>
                              <div className="flex flex-wrap justify-center gap-2">
                                {techData.repoInfo.collaborators.map(
                                  (collaborator) => (
                                    <div
                                      key={collaborator.login}
                                      className="flex flex-col items-center"
                                    >
                                      <img
                                        src={collaborator.avatar_url}
                                        alt={collaborator.login}
                                        className="w-10 h-10 rounded-full"
                                      />
                                      <span className="text-xs mt-1">
                                        {collaborator.login}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </>
                        )}

                      {/* README */}
                      {techData?.repoInfo.readme && (
                        <>
                          <Separator className="my-4" />
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1 mb-3">
                              <FileType className="w-4 h-4" /> README
                            </h3>
                            <div className="mb-4 flex justify-center">
                              <div className="inline-flex items-center justify-center rounded-md bg-muted p-1 w-full max-w-[400px]">
                                <button
                                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 w-full ${
                                    readmeView === "rendered"
                                      ? "bg-background shadow-sm text-foreground"
                                      : "text-muted-foreground hover:text-foreground"
                                  }`}
                                  onClick={() => setReadmeView("rendered")}
                                >
                                  Rendered
                                </button>
                                <button
                                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 w-full ${
                                    readmeView === "raw"
                                      ? "bg-background shadow-sm text-foreground"
                                      : "text-muted-foreground hover:text-foreground"
                                  }`}
                                  onClick={() => setReadmeView("raw")}
                                >
                                  Raw
                                </button>
                              </div>
                            </div>

                            {readmeView === "rendered" ? (
                              <div className="prose dark:prose-invert max-w-none border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                                <ReactMarkdown
                                  remarkPlugins={[
                                    remarkGfm,
                                    remarkEmoji,
                                    remarkMath,
                                  ]}
                                  rehypePlugins={[
                                    rehypeRaw,
                                    rehypeSanitize,
                                    [rehypeHighlight, { ignoreMissing: true }],
                                  ]}
                                  components={{
                                    a: ({ node, ...props }) => (
                                      <a
                                        {...props}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      />
                                    ),
                                    pre: ({ node, ...props }) => (
                                      <pre
                                        {...props}
                                        style={{ overflow: "auto" }}
                                      />
                                    ),
                                    img: ({ node, ...props }) => (
                                      <img
                                        {...props}
                                        style={{ maxWidth: "100%" }}
                                      />
                                    ),
                                  }}
                                >
                                  {techData.repoInfo.readme}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-auto whitespace-pre-wrap raw-markdown border">
                                {techData.repoInfo.readme}
                              </pre>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Re-scan repository button */}
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                onClick={() => {
                  setTechData(null);
                  setUrl("");
                }}
              >
                Analyze Another Repository
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
