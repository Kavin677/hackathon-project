# Match / Gap — Smart Resume Analyzer & Job Matching System

A high-performance, privacy-first client-side web application that performs intelligent skill extraction, weighted matching between resumes and job descriptions, structural ATS inspection, and targeted learning roadmap generation.

**100% Client-Side:** All logic executes entirely inside the browser memory. Zero resumes, job descriptions, or personal data are ever sent over a network.

---

## 🚀 Key Features & Architecture

### 1. Core Taxonomy & Synonyms Engine (`js/taxonomy.js`)
- **137+ Canonical Skills & 275+ Alias Terms** across 7 primary industry categories:
  1. **Languages**: Python, JavaScript (JS), TypeScript (TS), C++, C#, C, Java, SQL, Go (Golang), Rust, PHP, Ruby, Swift, Kotlin, R, Bash/Shell, HTML5, CSS3, etc.
  2. **Frameworks**: React, Node.js, Next.js, Django, Flask, Spring Boot, Angular, Vue.js, Express, FastAPI, ASP.NET Core, Svelte, Tailwind CSS, GraphQL, etc.
  3. **Data / ML**: Machine Learning (ML), Deep Learning (DL), PyTorch, TensorFlow, Pandas, NumPy, NLP, Computer Vision, Scikit-Learn, LLMs, Generative AI, LangChain, Transformers, Spark, etc.
  4. **Databases**: PostgreSQL, MySQL, MongoDB, Redis, SQLite, Oracle, MSSQL, Cassandra, DynamoDB, Elasticsearch, Snowflake, BigQuery, Supabase, Firebase, etc.
  5. **Cloud / DevOps**: AWS, Azure, GCP, Docker, Kubernetes (K8s), Git, CI/CD, Terraform, Ansible, Linux, Jenkins, Helm, Prometheus, Grafana, Nginx, etc.
  6. **Tools**: Jira, Postman, Figma, Power BI, Tableau, Excel, VS Code, Confluence, Notion, Slack, Vite, etc.
  7. **Soft Skills**: Communication, Leadership, Teamwork / Collaboration, Problem Solving, Agile / Scrum, Time Management, Mentoring, Ownership, Adaptability, etc.
- **Robust Boundary Matching**: Handles punctuation-sensitive keywords like `C++`, `C#`, `.NET`, `Node.js`, and `CI/CD` without false positives.

### 2. Dual-Panel Input & Upload Module
- Two side-by-side panels for **Resume** and **Job Description**.
- Live character and word counters.
- Real-time mini chip detection showing taxonomy skills as you type.
- **Upload `.txt`** file buttons for 1-click document import.
- Validation gate: requires 20+ characters in both inputs before enabling analysis.
- One-click sample presets (Full Stack 85% match, Data Science 60% match, DevOps 75% match).

### 3. Required vs. Preferred Split & Weighted Scoring Engine (`js/engine.js`)
- **Automated JD Splitting**: Detects natural transition markers (`"preferred"`, `"nice to have"`, `"bonus"`, `"desirable"`, `"plus if you have"`) and splits the JD into **Required** and **Preferred** sections.
- **Weighted Formula**:
  $$\text{Match \%} = \frac{\sum (\text{Matched Required} \times 1.5) + \sum (\text{Matched Preferred} \times 1.0)}{\sum (\text{Total Required} \times 1.5) + \sum (\text{Total Preferred} \times 1.0)} \times 100$$
- **Color-Coded Circular Score Dial**:
  - Green ($\ge 70\%$): **Strong match**
  - Amber ($40\% - 69\%$): **Partial match**
  - Red ($< 40\%$): **Weak match**

