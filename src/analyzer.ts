import { getDevIcon } from "./components/DevIconMapper";

// Tech item interface
export interface TechItem {
  name: string;
  icon: React.ReactNode;
}

// Repo info interface
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
  groupedTech: {
    languages: { [key: string]: TechItem[] };
    frameworks: { [key: string]: TechItem[] };
    apis: { [key: string]: TechItem[] };
    resources: { [key: string]: TechItem[] };
  };
}

// GitHub API base URL
const GITHUB_API_BASE = "https://api.github.com";
// GitHub token for API requests
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

// Function to detect if a file is a media file from its name
function isMediaFile(fileName: string): boolean {
  const mediaExtensions = [
    // Images
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".webp",
    ".bmp",
    ".ico",
    ".tiff",
    // Audio or Video
    ".mp3",
    ".mp4",
    ".wav",
    ".avi",
    ".mov",
    ".flv",
    ".webm",
    ".ogg",
    ".m4a",
    // Documents
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    // Archives
    ".zip",
    ".rar",
    ".tar",
    ".gz",
    ".7z",
    // Other media
    ".eps",
    ".psd",
    ".ai",
    ".indd",
    ".raw",
  ];

  const lowerFileName = fileName.toLowerCase();
  return mediaExtensions.some((ext) => lowerFileName.endsWith(ext));
}

// Function to fetch GitHub API
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

