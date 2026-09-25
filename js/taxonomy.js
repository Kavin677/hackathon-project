/**
 * Match / Gap — Skills Taxonomy & Curated Learning Resources
 * Over 140+ terms across 7 core categories with alias/synonym mappings.
 */

const SKILLS_TAXONOMY = {
  "Languages": {
    "python": ["py"],
    "javascript": ["js", "es6", "ecmascript"],
    "typescript": ["ts"],
    "c++": ["cpp", "cplusplus"],
    "c#": ["csharp", "c sharp"],
    "c": [],
    "java": ["core java", "j2se"],
    "sql": ["structured query language"],
    "go": ["golang"],
    "rust": [],
    "php": [],
    "ruby": [],
    "swift": [],
    "kotlin": [],
    "r": ["r programming", "r-lang"],
    "scala": [],
    "bash": ["shell", "sh", "zsh", "powershell", "bash scripting"],
    "html": ["html5"],
    "css": ["css3"],
    "sass": ["scss"],
    "dart": [],
    "perl": []
  },
  "Frameworks": {
    "react": ["reactjs", "react.js"],
    "node.js": ["nodejs", "node"],
    "django": [],
    "flask": [],
    "spring": ["spring boot", "springboot", "spring mvc"],
    "angular": ["angularjs", "angular 2+"],
    "vue": ["vuejs", "vue.js"],
    "next.js": ["nextjs", "next"],
    "express": ["expressjs", "express.js"],
    "fastapi": ["fast api"],
    "svelte": ["sveltekit"],
    "asp.net": ["dotnet", ".net", ".net core", "aspnet"],
    "laravel": [],
    "rails": ["ruby on rails"],
    "nestjs": ["nest.js"],
    "jquery": [],
    "graphql": ["apollo graphql"],
    "tailwind": ["tailwindcss", "tailwind css"],
    "bootstrap": ["bootstrap 5"],
    "redux": ["redux toolkit", "rtk"],
    "hibernate": [],
    "flutter": [],
    "react native": ["react-native"]
  },
  "Data/ML": {
    "machine learning": ["ml"],
    "deep learning": ["dl"],
    "pandas": [],
    "numpy": [],
    "tensorflow": ["tf"],
    "pytorch": [],
    "nlp": ["natural language processing"],
    "computer vision": ["cv", "object detection"],
    "scikit-learn": ["sklearn"],
    "keras": [],
    "opencv": [],
    "data analysis": ["data analytics"],
    "data science": [],
    "llm": ["large language models", "llms", "large language model"],
    "genai": ["generative ai", "generative artificial intelligence"],
    "langchain": [],
    "transformers": ["huggingface transformers"],
    "hugging face": ["huggingface"],
    "pyspark": [],
    "spark": ["apache spark"],
    "hadoop": ["apache hadoop"],
    "data visualization": ["data viz"],
    "statistical modeling": ["statistics", "biostatistics"],
    "prompt engineering": []
  },
  "Databases": {
    "mysql": [],
    "postgresql": ["postgres", "psql"],
    "mongodb": ["mongo"],
    "redis": [],
    "sqlite": [],
    "oracle": ["oracle db", "pl/sql"],
    "sql server": ["mssql", "microsoft sql server"],
    "cassandra": ["apache cassandra"],
    "dynamodb": ["amazon dynamodb"],
    "elasticsearch": ["elastic search", "elk"],
    "neo4j": [],
    "snowflake": [],
    "bigquery": ["google bigquery"],
    "mariadb": [],
    "supabase": [],
    "firebase": ["firestore"],
    "couchbase": [],
    "prisma": ["prisma orm"]
  },
  "Cloud/DevOps": {
    "aws": ["amazon web services"],
    "azure": ["microsoft azure"],
    "gcp": ["google cloud", "google cloud platform"],
    "docker": ["containerization", "containers"],
    "kubernetes": ["k8s"],
    "git": ["github", "gitlab", "bitbucket", "version control"],
    "ci/cd": ["cicd", "continuous integration", "continuous deployment"],
    "terraform": ["infrastructure as code", "iac"],
    "ansible": [],
    "linux": ["unix", "ubuntu", "centos", "debian"],
    "jenkins": [],
    "helm": [],
    "prometheus": [],
    "grafana": [],
    "cloudflare": [],
    "nginx": [],
    "serverless": ["aws lambda", "cloud functions"],
    "openshift": [],
    "argo cd": ["argocd"],
    "datadog": []
  },
  "Tools": {
    "excel": ["ms excel", "microsoft excel", "spreadsheets"],
    "power bi": ["powerbi"],
    "tableau": [],
    "jira": ["atlassian jira"],
    "figma": [],
    "postman": [],
    "confluence": [],
    "trello": [],
    "vs code": ["vscode", "visual studio code"],
    "slack": [],
    "notion": [],
    "miro": [],
    "photoshop": ["adobe photoshop"],
    "webpack": [],
    "vite": [],
    "swagger": ["openapi"]
  },
  "Soft skills": {
    "communication": ["written communication", "verbal communication"],
    "leadership": ["team lead", "mentorship"],
    "teamwork": ["collaboration", "cross-functional"],
    "problem solving": ["analytical thinking", "critical thinking"],
    "agile": ["scrum", "kanban", "sprint planning"],
    "time management": ["prioritization", "deadline management"],
    "adaptability": ["flexibility", "fast learner"],
    "negotiation": [],
    "conflict resolution": [],
    "presentation": ["public speaking", "presenting"],
    "mentoring": ["coaching", "training"],
    "ownership": ["accountability"],
    "decision making": [],
    "emotional intelligence": ["empathy"]
  }
};

