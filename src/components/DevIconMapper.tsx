import React from "react";
import { Puzzle } from "lucide-react";

// Mapping of relevant technologies to icons from Devicon
export const devIconMap: Record<string, string> = {
  // Programming Languages
  javascript: "devicon-javascript-plain",
  js: "devicon-javascript-plain",
  typescript: "devicon-typescript-plain",
  ts: "devicon-typescript-plain",
  python: "devicon-python-plain",
  java: "devicon-java-plain",
  go: "devicon-go-plain",
  golang: "devicon-go-plain",
  rust: "devicon-rust-plain",
  html: "devicon-html5-plain",
  html5: "devicon-html5-plain",
  css: "devicon-css3-plain",
  css3: "devicon-css3-plain",
  bash: "devicon-bash-plain",
  shell: "devicon-bash-plain",
  csharp: "devicon-csharp-plain",
  "c#": "devicon-csharp-plain",
  c: "devicon-c-plain",
  cpp: "devicon-cplusplus-plain",
  "c++": "devicon-cplusplus-plain",
  cplusplus: "devicon-cplusplus-plain",
  php: "devicon-php-plain",
  ruby: "devicon-ruby-plain",
  swift: "devicon-swift-plain",
  kotlin: "devicon-kotlin-plain",
  scala: "devicon-scala-plain",
  dart: "devicon-dart-plain",
  markdown: "devicon-markdown-original",
  objectivec: "devicon-objectivec-plain",
  perl: "devicon-perl-plain",
  r: "devicon-r-plain",
  coffeescript: "devicon-coffeescript-original",
  fsharp: "devicon-fsharp-plain",
  groovy: "devicon-groovy-plain",
  haskell: "devicon-haskell-plain",
  julia: "devicon-julia-plain",
  lua: "devicon-lua-plain",
  matlab: "devicon-matlab-plain",
  erlang: "devicon-erlang-plain",
  elixir: "devicon-elixir-plain",
  clojure: "devicon-clojure-line",
  clojurescript: "devicon-clojurescript-plain",
  d: "devicon-d-plain",
  ocaml: "devicon-ocaml-plain",
  fortran: "devicon-fortran-plain",
  solidity: "devicon-solidity-plain",
  crystal: "devicon-crystal-original",
  nim: "devicon-nim-plain",
  zig: "devicon-zig-original",
  wasm: "devicon-wasm-plain",

  // Frameworks and Libraries
  react: "devicon-react-original",
  reactjs: "devicon-react-original",
  angular: "devicon-angularjs-plain",
  angularjs: "devicon-angularjs-plain",
  vue: "devicon-vuejs-plain",
  vuejs: "devicon-vuejs-plain",
  nextjs: "devicon-nextjs-original",
  "next.js": "devicon-nextjs-original",
  svelte: "devicon-svelte-plain",
  tailwindcss: "devicon-tailwindcss-plain",
  tailwind: "devicon-tailwindcss-plain",
  bootstrap: "devicon-bootstrap-plain",
  jquery: "devicon-jquery-plain",
  "node.js": "devicon-nodejs-plain",
  nodejs: "devicon-nodejs-plain",
  express: "devicon-express-original",
  expressjs: "devicon-express-original",
  django: "devicon-django-plain",
  flask: "devicon-flask-plain",
  spring: "devicon-spring-plain",
  springboot: "devicon-spring-plain",
  rails: "devicon-rails-plain",
  rubyonrails: "devicon-rails-plain",
  laravel: "devicon-laravel-plain",
  symfony: "devicon-symfony-plain",
  ember: "devicon-ember-original",
  gatsby: "devicon-gatsby-plain",
  nuxt: "devicon-nuxtjs-plain",
  nuxtjs: "devicon-nuxtjs-plain",
  vite: "devicon-vitejs-plain",
  vitejs: "devicon-vitejs-plain",
  webpack: "devicon-webpack-plain",
  babel: "devicon-babel-plain",
  redux: "devicon-redux-original",
  vuetify: "devicon-vuetify-plain",
  materialui: "devicon-materialui-plain",
  "material-ui": "devicon-materialui-plain",
  mui: "devicon-materialui-plain",
  sass: "devicon-sass-original",
  less: "devicon-less-plain-wordmark",
  stylus: "devicon-stylus-original",
  flutter: "devicon-flutter-plain",
  electron: "devicon-electron-original",
  electronjs: "devicon-electron-original",
  ionic: "devicon-ionic-original",
  numpy: "devicon-numpy-original",
  pandas: "devicon-pandas-original",
  tensorflow: "devicon-tensorflow-original",
  pytorch: "devicon-pytorch-original",
  phoenix: "devicon-phoenix-plain",
  dotnet: "devicon-dot-net-plain",
  ".net": "devicon-dot-net-plain",
  dotnetcore: "devicon-dotnetcore-plain",
  ".net core": "devicon-dotnetcore-plain",
  jekyll: "devicon-jekyll-plain",
  hugo: "devicon-hugo-plain",
  pug: "devicon-pug-plain",
  fastapi: "devicon-fastapi-plain",
  threejs: "devicon-threejs-original",
  capacitor: "devicon-capacitor-plain",
  nestjs: "devicon-nestjs-plain",
  knockoutjs: "devicon-knockout-plain",
  backbonejs: "devicon-backbonejs-plain",
  socketio: "devicon-socketio-original",
  xamarin: "devicon-xamarin-original",
  qt: "devicon-qt-original",
  gtk: "devicon-gtk-plain",
  meteor: "devicon-meteor-plain",
  rxjs: "devicon-rxjs-original",
  stimulus: "devicon-stimulus-original",
  solidjs: "devicon-solidjs-original",
  alpinejs: "devicon-alpinejs-original",
  preact: "devicon-preact-plain",
  astro: "devicon-astro-plain",
  qwik: "devicon-qwik-plain",

  // Databases & APIs
  mongodb: "devicon-mongodb-plain",
  postgresql: "devicon-postgresql-plain",
  postgres: "devicon-postgresql-plain",
  mysql: "devicon-mysql-plain",
  redis: "devicon-redis-plain",
  sqlite: "devicon-sqlite-plain",
  cassandra: "devicon-cassandra-plain",
  couchdb: "devicon-couchdb-plain",
  mariadb: "devicon-mariadb-plain",
  neo4j: "devicon-neo4j-plain",
  oracle: "devicon-oracle-original",
  microsoftsqlserver: "devicon-microsoftsqlserver-plain",
  "sql server": "devicon-microsoftsqlserver-plain",
  dynamodb: "devicon-amazonwebservices-original-wordmark",
  firebase: "devicon-firebase-plain",
  supabase: "devicon-supabase-plain",
  sequelize: "devicon-sequelize-plain",
  prisma: "devicon-prisma-original",
  mongoose: "devicon-mongodb-plain",
  graphql: "devicon-graphql-plain",
  influxdb: "devicon-influxdb-plain",
  cockroachdb: "devicon-postgresql-plain", // Similar to PostgreSQL

  // Cloud & DevOps
  aws: "devicon-amazonwebservices-original",
  amazonwebservices: "devicon-amazonwebservices-original",
  azure: "devicon-azure-plain",
  microsoftazure: "devicon-azure-plain",
  googlecloud: "devicon-googlecloud-plain",
  "google cloud": "devicon-googlecloud-plain",
  gcp: "devicon-googlecloud-plain",
  digitalocean: "devicon-digitalocean-plain",
  heroku: "devicon-heroku-original",
  netlify: "devicon-nodejs-plain", // Netlify doesn't have an icon
  vercel: "devicon-nextjs-original", // Using Next.js as Vercel doesn't have an icon
  cloudflare: "devicon-cloudflare-plain",
  docker: "devicon-docker-plain",
  kubernetes: "devicon-kubernetes-plain",
  k8s: "devicon-kubernetes-plain",
  jenkins: "devicon-jenkins-plain",
  circleci: "devicon-circleci-plain",
  travisci: "devicon-travis-plain",
  ansible: "devicon-ansible-plain",
  terraform: "devicon-terraform-plain",
  vagrant: "devicon-vagrant-plain",
  prometheus: "devicon-prometheus-original",
  grafana: "devicon-grafana-original",
  nginx: "devicon-nginx-original",
  apache: "devicon-apache-plain",
  gitlab: "devicon-gitlab-plain",
  github: "devicon-github-original",
  bitbucket: "devicon-bitbucket-original",
  argocd: "devicon-argocd-plain",

  // Package Managers & Build Tools
  npm: "devicon-npm-original-wordmark",
  yarn: "devicon-yarn-plain",
  pnpm: "devicon-nodejs-plain",
  gradle: "devicon-gradle-plain",
  maven: "devicon-maven-plain",
  grunt: "devicon-grunt-plain",
  gulp: "devicon-gulp-plain",
  rollup: "devicon-rollup-original",
  parcel: "devicon-nodejs-plain",
  esbuild: "devicon-nodejs-plain",
  composer: "devicon-composer-plain",
  nuget: "devicon-nuget-original",
  pip: "devicon-python-plain",
  poetry: "devicon-python-plain",
  cargo: "devicon-rust-plain",
  homebrew: "devicon-homebrew-plain",

  // Test Frameworks
  jest: "devicon-jest-plain",
  mocha: "devicon-mocha-plain",
  chai: "devicon-mocha-plain",
  jasmine: "devicon-jasmine-plain",
  karma: "devicon-karma-plain",
  cypress: "devicon-cypressio-plain",
  puppeteer: "devicon-nodejs-plain",
  playwright: "devicon-nodejs-plain",
  selenium: "devicon-selenium-original",
  junit: "devicon-junit-plain",
  pytest: "devicon-pytest-plain",

  // Code Quality & Linting
  eslint: "devicon-eslint-original",
  prettier: "devicon-prettier-plain",
  jslint: "devicon-javascript-plain",
  tslint: "devicon-typescript-plain",
  stylelint: "devicon-css3-plain",
  sonarqube: "devicon-sonarqube-plain",

  // Version Control
  git: "devicon-git-plain",
  sourcetree: "devicon-sourcetree-original",
  subversion: "devicon-subversion-original",
  mercurial: "devicon-mercurial-plain",
  tortoisegit: "devicon-tortoisegit-plain",

  // UI/UX & Design
  figma: "devicon-figma-plain",
  sketch: "devicon-sketch-plain",
  adobexd: "devicon-xd-plain",
  xd: "devicon-xd-plain",
  illustrator: "devicon-illustrator-plain",
  photoshop: "devicon-photoshop-plain",
  aftereffects: "devicon-aftereffects-plain",
  premierepro: "devicon-premierepro-plain",
  gimp: "devicon-gimp-plain",
  inkscape: "devicon-inkscape-plain",
  canva: "devicon-canva-original",
  blender: "devicon-blender-original",

  // Operating Systems
  linux: "devicon-linux-plain",
  ubuntu: "devicon-ubuntu-plain",
  debian: "devicon-debian-plain",
  centos: "devicon-centos-plain",
  redhat: "devicon-redhat-plain",
  archlinux: "devicon-archlinux-plain",
  gentoo: "devicon-gentoo-plain",
  fedora: "devicon-fedora-plain",
  windows: "devicon-windows8-original",
  windows8: "devicon-windows8-original",
  windows10: "devicon-windows8-original",
  windows11: "devicon-windows8-original",
  apple: "devicon-apple-original",
  macos: "devicon-apple-original",
  android: "devicon-android-plain",
  ios: "devicon-apple-original",
  raspberrypi: "devicon-raspberrypi-plain",
  chromeos: "devicon-chrome-plain",

  // IDEs & Editors
  vscode: "devicon-vscode-plain",
  visualstudiocode: "devicon-vscode-plain",
  visualstudio: "devicon-visualstudio-plain",
  intellij: "devicon-intellij-plain",
  webstorm: "devicon-webstorm-plain",
  phpstorm: "devicon-phpstorm-plain",
  pycharm: "devicon-pycharm-plain",
  eclipse: "devicon-eclipse-plain",
  atom: "devicon-atom-original",
  sublime: "devicon-androidstudio-plain",
  vim: "devicon-vim-plain",
  neovim: "devicon-vim-plain",
  emacs: "devicon-emacs-plain",
  xcode: "devicon-xcode-plain",
  androidstudio: "devicon-androidstudio-plain",
  jupyter: "devicon-jupyter-plain",
  rstudio: "devicon-rstudio-plain",
  notepad: "devicon-windows8-original",

  // CMS & E-commerce
  wordpress: "devicon-wordpress-plain",
  drupal: "devicon-drupal-plain",
  joomla: "devicon-joomla-plain",
  magento: "devicon-magento-original",
  woocommerce: "devicon-woocommerce-plain",
  shopify: "devicon-shopify-plain",
  contentful: "devicon-nodejs-plain",
  ghost: "devicon-ghost-plain",

  // Game Development
  unity: "devicon-unity-original",
  unrealengine: "devicon-unrealengine-original",
  godot: "devicon-godot-plain",

  // Others
  latex: "devicon-latex-original",
  kaggle: "devicon-kaggle-original",
  bluetooth: "devicon-bluetooth-plain",
  oauth: "devicon-oauth-plain",
  ssh: "devicon-ssh-original",
  regex: "devicon-regex-original",
  json: "devicon-json-plain",
  jsonwebtokens: "devicon-nodejs-plain",
  jwt: "devicon-nodejs-plain",
  postman: "devicon-postman-plain",
  insomnia: "devicon-insomnia-plain",
  swagger: "devicon-swagger-plain",
  openapi: "devicon-openapi-plain",
  yaml: "devicon-yaml-plain",
  toml: "devicon-markdown-original",
  xml: "devicon-xml-plain",
  devops: "devicon-git-plain",
  agile: "devicon-jira-plain",
  scrum: "devicon-jira-plain",
  jira: "devicon-jira-plain",
  confluence: "devicon-confluence-original",
  slack: "devicon-slack-plain",
  discord: "devicon-nodejs-plain",
  trello: "devicon-trello-plain",
  notion: "devicon-notion-plain",
  devicon: "devicon-devicon-plain",
};

