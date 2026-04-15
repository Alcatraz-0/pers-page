export const PROJECTS = [
  {
    id: '001',
    name: 'MULTI-MODAL RAG FOR SEC 10-K FINANCIAL DOCUMENT ANALYSIS',
    badge: 'ML · CLOUD',
    category: 'ml',
    desc: 'Hierarchical two-stage RAG system processing 150 SEC 10-K filings (8 GB, 45 K text chunks, 12 K tables) with hybrid dense+sparse retrieval achieving 85% Table Recall@5 and 12-point EM improvement over text-only baselines. Intelligent query routing detects table-centric questions with 96% faithfulness and 4.2s median latency.',
    tech: ['LLaMA 3.2', 'FAISS', 'BM25', 'RAG', 'FinQA', 'Sentence-Transformers', 'LangChain', 'ChromaDB', 'Python', 'HuggingFace'],
    github: 'https://github.com/Alcatraz-0/multimodal-rag-sec',
  },
  {
    id: '002',
    name: 'SF PROPERTY TAX ANALYSIS & GENTRIFICATION RISK ASSESSMENT',
    badge: 'DATA ENG',
    category: 'data',
    desc: 'End-to-end urban analytics pipeline processing 3.7 M property tax records (6 GB GeoJSON) across 93 San Francisco neighborhoods. ETL system with 87.1% memory optimization (5.7 GB → 733 MB). Composite risk model revealing 59.6% median property appreciation (2015–2023) and displacement zone analysis for 67 K+ properties.',
    tech: ['Python', 'GeoJSON', 'ETL', 'Plotly', 'Pandas', 'GeoPandas', 'NumPy', 'Shapely', 'SQL'],
    github: 'https://github.com/Alcatraz-0/sf-property-tax-analysis',
  },
  {
    id: '003',
    name: 'CHICAGO TRAFFIC CRASHES: PREDICTIVE SAFETY ANALYTICS',
    badge: 'ML · ANALYTICS',
    category: 'ml',
    desc: 'Analyzed 938 K crash records with 48 features using ensemble models (Random Forest, XGBoost, Neural Networks) achieving 0.597 RMSE for injury prediction. Discovered 90% pedestrian injury rate corridors. Deployed interactive dashboards on GitHub Pages with DBSCAN clustering for geographic hotspot identification.',
    tech: ['XGBoost', 'Random Forest', 'DBSCAN', 'Folium', 'GitHub Pages', 'Scikit-learn', 'Neural Networks', 'Python', 'Matplotlib'],
    github: 'https://github.com/Alcatraz-0/chicago-traffic-analytics',
  },
  {
    id: '004',
    name: 'FAIRNESS IN TARGETED ADVERTISEMENTS',
    badge: 'RESPONSIBLE AI',
    category: 'ml',
    desc: "Comprehensive fairness evaluation framework combining Meta's Ad Library (66 K ads, 56 US regions), FairJobs benchmark (1 M+ rows), and synthetic data. Achieved 93.4% reduction in statistical parity difference with 99.2% accuracy. Improved Disparate Impact Ratio from non-compliant 0.70 to near-compliant 0.98. Published 11-page ACM research paper.",
    tech: ['Fairlearn', 'AIF360', 'Altair', 'Algorithmic Fairness', 'Python', 'Scikit-learn', 'Pandas', 'ACM Research'],
    github: 'https://github.com/Alcatraz-0/fairness-targeted-ads',
  },
  {
    id: '005',
    name: 'DISTRIBUTED AI PIPELINE FOR LLM PREPROCESSING — CS441',
    badge: 'DISTRIBUTED SYS',
    category: 'cloud',
    desc: 'Hadoop-based NLP pipeline preprocessing 40 GB of LLM training data using Scala — 3× faster than single-node. BPE tokenization with context-preserving sliding window (stride: 128 tokens). gRPC connectors between Akka HTTP on EC2 and AWS Lambda for sub-100 ms inference. LLaMA3 on Bedrock with CloudWatch monitoring cutting debug time 60%.',
    tech: ['Hadoop', 'Scala', 'AWS Bedrock', 'gRPC', 'LLaMA3', 'MapReduce', 'Akka HTTP', 'AWS Lambda', 'EC2', 'CloudWatch'],
    github: 'https://github.com/Alcatraz-0/distributed-llm-pipeline',
  },
  {
    id: '006',
    name: 'MULTI-CLOUD IAAS PLATFORM FOR LLM INFERENCING',
    badge: 'CLOUD INFRA',
    category: 'cloud',
    desc: 'Built at Oplexa: multi-cloud IaaS platform targeting 30–60% cost savings for 3,000+ Fortune 1000 enterprises with $1.4M+ GPU budgets. Cross-cloud GPU benchmarking across NVIDIA, AWS, and GCP. Distributed control plane with REST API for federated compute orchestration across 10+ cloud providers and on-prem data centers.',
    tech: ['Kubernetes', 'AWS', 'GCP', 'REST API', 'Docker', 'Linux', 'Terraform', 'NVIDIA GPUs', 'Python', 'PostgreSQL'],
    github: 'https://github.com/Alcatraz-0/multicloud-iaas-platform',
  },
]

