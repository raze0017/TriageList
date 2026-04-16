import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
dotenv.config();

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Say 'hello world'");
    console.log("Success:", result.response.text());
  } catch (err: any) {
    console.error("ERROR:");
    console.error(err);
    console.error("status:", err.status);
    console.error("statusText:", err.statusText);
  }
}
test();
