import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
});

export const askAI = async (question: string) => {
  try {
    const res = await API.post("/ask", { question });
    return res.data;
  } catch (error) {
    console.error("API Error:", error);
    return { answer: "⚠️ Server error. Try again." };
  }
};