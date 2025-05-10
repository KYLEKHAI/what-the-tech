import React from "react";
import {
  Code,
  Database,
  Wind,
  Zap,
  LayoutPanelLeft,
  Settings,
  Server,
  Network,
  Cloud,
  TestTubeDiagonal,
  GitMerge,
  Package,
  Puzzle,
  Component,
  FileType,
  BrainCircuit,
  Box,
  Link as LinkIcon,
} from "lucide-react";

// Default style for icons used in the tech cards
const iconProps = { size: 32, strokeWidth: 1.5 };

export const techIconMap: Record<string, React.ReactNode> = {
  // Languages
  javascript: <Code {...iconProps} color="#f0db4f" />,
  typescript: <Code {...iconProps} color="#007acc" />,
  python: <Code {...iconProps} color="#3572A5" />,
  java: <Code {...iconProps} color="#b07219" />,
  go: <Code {...iconProps} color="#00ADD8" />,
  rust: <Code {...iconProps} color="#dea584" />,
  html: <Code {...iconProps} color="#e34c26" />,
  css: <Code {...iconProps} color="#563d7c" />,
  shell: <Code {...iconProps} color="#89e051" />,
  csharp: <Code {...iconProps} color="#178600" />, // C#
  cpp: <Code {...iconProps} color="#f34b7d" />, // C++
  php: <Code {...iconProps} color="#4F5D95" />,
  ruby: <Code {...iconProps} color="#701516" />,
  swift: <Code {...iconProps} color="#ffac45" />,
  kotlin: <Code {...iconProps} color="#F18E33" />,
  scala: <Code {...iconProps} color="#c22d40" />,
  markdown: <FileType {...iconProps} />,
  json: <FileType {...iconProps} />,
  yaml: <FileType {...iconProps} />,

  // Frameworks/Libraries
  react: <LayoutPanelLeft {...iconProps} color="#61DAFB" />,
  "next.js": <LayoutPanelLeft {...iconProps} color="#000000" />, // Black for Next.js logo (often on white)
  angular: <LayoutPanelLeft {...iconProps} color="#DD0031" />,
  vue: <LayoutPanelLeft {...iconProps} color="#4FC08D" />,
  svelte: <LayoutPanelLeft {...iconProps} color="#FF3E00" />,
  tailwindcss: <Wind {...iconProps} color="#38B2AC" />,
  bootstrap: <LayoutPanelLeft {...iconProps} color="#7952B3" />,
  "node.js": <Server {...iconProps} color="#339933" />,
  express: <Server {...iconProps} color="#000000" />, // Express is often just black text
  django: <Server {...iconProps} color="#092E20" />,
  flask: <Server {...iconProps} color="#000000" />,
  spring: <Server {...iconProps} color="#6DB33F" />,
  vite: <Zap {...iconProps} color="#646CFF" />,
  webpack: <Settings {...iconProps} color="#8DD6F9" />,
  babel: <Settings {...iconProps} color="#F9DC3E" />,
  jquery: <LayoutPanelLeft {...iconProps} color="#0769AD" />,
  redux: <LayoutPanelLeft {...iconProps} color="#764ABC" />,
  "styled-components": <LayoutPanelLeft {...iconProps} />,
  emotion: <LayoutPanelLeft {...iconProps} />,
  "material-ui": <Component {...iconProps} color="#0081CB" />,
  antd: <Component {...iconProps} color="#0170FE" />,
  "@radix-ui/react-slot": <Puzzle {...iconProps} />,
  "@radix-ui/react-separator": <Puzzle {...iconProps} />,
  "@radix-ui/react-tabs": <Puzzle {...iconProps} />,
  "class-variance-authority": <Settings {...iconProps} />,
  clsx: <Settings {...iconProps} />,
  "tailwind-merge": <Wind {...iconProps} />, // Related to Tailwind
  "lucide-react": <Zap {...iconProps} color="#3295F3" />,
  "highlight.js": <Code {...iconProps} />,
  "react-markdown": <FileType {...iconProps} />,
  "rehype-highlight": <Code {...iconProps} />,
  "remark-gfm": <FileType {...iconProps} />,

  // Databases
  mongodb: <Database {...iconProps} color="#47A248" />,
  postgresql: <Database {...iconProps} color="#336791" />,
  mysql: <Database {...iconProps} color="#4479A1" />,
  redis: <Database {...iconProps} color="#DC382D" />,
  sqlite: <Database {...iconProps} color="#003B57" />,
  prisma: <Database {...iconProps} color="#2D3748" />, // Prisma logo color

  // APIs/Tools
  "github api": <Network {...iconProps} />, // Use GitHub icon if available or specific
  "rest api": <Network {...iconProps} />,
  graphql: <Network {...iconProps} color="#E10098" />,
  docker: <Box {...iconProps} color="#2496ED" />,
  kubernetes: <Cloud {...iconProps} color="#326CE5" />, // K8s logo color
  git: <GitMerge {...iconProps} color="#F05032" />,
  npm: <Package {...iconProps} color="#CB3837" />,
  yarn: <Package {...iconProps} color="#2C8EBB" />,
  pnpm: <Package {...iconProps} color="#F69220" />,
  axios: <Network {...iconProps} />,
  openai: <BrainCircuit {...iconProps} color="#4AA080" />,

  // CI/CD
  "github actions": <Zap {...iconProps} />, // GitHub Actions icon
  jenkins: <Settings {...iconProps} color="#D24939" />,
  gitlabci: <GitMerge {...iconProps} color="#FCA121" />,
  travisci: <Settings {...iconProps} />,

  // Testing
  jest: <TestTubeDiagonal {...iconProps} color="#C21325" />,
  mocha: <TestTubeDiagonal {...iconProps} color="#8D6748" />,
  cypress: <TestTubeDiagonal {...iconProps} color="#17202C" />, // Cypress has various colors
  playwright: <TestTubeDiagonal {...iconProps} color="#2EAD33" />,
  "testing library": <TestTubeDiagonal {...iconProps} />,
  eslint: <Settings {...iconProps} color="#4B32C3" />,
  prettier: <Settings {...iconProps} color="#F7B93E" />,

  // Cloud/Hosting
  aws: <Cloud {...iconProps} color="#FF9900" />,
  azure: <Cloud {...iconProps} color="#0078D4" />,
  "google cloud": <Cloud {...iconProps} color="#4285F4" />,
  vercel: <Zap {...iconProps} color="#000000" />,
  netlify: <Zap {...iconProps} color="#00C7B7" />,
  heroku: <Cloud {...iconProps} color="#430098" />,

  // Resources (more generic)
  "font awesome": <LinkIcon {...iconProps} />, // Using LinkIcon for general resource
  "google fonts": <LinkIcon {...iconProps} />,
  unsplash: <LinkIcon {...iconProps} />,

  // Default/Unknown
  default: <Puzzle {...iconProps} />,
};

