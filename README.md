# Agentflow AI - Agentic AI Automation Platform

Agentflow AI is a full-stack, production-ready AI Operations Automation Platform. It transforms natural language descriptions into executable, visual workflows. The platform leverages a multi-agent orchestration engine (Planner, Execution, Validation, Recovery, and Monitoring) to execute complex tasks across third-party services like Gmail, Slack, Discord, and Google Sheets.

## Development Methodology: Spec-Driven Development

This project was engineered using Spec-Driven Development (SDD), a paradigm that contrasts sharply with traditional, ad-hoc coding (often referred to as "vibe-coding"). 

The development process began by defining a strict, comprehensive `spec.md` contract. This document explicitly detailed the folder structure, API endpoints, database schemas, agent logic, and UI requirements. An AI coding agent was then tasked with generating the implementation strictly based on this specification.

This approach resulted in several distinct advantages over normal projects:
- **Architectural Integrity:** Strict separation of concerns was maintained from day one (e.g., thin controllers, isolated agents, and distinct service layers).
- **Scalability and Consistency:** Uniform naming conventions and error-handling patterns were enforced across the entire codebase.
- **Reduced Technical Debt:** By defining the contract first, the generated code was highly structured, minimizing the need for extensive refactoring later.

## Comparison: Agentflow AI vs. n8n / Zapier

While platforms like n8n and Zapier are excellent for static automation, Agentflow AI introduces two significant paradigm shifts:

1. **Agentic Execution vs. Static Workflows**
   Traditional platforms follow predefined, rigid paths. Agentflow AI utilizes a cooperative AI agent loop. If an API call fails, the Recovery Agent intercepts the error, classifies it (e.g., Rate Limit, Transient), and decides whether to retry with backoff or escalate. The Validation Agent ensures data integrity before passing payloads to the next node.

2. **Bring Your Own Key (BYOK) Architecture**
   Most platforms charge a premium markup for AI usage. Agentflow AI operates on a BYOK model, making the platform free to host and use. Users provide their own Gemini or OpenRouter API keys. These keys are encrypted at rest using AES-256 before being stored in the database, ensuring the platform owner incurs zero AI infrastructure costs while maintaining enterprise-grade security.

## Tech Stack

**Frontend:**
- Framework: Next.js (Pages Router), React 19
- Styling: Tailwind CSS
- State Management: Zustand
- Workflow Canvas: React Flow (@xyflow/react)
- Real-time Communication: Socket.IO Client

**Backend & AI:**
- Runtime: Node.js, Express
- Database: MongoDB & Mongoose
- Queue/Job Management: BullMQ on Redis (with an in-memory fallback)
- AI Orchestration: LangChain, LangGraph, OpenRouter API, Google Generative AI SDK
- Security: JWT, bcrypt, Helmet, AES-256-CBC Token Encryption

**Integrations (OAuth2):**
- Gmail, Slack, Discord, and Google Sheets.

## Core Features

- **Prompt-to-Graph Generation:** Converts natural language into structured, executable graph representations.
- **Human-in-the-Loop (HITL):** Allows workflows to pause execution and request manual input via the UI before proceeding with critical actions.
- **Distributed Tracing:** Implements `traceId` and `spanId` observability, providing a detailed waterfall timeline of agent and node execution durations.
- **Self-Improving Feedback Loop:** A global feedback mechanism persists user-reported bugs to MongoDB. The AI reads recent feedback to avoid repeating generation mistakes in subsequent sessions.
- **Template Library:** Pre-built workflows (e.g., Invoice Processing, AI Alerts) available for users to clone and customize.

## Future Scope: Machine Learning Integration

The current architecture is designed to support advanced machine learning integrations in future iterations:

- **Predictive Refinement:** The platform collects user feedback and execution logs. A dedicated ML model will be trained on this dataset to analyze user behavior, automatically refine overall application performance, and preemptively fix UI/UX bottlenecks.
- **Smart Workflow Generation:** ML algorithms will be integrated into the workflow creation process to learn from user preferences, suggest optimal node configurations, and predict missing steps before the user finishes typing the prompt.

## Use Cases

- **Customer Support Triage:** Read incoming Gmail messages, use AI to classify urgency, and route alerts to Slack or Discord.
- **Automated Reporting:** Read data from Google Sheets, generate AI-powered summaries, and distribute them via email.
- **Invoice Processing:** Extract data from spreadsheets, validate the numbers using AI, and push the structured data to a database.
- **Lead Qualification:** Summarize inbound webhook data with AI and send structured alerts to sales teams.

## Try the Application and Provide Feedback

We are actively seeking users to test the platform. Your feedback is critical for the next phase of development.

- **Live Application:** [https://agentflow-ai-omega.vercel.app/](https://agentflow-ai-omega.vercel.app/)
- **Live API:** [https://agentflow-ai-uwhu.onrender.com/](https://agentflow-ai-uwhu.onrender.com/)

**Getting Started:**
1. Register an account or use "Continue with Google".
2. Navigate to Settings and add your Gemini or OpenRouter API key.
3. Navigate to Integrations to connect your Gmail or Slack accounts.
4. Navigate to the Workflow Builder and test a prompt such as: "Read my Google Sheet, summarize it with AI, and send it to my email."

If you encounter any issues or have feature requests, please use the Feedback widget in the application or contact the developer directly at grevanth993@gmail.com.

## License

This project is licensed under the MIT License.