// Additional package mappings for specific libraries
const packageMappings: Record<string, string> = {
  // React ecosystem
  "@radix-ui": "devicon-react-original",
  "react-dom": "devicon-react-original",
  "react-router": "devicon-react-original",
  "react-router-dom": "devicon-react-original",
  "react-markdown": "devicon-markdown-original",
  "tailwind-merge": "devicon-tailwindcss-plain",
  "class-variance-authority": "devicon-tailwindcss-plain",
  clsx: "devicon-typescript-plain",
  "lucide-react": "devicon-react-original",
  "eslint-plugin-react": "devicon-eslint-original",
  "@types/react": "devicon-typescript-plain",
  "@types/react-dom": "devicon-typescript-plain",

  // Build & bundlers
  vite: "devicon-vitejs-plain",
  "@vitejs/plugin-react": "devicon-vitejs-plain",

  // Documentation & markdown
  rehype: "devicon-markdown-original",
  "rehype-highlight": "devicon-markdown-original",
  "rehype-raw": "devicon-markdown-original",
  "rehype-sanitize": "devicon-markdown-original",
  remark: "devicon-markdown-original",
  "remark-gfm": "devicon-markdown-original",
  "remark-emoji": "devicon-markdown-original",
  "remark-math": "devicon-markdown-original",
  "highlight.js": "devicon-javascript-plain",

  // Media files & GitHub attachments
  "Media Files": "devicon-github-original",
  "GitHub Attachments": "devicon-github-original",

  // More
  "@tanstack/react-query": "devicon-react-original",
  "@tanstack/react-table": "devicon-react-original",
  "@tanstack/query": "devicon-react-original",
  "@trpc/client": "devicon-typescript-plain",
  "@trpc/server": "devicon-typescript-plain",
  "next-themes": "devicon-nextjs-original",
  "next-auth": "devicon-nextjs-original",
  "next-seo": "devicon-nextjs-original",
  "shadcn/ui": "devicon-react-original",
  "@heroicons/react": "devicon-react-original",
  "@headlessui/react": "devicon-react-original",
  zustand: "devicon-react-original",
  jotai: "devicon-react-original",
  recoil: "devicon-react-original",
  swr: "devicon-react-original",
  formik: "devicon-react-original",
  "react-hook-form": "devicon-react-original",
  zod: "devicon-typescript-plain",
  yup: "devicon-javascript-plain",
};

