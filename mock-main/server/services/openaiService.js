/**
 * services/openaiService.js — Groq API integration layer
 *
 * Switched from OpenAI to Groq (free tier, very fast).
 * Model: llama-3.3-70b-versatile — capable, free, no credit card needed.
 *
 * Get your free key at: console.groq.com
 * Add to .env: GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx
 *
 * Functions exported:
 *  - generateQuestions(role, resumeText) → string[]
 *  - evaluateAnswer(question, answer)    → { score: number, feedback: string }
 */

const Groq = require("groq-sdk");

// Initialize Groq client — picks up GROQ_API_KEY from .env automatically
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Helper: call Groq ChatCompletions with consistent settings
const chat = async (systemPrompt, userPrompt) => {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile", // Free, fast, very capable
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt   },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0].message.content.trim();
};

// ─── Generate Interview Questions ─────────────────────────────────────────────

/**
 * generateQuestions
 * @param {string} role       - The job role to tailor questions for
 * @param {string} resumeText - Optional resume text to tailor questions
 * @returns {Promise<string[]>} - Array of 5 interview questions
 */
const generateQuestions = async (role, resumeText = "") => {

  // ─── MOCK FALLBACK (if no Groq API key) ───────────────────────────────────
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes("your_groq")) {
    console.log(`⚠️  No Groq API key found. Using mock questions for ${role}.`);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockDb = {
      "Frontend Developer": [
        "Explain the Virtual DOM in React and how it improves performance compared to the real DOM.",
        "How would you optimize the loading time of a heavy web application?",
        "DSA Focus: Given a string, write a function to find the length of the longest substring without repeating characters.",
        "What are the differences between CSS Grid and Flexbox, and when would you use each?",
        "Describe how you handle global state management in a large-scale application.",
      ],
      "Backend Developer": [
        "How do you design a scalable microservices architecture? What are the common pitfalls?",
        "Explain the difference between SQL and NoSQL databases. When would you choose one over the other?",
        "DSA Focus: Write an algorithm to detect a cycle in a directed graph. Explain your approach.",
        "How do you secure a RESTful API against common vulnerabilities like SQL injection and XSS?",
        "Describe your approach to database indexing and query optimization for slow endpoints.",
      ],
      "Full Stack Developer": [
        "How do you handle authentication and authorization securely across the entire stack?",
        "Describe how you would implement SSR versus CSR and when to use each.",
        "DSA Focus: Given an array of integers, find the contiguous subarray with the largest sum (Kadane's algorithm).",
        "Explain your workflow for deploying a full-stack application with CI/CD pipelines.",
        "How do you manage complex database schema migrations with zero downtime?",
      ],
      "Data Scientist": [
        "Explain the bias-variance tradeoff in machine learning and how you address it.",
        "How do you handle missing or heavily imbalanced data in a dataset?",
        "DSA Focus: Write a function to traverse a binary tree in zig-zag level order.",
        "Describe your process for selecting the right evaluation metrics for a classification model.",
        "How do you deploy, monitor, and retrain a machine learning model in production?",
      ],
      "DevOps Engineer": [
        "Explain the concept of Infrastructure as Code (IaC) and describe your experience with it.",
        "How do you approach container orchestration with Kubernetes?",
        "DSA Focus: Implement an LRU cache structure. What data structures would you use?",
        "Describe your strategy for monitoring and alerting for a distributed system.",
        "How do you handle secrets management and zero-trust security in a CI/CD pipeline?",
      ],
      "HR / Behavioral": [
        "Tell me about a time you had to deal with a difficult team member. How did you handle it?",
        "Describe a situation where you had to adapt to a significant change at work.",
        "How do you prioritize your tasks when you have multiple tight deadlines?",
        "Tell me about a time you made a mistake that affected your team. How did you resolve it?",
        "Can you share an example of how you contributed to building a positive company culture?",
      ],
      "Product Manager": [
        "How do you prioritize features on a product roadmap with competing stakeholder requests?",
        "Describe a time you used data to drive a product decision that went against your intuition.",
        "How do you balance technical debt with the delivery of new features?",
        "Explain your process for conducting user research and turning feedback into requirements.",
        "Tell me about a product launch that didn't go as planned. What did you learn?",
      ],
      "UI/UX Designer": [
        "Describe your process for creating a design system from scratch.",
        "How do you advocate for user-centered design when stakeholders prioritize business goals?",
        "Walk me through your approach to conducting and analyzing usability testing.",
        "Explain the difference between UI and UX and how they complement each other.",
        "How do you handle accessible design (WCAG compliance) in your projects?",
      ],
    };

    const defaultQuestions = [
      `Can you describe a challenging project you worked on as a ${role} and how you overcame it?`,
      `What are the core technical skills a ${role} should possess to be successful?`,
      `DSA Focus: Write an algorithm to reverse a linked list and explain your approach.`,
      `Describe a time you had a technical disagreement with a team member. How did you resolve it?`,
      `Where do you see the technology in your field heading over the next 2-3 years?`,
    ];

    const selected = mockDb[role] || defaultQuestions;

    if (resumeText) {
      const resumeQ = `I noticed from your resume that you have a specific technical background. How does that prepare you for a ${role} position?`;
      return [resumeQ, ...selected.slice(1)];
    }

    return selected;
  }
  // ───────────────────────────────────────────────────────────────────────────

  const systemPrompt = `You are an expert technical interviewer with 15+ years of experience.
Your task is to generate relevant, insightful interview questions for a given role.
Always respond with ONLY a valid JSON array of strings — no explanation, no markdown fences.
Example output: ["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]`;

  let userPrompt = `Generate exactly 5 interview questions for the role: "${role}".
Mix technical and behavioral questions appropriate for this role.
Questions should vary in difficulty from intermediate to advanced.
Return ONLY the JSON array.`;

  if (resumeText) {
    userPrompt += `\n\nTailor some questions based on this candidate's resume:\n\n--- RESUME START ---\n${resumeText}\n--- RESUME END ---`;
  }

  const rawContent = await chat(systemPrompt, userPrompt);
  const cleaned    = rawContent.replace(/```json|```/g, "").trim();
  const questions  = JSON.parse(cleaned);

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("Groq returned an invalid questions format");
  }

  return questions;
};

