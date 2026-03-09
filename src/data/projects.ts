// Project portfolio data derived from master_detailed_cv.tex
import cirqRagDiagram from "@/assets/Cirq-RAG-Agent.png";

export interface ProjectItem {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  period?: string;
  githubUrl?: string;
  externalUrl?: string;
  award?: string;
  description: string[];
  technologies: string[];
  featured?: boolean; // shown on homepage
  image?: string; // optional diagram or hero image
  architectureHighlights?: string[]; // optional key architecture bullets
}

export const PROJECTS: ProjectItem[] = [
  // Featured (homepage) - match existing ProjectsSection
  {
    slug: "qcanvas",
    title: "QCanvas",
    subtitle: "Unified Quantum Simulator Platform",
    category: "High-Performance Computing & Quantum",
    period: "Mar 2025 – Present",
    featured: true,
    award: "3rd Prize · Huawei ICT Competition National Finals (UniQ Team)",
    description: [
      "Web-based quantum computing platform unifying Cirq, Qiskit, and PennyLane with an accessible interface for simulation, conversion, and visualization.",
      "Multi-framework support: bi-directional circuit conversion between Cirq, Qiskit, and PennyLane.",
      "Real-time simulation with multiple backend options and extensible plugins.",
      "Interactive visualization of circuits, states, operations, and measurement results in-browser.",
      "Hybrid architecture: Next.js for UI/routing and FastAPI for compute-heavy quantum operations.",
      "OpenQASM 3.0 integration for portable circuit exchange; plugin-based system for additional frameworks.",
    ],
    technologies: ["Next.js", "TypeScript", "FastAPI", "Qiskit", "Cirq", "PennyLane", "OpenQASM", "REST/Web APIs"],
    architectureHighlights: [
      "OpenQASM 3.0 intermediate representation core decouples the web UI from backend simulators.",
      "Kubernetes-backed job manager schedules quantum simulations across containerized workers for fair, efficient resource usage.",
    ],
  },
  {
    slug: "cirq-rag",
    title: "Cirq-RAG Code Assistant",
    subtitle: "Retrieval-Augmented Generation for Cirq Quantum Code Generation",
    category: "Generative AI & RAG",
    featured: true,
    description: [
      "Multi-agent RAG system that generates executable quantum circuits from natural-language prompts with tiered educational explanations.",
      "Multi-agent pipeline: Designer → Validator (self-correction loop) → Optimizer-Validator loop → Educational agent.",
      "Validation-driven self-repair: on compiler/simulation failures, iteratively patches code and re-validates (bounded retries).",
      "Circuit optimization passes to reduce depth, total gates, and two-qubit gates; every step validated for correctness.",
      "Curated Cirq knowledge base (140+ entries) with embedding-based retrieval and vector indexing.",
      "92% success rate vs 52% single-agent baseline; reported latency/quality trade-offs.",
    ],
    technologies: ["Python", "Cirq", "RAG", "FAISS", "Multi-Agent", "Prompt Engineering"],
    image: cirqRagDiagram,
    architectureHighlights: [
      "Multi-agent pipeline orchestrates designer, validator, optimizer, and educator agents with explicit hand-off and feedback channels.",
      "FAISS-backed vector store over a curated Cirq knowledge base grounds generation and validation, minimizing hallucinations in produced circuits.",
    ],
  },
  // HPC & GPU
  {
    slug: "q-tensor",
    title: "Parallel Tensor Network Quantum Simulator (Q-Tensor)",
    subtitle: "Hybrid MPI/OpenMP + CUDA Quantum Simulation",
    category: "High-Performance Computing & Quantum",
    period: "Academic/Research",
    githubUrl: "https://github.com/Umer-Farooq-CS/Q-Tensor",
    description: [
      "Enhanced quantum circuit simulator with hybrid MPI/OpenMP parallelization and GPU acceleration via CUDA.",
      "Integrated METIS graph partitioning for load balancing; reduced inter-process communication overhead.",
      "Scalable performance for circuits with 20+ qubits; hybrid distributed (MPI) and shared-memory (OpenMP) parallelism.",
      "CUDA acceleration of tensor contractions; optimized memory access and sparse tensor networks.",
    ],
    technologies: ["C++", "CUDA", "OpenMP", "MPI", "METIS", "CMake", "Quantum Computing"],
  },
  {
    slug: "mnist-gpu",
    title: "MNIST Classification with GPU Acceleration",
    subtitle: "Deep Learning Optimization",
    category: "High-Performance Computing & GPU",
    githubUrl: "https://github.com/Umer-Farooq-CS/MNIST-Classification",
    description: [
      "Neural network for MNIST digit classification across five versions (V1–V5) from serial CPU to highly parallel GPU.",
      "6× faster inference using NVIDIA Tensor Cores with FP16 mixed-precision training.",
      "CUDA optimizations: shared memory, kernel fusion, CUDA streams, Tensor Cores, memory coalescing.",
      "95%+ GPU utilization; 99%+ accuracy maintained; profiled with Nsight Systems and Nsight Compute.",
    ],
    technologies: ["CUDA", "Python", "PyTorch", "Nsight", "Tensor Cores", "FP16 Mixed Precision"],
  },
  {
    slug: "canny-edge-detector",
    title: "GPU-Accelerated Canny Edge Detection",
    subtitle: "Image Processing Optimization",
    category: "High-Performance Computing & GPU",
    githubUrl: "https://github.com/Umer-Farooq-CS/Canny-Edge-Detector",
    description: [
      "Complete Canny edge detection in CUDA with optimized memory access for high-resolution images.",
      "3.5× speedup over sequential CPU; multi-stage kernels: Gaussian blur, Sobel, non-maximum suppression, hysteresis.",
      "Shared memory tiling, texture memory, coalescing, padding to avoid bank conflicts.",
    ],
    technologies: ["C++", "CUDA", "OpenCV", "Image Processing"],
  },
  {
    slug: "rnn-text-generation",
    title: "Optimized RNN Character-Level Text Generation",
    subtitle: "Shakespeare Text Generation",
    category: "Deep Learning & NLP",
    githubUrl: "https://github.com/Umer-Farooq-CS/RNN-Character-Level-Text-Generation",
    description: [
      "LSTM-based character-level text generator on Shakespeare's works with PyTorch and GPU optimizations.",
      "55.2% accuracy; 3.5× faster training via AMP; 5.8M parameters, 3 LSTM layers, 512 hidden units.",
      "Mixed precision (FP16), large batch sizes, GPU-held data, temperature-based sampling.",
    ],
    technologies: ["Python", "PyTorch", "CUDA", "LSTM", "NLP"],
  },
  {
    slug: "parallel-graph-text",
    title: "Parallel Graph & Text Analysis",
    subtitle: "Multi-threading with pthreads",
    category: "High-Performance Computing",
    description: [
      "Multithreaded graph analysis and large-text word frequency analysis using POSIX threads.",
      "Parallel graph algorithms (node/edge counting, connectivity); chunk-based text processing with thread-safe structures.",
      "Near-linear speedup with thread affinity, cache-aware processing, fine-grained locking; profiled with perf.",
    ],
    technologies: ["C++", "pthreads", "perf", "Graph Algorithms"],
  },
  // Generative AI & Deep Learning
  {
    slug: "pixelrnn-cifar10",
    title: "PixelRNN Implementation",
    subtitle: "CIFAR-10 Image Generation",
    category: "Generative AI",
    githubUrl: "https://github.com/Umer-Farooq-CS/PixelRNN-Implementation-CIFAR10",
    description: [
      "Pixel Recurrent Neural Networks (PixelRNN) per van den Oord et al.: PixelCNN, Row LSTM, Diagonal BiLSTM.",
      "Masked convolutions (Type A/B); skewing/unskewing for Diagonal BiLSTM; trained on CIFAR-10.",
      "NLL, bits per dimension, visual evaluation; temperature-based sampling.",
    ],
    technologies: ["Python", "TensorFlow", "Keras", "CUDA", "Generative AI"],
  },
  {
    slug: "cnn-cifar10",
    title: "CNN CIFAR-10 Classification with Hyperparameter Optimization",
    subtitle: "Systematic Model Tuning",
    category: "Deep Learning",
    githubUrl: "https://github.com/Umer-Farooq-CS/CNN-CIFAR10-Classification-GPU-Optimized",
    description: [
      "88.82% accuracy on CIFAR-10 through systematic tuning (81 combinations: learning rate, batch size, filters, depth).",
      "Optimal: LR=0.0005, Batch=16, Filters=64, 7 layers; mixed precision, XLA, data pipeline optimization.",
      "Training history, confusion matrices, per-class metrics, feature map visualizations.",
    ],
    technologies: ["Python", "TensorFlow", "Keras", "CUDA", "CNN", "Hyperparameter Optimization"],
  },
  {
    slug: "cifar10-suite",
    title: "CIFAR-10 Model Suite (ANN vs CNN vs Hybrid)",
    subtitle: "Config-Driven Training Pipeline",
    category: "Deep Learning",
    description: [
      "Compared ANN, CNN, and Hybrid CNN+ANN for CIFAR-10; YAML config per model; modular codebase.",
      "Early stopping, LR scheduling, checkpointing, TensorBoard, reproducibility; GPU mixed-precision and data pipelines.",
    ],
    technologies: ["Python", "TensorFlow/Keras", "YAML", "TensorBoard"],
  },
  {
    slug: "waste-detection-taco",
    title: "Waste Object Detection & Segmentation (TACO)",
    subtitle: "YOLOv8-n + U-Net",
    category: "Computer Vision",
    description: [
      "YOLOv8-n for waste detection and custom U-Net for semantic segmentation on TACO dataset.",
      "5 most frequent classes; 2.2× mAP@50 improvement for YOLO; U-Net IoU/Dice evaluation.",
    ],
    technologies: ["Python", "YOLOv8", "U-Net", "Data Augmentation", "Computer Vision"],
  },
  {
    slug: "financial-sentiment-rag",
    title: "Financial Sentiment Analysis & Topic Modeling",
    subtitle: "FinBERT vs Local LLM vs RAG",
    category: "NLP",
    description: [
      "Sentiment on Financial PhraseBank (3-class). Compared FinBERT, local Mistral (Ollama), RAG-augmented LLM.",
      "Best: FinBERT 94.73% accuracy; local LLM 86.42%; RAG 54.65% (retrieval/context analyzed). LDA topic modeling (15 topics).",
    ],
    technologies: ["HuggingFace", "Ollama", "Mistral", "FAISS", "scikit-learn"],
  },
  {
    slug: "multimodal-rag-pdf",
    title: "Multimodal RAG for PDF Question Answering",
    subtitle: "Text + Images",
    category: "Generative AI",
    description: [
      "End-to-end multimodal RAG for PDFs (text, tables, images): OCR, semantic retrieval, grounded generation.",
      "EasyOCR, Sentence-BERT + CLIP embeddings, FAISS, Ollama; Streamlit chat UI.",
    ],
    technologies: ["Python", "PyMuPDF", "EasyOCR", "Sentence-BERT", "CLIP", "FAISS", "Ollama", "Streamlit"],
  },
  {
    slug: "semantic-product-search",
    title: "Semantic Product Search & Neural Ranking",
    subtitle: "Learning-to-Rank",
    category: "Information Retrieval",
    description: [
      "Semantic product search with TF-IDF, Word2Vec, BERT-style embeddings; neural ranking model.",
      "Precision@1: 0.85; NDCG@5: 0.79; F1@10: 0.68; Streamlit UI.",
    ],
    technologies: ["Python", "Embeddings", "NDCG/MAP", "Streamlit"],
  },
  {
    slug: "english-urdu-mbart",
    title: "English-to-Urdu Machine Translation (mBART-large-50)",
    subtitle: "Fine-Tuning + Web Interface",
    category: "NLP",
    description: [
      "Fine-tuned mBART-large-50 for En→Urdu on multi-domain corpus (33,020 samples); BLEU 0.302.",
      "Mixed precision, gradient accumulation, pre-tokenization; training reduced to ~1.5–3 hours. Flask interface.",
    ],
    technologies: ["Python", "HuggingFace", "mBART", "Flask", "BLEU/ROUGE/METEOR"],
  },
  {
    slug: "dit-diffusion",
    title: "Diffusion Transformers (DiT) with REG/REPA",
    subtitle: "CIFAR-10 Image Generation",
    category: "Generative AI",
    description: [
      "DiT (ViT backbone) with REG/REPA vs U-Net diffusion; FID evaluation; DiT+REG FID 18.7, ~30% faster training.",
    ],
    technologies: ["Python", "Diffusion", "Vision Transformers", "CIFAR-10", "FID"],
  },
  {
    slug: "cyclegan-face-sketch",
    title: "CycleGAN Face↔Sketch Translation",
    subtitle: "Unpaired Image-to-Image",
    category: "Generative AI",
    description: [
      "Full CycleGAN for face photos ↔ sketches; Person Face Sketches dataset; cycle-consistency and identity losses; Flask demo.",
    ],
    technologies: ["Python", "CycleGAN", "Flask"],
  },
  // ML & Data Science
  {
    slug: "california-housing-regression",
    title: "California Housing Regression Study",
    subtitle: "Linear Regression vs SGD, CV Protocol",
    category: "Machine Learning",
    description: [
      "Five-phase protocol: EDA, single-feature, polynomial multi-feature, train/test, 5-fold CV. Closed-form vs SGDRegressor; MSE, RMSE, MAE, R².",
    ],
    technologies: ["Python", "NumPy", "scikit-learn"],
  },
  // Compiler Design
  {
    slug: "compiler-iu",
    title: "Compiler for Custom Language (IU)",
    subtitle: "Educational Language Implementation",
    category: "Compiler Design",
    description: [
      "Full compiler: hajimeru/gulegule delimiters, int/float/string/boolean, custom I/O and control flow.",
      "Lexer, parser, semantic analyzer, code generator; symbol table, error reporting, optimization passes.",
    ],
    technologies: ["C++", "Compiler Design", "Context-Free Grammars"],
  },
  {
    slug: "ll1-parser",
    title: "LL(1) Parser Toolkit",
    subtitle: "Parsing Theory",
    category: "Compiler Design",
    githubUrl: "https://github.com/Umer-Farooq-CS/LL1-Parser-Plus",
    description: [
      "FIRST/FOLLOW, LL(1) table construction, predictive parser; grammar validation, left recursion elimination, left factoring; step-by-step demo.",
    ],
    technologies: ["C", "Parsing Theory", "LL(1)"],
  },
  // Distributed Systems
  {
    slug: "ring-dht-ipfs",
    title: "Ring DHT with IPFS Integration",
    subtitle: "Distributed Hash Table",
    category: "Distributed Systems",
    description: [
      "DHT with Chord-like ring (160-bit SHA-1); finger table O(log N) routing; IPFS integration; B-Tree local storage; console UI for nodes and file ops; replication and fault tolerance.",
    ],
    technologies: ["C++", "DHT", "SHA-1", "B-Trees", "IPFS"],
  },
  {
    slug: "doodle-dash",
    title: "Doodle Dash",
    subtitle: "Multiplayer Drawing & Guessing Game",
    category: "Distributed Systems & Networking",
    description: [
      "Real-time multiplayer game: TCP sockets, multi-threaded server (pthreads), game rooms, stroke sync, turn-based roles, scoring; SFML canvas, custom protocol, delta encoding.",
    ],
    technologies: ["C++", "SFML", "TCP", "pthreads", "Game Development"],
  },
  // Full-Stack
  {
    slug: "asco-services-api",
    title: "ASCO Services API",
    subtitle: ".NET 8 Web API",
    category: "Full-Stack / Backend",
    description: [
      ".NET 8 Web API: users, organizations, JWT auth, RBAC, clean architecture (repository, service layer, DTOs), BCrypt, Entity Framework Core + PostgreSQL, Swagger.",
    ],
    technologies: [".NET 8", "ASP.NET Core", "EF Core", "PostgreSQL", "JWT", "Swagger", "Docker"],
  },
  {
    slug: "harmoniq",
    title: "Harmoniq",
    subtitle: "Audio Library Explorer",
    category: "Full-Stack",
    githubUrl: "https://github.com/Umer-Farooq-CS/Harmoniq",
    description: [
      "Full-stack audio platform: Express REST API, playlist management, auth, range-request streaming; React UI, waveform visualization, infinite scroll; PostgreSQL schema, full-text search.",
    ],
    technologies: ["JavaScript", "React", "Node.js", "Express", "PostgreSQL", "HTML5 Audio"],
  },
  {
    slug: "dj-web-app",
    title: "DJ Web Application",
    subtitle: "Real-Time Music Streaming",
    category: "Full-Stack",
    description: [
      "MERN stack: React (Vite), Web Audio visualization, drag-drop playlists, mixing controls; Express, WebSockets, MongoDB/GridFS; real-time sync and chat.",
    ],
    technologies: ["React", "Vite", "Node.js", "Express", "MongoDB", "WebSockets", "Web Audio API"],
  },
  // Desktop
  {
    slug: "student-management-system",
    title: "Student Management System",
    subtitle: "JavaFX Enterprise Application",
    category: "Desktop Applications",
    description: [
      "JavaFX: CRUD, courses, attendance, fees, reports; PostgreSQL, JDBC, BCrypt auth, RBAC; client-server TCP, multi-threaded server, custom protocol.",
    ],
    technologies: ["Java", "JavaFX", "PostgreSQL", "JDBC", "TCP", "MVC"],
  },
  {
    slug: "torrent-management-system",
    title: "Torrent Management System",
    subtitle: "JavaFX & P2P Networking",
    category: "Desktop Applications",
    description: [
      "Torrent client: file parsing, queue, multi-threaded download, upload/seeding, resume; P2P protocol, piece selection; JavaFX UI, speed/peer list, file tree.",
    ],
    technologies: ["Java", "JavaFX", "TCP", "P2P", "Multi-threading"],
  },
  {
    slug: "dotnet-desktop-apps",
    title: ".NET Desktop Applications",
    subtitle: "Enterprise Applications",
    category: "Desktop Applications",
    description: [
      "Multiple .NET (C#, Windows Forms, WPF) apps; MVC/MVVM, PostgreSQL, ADO.NET/EF; 100+ concurrent users.",
    ],
    technologies: ["C#", ".NET", "WPF", "Entity Framework", "PostgreSQL", "MVC", "MVVM"],
  },
  // Game Development
  {
    slug: "pacman-ghost-ai",
    title: "Pac-Man with Multi-threaded Ghost AI",
    subtitle: "C++ & SFML",
    category: "Game Development",
    description: [
      "Pac-Man clone: multi-threaded ghost AI (pthreads), A* pathfinding, Blinky/Pinky/Inky/Clyde behaviors; SFML graphics, HUD, 60+ FPS.",
    ],
    technologies: ["C++", "SFML", "pthreads", "A*", "Game AI"],
  },
  {
    slug: "2d-game-suite",
    title: "2D Game Suite",
    subtitle: "Snake, Tetris, RPG Prototype",
    category: "Game Development",
    description: [
      "Snake, Tetris, RPG prototype in C++/SFML/SDL2; OOP, MVC; 30%+ performance improvements, custom physics, collision, rendering optimizations.",
    ],
    technologies: ["C++", "SFML", "SDL2", "OOP", "MVC"],
  },
];

export const PROJECT_CATEGORIES = [
  "High-Performance Computing & Quantum",
  "High-Performance Computing & GPU",
  "Generative AI & RAG",
  "Generative AI",
  "Deep Learning",
  "Computer Vision",
  "NLP",
  "Information Retrieval",
  "Machine Learning",
  "Compiler Design",
  "Distributed Systems",
  "Distributed Systems & Networking",
  "Full-Stack",
  "Full-Stack / Backend",
  "Desktop Applications",
  "Game Development",
] as const;

export function getProjectBySlug(slug: string): ProjectItem | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export function getFeaturedProjects(): ProjectItem[] {
  return PROJECTS.filter((p) => p.featured);
}

export function getProjectsByCategory(): Record<string, ProjectItem[]> {
  const byCat: Record<string, ProjectItem[]> = {};
  for (const p of PROJECTS) {
    if (!byCat[p.category]) byCat[p.category] = [];
    byCat[p.category].push(p);
  }
  return byCat;
}
