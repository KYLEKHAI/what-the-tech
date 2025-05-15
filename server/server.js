import express from "express";
import { simpleGit } from "simple-git";
import { analyser, FSProvider, flatten } from "@specfy/stack-analyser";
import "@specfy/stack-analyser/dist/autoload.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001; // You can choose any port that's not in use

// Enable CORS for all routes and origins
app.use(cors());
// Or, for more specific control (allow only your frontend origin):
// app.use(cors({ origin: 'http://localhost:5173' }));

app.use(express.json());

// Helper function to get a repository name from its URL
const getRepoNameFromUrl = (url) => {
  const parts = url.split("/");
  const repoNameWithGit = parts.pop() || "";
  return repoNameWithGit.replace(".git", "");
};

app.get("/analyze", async (req, res) => {
  const githubUrl = req.query.githubUrl;

  if (!githubUrl || typeof githubUrl !== "string") {
    return res.status(400).json({
      error: "githubUrl query parameter is required and must be a string.",
    });
  }

  const repoName = getRepoNameFromUrl(githubUrl);
  const tempRepoPath = path.join(__dirname, "temp", repoName);

  try {
    // Pre-emptive cleanup of the directory if it exists
    console.log(`Checking for existing directory: ${tempRepoPath}`);
    try {
      await fs.access(tempRepoPath); // Check if directory exists
      console.log(`Attempting to remove existing directory: ${tempRepoPath}`);
      await fs.rm(tempRepoPath, { recursive: true, force: true });
      console.log(`Existing directory ${tempRepoPath} removed.`);
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log(
          `Directory ${tempRepoPath} does not exist, no pre-emptive removal needed.`
        );
      } else {
        // If error is not ENOENT, it might be a permissions issue or something else.
        // Log it but proceed, clone might still work or fail with a clearer git error.
        console.warn(
          `Could not pre-emptively remove directory ${tempRepoPath}:`,
          error
        );
      }
    }

    console.log(`Cloning repository: ${githubUrl} into ${tempRepoPath}`);
    // Ensure temp directory exists
    await fs.mkdir(path.join(__dirname, "temp"), { recursive: true });

    const git = simpleGit();
    await git.clone(githubUrl, tempRepoPath);
    console.log("Repository cloned successfully.");

    console.log(`Analyzing repository at: ${tempRepoPath}`);
    const result = await analyser({
      provider: new FSProvider({
        path: tempRepoPath,
        ignorePaths: ["node_modules", ".git"], // Optional: ignore common large directories
      }),
    });
    console.log("Analysis complete.");

    // Log the full JSON output from the analyser, similar to output.json from CLI
    console.log("Analyser raw JSON output (result.toJson()):");
    try {
      const fullJsonOutput = result.toJson();
      console.log(JSON.stringify(fullJsonOutput, null, 2));
    } catch (e) {
      console.error("Error stringifying result.toJson():", e);
      // If direct stringify fails (e.g. circular refs not handled by toJson), log a portion or type
      console.log("result.toJson() output (type):", typeof result.toJson());
    }

    const flattenedOutput = flatten(result);

    console.log("Output of flatten(result) type:", typeof flattenedOutput);
    console.log(
      "Is flattenedOutput an array?:",
      Array.isArray(flattenedOutput)
    );

    let techListForFrontend = [];

    if (Array.isArray(flattenedOutput)) {
      console.log(
        "flattenedOutput IS an array. Length:",
        flattenedOutput.length
      );
      if (flattenedOutput.length > 0) {
        console.log(
          "First item of flattenedOutput (structure check):",
          flattenedOutput[0]
        );
      }
      techListForFrontend = flattenedOutput; // Assume it's the list we want
    } else if (
      typeof flattenedOutput === "object" &&
      flattenedOutput !== null
    ) {
      console.log(
        "flattenedOutput is an OBJECT. Keys:",
        Object.keys(flattenedOutput)
      );
      // If it's an object, let's inspect its properties like 'techs' or 'childs'
      // This part is speculative, based on typical Payload structure
      // The actual list might be nested differently or require specific handling
      console.log("Inspecting flattenedOutput.childs:", flattenedOutput.childs);
      console.log("Inspecting flattenedOutput.techs:", flattenedOutput.techs);

      // Attempt to build the list by iterating through child components and their techs
      // This is a common pattern if `flatten` returns the root component with nested techs.
      const collectedTechs = new Map(); // To store unique techs: name -> {name, type, component}

      function processPayload(payload) {
        if (payload && payload.techs && payload.techs.forEach) {
          payload.techs.forEach((techName) => {
            // Try to find the full tech object if possible, or default to a simple one
            // This part is tricky without knowing the exact structure `flatten` intends for unique techs
            // For now, let's assume `flatten` should have made `techs` a list of objects,
            // or we might need to reconstruct type information.
            // The stack-analyzer's typical flattened list items look like { name: 'React', type: 'framework', component: [originalComponentWhereFound] }
            // If payload.techs is just an array of strings like ['react', 'nodejs'], we lack the 'type' and original component here.

            // Let's assume for a moment that if `flattenedOutput` is an object, its `techs` set
            // are the top-level unique techs. This is unlikely to be the *flattened* list, but let's log it.
            // A more robust approach would be to iterate children if this is the root payload.
            if (!collectedTechs.has(techName)) {
              // We are missing the 'type' and 'component' if payload.techs is just a Set of strings.
              // This path needs refinement based on what `flatten(result)` actually returns when it's an object.
              // For the purpose of this attempt, we'll create a placeholder.
              collectedTechs.set(techName, {
                name: techName,
                type: "unknown",
                component: payload,
              });
            }
          });
        }
        if (payload && payload.childs && payload.childs.forEach) {
          payload.childs.forEach((child) => processPayload(child));
        }
      }

      if (flattenedOutput.name === "flatten" && flattenedOutput.childs) {
        // From your log, flatten returns an object with name: 'flatten'
        console.log(
          "Processing childs of the 'flatten' named object returned by flatten()..."
        );
        // The actual technologies are usually attached to child components (e.g. package.json component)
        // The flatten function is supposed to extract these into a single list.
        // If `flattenedOutput` is the root and not an array, we might need to look into ITS children's `techs`.

        // Let's make a more direct assumption: if flatten() returns a root Payload,
        // its .list() method should give the flat list of unique techs.
        if (typeof flattenedOutput.list === "function") {
          console.log(
            "flattenedOutput (which is an object) has a .list() method. Calling it."
          );
          techListForFrontend = flattenedOutput.list();
          if (!Array.isArray(techListForFrontend)) {
            console.error(
              "flattenedOutput.list() did not return an array!",
              techListForFrontend
            );
            techListForFrontend = []; // fallback to empty
          }
        } else {
          console.log(
            "flattenedOutput (object) does NOT have .list(). Falling back to manual collection (speculative)."
          );
          // Fallback: Manually walk the components if .list() is not on the object returned by flatten()
          // This part is complex and might not be perfectly accurate without knowing the intended API for this case.
          const uniqueTechsFromTraversal = new Map();
          const stack = [flattenedOutput]; // Start with the root object
          while (stack.length > 0) {
            const current = stack.pop();
            if (current && current.techs && current.techs.forEach) {
              // `techs` is usually a Set of strings here
              current.techs.forEach((techName) => {
                if (!uniqueTechsFromTraversal.has(techName)) {
                  // We need to find the 'type' for this techName.
                  // The original `result.list()` would give { name, type, component } items.
                  // This manual traversal is a fallback and might be lossy.
                  uniqueTechsFromTraversal.set(techName, {
                    name: techName,
                    type: "unknown",
                    component: current,
                  });
                }
              });
            }
            if (current && current.childs && current.childs.forEach) {
              current.childs.forEach((child) => stack.push(child));
            }
          }
          techListForFrontend = Array.from(uniqueTechsFromTraversal.values());
        }
      } else {
        console.log(
          "flattenedOutput is an object, but not the expected 'flatten' root or structure for child processing. Logging as is for now."
        );
      }
      console.log(
        "Manually processed techListForFrontend from object. Length:",
        techListForFrontend.length
      );
      if (techListForFrontend.length > 0) {
        console.log(
          "First item of manually processed list:",
          techListForFrontend[0]
        );
      }
    } else {
      console.log(
        "flattenedOutput is neither an array nor a recognized object structure. Output:",
        flattenedOutput
      );
    }

    if (!Array.isArray(techListForFrontend)) {
      console.error(
        "techListForFrontend is not an array before .map(). This should not happen. Value:",
        techListForFrontend
      );
      return res.status(500).json({
        error:
          "Internal server error: Failed to prepare tech list for mapping.",
      });
    }

    // Transform techListForFrontend to a structure safe for JSON stringification and suitable for the frontend
    const frontendReadyOutput = techListForFrontend.map((item) => {
      const componentDetails = item.component;
      return {
        name: item.name,
        type: item.type,
        language: componentDetails ? componentDetails.language : undefined,
        path: componentDetails ? componentDetails.path : undefined,
        category: item.type,
        dependencies:
          componentDetails && componentDetails.dependencies
            ? componentDetails.dependencies.map((dep) => dep[1])
            : [],
        linesOfCode: componentDetails
          ? componentDetails.linesOfCode
          : undefined,
        size: componentDetails ? componentDetails.size : undefined,
        parent: componentDetails ? componentDetails.inComponent : undefined,
      };
    });

    // console.log('Processed Frontend Ready Output - First item:', frontendReadyOutput.length > 0 ? JSON.stringify(frontendReadyOutput[0], null, 2) : 'Empty output');

    // Get the full raw JSON output for debugging on the client side
    let rawAnalysisForClient = {};
    try {
      rawAnalysisForClient = result.toJson();
    } catch (e) {
      console.error("Error getting result.toJson() for client response:", e);
      rawAnalysisForClient = {
        error: "Failed to serialize raw analysis data.",
        details: e.message,
      };
    }

    res.json({
      displayData: frontendReadyOutput, // For UI rendering
      rawAnalysis: rawAnalysisForClient, // For browser console logging
    });
  } catch (error) {
    console.error("Error during analysis:", error);
    res
      .status(500)
      .json({ error: "Failed to analyze repository.", details: error.message });
  } finally {
    try {
      if (await fs.stat(tempRepoPath)) {
        console.log(`Cleaning up temporary repository: ${tempRepoPath}`);
        await fs.rm(tempRepoPath, { recursive: true, force: true });
        console.log("Temporary repository cleaned up.");
      }
    } catch (cleanupError) {
      // If stat fails, directory likely doesn't exist or was already removed.
      if (cleanupError.code !== "ENOENT") {
        console.error("Error during cleanup:", cleanupError);
      }
    }
  }
});

app.listen(port, () => {
  console.log(`what-the-tech server listening at http://localhost:${port}`);
});

// De-nest the output and deduplicate childs
// const flat = flatten(result); // THIS LINE SHOULD BE REMOVED - result is not defined here
