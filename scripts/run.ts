import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const RESULTS_PATH = process.env.RESULTS_PATH;
const PRIVATE_PATH = path.join(process.cwd(), "private");

if (!RESULTS_PATH) {
  console.error("Error: RESULTS_PATH is not defined in .env file");
  process.exit(1);
}

if (!fs.existsSync(RESULTS_PATH)) {
  console.error(`Error: RESULTS_PATH "${RESULTS_PATH}" does not exist`);
  process.exit(1);
}

// Remove existing symlink if it exists
if (fs.existsSync(PRIVATE_PATH)) {
  try {
    const stats = fs.lstatSync(PRIVATE_PATH);
    if (stats.isSymbolicLink()) {
      fs.unlinkSync(PRIVATE_PATH);
      console.log("Removed existing symbolic link");
    } else {
      console.error("Error: ./private exists but is not a symbolic link");
      process.exit(1);
    }
  } catch (error) {
    console.error("Error checking/removing existing symlink:", error);
    process.exit(1);
  }
}

// Create symbolic link
try {
  fs.symlinkSync(RESULTS_PATH, PRIVATE_PATH, "dir");
  console.log(`Created symbolic link from ./private to ${RESULTS_PATH}`);
} catch (error) {
  console.error("Error creating symbolic link:", error);
  process.exit(1);
}

execSync("waku dev", { stdio: "inherit" });
