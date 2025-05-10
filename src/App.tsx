import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Github } from "lucide-react";

import "./App.css";
import Navbar from "./components/NavBar";

function App() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
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

    setTimeout(() => {
      setIsLoading(false);
      alert("Analysis complete for: " + url);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      <Navbar />
      <main className="min-h-screen flex flex-col items-center justify-start px-4 pt-20 text-center bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">What the Tech</h1>

        <p className="text-lg mb-10 max-w-xl leading-relaxed">
          Ever wondered <span className="line-through">what the heck</span>{" "}
          <span className="font-semibold text-blue-600">what the tech</span> is
          behind a project on GitHub?
          <span className="block mt-2">
            Analyze GitHub repositories to discover their tech stack in seconds.
          </span>
        </p>

        {/* Card wrapper */}
        <Card className="w-full max-w-xl border border-gray-200 shadow-sm rounded-xl">
          <CardContent className="pt-4 pb-6 px-6 md:pt-4 md:pb-8 md:px-8">
            {/* GitHub Header */}
            <div className="flex items-center justify-center mb-4">
              <Github size={28} className="text-gray-800 mr-3" />
              <h2 className="text-xl font-semibold text-gray-800">
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
                    className="w-full pl-12 pr-4 py-6 text-base border-2 border-gray-200 hover:border-black transition-colors duration-200"
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
      </main>
    </div>
  );
}

export default App;
