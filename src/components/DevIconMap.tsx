import React from "react";
import { Puzzle } from "lucide-react";

// Mapping of technology names to DevIcon class names
// This maps common tech stack items to their corresponding DevIcon classes
export const devIconMap: Record<string, string> = {
  // Programming Languages
  javascript: "devicon-javascript-plain",
  typescript: "devicon-typescript-plain",
  python: "devicon-python-plain",
  java: "devicon-java-plain",
  go: "devicon-go-plain",
  rust: "devicon-rust-plain",
  html: "devicon-html5-plain",
  html5: "devicon-html5-plain",
  css: "devicon-css3-plain",
  css3: "devicon-css3-plain",
  shell: "devicon-bash-plain",
  csharp: "devicon-csharp-plain",
  c: "devicon-c-plain",
  cpp: "devicon-cplusplus-plain",
  "c++": "devicon-cplusplus-plain",
  php: "devicon-php-plain",
  ruby: "devicon-ruby-plain",
  swift: "devicon-swift-plain",
  kotlin: "devicon-kotlin-plain",
  scala: "devicon-scala-plain",
  markdown: "devicon-markdown-plain",

  // Frameworks and Libraries
  react: "devicon-react-original",
  angular: "devicon-angularjs-plain",
  vue: "devicon-vuejs-plain",
  nextjs: "devicon-nextjs-plain",
  "next.js": "devicon-nextjs-plain",
  svelte: "devicon-svelte-plain",
  tailwindcss: "devicon-tailwindcss-plain",
  bootstrap: "devicon-bootstrap-plain",
  jquery: "devicon-jquery-plain",
  "node.js": "devicon-nodejs-plain",
  nodejs: "devicon-nodejs-plain",
  express: "devicon-express-original",
  django: "devicon-django-plain",
  flask: "devicon-flask-plain",
  spring: "devicon-spring-plain",
  vite: "devicon-vitejs-plain",
  webpack: "devicon-webpack-plain",
  babel: "devicon-babel-plain",
  redux: "devicon-redux-original",
  materialui: "devicon-materialui-plain",
  "material-ui": "devicon-materialui-plain",
  mui: "devicon-materialui-plain",

  // Databases
  mongodb: "devicon-mongodb-plain",
  postgresql: "devicon-postgresql-plain",
  mysql: "devicon-mysql-plain",
  redis: "devicon-redis-plain",
  sqlite: "devicon-sqlite-plain",

  // Tools and Technologies
  git: "devicon-git-plain",
  github: "devicon-github-original",
  npm: "devicon-npm-original-wordmark",
  yarn: "devicon-yarn-plain",
  docker: "devicon-docker-plain",
  kubernetes: "devicon-kubernetes-plain",
  aws: "devicon-amazonwebservices-original",
  azure: "devicon-azure-plain",
  googlecloud: "devicon-googlecloud-plain",
  "google cloud": "devicon-googlecloud-plain",
  firebase: "devicon-firebase-plain",
  heroku: "devicon-heroku-original",
  vercel: "devicon-nextjs-plain", // Using Next.js icon for Vercel (common association)
  netlify: "devicon-nodejs-plain", // Using Node.js as fallback for Netlify

  // Testing
  jest: "devicon-jest-plain",
  mocha: "devicon-mocha-plain",
  eslint: "devicon-eslint-original",

  // Other
  graphql: "devicon-graphql-plain",
  sass: "devicon-sass-original",
  electron: "devicon-electron-original",
  figma: "devicon-figma-plain",
  threejs: "devicon-threejs-original",
  gatsby: "devicon-gatsby-plain",
  flutter: "devicon-flutter-plain",
  storybook: "devicon-storybook-plain",
};

// Function to create DevIcon component using the proper class
export const getDevIcon = (techName: string): React.ReactNode => {
  const lowerTechName = techName.toLowerCase();

  // Try direct match
  if (devIconMap[lowerTechName]) {
    return <i className={`${devIconMap[lowerTechName]} colored text-3xl`}></i>;
  }

  // Try partial matches (for package names with scope like @mui/material)
  for (const [key, value] of Object.entries(devIconMap)) {
    if (lowerTechName.includes(key)) {
      return <i className={`${value} colored text-3xl`}></i>;
    }
  }

  // Fallback to a default icon from Lucide if no match
  return <Puzzle size={32} strokeWidth={1.5} />;
};