export const PROJECT_FILTERS = [
  { label: 'ALL', value: 'all' },
  { label: 'ML', value: 'ml' },
  { label: 'CLOUD', value: 'cloud' },
  { label: 'DATA', value: 'data' },
]

export const SKILL_GROUPS = [
  {
    label: 'LANGUAGES',
    items: [
      { name: 'PYTHON', pct: 95 },
      { name: 'JAVASCRIPT', pct: 75 },
      { name: 'SCALA', pct: 70 },
      { name: 'SQL / PostgreSQL', pct: 78 },
      { name: 'C / C++', pct: 68 },
      { name: 'HTML / CSS', pct: 80 },
      { name: 'R', pct: 60 },
    ],
  },
  {
    label: 'ML & SYSTEMS',
    items: [
      { name: 'HUGGING FACE / NLP', pct: 88 },
      { name: 'RAG / LLM SYSTEMS', pct: 85 },
      { name: 'AWS STACK', pct: 82 },
      { name: 'HADOOP / HDFS', pct: 75 },
      { name: 'KUBERNETES / DOCKER', pct: 72 },
      { name: 'TENSORFLOW / TFLITE', pct: 78 },
      { name: 'FPGA / HLS4ML', pct: 65 },
    ],
  },
]

export const RESEARCH = [
  {
    status: 'published',
    statusLabel: 'PUBLISHED — SPRINGER CCIS 2234',
    title: 'CROSS-LANGUAGE QUESTION ANSWERING SYSTEM USING HUGGING-FACE TRANSFORMERS',
    venue: 'ICICBDA 2024 Conference Proceedings · January 2023 – June 2024 · First Author',
    abstract: 'Developed a cross-language question answering framework using Hugging Face Transformers, achieving 92% accuracy with 35.9–41.3 BLEU scores across multilingual language pairs. Fine-tuned transformer models for cross-lingual transfer demonstrate strong generalization over diverse multilingual benchmarks.',
    actions: [
      { label: 'READ PAPER', href: 'https://link.springer.com/chapter/10.1007/978-981-97-8031-0_29', primary: true },
      { label: 'GOOGLE SCHOLAR', href: 'https://scholar.google.com/citations?view_op=list_works&hl=en&user=gfqyyngAAAAJ', primary: false },
    ],
  },
  {
    status: 'progress',
    statusLabel: 'IN PROGRESS — UIC SAMPL LAB',
    title: 'ML-BASED MULTI-QUBIT STATE RECONSTRUCTION ON NVIDIA DGX + XILINX RFSOC FPGA',
    venue: 'University of Illinois Chicago · December 2025 – Present',
    abstract: 'Developing compute-intensive models on NVIDIA DGX GPU infrastructure for multi-qubit state reconstruction with distributed GPU node profiling. Low-latency inference pipeline on Xilinx ZCU216 RFSoC FPGA using HLS4ML, integrating real-time hardware data acquisition for quantum computing applications.',
    actions: [{ label: 'ONGOING', href: null, primary: false }],
  },
  {
    status: 'progress',
    statusLabel: 'COMPLETED — ACM PAPER (11 PAGES)',
    title: 'FAIRNESS IN TARGETED ADVERTISEMENTS: ALGORITHMIC BIAS EVALUATION FRAMEWORK',
    venue: 'University of Illinois Chicago · January 2025 – April 2025',
    abstract: 'Comprehensive bias evaluation across three datasets (Meta Ad Library, FairJobs, synthetic data with controlled bias injection). 93.4% reduction in statistical parity difference while maintaining 99.2% accuracy. Improved Disparate Impact Ratio from 0.70 to near-compliant 0.98 with mathematical formalization and ablation studies.',
    actions: [{ label: 'MANUSCRIPT READY', href: null, primary: false }],
  },
]

export const EDUCATION = [
  {
    date: 'AUG 2024 – PRESENT',
    org: 'UNIVERSITY OF ILLINOIS CHICAGO',
    role: 'MS IN COMPUTER SCIENCE · GPA 4.0 · CHICAGO, IL',
    bullets: ['Coursework: Cloud Computing, Computer Networking, Natural Language Processing, Information Retrieval, Data Science'],
  },
  {
    date: 'AUG 2019 – MAY 2023',
    org: 'NETAJI SUBHAS UNIVERSITY OF TECHNOLOGY',
    role: 'BTECH IN COMPUTER SCIENCE AND ENGINEERING · NEW DELHI, INDIA',
    bullets: [],
  },
]