// Function to fetch file content
async function fetchFileContent(
  owner: string,
  repo: string,
  path: string
): Promise<string | null> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`;
  // Fetch raw content first
  let content = await fetchGitHubApi<string>(url, true);

  if (content === null || typeof content !== "string") {
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
      console.log(
        `File ${path} not found or issue fetching: ${fileData.message}`
      );
      return null;
    } else {
      return null;
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

// Keywords for categorization
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

// Function to group related technologies together
function groupRelatedTechnologies(techItems: TechItem[]): {
  [key: string]: TechItem[];
} {
  const groups: { [key: string]: TechItem[] } = {};

  // Define common prefixes/categories for grouping
  const commonPrefixes = [
    // Frontend frameworks & libraries
    "react",
    "vue",
    "angular",
    "svelte",
    "next",
    "gatsby",
    "nuxt",
    "solid",
    "preact",
    "qwik",
    "astro",

    // Build tools
    "webpack",
    "vite",
    "babel",
    "esbuild",
    "rollup",
    "parcel",
    "gulp",
    "grunt",

    // Markdown & documentation
    "rehype",
    "remark",
    "mdx",
    "markdown",

    // CSS & styling
    "tailwind",
    "css",
    "sass",
    "less",
    "styled",
    "emotion",

    // UI libraries
    "@radix-ui",
    "@mui",
    "@chakra-ui",
    "@mantine",
    "shadcn",
    "ant",
    "bootstrap",
    "material",

    // Types & TypeScript
    "typescript",
    "@types",
    "type-",
    "ts-",

    // Testing
    "jest",
    "cypress",
    "testing-library",
    "vitest",
    "mocha",
    "chai",
    "playwright",
    "selenium",

    // Linting & formatting
    "eslint",
    "prettier",
    "lint",
    "stylelint",

    // Backend & servers
    "express",
    "fastify",
    "nest",
    "koa",
    "hapi",
    "node",
    "apollo",
    "graphql",

    // Databases & ORM
    "prisma",
    "sequelize",
    "typeorm",
    "mongoose",
    "knex",
    "drizzle",
    "postgres",
    "mongo",
    "mysql",
    "sqlite",

    // State management
    "redux",
    "zustand",
    "jotai",
    "recoil",
    "mobx",
    "pinia",
    "vuex",
    "ngrx",
    "xstate",

    // Utilities
    "lodash",
    "date-fns",
    "dayjs",
    "moment",
    "axios",
    "zod",
    "yup",
    "formik",
    "swr",
    "tanstack",
    "i18n",

    // Cloud & deployment
    "aws",
    "azure",
    "gcp",
    "cloudflare",
    "vercel",
    "netlify",
    "firebase",
    "supabase",
    "amplify",

    // Bundled scopes
    "@aws-sdk",
    "@azure/",
    "@google-cloud",
    "@firebase",
    "@stripe",
    "@clerk",
    "@tanstack",
    "@trpc",
  ];

  // Create mapping of normalized names to original names
  const normalizedToOriginal: Record<string, string> = {};
  techItems.forEach((item) => {
    let normalized = item.name
      .toLowerCase()
      .replace(/\.js$/, "")
      .replace(/-js$/, "");

    // Store scope for scoped packages
    if (normalized.startsWith("@")) {
      const scope = normalized.split("/")[0];
      normalizedToOriginal[scope] = item.name;
    }

    normalizedToOriginal[normalized] = item.name;
  });

  // Identify main technologies (group leaders)
  for (const prefix of commonPrefixes) {
    const exactMatch = techItems.find((item) => {
      const name = item.name.toLowerCase();
      return (
        name === prefix || name === prefix + ".js" || name === prefix + "js"
      );
    });

    if (exactMatch) {
      // Create a group with the original casing
      groups[exactMatch.name] = [exactMatch];
    } else {
      // Check for scope matches or similar
      for (const [normalized, original] of Object.entries(
        normalizedToOriginal
      )) {
        if (
          normalized === prefix ||
          (prefix.startsWith("@") && normalized === prefix) ||
          normalized === prefix + ".js" ||
          normalized === prefix + "js"
        ) {
          const item = techItems.find((i) => i.name === original);
          if (item) {
            groups[item.name] = [item];
            break;
          }
        }
      }
    }
  }

  // Assign technologies to respective groups
  techItems.forEach((item) => {
    if (
      Object.values(groups).some(
        (groupItems) =>
          groupItems.length === 1 && groupItems[0].name === item.name
      )
    ) {
      return;
    }

    const itemName = item.name.toLowerCase();
    let matched = false;

    // Check each prefix
    for (const prefix of commonPrefixes) {
      // Watch for short prefixes that could cause false grouping
      if (prefix.length < 3 && !prefix.startsWith("@")) continue;

      // Check for prefix match or scope/package match
      if (
        itemName.startsWith(prefix + "-") ||
        itemName.startsWith(prefix + "/") ||
        itemName.startsWith("@" + prefix + "/") ||
        itemName === prefix ||
        (itemName.includes(prefix) &&
          // Special cases that need more context
          ((prefix === "react" &&
            (itemName.includes("react-") ||
              itemName.includes("-react") ||
              itemName.includes("react/"))) ||
            (prefix === "vue" &&
              (itemName.includes("vue-") ||
                itemName.includes("-vue") ||
                itemName.includes("vue/")))))
      ) {
        // Find group for item
        let foundGroup = false;
        for (const [groupName, groupItems] of Object.entries(groups)) {
          const groupNameLower = groupName.toLowerCase();
          if (
            groupNameLower === prefix ||
            groupNameLower === prefix + ".js" ||
            groupNameLower === prefix + "js" ||
            groupNameLower === "@" + prefix
          ) {
            groupItems.push(item);
            foundGroup = true;
            matched = true;
            break;
          }
        }

        // If no group exist --> create a new one
        if (
          !foundGroup &&
          (itemName.startsWith(prefix + "-") ||
            itemName.startsWith(prefix + "/") ||
            itemName.startsWith("@" + prefix + "/"))
        ) {
          groups[item.name] = [item];
          matched = true;
        }

        if (matched) break;
      }
    }

    // Special handling (not matched by prefix)
    if (!matched) {
      // remark/rehype plugins
      if (itemName.startsWith("rehype-") || itemName.startsWith("remark-")) {
        const family = itemName.split("-")[0]; // 'rehype' or 'remark'

        let familyGroup = Object.entries(groups).find(
          ([name]) => name.toLowerCase() === family
        );

        if (familyGroup) {
          familyGroup[1].push(item);
        } else {
          const displayName = family.charAt(0).toUpperCase() + family.slice(1);
          groups[displayName] = [item];
        }
        matched = true;
      }

      // @types packages
      if (itemName.startsWith("@types/")) {
        const targetPackage = itemName.slice(7);

        // Look for the main package in existing groups
        for (const [groupName, groupItems] of Object.entries(groups)) {
          if (groupName.toLowerCase() === targetPackage) {
            groupItems.push(item);
            matched = true;
            break;
          }
        }
      }
    }

    // Add ungrouped items as single item group
    if (!matched) {
      groups[item.name] = [item];
    }
  });

  // Filter out single item groups
  const filteredGroups: { [key: string]: TechItem[] } = {};

  Object.entries(groups).forEach(([key, items]) => {
    if (items.length > 1) {
      filteredGroups[key] = items;
    }
  });

  return filteredGroups;
}

// Analyze repository
export async function analyzeRepository(
  owner: string,
  repo: string
): Promise<TechData | null> {
  const repoInfoData = await fetchGitHubRepoData(owner, repo);
  if (!repoInfoData) return null;

  const languages: TechItem[] = [];
  const frameworks: TechItem[] = [];
  const apis: TechItem[] = [];
  const resources: TechItem[] = [];

  const detectedTechNames = new Set<string>();

  const addTechItem = (
    category: TechItem[],
    name: string,
    rawName?: string
  ) => {
    const lowerName = name.toLowerCase();
    if (detectedTechNames.has(lowerName)) return;

    category.push({ name: name, icon: getDevIcon(rawName || name) });
    detectedTechNames.add(lowerName);
  };

  // Get Languages from GitHub API
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

  // Analyze package.json (if exists)
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

        // List scope if it's a known @scope
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

  // README Scan
  if (repoInfoData.readme) {
    const readmeLower = repoInfoData.readme.toLowerCase();
    if (readmeLower.includes("next.js")) addTechItem(frameworks, "Next.js");
    if (readmeLower.includes("github api")) addTechItem(apis, "GitHub API");
    if (readmeLower.includes("vercel")) addTechItem(resources, "Vercel"); // Could be "Hosting"
    if (readmeLower.includes("netlify")) addTechItem(resources, "Netlify");
    if (readmeLower.includes("docker")) addTechItem(resources, "Docker");
    if (readmeLower.includes("openai api") || readmeLower.includes("gpt-"))
      addTechItem(apis, "OpenAI API", "openai");

    // Detect media files mentioned in README
    const imageRegex =
      /\.(png|jpg|jpeg|gif|svg|pdf|mp4|webm|mp3)(\?[^\s)]+)?(?=\s|\)|"|'|$)/gi;
    const mediaMatches = readmeLower.match(imageRegex);
    if (mediaMatches && mediaMatches.length > 0) {
      addTechItem(resources, "Media Files");
    }

    // Check for GitHub user attachments or external media in README
    const urlRegex =
      /(https?:\/\/[^\s)]+\.(png|jpg|jpeg|gif|svg|pdf|mp4|webm|mp3)(\?[^\s)]+)?)/gi;
    const mediaUrls = readmeLower.match(urlRegex);
    if (mediaUrls && mediaUrls.length > 0) {
      mediaUrls.forEach((url) => {});
    }
  }

  // Fallback for primary language (shown in repoInfo)
  if (
    repoInfoData.language &&
    repoInfoData.language !== "Not specified" &&
    !languages.find(
      (l) => l.name.toLowerCase() === repoInfoData.language!.toLowerCase()
    )
  ) {
    addTechItem(languages, repoInfoData.language);
  }

  // Self-identified tech (really rough bruh but it will do for now)
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

  // Create grouped technology items
  const groupedLanguages = groupRelatedTechnologies(languages);
  const groupedFrameworks = groupRelatedTechnologies(frameworks);
  const groupedApis = groupRelatedTechnologies(apis);
  const groupedResources = groupRelatedTechnologies(resources);

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
    groupedTech: {
      languages: groupedLanguages,
      frameworks: groupedFrameworks,
      apis: groupedApis,
      resources: groupedResources,
    },
    repoInfo: repoInfoData,
  };
}
