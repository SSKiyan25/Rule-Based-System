import { promises as fs } from "fs";
import path from "path";

export default defineEventHandler(async () => {
  try {
    const filePath = path.resolve("public/knowledge_base.json");
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading or parsing knowledge_base.json:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
