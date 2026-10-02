import React, { useState, useEffect, useRef } from "react";
import {
  Brain, Database, Search, Globe, BookOpen, GraduationCap,
  Presentation, Code2, Palette, Rocket, CheckCircle2, AlertCircle,
  Copy, Download, Play, RefreshCw, Send, Sparkles, FileText,
  HelpCircle, Layers, ArrowRight, Check, ChevronDown, ChevronRight,
  ListOrdered, Shield, Eye, Cpu, Terminal, ExternalLink, Printer
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { apiPost, ApiError, isOnline } from "../utils/apiClient";

// =========================================================================
// 147 FEATURES MASTER DIRECTORY SPECIFICATION
// =========================================================================
export interface FeatureDef {
  num: number;
  id: string;
  pillar: number;
  pillarName: string;
  name: string;
  description: string;
}

export const ALL_147_FEATURES: FeatureDef[] = [
  // 1. AI BRAIN (1-15)
  { num: 1, id: "adv-reasoning", pillar: 1, pillarName: "AI Brain", name: "Advanced reasoning", description: "Deep conceptual reasoning across abstract multi-domain problems." },
  { num: 2, id: "multi-step", pillar: 1, pillarName: "AI Brain", name: "Multi-step problem solving", description: "Decompose complex multi-faceted challenges into sequential deductive steps." },
  { num: 3, id: "context-understanding", pillar: 1, pillarName: "AI Brain", name: "Context understanding", description: "Retain and synthesize implicit contextual nuances across domains." },
  { num: 4, id: "logical-reasoning", pillar: 1, pillarName: "AI Brain", name: "Logical reasoning", description: "Formal deductive, inductive, and abductive inference validation." },
  { num: 5, id: "math-reasoning", pillar: 1, pillarName: "AI Brain", name: "Mathematical reasoning", description: "Rigorous symbolic, algebraic, and calculus proofs and derivations." },
  { num: 6, id: "science-reasoning", pillar: 1, pillarName: "AI Brain", name: "Scientific reasoning", description: "Empirical hypothesis testing, physical laws, and experimental design." },
  { num: 7, id: "coding-reasoning", pillar: 1, pillarName: "AI Brain", name: "Coding reasoning", description: "Algorithmic complexity, invariant analysis, and architectural tradeoffs." },
  { num: 8, id: "planning-decomp", pillar: 1, pillarName: "AI Brain", name: "Planning and task decomposition", description: "Break overarching goals into structured milestone subtasks." },
  { num: 9, id: "compare-solutions", pillar: 1, pillarName: "AI Brain", name: "Compare multiple solutions", description: "Contrast 3+ distinct approaches with pros, cons, and performance metrics." },
  { num: 10, id: "explain-correct", pillar: 1, pillarName: "AI Brain", name: "Explain why an answer is correct", description: "Justify conclusions step-by-step with counter-factual verification." },
  { num: 11, id: "detect-contradictions", pillar: 1, pillarName: "AI Brain", name: "Detect contradictions", description: "Audit statements for internal paradoxes and empirical inconsistencies." },
  { num: 12, id: "self-check", pillar: 1, pillarName: "AI Brain", name: "Self-check and answer verification", description: "Automated sanity checks, boundary condition validation, and proofing." },
  { num: 13, id: "uncertainty-detection", pillar: 1, pillarName: "AI Brain", name: "Uncertainty detection", description: "Explicitly flag probabilistic margins, missing data, and assumptions." },
  { num: 14, id: "followup-reasoning", pillar: 1, pillarName: "AI Brain", name: "Follow-up reasoning", description: "Trace consequence chains and anticipate secondary and tertiary impacts." },
  { num: 15, id: "explain-simple", pillar: 1, pillarName: "AI Brain", name: "Explain complex questions in simple language", description: "Demystify advanced concepts with relatable real-world analogies." },

  // 2. DEEP MEMORY (16-30)
  { num: 16, id: "long-term-memory", pillar: 2, pillarName: "Deep Memory", name: "Long-term memory", description: "Persistent cross-session knowledge retention with semantic tagging." },
  { num: 17, id: "short-term-memory", pillar: 2, pillarName: "Deep Memory", name: "Short-term conversation memory", description: "Immediate conversational buffer with rapid context window indexing." },
  { num: 18, id: "user-pref-memory", pillar: 2, pillarName: "Deep Memory", name: "User preference memory", description: "Persistent coding style, tone, format, and workflow preferences." },
  { num: 19, id: "project-memory", pillar: 2, pillarName: "Deep Memory", name: "Project memory", description: "Isolated state graphs for individual client and software projects." },
  { num: 20, id: "study-memory", pillar: 2, pillarName: "Deep Memory", name: "Study and education memory", description: "Course syllabi, textbook notes, and ongoing learning progress." },
  { num: 21, id: "recall-prev", pillar: 2, pillarName: "Deep Memory", name: "Previous conversation recall", description: "Retrieve specific discussions and decisions from past sessions." },
  { num: 22, id: "facts-saving", pillar: 2, pillarName: "Deep Memory", name: "Important facts saving", description: "Curated key-value store of mission-critical user facts and figures." },
  { num: 23, id: "instruction-memory", pillar: 2, pillarName: "Deep Memory", name: "User instruction memory", description: "Strict compliance directives that override general defaults." },
  { num: 24, id: "continue-work", pillar: 2, pillarName: "Deep Memory", name: "Continue previous work", description: "Resume unfinished code, essays, or research seamlessly." },
  { num: 25, id: "multi-project-memory", pillar: 2, pillarName: "Deep Memory", name: "Separate memory for multiple projects", description: "Zero-bleed compartmentalized memory spaces across distinct projects." },
  { num: 26, id: "memory-search", pillar: 2, pillarName: "Deep Memory", name: "Memory search", description: "Full-text and semantic keyword search across memory stores." },
  { num: 27, id: "memory-update", pillar: 2, pillarName: "Deep Memory", name: "Memory update", description: "Modify stored records when facts or circumstances change." },
  { num: 28, id: "memory-correction", pillar: 2, pillarName: "Deep Memory", name: "Memory correction", description: "Correct false or outdated memories with verifiable updates." },
  { num: 29, id: "memory-deletion", pillar: 2, pillarName: "Deep Memory", name: "Memory deletion and control", description: "Full user sovereignty to purge, export, or scrub stored records." },
  { num: 30, id: "auto-retrieval", pillar: 2, pillarName: "Deep Memory", name: "Automatic relevant-memory retrieval", description: "Synthesize relevant memory into context whenever a task demands it." },

  // 3. DEEP RESEARCH ENGINE (31-45)
  { num: 31, id: "multi-source-research", pillar: 3, pillarName: "Deep Research Engine", name: "Multi-source web research", description: "Ingest and synthesize dozens of diverse web nodes concurrently." },
  { num: 32, id: "auto-research-plan", pillar: 3, pillarName: "Deep Research Engine", name: "Automatic research planning", description: "Formulate investigative matrices, search queries, and source targets." },
  { num: 33, id: "website-analysis", pillar: 3, pillarName: "Deep Research Engine", name: "Multiple website analysis", description: "Extract key arguments, statistics, and methodology from target pages." },
  { num: 34, id: "academic-sources", pillar: 3, pillarName: "Deep Research Engine", name: "Academic source searching", description: "Query peer-reviewed repositories, IEEE, PubMed, arXiv, and JSTOR." },
  { num: 35, id: "paper-analysis", pillar: 3, pillarName: "Deep Research Engine", name: "Research paper and report analysis", description: "Critique methodology, sample sizes, p-values, and statistical power." },
  { num: 36, id: "cross-checking", pillar: 3, pillarName: "Deep Research Engine", name: "Source cross-checking", description: "Triangulate claims across 3+ independent authoritative authorities." },
  { num: 37, id: "conflicting-info", pillar: 3, pillarName: "Deep Research Engine", name: "Conflicting information detection", description: "Highlight divergent claims and explain root causes of disagreement." },
  { num: 38, id: "source-citations", pillar: 3, pillarName: "Deep Research Engine", name: "Source citations", description: "Generate formatted scholarly citations with direct URL grounding." },
  { num: 39, id: "research-report-gen", pillar: 3, pillarName: "Deep Research Engine", name: "Research report generation", description: "Compile publication-ready dossiers with executive briefings." },
  { num: 40, id: "executive-summary", pillar: 3, pillarName: "Deep Research Engine", name: "Executive summary", description: "C-suite / faculty high-yield brief with core conclusions." },
  { num: 41, id: "detailed-findings", pillar: 3, pillarName: "Deep Research Engine", name: "Detailed findings", description: "Deep thematic chapters with supporting graphs and quotations." },
  { num: 42, id: "evidence-tables", pillar: 3, pillarName: "Deep Research Engine", name: "Evidence tables", description: "Structured markdown tables matching claims to empirical evidence." },
  { num: 43, id: "source-list", pillar: 3, pillarName: "Deep Research Engine", name: "Source list", description: "Organized bibliography categorized by credibility and domain tier." },
  { num: 44, id: "followup-research", pillar: 3, pillarName: "Deep Research Engine", name: "Follow-up research", description: "Probe open questions and unexpected findings discovered in round one." },
  { num: 45, id: "research-to-doc", pillar: 3, pillarName: "Deep Research Engine", name: "Research-to-document and presentation conversion", description: "Instantly transform findings into slides, papers, or speeches." },

  // 4. WEB KNOWLEDGE (46-57)
  { num: 46, id: "live-web-search", pillar: 4, pillarName: "Web Knowledge", name: "Live web search", description: "Real-time Google search grounding via verified API endpoints." },
  { num: 47, id: "latest-info", pillar: 4, pillarName: "Web Knowledge", name: "Latest information retrieval", description: "Retrieve up-to-the-minute updates on fast-moving current events." },
  { num: 48, id: "website-reading", pillar: 4, pillarName: "Web Knowledge", name: "Website reading", description: "Scrape and read live web pages to synthesize raw content." },
  { num: 49, id: "multi-source-comp", pillar: 4, pillarName: "Web Knowledge", name: "Multiple-source comparison", description: "Juxtapose competing news outlets or technical documentations." },
  { num: 50, id: "current-news", pillar: 4, pillarName: "Web Knowledge", name: "Current news and information research", description: "Filter verified journalism from unconfirmed social chatter." },
  { num: 51, id: "tech-docs-search", pillar: 4, pillarName: "Web Knowledge", name: "Technical documentation search", description: "Index official API docs, RFC specs, MDN, and framework guides." },
  { num: 52, id: "product-info", pillar: 4, pillarName: "Web Knowledge", name: "Product and service information", description: "Specifications, benchmarks, pricing, and feature comparisons." },
  { num: 53, id: "tutorial-searching", pillar: 4, pillarName: "Web Knowledge", name: "Tutorial and guide searching", description: "Locate step-by-step implementation walkthroughs." },
  { num: 54, id: "academic-info-search", pillar: 4, pillarName: "Web Knowledge", name: "Academic information searching", description: "Target university portals, preprints, and conference proceedings." },
  { num: 55, id: "source-credibility", pillar: 4, pillarName: "Web Knowledge", name: "Source credibility checking", description: "Evaluate author bias, domain reputation, and peer review status." },
  { num: 56, id: "web-summarization", pillar: 4, pillarName: "Web Knowledge", name: "Web information summarization", description: "Condense long-form articles into concise, actionable key takeaways." },
  { num: 57, id: "auto-source-filter", pillar: 4, pillarName: "Web Knowledge", name: "Automatic relevant-source filtering", description: "Discard SEO spam, content farms, and irrelevant search results." },

  // 5. GENERAL WORLD KNOWLEDGE (58-67)
  { num: 58, id: "history", pillar: 5, pillarName: "World Knowledge", name: "History", description: "Chronological world events, civilizations, geopolitical shifts, and primary records." },
  { num: 59, id: "geography", pillar: 5, pillarName: "World Knowledge", name: "Geography", description: "Physical topography, geopolitical borders, demographics, and climate zones." },
  { num: 60, id: "science-gen", pillar: 5, pillarName: "World Knowledge", name: "Science", description: "Scientific method, astronomy, geology, meteorology, and scientific revolutions." },
  { num: 61, id: "physics", pillar: 5, pillarName: "World Knowledge", name: "Physics", description: "Classical mechanics, quantum electrodynamics, thermodynamics, and relativity." },
  { num: 62, id: "chemistry", pillar: 5, pillarName: "World Knowledge", name: "Chemistry", description: "Organic synthesis, stoichiometry, thermodynamics, and molecular bonding." },
  { num: 63, id: "biology", pillar: 5, pillarName: "World Knowledge", name: "Biology", description: "Genetics, cellular biology, neuroscience, evolution, and ecology." },
  { num: 64, id: "mathematics", pillar: 5, pillarName: "World Knowledge", name: "Mathematics", description: "Discrete math, linear algebra, calculus, topology, and probability theory." },
  { num: 65, id: "technology", pillar: 5, pillarName: "World Knowledge", name: "Technology", description: "Semiconductors, neural architectures, distributed systems, and quantum computing." },
  { num: 66, id: "literature-arts", pillar: 5, pillarName: "World Knowledge", name: "Literature and arts", description: "Literary movements, philosophical canons, visual aesthetics, and music theory." },
  { num: 67, id: "general-education", pillar: 5, pillarName: "World Knowledge", name: "General education and everyday knowledge", description: "Practical world knowledge, civic systems, finance, and everyday logic." },

  // 6. UNIVERSITY / STUDENT WORK (68-90)
  { num: 68, id: "assignment-assist", pillar: 6, pillarName: "University Suite", name: "Assignment assistance", description: "Understand complex rubrics and structure comprehensive academic submissions." },
  { num: 69, id: "essay-writing", pillar: 6, pillarName: "University Suite", name: "Essay writing", description: "Draft argumentative, analytical, and expository scholarly essays." },
  { num: 70, id: "research-proposal", pillar: 6, pillarName: "University Suite", name: "Research proposal", description: "Formulate research rationale, aims, methodology, and significance." },
  { num: 71, id: "research-question-dev", pillar: 6, pillarName: "University Suite", name: "Research question development", description: "Refine broad topics into tight, testable academic research questions." },
  { num: 72, id: "lit-review", pillar: 6, pillarName: "University Suite", name: "Literature review", description: "Thematic synthesis of seminal and contemporary academic literature." },
  { num: 73, id: "thesis-structure", pillar: 6, pillarName: "University Suite", name: "Thesis structure", description: "Full university-standard 6-chapter dissertation architecture." },
  { num: 74, id: "thesis-chapter-draft", pillar: 6, pillarName: "University Suite", name: "Thesis chapter drafting", description: "Scholarly drafting of chapters with formal terminology and references." },
  { num: 75, id: "abstract-writing", pillar: 6, pillarName: "University Suite", name: "Abstract writing", description: "Crisp 250-word abstracts covering background, methods, results, and impact." },
  { num: 76, id: "intro-assist", pillar: 6, pillarName: "University Suite", name: "Introduction assistance", description: "Problem statement, research motivations, and scope delimitation." },
  { num: 77, id: "methodology-assist", pillar: 6, pillarName: "University Suite", name: "Methodology assistance", description: "Quantitative, qualitative, and mixed-method empirical designs." },
  { num: 78, id: "results-assist", pillar: 6, pillarName: "University Suite", name: "Results assistance", description: "Statistical interpretation, data visualization guidelines, and tables." },
  { num: 79, id: "discussion-assist", pillar: 6, pillarName: "University Suite", name: "Discussion assistance", description: "Compare findings to existing literature, limitations, and implications." },
  { num: 80, id: "ref-biblio-format", pillar: 6, pillarName: "University Suite", name: "References and bibliography formatting", description: "Strict formatting in APA 7th, MLA 9th, IEEE, Chicago, Harvard, and Vancouver." },
  { num: 81, id: "citation-assist", pillar: 6, pillarName: "University Suite", name: "Citation assistance", description: "In-text parenthetical and numerical citation placements." },
  { num: 82, id: "paper-analysis-uni", pillar: 6, pillarName: "University Suite", name: "Research paper analysis", description: "Critique peer-reviewed papers for internal validity and statistical rigor." },
  { num: 83, id: "journal-summarization", pillar: 6, pillarName: "University Suite", name: "Journal and paper summarization", description: "Extract methodologies, datasets, findings, and identified limitations." },
  { num: 84, id: "notes-to-assignment", pillar: 6, pillarName: "University Suite", name: "Notes → assignment", description: "Synthesize scattered class notes into polished assignment drafts." },
  { num: 85, id: "notes-to-study-guide", pillar: 6, pillarName: "University Suite", name: "Notes → study guide", description: "Convert messy lecture notes into structured exam cram guides." },
  { num: 86, id: "textbook-explanation", pillar: 6, pillarName: "University Suite", name: "Textbook → explanation", description: "Deconstruct dense textbook passages into intuitive conceptual breakdowns." },
  { num: 87, id: "exam-prep", pillar: 6, pillarName: "University Suite", name: "Exam preparation", description: "Targeted revision strategies, formula sheets, and key concept matrices." },
  { num: 88, id: "practice-questions", pillar: 6, pillarName: "University Suite", name: "Practice questions", description: "Generate challenging exam-level short and long essay questions." },
  { num: 89, id: "mcq-gen", pillar: 6, pillarName: "University Suite", name: "MCQ generation", description: "Generate multiple-choice questions with tricky distractors and full rationale." },
  { num: 90, id: "viva-prep", pillar: 6, pillarName: "University Suite", name: "Viva preparation", description: "Simulate external defense panel with tough defense questions and model answers." },

  // 7. PRESENTATION & DOCUMENT CREATION (91-105)
  { num: 91, id: "ppt-presentation", pillar: 7, pillarName: "Presentation & Docs", name: "PowerPoint presentation", description: "Generate structured slide decks with clear titles, bullets, and visual prompts." },
  { num: 92, id: "presentation-outline", pillar: 7, pillarName: "Presentation & Docs", name: "Presentation outline", description: "Narrative arc and pacing structure for professional presentations." },
  { num: 93, id: "slide-by-slide", pillar: 7, pillarName: "Presentation & Docs", name: "Slide-by-slide content", description: "High-density concise slide bullet points and takeaway callouts." },
  { num: 94, id: "speaker-notes", pillar: 7, pillarName: "Presentation & Docs", name: "Speaker notes", description: "Word-for-word talking notes tailored for each individual slide." },
  { num: 95, id: "presentation-script", pillar: 7, pillarName: "Presentation & Docs", name: "Presentation script", description: "Continuous fluid keynote speech script with timing markers." },
  { num: 96, id: "academic-presentation", pillar: 7, pillarName: "Presentation & Docs", name: "Academic presentation", description: "Rigorous scientific slide decks with methodology and citations." },
  { num: 97, id: "business-presentation", pillar: 7, pillarName: "Presentation & Docs", name: "Business presentation", description: "Executive pitch decks with ROI, market size, and strategic milestones." },
  { num: 98, id: "project-presentation", pillar: 7, pillarName: "Presentation & Docs", name: "Project presentation", description: "Showcase architecture, milestones, deliverables, and demo flows." },
  { num: 99, id: "thesis-defense-pres", pillar: 7, pillarName: "Presentation & Docs", name: "Thesis defense presentation", description: "Tailored 20-slide thesis defense deck answering core research questions." },
  { num: 100, id: "seminar-presentation", pillar: 7, pillarName: "Presentation & Docs", name: "Seminar presentation", description: "Interactive pedagogical slides with discussion prompts." },
  { num: 101, id: "poster-content", pillar: 7, pillarName: "Presentation & Docs", name: "Poster content", description: "High-impact visual copy for academic conference research posters." },
  { num: 102, id: "infographic-content", pillar: 7, pillarName: "Presentation & Docs", name: "Infographic", description: "Structured data callouts, statistics, and hierarchical visual layout." },
  { num: 103, id: "report-creator", pillar: 7, pillarName: "Presentation & Docs", name: "Report", description: "Multi-page formal business and technical reports with executive summaries." },
  { num: 104, id: "pdf-ready-doc", pillar: 7, pillarName: "Presentation & Docs", name: "PDF-ready document", description: "Clean typographic formatting ready for direct PDF print export." },
  { num: 105, id: "doc-style-doc", pillar: 7, pillarName: "Presentation & Docs", name: "DOC-style document", description: "Standard corporate document layout with headers, footers, and margins." },

  // 8. CODING & UNIVERSITY PROJECTS (106-120)
  { num: 106, id: "python-projects", pillar: 8, pillarName: "Coding Studio", name: "Python projects", description: "FastAPI, PyTorch, Pandas, Django, and automated script architectures." },
  { num: 107, id: "java-projects", pillar: 8, pillarName: "Coding Studio", name: "Java projects", description: "Spring Boot, enterprise OOP hierarchies, JUnit tests, and Maven setups." },
  { num: 108, id: "kotlin-android", pillar: 8, pillarName: "Coding Studio", name: "Kotlin and Android projects", description: "Jetpack Compose, MVVM architectures, Coroutines, and Room databases." },
  { num: 109, id: "cpp-projects", pillar: 8, pillarName: "Coding Studio", name: "C/C++ projects", description: "Memory management, RAII, pointers, algorithms, and high-performance code." },
  { num: 110, id: "javascript-projects", pillar: 8, pillarName: "Coding Studio", name: "JavaScript projects", description: "Modern React, Node.js, TypeScript, async patterns, and NPM packaging." },
  { num: 111, id: "html-css-projects", pillar: 8, pillarName: "Coding Studio", name: "HTML/CSS projects", description: "Responsive flexbox/grid layout, Tailwind CSS, and accessibility standards." },
  { num: 112, id: "database-projects", pillar: 8, pillarName: "Coding Studio", name: "Database projects", description: "PostgreSQL schemas, indexing, normalization, and MongoDB aggregates." },
  { num: 113, id: "api-projects", pillar: 8, pillarName: "Coding Studio", name: "API projects", description: "RESTful architecture, GraphQL schemas, JWT auth, and OpenAPI specs." },
  { num: 114, id: "debugging", pillar: 8, pillarName: "Coding Studio", name: "Debugging", description: "Isolate root causes of runtime exceptions, memory leaks, and logic faults." },
  { num: 115, id: "error-explanation", pillar: 8, pillarName: "Coding Studio", name: "Error explanation", description: "Translate cryptic compiler/runtime stack traces into plain English fixes." },
  { num: 116, id: "code-optimization", pillar: 8, pillarName: "Coding Studio", name: "Code optimization", description: "Refactor bottlenecks for optimal time/space Big-O complexity." },
  { num: 117, id: "code-documentation", pillar: 8, pillarName: "Coding Studio", name: "Code documentation", description: "Write clean docstrings, JSDoc, Sphinx annotations, and API guides." },
  { num: 118, id: "project-architecture", pillar: 8, pillarName: "Coding Studio", name: "Project architecture", description: "Design modular clean-architecture, microservices, and design patterns." },
  { num: 119, id: "readme-documentation", pillar: 8, pillarName: "Coding Studio", name: "README and documentation", description: "Comprehensive GitHub-ready README.md with setup, badges, and examples." },
  { num: 120, id: "project-guidance", pillar: 8, pillarName: "Coding Studio", name: "Complete project guidance", description: "End-to-end milestone walkthrough for university final year projects." },

  // 9. AI CREATIVE GENERATION (121-135)
  { num: 121, id: "ai-image-gen", pillar: 9, pillarName: "Creative AI", name: "AI image generation", description: "Generate high-fidelity visuals using state-of-the-art Gemini image models." },
  { num: 122, id: "image-editing", pillar: 9, pillarName: "Creative AI", name: "Image editing", description: "Iterative visual adjustments, style transfer, and composition refinements." },
  { num: 123, id: "logo-gen", pillar: 9, pillarName: "Creative AI", name: "Logo generation", description: "Minimalist, vector, and symbolic brand emblem concepts." },
  { num: 124, id: "poster-gen", pillar: 9, pillarName: "Creative AI", name: "Poster generation", description: "Eye-catching graphic layouts for events, films, and research launches." },
  { num: 125, id: "diagram-gen", pillar: 9, pillarName: "Creative AI", name: "Diagram generation", description: "Technical flowcharts, sequence diagrams, and architecture blueprints." },
  { num: 126, id: "infographic-gen", pillar: 9, pillarName: "Creative AI", name: "Infographic generation", description: "Data visualization layouts with clear hierarchies and metric badges." },
  { num: 127, id: "ui-design", pillar: 9, pillarName: "Creative AI", name: "UI design", description: "Modern dark-glass bento layouts, responsive components, and palettes." },
  { num: 128, id: "website-design", pillar: 9, pillarName: "Creative AI", name: "Website design", description: "Landing page wireframes, hero sections, and navigation architectures." },
  { num: 129, id: "app-ui-concepts", pillar: 9, pillarName: "Creative AI", name: "App UI concepts", description: "Mobile-first iOS and Android screen flows and interactive widgets." },
  { num: 130, id: "story-generation", pillar: 9, pillarName: "Creative AI", name: "Story generation", description: "Immersive fictional narratives, worldbuilding, and character arcs." },
  { num: 131, id: "script-generation", pillar: 9, pillarName: "Creative AI", name: "Script generation", description: "Standard screenplay format with scene headings, action, and dialogue." },
  { num: 132, id: "video-concept", pillar: 9, pillarName: "Creative AI", name: "Video concept generation", description: "High-concept creative treatments for promotional and YouTube videos." },
  { num: 133, id: "video-script", pillar: 9, pillarName: "Creative AI", name: "Video script", description: "Time-coded two-column video scripts with visual and audio cues." },
  { num: 134, id: "storyboard", pillar: 9, pillarName: "Creative AI", name: "Storyboard", description: "Shot-by-shot sequence plan with camera angles, motion, and lens guidance." },
  { num: 135, id: "ai-video-gen", pillar: 9, pillarName: "Creative AI", name: "AI video generation", description: "Prompting and conceptual staging for video generation models." },

  // 10. COMPLETE PROJECT CREATOR (136-147)
  { num: 136, id: "idea-to-plan", pillar: 10, pillarName: "Complete Project Creator", name: "Idea → complete project plan", description: "Transform a raw 1-sentence prompt into a detailed multi-phase roadmap." },
  { num: 137, id: "topic-to-research", pillar: 10, pillarName: "Complete Project Creator", name: "Topic → research", description: "Deep investigative dossier synthesis from a core topic." },
  { num: 138, id: "research-to-report", pillar: 10, pillarName: "Complete Project Creator", name: "Research → report", description: "Convert research findings into a structured academic or technical report." },
  { num: 139, id: "report-to-presentation", pillar: 10, pillarName: "Complete Project Creator", name: "Report → presentation", description: "Condense full reports into slide-by-slide decks with speaker notes." },
  { num: 140, id: "pres-to-speech", pillar: 10, pillarName: "Complete Project Creator", name: "Presentation → speech/script", description: "Generate a complete spoken keynote script for the presentation." },
  { num: 141, id: "topic-to-assignment", pillar: 10, pillarName: "Complete Project Creator", name: "Topic → assignment", description: "Turn a lecture topic into a fully cited assignment ready for review." },
  { num: 142, id: "topic-to-thesis", pillar: 10, pillarName: "Complete Project Creator", name: "Topic → thesis outline", description: "Produce a full 6-chapter dissertation outline with research questions." },
  { num: 143, id: "topic-to-proposal", pillar: 10, pillarName: "Complete Project Creator", name: "Topic → project proposal", description: "Draft formal grant or university project proposals with timelines." },
  { num: 144, id: "idea-to-architecture", pillar: 10, pillarName: "Complete Project Creator", name: "Project idea → system architecture", description: "Design database schemas, microservice contracts, and tech stack choices." },
  { num: 145, id: "arch-to-code", pillar: 10, pillarName: "Complete Project Creator", name: "Architecture → code structure", description: "Write clean, modular, production-ready codebase files across the stack." },
  { num: 146, id: "code-to-docs", pillar: 10, pillarName: "Complete Project Creator", name: "Code → documentation", description: "Generate comprehensive README, API specs, and run instructions." },
  { num: 147, id: "complete-submission-pkg", pillar: 10, pillarName: "Complete Project Creator", name: "Complete submission package", description: "Deliver the all-in-one package: Plan + Research + Report + Slides + Code + Docs." },
];

export const PILLARS = [
  { id: 1, name: "AI Brain", count: 15, icon: Brain, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
  { id: 2, name: "Deep Memory", count: 15, icon: Database, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { id: 3, name: "Deep Research", count: 15, icon: Search, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
  { id: 4, name: "Web Knowledge", count: 12, icon: Globe, color: "text-teal-400 bg-teal-500/10 border-teal-500/20" },
  { id: 5, name: "World Knowledge", count: 10, icon: BookOpen, color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
  { id: 6, name: "University Suite", count: 23, icon: GraduationCap, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { id: 7, name: "Presentation & Docs", count: 15, icon: Presentation, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { id: 8, name: "Coding Studio", count: 15, icon: Code2, color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
  { id: 9, name: "Creative AI", count: 15, icon: Palette, color: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
  { id: 10, name: "Complete Project Creator", count: 12, icon: Rocket, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
];

export interface StructuredMemoryItem {
  id: string;
  category: "fact" | "preference" | "project" | "study" | "instruction" | "task";
  projectId?: string;
  title: string;
  content: string;
  timestamp: string;
}

export const INITIAL_MEMORIES: StructuredMemoryItem[] = [
  {
    id: "mem-1",
    category: "instruction",
    title: "Primary Mission Directive",
    content: "Operate as MAX — Unified Master AI Assistant with 147 cognitive, research, academic, coding, and creative capabilities.",
    timestamp: new Date().toLocaleDateString()
  },
  {
    id: "mem-2",
    category: "preference",
    title: "Rigorous Factual Verification",
    content: "Always distinguish verified empirical facts from opinions or uncertain hypotheses. Provide direct source citations.",
    timestamp: new Date().toLocaleDateString()
  },
  {
    id: "mem-3",
    category: "project",
    projectId: "proj-max-os",
    title: "MAX Master Assistant Architecture",
    content: "10-pillar modular matrix: AI Brain, Deep Memory, Research Engine, Web Grounding, University Suite, Coding Studio, Creative Studio, Project Creator.",
    timestamp: new Date().toLocaleDateString()
  },
  {
    id: "mem-4",
    category: "study",
    title: "University Dissertation Standard",
    content: "Structure theses into 6 standard chapters: Introduction, Literature Review, Methodology, Implementation/Results, Discussion, Conclusion.",
    timestamp: new Date().toLocaleDateString()
  }
];

export default function MaxBrainSuite({
  onSendToVoice
}: {
  onSendToVoice?: (text: string) => void;
}) {
  const [activePillar, setActivePillar] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFeature, setSelectedFeature] = useState<FeatureDef | null>(ALL_147_FEATURES[0]);

  // Loading & Execution States
  const [isRunning, setIsRunning] = useState(false);
  const [resultText, setResultText] = useState("");
  const [groundingSources, setGroundingSources] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  // Pillar 1: AI Brain State
  const [brainPrompt, setBrainPrompt] = useState("Explain how quantum error correction works, compare surface codes vs topological codes, and detect any contradictions in claiming quantum supremacy without fault tolerance.");
  const [brainMode, setBrainMode] = useState<"standard" | "compare" | "verify" | "explain-simple">("standard");

  // Pillar 2: Deep Memory State
  const [memories, setMemories] = useState<StructuredMemoryItem[]>(() => {
    const saved = localStorage.getItem("max_deep_memories");
    return saved ? JSON.parse(saved) : INITIAL_MEMORIES;
  });
  const [memoryFilterCategory, setMemoryFilterCategory] = useState<string>("all");
  const [newMemCategory, setNewMemCategory] = useState<StructuredMemoryItem["category"]>("fact");
  const [newMemTitle, setNewMemTitle] = useState("");
  const [newMemContent, setNewMemContent] = useState("");
  const [newMemProject, setNewMemProject] = useState("");
  const [isAddingMemory, setIsAddingMemory] = useState(false);

  useEffect(() => {
    localStorage.setItem("max_deep_memories", JSON.stringify(memories));
  }, [memories]);

  // Pillar 3: Deep Research Engine State
  const [researchTopic, setResearchTopic] = useState("Current state of autonomous multi-agent systems and real-time reasoning models in 2026");
  const [researchAcademicOnly, setResearchAcademicOnly] = useState(false);

  // Pillar 6: University Suite State
  const [uniTopic, setUniTopic] = useState("Autonomous Agentic AI in Higher Education: Pedagogical Impacts, Ethical Boundaries & Cognitive Offloading");
  const [uniAction, setUniAction] = useState<"thesis-outline" | "literature-review" | "chapter-draft" | "viva-prep" | "mcq-practice" | "notes-to-study-guide">("thesis-outline");
  const [uniCitationStyle, setUniCitationStyle] = useState("APA");

  // Pillar 7: Presentation State
  const [presTopic, setPresTopic] = useState("MAX: The 147-Feature Master AI Architecture & Cognitive Pipeline");
  const [presType, setPresType] = useState<"academic" | "business" | "thesis-defense" | "seminar">("thesis-defense");
  const [presSlides, setPresSlides] = useState<any | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Pillar 8: Coding Studio State
  const [codeLang, setCodeLang] = useState("python");
  const [codeAction, setCodeAction] = useState<"generate" | "debug" | "optimize" | "architecture">("generate");
  const [codePrompt, setCodePrompt] = useState("Build an asynchronous multi-tier task scheduling engine with distributed worker queue, retry loop, and real-time status telemetry");
  const [codeSnippet, setCodeSnippet] = useState("");

  // Pillar 9: Creative AI State
  const [creativePrompt, setCreativePrompt] = useState("A futuristic holographic command center with glowing neon cyan interface nodes and data matrices");
  const [creativeAction, setCreativeAction] = useState<"image" | "ui-design" | "video-script" | "storyboard">("ui-design");
  const [creativeImage, setCreativeImage] = useState<string | null>(null);

  // Pillar 10: Complete Project Creator State
  const [projectIdea, setProjectIdea] = useState("University AI Assistant named MAX with real-time speech, deep memory, research grounding, thesis helper, and full project package");
  const [projectDomain, setProjectDomain] = useState("AI & Distributed Systems");

  // Handle Feature Search
  const filteredFeatures = ALL_147_FEATURES.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.pillarName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `#${f.num}`.includes(searchQuery)
  );

  const handleSelectFeature = (f: FeatureDef) => {
    setSelectedFeature(f);
    setActivePillar(f.pillar);
  };

  // Generic Copy Handler
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generic Download Handler
  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Run AI Brain Reasoning
  const handleRunBrain = async () => {
    if (!isOnline()) {
      setResultText("[OFFLINE]: Internet disconnected. Please reconnect to execute reasoning.");
      return;
    }
    setIsRunning(true);
    setResultText("");
    try {
      const data = await apiPost<{ text: string; error?: string }>("/api/max/reasoning", {
        prompt: brainPrompt,
        mode: brainMode,
        context: memories.map(m => `[${m.category.toUpperCase()}]: ${m.title} - ${m.content}`).join("\n")
      }, { timeoutMs: 25000, maxRetries: 3 });
      if (data.error) throw new Error(data.error);
      setResultText(data.text);
    } catch (err: any) {
      const isRate = err instanceof ApiError && err.isRateLimit;
      const isTimeout = err instanceof ApiError && err.isTimeout;
      setResultText(isRate
        ? `[RATE LIMIT]: Service traffic is elevated. Automatic exponential retry exhausted. Please wait a few seconds and retry.`
        : isTimeout
        ? `[TIMEOUT]: Reasoning request timed out after 25s. Please simplify prompt or try again.`
        : `[SYSTEM ERROR]: ${err.message || "Failed to execute reasoning"}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Run Deep Research Engine
  const handleRunResearch = async () => {
    if (!isOnline()) {
      setResultText("[OFFLINE]: Internet disconnected. Web research requires an active connection.");
      return;
    }
    setIsRunning(true);
    setResultText("");
    setGroundingSources([]);
    try {
      const data = await apiPost<{ text: string; groundingMetadata?: any; error?: string }>("/api/max/research", {
        question: researchTopic,
        academicOnly: researchAcademicOnly
      }, { timeoutMs: 28000, maxRetries: 3 });
      if (data.error) throw new Error(data.error);
      setResultText(data.text);
      if (data.groundingMetadata?.groundingChunks) {
        setGroundingSources(data.groundingMetadata.groundingChunks);
      }
    } catch (err: any) {
      const isRate = err instanceof ApiError && err.isRateLimit;
      setResultText(isRate
        ? `[RATE LIMIT]: Research search quota busy. Automatic backoff applied. Please retry shortly.`
        : `[RESEARCH ERROR]: ${err.message || "Failed to execute research"}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Run University Suite
  const handleRunUniversity = async () => {
    if (!isOnline()) {
      setResultText("[OFFLINE]: Internet disconnected. Please reconnect to access University Suite.");
      return;
    }
    setIsRunning(true);
    setResultText("");
    try {
      const data = await apiPost<{ text: string; error?: string }>("/api/max/university", {
        action: uniAction,
        topic: uniTopic,
        citationStyle: uniCitationStyle
      }, { timeoutMs: 25000, maxRetries: 3 });
      if (data.error) throw new Error(data.error);
      setResultText(data.text);
    } catch (err: any) {
      setResultText(`[UNIVERSITY ASSISTANT ERROR]: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Run Presentation Creator
  const handleRunPresentation = async () => {
    if (!isOnline()) {
      setResultText("[OFFLINE]: Internet disconnected. Presentation generation requires network connection.");
      return;
    }
    setIsRunning(true);
    setPresSlides(null);
    setResultText("");
    try {
      const data = await apiPost<{ data: any; error?: string }>("/api/max/presentation", {
        topic: presTopic,
        slideCount: 8,
        type: presType
      }, { timeoutMs: 28000, maxRetries: 3 });
      if (data.error) throw new Error(data.error);
      if (data.data?.slides) {
        setPresSlides(data.data);
        setCurrentSlideIndex(0);
      } else {
        setResultText(data.data?.rawText || JSON.stringify(data.data, null, 2));
      }
    } catch (err: any) {
      setResultText(`[PRESENTATION CREATOR ERROR]: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Run Coding Studio
  const handleRunCode = async () => {
    if (!isOnline()) {
      setResultText("[OFFLINE]: Internet disconnected. Coding architecture requires network connection.");
      return;
    }
    setIsRunning(true);
    setResultText("");
    try {
      const data = await apiPost<{ text: string; error?: string }>("/api/max/code", {
        action: codeAction,
        language: codeLang,
        prompt: codePrompt,
        code: codeSnippet
      }, { timeoutMs: 25000, maxRetries: 3 });
      if (data.error) throw new Error(data.error);
      setResultText(data.text);
    } catch (err: any) {
      setResultText(`[CODING STUDIO ERROR]: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Run Creative Studio
  const handleRunCreative = async () => {
    if (!isOnline()) {
      setResultText("[OFFLINE]: Internet disconnected. Creative studio generation requires network connection.");
      return;
    }
    setIsRunning(true);
    setResultText("");
    setCreativeImage(null);
    try {
      const data = await apiPost<{ imageUrl?: string; svgText?: string; text?: string; error?: string }>("/api/max/creative", {
        action: creativeAction,
        prompt: creativePrompt
      }, { timeoutMs: 28000, maxRetries: 3 });
      if (data.error) throw new Error(data.error);
      if (data.imageUrl) {
        setCreativeImage(data.imageUrl);
      }
      if (data.svgText) {
        setResultText(data.svgText);
      } else if (data.text) {
        setResultText(data.text);
      }
    } catch (err: any) {
      setResultText(`[CREATIVE STUDIO ERROR]: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Run Complete Project Creator
  const handleRunCompleteProject = async () => {
    if (!isOnline()) {
      setResultText("[OFFLINE]: Internet disconnected. Complete project creation requires network connection.");
      return;
    }
    setIsRunning(true);
    setResultText("");
    try {
      const data = await apiPost<{ text: string; error?: string }>("/api/max/complete-project", {
        idea: projectIdea,
        domain: projectDomain
      }, { timeoutMs: 30000, maxRetries: 3 });
      if (data.error) throw new Error(data.error);
      setResultText(data.text);
    } catch (err: any) {
      setResultText(`[COMPLETE PROJECT CREATOR ERROR]: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Memory Actions
  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemTitle || !newMemContent) return;
    const newItem: StructuredMemoryItem = {
      id: `mem-${Date.now()}`,
      category: newMemCategory,
      projectId: newMemProject || undefined,
      title: newMemTitle,
      content: newMemContent,
      timestamp: new Date().toLocaleDateString()
    };
    setMemories(prev => [newItem, ...prev]);
    setNewMemTitle("");
    setNewMemContent("");
    setNewMemProject("");
    setIsAddingMemory(false);
  };

  const handleDeleteMemory = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
  };

  const filteredMemories = memories.filter(m => {
    if (memoryFilterCategory !== "all" && m.category !== memoryFilterCategory) return false;
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-slate-100 font-sans" id="max-brain-suite">
      {/* ========================================================================= */}
      {/* HEADER BANNER: MAX — UNIFIED MASTER AI INTELLIGENCE */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-950 via-cyan-950/40 to-slate-950 border border-cyan-500/20 p-6 md:p-8 overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/15 border border-cyan-500/30 rounded-2xl text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <Brain className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-display font-black tracking-wider uppercase text-white">
                    ZOYA MASTER INTELLIGENCE
                  </h1>
                  <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full uppercase tracking-widest">
                    147 CORE FEATURES
                  </span>
                </div>
                <p className="text-xs md:text-sm text-cyan-200/70 font-mono">
                  Unified AI Brain • Deep Memory • Research Engine • University Suite • Code Studio • Creation Pipeline
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-[11px]">
            <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-slate-500 block text-[9px] uppercase">Cognitive Pillars</span>
              <span className="text-cyan-400 font-bold text-sm">10 Subsystems</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-slate-500 block text-[9px] uppercase">Active Capabilities</span>
              <span className="text-emerald-400 font-bold text-sm">147 Features</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-slate-500 block text-[9px] uppercase">Web Grounding</span>
              <span className="text-teal-400 font-bold text-sm">Live Google Search</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-slate-500 block text-[9px] uppercase">Deep Memory</span>
              <span className="text-purple-400 font-bold text-sm">{memories.length} Records</span>
            </div>
          </div>
        </div>

        {/* 147 FEATURE INSTANT SEARCH BAR */}
        <div className="mt-6 relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across all 147 features (e.g., 'MCQ generation', '#36 cross-checking', 'thesis structure', 'Python projects')..."
            className="w-full bg-slate-950/80 border border-cyan-500/20 focus:border-cyan-400 text-xs md:text-sm text-slate-100 rounded-2xl pl-11 pr-4 py-3 outline-none font-mono placeholder:text-slate-500 transition-all shadow-inner"
          />
          {searchQuery && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-cyan-400">
              Found {filteredFeatures.length} matching features
            </div>
          )}
        </div>

        {/* FEATURE SEARCH RESULTS DROPDOWN */}
        {searchQuery.trim().length > 0 && (
          <div className="mt-2 max-h-60 overflow-y-auto bg-slate-950 border border-cyan-500/30 rounded-2xl p-2 space-y-1 shadow-2xl relative z-30 font-mono text-xs">
            {filteredFeatures.length === 0 ? (
              <div className="p-4 text-center text-slate-500">No matching features found in the 147-capability index.</div>
            ) : (
              filteredFeatures.map(f => (
                <button
                  key={f.id}
                  onClick={() => {
                    handleSelectFeature(f);
                    setSearchQuery("");
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-cyan-500/10 hover:border-cyan-500/30 border border-transparent flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px]">
                      #{f.num}
                    </span>
                    <span className="font-bold text-white group-hover:text-cyan-300">{f.name}</span>
                    <span className="text-slate-500 text-[10px]">({f.pillarName})</span>
                  </div>
                  <span className="text-[10px] text-slate-400 truncate max-w-xs">{f.description}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 10 CORE PILLARS HORIZONTAL NAVIGATION BAR */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {PILLARS.map(p => {
          const Icon = p.icon;
          const isActive = activePillar === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setActivePillar(p.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border text-xs font-mono font-bold whitespace-nowrap transition-all duration-300 ${
                isActive
                  ? "bg-cyan-600/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)] scale-[1.02]"
                  : "bg-slate-950/70 border-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-800"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
              <span>{p.name}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${isActive ? "bg-cyan-500/30 text-cyan-200" : "bg-slate-900 text-slate-500"}`}>
                {p.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* ACTIVE PILLAR WORKSPACE FRAME */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pillar Controller & Feature Checklist (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-950/80 border border-slate-900 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                  Pillar {activePillar}: {PILLARS.find(p => p.id === activePillar)?.name}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                {ALL_147_FEATURES.filter(f => f.pillar === activePillar).length} ACTIVE FEATURES
              </span>
            </div>

            {/* List of features under this active pillar */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {ALL_147_FEATURES.filter(f => f.pillar === activePillar).map(f => (
                <div
                  key={f.id}
                  onClick={() => setSelectedFeature(f)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedFeature?.id === f.id
                      ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300"
                      : "bg-slate-900/40 border-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-900/80"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold">
                      #{f.num}. {f.name}
                    </span>
                    <Check className="w-3.5 h-3.5 text-cyan-400 opacity-60" />
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{f.description}</p>
                </div>
              ))}
            </div>

            {/* Selected Feature Info Capsule */}
            {selectedFeature && (
              <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-2xl text-xs space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                  Selected: Feature #{selectedFeature.num} — {selectedFeature.name}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                  {selectedFeature.description}
                </p>
              </div>
            )}
          </div>

          {/* PILLAR 1: AI BRAIN CONTROLS */}
          {activePillar === 1 && (
            <div className="bg-slate-950/80 border border-slate-900 rounded-3xl p-5 space-y-4 shadow-xl">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyan-400" /> AI Brain Cognitive Configuration
              </h4>
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Reasoning Mode</label>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <button
                    onClick={() => setBrainMode("standard")}
                    className={`p-2 rounded-xl border text-[11px] text-left transition-all ${
                      brainMode === "standard" ? "bg-cyan-500/20 border-cyan-400 text-white" : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    1. Step-by-Step
                  </button>
                  <button
                    onClick={() => setBrainMode("compare")}
                    className={`p-2 rounded-xl border text-[11px] text-left transition-all ${
                      brainMode === "compare" ? "bg-cyan-500/20 border-cyan-400 text-white" : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    2. Compare Solutions
                  </button>
                  <button
                    onClick={() => setBrainMode("verify")}
                    className={`p-2 rounded-xl border text-[11px] text-left transition-all ${
                      brainMode === "verify" ? "bg-cyan-500/20 border-cyan-400 text-white" : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    3. Contradiction Audit
                  </button>
                  <button
                    onClick={() => setBrainMode("explain-simple")}
                    className={`p-2 rounded-xl border text-[11px] text-left transition-all ${
                      brainMode === "explain-simple" ? "bg-cyan-500/20 border-cyan-400 text-white" : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    4. Plain Language
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Inquiry / Problem Prompt</label>
                <textarea
                  rows={4}
                  value={brainPrompt}
                  onChange={(e) => setBrainPrompt(e.target.value)}
                  placeholder="Enter a complex logic, mathematical, scientific, or coding problem..."
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-xl p-3 text-xs text-white outline-none font-mono resize-none placeholder:text-slate-600"
                />
              </div>

              <button
                onClick={handleRunBrain}
                disabled={isRunning}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20"
              >
                {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Execute Cognitive Reasoning
              </button>
            </div>
          )}

          {/* PILLAR 2: DEEP MEMORY CONTROLS */}
          {activePillar === 2 && (
            <div className="bg-slate-950/80 border border-slate-900 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-400" /> Deep Memory Management
                </h4>
                <button
                  onClick={() => setIsAddingMemory(!isAddingMemory)}
                  className="px-2.5 py-1 bg-purple-600/20 text-purple-300 border border-purple-500/30 rounded-lg text-[10px] font-mono font-bold uppercase hover:bg-purple-600/30"
                >
                  {isAddingMemory ? "Cancel" : "+ Add Record"}
                </button>
              </div>

              {isAddingMemory && (
                <form onSubmit={handleAddMemory} className="p-3 bg-slate-900/80 border border-purple-500/30 rounded-2xl space-y-2.5 text-xs font-mono">
                  <div>
                    <label className="text-[9px] uppercase text-slate-400 block mb-1">Category</label>
                    <select
                      value={newMemCategory}
                      onChange={(e) => setNewMemCategory(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none text-xs"
                    >
                      <option value="fact">Fact</option>
                      <option value="preference">Preference</option>
                      <option value="project">Project</option>
                      <option value="study">Study</option>
                      <option value="instruction">Instruction</option>
                      <option value="task">Task</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] uppercase text-slate-400 block mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={newMemTitle}
                      onChange={(e) => setNewMemTitle(e.target.value)}
                      placeholder="e.g. Preferred Python formatting"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase text-slate-400 block mb-1">Content / Directive</label>
                    <textarea
                      required
                      rows={2}
                      value={newMemContent}
                      onChange={(e) => setNewMemContent(e.target.value)}
                      placeholder="Detailed factual note or instruction..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none text-xs resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-xs uppercase"
                  >
                    Save into Deep Memory
                  </button>
                </form>
              )}

              {/* Memory Category Filter */}
              <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                {["all", "fact", "preference", "project", "study", "instruction"].map(c => (
                  <button
                    key={c}
                    onClick={() => setMemoryFilterCategory(c)}
                    className={`px-2.5 py-1 rounded-lg uppercase ${
                      memoryFilterCategory === c ? "bg-purple-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* Active Memories List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {filteredMemories.map(m => (
                  <div key={m.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-start justify-between gap-2 group text-xs font-mono">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] uppercase font-bold">
                          {m.category}
                        </span>
                        <span className="font-bold text-white">{m.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{m.content}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteMemory(m.id)}
                      className="text-slate-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Purge record"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PILLAR 3: DEEP RESEARCH CONTROLS */}
          {activePillar === 3 && (
            <div className="bg-slate-950/80 border border-slate-900 rounded-3xl p-5 space-y-4 shadow-xl">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-400" /> Deep Research Engine Setup
              </h4>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Research Question / Inquiry</label>
                <textarea
                  rows={3}
                  value={researchTopic}
                  onChange={(e) => setResearchTopic(e.target.value)}
                  placeholder="Enter a complex research question to explore across multiple live web & academic nodes..."
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-400 rounded-xl p-3 text-xs text-white outline-none font-mono resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs font-mono">
                <div>
                  <div className="font-bold text-white">Prioritize Academic Repositories</div>
                  <div className="text-[10px] text-slate-500">IEEE, PubMed, arXiv, Nature, ACM, JSTOR</div>
                </div>
                <input
                  type="checkbox"
                  checked={researchAcademicOnly}
                  onChange={(e) => setResearchAcademicOnly(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500"
                />
              </div>

              <button
                onClick={handleRunResearch}
                disabled={isRunning}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 text-white rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Execute Multi-Source Research
              </button>
            </div>
          )}

          {/* PILLAR 6: UNIVERSITY SUITE CONTROLS */}
          {activePillar === 6 && (
            <div className="bg-slate-950/80 border border-slate-900 rounded-3xl p-5 space-y-4 shadow-xl">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-400" /> University Academic Workspace
              </h4>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Academic Task</label>
                <select
                  value={uniAction}
                  onChange={(e) => setUniAction(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono text-xs outline-none"
                >
                  <option value="thesis-outline">6-Chapter Thesis / Dissertation Structure</option>
                  <option value="literature-review">Literature Review Synthesis & Gaps</option>
                  <option value="chapter-draft">Draft Thesis Chapter (Intro/Method/Discussion)</option>
                  <option value="viva-prep">Viva Voce Defense Panel Simulation</option>
                  <option value="mcq-practice">10 Advanced MCQs + Exam Practice Suite</option>
                  <option value="notes-to-study-guide">Lecture Notes → High-Yield Exam Cram Guide</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Citation Style</label>
                  <select
                    value={uniCitationStyle}
                    onChange={(e) => setUniCitationStyle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white font-mono text-xs outline-none"
                  >
                    <option value="APA">APA 7th Edition</option>
                    <option value="IEEE">IEEE Citation</option>
                    <option value="MLA">MLA 9th Edition</option>
                    <option value="Harvard">Harvard Referencing</option>
                    <option value="Chicago">Chicago Manual of Style</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-950/40 p-2 rounded-xl border border-emerald-500/20 w-full text-center">
                    Peer-Review Level
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Topic / Notes Input</label>
                <textarea
                  rows={3}
                  value={uniTopic}
                  onChange={(e) => setUniTopic(e.target.value)}
                  placeholder="Enter dissertation title, research problem, or raw lecture notes..."
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-400 rounded-xl p-3 text-xs text-white outline-none font-mono resize-none"
                />
              </div>

              <button
                onClick={handleRunUniversity}
                disabled={isRunning}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4" />}
                Generate Academic Work
              </button>
            </div>
          )}

          {/* PILLAR 7: PRESENTATION & DOCS CONTROLS */}
          {activePillar === 7 && (
            <div className="bg-slate-950/80 border border-slate-900 rounded-3xl p-5 space-y-4 shadow-xl">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Presentation className="w-4 h-4 text-amber-400" /> Presentation & Document Creator
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Deck Format</label>
                  <select
                    value={presType}
                    onChange={(e) => setPresType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white font-mono text-xs outline-none"
                  >
                    <option value="thesis-defense">Thesis Defense</option>
                    <option value="academic">Academic Seminar</option>
                    <option value="business">Business Pitch</option>
                    <option value="project">Project Showcase</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <span className="text-[10px] font-mono text-amber-400/80 bg-amber-950/40 p-2 rounded-xl border border-amber-500/20 w-full text-center">
                    Slide-by-Slide Engine
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Presentation Topic</label>
                <textarea
                  rows={3}
                  value={presTopic}
                  onChange={(e) => setPresTopic(e.target.value)}
                  placeholder="Topic of your presentation or dissertation defense..."
                  className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl p-3 text-xs text-white outline-none font-mono resize-none"
                />
              </div>

              <button
                onClick={handleRunPresentation}
                disabled={isRunning}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20"
              >
                {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Presentation className="w-4 h-4" />}
                Generate Slide Deck & Notes
              </button>
            </div>
          )}

          {/* PILLAR 8: CODING STUDIO CONTROLS */}
          {activePillar === 8 && (
            <div className="bg-slate-950/80 border border-slate-900 rounded-3xl p-5 space-y-4 shadow-xl">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Code2 className="w-4 h-4 text-violet-400" /> Multi-Language Coding Studio
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Language</label>
                  <select
                    value={codeLang}
                    onChange={(e) => setCodeLang(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white font-mono text-xs outline-none"
                  >
                    <option value="python">Python</option>
                    <option value="kotlin">Kotlin (Android)</option>
                    <option value="java">Java (Spring/OOP)</option>
                    <option value="cpp">C / C++</option>
                    <option value="typescript">TypeScript / React</option>
                    <option value="sql">SQL / Database</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Action</label>
                  <select
                    value={codeAction}
                    onChange={(e) => setCodeAction(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white font-mono text-xs outline-none"
                  >
                    <option value="generate">Generate Project</option>
                    <option value="debug">Debug & Fix Code</option>
                    <option value="optimize">Optimize Complexity</option>
                    <option value="architecture">System Architecture</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Specification Prompt</label>
                <textarea
                  rows={3}
                  value={codePrompt}
                  onChange={(e) => setCodePrompt(e.target.value)}
                  placeholder="Describe the application, algorithms, or features needed..."
                  className="w-full bg-slate-900 border border-slate-800 focus:border-violet-400 rounded-xl p-3 text-xs text-white outline-none font-mono resize-none"
                />
              </div>

              {codeAction === "debug" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Code to Debug</label>
                  <textarea
                    rows={3}
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                    placeholder="Paste code snippet with errors..."
                    className="w-full bg-slate-900 border border-slate-800 focus:border-violet-400 rounded-xl p-2 text-xs text-white outline-none font-mono resize-none"
                  />
                </div>
              )}

              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20"
              >
                {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Code2 className="w-4 h-4" />}
                Execute Code Operation
              </button>
            </div>
          )}

          {/* PILLAR 9: CREATIVE AI CONTROLS */}
          {activePillar === 9 && (
            <div className="bg-slate-950/80 border border-slate-900 rounded-3xl p-5 space-y-4 shadow-xl">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4 text-pink-400" /> Creative AI Studio
              </h4>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Creative Task</label>
                <select
                  value={creativeAction}
                  onChange={(e) => setCreativeAction(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono text-xs outline-none"
                >
                  <option value="ui-design">UI/UX Concept & Layout Specification</option>
                  <option value="image">AI Image Generation (Gemini 3.1 Flash Image)</option>
                  <option value="video-script">Two-Column Video Script with Cues</option>
                  <option value="storyboard">Shot-by-Shot Storyboard Narrative</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Creative Direction Prompt</label>
                <textarea
                  rows={3}
                  value={creativePrompt}
                  onChange={(e) => setCreativePrompt(e.target.value)}
                  placeholder="Describe your design, graphic, or script..."
                  className="w-full bg-slate-900 border border-slate-800 focus:border-pink-400 rounded-xl p-3 text-xs text-white outline-none font-mono resize-none"
                />
              </div>

              <button
                onClick={handleRunCreative}
                disabled={isRunning}
                className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-50 text-white rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-600/20"
              >
                {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Palette className="w-4 h-4" />}
                Generate Creative Asset
              </button>
            </div>
          )}

          {/* PILLAR 10: COMPLETE PROJECT CREATOR CONTROLS */}
          {activePillar === 10 && (
            <div className="bg-slate-950/80 border border-slate-900 rounded-3xl p-5 space-y-4 shadow-xl">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Rocket className="w-4 h-4 text-rose-400" /> Complete Project Creator (12-Stage Pipeline)
              </h4>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Project Idea / Thesis Brief</label>
                <textarea
                  rows={3}
                  value={projectIdea}
                  onChange={(e) => setProjectIdea(e.target.value)}
                  placeholder="Enter your grand idea..."
                  className="w-full bg-slate-900 border border-slate-800 focus:border-rose-400 rounded-xl p-3 text-xs text-white outline-none font-mono resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Domain / Focus Area</label>
                <input
                  type="text"
                  value={projectDomain}
                  onChange={(e) => setProjectDomain(e.target.value)}
                  placeholder="e.g. AI & Distributed Systems"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none font-mono"
                />
              </div>

              <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl text-[10px] font-mono text-slate-400 space-y-1">
                <span className="font-bold text-rose-300 uppercase block">End-to-End Delivery Pipeline:</span>
                <div>1. Milestones • 2. Research • 3. Report • 4. Slides • 5. Speech • 6. Architecture • 7. Working Code • 8. README Package</div>
              </div>

              <button
                onClick={handleRunCompleteProject}
                disabled={isRunning}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:opacity-50 text-white rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20"
              >
                {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                Execute Full End-to-End Pipeline
              </button>
            </div>
          )}

          {/* FALLBACK FOR OTHER PILLARS (Web Knowledge 4, World Knowledge 5) */}
          {(activePillar === 4 || activePillar === 5) && (
            <div className="bg-slate-950/80 border border-slate-900 rounded-3xl p-5 space-y-4 shadow-xl">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal-400" /> Live Web & World Knowledge Query
              </h4>
              <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                MAX uses live Google Search Grounding for current information, source credibility checking, and academic verification across all sciences and humanities.
              </p>
              <textarea
                rows={3}
                value={researchTopic}
                onChange={(e) => setResearchTopic(e.target.value)}
                placeholder="Query any topic, latest news, historical event, or scientific law..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-teal-400 rounded-xl p-3 text-xs text-white outline-none font-mono resize-none"
              />
              <button
                onClick={handleRunResearch}
                disabled={isRunning}
                className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" /> Query Verified Grounded Knowledge
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Execution Output, Slide Viewer & Deliverables (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-950/90 border border-slate-900 rounded-3xl p-5 space-y-4 shadow-2xl min-h-[500px] flex flex-col justify-between">
            {/* Output Bar Top Controls */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isRunning ? "bg-amber-400 animate-ping" : resultText || presSlides ? "bg-emerald-400" : "bg-slate-600"}`} />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  {isRunning ? "MAX Cognitive Processor Running..." : presSlides ? "Interactive Presentation Deck" : resultText ? "Synthesized Output & Deliverables" : "Awaiting Execution"}
                </span>
              </div>

              {(resultText || presSlides) && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(resultText || JSON.stringify(presSlides, null, 2))}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-mono flex items-center gap-1 transition-colors"
                    title="Copy Markdown"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>

                  <button
                    onClick={() => handleDownload(resultText || JSON.stringify(presSlides, null, 2), `max-deliverable-${Date.now()}.md`)}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-mono flex items-center gap-1 transition-colors"
                    title="Export File"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>

                  {onSendToVoice && (
                    <button
                      onClick={() => onSendToVoice(resultText.slice(0, 300))}
                      className="px-2.5 py-1.5 bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-600/30 rounded-lg text-xs font-mono font-bold flex items-center gap-1"
                    >
                      <span>Speak</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Output Main Display Body */}
            <div className="flex-1 my-2">
              {isRunning ? (
                <div className="py-24 text-center flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <Brain className="w-12 h-12 text-cyan-400 animate-pulse" />
                    <RefreshCw className="w-6 h-6 text-cyan-300 absolute -top-1 -right-1 animate-spin" />
                  </div>
                  <div>
                    <div className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                      MAX Cognitive Core Engaging...
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      Decomposing tasks, verifying evidence, and compiling deliverables...
                    </p>
                  </div>
                </div>
              ) : presSlides && presSlides.slides?.length > 0 ? (
                /* INTERACTIVE PRESENTATION SLIDE VIEWER */
                <div className="space-y-4 font-mono">
                  <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                    <div>
                      <h4 className="text-sm font-bold text-white">{presSlides.title}</h4>
                      <p className="text-[10px] text-amber-400 uppercase">{presSlides.subtitle || presSlides.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={currentSlideIndex === 0}
                        onClick={() => setCurrentSlideIndex(p => Math.max(0, p - 1))}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-xs font-bold"
                      >
                        Prev
                      </button>
                      <span className="text-xs text-slate-400">
                        {currentSlideIndex + 1} / {presSlides.slides.length}
                      </span>
                      <button
                        disabled={currentSlideIndex === presSlides.slides.length - 1}
                        onClick={() => setCurrentSlideIndex(p => Math.min(presSlides.slides.length - 1, p + 1))}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-xs font-bold"
                      >
                        Next
                      </button>
                    </div>
                  </div>

                  {/* Active Slide Card */}
                  {presSlides.slides[currentSlideIndex] && (
                    <div className="p-6 bg-slate-900 border border-amber-500/20 rounded-3xl min-h-[300px] flex flex-col justify-between space-y-4 shadow-xl">
                      <div className="space-y-2">
                        <div className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">
                          SLIDE #{presSlides.slides[currentSlideIndex].slideNumber}
                        </div>
                        <h3 className="text-xl font-display font-bold text-white">
                          {presSlides.slides[currentSlideIndex].title}
                        </h3>
                        <ul className="space-y-2 mt-4">
                          {presSlides.slides[currentSlideIndex].bullets?.map((b: string, i: number) => (
                            <li key={i} className="flex items-start gap-2.5 text-xs text-slate-200">
                              <span className="text-amber-400 mt-1">•</span>
                              <span className="leading-relaxed">{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {presSlides.slides[currentSlideIndex].keyTakeaway && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[11px] text-amber-200">
                          <span className="font-bold uppercase text-[9px] block">Key Takeaway:</span>
                          {presSlides.slides[currentSlideIndex].keyTakeaway}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Speaker Notes Drawer */}
                  {presSlides.slides[currentSlideIndex]?.speakerNotes && (
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs space-y-1">
                      <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-amber-400" /> Speaker Notes (Verbatim Guidance):
                      </div>
                      <p className="text-[11px] text-slate-300 italic leading-relaxed">
                        "{presSlides.slides[currentSlideIndex].speakerNotes}"
                      </p>
                    </div>
                  )}
                </div>
              ) : creativeImage ? (
                /* CREATIVE IMAGE OUTPUT */
                <div className="space-y-4 flex flex-col items-center justify-center p-4">
                  <img
                    src={creativeImage}
                    alt={creativePrompt}
                    className="max-h-[400px] rounded-2xl border border-pink-500/30 shadow-2xl object-contain"
                  />
                  <div className="text-xs font-mono text-slate-400 text-center">
                    "{creativePrompt}"
                  </div>
                </div>
              ) : resultText ? (
                /* MARKDOWN FORMATTED TEXT OUTPUT */
                <div className="h-[460px] overflow-y-auto pr-2 select-text font-mono text-xs leading-relaxed text-slate-200 space-y-2 whitespace-pre-wrap">
                  {resultText}
                </div>
              ) : (
                /* INITIAL EMPTY STATE */
                <div className="py-20 text-center flex flex-col items-center justify-center space-y-3 font-mono">
                  <div className="p-4 bg-slate-900/60 rounded-3xl border border-slate-800 text-slate-500">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      MAX Unified Workbench Ready
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      Configure your prompt in the left panel and click Execute to engage MAX's 147 cognitive, research, or creative features.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Grounding Sources Ribbon */}
            {groundingSources.length > 0 && (
              <div className="border-t border-white/5 pt-3 space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                  Verified Google Search Grounding Sources ({groundingSources.length}):
                </span>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto font-mono text-[10px]">
                  {groundingSources.map((s, idx) => (
                    <a
                      key={idx}
                      href={s.web?.uri || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-cyan-300 rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3 text-cyan-400" />
                      <span className="truncate max-w-[200px]">{s.web?.title || s.web?.uri || `Source #${idx + 1}`}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
