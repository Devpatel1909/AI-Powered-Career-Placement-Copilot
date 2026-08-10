import React, { useState } from 'react';
import { Database, Upload, Search, BookOpen, CheckCircle, Sparkles } from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function RAGHubView() {
  const [docTitle, setDocTitle] = useState('Google Placement Experience 2026');
  const [category, setCategory] = useState('Interview Experience');
  const [content, setContent] = useState(
    "Google Placement Experience 2026:\nRound 1: Screening on Data Structures, Time Complexity, and Arrays.\nRound 2: System Design for a scalable URL Shortener and caching strategies.\nRound 3: Behavioral Leadership principles and Googleyness. Focus heavily on clean code and STAR method responses."
  );
  const [ingestStatus, setIngestStatus] = useState(null);
  const [ingestLoading, setIngestLoading] = useState(false);

  const [query, setQuery] = useState('What are the interview rounds at Google?');
  const [queryResult, setQueryResult] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);

  const handleIngest = async (e) => {
    e.preventDefault();
    setIngestLoading(true);
    setIngestStatus(null);
    try {
      const res = await apiService.ingestDocument(docTitle, category, content);
      if (res.success) {
        setIngestStatus(`Successfully ingested document "${res.data.document_title}" into ChromaDB vector database. Indexed ${res.data.chunks_indexed} text chunks.`);
      }
    } catch (err) {
      setIngestStatus('Error ingesting document.');
    } finally {
      setIngestLoading(false);
    }
  };

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setQueryLoading(true);
    try {
      const res = await apiService.queryRAG(query);
      if (res.success) {
        setQueryResult(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setQueryLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <Database className="w-6 h-6 text-amber-400" /> Module 8: RAG Knowledge Base & ChromaDB Vector Store
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Ingest placement notes and experiences into vector storage, perform similarity search, and generate grounded answers with source citations.
        </p>
      </div>

      {/* Ingest & Search Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Document Ingestion Form */}
        <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4">
          <h3 className="text-md font-bold text-gray-100 flex items-center gap-2">
            <Upload className="w-4 h-4 text-amber-400" /> Ingest Document into Vector DB
          </h3>

          <form onSubmit={handleIngest} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Document Title</label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-100 focus:outline-none focus:border-amber-500"
              >
                <option value="Interview Experience">Interview Experience</option>
                <option value="Placement Notes">Placement Notes</option>
                <option value="Job Description">Job Description</option>
                <option value="Course Notes">Course Notes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Document Content</label>
              <textarea
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-100 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={ingestLoading}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-3.5 h-3.5" /> Chunk, Embed & Save to ChromaDB
            </button>
          </form>

          {ingestStatus && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" /> {ingestStatus}
            </div>
          )}
        </div>

        {/* RAG Query Form */}
        <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4">
          <h3 className="text-md font-bold text-gray-100 flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-400" /> Vector Similarity Query
          </h3>

          <form onSubmit={handleQuery} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Search Question</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={queryLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" /> Run Top-K Vector Retrieval & LLM Answer
            </button>
          </form>

          {queryLoading && <LoadingSpinner message="Searching ChromaDB Vector Embeddings..." />}

          {queryResult && !queryLoading && (
            <div className="space-y-3 pt-2">
              <div className="p-3 bg-gray-950/80 rounded-xl border border-gray-800 space-y-1 text-xs">
                <p className="text-gray-400 font-bold uppercase text-[10px]">Generated Grounded Answer:</p>
                <p className="text-gray-200 leading-relaxed">{queryResult.generated_answer}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-amber-400 uppercase">Top-K Retrieved Context Chunks:</p>
                {queryResult.retrieved_chunks.map((chunk, cIdx) => (
                  <div key={cIdx} className="p-2.5 bg-gray-900/60 rounded-xl border border-gray-800/80 text-[11px] font-mono text-gray-300">
                    "{chunk}"
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
