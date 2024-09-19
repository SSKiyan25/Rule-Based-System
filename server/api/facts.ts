import { defineEventHandler, readBody } from "h3";
import fs from "fs";
import path from "path";

export default defineEventHandler(async (event) => {
  console.log("Request received: ", event.node.req.method);
  const filePath = path.resolve("public/facts.json");

  try {
    if (event.node.req.method === "GET") {
      // Read facts for GET requests
      console.log("GET facts");
      const data = fs.readFileSync(filePath, "utf-8");
      console.log(data);
      const parsedData = JSON.parse(data || "[]");
      return parsedData;
    }

    if (event.node.req.method === "POST") {
      // Parse the POST body
      console.log("POST facts");
      const body = await readBody(event);
      let currentFacts: any[] = [];
      try {
        currentFacts = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      } catch (e) {
        console.log("Error parsing facts.json", e);
      }

      console.log("Received body:", body);
      currentFacts.push(body);

      fs.writeFileSync(filePath, JSON.stringify(currentFacts, null, 2));

      return { status: "success" };
    }

    if (event.node.req.method === "DELETE") {
      console.log("DELETE facts");
      fs.writeFileSync(filePath, JSON.stringify([]));
      return { status: "success" };
    }
  } catch (error) {
    console.error("Error handling request:", error);
    return { statusCode: 500, body: { error: (error as Error).message } };
  }
});