/**
 * Curated Free Learning Resources for missing skills.
 * Falls back dynamically to DevDocs or freeCodeCamp search.
 */
const CURATED_RESOURCES = {
  "python": { title: "Python Official Docs & Tutorial", url: "https://docs.python.org/3/tutorial/", source: "Official Python Docs" },
  "javascript": { title: "MDN JavaScript Guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", source: "MDN Web Docs" },
  "typescript": { title: "TypeScript for JavaScript Programmers", url: "https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html", source: "TypeScript Official" },
  "c++": { title: "Learn C++ Interactive & Reference", url: "https://www.learncpp.com/", source: "LearnCpp.com" },
  "c#": { title: "C# Documentation & Free Tutorials", url: "https://learn.microsoft.com/en-us/dotnet/csharp/", source: "Microsoft Learn" },
  "java": { title: "Java Programming Basics & Roadmap", url: "https://dev.java/learn/", source: "Oracle Java" },
  "sql": { title: "SQL Tutorial & Interactive Practice", url: "https://www.w3schools.com/sql/", source: "W3Schools SQL" },
  "go": { title: "A Tour of Go (Interactive)", url: "https://go.dev/tour/welcome/1", source: "Go.dev" },
  "rust": { title: "The Rust Programming Language Book", url: "https://doc.rust-lang.org/book/", source: "Rust Lang Org" },
  "html": { title: "HTML5 Structure & Semantic Guide", url: "https://developer.mozilla.org/en-US/docs/Learn/HTML", source: "MDN Web Docs" },
  "css": { title: "Modern CSS Core Concepts", url: "https://web.dev/learn/css/", source: "web.dev by Google" },
  "react": { title: "React Quick Start & Deep Dive", url: "https://react.dev/learn", source: "React.dev" },
  "node.js": { title: "Node.js Learning Path & Architecture", url: "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs", source: "Node.js Org" },
  "django": { title: "Django Girls / Official Django Tutorial", url: "https://docs.djangoproject.com/en/stable/intro/tutorial01/", source: "Django Project" },
  "spring": { title: "Building a RESTful Web Service with Spring Boot", url: "https://spring.io/guides/gs/rest-service/", source: "Spring.io" },
  "angular": { title: "Angular Official Essentials Guide", url: "https://angular.dev/overview", source: "Angular.dev" },
  "vue": { title: "Vue.js 3 Quickstart Guide", url: "https://vuejs.org/guide/quick-start.html", source: "Vue.js Org" },
  "next.js": { title: "Next.js App Router Foundations", url: "https://nextjs.org/learn", source: "Next.js by Vercel" },
  "express": { title: "Express.js Web Application Framework Guide", url: "https://expressjs.com/en/starter/installing.html", source: "Express.js" },
  "fastapi": { title: "FastAPI First Steps & Async Tutorial", url: "https://fastapi.tiangolo.com/tutorial/", source: "FastAPI Docs" },
  "asp.net": { title: ".NET Free Tutorials & Architecture", url: "https://dotnet.microsoft.com/en-us/learn", source: "Microsoft .NET" },
  "tailwind": { title: "Tailwind CSS Utility-First Fundamentals", url: "https://tailwindcss.com/docs/utility-first", source: "Tailwind Docs" },
  "graphql": { title: "Introduction to GraphQL", url: "https://graphql.org/learn/", source: "GraphQL Org" },
  "machine learning": { title: "Google Machine Learning Crash Course", url: "https://developers.google.com/machine-learning/crash-course", source: "Google Developers" },
  "deep learning": { title: "Deep Learning Specialization & MIT 6.S191", url: "http://introtodeeplearning.com/", source: "MIT Deep Learning" },
  "pandas": { title: "10 Minutes to Pandas", url: "https://pandas.pydata.org/docs/user_guide/10min.html", source: "Pandas Docs" },
  "numpy": { title: "NumPy: the Absolute Basics for Beginners", url: "https://numpy.org/doc/stable/user/absolute_beginners.html", source: "NumPy Docs" },
  "tensorflow": { title: "TensorFlow Tutorials for Beginners", url: "https://www.tensorflow.org/tutorials", source: "TensorFlow.org" },
  "pytorch": { title: "PyTorch 60-Minute Blitz", url: "https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html", source: "PyTorch Docs" },
  "nlp": { title: "Hugging Face NLP Course (Free)", url: "https://huggingface.co/learn/nlp-course/", source: "Hugging Face" },
  "computer vision": { title: "OpenCV Python Tutorials & Vision Basics", url: "https://docs.opencv.org/4.x/d6/d00/tutorial_py_root.html", source: "OpenCV.org" },
  "scikit-learn": { title: "Scikit-Learn Getting Started Guide", url: "https://scikit-learn.org/stable/getting_started.html", source: "Scikit-Learn" },
  "llm": { title: "Large Language Models & Prompt Guide", url: "https://www.promptingguide.ai/", source: "Prompt Engineering Guide" },
  "genai": { title: "Generative AI for Beginners", url: "https://github.com/microsoft/generative-ai-for-beginners", source: "Microsoft GitHub" },
  "langchain": { title: "LangChain Quickstart Tutorial", url: "https://python.langchain.com/docs/get_started/introduction", source: "LangChain Docs" },
  "mysql": { title: "MySQL Tutorial for Beginners", url: "https://dev.mysql.com/doc/refman/8.0/en/tutorial.html", source: "MySQL Official" },
  "postgresql": { title: "PostgreSQL Tutorial & Interactive Queries", url: "https://www.postgresqltutorial.com/", source: "PostgreSQL Tutorial" },
  "mongodb": { title: "MongoDB University Free Courses", url: "https://learn.mongodb.com/", source: "MongoDB University" },
  "redis": { title: "Redis University & Crash Course", url: "https://redis.io/learn", source: "Redis.io" },
  "docker": { title: "Docker Getting Started Guide", url: "https://docs.docker.com/get-started/", source: "Docker Official Docs" },
  "kubernetes": { title: "Kubernetes Interactive Tutorials", url: "https://kubernetes.io/docs/tutorials/", source: "Kubernetes Docs" },
  "aws": { title: "AWS Cloud Practitioner Free Essentials", url: "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/", source: "AWS Training" },
  "azure": { title: "Microsoft Azure Fundamentals (AZ-900)", url: "https://learn.microsoft.com/en-us/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/", source: "Microsoft Learn" },
  "gcp": { title: "Google Cloud Skills Boost Free Courses", url: "https://www.cloudskillsboost.google/", source: "Google Cloud" },
  "git": { title: "Pro Git Free eBook by Scott Chacon", url: "https://git-scm.com/book/en/v2", source: "Git SCM" },
  "ci/cd": { title: "GitHub Actions CI/CD Quickstart", url: "https://docs.github.com/en/actions/quickstart", source: "GitHub Docs" },
  "terraform": { title: "HashiCorp Terraform Tutorials", url: "https://developer.hashicorp.com/terraform/tutorials", source: "HashiCorp Developer" },
  "linux": { title: "Linux Journey: Grasshopper to Ninja", url: "https://linuxjourney.com/", source: "Linux Journey" },
  "jira": { title: "Jira Fundamentals by Atlassian", url: "https://university.atlassian.com/student/path/815443-jira-fundamentals", source: "Atlassian University" },
  "figma": { title: "Figma for Beginners Free Course", url: "https://help.figma.com/hc/en-us/articles/360040314193-Figma-for-beginners", source: "Figma Help Center" },
  "postman": { title: "Postman API Testing Academy", url: "https://academy.postman.com/", source: "Postman Academy" },
  "power bi": { title: "Microsoft Power BI Guided Learning", url: "https://learn.microsoft.com/en-us/power-bi/guided-learning/", source: "Microsoft Learn" },
  "tableau": { title: "Tableau Free Training Videos", url: "https://www.tableau.com/learn/training/2022-1", source: "Tableau Official" },
  "agile": { title: "Atlassian Agile Coach & Scrum Guide", url: "https://www.atlassian.com/agile", source: "Atlassian Agile" },
  "communication": { title: "Effective Engineering Communication Guide", url: "https://www.coursera.org/articles/communication-skills", source: "Career Guide" },
  "leadership": { title: "Engineering Leadership Fundamentals", url: "https://increment.com/teams/how-to-become-an-engineering-lead/", source: "Stripe Increment" }
};

