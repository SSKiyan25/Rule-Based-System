import fs from "fs";
import path from "path";

export default defineEventHandler(async (event) => {
  console.log("Consequence Request received: ", event.node.req.method);
  const filePath = path.resolve("public/consequences.json");
  try {
    if (event.node.req.method === "GET") {
      const data = fs.readFileSync(filePath, "utf-8");
      console.log("data read from file", data);
      const parsedData = JSON.parse(data || "[]");
      return parsedData;
    }

    if (event.node.req.method === "POST") {
      const body = await readBody(event);
      console.log("Received POST body:", body);
      let currentConsequences: any[] = [];
      try {
        currentConsequences = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      } catch (e) {
        console.log("Error parsing consequences.json", e);
      }

      if (!body.conclusion) {
        throw new Error("Invalid body content");
      }

      currentConsequences.push(body.conclusion);
      fs.writeFileSync(filePath, JSON.stringify(currentConsequences, null, 2));
      return { status: "success" };
    }

    if (event.node.req.method === "DELETE") {
      fs.writeFileSync(filePath, JSON.stringify([]));
      return { status: "success" };
    }
  } catch (error) {
    console.error("Error handling request:", error);
    return { statusCode: 500, body: { error: (error as Error).message } };
  }
});
