import { promises as fs } from "fs";
import path from "path";

export default defineEventHandler(async (event) => {
  try {
    const filePath = path.resolve("stores/responses.json");
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading or parsing responses.json:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