/**
 * Pre-filled realistic sample data for quick 1-click demos
 */
const SAMPLE_PRESETS = {
  fullstack: {
    name: "Full Stack Engineer (High Match ~85%)",
    resume: `Alex Chen
San Francisco, CA | alex.chen@example.com | (415) 555-0199
Senior Full Stack Engineer with 6+ years of experience architecting high-scale web platforms.

SUMMARY
Versatile engineer specializing in React, Node.js, TypeScript, and AWS cloud architectures. Strong background in microservices, PostgreSQL databases, Docker containerization, and Agile team leadership.

PROFESSIONAL EXPERIENCE
Senior Software Engineer | TechScale Systems (2021 – Present)
• Architected core customer portal using React, Next.js, and TypeScript, serving 500K+ monthly active users.
• Developed REST and GraphQL backend services in Node.js and Express with PostgreSQL and Redis caching.
• Built automated CI/CD pipelines using GitHub Actions, Docker, and Kubernetes on AWS (EKS, S3, RDS).
• Mentored 4 junior engineers in clean code principles, test-driven development, and Agile Scrum workflows.
• Demonstrated strong problem solving and cross-functional leadership in reducing production latency by 42%.

Software Engineer | Innovatech Apps (2018 – 2021)
• Built responsive responsive front-end interfaces using JavaScript (ES6+), HTML5, CSS3, and Tailwind CSS.
• Maintained Python and Django microservices integrated with MySQL and MongoDB databases.
• Implemented automated testing suites with Jest and Postman, increasing coverage to 88%.
• Collaborated closely with product designers using Figma and Jira for sprint planning.

EDUCATION & SKILLS
B.S. in Computer Science | University of California, Berkeley (2018)
Skills: JavaScript, TypeScript, Python, React, Next.js, Node.js, Express, HTML, CSS, Tailwind, SQL, PostgreSQL, MongoDB, Redis, Docker, Kubernetes, AWS, Git, CI/CD, Linux, Jira, Figma, Agile, Communication, Problem Solving, Leadership.`,
    jd: `Senior Full Stack Developer
Location: Remote / San Francisco
Experience: 5+ years of software engineering experience

ABOUT THE ROLE
We are seeking an experienced Senior Full Stack Engineer to lead the design and development of our modern cloud application suite.

REQUIRED QUALIFICATIONS:
• 5+ years of hands-on experience with modern JavaScript / TypeScript web development.
• Strong proficiency in React, Node.js, and modern CSS/HTML frameworks.
• Solid background in database design with PostgreSQL or MySQL, plus Redis caching.
• Practical experience with Docker and AWS cloud services.
• Deep understanding of Git version control and CI/CD automation pipelines.
• Exceptional problem solving, teamwork, and communication skills within an Agile environment.

PREFERRED / NICE TO HAVE:
• Experience with Next.js or GraphQL.
• Familiarity with Kubernetes (k8s) and Terraform infrastructure as code.
• Knowledge of Python or Go for backend microservices.
• Experience mentoring junior developers and driving technical ownership.`
  },

  ml_engineer: {
    name: "Data Scientist / ML Engineer (Partial Match ~60%)",
    resume: `Priya Sharma
Data Scientist | priya.sharma@domain.io | +1 (650) 442-8821 | San Jose, CA

PROFESSIONAL SUMMARY
Data Scientist with 3+ years of experience in predictive modeling, exploratory data analysis, and statistical machine learning. Proficient in Python, Pandas, NumPy, Scikit-Learn, and SQL.

WORK EXPERIENCE
Data Scientist | DataVibe Analytics (2022 – Present)
• Built supervised machine learning models with Python, Scikit-Learn, and XGBoost for churn prediction.
• Performed extensive data analysis using Pandas, NumPy, and SQL queries on Snowflake and BigQuery.
• Created executive KPI dashboards in Tableau and Power BI to monitor business metrics.
• Collaborated in an Agile Scrum team with bi-weekly sprint deliverables.

Junior Data Analyst | RetailInsights (2020 – 2022)
• Extracted and cleaned multi-gigabyte datasets from MySQL using Python scripts and Excel macros.
• Visualized sales trends using Matplotlib, Seaborn, and Tableau for regional managers.
• Documented analytical findings and presented insights with strong communication skills.

EDUCATION & CORE COMPETENCIES
M.S. in Statistics | Stanford University
Skills: Python, SQL, Pandas, NumPy, Scikit-Learn, Machine Learning, Data Analysis, Tableau, Power BI, Excel, MySQL, Snowflake, Agile, Teamwork.`
    ,
    jd: `Lead Machine Learning & AI Engineer
Company: NeuralNext AI
Location: Hybrid

REQUIREMENTS:
• 4+ years of production experience in Machine Learning and Deep Learning systems.
• Advanced proficiency in Python, PyTorch, or TensorFlow.
• Hands-on expertise with NLP, Transformers, Hugging Face, and Large Language Models (LLMs).
• Solid understanding of MLOps pipelines using Docker, Kubernetes, and AWS or GCP.
• Proven track record of strong leadership, problem solving, and communication.

DESIRABLE / BONUS SKILLS:
• Experience with LangChain, GenAI, and Prompt Engineering.
• Familiarity with PySpark or Apache Spark big data processing.
• Contributions to open-source ML libraries.`
  },

  devops_cloud: {
    name: "DevOps & Cloud Engineer (Cross-role Comparison)",
    resume: `Marcus Vance
DevOps Specialist | marcus.vance@cloudops.net | (206) 555-8312 | Seattle, WA

EXPERIENCE SUMMARY
DevOps & Cloud Platform Engineer with 4 years of experience specializing in AWS, Docker, Kubernetes, and Terraform.

EXPERIENCE
Cloud Infrastructure Engineer | CloudBridge Corp (2021 – Present)
• Provisioned and maintained AWS infrastructure (VPC, EKS, RDS, IAM) using Terraform and Ansible.
• Designed and optimized Git-driven CI/CD pipelines in Jenkins and GitHub Actions.
• Configured Kubernetes clusters with Helm charts and monitored services via Prometheus and Grafana.
• Scripted automation tasks using Bash and Python for Linux system administration.
• Solved mission-critical infrastructure incidents with rapid problem solving.

SKILLS:
AWS, Docker, Kubernetes, Terraform, Linux, Bash, CI/CD, Git, Jenkins, Prometheus, Grafana, Python, Ansible, Agile, Communication.`
    ,
    jd: `Cloud Platform Engineer
REQUIRED SKILLS:
• 3+ years managing AWS or Azure cloud environments.
• Strong experience with Kubernetes, Docker, and container orchestration.
• Proven expertise with Terraform and Infrastructure as Code (IaC).
• Proficiency in Linux administration and Bash scripting.
• Strong teamwork and problem solving abilities.

PREFERRED / NICE TO HAVE:
• Experience with Prometheus and Grafana observability stacks.
• Exposure to Go (Golang) for internal tooling.
• Certifications in AWS (Solutions Architect).`
  }
};
