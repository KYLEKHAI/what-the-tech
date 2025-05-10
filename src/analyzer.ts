// src/analyzer.ts
import { getTechIcon } from "./components/IconMap";

// Re-define types here or import from a shared types.ts if you create one
// For now, co-locating simplified versions or assuming they are available globally for snippet.
// In a real setup, you'd import these from where App.tsx defines them or a shared types file.
export interface TechItem {
  name: string;
  icon: React.ReactNode;
}

export interface RepoInfo {
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

export interface TechData {
  languages: TechItem[];
  frameworks: TechItem[];
  apis: TechItem[];
  resources: TechItem[];
  repoInfo: RepoInfo;
}

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

async function fetchGitHubApi<T>(
  url: string,
  isRawContent: boolean = false
): Promise<T | null> {
  try {
    const headers: HeadersInit = {
      Accept: isRawContent
        ? "application/vnd.github.v3.raw"
        : "application/json",
    };
    if (GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
    }
    const response = await fetch(url, { headers });
    if (!response.ok) {
      console.error(
        `GitHub API error for ${url}: ${response.status} ${response.statusText}`
      );
      if (response.status === 403) {
        console.warn(
          "GitHub API rate limit likely exceeded. Ensure VITE_GITHUB_TOKEN is set in .env.local"
        );
      }
      if (response.status === 404) {
        console.log(`Resource not found: ${url}`);
      }
      return null;
    }
    return isRawContent
      ? ((await response.text()) as T)
      : ((await response.json()) as T);
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
}

async function fetchFileContent(
  owner: string,
  repo: string,
  path: string
): Promise<string | null> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`;
  // Try fetching raw first, if it's a text file this is efficient
  let content = await fetchGitHubApi<string>(url, true);

  if (content === null || typeof content !== "string") {
    // If raw failed or returned JSON object (e.g. 404 gave JSON)
    // Fallback to JSON endpoint to get base64 content
    const fileData = await fetchGitHubApi<{
      content?: string;
      encoding?: string;
      message?: string;
    }>(url);
    if (fileData && fileData.content && fileData.encoding === "base64") {
      try {
        content = atob(fileData.content);
      } catch (e) {
        console.error(`Error decoding base64 content for ${path}:`, e);
        return null;
      }
    } else if (fileData && fileData.message) {
      // E.g. "Not Found"
      console.log(
        `File ${path} not found or issue fetching: ${fileData.message}`
      );
      return null;
    } else {
      return null; // Could not retrieve content
    }
  }
  return content;
}

// Updated fetchGitHubRepo to use the new fetchGitHubApi and token
export const fetchGitHubRepoData = async (
  owner: string,
  repo: string
): Promise<RepoInfo | null> => {
  const repoData = await fetchGitHubApi<{ [key: string]: any }>(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}`
  );
  if (!repoData) return null;

  let readmeContent = "";
  const readmeData = await fetchGitHubApi<{
    content?: string;
    encoding?: string;
  }>(`${GITHUB_API_BASE}/repos/${owner}/${repo}/readme`);
  if (readmeData && readmeData.content && readmeData.encoding === "base64") {
    try {
      readmeContent = atob(readmeData.content);
    } catch (e) {
      console.error("Error decoding README", e);
    }
  }

  const contributors =
    (await fetchGitHubApi<any[]>(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors`
    )) || [];
  const branchesData =
    (await fetchGitHubApi<any[]>(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/branches`
    )) || [];
  const releasesData =
    (await fetchGitHubApi<any[]>(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/releases`
    )) || [];
  const packagesData =
    (await fetchGitHubApi<any[]>(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/packages`
    )) || [];

  const urlRegex = /(https?:\/\/[^\s()]+)/g;
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
    collaborators: contributors
      .slice(0, 10)
      .map((c: any) => ({ login: c.login, avatar_url: c.avatar_url })),
    branches: branchesData.map((branch: any) => branch.name),
    defaultBranch: repoData.default_branch,
    releases: releasesData.slice(0, 5).map((release: any) => ({
      name: release.name || release.tag_name,
      tag_name: release.tag_name,
      published_at: new Date(release.published_at).toLocaleDateString(),
      url: release.html_url,
    })),
    packages: packagesData.slice(0, 5).map((pkg: any) => ({
      name: pkg.name,
      package_type: pkg.package_type,
      html_url: pkg.html_url,
    })),
    homepage: repoData.homepage,
    website: website,
  };
};