// Function to create DevIcon component using specific class
export const getDevIcon = (techName: string): React.ReactNode => {
  const lowerTechName = techName.toLowerCase();

  // Special handling (media and github attachments)
  if (techName === "Media Files") {
    return <i className="fa-regular fa-file-image text-3xl"></i>;
  }
  if (techName === "GitHub Attachments") {
    return <i className="devicon-github-original colored text-3xl"></i>;
  }

  // Try direct match first
  if (devIconMap[lowerTechName]) {
    return <i className={`${devIconMap[lowerTechName]} colored text-3xl`}></i>;
  }

  // Check for package-specific mappings that target specific libraries
  for (const [packagePattern, iconClass] of Object.entries(packageMappings)) {
    if (lowerTechName.includes(packagePattern.toLowerCase())) {
      return <i className={`${iconClass} colored text-3xl`}></i>;
    }
  }

  // Special handling for common patterns
  if (lowerTechName.startsWith("@radix-ui/")) {
    return <i className="devicon-react-original colored text-3xl"></i>;
  }

  if (lowerTechName.startsWith("@types/")) {
    return <i className="devicon-typescript-plain colored text-3xl"></i>;
  }

  // Handle rehype and remark plugins with consistent icons
  if (lowerTechName.startsWith("rehype-") || lowerTechName === "rehype") {
    return <i className="devicon-markdown-original colored text-3xl"></i>;
  }

  if (lowerTechName.startsWith("remark-") || lowerTechName === "remark") {
    return <i className="devicon-markdown-original colored text-3xl"></i>;
  }

  // Check for more general category patterns
  const patternMatching = [
    { pattern: "react", icon: "devicon-react-original" },
    { pattern: "typescript", icon: "devicon-typescript-plain" },
    { pattern: "tailwind", icon: "devicon-tailwindcss-plain" },
    { pattern: "eslint", icon: "devicon-eslint-original" },
    { pattern: "jest", icon: "devicon-jest-plain" },
    { pattern: "vite", icon: "devicon-vitejs-plain" },
    { pattern: "node", icon: "devicon-nodejs-plain" },
    { pattern: "markdown", icon: "devicon-markdown-original" },
    { pattern: "next", icon: "devicon-nextjs-original" },
    { pattern: "vue", icon: "devicon-vuejs-plain" },
    { pattern: "angular", icon: "devicon-angularjs-plain" },
    { pattern: "svelte", icon: "devicon-svelte-plain" },
    { pattern: "sass", icon: "devicon-sass-original" },
    { pattern: "webpack", icon: "devicon-webpack-plain" },
    { pattern: "babel", icon: "devicon-babel-plain" },
    { pattern: "docker", icon: "devicon-docker-plain" },
    { pattern: "kubernetes", icon: "devicon-kubernetes-plain" },
    { pattern: "aws", icon: "devicon-amazonwebservices-original" },
    { pattern: "azure", icon: "devicon-azure-plain" },
    { pattern: "google", icon: "devicon-googlecloud-plain" },
    { pattern: "firebase", icon: "devicon-firebase-plain" },
    { pattern: "mongo", icon: "devicon-mongodb-plain" },
    { pattern: "postgres", icon: "devicon-postgresql-plain" },
    { pattern: "mysql", icon: "devicon-mysql-plain" },
    { pattern: "redis", icon: "devicon-redis-plain" },
  ];

  for (const { pattern, icon } of patternMatching) {
    if (lowerTechName.includes(pattern)) {
      return <i className={`${icon} colored text-3xl`}></i>;
    }
  }

  // Try other partial matches
  for (const [key, value] of Object.entries(devIconMap)) {
    if (lowerTechName.includes(key)) {
      return <i className={`${value} colored text-3xl`}></i>;
    }
  }

  // Fallback to a default icon from Lucide if no match
  return <Puzzle size={32} strokeWidth={1.5} />;
};
