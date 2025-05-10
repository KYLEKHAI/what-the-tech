import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center">
          <a
            href="/"
            className="flex items-center text-xl font-bold text-gray-900 dark:text-white transition-transform duration-300 hover:-rotate-2 hover:scale-110"
          >
            <img
              src="/what-the-stack-logo-tp.png"
              alt="What the Tech Logo"
              className="h-16 w-16 mr-4"
            />
            What the Tech!
          </a>
        </div>

        {/* Nav links*/}
        <nav className="flex items-center space-x-1">
          <Button
            asChild
            variant="ghost"
            className="font-medium text-gray-700 dark:text-gray-200 hover:text-foreground"
          >
            <a href="/">Find Repo</a>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="font-medium text-gray-700 dark:text-gray-200 hover:text-foreground"
          >
            <a href="/about">About</a>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