// Keywords for categorization (simplified, can be greatly expanded)
const K = {
  FRAMEWORKS_LIBS: [
    "react",
    "vue",
    "angular",
    "svelte",
    "next",
    "gatsby",
    "solid",
    "jquery",
    "ember",
    "tailwindcss",
    "bootstrap",
    "material-ui",
    "antd",
    "emotion",
    "styled-components",
    "bulma",
    "semantic-ui",
    "express",
    "koa",
    "nestjs",
    "fastify",
    "django",
    "flask",
    "spring",
    "laravel",
    "ruby on rails",
    "gin",
    "fiber",
    "vite",
    "webpack",
    "babel",
    "gulp",
    "grunt",
    "rollup",
    "parcel",
    "esbuild",
    "@radix-ui",
    "shadcn",
    "class-variance-authority",
    "clsx",
    "tailwind-merge",
    "lucide-react",
    "font-awesome",
    "three.js",
    "d3.js",
    "redux",
    "zustand",
    "mobx",
    "vuex",
    "ngrx",
    "react-router",
    "vue-router",
    "highlight.js",
    "prismjs",
    "react-markdown",
    "marked",
    "rehype-",
    "remark-",
  ],
  APIS_SDK_TOOLS: [
    "axios",
    "fetch",
    "apollo",
    "graphql",
    "grpc",
    "rest",
    "sdk",
    "@aws-sdk",
    "aws-amplify",
    "firebase",
    "@google-cloud",
    "azure-",
    "stripe",
    "paypal",
    "braintree",
    "twilio",
    "sendgrid",
    "@octokit",
    "github-api",
    "socket.io",
    "pusher",
    "oauth",
    "passport",
    "jwt",
    "openai",
  ],
  DATABASES: [
    "mongoose",
    "sequelize",
    "prisma",
    "typeorm",
    "knex",
    "mongodb",
    "mysql",
    "postgresql",
    "sqlite",
    "redis",
    "dynamodb",
    "firestore",
    "pg",
    "mysql2",
  ],
  TESTING: [
    "jest",
    "mocha",
    "jasmine",
    "ava",
    "cypress",
    "playwright",
    "puppeteer",
    "selenium",
    "@testing-library",
    "enzyme",
    "chai",
    "sinon",
  ],
  DEV_TOOLS_OTHERS: [
    "eslint",
    "prettier",
    "stylelint",
    "husky",
    "lint-staged",
    "docker",
    "kubernetes",
    "vagrant",
    "git",
    "npm",
    "yarn",
    "pnpm",
    "bower",
    "typescript",
    "storybook",
    "docz",
    "i18next",
    "react-i18next",
    "moment",
    "date-fns",
    "dayjs",
    "lodash",
    "underscore",
  ],
};