export const getTechIcon = (techName: string): React.ReactNode => {
  const lowerTechName = techName.toLowerCase();

  // Direct match
  if (techIconMap[lowerTechName]) {
    return techIconMap[lowerTechName];
  }

  // Common variations or package names
  const commonMappings: { [key: string]: string } = {
    next: "next.js",
    node: "node.js",
    "@tailwindcss/vite": "tailwindcss", // specific example from user's package.json
    siwe: "rest api", // Sign-In with Ethereum, often API related
    viem: "rest api", // Ethereum related, treat as API/tool for now
    wagmi: "rest api", // Ethereum related
    rainbowkit: "react", // React component library for Ethereum
    // Radix UI general
    "@radix-ui": "@radix-ui/react-slot", // Generic Radix
    // Rehype/Remark general
    rehype: "rehype-highlight",
    remark: "remark-gfm",
  };

  for (const key in commonMappings) {
    if (lowerTechName.includes(key)) {
      return techIconMap[commonMappings[key]] || techIconMap.default;
    }
  }

  // Check for keywords within the name for broader matching
  if (lowerTechName.includes("react")) return techIconMap.react;
  if (lowerTechName.includes("tailwind")) return techIconMap.tailwindcss;
  if (lowerTechName.includes("mongo")) return techIconMap.mongodb;
  if (lowerTechName.includes("postgres") || lowerTechName.includes(" pg"))
    return techIconMap.postgresql;
  if (lowerTechName.includes("sql")) return techIconMap.mysql; // generic SQL
  if (lowerTechName.includes("eslint")) return techIconMap.eslint;
  if (lowerTechName.includes("prettier")) return techIconMap.prettier;

  return techIconMap.default;
};
