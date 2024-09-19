import fs from "fs";
import path from "path";

export default defineEventHandler(async () => {
  const filePath = path.resolve("stores/fwquestions.json");
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
});