export const EXPERIENCE = [
  {
    date: 'DEC 2025 – PRESENT',
    org: 'UNIVERSITY OF ILLINOIS CHICAGO',
    role: 'SOFTWARE ENGINEER — SAMPL LAB · CHICAGO, IL',
    bullets: [
      'Develop and optimize compute-intensive models on NVIDIA DGX GPU infrastructure for multi-qubit state reconstruction, profiling system performance and tuning resource allocation across distributed GPU nodes.',
      'Engineered low-latency inference pipeline on Xilinx ZCU216 RFSoC FPGA using HLS4ML, integrating real-time hardware data acquisition with NVIDIA DGX GPU infrastructure for end-to-end processing.',
    ],
  },
  {
    date: 'JUN 2025 – DEC 2025',
    org: 'OPLEXA AI CONSULTING & MARKET RESEARCH',
    role: 'SOFTWARE ENGINEER · SANTA CLARA, CA',
    bullets: [
      'Built a multi-cloud IaaS platform for LLM inferencing optimization, designed to deliver 30–60% cost savings across 3,000+ Fortune 1000 enterprises with $1.4M+ GPU budgets.',
      'Developed cross-cloud GPU comparison and provisioning system enabling benchmarking of NVIDIA, AWS, and GCP instances with minimal configuration changes.',
      'Engineered a distributed control plane with REST API for federated compute orchestration across 10+ cloud providers and on-prem data centers.',
      'Diagnosed performance bottlenecks across distributed Kubernetes clusters using SSH-based log analysis and Linux system profiling.',
    ],
  },
  {
    date: 'AUG 2022 – OCT 2022',
    org: 'HANS INFORMATICS PVT LTD',
    role: 'SOFTWARE DEVELOPMENT INTERN · NEW DELHI, INDIA',
    bullets: [
      'Developed and deployed a real-time Android app for proctored examinations using ML Kit, TFLite, and FaceNet — 95% face-matching accuracy.',
      'Integrated GPS-based localization (~10m precision) with facial recognition for spatial identity compliance.',
      'Designed anomaly detection module to flag behavioral discrepancies in real-time, minimizing manual supervision.',
    ],
  },
  {
    date: 'APR 2022 – MAY 2022',
    org: 'SOLARMAN TECHNOLOGY PROJECT PVT LTD',
    role: 'SOFTWARE DEVELOPMENT INTERN · NEW DELHI, INDIA',
    bullets: [
      'Architected a modular Django platform with PostgreSQL for ~1,200 records/month across 20+ clients; REST API endpoints and admin dashboard reducing onboarding time.',
      'Improved UI performance using AJAX, CSS, and responsive optimizations — ~30% reduction in page load latency.',
      'Deployed production infra on AWS Elastic Beanstalk and RDS with autoscaling and CloudWatch alerts; 99.7% uptime for 30–50 daily active users.',
    ],
  },
]

export const STATS = [
  { value: '4.0', label: 'GPA\nMS @ UIC' },
  { value: '4+', label: 'INTERNSHIPS &\nROLES' },
  { value: '1', label: 'SPRINGER\nPUBLICATION' },
  { value: '6+', label: 'RESEARCH\nPROJECTS' },
]

export const CONTACT_ITEMS = [
  { icon: '@', label: 'EMAIL', value: 'anand.01ntgy@gmail.com', href: 'mailto:anand.01ntgy@gmail.com' },
  { icon: 'in', label: 'LINKEDIN', value: 'linkedin.com/in/anandm01', href: 'https://www.linkedin.com/in/anandm01/' },
  { icon: '</>', label: 'GITHUB', value: 'github.com/Alcatraz-0', href: 'https://github.com/Alcatraz-0' },
  { icon: '◎', label: 'LOCATION', value: 'Chicago, IL, USA', href: null },
]

export const NOW_ITEMS = [
  {
    icon: '⚙',
    label: 'BUILDING',
    value: 'ML Qubit State Reconstruction',
    detail: 'UIC SAMPL Lab · FPGA / HLS4ML pipeline',
  },
  {
    icon: '📖',
    label: 'LEARNING',
    value: 'Hardware-Aware Neural Networks',
    detail: 'HLS4ML synthesis + FPGA deployment',
  },
  {
    icon: '📄',
    label: 'READING',
    value: '"Attention Is All You Need"',
    detail: 'Transformer architecture deep-dive',
  },
  {
    icon: '🚀',
    label: 'SHIPPED',
    value: 'Multimodal RAG for SEC 10-K',
    detail: '85% Table Recall@5 · LLaMA 3.2 · FAISS',
  },
]
