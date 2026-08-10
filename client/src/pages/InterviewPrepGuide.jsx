import React, { useState } from 'react';
import { BookOpen, Terminal, CheckCircle, HelpCircle, Shield, Cpu, Code2, Database } from 'lucide-react';

export default function InterviewPrepGuide() {
  const [selectedTopic, setSelectedTopic] = useState('prompt-engineering');

  const topics = [
    {
      id: 'prompt-engineering',
      title: '1. Prompt Engineering & Structured JSON Output',
      icon: Code2,
      content: `
### Why Prompt Engineering is Needed
LLMs are standard text completion probability engines. Without strict prompt instructions, they emit conversational intros ("Sure, here is your output:"), unstructured prose, or invalid formatting that breaks downstream parsing logic.

### Why Structured JSON is Better than Free Text
1. **Machine Parsability**: Automated backends (FastAPI/Express) require deterministic data structures to save into MongoDB or display in UI fields.
2. **Schema Enforcement**: Passing Pydantic models directly to LLM system instructions ensures typed output (e.g. lists of skills, numeric scores 0-100).
3. **Consistency**: Eliminates parsing ambiguity across varied candidate resume structures.

### Accuracy & Challenges
- **Challenges**: Hallucination of skills not in resume, line break truncation in PDFs, multi-page layout noise.
- **Accuracy Boosters**: Few-shot schema examples, strict System Prompts with boundary instructions ("Extract ONLY facts from the provided text"), clean regex pre-processing.
      `
    },
    {
      id: 'rag-vector-db',
      title: '2. RAG Pipeline, Embeddings & Vector Indexing',
      icon: Database,
      content: `
### Vector Embeddings & Similarity Search
- **Embeddings**: Dense numerical vectors representing semantic meaning of text chunks (e.g., 768 or 1536 dimensions).
- **Chunking Strategy**: Recursive Character Splitting (500 chars with 50 char overlap) ensures context boundaries are maintained without cutting words mid-sentence.
- **Top-K Cosine Similarity**: Compares distance between user question vector and stored document vectors in ChromaDB to retrieve top matches.

### How RAG Reduces Hallucination
Instead of relying on LLM parametric memory (which can hallucinate), RAG retrieves ground-truth documents (placement notes, JD guidelines) and injects them directly into the LLM system prompt context window:
"Answer the user query using ONLY the provided context below."
      `
    },
    {
      id: 'agentic-ai',
      title: '3. Agentic AI Workflows & Tool Calling',
      icon: Cpu,
      content: `
### Autonomous Tool Execution Cycle
1. **Planning & Intent Classification**: LLM analyzes user prompt ("Am I ready for Microsoft?") and determines required tools.
2. **Tool Calling**: Agent emits tool name and structured input JSON (e.g. \`Skill Gap Tool\`, \`Roadmap Tool\`).
3. **Execution & Observation**: FastAPI executes the service, captures output, and feeds the observation back into the agent context loop.
4. **Final Synthesis**: Agent combines observations into a polished response.

### LangGraph & LangChain State Machine
- Manages state graphs where nodes represent tool invocations or decision gates, enabling multi-turn autonomous execution and failure recovery.
      `
    },
    {
      id: 'system-architecture',
      title: '4. Scalable Architecture, Security & Tradeoffs',
      icon: Shield,
      content: `
### Decoupled Microservice Architecture
- **React UI**: Responsive presentation layer.
- **Node.js Express Gateway**: Handles authentication, user session state, PDF uploads, MongoDB persistence.
- **FastAPI Python AI Microservice**: Encapsulates CPU/GPU bound AI tasks, ChromaDB vector indexing, and DeepSeek V4 Flash LLM calls via OpenRouter.

### Security, Scaling & Tradeoffs
- **Security**: Sanitize inputs to prevent Prompt Injection attacks; validate file types (PDF mime-type check); enforce API rate limiting.
- **Performance & Latency**: Asynchronous non-blocking calls in FastAPI; caching repeated resume parsing results; sliding-window chat history.
      `
    }
  ];

  const currentTopic = topics.find(t => t.id === selectedTopic);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-purple-400" /> Module 12: Senior AI Engineer Interview Preparation Guide
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Deep architectural explanations, prompt engineering principles, design tradeoffs, and interview Q&A.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          {topics.map((t) => {
            const Icon = t.icon;
            const isActive = selectedTopic === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTopic(t.id)}
                className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-600/10'
                    : 'bg-gray-900/60 text-gray-400 hover:text-gray-200 border border-gray-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {t.title}
              </button>
            );
          })}
        </div>

        {/* Content Viewer */}
        <div className="md:col-span-3 glass-card p-6 rounded-2xl border border-gray-800 space-y-4">
          <h3 className="text-lg font-bold text-gray-100 border-b border-gray-800 pb-3 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-purple-400" /> {currentTopic.title}
          </h3>

          <div className="prose prose-invert max-w-none text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
            {currentTopic.content}
          </div>
        </div>
      </div>
    </div>
  );
}
