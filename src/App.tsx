import { useState, useEffect, useRef } from "react";
import {
  analyzeRepository,
  type TechData as AnalyzerTechData,
  type RepoInfo as AnalyzerRepoInfo,
  type TechItem as AnalyzerTechItem,
} from "./analyzer"; // Import the analyzer
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
  X,
  ChevronRight,
  Sparkles,
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

interface TechItem extends AnalyzerTechItem {}

interface RepoInfo extends AnalyzerRepoInfo {}

interface TechData {
  languages: TechItem[];
  frameworks: TechItem[];
  apis: TechItem[];
  resources: TechItem[];
  repoInfo: RepoInfo;
  groupedTech?: {
    languages: { [key: string]: TechItem[] };
    frameworks: { [key: string]: TechItem[] };
    apis: { [key: string]: TechItem[] };
    resources: { [key: string]: TechItem[] };
  };
}

// Group Modal Component
interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  items: TechItem[];
}

const GroupModal = ({ isOpen, onClose, groupName, items }: GroupModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="relative bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles size={20} className="text-blue-500" />
            <span>{groupName} Family</span>
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-auto max-h-[calc(80vh-60px)]">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {items.length} technologies related to {groupName}:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {items.map((item) => (
              <Card
                key={item.name}
                className="border border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30 hover:shadow-md transition-all"
              >
                <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                  <div className="mb-2 flex justify-center items-center h-10 w-10">
                    {item.icon}
                  </div>
                  <h3 className="font-medium text-sm">{item.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Stacked Card (for grouped items)
interface StackedCardProps {
  groupKey: string;
  items: TechItem[];
  onClick: () => void;
}

const StackedCard = ({ groupKey, items, onClick }: StackedCardProps) => {
  // Display main item in the stacked card
  const mainItem = items[0];
  const itemCount = items.length;

  return (
    <div className="relative cursor-pointer" onClick={onClick}>
      {/* Background cards for stacked effect */}
      <div className="absolute -right-1 -bottom-1 w-full h-full bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      <div className="absolute -right-0.5 -bottom-0.5 w-full h-full bg-gray-100 dark:bg-gray-800 rounded-xl"></div>

      {/* Main card */}
      <Card className="border border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30 hover:shadow-md transition-all relative z-10">
        <CardContent className="flex flex-col items-center justify-center p-4 text-center">
          <div className="mb-2 flex justify-center items-center h-10 w-10">
            {mainItem.icon}
          </div>
          <h3 className="font-medium text-sm flex items-center gap-1">
            {mainItem.name}
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full px-2 py-0.5">
              +{itemCount - 1}
            </span>
          </h3>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <span>View all</span>
            <ChevronRight className="w-3 h-3 ml-1" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function App() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [techData, setTechData] = useState<TechData | null>(null);
  const [activeTab, setActiveTab] = useState("tech");
  const [readmeView, setReadmeView] = useState("rendered");
  const [activeSection, setActiveSection] = useState<string>("languages");

  // Refs for navigation menu
  const languagesRef = useRef<HTMLDivElement>(null);
  const frameworksRef = useRef<HTMLDivElement>(null);
  const apisRef = useRef<HTMLDivElement>(null);
  const resourcesRef = useRef<HTMLDivElement>(null);

  // Tech group modal state
  const [selectedGroup, setSelectedGroup] = useState<{
    name: string;
    items: TechItem[];
  } | null>(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  // Function to scroll to section
  const scrollToSection = (section: string) => {
    setActiveSection(section);

    const refMap = {
      languages: languagesRef,
      frameworks: frameworksRef,
      apis: apisRef,
      resources: resourcesRef,
    };

    const ref = refMap[section as keyof typeof refMap];
    if (ref?.current) {
      // Resource section different offset due to being last section
      const yOffset = section === "resources" ? -150 : -90;
      const element = ref.current;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;

      window.scrollTo({
        top: y,
        behavior: "smooth",
      });
    }
  };

  // Navigation menu active selection based on scroll
  useEffect(() => {
    if (!techData) return;

    const handleScroll = () => {
      const sections = [
        { id: "languages", ref: languagesRef },
        { id: "frameworks", ref: frameworksRef },
        { id: "apis", ref: apisRef },
        { id: "resources", ref: resourcesRef },
      ];

      for (const section of sections) {
        if (!section.ref.current) continue;

        const rect = section.ref.current.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom >= 120) {
          setActiveSection(section.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [techData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      // Use analyzer function to fetch and process data
      const analysisResult = await analyzeRepository(
        repoDetails.owner,
        repoDetails.repo
      );

      if (!analysisResult) {
        throw new Error("Failed to fetch repository information");
      }

      // Set the fetched and analyzed data
      setTechData(analysisResult);
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

  // Function to handle group card click
  const handleGroupClick = (groupName: string, items: TechItem[]) => {
    setSelectedGroup({ name: groupName, items });
    setIsGroupModalOpen(true);
  };

  // Modified render functions for each tech section to include refs and IDs
  const renderTechSection = (
    title: string,
    icon: React.ReactNode,
    items: TechItem[],
    groupedItems: { [key: string]: TechItem[] } | undefined,
    ref: React.RefObject<HTMLDivElement | null>,
    sectionId: string
  ) => {
    // Array of items not in groupedItems
    const nonGroupedItems = items.filter((item) => {
      if (!groupedItems) return true;
      return !Object.values(groupedItems)
        .flat()
        .some(
          (groupItem) =>
            groupItem.name === item.name &&
            // Exclude if it's the main item of group
            !Object.entries(groupedItems).some(
              ([key, groupItems]) => groupItems[0].name === item.name
            )
        );
    });

    return (
      <div ref={ref} id={sectionId}>
        <Card className="border border-gray-200 dark:border-white/20 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="py-4 border-b border-gray-200 dark:border-white/20 card-header">
            <div className="flex items-center">
              {icon}
              <CardTitle>{title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 pb-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {/* Render grouped items first */}
              {groupedItems &&
                Object.entries(groupedItems).map(([key, groupItems]) => (
                  <StackedCard
                    key={key}
                    groupKey={key}
                    items={groupItems}
                    onClick={() => handleGroupClick(key, groupItems)}
                  />
                ))}

              {/* Render non-grouped items */}
              {nonGroupedItems.map((item) => (
                <Card
                  key={item.name}
                  className="border border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30 hover:shadow-md transition-all"
                >
                  <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                    <div className="mb-2 flex justify-center items-center h-10 w-10">
                      {item.icon}
                    </div>
                    <h3 className="font-medium text-sm">{item.name}</h3>
                  </CardContent>
                </Card>
              ))}

              {items.length === 0 && (
                <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-4">
                  No {title.toLowerCase()} detected
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white flex flex-col">
      <Navbar />

      {/* Group Modal */}
      {selectedGroup && (
        <GroupModal
          isOpen={isGroupModalOpen}
          onClose={() => setIsGroupModalOpen(false)}
          groupName={selectedGroup.name}
          items={selectedGroup.items}
        />
      )}

      <main className="flex-1 flex flex-col items-center justify-start px-4 pt-24 pb-16 bg-white dark:bg-black text-gray-900 dark:text-white">
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
          <Card className="w-full max-w-xl border border-gray-200 dark:border-white/20 shadow-sm rounded-xl">
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
                      className="w-full pl-12 pr-4 py-6 text-base border-2 border-gray-200 dark:border-white/30 hover:border-black dark:hover:border-white/50 transition-colors duration-200"
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
            <Card className="mb-6 border border-gray-200 dark:border-white/20 shadow-sm rounded-xl overflow-hidden">
              <div className="bg-white dark:bg-transparent px-6 py-5 border-b border-gray-200 dark:border-white/20">
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-300">
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
                      <Star className="w-5 h-5 text-yellow-500" />{" "}
                      {techData?.repoInfo.stars}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Stars
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold flex items-center justify-center gap-1">
                      <GitFork className="w-5 h-5 text-orange-500" />{" "}
                      {techData?.repoInfo.forks}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Forks
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold flex items-center justify-center gap-1">
                      <Eye className="w-5 h-5 text-blue-500" />{" "}
                      {techData?.repoInfo.watchers}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Watchers
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold flex items-center justify-center gap-1">
                      <Bug className="w-5 h-5 text-red-500" />{" "}
                      {techData?.repoInfo.issues}
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
                <div className="relative">
                  {/* Left side navigation (sticky) */}
                  <div className="hidden md:block fixed left-8 top-1/2 transform -translate-y-1/2 w-40 z-10">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 overflow-hidden shadow-md">
                      <div className="py-2 px-3 border-b border-gray-100 dark:border-gray-800">
                        <h3 className="text-sm font-medium text-center">
                          Navigation Menu
                        </h3>
                      </div>
                      <div className="p-2 space-y-1.5">
                        <button
                          onClick={() => scrollToSection("languages")}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            activeSection === "languages"
                              ? "bg-white dark:bg-gray-800 font-medium shadow-sm"
                              : "text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/60"
                          }`}
                        >
                          <div className="flex items-center">
                            <Code className="mr-2 h-4 w-4" />
                            <span>Languages</span>
                          </div>
                        </button>
                        <button
                          onClick={() => scrollToSection("frameworks")}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            activeSection === "frameworks"
                              ? "bg-white dark:bg-gray-800 font-medium shadow-sm"
                              : "text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/60"
                          }`}
                        >
                          <div className="flex items-center">
                            <Layers className="mr-2 h-4 w-4" />
                            <span>Frameworks</span>
                          </div>
                        </button>
                        <button
                          onClick={() => scrollToSection("apis")}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            activeSection === "apis"
                              ? "bg-white dark:bg-gray-800 font-medium shadow-sm"
                              : "text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/60"
                          }`}
                        >
                          <div className="flex items-center">
                            <Database className="mr-2 h-4 w-4" />
                            <span>APIs</span>
                          </div>
                        </button>
                        <button
                          onClick={() => scrollToSection("resources")}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            activeSection === "resources"
                              ? "bg-white dark:bg-gray-800 font-medium shadow-sm"
                              : "text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/60"
                          }`}
                        >
                          <div className="flex items-center">
                            <FileType className="mr-2 h-4 w-4" />
                            <span>Resources</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mobile navigation */}
                  <div className="md:hidden mb-6">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
                      <div className="p-2 flex space-x-1">
                        <button
                          onClick={() => scrollToSection("languages")}
                          className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            activeSection === "languages"
                              ? "bg-white dark:bg-gray-800 shadow-sm"
                              : "text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/60"
                          }`}
                        >
                          Languages
                        </button>
                        <button
                          onClick={() => scrollToSection("frameworks")}
                          className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            activeSection === "frameworks"
                              ? "bg-white dark:bg-gray-800 shadow-sm"
                              : "text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/60"
                          }`}
                        >
                          Frameworks
                        </button>
                        <button
                          onClick={() => scrollToSection("apis")}
                          className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            activeSection === "apis"
                              ? "bg-white dark:bg-gray-800 shadow-sm"
                              : "text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/60"
                          }`}
                        >
                          APIs
                        </button>
                        <button
                          onClick={() => scrollToSection("resources")}
                          className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            activeSection === "resources"
                              ? "bg-white dark:bg-gray-800 shadow-sm"
                              : "text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/60"
                          }`}
                        >
                          Resources
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Main tech stack content */}
                  <div className="space-y-6">
                    {renderTechSection(
                      "Languages",
                      <Code className="mr-2 h-5 w-5" />,
                      techData.languages,
                      techData.groupedTech?.languages,
                      languagesRef,
                      "languages"
                    )}

                    {renderTechSection(
                      "Frameworks & Libraries",
                      <Layers className="mr-2 h-5 w-5" />,
                      techData.frameworks,
                      techData.groupedTech?.frameworks,
                      frameworksRef,
                      "frameworks"
                    )}

                    {renderTechSection(
                      "APIs",
                      <Database className="mr-2 h-5 w-5" />,
                      techData.apis,
                      techData.groupedTech?.apis,
                      apisRef,
                      "apis"
                    )}

                    {renderTechSection(
                      "Resources",
                      <FileType className="mr-2 h-5 w-5" />,
                      techData.resources,
                      techData.groupedTech?.resources,
                      resourcesRef,
                      "resources"
                    )}
                  </div>
                </div>
              )}

              {/* Repository Details Tab Content */}
              {activeTab === "details" && (
                <Card className="border border-gray-200 dark:border-white/20 shadow-sm rounded-xl">
                  <CardHeader className="flex justify-center card-header">
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

                      {/* Topics Section */}
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
                              <div className="flex flex-wrap justify-center gap-3">
                                {techData.repoInfo.releases.map((release) => (
                                  <a
                                    key={release.tag_name}
                                    href={release.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm transition-colors"
                                  >
                                    <Tag className="w-4 h-4 flex-shrink-0" />
                                    <span>
                                      {release.name || release.tag_name}
                                    </span>
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
                              <div className="flex flex-wrap justify-center gap-3">
                                {techData.repoInfo.packages.map((pkg) => (
                                  <a
                                    key={pkg.name}
                                    href={pkg.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm transition-colors"
                                  >
                                    <Package className="w-4 h-4 flex-shrink-0" />
                                    <span>{pkg.name}</span>
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
                                    <a
                                      key={collaborator.login}
                                      href={`https://github.com/${collaborator.login}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex flex-col items-center hover:opacity-80 transition-all group"
                                    >
                                      <div className="relative">
                                        <img
                                          src={collaborator.avatar_url}
                                          alt={collaborator.login}
                                          className="w-10 h-10 rounded-full group-hover:ring-2 group-hover:ring-black dark:group-hover:ring-white transition-all"
                                        />
                                      </div>
                                      <span className="text-xs mt-1 text-gray-800 dark:text-gray-200">
                                        {collaborator.login}
                                      </span>
                                    </a>
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
                              <div className="prose dark:prose-invert max-w-none border rounded-lg p-4 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-white/20">
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
                              <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-auto whitespace-pre-wrap raw-markdown border border-gray-200 dark:border-white/20">
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
                className="bg-[#2da44e] text-white hover:bg-[#2c974b] dark:bg-[#d03592] dark:text-white dark:hover:bg-[#b52c7b] border-0"
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

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-6 w-full bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="flex flex-row justify-between items-center">
            <div>
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                What The Tech!
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Kyle Khai Tran | 2025
              </p>
            </div>
            <div className="flex items-center justify-center">
              <img
                src="/what-the-stack-logo-tp.png"
                alt="What The Tech Logo"
                className="h-12 w-auto dark:bg-white/90 dark:p-1 dark:rounded-full transition-all"
              />
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/KYLEKHAI/what-the-tech"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-full transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-github"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                  <path d="M9 18c-4.51 2-5-2-7-2"></path>
                </svg>
                Source Code
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