### 4. Interactive Results Dashboard
1. **Circular Dial & KPI Ratios**: Required matches, Preferred matches, Total matches, and Experience status.
2. **Category Coverage Breakdown**: Horizontal visual bars measuring coverage across all 7 skill categories.
3. **Matched Skills Chips**: Emerald chips tagged `[REQ]` or `[PREF]`.
4. **Missing Skills Chips**: Coral chips tagged `[REQ]` or `[PREF]`; clicking any missing skill instantly filters the Learning Resources tab.
5. **Prioritized Suggestions**:
   - Flags critical missing required skills as High Priority.
   - Compares **Years of Experience (YOE)** extracted from the JD vs Resume (`/(\d{1,2})\+?\s*(years|yrs)/`).
   - Flags missing behavioral/soft skills specifically.
   - Exact phrasing alignment tips for ATS keyword matching.
6. **Highlighted Resume Scan View**: Renders the complete resume text with every matched skill highlighted in `<mark>` elements (green for required, amber for preferred).

### 5. Multi-Job Description Comparison Module
- Compares one resume against **up to 3 job descriptions** simultaneously.
- Displays horizontal comparison bars and scores side-by-side.
- Automatically crowns the **★ Best Fit Role** with a summary banner.
- 1-click button to load any role directly into the primary analyzer.

### 6. 5-Point ATS Format & Readability Checker
Runs structural heuristics directly on the resume text:
- **Bullet Point Usage**: Regex for lines starting with `•`, `-`, or `*` (passes if $\ge 3$ lines).
- **Email Address Validation**: Detects standard email format.
- **Phone Number Validation**: Detects international and domestic phone formats.
- **Standard Section Headings**: Checks for standard sections (`experience`, `education`, `skills`, `projects`, `summary`, `objective`) — passes if $\ge 2$ found.
- **Optimal Word Count**: Assesses if the resume is within the standard 250–900 word range.

### 7. Curated Free Learning Resources
- Maps missing skills to curated official documentation, freeCodeCamp tutorials, and free interactive guides.
- Automatic fallback to targeted developer documentation search.
- Filter by *All Missing*, *Required Only*, or *Preferred Only*.

### 8. Downloadable Plain-Text Report
- Formatted plain-text analysis summary complete with ASCII divider bars, breakdown tables, and recommendations.
- **Download Report (.txt)** button (client-side `Blob` generator).
- **Copy Report** button with clipboard feedback.

---

## 💻 Tech Stack & Design System
- **HTML5 & Vanilla JavaScript (ES6+)**: Zero build dependencies, zero frameworks, 100% browser-native.
- **CSS3 Design System**:
  - Dark Mode default (`#0a0e17`, `#121826`, `#182032`).
  - Automatic `prefers-color-scheme: light` support + manual toggle switch.
  - Accent colors: Emerald Teal (`#10b981`), Coral Red (`#ef4444`), Amber (`#f59e0b`), Cyan (`#06b6d4`).
  - Monospace typography for skills, metrics, and report view (`JetBrains Mono`).
  - Accessible focus states (`:focus-visible`), responsive layouts down to 320px mobile screens.

---

## 🏃 How to Run Locally

Because this application is built with pure web technologies, **no server setup or `npm install` is required**.

### Option A: Double-Click / Direct Open
Simply double-click `index.html` or open it in any modern browser (Chrome, Edge, Firefox, Safari):
```bash
start index.html
```

### Option B: Local HTTP Server (Optional)
If you prefer running via a local server:
```bash
# Python 3
python -m http.server 8000

# Open in browser:
# http://localhost:8000
```

---

## 📁 Project Directory Structure
```
hackathon project/
├── index.html                   # Main application layout and dashboard tabs
├── css/
│   └── styles.css               # Dark/Light theme stylesheet, components, animations
├── js/
│   ├── taxonomy.js              # 137+ skills taxonomy, aliases, resources & sample presets
│   ├── engine.js                # Core pure matching, scoring, splitting, ATS heuristics
│   └── app.js                   # Application state, UI events, reactive rendering
├── samples/
│   ├── fullstack_resume.txt     # Sample test resume file
│   └── fullstack_job_description.txt
└── README.md                    # Project documentation
```