// ─── Evaluate a Single Answer ─────────────────────────────────────────────────

/**
 * evaluateAnswer
 * @param {string} question - The interview question
 * @param {string} answer   - The candidate's answer
 * @returns {Promise<{ score: number, feedback: string }>}
 */
const evaluateAnswer = async (question, answer) => {

  // ─── MOCK FALLBACK (if no Groq API key) ───────────────────────────────────
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes("your_groq")) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    let mockScore    = 5.0;
    let mockFeedback = "Decent attempt, but provide more specific technical details.";

    if (answer.trim().length > 100) {
      mockScore    = 8.5;
      mockFeedback = "Great answer! You provided solid detail and demonstrated good understanding.";
    } else if (answer.trim().length < 10) {
      mockScore    = 2.0;
      mockFeedback = "Too brief. Elaborate more and provide examples or context.";
    }

    return { score: mockScore, feedback: `(Mock Mode) ${mockFeedback}` };
  }
  // ───────────────────────────────────────────────────────────────────────────

  const systemPrompt = `You are a strict but fair technical interviewer evaluating a candidate's answer.
Score the answer on a scale of 0–10 (10 = perfect, 0 = completely wrong or no answer).
Provide constructive, specific feedback (2–4 sentences) explaining the score.
Always respond with ONLY valid JSON in this exact format:
{ "score": <number 0-10>, "feedback": "<string>" }
No markdown, no extra keys, no explanation outside the JSON.`;

  const userPrompt = `Interview Question: "${question}"

Candidate's Answer: "${answer}"

Evaluate this answer and respond with the JSON object.`;

  const rawContent = await chat(systemPrompt, userPrompt);
  const cleaned    = rawContent.replace(/```json|```/g, "").trim();
  const result     = JSON.parse(cleaned);

  if (
    typeof result.score    !== "number" ||
    result.score < 0 || result.score > 10 ||
    typeof result.feedback !== "string"
  ) {
    throw new Error("Groq returned an invalid evaluation format");
  }

  return {
    score:    Math.round(result.score * 10) / 10,
    feedback: result.feedback.trim(),
  };
};

module.exports = { generateQuestions, evaluateAnswer };