export async function analyzeRepository(
  owner: string,
  repo: string
): Promise<TechData | null> {
  const repoInfoData = await fetchGitHubRepoData(owner, repo);
  if (!repoInfoData) return null;

  const languages: TechItem[] = [];
  const frameworks: TechItem[] = [];
  const apis: TechItem[] = [];
  const resources: TechItem[] = []; // General bucket for tools, testing, etc.

  const detectedTechNames = new Set<string>(); // To avoid duplicates by name

  const addTechItem = (
    category: TechItem[],
    name: string,
    rawName?: string
  ) => {
    const lowerName = name.toLowerCase();
    if (detectedTechNames.has(lowerName)) return;

    category.push({ name: name, icon: getTechIcon(rawName || name) });
    detectedTechNames.add(lowerName);
  };

  // 1. Get Languages from GitHub API
  const langData = await fetchGitHubApi<Record<string, number>>(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/languages`
  );
  if (langData) {
    for (const langName in langData) {
      addTechItem(languages, langName);
    }
  } else if (
    repoInfoData.language &&
    repoInfoData.language !== "Not specified"
  ) {
    addTechItem(languages, repoInfoData.language);
  }

  // 2. Analyze package.json (if exists)
  const packageJsonContent = await fetchFileContent(
    owner,
    repo,
    "package.json"
  );
  if (packageJsonContent) {
    try {
      const pkg = JSON.parse(packageJsonContent);
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

      for (const depName in allDeps) {
        const lowerDepName = depName.toLowerCase();
        let categorized = false;

        if (K.FRAMEWORKS_LIBS.some((kw) => lowerDepName.includes(kw))) {
          addTechItem(frameworks, depName);
          categorized = true;
        } else if (K.APIS_SDK_TOOLS.some((kw) => lowerDepName.includes(kw))) {
          addTechItem(apis, depName);
          categorized = true;
        } else if (K.DATABASES.some((kw) => lowerDepName.includes(kw))) {
          addTechItem(resources, depName);
          categorized = true; // Or new DB category
        } else if (K.TESTING.some((kw) => lowerDepName.includes(kw))) {
          addTechItem(resources, depName);
          categorized = true; // Or new Testing category
        } else if (K.DEV_TOOLS_OTHERS.some((kw) => lowerDepName.includes(kw))) {
          if (
            lowerDepName === "typescript" &&
            !languages.find((l) => l.name.toLowerCase() === "typescript")
          ) {
            addTechItem(languages, "TypeScript", depName);
          } else {
            addTechItem(resources, depName);
          }
          categorized = true;
        }

        // If it's a known @scope, sometimes good to list the scope itself if specific items aren't matched
        // e.g. @radix-ui, @tailwindcss
        if (!categorized && depName.startsWith("@")) {
          const scope = depName.split("/")[0];
          if (K.FRAMEWORKS_LIBS.some((kw) => scope.includes(kw))) {
            addTechItem(frameworks, depName);
            categorized = true;
          } else if (K.DEV_TOOLS_OTHERS.some((kw) => scope.includes(kw))) {
            addTechItem(resources, depName);
            categorized = true;
          }
        }
      }
    } catch (e) {
      console.error("Error parsing package.json", e);
    }
  }

  // 3. Basic README Scan (very simplistic for now)
  if (repoInfoData.readme) {
    const readmeLower = repoInfoData.readme.toLowerCase();
    if (readmeLower.includes("next.js")) addTechItem(frameworks, "Next.js");
    if (readmeLower.includes("github api")) addTechItem(apis, "GitHub API");
    if (readmeLower.includes("vercel")) addTechItem(resources, "Vercel"); // Could be "Hosting"
    if (readmeLower.includes("netlify")) addTechItem(resources, "Netlify");
    if (readmeLower.includes("docker")) addTechItem(resources, "Docker");
    if (readmeLower.includes("openai api") || readmeLower.includes("gpt-"))
      addTechItem(apis, "OpenAI API", "openai");
  }

  // Fallback for primary language if not caught by specific language list from API but present in repoInfo
  if (
    repoInfoData.language &&
    repoInfoData.language !== "Not specified" &&
    !languages.find(
      (l) => l.name.toLowerCase() === repoInfoData.language!.toLowerCase()
    )
  ) {
    addTechItem(languages, repoInfoData.language);
  }

  // Ensure critical self-identified tech (from user's package.json example) is present if missed
  // This is a bit of a hack; ideally, categorization should catch them.
  const projectOwnDeps = [
    "react",
    "tailwindcss",
    "vite",
    "typescript",
    "@radix-ui/react-tabs",
    "lucide-react",
  ];
  if (packageJsonContent) {
    projectOwnDeps.forEach((dep) => {
      if (packageJsonContent.includes(`"${dep}"`)) {
        if (dep === "react" || dep.includes("radix") || dep.includes("lucide"))
          addTechItem(frameworks, dep);
        else if (dep === "tailwindcss" || dep === "vite")
          addTechItem(frameworks, dep);
        else if (dep === "typescript")
          addTechItem(languages, "TypeScript", dep);
      }
    });
  }

  return {
    languages: [
      ...new Map(
        languages.map((item) => [item.name.toLowerCase(), item])
      ).values(),
    ],
    frameworks: [
      ...new Map(
        frameworks.map((item) => [item.name.toLowerCase(), item])
      ).values(),
    ],
    apis: [
      ...new Map(apis.map((item) => [item.name.toLowerCase(), item])).values(),
    ],
    resources: [
      ...new Map(
        resources.map((item) => [item.name.toLowerCase(), item])
      ).values(),
    ],
    repoInfo: repoInfoData,
  };
}
