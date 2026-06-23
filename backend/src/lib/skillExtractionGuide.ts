import { TaxonomyCategory } from "./skillTaxonomy";

export interface SkillExtractionGuide {
    skill: string;
    evidence: {
        tools?: string[];
        certifications?: string[];
        actionVerbs?: string[];
        titles?: string[];
    };
    exactCriteria: string;
    partialCriteria: string;
    partialMatches?: string[];
    missingSignal: string;
}

export interface CategoryExtractionGuide {
    categoryId: string; // must match TaxonomyCategory.id in skillTaxonomy.ts
    skills: SkillExtractionGuide[];
}

export const EXTRACTION_GUIDE: CategoryExtractionGuide[] = [
    {
        "categoryId": "frontend_engineering",
        "skills": [
            {
                "skill": "JavaScript/TypeScript",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "frontend",
                        "front-end",
                        "react"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with JavaScript/TypeScript.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to JavaScript/TypeScript.",
                "missingSignal": "No mention of JavaScript/TypeScript or related concepts in the CV."
            },
            {
                "skill": "React/Vue/Angular",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "frontend",
                        "front-end",
                        "react"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with React/Vue/Angular.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to React/Vue/Angular.",
                "missingSignal": "No mention of React/Vue/Angular or related concepts in the CV."
            },
            {
                "skill": "HTML5 & CSS3",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "frontend",
                        "front-end",
                        "react"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with HTML5 & CSS3.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to HTML5 & CSS3.",
                "missingSignal": "No mention of HTML5 & CSS3 or related concepts in the CV."
            },
            {
                "skill": "Responsive Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "frontend",
                        "front-end",
                        "react"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Responsive Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Responsive Design.",
                "missingSignal": "No mention of Responsive Design or related concepts in the CV."
            },
            {
                "skill": "State Management (Redux/Zustand)",
                "evidence": {
                    "tools": [
                        "Redux",
                        "Zustand"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "frontend",
                        "front-end",
                        "react"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with State Management (Redux/Zustand).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to State Management (Redux/Zustand).",
                "missingSignal": "No mention of State Management (Redux/Zustand) or related concepts in the CV."
            },
            {
                "skill": "Web Performance Optimization",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "frontend",
                        "front-end",
                        "react"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Web Performance Optimization.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Web Performance Optimization.",
                "missingSignal": "No mention of Web Performance Optimization or related concepts in the CV."
            },
            {
                "skill": "Accessibility (WCAG)",
                "evidence": {
                    "tools": [
                        "WCAG"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "frontend",
                        "front-end",
                        "react"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Accessibility (WCAG).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Accessibility (WCAG).",
                "missingSignal": "No mention of Accessibility (WCAG) or related concepts in the CV."
            },
            {
                "skill": "REST/GraphQL Integration",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "frontend",
                        "front-end",
                        "react"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with REST/GraphQL Integration.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to REST/GraphQL Integration.",
                "missingSignal": "No mention of REST/GraphQL Integration or related concepts in the CV."
            },
            {
                "skill": "Component Architecture",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "frontend",
                        "front-end",
                        "react"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Component Architecture.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Component Architecture.",
                "missingSignal": "No mention of Component Architecture or related concepts in the CV."
            },
            {
                "skill": "Browser DevTools Debugging",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "frontend",
                        "front-end",
                        "react"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Browser DevTools Debugging.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Browser DevTools Debugging.",
                "missingSignal": "No mention of Browser DevTools Debugging or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "backend_api_engineering",
        "skills": [
            {
                "skill": "Server-Side Languages (Node/Python/Java/Go)",
                "evidence": {
                    "tools": [
                        "Node",
                        "Python",
                        "Java",
                        "Go"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "backend",
                        "back-end",
                        "api"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Server-Side Languages (Node/Python/Java/Go).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Server-Side Languages (Node/Python/Java/Go).",
                "missingSignal": "No mention of Server-Side Languages (Node/Python/Java/Go) or related concepts in the CV."
            },
            {
                "skill": "REST/GraphQL API Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "backend",
                        "back-end",
                        "api"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with REST/GraphQL API Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to REST/GraphQL API Design.",
                "missingSignal": "No mention of REST/GraphQL API Design or related concepts in the CV."
            },
            {
                "skill": "Database Design & ORM",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "backend",
                        "back-end",
                        "api"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Database Design & ORM.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Database Design & ORM.",
                "missingSignal": "No mention of Database Design & ORM or related concepts in the CV."
            },
            {
                "skill": "Authentication & Authorization",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "backend",
                        "back-end",
                        "api"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Authentication & Authorization.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Authentication & Authorization.",
                "missingSignal": "No mention of Authentication & Authorization or related concepts in the CV."
            },
            {
                "skill": "Microservices Architecture",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "backend",
                        "back-end",
                        "api"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Microservices Architecture.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Microservices Architecture.",
                "missingSignal": "No mention of Microservices Architecture or related concepts in the CV."
            },
            {
                "skill": "Caching Strategies (Redis)",
                "evidence": {
                    "tools": [
                        "Redis"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "backend",
                        "back-end",
                        "api"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Caching Strategies (Redis).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Caching Strategies (Redis).",
                "missingSignal": "No mention of Caching Strategies (Redis) or related concepts in the CV."
            },
            {
                "skill": "Message Queues (Kafka/RabbitMQ)",
                "evidence": {
                    "tools": [
                        "Kafka",
                        "RabbitMQ"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "backend",
                        "back-end",
                        "api"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Message Queues (Kafka/RabbitMQ).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Message Queues (Kafka/RabbitMQ).",
                "missingSignal": "No mention of Message Queues (Kafka/RabbitMQ) or related concepts in the CV."
            },
            {
                "skill": "API Security",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "backend",
                        "back-end",
                        "api"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with API Security.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to API Security.",
                "missingSignal": "No mention of API Security or related concepts in the CV."
            },
            {
                "skill": "Unit & Integration Testing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "backend",
                        "back-end",
                        "api"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Unit & Integration Testing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Unit & Integration Testing.",
                "missingSignal": "No mention of Unit & Integration Testing or related concepts in the CV."
            },
            {
                "skill": "System Scalability",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "backend",
                        "back-end",
                        "api"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with System Scalability.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to System Scalability.",
                "missingSignal": "No mention of System Scalability or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "full_stack_development",
        "skills": [
            {
                "skill": "Frontend Frameworks (React/Vue)",
                "evidence": {
                    "tools": [
                        "React",
                        "Vue"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "full stack",
                        "full-stack",
                        "fullstack developer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Frontend Frameworks (React/Vue).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Frontend Frameworks (React/Vue).",
                "missingSignal": "No mention of Frontend Frameworks (React/Vue) or related concepts in the CV."
            },
            {
                "skill": "Backend Frameworks (Node/Express/Django)",
                "evidence": {
                    "tools": [
                        "Node",
                        "Express",
                        "Django"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "full stack",
                        "full-stack",
                        "fullstack developer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Backend Frameworks (Node/Express/Django).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Backend Frameworks (Node/Express/Django).",
                "missingSignal": "No mention of Backend Frameworks (Node/Express/Django) or related concepts in the CV."
            },
            {
                "skill": "Database Management (SQL/NoSQL)",
                "evidence": {
                    "tools": [
                        "SQL",
                        "NoSQL"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "full stack",
                        "full-stack",
                        "fullstack developer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Database Management (SQL/NoSQL).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Database Management (SQL/NoSQL).",
                "missingSignal": "No mention of Database Management (SQL/NoSQL) or related concepts in the CV."
            },
            {
                "skill": "API Design & Integration",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "full stack",
                        "full-stack",
                        "fullstack developer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with API Design & Integration.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to API Design & Integration.",
                "missingSignal": "No mention of API Design & Integration or related concepts in the CV."
            },
            {
                "skill": "Version Control (Git)",
                "evidence": {
                    "tools": [
                        "Git"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "full stack",
                        "full-stack",
                        "fullstack developer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Version Control (Git).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Version Control (Git).",
                "missingSignal": "No mention of Version Control (Git) or related concepts in the CV."
            },
            {
                "skill": "CI/CD Pipelines",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "full stack",
                        "full-stack",
                        "fullstack developer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with CI/CD Pipelines.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to CI/CD Pipelines.",
                "missingSignal": "No mention of CI/CD Pipelines or related concepts in the CV."
            },
            {
                "skill": "Cloud Deployment",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "full stack",
                        "full-stack",
                        "fullstack developer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Cloud Deployment.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Cloud Deployment.",
                "missingSignal": "No mention of Cloud Deployment or related concepts in the CV."
            },
            {
                "skill": "Authentication Systems",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "full stack",
                        "full-stack",
                        "fullstack developer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Authentication Systems.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Authentication Systems.",
                "missingSignal": "No mention of Authentication Systems or related concepts in the CV."
            },
            {
                "skill": "Testing (Unit/E2E)",
                "evidence": {
                    "tools": [
                        "Unit",
                        "E2E"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "full stack",
                        "full-stack",
                        "fullstack developer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Testing (Unit/E2E).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Testing (Unit/E2E).",
                "missingSignal": "No mention of Testing (Unit/E2E) or related concepts in the CV."
            },
            {
                "skill": "Architecture Decisions",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "full stack",
                        "full-stack",
                        "fullstack developer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Architecture Decisions.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Architecture Decisions.",
                "missingSignal": "No mention of Architecture Decisions or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "mobile_app_development",
        "skills": [
            {
                "skill": "Swift/Kotlin/Java",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "ios",
                        "android",
                        "swift"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Swift/Kotlin/Java.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Swift/Kotlin/Java.",
                "missingSignal": "No mention of Swift/Kotlin/Java or related concepts in the CV."
            },
            {
                "skill": "React Native/Flutter",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "ios",
                        "android",
                        "swift"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with React Native/Flutter.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to React Native/Flutter.",
                "missingSignal": "No mention of React Native/Flutter or related concepts in the CV."
            },
            {
                "skill": "Mobile UI/UX Guidelines",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "ios",
                        "android",
                        "swift"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Mobile UI/UX Guidelines.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Mobile UI/UX Guidelines.",
                "missingSignal": "No mention of Mobile UI/UX Guidelines or related concepts in the CV."
            },
            {
                "skill": "App Store/Play Store Deployment",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "ios",
                        "android",
                        "swift"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with App Store/Play Store Deployment.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to App Store/Play Store Deployment.",
                "missingSignal": "No mention of App Store/Play Store Deployment or related concepts in the CV."
            },
            {
                "skill": "Push Notifications",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "ios",
                        "android",
                        "swift"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Push Notifications.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Push Notifications.",
                "missingSignal": "No mention of Push Notifications or related concepts in the CV."
            },
            {
                "skill": "Offline Data Sync",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "ios",
                        "android",
                        "swift"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Offline Data Sync.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Offline Data Sync.",
                "missingSignal": "No mention of Offline Data Sync or related concepts in the CV."
            },
            {
                "skill": "Mobile Performance Tuning",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "ios",
                        "android",
                        "swift"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Mobile Performance Tuning.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Mobile Performance Tuning.",
                "missingSignal": "No mention of Mobile Performance Tuning or related concepts in the CV."
            },
            {
                "skill": "Native API Integration",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "ios",
                        "android",
                        "swift"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Native API Integration.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Native API Integration.",
                "missingSignal": "No mention of Native API Integration or related concepts in the CV."
            },
            {
                "skill": "Crash Reporting & Analytics",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "ios",
                        "android",
                        "swift"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Crash Reporting & Analytics.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Crash Reporting & Analytics.",
                "missingSignal": "No mention of Crash Reporting & Analytics or related concepts in the CV."
            },
            {
                "skill": "Cross-Platform Architecture",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "ios",
                        "android",
                        "swift"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Cross-Platform Architecture.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Cross-Platform Architecture.",
                "missingSignal": "No mention of Cross-Platform Architecture or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "devops_sre",
        "skills": [
            {
                "skill": "CI/CD Pipeline Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "devops",
                        "sre",
                        "site reliability"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with CI/CD Pipeline Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to CI/CD Pipeline Design.",
                "missingSignal": "No mention of CI/CD Pipeline Design or related concepts in the CV."
            },
            {
                "skill": "Docker & Kubernetes",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "devops",
                        "sre",
                        "site reliability"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Docker & Kubernetes.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Docker & Kubernetes.",
                "missingSignal": "No mention of Docker & Kubernetes or related concepts in the CV."
            },
            {
                "skill": "Infrastructure as Code (Terraform)",
                "evidence": {
                    "tools": [
                        "Terraform"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "devops",
                        "sre",
                        "site reliability"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Infrastructure as Code (Terraform).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Infrastructure as Code (Terraform).",
                "missingSignal": "No mention of Infrastructure as Code (Terraform) or related concepts in the CV."
            },
            {
                "skill": "Monitoring & Observability (Prometheus/Grafana)",
                "evidence": {
                    "tools": [
                        "Prometheus",
                        "Grafana"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "devops",
                        "sre",
                        "site reliability"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Monitoring & Observability (Prometheus/Grafana).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Monitoring & Observability (Prometheus/Grafana).",
                "missingSignal": "No mention of Monitoring & Observability (Prometheus/Grafana) or related concepts in the CV."
            },
            {
                "skill": "Incident Response & On-Call",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "devops",
                        "sre",
                        "site reliability"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Incident Response & On-Call.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Incident Response & On-Call.",
                "missingSignal": "No mention of Incident Response & On-Call or related concepts in the CV."
            },
            {
                "skill": "Cloud Platforms (AWS/GCP/Azure)",
                "evidence": {
                    "tools": [
                        "AWS",
                        "GCP",
                        "Azure"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "devops",
                        "sre",
                        "site reliability"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Cloud Platforms (AWS/GCP/Azure).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Cloud Platforms (AWS/GCP/Azure).",
                "missingSignal": "No mention of Cloud Platforms (AWS/GCP/Azure) or related concepts in the CV."
            },
            {
                "skill": "Configuration Management (Ansible)",
                "evidence": {
                    "tools": [
                        "Ansible"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "devops",
                        "sre",
                        "site reliability"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Configuration Management (Ansible).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Configuration Management (Ansible).",
                "missingSignal": "No mention of Configuration Management (Ansible) or related concepts in the CV."
            },
            {
                "skill": "Scripting (Bash/Python)",
                "evidence": {
                    "tools": [
                        "Bash",
                        "Python"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "devops",
                        "sre",
                        "site reliability"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Scripting (Bash/Python).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Scripting (Bash/Python).",
                "missingSignal": "No mention of Scripting (Bash/Python) or related concepts in the CV."
            },
            {
                "skill": "SLA/SLO Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "devops",
                        "sre",
                        "site reliability"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with SLA/SLO Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to SLA/SLO Management.",
                "missingSignal": "No mention of SLA/SLO Management or related concepts in the CV."
            },
            {
                "skill": "Disaster Recovery Planning",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "devops",
                        "sre",
                        "site reliability"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Disaster Recovery Planning.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Disaster Recovery Planning.",
                "missingSignal": "No mention of Disaster Recovery Planning or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "cloud_architecture",
        "skills": [
            {
                "skill": "AWS/Azure/GCP Core Services",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "cloud architect",
                        "aws",
                        "azure"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with AWS/Azure/GCP Core Services.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to AWS/Azure/GCP Core Services.",
                "missingSignal": "No mention of AWS/Azure/GCP Core Services or related concepts in the CV."
            },
            {
                "skill": "Cloud Network Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "cloud architect",
                        "aws",
                        "azure"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Cloud Network Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Cloud Network Design.",
                "missingSignal": "No mention of Cloud Network Design or related concepts in the CV."
            },
            {
                "skill": "Cost Optimization (FinOps)",
                "evidence": {
                    "tools": [
                        "FinOps"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "cloud architect",
                        "aws",
                        "azure"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Cost Optimization (FinOps).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Cost Optimization (FinOps).",
                "missingSignal": "No mention of Cost Optimization (FinOps) or related concepts in the CV."
            },
            {
                "skill": "Multi-Cloud/Hybrid Architecture",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "cloud architect",
                        "aws",
                        "azure"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Multi-Cloud/Hybrid Architecture.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Multi-Cloud/Hybrid Architecture.",
                "missingSignal": "No mention of Multi-Cloud/Hybrid Architecture or related concepts in the CV."
            },
            {
                "skill": "Identity & Access Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "cloud architect",
                        "aws",
                        "azure"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Identity & Access Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Identity & Access Management.",
                "missingSignal": "No mention of Identity & Access Management or related concepts in the CV."
            },
            {
                "skill": "Serverless Architecture",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "cloud architect",
                        "aws",
                        "azure"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Serverless Architecture.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Serverless Architecture.",
                "missingSignal": "No mention of Serverless Architecture or related concepts in the CV."
            },
            {
                "skill": "Infrastructure as Code",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "cloud architect",
                        "aws",
                        "azure"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Infrastructure as Code.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Infrastructure as Code.",
                "missingSignal": "No mention of Infrastructure as Code or related concepts in the CV."
            },
            {
                "skill": "High Availability Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "cloud architect",
                        "aws",
                        "azure"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with High Availability Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to High Availability Design.",
                "missingSignal": "No mention of High Availability Design or related concepts in the CV."
            },
            {
                "skill": "Cloud Security Best Practices",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "cloud architect",
                        "aws",
                        "azure"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Cloud Security Best Practices.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Cloud Security Best Practices.",
                "missingSignal": "No mention of Cloud Security Best Practices or related concepts in the CV."
            },
            {
                "skill": "Migration Planning",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "cloud architect",
                        "aws",
                        "azure"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Migration Planning.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Migration Planning.",
                "missingSignal": "No mention of Migration Planning or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "cyber_security",
        "skills": [
            {
                "skill": "Threat Detection & Analysis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "cyber security",
                        "infosec",
                        "security analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Threat Detection & Analysis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Threat Detection & Analysis.",
                "missingSignal": "No mention of Threat Detection & Analysis or related concepts in the CV."
            },
            {
                "skill": "Penetration Testing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "cyber security",
                        "infosec",
                        "security analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Penetration Testing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Penetration Testing.",
                "missingSignal": "No mention of Penetration Testing or related concepts in the CV."
            },
            {
                "skill": "SIEM Tools (Splunk/Sentinel)",
                "evidence": {
                    "tools": [
                        "Splunk",
                        "Sentinel"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "cyber security",
                        "infosec",
                        "security analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with SIEM Tools (Splunk/Sentinel).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to SIEM Tools (Splunk/Sentinel).",
                "missingSignal": "No mention of SIEM Tools (Splunk/Sentinel) or related concepts in the CV."
            },
            {
                "skill": "Vulnerability Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "cyber security",
                        "infosec",
                        "security analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Vulnerability Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Vulnerability Management.",
                "missingSignal": "No mention of Vulnerability Management or related concepts in the CV."
            },
            {
                "skill": "Network Security",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "cyber security",
                        "infosec",
                        "security analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Network Security.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Network Security.",
                "missingSignal": "No mention of Network Security or related concepts in the CV."
            },
            {
                "skill": "Incident Response",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "cyber security",
                        "infosec",
                        "security analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Incident Response.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Incident Response.",
                "missingSignal": "No mention of Incident Response or related concepts in the CV."
            },
            {
                "skill": "Security Compliance (ISO 27001/SOC2)",
                "evidence": {
                    "tools": [
                        "ISO 27001",
                        "SOC2"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "cyber security",
                        "infosec",
                        "security analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Security Compliance (ISO 27001/SOC2).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Security Compliance (ISO 27001/SOC2).",
                "missingSignal": "No mention of Security Compliance (ISO 27001/SOC2) or related concepts in the CV."
            },
            {
                "skill": "Identity & Access Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "cyber security",
                        "infosec",
                        "security analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Identity & Access Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Identity & Access Management.",
                "missingSignal": "No mention of Identity & Access Management or related concepts in the CV."
            },
            {
                "skill": "Cryptography Fundamentals",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "cyber security",
                        "infosec",
                        "security analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Cryptography Fundamentals.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Cryptography Fundamentals.",
                "missingSignal": "No mention of Cryptography Fundamentals or related concepts in the CV."
            },
            {
                "skill": "Risk Assessment",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "cyber security",
                        "infosec",
                        "security analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Risk Assessment.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Risk Assessment.",
                "missingSignal": "No mention of Risk Assessment or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "qa_automation_testing",
        "skills": [
            {
                "skill": "Test Case Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "qa engineer",
                        "test engineer",
                        "automation tester"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Test Case Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Test Case Design.",
                "missingSignal": "No mention of Test Case Design or related concepts in the CV."
            },
            {
                "skill": "Automated Testing Frameworks (Selenium/Cypress)",
                "evidence": {
                    "tools": [
                        "Selenium",
                        "Cypress"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "qa engineer",
                        "test engineer",
                        "automation tester"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Automated Testing Frameworks (Selenium/Cypress).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Automated Testing Frameworks (Selenium/Cypress).",
                "missingSignal": "No mention of Automated Testing Frameworks (Selenium/Cypress) or related concepts in the CV."
            },
            {
                "skill": "API Testing (Postman)",
                "evidence": {
                    "tools": [
                        "Postman"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "qa engineer",
                        "test engineer",
                        "automation tester"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with API Testing (Postman).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to API Testing (Postman).",
                "missingSignal": "No mention of API Testing (Postman) or related concepts in the CV."
            },
            {
                "skill": "Regression Testing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "qa engineer",
                        "test engineer",
                        "automation tester"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Regression Testing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Regression Testing.",
                "missingSignal": "No mention of Regression Testing or related concepts in the CV."
            },
            {
                "skill": "Performance/Load Testing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "qa engineer",
                        "test engineer",
                        "automation tester"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Performance/Load Testing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Performance/Load Testing.",
                "missingSignal": "No mention of Performance/Load Testing or related concepts in the CV."
            },
            {
                "skill": "Bug Tracking & Reporting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "qa engineer",
                        "test engineer",
                        "automation tester"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Bug Tracking & Reporting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Bug Tracking & Reporting.",
                "missingSignal": "No mention of Bug Tracking & Reporting or related concepts in the CV."
            },
            {
                "skill": "CI/CD Test Integration",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "qa engineer",
                        "test engineer",
                        "automation tester"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with CI/CD Test Integration.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to CI/CD Test Integration.",
                "missingSignal": "No mention of CI/CD Test Integration or related concepts in the CV."
            },
            {
                "skill": "Manual & Exploratory Testing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "qa engineer",
                        "test engineer",
                        "automation tester"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Manual & Exploratory Testing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Manual & Exploratory Testing.",
                "missingSignal": "No mention of Manual & Exploratory Testing or related concepts in the CV."
            },
            {
                "skill": "Test Plan Documentation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "qa engineer",
                        "test engineer",
                        "automation tester"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Test Plan Documentation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Test Plan Documentation.",
                "missingSignal": "No mention of Test Plan Documentation or related concepts in the CV."
            },
            {
                "skill": "Cross-Browser/Device Testing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "qa engineer",
                        "test engineer",
                        "automation tester"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Cross-Browser/Device Testing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Cross-Browser/Device Testing.",
                "missingSignal": "No mention of Cross-Browser/Device Testing or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "database_administration",
        "skills": [
            {
                "skill": "SQL & Query Optimization",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "dba",
                        "database administrator",
                        "sql server admin"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with SQL & Query Optimization.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to SQL & Query Optimization.",
                "missingSignal": "No mention of SQL & Query Optimization or related concepts in the CV."
            },
            {
                "skill": "Database Backup & Recovery",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "dba",
                        "database administrator",
                        "sql server admin"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Database Backup & Recovery.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Database Backup & Recovery.",
                "missingSignal": "No mention of Database Backup & Recovery or related concepts in the CV."
            },
            {
                "skill": "Replication & Clustering",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "dba",
                        "database administrator",
                        "sql server admin"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Replication & Clustering.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Replication & Clustering.",
                "missingSignal": "No mention of Replication & Clustering or related concepts in the CV."
            },
            {
                "skill": "Performance Tuning",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "dba",
                        "database administrator",
                        "sql server admin"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Performance Tuning.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Performance Tuning.",
                "missingSignal": "No mention of Performance Tuning or related concepts in the CV."
            },
            {
                "skill": "Database Security",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "dba",
                        "database administrator",
                        "sql server admin"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Database Security.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Database Security.",
                "missingSignal": "No mention of Database Security or related concepts in the CV."
            },
            {
                "skill": "PostgreSQL/MySQL/Oracle Administration",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "dba",
                        "database administrator",
                        "sql server admin"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with PostgreSQL/MySQL/Oracle Administration.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to PostgreSQL/MySQL/Oracle Administration.",
                "missingSignal": "No mention of PostgreSQL/MySQL/Oracle Administration or related concepts in the CV."
            },
            {
                "skill": "Capacity Planning",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "dba",
                        "database administrator",
                        "sql server admin"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Capacity Planning.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Capacity Planning.",
                "missingSignal": "No mention of Capacity Planning or related concepts in the CV."
            },
            {
                "skill": "High Availability Setup",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "dba",
                        "database administrator",
                        "sql server admin"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with High Availability Setup.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to High Availability Setup.",
                "missingSignal": "No mention of High Availability Setup or related concepts in the CV."
            },
            {
                "skill": "Data Migration",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "dba",
                        "database administrator",
                        "sql server admin"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Data Migration.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Data Migration.",
                "missingSignal": "No mention of Data Migration or related concepts in the CV."
            },
            {
                "skill": "Monitoring & Alerting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "dba",
                        "database administrator",
                        "sql server admin"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Monitoring & Alerting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Monitoring & Alerting.",
                "missingSignal": "No mention of Monitoring & Alerting or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "it_support_helpdesk",
        "skills": [
            {
                "skill": "Troubleshooting (Hardware/Software)",
                "evidence": {
                    "tools": [
                        "Hardware",
                        "Software"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "it support",
                        "helpdesk",
                        "desktop support"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Troubleshooting (Hardware/Software).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Troubleshooting (Hardware/Software).",
                "missingSignal": "No mention of Troubleshooting (Hardware/Software) or related concepts in the CV."
            },
            {
                "skill": "Ticketing Systems (Zendesk/ServiceNow)",
                "evidence": {
                    "tools": [
                        "Zendesk",
                        "ServiceNow"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "it support",
                        "helpdesk",
                        "desktop support"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Ticketing Systems (Zendesk/ServiceNow).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Ticketing Systems (Zendesk/ServiceNow).",
                "missingSignal": "No mention of Ticketing Systems (Zendesk/ServiceNow) or related concepts in the CV."
            },
            {
                "skill": "Active Directory Administration",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "it support",
                        "helpdesk",
                        "desktop support"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Active Directory Administration.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Active Directory Administration.",
                "missingSignal": "No mention of Active Directory Administration or related concepts in the CV."
            },
            {
                "skill": "Remote Support Tools",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "it support",
                        "helpdesk",
                        "desktop support"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Remote Support Tools.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Remote Support Tools.",
                "missingSignal": "No mention of Remote Support Tools or related concepts in the CV."
            },
            {
                "skill": "Operating Systems (Windows/macOS/Linux)",
                "evidence": {
                    "tools": [
                        "Windows",
                        "macOS",
                        "Linux"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "it support",
                        "helpdesk",
                        "desktop support"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Operating Systems (Windows/macOS/Linux).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Operating Systems (Windows/macOS/Linux).",
                "missingSignal": "No mention of Operating Systems (Windows/macOS/Linux) or related concepts in the CV."
            },
            {
                "skill": "Network Basics",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "it support",
                        "helpdesk",
                        "desktop support"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Network Basics.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Network Basics.",
                "missingSignal": "No mention of Network Basics or related concepts in the CV."
            },
            {
                "skill": "Customer Service",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "it support",
                        "helpdesk",
                        "desktop support"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Customer Service.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Customer Service.",
                "missingSignal": "No mention of Customer Service or related concepts in the CV."
            },
            {
                "skill": "Asset Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "it support",
                        "helpdesk",
                        "desktop support"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Asset Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Asset Management.",
                "missingSignal": "No mention of Asset Management or related concepts in the CV."
            },
            {
                "skill": "Basic Scripting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "it support",
                        "helpdesk",
                        "desktop support"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Basic Scripting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Basic Scripting.",
                "missingSignal": "No mention of Basic Scripting or related concepts in the CV."
            },
            {
                "skill": "SLA Compliance",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "it support",
                        "helpdesk",
                        "desktop support"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with SLA Compliance.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to SLA Compliance.",
                "missingSignal": "No mention of SLA Compliance or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "network_engineering",
        "skills": [
            {
                "skill": "Routing & Switching (Cisco/Juniper)",
                "evidence": {
                    "tools": [
                        "Cisco",
                        "Juniper"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "network engineer",
                        "network administrator",
                        "ccna"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Routing & Switching (Cisco/Juniper).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Routing & Switching (Cisco/Juniper).",
                "missingSignal": "No mention of Routing & Switching (Cisco/Juniper) or related concepts in the CV."
            },
            {
                "skill": "TCP/IP & Subnetting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "network engineer",
                        "network administrator",
                        "ccna"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with TCP/IP & Subnetting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to TCP/IP & Subnetting.",
                "missingSignal": "No mention of TCP/IP & Subnetting or related concepts in the CV."
            },
            {
                "skill": "Firewall Configuration",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "network engineer",
                        "network administrator",
                        "ccna"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Firewall Configuration.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Firewall Configuration.",
                "missingSignal": "No mention of Firewall Configuration or related concepts in the CV."
            },
            {
                "skill": "VPN Setup & Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "network engineer",
                        "network administrator",
                        "ccna"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with VPN Setup & Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to VPN Setup & Management.",
                "missingSignal": "No mention of VPN Setup & Management or related concepts in the CV."
            },
            {
                "skill": "Network Monitoring Tools",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "network engineer",
                        "network administrator",
                        "ccna"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Network Monitoring Tools.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Network Monitoring Tools.",
                "missingSignal": "No mention of Network Monitoring Tools or related concepts in the CV."
            },
            {
                "skill": "Wireless Network Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "network engineer",
                        "network administrator",
                        "ccna"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Wireless Network Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Wireless Network Design.",
                "missingSignal": "No mention of Wireless Network Design or related concepts in the CV."
            },
            {
                "skill": "Network Security",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "network engineer",
                        "network administrator",
                        "ccna"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Network Security.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Network Security.",
                "missingSignal": "No mention of Network Security or related concepts in the CV."
            },
            {
                "skill": "Load Balancing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "network engineer",
                        "network administrator",
                        "ccna"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Load Balancing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Load Balancing.",
                "missingSignal": "No mention of Load Balancing or related concepts in the CV."
            },
            {
                "skill": "SD-WAN",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "network engineer",
                        "network administrator",
                        "ccna"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with SD-WAN.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to SD-WAN.",
                "missingSignal": "No mention of SD-WAN or related concepts in the CV."
            },
            {
                "skill": "Network Troubleshooting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "network engineer",
                        "network administrator",
                        "ccna"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Network Troubleshooting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Network Troubleshooting.",
                "missingSignal": "No mention of Network Troubleshooting or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "data_science_ml",
        "skills": [
            {
                "skill": "Python/R for Data Science",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "data scientist",
                        "machine learning engineer",
                        "ml engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Python/R for Data Science.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Python/R for Data Science.",
                "missingSignal": "No mention of Python/R for Data Science or related concepts in the CV."
            },
            {
                "skill": "Machine Learning Algorithms",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "data scientist",
                        "machine learning engineer",
                        "ml engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Machine Learning Algorithms.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Machine Learning Algorithms.",
                "missingSignal": "No mention of Machine Learning Algorithms or related concepts in the CV."
            },
            {
                "skill": "Statistical Modeling",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "data scientist",
                        "machine learning engineer",
                        "ml engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Statistical Modeling.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Statistical Modeling.",
                "missingSignal": "No mention of Statistical Modeling or related concepts in the CV."
            },
            {
                "skill": "Feature Engineering",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "data scientist",
                        "machine learning engineer",
                        "ml engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Feature Engineering.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Feature Engineering.",
                "missingSignal": "No mention of Feature Engineering or related concepts in the CV."
            },
            {
                "skill": "Model Evaluation & Validation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "data scientist",
                        "machine learning engineer",
                        "ml engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Model Evaluation & Validation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Model Evaluation & Validation.",
                "missingSignal": "No mention of Model Evaluation & Validation or related concepts in the CV."
            },
            {
                "skill": "scikit-learn/TensorFlow/PyTorch",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "data scientist",
                        "machine learning engineer",
                        "ml engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with scikit-learn/TensorFlow/PyTorch.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to scikit-learn/TensorFlow/PyTorch.",
                "missingSignal": "No mention of scikit-learn/TensorFlow/PyTorch or related concepts in the CV."
            },
            {
                "skill": "Data Visualization",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "data scientist",
                        "machine learning engineer",
                        "ml engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Data Visualization.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Data Visualization.",
                "missingSignal": "No mention of Data Visualization or related concepts in the CV."
            },
            {
                "skill": "A/B Testing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "data scientist",
                        "machine learning engineer",
                        "ml engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with A/B Testing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to A/B Testing.",
                "missingSignal": "No mention of A/B Testing or related concepts in the CV."
            },
            {
                "skill": "SQL for Data Analysis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "data scientist",
                        "machine learning engineer",
                        "ml engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with SQL for Data Analysis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to SQL for Data Analysis.",
                "missingSignal": "No mention of SQL for Data Analysis or related concepts in the CV."
            },
            {
                "skill": "MLOps Fundamentals",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "data scientist",
                        "machine learning engineer",
                        "ml engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with MLOps Fundamentals.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to MLOps Fundamentals.",
                "missingSignal": "No mention of MLOps Fundamentals or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "ai_engineering_llm",
        "skills": [
            {
                "skill": "LLM Integration (OpenAI/Anthropic/Groq)",
                "evidence": {
                    "tools": [
                        "OpenAI",
                        "Anthropic",
                        "Groq"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "ai engineer",
                        "llm",
                        "genai"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with LLM Integration (OpenAI/Anthropic/Groq).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to LLM Integration (OpenAI/Anthropic/Groq).",
                "missingSignal": "No mention of LLM Integration (OpenAI/Anthropic/Groq) or related concepts in the CV."
            },
            {
                "skill": "Prompt Engineering",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "ai engineer",
                        "llm",
                        "genai"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Prompt Engineering.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Prompt Engineering.",
                "missingSignal": "No mention of Prompt Engineering or related concepts in the CV."
            },
            {
                "skill": "Retrieval-Augmented Generation (RAG)",
                "evidence": {
                    "tools": [
                        "RAG"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "ai engineer",
                        "llm",
                        "genai"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Retrieval-Augmented Generation (RAG).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Retrieval-Augmented Generation (RAG).",
                "missingSignal": "No mention of Retrieval-Augmented Generation (RAG) or related concepts in the CV."
            },
            {
                "skill": "Vector Databases (pgvector/Pinecone)",
                "evidence": {
                    "tools": [
                        "pgvector",
                        "Pinecone"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "ai engineer",
                        "llm",
                        "genai"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Vector Databases (pgvector/Pinecone).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Vector Databases (pgvector/Pinecone).",
                "missingSignal": "No mention of Vector Databases (pgvector/Pinecone) or related concepts in the CV."
            },
            {
                "skill": "Fine-Tuning & Embeddings",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "ai engineer",
                        "llm",
                        "genai"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Fine-Tuning & Embeddings.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Fine-Tuning & Embeddings.",
                "missingSignal": "No mention of Fine-Tuning & Embeddings or related concepts in the CV."
            },
            {
                "skill": "AI Agent Orchestration",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "ai engineer",
                        "llm",
                        "genai"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with AI Agent Orchestration.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to AI Agent Orchestration.",
                "missingSignal": "No mention of AI Agent Orchestration or related concepts in the CV."
            },
            {
                "skill": "Token/Cost Optimization",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "ai engineer",
                        "llm",
                        "genai"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Token/Cost Optimization.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Token/Cost Optimization.",
                "missingSignal": "No mention of Token/Cost Optimization or related concepts in the CV."
            },
            {
                "skill": "Model Evaluation & Guardrails",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "ai engineer",
                        "llm",
                        "genai"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Model Evaluation & Guardrails.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Model Evaluation & Guardrails.",
                "missingSignal": "No mention of Model Evaluation & Guardrails or related concepts in the CV."
            },
            {
                "skill": "Python (LangChain/Vercel AI SDK)",
                "evidence": {
                    "tools": [
                        "LangChain",
                        "Vercel AI SDK"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "ai engineer",
                        "llm",
                        "genai"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Python (LangChain/Vercel AI SDK).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Python (LangChain/Vercel AI SDK).",
                "missingSignal": "No mention of Python (LangChain/Vercel AI SDK) or related concepts in the CV."
            },
            {
                "skill": "AI Safety & Hallucination Mitigation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "ai engineer",
                        "llm",
                        "genai"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with AI Safety & Hallucination Mitigation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to AI Safety & Hallucination Mitigation.",
                "missingSignal": "No mention of AI Safety & Hallucination Mitigation or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "data_engineering_pipelines",
        "skills": [
            {
                "skill": "ETL/ELT Pipeline Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "data engineer",
                        "etl",
                        "data pipeline"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with ETL/ELT Pipeline Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to ETL/ELT Pipeline Design.",
                "missingSignal": "No mention of ETL/ELT Pipeline Design or related concepts in the CV."
            },
            {
                "skill": "Apache Spark/Airflow",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "data engineer",
                        "etl",
                        "data pipeline"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Apache Spark/Airflow.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Apache Spark/Airflow.",
                "missingSignal": "No mention of Apache Spark/Airflow or related concepts in the CV."
            },
            {
                "skill": "Data Warehousing (Snowflake/BigQuery)",
                "evidence": {
                    "tools": [
                        "Snowflake",
                        "BigQuery"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "data engineer",
                        "etl",
                        "data pipeline"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Data Warehousing (Snowflake/BigQuery).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Data Warehousing (Snowflake/BigQuery).",
                "missingSignal": "No mention of Data Warehousing (Snowflake/BigQuery) or related concepts in the CV."
            },
            {
                "skill": "SQL & Query Optimization",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "data engineer",
                        "etl",
                        "data pipeline"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with SQL & Query Optimization.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to SQL & Query Optimization.",
                "missingSignal": "No mention of SQL & Query Optimization or related concepts in the CV."
            },
            {
                "skill": "Data Modeling",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "data engineer",
                        "etl",
                        "data pipeline"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Data Modeling.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Data Modeling.",
                "missingSignal": "No mention of Data Modeling or related concepts in the CV."
            },
            {
                "skill": "Streaming Data (Kafka)",
                "evidence": {
                    "tools": [
                        "Kafka"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "data engineer",
                        "etl",
                        "data pipeline"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Streaming Data (Kafka).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Streaming Data (Kafka).",
                "missingSignal": "No mention of Streaming Data (Kafka) or related concepts in the CV."
            },
            {
                "skill": "Python/Scala for Data Engineering",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "data engineer",
                        "etl",
                        "data pipeline"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Python/Scala for Data Engineering.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Python/Scala for Data Engineering.",
                "missingSignal": "No mention of Python/Scala for Data Engineering or related concepts in the CV."
            },
            {
                "skill": "Data Quality & Validation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "data engineer",
                        "etl",
                        "data pipeline"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Data Quality & Validation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Data Quality & Validation.",
                "missingSignal": "No mention of Data Quality & Validation or related concepts in the CV."
            },
            {
                "skill": "Cloud Data Platforms",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "data engineer",
                        "etl",
                        "data pipeline"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Cloud Data Platforms.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Cloud Data Platforms.",
                "missingSignal": "No mention of Cloud Data Platforms or related concepts in the CV."
            },
            {
                "skill": "Workflow Orchestration",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "data engineer",
                        "etl",
                        "data pipeline"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Workflow Orchestration.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Workflow Orchestration.",
                "missingSignal": "No mention of Workflow Orchestration or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "bi_data_analytics",
        "skills": [
            {
                "skill": "SQL Query Writing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "business intelligence",
                        "data analyst",
                        "bi analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with SQL Query Writing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to SQL Query Writing.",
                "missingSignal": "No mention of SQL Query Writing or related concepts in the CV."
            },
            {
                "skill": "Power BI/Tableau",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "business intelligence",
                        "data analyst",
                        "bi analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Power BI/Tableau.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Power BI/Tableau.",
                "missingSignal": "No mention of Power BI/Tableau or related concepts in the CV."
            },
            {
                "skill": "Data Modeling & Dashboards",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "business intelligence",
                        "data analyst",
                        "bi analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Data Modeling & Dashboards.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Data Modeling & Dashboards.",
                "missingSignal": "No mention of Data Modeling & Dashboards or related concepts in the CV."
            },
            {
                "skill": "Excel Advanced Functions",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "business intelligence",
                        "data analyst",
                        "bi analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Excel Advanced Functions.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Excel Advanced Functions.",
                "missingSignal": "No mention of Excel Advanced Functions or related concepts in the CV."
            },
            {
                "skill": "KPI & Metrics Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "business intelligence",
                        "data analyst",
                        "bi analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with KPI & Metrics Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to KPI & Metrics Design.",
                "missingSignal": "No mention of KPI & Metrics Design or related concepts in the CV."
            },
            {
                "skill": "Data Storytelling",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "business intelligence",
                        "data analyst",
                        "bi analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Data Storytelling.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Data Storytelling.",
                "missingSignal": "No mention of Data Storytelling or related concepts in the CV."
            },
            {
                "skill": "ETL Basics",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "business intelligence",
                        "data analyst",
                        "bi analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with ETL Basics.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to ETL Basics.",
                "missingSignal": "No mention of ETL Basics or related concepts in the CV."
            },
            {
                "skill": "Statistical Analysis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "business intelligence",
                        "data analyst",
                        "bi analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Statistical Analysis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Statistical Analysis.",
                "missingSignal": "No mention of Statistical Analysis or related concepts in the CV."
            },
            {
                "skill": "Stakeholder Reporting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "business intelligence",
                        "data analyst",
                        "bi analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Stakeholder Reporting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Stakeholder Reporting.",
                "missingSignal": "No mention of Stakeholder Reporting or related concepts in the CV."
            },
            {
                "skill": "Data Governance",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "business intelligence",
                        "data analyst",
                        "bi analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Data Governance.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Data Governance.",
                "missingSignal": "No mention of Data Governance or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "quantitative_analysis",
        "skills": [
            {
                "skill": "Statistical & Mathematical Modeling",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "quant",
                        "quantitative analyst",
                        "quant researcher"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Statistical & Mathematical Modeling.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Statistical & Mathematical Modeling.",
                "missingSignal": "No mention of Statistical & Mathematical Modeling or related concepts in the CV."
            },
            {
                "skill": "Python/R/MATLAB",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "quant",
                        "quantitative analyst",
                        "quant researcher"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Python/R/MATLAB.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Python/R/MATLAB.",
                "missingSignal": "No mention of Python/R/MATLAB or related concepts in the CV."
            },
            {
                "skill": "Financial Derivatives Pricing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "quant",
                        "quantitative analyst",
                        "quant researcher"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Financial Derivatives Pricing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Financial Derivatives Pricing.",
                "missingSignal": "No mention of Financial Derivatives Pricing or related concepts in the CV."
            },
            {
                "skill": "Time Series Analysis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "quant",
                        "quantitative analyst",
                        "quant researcher"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Time Series Analysis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Time Series Analysis.",
                "missingSignal": "No mention of Time Series Analysis or related concepts in the CV."
            },
            {
                "skill": "Risk Modeling",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "quant",
                        "quantitative analyst",
                        "quant researcher"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Risk Modeling.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Risk Modeling.",
                "missingSignal": "No mention of Risk Modeling or related concepts in the CV."
            },
            {
                "skill": "Algorithmic Trading Strategies",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "quant",
                        "quantitative analyst",
                        "quant researcher"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Algorithmic Trading Strategies.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Algorithmic Trading Strategies.",
                "missingSignal": "No mention of Algorithmic Trading Strategies or related concepts in the CV."
            },
            {
                "skill": "Monte Carlo Simulation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "quant",
                        "quantitative analyst",
                        "quant researcher"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Monte Carlo Simulation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Monte Carlo Simulation.",
                "missingSignal": "No mention of Monte Carlo Simulation or related concepts in the CV."
            },
            {
                "skill": "Stochastic Calculus",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "quant",
                        "quantitative analyst",
                        "quant researcher"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Stochastic Calculus.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Stochastic Calculus.",
                "missingSignal": "No mention of Stochastic Calculus or related concepts in the CV."
            },
            {
                "skill": "Backtesting Frameworks",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "quant",
                        "quantitative analyst",
                        "quant researcher"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Backtesting Frameworks.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Backtesting Frameworks.",
                "missingSignal": "No mention of Backtesting Frameworks or related concepts in the CV."
            },
            {
                "skill": "Data Analysis at Scale",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "quant",
                        "quantitative analyst",
                        "quant researcher"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Data Analysis at Scale.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Data Analysis at Scale.",
                "missingSignal": "No mention of Data Analysis at Scale or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "product_management",
        "skills": [
            {
                "skill": "Product Roadmapping",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "product manager",
                        "product owner",
                        "pm"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Product Roadmapping.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Product Roadmapping.",
                "missingSignal": "No mention of Product Roadmapping or related concepts in the CV."
            },
            {
                "skill": "User Research & Discovery",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "product manager",
                        "product owner",
                        "pm"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with User Research & Discovery.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to User Research & Discovery.",
                "missingSignal": "No mention of User Research & Discovery or related concepts in the CV."
            },
            {
                "skill": "Backlog Prioritization",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "product manager",
                        "product owner",
                        "pm"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Backlog Prioritization.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Backlog Prioritization.",
                "missingSignal": "No mention of Backlog Prioritization or related concepts in the CV."
            },
            {
                "skill": "A/B Testing & Experimentation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "product manager",
                        "product owner",
                        "pm"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with A/B Testing & Experimentation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to A/B Testing & Experimentation.",
                "missingSignal": "No mention of A/B Testing & Experimentation or related concepts in the CV."
            },
            {
                "skill": "Stakeholder Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "product manager",
                        "product owner",
                        "pm"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Stakeholder Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Stakeholder Management.",
                "missingSignal": "No mention of Stakeholder Management or related concepts in the CV."
            },
            {
                "skill": "Agile/Scrum Methodology",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "product manager",
                        "product owner",
                        "pm"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Agile/Scrum Methodology.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Agile/Scrum Methodology.",
                "missingSignal": "No mention of Agile/Scrum Methodology or related concepts in the CV."
            },
            {
                "skill": "Product Analytics",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "product manager",
                        "product owner",
                        "pm"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Product Analytics.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Product Analytics.",
                "missingSignal": "No mention of Product Analytics or related concepts in the CV."
            },
            {
                "skill": "Go-To-Market Strategy",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "product manager",
                        "product owner",
                        "pm"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Go-To-Market Strategy.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Go-To-Market Strategy.",
                "missingSignal": "No mention of Go-To-Market Strategy or related concepts in the CV."
            },
            {
                "skill": "Wireframing/Spec Writing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "product manager",
                        "product owner",
                        "pm"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Wireframing/Spec Writing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Wireframing/Spec Writing.",
                "missingSignal": "No mention of Wireframing/Spec Writing or related concepts in the CV."
            },
            {
                "skill": "Cross-Functional Leadership",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "product manager",
                        "product owner",
                        "pm"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Cross-Functional Leadership.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Cross-Functional Leadership.",
                "missingSignal": "No mention of Cross-Functional Leadership or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "ui_ux_design",
        "skills": [
            {
                "skill": "User Research & Usability Testing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "ui designer",
                        "ux designer",
                        "product designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with User Research & Usability Testing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to User Research & Usability Testing.",
                "missingSignal": "No mention of User Research & Usability Testing or related concepts in the CV."
            },
            {
                "skill": "Wireframing & Prototyping (Figma)",
                "evidence": {
                    "tools": [
                        "Figma"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "ui designer",
                        "ux designer",
                        "product designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Wireframing & Prototyping (Figma).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Wireframing & Prototyping (Figma).",
                "missingSignal": "No mention of Wireframing & Prototyping (Figma) or related concepts in the CV."
            },
            {
                "skill": "Interaction Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "ui designer",
                        "ux designer",
                        "product designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Interaction Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Interaction Design.",
                "missingSignal": "No mention of Interaction Design or related concepts in the CV."
            },
            {
                "skill": "Information Architecture",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "ui designer",
                        "ux designer",
                        "product designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Information Architecture.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Information Architecture.",
                "missingSignal": "No mention of Information Architecture or related concepts in the CV."
            },
            {
                "skill": "Design Systems",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "ui designer",
                        "ux designer",
                        "product designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Design Systems.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Design Systems.",
                "missingSignal": "No mention of Design Systems or related concepts in the CV."
            },
            {
                "skill": "Visual/UI Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "ui designer",
                        "ux designer",
                        "product designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Visual/UI Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Visual/UI Design.",
                "missingSignal": "No mention of Visual/UI Design or related concepts in the CV."
            },
            {
                "skill": "Accessibility Standards",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "ui designer",
                        "ux designer",
                        "product designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Accessibility Standards.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Accessibility Standards.",
                "missingSignal": "No mention of Accessibility Standards or related concepts in the CV."
            },
            {
                "skill": "User Journey Mapping",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "ui designer",
                        "ux designer",
                        "product designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with User Journey Mapping.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to User Journey Mapping.",
                "missingSignal": "No mention of User Journey Mapping or related concepts in the CV."
            },
            {
                "skill": "Design Critique & Iteration",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "ui designer",
                        "ux designer",
                        "product designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Design Critique & Iteration.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Design Critique & Iteration.",
                "missingSignal": "No mention of Design Critique & Iteration or related concepts in the CV."
            },
            {
                "skill": "Cross-Platform Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "ui designer",
                        "ux designer",
                        "product designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Cross-Platform Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Cross-Platform Design.",
                "missingSignal": "No mention of Cross-Platform Design or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "graphic_design_illustration",
        "skills": [
            {
                "skill": "Adobe Creative Suite (Photoshop/Illustrator)",
                "evidence": {
                    "tools": [
                        "Photoshop",
                        "Illustrator"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "graphic designer",
                        "illustrator",
                        "visual designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Adobe Creative Suite (Photoshop/Illustrator).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Adobe Creative Suite (Photoshop/Illustrator).",
                "missingSignal": "No mention of Adobe Creative Suite (Photoshop/Illustrator) or related concepts in the CV."
            },
            {
                "skill": "Typography",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "graphic designer",
                        "illustrator",
                        "visual designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Typography.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Typography.",
                "missingSignal": "No mention of Typography or related concepts in the CV."
            },
            {
                "skill": "Layout & Composition",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "graphic designer",
                        "illustrator",
                        "visual designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Layout & Composition.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Layout & Composition.",
                "missingSignal": "No mention of Layout & Composition or related concepts in the CV."
            },
            {
                "skill": "Brand Identity Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "graphic designer",
                        "illustrator",
                        "visual designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Brand Identity Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Brand Identity Design.",
                "missingSignal": "No mention of Brand Identity Design or related concepts in the CV."
            },
            {
                "skill": "Print & Digital Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "graphic designer",
                        "illustrator",
                        "visual designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Print & Digital Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Print & Digital Design.",
                "missingSignal": "No mention of Print & Digital Design or related concepts in the CV."
            },
            {
                "skill": "Color Theory",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "graphic designer",
                        "illustrator",
                        "visual designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Color Theory.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Color Theory.",
                "missingSignal": "No mention of Color Theory or related concepts in the CV."
            },
            {
                "skill": "Illustration Techniques",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "graphic designer",
                        "illustrator",
                        "visual designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Illustration Techniques.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Illustration Techniques.",
                "missingSignal": "No mention of Illustration Techniques or related concepts in the CV."
            },
            {
                "skill": "Packaging Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "graphic designer",
                        "illustrator",
                        "visual designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Packaging Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Packaging Design.",
                "missingSignal": "No mention of Packaging Design or related concepts in the CV."
            },
            {
                "skill": "Vector Graphics",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "graphic designer",
                        "illustrator",
                        "visual designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Vector Graphics.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Vector Graphics.",
                "missingSignal": "No mention of Vector Graphics or related concepts in the CV."
            },
            {
                "skill": "Client Presentation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "graphic designer",
                        "illustrator",
                        "visual designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Client Presentation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Client Presentation.",
                "missingSignal": "No mention of Client Presentation or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "industrial_product_design",
        "skills": [
            {
                "skill": "CAD Software (SolidWorks/Rhino)",
                "evidence": {
                    "tools": [
                        "SolidWorks",
                        "Rhino"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "industrial designer",
                        "product designer (physical)",
                        "cad designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with CAD Software (SolidWorks/Rhino).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to CAD Software (SolidWorks/Rhino).",
                "missingSignal": "No mention of CAD Software (SolidWorks/Rhino) or related concepts in the CV."
            },
            {
                "skill": "Prototyping & Model Making",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "industrial designer",
                        "product designer (physical)",
                        "cad designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Prototyping & Model Making.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Prototyping & Model Making.",
                "missingSignal": "No mention of Prototyping & Model Making or related concepts in the CV."
            },
            {
                "skill": "Materials & Manufacturing Processes",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "industrial designer",
                        "product designer (physical)",
                        "cad designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Materials & Manufacturing Processes.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Materials & Manufacturing Processes.",
                "missingSignal": "No mention of Materials & Manufacturing Processes or related concepts in the CV."
            },
            {
                "skill": "Ergonomics & Human Factors",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "industrial designer",
                        "product designer (physical)",
                        "cad designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Ergonomics & Human Factors.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Ergonomics & Human Factors.",
                "missingSignal": "No mention of Ergonomics & Human Factors or related concepts in the CV."
            },
            {
                "skill": "Sketching & Ideation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "industrial designer",
                        "product designer (physical)",
                        "cad designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Sketching & Ideation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Sketching & Ideation.",
                "missingSignal": "No mention of Sketching & Ideation or related concepts in the CV."
            },
            {
                "skill": "Design for Manufacturing (DFM)",
                "evidence": {
                    "tools": [
                        "DFM"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "industrial designer",
                        "product designer (physical)",
                        "cad designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Design for Manufacturing (DFM).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Design for Manufacturing (DFM).",
                "missingSignal": "No mention of Design for Manufacturing (DFM) or related concepts in the CV."
            },
            {
                "skill": "3D Printing/Rapid Prototyping",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "industrial designer",
                        "product designer (physical)",
                        "cad designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with 3D Printing/Rapid Prototyping.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to 3D Printing/Rapid Prototyping.",
                "missingSignal": "No mention of 3D Printing/Rapid Prototyping or related concepts in the CV."
            },
            {
                "skill": "User-Centered Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "industrial designer",
                        "product designer (physical)",
                        "cad designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with User-Centered Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to User-Centered Design.",
                "missingSignal": "No mention of User-Centered Design or related concepts in the CV."
            },
            {
                "skill": "Sustainability in Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "industrial designer",
                        "product designer (physical)",
                        "cad designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Sustainability in Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Sustainability in Design.",
                "missingSignal": "No mention of Sustainability in Design or related concepts in the CV."
            },
            {
                "skill": "Technical Drawings",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "industrial designer",
                        "product designer (physical)",
                        "cad designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Technical Drawings.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Technical Drawings.",
                "missingSignal": "No mention of Technical Drawings or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "3d_animation_motion_graphics",
        "skills": [
            {
                "skill": "Maya/Blender/Cinema 4D",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "3d animator",
                        "motion graphics designer",
                        "vfx artist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Maya/Blender/Cinema 4D.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Maya/Blender/Cinema 4D.",
                "missingSignal": "No mention of Maya/Blender/Cinema 4D or related concepts in the CV."
            },
            {
                "skill": "After Effects",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "3d animator",
                        "motion graphics designer",
                        "vfx artist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with After Effects.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to After Effects.",
                "missingSignal": "No mention of After Effects or related concepts in the CV."
            },
            {
                "skill": "Character Rigging & Animation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "3d animator",
                        "motion graphics designer",
                        "vfx artist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Character Rigging & Animation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Character Rigging & Animation.",
                "missingSignal": "No mention of Character Rigging & Animation or related concepts in the CV."
            },
            {
                "skill": "Storyboarding",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "3d animator",
                        "motion graphics designer",
                        "vfx artist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Storyboarding.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Storyboarding.",
                "missingSignal": "No mention of Storyboarding or related concepts in the CV."
            },
            {
                "skill": "Compositing & VFX",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "3d animator",
                        "motion graphics designer",
                        "vfx artist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Compositing & VFX.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Compositing & VFX.",
                "missingSignal": "No mention of Compositing & VFX or related concepts in the CV."
            },
            {
                "skill": "Texturing & Lighting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "3d animator",
                        "motion graphics designer",
                        "vfx artist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Texturing & Lighting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Texturing & Lighting.",
                "missingSignal": "No mention of Texturing & Lighting or related concepts in the CV."
            },
            {
                "skill": "Motion Design Principles",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "3d animator",
                        "motion graphics designer",
                        "vfx artist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Motion Design Principles.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Motion Design Principles.",
                "missingSignal": "No mention of Motion Design Principles or related concepts in the CV."
            },
            {
                "skill": "Video Editing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "3d animator",
                        "motion graphics designer",
                        "vfx artist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Video Editing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Video Editing.",
                "missingSignal": "No mention of Video Editing or related concepts in the CV."
            },
            {
                "skill": "Rendering Pipelines",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "3d animator",
                        "motion graphics designer",
                        "vfx artist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Rendering Pipelines.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Rendering Pipelines.",
                "missingSignal": "No mention of Rendering Pipelines or related concepts in the CV."
            },
            {
                "skill": "Visual Storytelling",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "3d animator",
                        "motion graphics designer",
                        "vfx artist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Visual Storytelling.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Visual Storytelling.",
                "missingSignal": "No mention of Visual Storytelling or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "game_design_development",
        "skills": [
            {
                "skill": "Unity/Unreal Engine",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "game designer",
                        "game developer",
                        "unity developer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Unity/Unreal Engine.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Unity/Unreal Engine.",
                "missingSignal": "No mention of Unity/Unreal Engine or related concepts in the CV."
            },
            {
                "skill": "C#/C++ Game Programming",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "game designer",
                        "game developer",
                        "unity developer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with C#/C++ Game Programming.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to C#/C++ Game Programming.",
                "missingSignal": "No mention of C#/C++ Game Programming or related concepts in the CV."
            },
            {
                "skill": "Game Mechanics Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "game designer",
                        "game developer",
                        "unity developer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Game Mechanics Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Game Mechanics Design.",
                "missingSignal": "No mention of Game Mechanics Design or related concepts in the CV."
            },
            {
                "skill": "Level Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "game designer",
                        "game developer",
                        "unity developer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Level Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Level Design.",
                "missingSignal": "No mention of Level Design or related concepts in the CV."
            },
            {
                "skill": "Game Physics",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "game designer",
                        "game developer",
                        "unity developer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Game Physics.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Game Physics.",
                "missingSignal": "No mention of Game Physics or related concepts in the CV."
            },
            {
                "skill": "Multiplayer/Networking Systems",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "game designer",
                        "game developer",
                        "unity developer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Multiplayer/Networking Systems.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Multiplayer/Networking Systems.",
                "missingSignal": "No mention of Multiplayer/Networking Systems or related concepts in the CV."
            },
            {
                "skill": "3D/2D Asset Integration",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "game designer",
                        "game developer",
                        "unity developer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with 3D/2D Asset Integration.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to 3D/2D Asset Integration.",
                "missingSignal": "No mention of 3D/2D Asset Integration or related concepts in the CV."
            },
            {
                "skill": "Playtesting & Balancing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "game designer",
                        "game developer",
                        "unity developer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Playtesting & Balancing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Playtesting & Balancing.",
                "missingSignal": "No mention of Playtesting & Balancing or related concepts in the CV."
            },
            {
                "skill": "Narrative/Systems Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "game designer",
                        "game developer",
                        "unity developer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Narrative/Systems Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Narrative/Systems Design.",
                "missingSignal": "No mention of Narrative/Systems Design or related concepts in the CV."
            },
            {
                "skill": "Performance Optimization",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "game designer",
                        "game developer",
                        "unity developer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Performance Optimization.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Performance Optimization.",
                "missingSignal": "No mention of Performance Optimization or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "b2b_sales",
        "skills": [
            {
                "skill": "Pipeline Management (CRM)",
                "evidence": {
                    "tools": [
                        "CRM"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "b2b sales",
                        "account executive",
                        "sales executive"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Pipeline Management (CRM).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Pipeline Management (CRM).",
                "missingSignal": "No mention of Pipeline Management (CRM) or related concepts in the CV."
            },
            {
                "skill": "Solution Selling",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "b2b sales",
                        "account executive",
                        "sales executive"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Solution Selling.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Solution Selling.",
                "missingSignal": "No mention of Solution Selling or related concepts in the CV."
            },
            {
                "skill": "Lead Qualification",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "b2b sales",
                        "account executive",
                        "sales executive"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Lead Qualification.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Lead Qualification.",
                "missingSignal": "No mention of Lead Qualification or related concepts in the CV."
            },
            {
                "skill": "Negotiation & Closing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "b2b sales",
                        "account executive",
                        "sales executive"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Negotiation & Closing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Negotiation & Closing.",
                "missingSignal": "No mention of Negotiation & Closing or related concepts in the CV."
            },
            {
                "skill": "Account Planning",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "b2b sales",
                        "account executive",
                        "sales executive"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Account Planning.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Account Planning.",
                "missingSignal": "No mention of Account Planning or related concepts in the CV."
            },
            {
                "skill": "Cold Outreach & Prospecting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "b2b sales",
                        "account executive",
                        "sales executive"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Cold Outreach & Prospecting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Cold Outreach & Prospecting.",
                "missingSignal": "No mention of Cold Outreach & Prospecting or related concepts in the CV."
            },
            {
                "skill": "Sales Forecasting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "b2b sales",
                        "account executive",
                        "sales executive"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Sales Forecasting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Sales Forecasting.",
                "missingSignal": "No mention of Sales Forecasting or related concepts in the CV."
            },
            {
                "skill": "Objection Handling",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "b2b sales",
                        "account executive",
                        "sales executive"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Objection Handling.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Objection Handling.",
                "missingSignal": "No mention of Objection Handling or related concepts in the CV."
            },
            {
                "skill": "Contract Negotiation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "b2b sales",
                        "account executive",
                        "sales executive"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Contract Negotiation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Contract Negotiation.",
                "missingSignal": "No mention of Contract Negotiation or related concepts in the CV."
            },
            {
                "skill": "Relationship Building",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "b2b sales",
                        "account executive",
                        "sales executive"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Relationship Building.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Relationship Building.",
                "missingSignal": "No mention of Relationship Building or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "customer_success",
        "skills": [
            {
                "skill": "Onboarding & Adoption Strategy",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "customer success manager",
                        "account manager",
                        "client success"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Onboarding & Adoption Strategy.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Onboarding & Adoption Strategy.",
                "missingSignal": "No mention of Onboarding & Adoption Strategy or related concepts in the CV."
            },
            {
                "skill": "Churn Prevention & Retention",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "customer success manager",
                        "account manager",
                        "client success"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Churn Prevention & Retention.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Churn Prevention & Retention.",
                "missingSignal": "No mention of Churn Prevention & Retention or related concepts in the CV."
            },
            {
                "skill": "Upsell/Cross-Sell Strategy",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "customer success manager",
                        "account manager",
                        "client success"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Upsell/Cross-Sell Strategy.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Upsell/Cross-Sell Strategy.",
                "missingSignal": "No mention of Upsell/Cross-Sell Strategy or related concepts in the CV."
            },
            {
                "skill": "Account Health Monitoring",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "customer success manager",
                        "account manager",
                        "client success"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Account Health Monitoring.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Account Health Monitoring.",
                "missingSignal": "No mention of Account Health Monitoring or related concepts in the CV."
            },
            {
                "skill": "Customer Relationship Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "customer success manager",
                        "account manager",
                        "client success"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Customer Relationship Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Customer Relationship Management.",
                "missingSignal": "No mention of Customer Relationship Management or related concepts in the CV."
            },
            {
                "skill": "QBR (Quarterly Business Review) Delivery",
                "evidence": {
                    "tools": [
                        "Quarterly Business Review"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "customer success manager",
                        "account manager",
                        "client success"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with QBR (Quarterly Business Review) Delivery.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to QBR (Quarterly Business Review) Delivery.",
                "missingSignal": "No mention of QBR (Quarterly Business Review) Delivery or related concepts in the CV."
            },
            {
                "skill": "Customer Advocacy",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "customer success manager",
                        "account manager",
                        "client success"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Customer Advocacy.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Customer Advocacy.",
                "missingSignal": "No mention of Customer Advocacy or related concepts in the CV."
            },
            {
                "skill": "Renewal Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "customer success manager",
                        "account manager",
                        "client success"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Renewal Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Renewal Management.",
                "missingSignal": "No mention of Renewal Management or related concepts in the CV."
            },
            {
                "skill": "Cross-Functional Escalation Handling",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "customer success manager",
                        "account manager",
                        "client success"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Cross-Functional Escalation Handling.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Cross-Functional Escalation Handling.",
                "missingSignal": "No mention of Cross-Functional Escalation Handling or related concepts in the CV."
            },
            {
                "skill": "Customer Health Metrics (NPS/CSAT)",
                "evidence": {
                    "tools": [
                        "NPS",
                        "CSAT"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "customer success manager",
                        "account manager",
                        "client success"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Customer Health Metrics (NPS/CSAT).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Customer Health Metrics (NPS/CSAT).",
                "missingSignal": "No mention of Customer Health Metrics (NPS/CSAT) or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "digital_marketing_seo_sem",
        "skills": [
            {
                "skill": "SEO (On-Page/Off-Page/Technical)",
                "evidence": {
                    "tools": [
                        "On-Page",
                        "Off-Page",
                        "Technical"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "digital marketer",
                        "seo specialist",
                        "sem specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with SEO (On-Page/Off-Page/Technical).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to SEO (On-Page/Off-Page/Technical).",
                "missingSignal": "No mention of SEO (On-Page/Off-Page/Technical) or related concepts in the CV."
            },
            {
                "skill": "SEM/PPC Campaign Management (Google Ads)",
                "evidence": {
                    "tools": [
                        "Google Ads"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "digital marketer",
                        "seo specialist",
                        "sem specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with SEM/PPC Campaign Management (Google Ads).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to SEM/PPC Campaign Management (Google Ads).",
                "missingSignal": "No mention of SEM/PPC Campaign Management (Google Ads) or related concepts in the CV."
            },
            {
                "skill": "Google Analytics/GA4",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "digital marketer",
                        "seo specialist",
                        "sem specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Google Analytics/GA4.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Google Analytics/GA4.",
                "missingSignal": "No mention of Google Analytics/GA4 or related concepts in the CV."
            },
            {
                "skill": "Conversion Rate Optimization",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "digital marketer",
                        "seo specialist",
                        "sem specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Conversion Rate Optimization.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Conversion Rate Optimization.",
                "missingSignal": "No mention of Conversion Rate Optimization or related concepts in the CV."
            },
            {
                "skill": "Keyword Research",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "digital marketer",
                        "seo specialist",
                        "sem specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Keyword Research.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Keyword Research.",
                "missingSignal": "No mention of Keyword Research or related concepts in the CV."
            },
            {
                "skill": "Marketing Automation Tools",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "digital marketer",
                        "seo specialist",
                        "sem specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Marketing Automation Tools.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Marketing Automation Tools.",
                "missingSignal": "No mention of Marketing Automation Tools or related concepts in the CV."
            },
            {
                "skill": "Email Marketing Campaigns",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "digital marketer",
                        "seo specialist",
                        "sem specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Email Marketing Campaigns.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Email Marketing Campaigns.",
                "missingSignal": "No mention of Email Marketing Campaigns or related concepts in the CV."
            },
            {
                "skill": "A/B Testing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "digital marketer",
                        "seo specialist",
                        "sem specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with A/B Testing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to A/B Testing.",
                "missingSignal": "No mention of A/B Testing or related concepts in the CV."
            },
            {
                "skill": "Content Marketing Strategy",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "digital marketer",
                        "seo specialist",
                        "sem specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Content Marketing Strategy.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Content Marketing Strategy.",
                "missingSignal": "No mention of Content Marketing Strategy or related concepts in the CV."
            },
            {
                "skill": "Paid Social Advertising",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "digital marketer",
                        "seo specialist",
                        "sem specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Paid Social Advertising.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Paid Social Advertising.",
                "missingSignal": "No mention of Paid Social Advertising or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "content_creation_copywriting",
        "skills": [
            {
                "skill": "Copywriting & Persuasive Writing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "copywriter",
                        "content writer",
                        "content creator"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Copywriting & Persuasive Writing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Copywriting & Persuasive Writing.",
                "missingSignal": "No mention of Copywriting & Persuasive Writing or related concepts in the CV."
            },
            {
                "skill": "SEO Content Writing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "copywriter",
                        "content writer",
                        "content creator"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with SEO Content Writing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to SEO Content Writing.",
                "missingSignal": "No mention of SEO Content Writing or related concepts in the CV."
            },
            {
                "skill": "Content Strategy & Calendars",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "copywriter",
                        "content writer",
                        "content creator"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Content Strategy & Calendars.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Content Strategy & Calendars.",
                "missingSignal": "No mention of Content Strategy & Calendars or related concepts in the CV."
            },
            {
                "skill": "Brand Voice & Tone",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "copywriter",
                        "content writer",
                        "content creator"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Brand Voice & Tone.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Brand Voice & Tone.",
                "missingSignal": "No mention of Brand Voice & Tone or related concepts in the CV."
            },
            {
                "skill": "Editing & Proofreading",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "copywriter",
                        "content writer",
                        "content creator"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Editing & Proofreading.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Editing & Proofreading.",
                "missingSignal": "No mention of Editing & Proofreading or related concepts in the CV."
            },
            {
                "skill": "Storytelling",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "copywriter",
                        "content writer",
                        "content creator"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Storytelling.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Storytelling.",
                "missingSignal": "No mention of Storytelling or related concepts in the CV."
            },
            {
                "skill": "Blog/Article Writing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "copywriter",
                        "content writer",
                        "content creator"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Blog/Article Writing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Blog/Article Writing.",
                "missingSignal": "No mention of Blog/Article Writing or related concepts in the CV."
            },
            {
                "skill": "Email Copywriting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "copywriter",
                        "content writer",
                        "content creator"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Email Copywriting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Email Copywriting.",
                "missingSignal": "No mention of Email Copywriting or related concepts in the CV."
            },
            {
                "skill": "Research & Fact-Checking",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "copywriter",
                        "content writer",
                        "content creator"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Research & Fact-Checking.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Research & Fact-Checking.",
                "missingSignal": "No mention of Research & Fact-Checking or related concepts in the CV."
            },
            {
                "skill": "Content Performance Analysis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "copywriter",
                        "content writer",
                        "content creator"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Content Performance Analysis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Content Performance Analysis.",
                "missingSignal": "No mention of Content Performance Analysis or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "social_media_community",
        "skills": [
            {
                "skill": "Social Media Strategy",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "social media manager",
                        "community manager",
                        "social media strategist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Social Media Strategy.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Social Media Strategy.",
                "missingSignal": "No mention of Social Media Strategy or related concepts in the CV."
            },
            {
                "skill": "Content Calendar Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "social media manager",
                        "community manager",
                        "social media strategist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Content Calendar Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Content Calendar Management.",
                "missingSignal": "No mention of Content Calendar Management or related concepts in the CV."
            },
            {
                "skill": "Community Engagement & Moderation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "social media manager",
                        "community manager",
                        "social media strategist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Community Engagement & Moderation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Community Engagement & Moderation.",
                "missingSignal": "No mention of Community Engagement & Moderation or related concepts in the CV."
            },
            {
                "skill": "Platform-Specific Best Practices",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "social media manager",
                        "community manager",
                        "social media strategist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Platform-Specific Best Practices.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Platform-Specific Best Practices.",
                "missingSignal": "No mention of Platform-Specific Best Practices or related concepts in the CV."
            },
            {
                "skill": "Social Listening Tools",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "social media manager",
                        "community manager",
                        "social media strategist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Social Listening Tools.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Social Listening Tools.",
                "missingSignal": "No mention of Social Listening Tools or related concepts in the CV."
            },
            {
                "skill": "Influencer Collaboration",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "social media manager",
                        "community manager",
                        "social media strategist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Influencer Collaboration.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Influencer Collaboration.",
                "missingSignal": "No mention of Influencer Collaboration or related concepts in the CV."
            },
            {
                "skill": "Paid Social Campaigns",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "social media manager",
                        "community manager",
                        "social media strategist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Paid Social Campaigns.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Paid Social Campaigns.",
                "missingSignal": "No mention of Paid Social Campaigns or related concepts in the CV."
            },
            {
                "skill": "Analytics & Reporting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "social media manager",
                        "community manager",
                        "social media strategist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Analytics & Reporting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Analytics & Reporting.",
                "missingSignal": "No mention of Analytics & Reporting or related concepts in the CV."
            },
            {
                "skill": "Crisis Management (Social)",
                "evidence": {
                    "tools": [
                        "Social"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "social media manager",
                        "community manager",
                        "social media strategist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Crisis Management (Social).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Crisis Management (Social).",
                "missingSignal": "No mention of Crisis Management (Social) or related concepts in the CV."
            },
            {
                "skill": "Brand Voice Consistency",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "social media manager",
                        "community manager",
                        "social media strategist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Brand Voice Consistency.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Brand Voice Consistency.",
                "missingSignal": "No mention of Brand Voice Consistency or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "public_relations_comms",
        "skills": [
            {
                "skill": "Press Release Writing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "pr manager",
                        "public relations",
                        "corporate communications"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Press Release Writing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Press Release Writing.",
                "missingSignal": "No mention of Press Release Writing or related concepts in the CV."
            },
            {
                "skill": "Media Relations & Pitching",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "pr manager",
                        "public relations",
                        "corporate communications"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Media Relations & Pitching.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Media Relations & Pitching.",
                "missingSignal": "No mention of Media Relations & Pitching or related concepts in the CV."
            },
            {
                "skill": "Crisis Communications",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "pr manager",
                        "public relations",
                        "corporate communications"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Crisis Communications.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Crisis Communications.",
                "missingSignal": "No mention of Crisis Communications or related concepts in the CV."
            },
            {
                "skill": "Stakeholder Messaging",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "pr manager",
                        "public relations",
                        "corporate communications"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Stakeholder Messaging.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Stakeholder Messaging.",
                "missingSignal": "No mention of Stakeholder Messaging or related concepts in the CV."
            },
            {
                "skill": "Reputation Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "pr manager",
                        "public relations",
                        "corporate communications"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Reputation Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Reputation Management.",
                "missingSignal": "No mention of Reputation Management or related concepts in the CV."
            },
            {
                "skill": "Spokesperson Coordination",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "pr manager",
                        "public relations",
                        "corporate communications"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Spokesperson Coordination.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Spokesperson Coordination.",
                "missingSignal": "No mention of Spokesperson Coordination or related concepts in the CV."
            },
            {
                "skill": "Internal Communications",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "pr manager",
                        "public relations",
                        "corporate communications"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Internal Communications.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Internal Communications.",
                "missingSignal": "No mention of Internal Communications or related concepts in the CV."
            },
            {
                "skill": "Event/Press Conference Coordination",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "pr manager",
                        "public relations",
                        "corporate communications"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Event/Press Conference Coordination.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Event/Press Conference Coordination.",
                "missingSignal": "No mention of Event/Press Conference Coordination or related concepts in the CV."
            },
            {
                "skill": "Media Monitoring",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "pr manager",
                        "public relations",
                        "corporate communications"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Media Monitoring.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Media Monitoring.",
                "missingSignal": "No mention of Media Monitoring or related concepts in the CV."
            },
            {
                "skill": "Brand Narrative Development",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "pr manager",
                        "public relations",
                        "corporate communications"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Brand Narrative Development.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Brand Narrative Development.",
                "missingSignal": "No mention of Brand Narrative Development or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "event_planning_coordination",
        "skills": [
            {
                "skill": "Event Logistics Planning",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "event planner",
                        "event coordinator",
                        "event manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Event Logistics Planning.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Event Logistics Planning.",
                "missingSignal": "No mention of Event Logistics Planning or related concepts in the CV."
            },
            {
                "skill": "Vendor & Venue Negotiation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "event planner",
                        "event coordinator",
                        "event manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Vendor & Venue Negotiation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Vendor & Venue Negotiation.",
                "missingSignal": "No mention of Vendor & Venue Negotiation or related concepts in the CV."
            },
            {
                "skill": "Budget Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "event planner",
                        "event coordinator",
                        "event manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Budget Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Budget Management.",
                "missingSignal": "No mention of Budget Management or related concepts in the CV."
            },
            {
                "skill": "Timeline & Run-of-Show Creation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "event planner",
                        "event coordinator",
                        "event manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Timeline & Run-of-Show Creation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Timeline & Run-of-Show Creation.",
                "missingSignal": "No mention of Timeline & Run-of-Show Creation or related concepts in the CV."
            },
            {
                "skill": "On-Site Event Coordination",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "event planner",
                        "event coordinator",
                        "event manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with On-Site Event Coordination.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to On-Site Event Coordination.",
                "missingSignal": "No mention of On-Site Event Coordination or related concepts in the CV."
            },
            {
                "skill": "Stakeholder Communication",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "event planner",
                        "event coordinator",
                        "event manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Stakeholder Communication.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Stakeholder Communication.",
                "missingSignal": "No mention of Stakeholder Communication or related concepts in the CV."
            },
            {
                "skill": "Risk & Contingency Planning",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "event planner",
                        "event coordinator",
                        "event manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Risk & Contingency Planning.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Risk & Contingency Planning.",
                "missingSignal": "No mention of Risk & Contingency Planning or related concepts in the CV."
            },
            {
                "skill": "Registration/Ticketing Systems",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "event planner",
                        "event coordinator",
                        "event manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Registration/Ticketing Systems.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Registration/Ticketing Systems.",
                "missingSignal": "No mention of Registration/Ticketing Systems or related concepts in the CV."
            },
            {
                "skill": "Sponsorship Coordination",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "event planner",
                        "event coordinator",
                        "event manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Sponsorship Coordination.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Sponsorship Coordination.",
                "missingSignal": "No mention of Sponsorship Coordination or related concepts in the CV."
            },
            {
                "skill": "Post-Event Evaluation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "event planner",
                        "event coordinator",
                        "event manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Post-Event Evaluation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Post-Event Evaluation.",
                "missingSignal": "No mention of Post-Event Evaluation or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "brand_management",
        "skills": [
            {
                "skill": "Brand Strategy Development",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "brand manager",
                        "brand strategist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Brand Strategy Development.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Brand Strategy Development.",
                "missingSignal": "No mention of Brand Strategy Development or related concepts in the CV."
            },
            {
                "skill": "Market & Competitor Research",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "brand manager",
                        "brand strategist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Market & Competitor Research.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Market & Competitor Research.",
                "missingSignal": "No mention of Market & Competitor Research or related concepts in the CV."
            },
            {
                "skill": "Brand Positioning & Messaging",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "brand manager",
                        "brand strategist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Brand Positioning & Messaging.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Brand Positioning & Messaging.",
                "missingSignal": "No mention of Brand Positioning & Messaging or related concepts in the CV."
            },
            {
                "skill": "Campaign Planning",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "brand manager",
                        "brand strategist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Campaign Planning.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Campaign Planning.",
                "missingSignal": "No mention of Campaign Planning or related concepts in the CV."
            },
            {
                "skill": "Brand Guidelines Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "brand manager",
                        "brand strategist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Brand Guidelines Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Brand Guidelines Management.",
                "missingSignal": "No mention of Brand Guidelines Management or related concepts in the CV."
            },
            {
                "skill": "Consumer Insights Analysis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "brand manager",
                        "brand strategist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Consumer Insights Analysis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Consumer Insights Analysis.",
                "missingSignal": "No mention of Consumer Insights Analysis or related concepts in the CV."
            },
            {
                "skill": "Cross-Functional Brand Alignment",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "brand manager",
                        "brand strategist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Cross-Functional Brand Alignment.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Cross-Functional Brand Alignment.",
                "missingSignal": "No mention of Cross-Functional Brand Alignment or related concepts in the CV."
            },
            {
                "skill": "Budget & P&L Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "brand manager",
                        "brand strategist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Budget & P&L Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Budget & P&L Management.",
                "missingSignal": "No mention of Budget & P&L Management or related concepts in the CV."
            },
            {
                "skill": "Product Launch Strategy",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "brand manager",
                        "brand strategist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Product Launch Strategy.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Product Launch Strategy.",
                "missingSignal": "No mention of Product Launch Strategy or related concepts in the CV."
            },
            {
                "skill": "Brand Performance Tracking",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "brand manager",
                        "brand strategist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Brand Performance Tracking.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Brand Performance Tracking.",
                "missingSignal": "No mention of Brand Performance Tracking or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "operations_management_coo",
        "skills": [
            {
                "skill": "Process Optimization",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "operations manager",
                        "coo",
                        "head of operations"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Process Optimization.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Process Optimization.",
                "missingSignal": "No mention of Process Optimization or related concepts in the CV."
            },
            {
                "skill": "Cross-Functional Leadership",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "operations manager",
                        "coo",
                        "head of operations"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Cross-Functional Leadership.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Cross-Functional Leadership.",
                "missingSignal": "No mention of Cross-Functional Leadership or related concepts in the CV."
            },
            {
                "skill": "Budgeting & Resource Allocation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "operations manager",
                        "coo",
                        "head of operations"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Budgeting & Resource Allocation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Budgeting & Resource Allocation.",
                "missingSignal": "No mention of Budgeting & Resource Allocation or related concepts in the CV."
            },
            {
                "skill": "KPI Development & Tracking",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "operations manager",
                        "coo",
                        "head of operations"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with KPI Development & Tracking.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to KPI Development & Tracking.",
                "missingSignal": "No mention of KPI Development & Tracking or related concepts in the CV."
            },
            {
                "skill": "Vendor & Stakeholder Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "operations manager",
                        "coo",
                        "head of operations"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Vendor & Stakeholder Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Vendor & Stakeholder Management.",
                "missingSignal": "No mention of Vendor & Stakeholder Management or related concepts in the CV."
            },
            {
                "skill": "Organizational Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "operations manager",
                        "coo",
                        "head of operations"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Organizational Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Organizational Design.",
                "missingSignal": "No mention of Organizational Design or related concepts in the CV."
            },
            {
                "skill": "Operational Risk Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "operations manager",
                        "coo",
                        "head of operations"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Operational Risk Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Operational Risk Management.",
                "missingSignal": "No mention of Operational Risk Management or related concepts in the CV."
            },
            {
                "skill": "Change Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "operations manager",
                        "coo",
                        "head of operations"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Change Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Change Management.",
                "missingSignal": "No mention of Change Management or related concepts in the CV."
            },
            {
                "skill": "Strategic Planning",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "operations manager",
                        "coo",
                        "head of operations"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Strategic Planning.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Strategic Planning.",
                "missingSignal": "No mention of Strategic Planning or related concepts in the CV."
            },
            {
                "skill": "Performance Reporting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "operations manager",
                        "coo",
                        "head of operations"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Performance Reporting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Performance Reporting.",
                "missingSignal": "No mention of Performance Reporting or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "project_management_scrum",
        "skills": [
            {
                "skill": "Agile/Scrum Methodology",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "project manager",
                        "scrum master",
                        "pmp"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Agile/Scrum Methodology.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Agile/Scrum Methodology.",
                "missingSignal": "No mention of Agile/Scrum Methodology or related concepts in the CV."
            },
            {
                "skill": "Project Planning & Scheduling",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "project manager",
                        "scrum master",
                        "pmp"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Project Planning & Scheduling.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Project Planning & Scheduling.",
                "missingSignal": "No mention of Project Planning & Scheduling or related concepts in the CV."
            },
            {
                "skill": "Risk & Issue Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "project manager",
                        "scrum master",
                        "pmp"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Risk & Issue Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Risk & Issue Management.",
                "missingSignal": "No mention of Risk & Issue Management or related concepts in the CV."
            },
            {
                "skill": "Stakeholder Communication",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "project manager",
                        "scrum master",
                        "pmp"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Stakeholder Communication.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Stakeholder Communication.",
                "missingSignal": "No mention of Stakeholder Communication or related concepts in the CV."
            },
            {
                "skill": "Budget Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "project manager",
                        "scrum master",
                        "pmp"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Budget Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Budget Management.",
                "missingSignal": "No mention of Budget Management or related concepts in the CV."
            },
            {
                "skill": "Resource Allocation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "project manager",
                        "scrum master",
                        "pmp"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Resource Allocation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Resource Allocation.",
                "missingSignal": "No mention of Resource Allocation or related concepts in the CV."
            },
            {
                "skill": "Sprint Planning & Retrospectives",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "project manager",
                        "scrum master",
                        "pmp"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Sprint Planning & Retrospectives.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Sprint Planning & Retrospectives.",
                "missingSignal": "No mention of Sprint Planning & Retrospectives or related concepts in the CV."
            },
            {
                "skill": "Jira/Asana/MS Project",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "project manager",
                        "scrum master",
                        "pmp"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Jira/Asana/MS Project.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Jira/Asana/MS Project.",
                "missingSignal": "No mention of Jira/Asana/MS Project or related concepts in the CV."
            },
            {
                "skill": "Scope Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "project manager",
                        "scrum master",
                        "pmp"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Scope Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Scope Management.",
                "missingSignal": "No mention of Scope Management or related concepts in the CV."
            },
            {
                "skill": "Team Facilitation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "project manager",
                        "scrum master",
                        "pmp"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Team Facilitation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Team Facilitation.",
                "missingSignal": "No mention of Team Facilitation or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "business_strategy_consulting",
        "skills": [
            {
                "skill": "Market & Competitive Analysis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "management consultant",
                        "strategy consultant",
                        "business strategist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Market & Competitive Analysis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Market & Competitive Analysis.",
                "missingSignal": "No mention of Market & Competitive Analysis or related concepts in the CV."
            },
            {
                "skill": "Financial Modeling",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "management consultant",
                        "strategy consultant",
                        "business strategist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Financial Modeling.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Financial Modeling.",
                "missingSignal": "No mention of Financial Modeling or related concepts in the CV."
            },
            {
                "skill": "Strategic Planning Frameworks",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "management consultant",
                        "strategy consultant",
                        "business strategist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Strategic Planning Frameworks.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Strategic Planning Frameworks.",
                "missingSignal": "No mention of Strategic Planning Frameworks or related concepts in the CV."
            },
            {
                "skill": "Stakeholder Interviewing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "management consultant",
                        "strategy consultant",
                        "business strategist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Stakeholder Interviewing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Stakeholder Interviewing.",
                "missingSignal": "No mention of Stakeholder Interviewing or related concepts in the CV."
            },
            {
                "skill": "Business Case Development",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "management consultant",
                        "strategy consultant",
                        "business strategist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Business Case Development.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Business Case Development.",
                "missingSignal": "No mention of Business Case Development or related concepts in the CV."
            },
            {
                "skill": "Data-Driven Recommendations",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "management consultant",
                        "strategy consultant",
                        "business strategist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Data-Driven Recommendations.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Data-Driven Recommendations.",
                "missingSignal": "No mention of Data-Driven Recommendations or related concepts in the CV."
            },
            {
                "skill": "Presentation & Storyboarding",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "management consultant",
                        "strategy consultant",
                        "business strategist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Presentation & Storyboarding.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Presentation & Storyboarding.",
                "missingSignal": "No mention of Presentation & Storyboarding or related concepts in the CV."
            },
            {
                "skill": "Change Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "management consultant",
                        "strategy consultant",
                        "business strategist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Change Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Change Management.",
                "missingSignal": "No mention of Change Management or related concepts in the CV."
            },
            {
                "skill": "Operating Model Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "management consultant",
                        "strategy consultant",
                        "business strategist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Operating Model Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Operating Model Design.",
                "missingSignal": "No mention of Operating Model Design or related concepts in the CV."
            },
            {
                "skill": "Client Relationship Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "management consultant",
                        "strategy consultant",
                        "business strategist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Client Relationship Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Client Relationship Management.",
                "missingSignal": "No mention of Client Relationship Management or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "supply_chain_logistics",
        "skills": [
            {
                "skill": "Demand Planning & Forecasting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "supply chain manager",
                        "logistics manager",
                        "supply chain analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Demand Planning & Forecasting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Demand Planning & Forecasting.",
                "missingSignal": "No mention of Demand Planning & Forecasting or related concepts in the CV."
            },
            {
                "skill": "Inventory Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "supply chain manager",
                        "logistics manager",
                        "supply chain analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Inventory Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Inventory Management.",
                "missingSignal": "No mention of Inventory Management or related concepts in the CV."
            },
            {
                "skill": "Logistics & Distribution Planning",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "supply chain manager",
                        "logistics manager",
                        "supply chain analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Logistics & Distribution Planning.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Logistics & Distribution Planning.",
                "missingSignal": "No mention of Logistics & Distribution Planning or related concepts in the CV."
            },
            {
                "skill": "Supplier Relationship Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "supply chain manager",
                        "logistics manager",
                        "supply chain analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Supplier Relationship Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Supplier Relationship Management.",
                "missingSignal": "No mention of Supplier Relationship Management or related concepts in the CV."
            },
            {
                "skill": "ERP Systems (SAP/Oracle)",
                "evidence": {
                    "tools": [
                        "SAP",
                        "Oracle"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "supply chain manager",
                        "logistics manager",
                        "supply chain analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with ERP Systems (SAP/Oracle).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to ERP Systems (SAP/Oracle).",
                "missingSignal": "No mention of ERP Systems (SAP/Oracle) or related concepts in the CV."
            },
            {
                "skill": "Warehouse Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "supply chain manager",
                        "logistics manager",
                        "supply chain analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Warehouse Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Warehouse Management.",
                "missingSignal": "No mention of Warehouse Management or related concepts in the CV."
            },
            {
                "skill": "Freight & Transportation Coordination",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "supply chain manager",
                        "logistics manager",
                        "supply chain analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Freight & Transportation Coordination.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Freight & Transportation Coordination.",
                "missingSignal": "No mention of Freight & Transportation Coordination or related concepts in the CV."
            },
            {
                "skill": "Supply Chain Risk Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "supply chain manager",
                        "logistics manager",
                        "supply chain analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Supply Chain Risk Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Supply Chain Risk Management.",
                "missingSignal": "No mention of Supply Chain Risk Management or related concepts in the CV."
            },
            {
                "skill": "Lean/Six Sigma Principles",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "supply chain manager",
                        "logistics manager",
                        "supply chain analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Lean/Six Sigma Principles.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Lean/Six Sigma Principles.",
                "missingSignal": "No mention of Lean/Six Sigma Principles or related concepts in the CV."
            },
            {
                "skill": "Cost Reduction Initiatives",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "supply chain manager",
                        "logistics manager",
                        "supply chain analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Cost Reduction Initiatives.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Cost Reduction Initiatives.",
                "missingSignal": "No mention of Cost Reduction Initiatives or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "procurement_sourcing",
        "skills": [
            {
                "skill": "Vendor Negotiation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "procurement manager",
                        "sourcing manager",
                        "purchasing manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Vendor Negotiation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Vendor Negotiation.",
                "missingSignal": "No mention of Vendor Negotiation or related concepts in the CV."
            },
            {
                "skill": "Strategic Sourcing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "procurement manager",
                        "sourcing manager",
                        "purchasing manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Strategic Sourcing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Strategic Sourcing.",
                "missingSignal": "No mention of Strategic Sourcing or related concepts in the CV."
            },
            {
                "skill": "Contract Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "procurement manager",
                        "sourcing manager",
                        "purchasing manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Contract Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Contract Management.",
                "missingSignal": "No mention of Contract Management or related concepts in the CV."
            },
            {
                "skill": "Supplier Performance Evaluation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "procurement manager",
                        "sourcing manager",
                        "purchasing manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Supplier Performance Evaluation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Supplier Performance Evaluation.",
                "missingSignal": "No mention of Supplier Performance Evaluation or related concepts in the CV."
            },
            {
                "skill": "Cost Analysis & Reduction",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "procurement manager",
                        "sourcing manager",
                        "purchasing manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Cost Analysis & Reduction.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Cost Analysis & Reduction.",
                "missingSignal": "No mention of Cost Analysis & Reduction or related concepts in the CV."
            },
            {
                "skill": "RFP/RFQ Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "procurement manager",
                        "sourcing manager",
                        "purchasing manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with RFP/RFQ Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to RFP/RFQ Management.",
                "missingSignal": "No mention of RFP/RFQ Management or related concepts in the CV."
            },
            {
                "skill": "Procurement Software (Ariba/Coupa)",
                "evidence": {
                    "tools": [
                        "Ariba",
                        "Coupa"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "procurement manager",
                        "sourcing manager",
                        "purchasing manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Procurement Software (Ariba/Coupa).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Procurement Software (Ariba/Coupa).",
                "missingSignal": "No mention of Procurement Software (Ariba/Coupa) or related concepts in the CV."
            },
            {
                "skill": "Risk & Compliance in Sourcing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "procurement manager",
                        "sourcing manager",
                        "purchasing manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Risk & Compliance in Sourcing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Risk & Compliance in Sourcing.",
                "missingSignal": "No mention of Risk & Compliance in Sourcing or related concepts in the CV."
            },
            {
                "skill": "Category Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "procurement manager",
                        "sourcing manager",
                        "purchasing manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Category Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Category Management.",
                "missingSignal": "No mention of Category Management or related concepts in the CV."
            },
            {
                "skill": "Total Cost of Ownership Analysis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "procurement manager",
                        "sourcing manager",
                        "purchasing manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Total Cost of Ownership Analysis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Total Cost of Ownership Analysis.",
                "missingSignal": "No mention of Total Cost of Ownership Analysis or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "customer_support_ops",
        "skills": [
            {
                "skill": "Ticketing/Helpdesk Tools (Zendesk)",
                "evidence": {
                    "tools": [
                        "Zendesk"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "customer support",
                        "customer service representative",
                        "support specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Ticketing/Helpdesk Tools (Zendesk).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Ticketing/Helpdesk Tools (Zendesk).",
                "missingSignal": "No mention of Ticketing/Helpdesk Tools (Zendesk) or related concepts in the CV."
            },
            {
                "skill": "Customer Communication Skills",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "customer support",
                        "customer service representative",
                        "support specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Customer Communication Skills.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Customer Communication Skills.",
                "missingSignal": "No mention of Customer Communication Skills or related concepts in the CV."
            },
            {
                "skill": "Conflict De-escalation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "customer support",
                        "customer service representative",
                        "support specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Conflict De-escalation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Conflict De-escalation.",
                "missingSignal": "No mention of Conflict De-escalation or related concepts in the CV."
            },
            {
                "skill": "Product/Service Knowledge",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "customer support",
                        "customer service representative",
                        "support specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Product/Service Knowledge.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Product/Service Knowledge.",
                "missingSignal": "No mention of Product/Service Knowledge or related concepts in the CV."
            },
            {
                "skill": "SLA Compliance",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "customer support",
                        "customer service representative",
                        "support specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with SLA Compliance.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to SLA Compliance.",
                "missingSignal": "No mention of SLA Compliance or related concepts in the CV."
            },
            {
                "skill": "Multi-Channel Support (Chat/Email/Phone)",
                "evidence": {
                    "tools": [
                        "Chat",
                        "Email",
                        "Phone"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "customer support",
                        "customer service representative",
                        "support specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Multi-Channel Support (Chat/Email/Phone).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Multi-Channel Support (Chat/Email/Phone).",
                "missingSignal": "No mention of Multi-Channel Support (Chat/Email/Phone) or related concepts in the CV."
            },
            {
                "skill": "Customer Feedback Analysis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "customer support",
                        "customer service representative",
                        "support specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Customer Feedback Analysis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Customer Feedback Analysis.",
                "missingSignal": "No mention of Customer Feedback Analysis or related concepts in the CV."
            },
            {
                "skill": "Process Documentation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "customer support",
                        "customer service representative",
                        "support specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Process Documentation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Process Documentation.",
                "missingSignal": "No mention of Process Documentation or related concepts in the CV."
            },
            {
                "skill": "Escalation Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "customer support",
                        "customer service representative",
                        "support specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Escalation Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Escalation Management.",
                "missingSignal": "No mention of Escalation Management or related concepts in the CV."
            },
            {
                "skill": "CSAT/NPS Improvement",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "customer support",
                        "customer service representative",
                        "support specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with CSAT/NPS Improvement.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to CSAT/NPS Improvement.",
                "missingSignal": "No mention of CSAT/NPS Improvement or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "risk_management_compliance",
        "skills": [
            {
                "skill": "Regulatory Compliance Frameworks",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "risk manager",
                        "compliance officer",
                        "compliance analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Regulatory Compliance Frameworks.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Regulatory Compliance Frameworks.",
                "missingSignal": "No mention of Regulatory Compliance Frameworks or related concepts in the CV."
            },
            {
                "skill": "Risk Assessment & Mitigation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "risk manager",
                        "compliance officer",
                        "compliance analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Risk Assessment & Mitigation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Risk Assessment & Mitigation.",
                "missingSignal": "No mention of Risk Assessment & Mitigation or related concepts in the CV."
            },
            {
                "skill": "Internal Controls Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "risk manager",
                        "compliance officer",
                        "compliance analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Internal Controls Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Internal Controls Design.",
                "missingSignal": "No mention of Internal Controls Design or related concepts in the CV."
            },
            {
                "skill": "Audit Coordination",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "risk manager",
                        "compliance officer",
                        "compliance analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Audit Coordination.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Audit Coordination.",
                "missingSignal": "No mention of Audit Coordination or related concepts in the CV."
            },
            {
                "skill": "Policy Development",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "risk manager",
                        "compliance officer",
                        "compliance analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Policy Development.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Policy Development.",
                "missingSignal": "No mention of Policy Development or related concepts in the CV."
            },
            {
                "skill": "AML/KYC (where applicable)",
                "evidence": {
                    "tools": [
                        "where applicable"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "risk manager",
                        "compliance officer",
                        "compliance analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with AML/KYC (where applicable).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to AML/KYC (where applicable).",
                "missingSignal": "No mention of AML/KYC (where applicable) or related concepts in the CV."
            },
            {
                "skill": "Compliance Reporting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "risk manager",
                        "compliance officer",
                        "compliance analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Compliance Reporting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Compliance Reporting.",
                "missingSignal": "No mention of Compliance Reporting or related concepts in the CV."
            },
            {
                "skill": "Incident Investigation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "risk manager",
                        "compliance officer",
                        "compliance analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Incident Investigation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Incident Investigation.",
                "missingSignal": "No mention of Incident Investigation or related concepts in the CV."
            },
            {
                "skill": "Governance Frameworks",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "risk manager",
                        "compliance officer",
                        "compliance analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Governance Frameworks.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Governance Frameworks.",
                "missingSignal": "No mention of Governance Frameworks or related concepts in the CV."
            },
            {
                "skill": "Training & Awareness Programs",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "risk manager",
                        "compliance officer",
                        "compliance analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Training & Awareness Programs.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Training & Awareness Programs.",
                "missingSignal": "No mention of Training & Awareness Programs or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "real_estate_property_mgmt",
        "skills": [
            {
                "skill": "Property Valuation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "real estate agent",
                        "property manager",
                        "leasing manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Property Valuation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Property Valuation.",
                "missingSignal": "No mention of Property Valuation or related concepts in the CV."
            },
            {
                "skill": "Lease Negotiation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "real estate agent",
                        "property manager",
                        "leasing manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Lease Negotiation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Lease Negotiation.",
                "missingSignal": "No mention of Lease Negotiation or related concepts in the CV."
            },
            {
                "skill": "Tenant Relationship Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "real estate agent",
                        "property manager",
                        "leasing manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Tenant Relationship Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Tenant Relationship Management.",
                "missingSignal": "No mention of Tenant Relationship Management or related concepts in the CV."
            },
            {
                "skill": "Property Maintenance Coordination",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "real estate agent",
                        "property manager",
                        "leasing manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Property Maintenance Coordination.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Property Maintenance Coordination.",
                "missingSignal": "No mention of Property Maintenance Coordination or related concepts in the CV."
            },
            {
                "skill": "Market Analysis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "real estate agent",
                        "property manager",
                        "leasing manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Market Analysis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Market Analysis.",
                "missingSignal": "No mention of Market Analysis or related concepts in the CV."
            },
            {
                "skill": "Real Estate Law Basics",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "real estate agent",
                        "property manager",
                        "leasing manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Real Estate Law Basics.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Real Estate Law Basics.",
                "missingSignal": "No mention of Real Estate Law Basics or related concepts in the CV."
            },
            {
                "skill": "Listing & Marketing Properties",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "real estate agent",
                        "property manager",
                        "leasing manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Listing & Marketing Properties.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Listing & Marketing Properties.",
                "missingSignal": "No mention of Listing & Marketing Properties or related concepts in the CV."
            },
            {
                "skill": "Facilities Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "real estate agent",
                        "property manager",
                        "leasing manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Facilities Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Facilities Management.",
                "missingSignal": "No mention of Facilities Management or related concepts in the CV."
            },
            {
                "skill": "Rent Collection & Budgeting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "real estate agent",
                        "property manager",
                        "leasing manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Rent Collection & Budgeting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Rent Collection & Budgeting.",
                "missingSignal": "No mention of Rent Collection & Budgeting or related concepts in the CV."
            },
            {
                "skill": "Client/Investor Reporting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "real estate agent",
                        "property manager",
                        "leasing manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Client/Investor Reporting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Client/Investor Reporting.",
                "missingSignal": "No mention of Client/Investor Reporting or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "hr_business_partner",
        "skills": [
            {
                "skill": "Employee Relations",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "hr business partner",
                        "hr generalist",
                        "hr manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Employee Relations.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Employee Relations.",
                "missingSignal": "No mention of Employee Relations or related concepts in the CV."
            },
            {
                "skill": "HR Policy Development",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "hr business partner",
                        "hr generalist",
                        "hr manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with HR Policy Development.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to HR Policy Development.",
                "missingSignal": "No mention of HR Policy Development or related concepts in the CV."
            },
            {
                "skill": "Performance Management Systems",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "hr business partner",
                        "hr generalist",
                        "hr manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Performance Management Systems.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Performance Management Systems.",
                "missingSignal": "No mention of Performance Management Systems or related concepts in the CV."
            },
            {
                "skill": "Workforce Planning",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "hr business partner",
                        "hr generalist",
                        "hr manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Workforce Planning.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Workforce Planning.",
                "missingSignal": "No mention of Workforce Planning or related concepts in the CV."
            },
            {
                "skill": "HRIS Systems",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "hr business partner",
                        "hr generalist",
                        "hr manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with HRIS Systems.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to HRIS Systems.",
                "missingSignal": "No mention of HRIS Systems or related concepts in the CV."
            },
            {
                "skill": "Labor Law Compliance",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "hr business partner",
                        "hr generalist",
                        "hr manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Labor Law Compliance.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Labor Law Compliance.",
                "missingSignal": "No mention of Labor Law Compliance or related concepts in the CV."
            },
            {
                "skill": "Organizational Development",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "hr business partner",
                        "hr generalist",
                        "hr manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Organizational Development.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Organizational Development.",
                "missingSignal": "No mention of Organizational Development or related concepts in the CV."
            },
            {
                "skill": "Conflict Resolution",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "hr business partner",
                        "hr generalist",
                        "hr manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Conflict Resolution.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Conflict Resolution.",
                "missingSignal": "No mention of Conflict Resolution or related concepts in the CV."
            },
            {
                "skill": "Onboarding/Offboarding Processes",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "hr business partner",
                        "hr generalist",
                        "hr manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Onboarding/Offboarding Processes.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Onboarding/Offboarding Processes.",
                "missingSignal": "No mention of Onboarding/Offboarding Processes or related concepts in the CV."
            },
            {
                "skill": "Stakeholder Consulting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "hr business partner",
                        "hr generalist",
                        "hr manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Stakeholder Consulting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Stakeholder Consulting.",
                "missingSignal": "No mention of Stakeholder Consulting or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "talent_acquisition_recruiting",
        "skills": [
            {
                "skill": "Sourcing Strategies (Boolean/LinkedIn)",
                "evidence": {
                    "tools": [
                        "Boolean",
                        "LinkedIn"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "recruiter",
                        "talent acquisition",
                        "technical recruiter"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Sourcing Strategies (Boolean/LinkedIn).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Sourcing Strategies (Boolean/LinkedIn).",
                "missingSignal": "No mention of Sourcing Strategies (Boolean/LinkedIn) or related concepts in the CV."
            },
            {
                "skill": "Applicant Tracking Systems (ATS)",
                "evidence": {
                    "tools": [
                        "ATS"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "recruiter",
                        "talent acquisition",
                        "technical recruiter"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Applicant Tracking Systems (ATS).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Applicant Tracking Systems (ATS).",
                "missingSignal": "No mention of Applicant Tracking Systems (ATS) or related concepts in the CV."
            },
            {
                "skill": "Candidate Screening & Interviewing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "recruiter",
                        "talent acquisition",
                        "technical recruiter"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Candidate Screening & Interviewing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Candidate Screening & Interviewing.",
                "missingSignal": "No mention of Candidate Screening & Interviewing or related concepts in the CV."
            },
            {
                "skill": "Employer Branding",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "recruiter",
                        "talent acquisition",
                        "technical recruiter"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Employer Branding.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Employer Branding.",
                "missingSignal": "No mention of Employer Branding or related concepts in the CV."
            },
            {
                "skill": "Pipeline Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "recruiter",
                        "talent acquisition",
                        "technical recruiter"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Pipeline Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Pipeline Management.",
                "missingSignal": "No mention of Pipeline Management or related concepts in the CV."
            },
            {
                "skill": "Offer Negotiation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "recruiter",
                        "talent acquisition",
                        "technical recruiter"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Offer Negotiation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Offer Negotiation.",
                "missingSignal": "No mention of Offer Negotiation or related concepts in the CV."
            },
            {
                "skill": "Diversity Hiring Practices",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "recruiter",
                        "talent acquisition",
                        "technical recruiter"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Diversity Hiring Practices.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Diversity Hiring Practices.",
                "missingSignal": "No mention of Diversity Hiring Practices or related concepts in the CV."
            },
            {
                "skill": "Job Description Writing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "recruiter",
                        "talent acquisition",
                        "technical recruiter"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Job Description Writing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Job Description Writing.",
                "missingSignal": "No mention of Job Description Writing or related concepts in the CV."
            },
            {
                "skill": "Stakeholder/Hiring Manager Partnership",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "recruiter",
                        "talent acquisition",
                        "technical recruiter"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Stakeholder/Hiring Manager Partnership.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Stakeholder/Hiring Manager Partnership.",
                "missingSignal": "No mention of Stakeholder/Hiring Manager Partnership or related concepts in the CV."
            },
            {
                "skill": "Recruitment Metrics & Reporting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "recruiter",
                        "talent acquisition",
                        "technical recruiter"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Recruitment Metrics & Reporting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Recruitment Metrics & Reporting.",
                "missingSignal": "No mention of Recruitment Metrics & Reporting or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "compensation_benefits",
        "skills": [
            {
                "skill": "Salary Benchmarking",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "compensation analyst",
                        "benefits manager",
                        "total rewards"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Salary Benchmarking.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Salary Benchmarking.",
                "missingSignal": "No mention of Salary Benchmarking or related concepts in the CV."
            },
            {
                "skill": "Compensation Structure Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "compensation analyst",
                        "benefits manager",
                        "total rewards"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Compensation Structure Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Compensation Structure Design.",
                "missingSignal": "No mention of Compensation Structure Design or related concepts in the CV."
            },
            {
                "skill": "Benefits Administration",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "compensation analyst",
                        "benefits manager",
                        "total rewards"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Benefits Administration.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Benefits Administration.",
                "missingSignal": "No mention of Benefits Administration or related concepts in the CV."
            },
            {
                "skill": "Pay Equity Analysis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "compensation analyst",
                        "benefits manager",
                        "total rewards"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Pay Equity Analysis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Pay Equity Analysis.",
                "missingSignal": "No mention of Pay Equity Analysis or related concepts in the CV."
            },
            {
                "skill": "Incentive/Bonus Program Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "compensation analyst",
                        "benefits manager",
                        "total rewards"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Incentive/Bonus Program Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Incentive/Bonus Program Design.",
                "missingSignal": "No mention of Incentive/Bonus Program Design or related concepts in the CV."
            },
            {
                "skill": "HRIS & Payroll Systems",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "compensation analyst",
                        "benefits manager",
                        "total rewards"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with HRIS & Payroll Systems.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to HRIS & Payroll Systems.",
                "missingSignal": "No mention of HRIS & Payroll Systems or related concepts in the CV."
            },
            {
                "skill": "Regulatory Compliance (Compensation)",
                "evidence": {
                    "tools": [
                        "Compensation"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "compensation analyst",
                        "benefits manager",
                        "total rewards"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Regulatory Compliance (Compensation).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Regulatory Compliance (Compensation).",
                "missingSignal": "No mention of Regulatory Compliance (Compensation) or related concepts in the CV."
            },
            {
                "skill": "Job Evaluation & Leveling",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "compensation analyst",
                        "benefits manager",
                        "total rewards"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Job Evaluation & Leveling.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Job Evaluation & Leveling.",
                "missingSignal": "No mention of Job Evaluation & Leveling or related concepts in the CV."
            },
            {
                "skill": "Total Rewards Strategy",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "compensation analyst",
                        "benefits manager",
                        "total rewards"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Total Rewards Strategy.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Total Rewards Strategy.",
                "missingSignal": "No mention of Total Rewards Strategy or related concepts in the CV."
            },
            {
                "skill": "Market Survey Analysis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "compensation analyst",
                        "benefits manager",
                        "total rewards"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Market Survey Analysis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Market Survey Analysis.",
                "missingSignal": "No mention of Market Survey Analysis or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "employee_relations_culture",
        "skills": [
            {
                "skill": "Conflict Mediation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "employee relations",
                        "culture manager",
                        "people experience"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Conflict Mediation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Conflict Mediation.",
                "missingSignal": "No mention of Conflict Mediation or related concepts in the CV."
            },
            {
                "skill": "Investigations & Grievance Handling",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "employee relations",
                        "culture manager",
                        "people experience"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Investigations & Grievance Handling.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Investigations & Grievance Handling.",
                "missingSignal": "No mention of Investigations & Grievance Handling or related concepts in the CV."
            },
            {
                "skill": "Culture & Engagement Programs",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "employee relations",
                        "culture manager",
                        "people experience"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Culture & Engagement Programs.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Culture & Engagement Programs.",
                "missingSignal": "No mention of Culture & Engagement Programs or related concepts in the CV."
            },
            {
                "skill": "Policy Interpretation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "employee relations",
                        "culture manager",
                        "people experience"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Policy Interpretation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Policy Interpretation.",
                "missingSignal": "No mention of Policy Interpretation or related concepts in the CV."
            },
            {
                "skill": "Employee Engagement Surveys",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "employee relations",
                        "culture manager",
                        "people experience"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Employee Engagement Surveys.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Employee Engagement Surveys.",
                "missingSignal": "No mention of Employee Engagement Surveys or related concepts in the CV."
            },
            {
                "skill": "DEI Initiatives",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "employee relations",
                        "culture manager",
                        "people experience"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with DEI Initiatives.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to DEI Initiatives.",
                "missingSignal": "No mention of DEI Initiatives or related concepts in the CV."
            },
            {
                "skill": "Labor Relations",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "employee relations",
                        "culture manager",
                        "people experience"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Labor Relations.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Labor Relations.",
                "missingSignal": "No mention of Labor Relations or related concepts in the CV."
            },
            {
                "skill": "Performance Improvement Plans",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "employee relations",
                        "culture manager",
                        "people experience"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Performance Improvement Plans.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Performance Improvement Plans.",
                "missingSignal": "No mention of Performance Improvement Plans or related concepts in the CV."
            },
            {
                "skill": "Workplace Investigations",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "employee relations",
                        "culture manager",
                        "people experience"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Workplace Investigations.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Workplace Investigations.",
                "missingSignal": "No mention of Workplace Investigations or related concepts in the CV."
            },
            {
                "skill": "Change Communication",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "employee relations",
                        "culture manager",
                        "people experience"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Change Communication.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Change Communication.",
                "missingSignal": "No mention of Change Communication or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "executive_admin_assistance",
        "skills": [
            {
                "skill": "Calendar & Scheduling Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "executive assistant",
                        "administrative assistant",
                        "office manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Calendar & Scheduling Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Calendar & Scheduling Management.",
                "missingSignal": "No mention of Calendar & Scheduling Management or related concepts in the CV."
            },
            {
                "skill": "Travel Coordination",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "executive assistant",
                        "administrative assistant",
                        "office manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Travel Coordination.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Travel Coordination.",
                "missingSignal": "No mention of Travel Coordination or related concepts in the CV."
            },
            {
                "skill": "Document Preparation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "executive assistant",
                        "administrative assistant",
                        "office manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Document Preparation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Document Preparation.",
                "missingSignal": "No mention of Document Preparation or related concepts in the CV."
            },
            {
                "skill": "Meeting/Board Prep & Minutes",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "executive assistant",
                        "administrative assistant",
                        "office manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Meeting/Board Prep & Minutes.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Meeting/Board Prep & Minutes.",
                "missingSignal": "No mention of Meeting/Board Prep & Minutes or related concepts in the CV."
            },
            {
                "skill": "Office Administration",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "executive assistant",
                        "administrative assistant",
                        "office manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Office Administration.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Office Administration.",
                "missingSignal": "No mention of Office Administration or related concepts in the CV."
            },
            {
                "skill": "Confidentiality & Discretion",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "executive assistant",
                        "administrative assistant",
                        "office manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Confidentiality & Discretion.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Confidentiality & Discretion.",
                "missingSignal": "No mention of Confidentiality & Discretion or related concepts in the CV."
            },
            {
                "skill": "Expense Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "executive assistant",
                        "administrative assistant",
                        "office manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Expense Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Expense Management.",
                "missingSignal": "No mention of Expense Management or related concepts in the CV."
            },
            {
                "skill": "Vendor Coordination",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "executive assistant",
                        "administrative assistant",
                        "office manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Vendor Coordination.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Vendor Coordination.",
                "missingSignal": "No mention of Vendor Coordination or related concepts in the CV."
            },
            {
                "skill": "Communication on Behalf of Executives",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "executive assistant",
                        "administrative assistant",
                        "office manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Communication on Behalf of Executives.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Communication on Behalf of Executives.",
                "missingSignal": "No mention of Communication on Behalf of Executives or related concepts in the CV."
            },
            {
                "skill": "Multi-Priority Task Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "executive assistant",
                        "administrative assistant",
                        "office manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Multi-Priority Task Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Multi-Priority Task Management.",
                "missingSignal": "No mention of Multi-Priority Task Management or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "financial_analysis_fpa",
        "skills": [
            {
                "skill": "Financial Modeling",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "fp&a",
                        "financial analyst",
                        "finance analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Financial Modeling.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Financial Modeling.",
                "missingSignal": "No mention of Financial Modeling or related concepts in the CV."
            },
            {
                "skill": "Budgeting & Forecasting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "fp&a",
                        "financial analyst",
                        "finance analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Budgeting & Forecasting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Budgeting & Forecasting.",
                "missingSignal": "No mention of Budgeting & Forecasting or related concepts in the CV."
            },
            {
                "skill": "Variance Analysis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "fp&a",
                        "financial analyst",
                        "finance analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Variance Analysis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Variance Analysis.",
                "missingSignal": "No mention of Variance Analysis or related concepts in the CV."
            },
            {
                "skill": "Excel Advanced Modeling",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "fp&a",
                        "financial analyst",
                        "finance analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Excel Advanced Modeling.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Excel Advanced Modeling.",
                "missingSignal": "No mention of Excel Advanced Modeling or related concepts in the CV."
            },
            {
                "skill": "Financial Reporting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "fp&a",
                        "financial analyst",
                        "finance analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Financial Reporting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Financial Reporting.",
                "missingSignal": "No mention of Financial Reporting or related concepts in the CV."
            },
            {
                "skill": "Scenario/Sensitivity Analysis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "fp&a",
                        "financial analyst",
                        "finance analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Scenario/Sensitivity Analysis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Scenario/Sensitivity Analysis.",
                "missingSignal": "No mention of Scenario/Sensitivity Analysis or related concepts in the CV."
            },
            {
                "skill": "KPI Dashboarding",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "fp&a",
                        "financial analyst",
                        "finance analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with KPI Dashboarding.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to KPI Dashboarding.",
                "missingSignal": "No mention of KPI Dashboarding or related concepts in the CV."
            },
            {
                "skill": "ERP Systems (SAP/Oracle/NetSuite)",
                "evidence": {
                    "tools": [
                        "SAP",
                        "Oracle",
                        "NetSuite"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "fp&a",
                        "financial analyst",
                        "finance analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with ERP Systems (SAP/Oracle/NetSuite).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to ERP Systems (SAP/Oracle/NetSuite).",
                "missingSignal": "No mention of ERP Systems (SAP/Oracle/NetSuite) or related concepts in the CV."
            },
            {
                "skill": "Cash Flow Analysis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "fp&a",
                        "financial analyst",
                        "finance analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Cash Flow Analysis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Cash Flow Analysis.",
                "missingSignal": "No mention of Cash Flow Analysis or related concepts in the CV."
            },
            {
                "skill": "Business Partnering",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "fp&a",
                        "financial analyst",
                        "finance analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Business Partnering.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Business Partnering.",
                "missingSignal": "No mention of Business Partnering or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "corporate_finance_ib",
        "skills": [
            {
                "skill": "Valuation Modeling (DCF/Comps)",
                "evidence": {
                    "tools": [
                        "DCF",
                        "Comps"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "investment banker",
                        "corporate finance",
                        "m&a analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Valuation Modeling (DCF/Comps).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Valuation Modeling (DCF/Comps).",
                "missingSignal": "No mention of Valuation Modeling (DCF/Comps) or related concepts in the CV."
            },
            {
                "skill": "M&A Analysis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "investment banker",
                        "corporate finance",
                        "m&a analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with M&A Analysis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to M&A Analysis.",
                "missingSignal": "No mention of M&A Analysis or related concepts in the CV."
            },
            {
                "skill": "Capital Raising/Structuring",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "investment banker",
                        "corporate finance",
                        "m&a analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Capital Raising/Structuring.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Capital Raising/Structuring.",
                "missingSignal": "No mention of Capital Raising/Structuring or related concepts in the CV."
            },
            {
                "skill": "Financial Statement Analysis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "investment banker",
                        "corporate finance",
                        "m&a analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Financial Statement Analysis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Financial Statement Analysis.",
                "missingSignal": "No mention of Financial Statement Analysis or related concepts in the CV."
            },
            {
                "skill": "Pitch Book Creation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "investment banker",
                        "corporate finance",
                        "m&a analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Pitch Book Creation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Pitch Book Creation.",
                "missingSignal": "No mention of Pitch Book Creation or related concepts in the CV."
            },
            {
                "skill": "Due Diligence",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "investment banker",
                        "corporate finance",
                        "m&a analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Due Diligence.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Due Diligence.",
                "missingSignal": "No mention of Due Diligence or related concepts in the CV."
            },
            {
                "skill": "LBO Modeling",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "investment banker",
                        "corporate finance",
                        "m&a analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with LBO Modeling.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to LBO Modeling.",
                "missingSignal": "No mention of LBO Modeling or related concepts in the CV."
            },
            {
                "skill": "Market Research",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "investment banker",
                        "corporate finance",
                        "m&a analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Market Research.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Market Research.",
                "missingSignal": "No mention of Market Research or related concepts in the CV."
            },
            {
                "skill": "Deal Structuring",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "investment banker",
                        "corporate finance",
                        "m&a analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Deal Structuring.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Deal Structuring.",
                "missingSignal": "No mention of Deal Structuring or related concepts in the CV."
            },
            {
                "skill": "Client/Investor Relations",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "investment banker",
                        "corporate finance",
                        "m&a analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Client/Investor Relations.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Client/Investor Relations.",
                "missingSignal": "No mention of Client/Investor Relations or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "accounting_bookkeeping",
        "skills": [
            {
                "skill": "General Ledger Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "accountant",
                        "bookkeeper",
                        "accounts payable"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with General Ledger Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to General Ledger Management.",
                "missingSignal": "No mention of General Ledger Management or related concepts in the CV."
            },
            {
                "skill": "Accounts Payable/Receivable",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "accountant",
                        "bookkeeper",
                        "accounts payable"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Accounts Payable/Receivable.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Accounts Payable/Receivable.",
                "missingSignal": "No mention of Accounts Payable/Receivable or related concepts in the CV."
            },
            {
                "skill": "Financial Statement Preparation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "accountant",
                        "bookkeeper",
                        "accounts payable"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Financial Statement Preparation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Financial Statement Preparation.",
                "missingSignal": "No mention of Financial Statement Preparation or related concepts in the CV."
            },
            {
                "skill": "Reconciliations",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "accountant",
                        "bookkeeper",
                        "accounts payable"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Reconciliations.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Reconciliations.",
                "missingSignal": "No mention of Reconciliations or related concepts in the CV."
            },
            {
                "skill": "Accounting Software (QuickBooks/Xero/Sage)",
                "evidence": {
                    "tools": [
                        "QuickBooks",
                        "Xero",
                        "Sage"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "accountant",
                        "bookkeeper",
                        "accounts payable"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Accounting Software (QuickBooks/Xero/Sage).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Accounting Software (QuickBooks/Xero/Sage).",
                "missingSignal": "No mention of Accounting Software (QuickBooks/Xero/Sage) or related concepts in the CV."
            },
            {
                "skill": "GAAP/IFRS Compliance",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "accountant",
                        "bookkeeper",
                        "accounts payable"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with GAAP/IFRS Compliance.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to GAAP/IFRS Compliance.",
                "missingSignal": "No mention of GAAP/IFRS Compliance or related concepts in the CV."
            },
            {
                "skill": "Month-End/Year-End Close",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "accountant",
                        "bookkeeper",
                        "accounts payable"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Month-End/Year-End Close.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Month-End/Year-End Close.",
                "missingSignal": "No mention of Month-End/Year-End Close or related concepts in the CV."
            },
            {
                "skill": "Payroll Processing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "accountant",
                        "bookkeeper",
                        "accounts payable"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Payroll Processing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Payroll Processing.",
                "missingSignal": "No mention of Payroll Processing or related concepts in the CV."
            },
            {
                "skill": "Tax Filing Support",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "accountant",
                        "bookkeeper",
                        "accounts payable"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Tax Filing Support.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Tax Filing Support.",
                "missingSignal": "No mention of Tax Filing Support or related concepts in the CV."
            },
            {
                "skill": "Audit Preparation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "accountant",
                        "bookkeeper",
                        "accounts payable"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Audit Preparation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Audit Preparation.",
                "missingSignal": "No mention of Audit Preparation or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "tax_strategy_audit",
        "skills": [
            {
                "skill": "Tax Compliance & Filing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "tax accountant",
                        "tax advisor",
                        "auditor"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Tax Compliance & Filing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Tax Compliance & Filing.",
                "missingSignal": "No mention of Tax Compliance & Filing or related concepts in the CV."
            },
            {
                "skill": "Tax Planning & Strategy",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "tax accountant",
                        "tax advisor",
                        "auditor"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Tax Planning & Strategy.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Tax Planning & Strategy.",
                "missingSignal": "No mention of Tax Planning & Strategy or related concepts in the CV."
            },
            {
                "skill": "Audit Procedures",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "tax accountant",
                        "tax advisor",
                        "auditor"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Audit Procedures.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Audit Procedures.",
                "missingSignal": "No mention of Audit Procedures or related concepts in the CV."
            },
            {
                "skill": "Regulatory Research (Local Tax Codes)",
                "evidence": {
                    "tools": [
                        "Local Tax Codes"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "tax accountant",
                        "tax advisor",
                        "auditor"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Regulatory Research (Local Tax Codes).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Regulatory Research (Local Tax Codes).",
                "missingSignal": "No mention of Regulatory Research (Local Tax Codes) or related concepts in the CV."
            },
            {
                "skill": "Transfer Pricing Basics",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "tax accountant",
                        "tax advisor",
                        "auditor"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Transfer Pricing Basics.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Transfer Pricing Basics.",
                "missingSignal": "No mention of Transfer Pricing Basics or related concepts in the CV."
            },
            {
                "skill": "Internal Controls Testing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "tax accountant",
                        "tax advisor",
                        "auditor"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Internal Controls Testing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Internal Controls Testing.",
                "missingSignal": "No mention of Internal Controls Testing or related concepts in the CV."
            },
            {
                "skill": "Risk-Based Auditing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "tax accountant",
                        "tax advisor",
                        "auditor"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Risk-Based Auditing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Risk-Based Auditing.",
                "missingSignal": "No mention of Risk-Based Auditing or related concepts in the CV."
            },
            {
                "skill": "Financial Statement Audit",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "tax accountant",
                        "tax advisor",
                        "auditor"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Financial Statement Audit.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Financial Statement Audit.",
                "missingSignal": "No mention of Financial Statement Audit or related concepts in the CV."
            },
            {
                "skill": "Tax Software Proficiency",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "tax accountant",
                        "tax advisor",
                        "auditor"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Tax Software Proficiency.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Tax Software Proficiency.",
                "missingSignal": "No mention of Tax Software Proficiency or related concepts in the CV."
            },
            {
                "skill": "Client Advisory",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "tax accountant",
                        "tax advisor",
                        "auditor"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Client Advisory.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Client Advisory.",
                "missingSignal": "No mention of Client Advisory or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "corporate_law_counsel",
        "skills": [
            {
                "skill": "Contract Drafting & Negotiation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "corporate lawyer",
                        "in-house counsel",
                        "general counsel"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Contract Drafting & Negotiation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Contract Drafting & Negotiation.",
                "missingSignal": "No mention of Contract Drafting & Negotiation or related concepts in the CV."
            },
            {
                "skill": "Corporate Governance",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "corporate lawyer",
                        "in-house counsel",
                        "general counsel"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Corporate Governance.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Corporate Governance.",
                "missingSignal": "No mention of Corporate Governance or related concepts in the CV."
            },
            {
                "skill": "Regulatory Compliance",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "corporate lawyer",
                        "in-house counsel",
                        "general counsel"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Regulatory Compliance.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Regulatory Compliance.",
                "missingSignal": "No mention of Regulatory Compliance or related concepts in the CV."
            },
            {
                "skill": "Mergers & Acquisitions Support",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "corporate lawyer",
                        "in-house counsel",
                        "general counsel"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Mergers & Acquisitions Support.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Mergers & Acquisitions Support.",
                "missingSignal": "No mention of Mergers & Acquisitions Support or related concepts in the CV."
            },
            {
                "skill": "Risk Management (Legal)",
                "evidence": {
                    "tools": [
                        "Legal"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "corporate lawyer",
                        "in-house counsel",
                        "general counsel"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Risk Management (Legal).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Risk Management (Legal).",
                "missingSignal": "No mention of Risk Management (Legal) or related concepts in the CV."
            },
            {
                "skill": "Intellectual Property Basics",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "corporate lawyer",
                        "in-house counsel",
                        "general counsel"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Intellectual Property Basics.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Intellectual Property Basics.",
                "missingSignal": "No mention of Intellectual Property Basics or related concepts in the CV."
            },
            {
                "skill": "Employment Law Advisory",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "corporate lawyer",
                        "in-house counsel",
                        "general counsel"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Employment Law Advisory.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Employment Law Advisory.",
                "missingSignal": "No mention of Employment Law Advisory or related concepts in the CV."
            },
            {
                "skill": "Dispute Resolution",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "corporate lawyer",
                        "in-house counsel",
                        "general counsel"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Dispute Resolution.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Dispute Resolution.",
                "missingSignal": "No mention of Dispute Resolution or related concepts in the CV."
            },
            {
                "skill": "Legal Research",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "corporate lawyer",
                        "in-house counsel",
                        "general counsel"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Legal Research.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Legal Research.",
                "missingSignal": "No mention of Legal Research or related concepts in the CV."
            },
            {
                "skill": "Cross-Border Transaction Support",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "corporate lawyer",
                        "in-house counsel",
                        "general counsel"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Cross-Border Transaction Support.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Cross-Border Transaction Support.",
                "missingSignal": "No mention of Cross-Border Transaction Support or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "paralegal_legal_support",
        "skills": [
            {
                "skill": "Legal Document Drafting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "paralegal",
                        "legal assistant",
                        "legal secretary"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Legal Document Drafting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Legal Document Drafting.",
                "missingSignal": "No mention of Legal Document Drafting or related concepts in the CV."
            },
            {
                "skill": "Legal Research",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "paralegal",
                        "legal assistant",
                        "legal secretary"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Legal Research.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Legal Research.",
                "missingSignal": "No mention of Legal Research or related concepts in the CV."
            },
            {
                "skill": "Case File Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "paralegal",
                        "legal assistant",
                        "legal secretary"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Case File Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Case File Management.",
                "missingSignal": "No mention of Case File Management or related concepts in the CV."
            },
            {
                "skill": "Court Filing Procedures",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "paralegal",
                        "legal assistant",
                        "legal secretary"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Court Filing Procedures.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Court Filing Procedures.",
                "missingSignal": "No mention of Court Filing Procedures or related concepts in the CV."
            },
            {
                "skill": "Client Intake & Communication",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "paralegal",
                        "legal assistant",
                        "legal secretary"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Client Intake & Communication.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Client Intake & Communication.",
                "missingSignal": "No mention of Client Intake & Communication or related concepts in the CV."
            },
            {
                "skill": "Discovery & Evidence Organization",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "paralegal",
                        "legal assistant",
                        "legal secretary"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Discovery & Evidence Organization.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Discovery & Evidence Organization.",
                "missingSignal": "No mention of Discovery & Evidence Organization or related concepts in the CV."
            },
            {
                "skill": "Contract Review Support",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "paralegal",
                        "legal assistant",
                        "legal secretary"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Contract Review Support.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Contract Review Support.",
                "missingSignal": "No mention of Contract Review Support or related concepts in the CV."
            },
            {
                "skill": "Billing/Time Tracking",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "paralegal",
                        "legal assistant",
                        "legal secretary"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Billing/Time Tracking.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Billing/Time Tracking.",
                "missingSignal": "No mention of Billing/Time Tracking or related concepts in the CV."
            },
            {
                "skill": "Litigation Support",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "paralegal",
                        "legal assistant",
                        "legal secretary"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Litigation Support.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Litigation Support.",
                "missingSignal": "No mention of Litigation Support or related concepts in the CV."
            },
            {
                "skill": "Regulatory Filing Assistance",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "paralegal",
                        "legal assistant",
                        "legal secretary"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Regulatory Filing Assistance.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Regulatory Filing Assistance.",
                "missingSignal": "No mention of Regulatory Filing Assistance or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "clinical_nursing",
        "skills": [
            {
                "skill": "Patient Assessment",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "registered nurse",
                        "rn",
                        "lpn"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Patient Assessment.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Patient Assessment.",
                "missingSignal": "No mention of Patient Assessment or related concepts in the CV."
            },
            {
                "skill": "Medication Administration",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "registered nurse",
                        "rn",
                        "lpn"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Medication Administration.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Medication Administration.",
                "missingSignal": "No mention of Medication Administration or related concepts in the CV."
            },
            {
                "skill": "Electronic Health Records (EHR/EMR)",
                "evidence": {
                    "tools": [
                        "EHR",
                        "EMR"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "registered nurse",
                        "rn",
                        "lpn"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Electronic Health Records (EHR/EMR).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Electronic Health Records (EHR/EMR).",
                "missingSignal": "No mention of Electronic Health Records (EHR/EMR) or related concepts in the CV."
            },
            {
                "skill": "Care Plan Development",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "registered nurse",
                        "rn",
                        "lpn"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Care Plan Development.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Care Plan Development.",
                "missingSignal": "No mention of Care Plan Development or related concepts in the CV."
            },
            {
                "skill": "Clinical Documentation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "registered nurse",
                        "rn",
                        "lpn"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Clinical Documentation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Clinical Documentation.",
                "missingSignal": "No mention of Clinical Documentation or related concepts in the CV."
            },
            {
                "skill": "Vital Signs Monitoring",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "registered nurse",
                        "rn",
                        "lpn"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Vital Signs Monitoring.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Vital Signs Monitoring.",
                "missingSignal": "No mention of Vital Signs Monitoring or related concepts in the CV."
            },
            {
                "skill": "Infection Control Protocols",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "registered nurse",
                        "rn",
                        "lpn"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Infection Control Protocols.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Infection Control Protocols.",
                "missingSignal": "No mention of Infection Control Protocols or related concepts in the CV."
            },
            {
                "skill": "Patient/Family Education",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "registered nurse",
                        "rn",
                        "lpn"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Patient/Family Education.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Patient/Family Education.",
                "missingSignal": "No mention of Patient/Family Education or related concepts in the CV."
            },
            {
                "skill": "Emergency Response",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "registered nurse",
                        "rn",
                        "lpn"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Emergency Response.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Emergency Response.",
                "missingSignal": "No mention of Emergency Response or related concepts in the CV."
            },
            {
                "skill": "Interdisciplinary Team Coordination",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "registered nurse",
                        "rn",
                        "lpn"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Interdisciplinary Team Coordination.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Interdisciplinary Team Coordination.",
                "missingSignal": "No mention of Interdisciplinary Team Coordination or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "physicians_medical_specialists",
        "skills": [
            {
                "skill": "Diagnosis & Clinical Decision-Making",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "physician",
                        "doctor",
                        "md"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Diagnosis & Clinical Decision-Making.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Diagnosis & Clinical Decision-Making.",
                "missingSignal": "No mention of Diagnosis & Clinical Decision-Making or related concepts in the CV."
            },
            {
                "skill": "Patient History & Examination",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "physician",
                        "doctor",
                        "md"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Patient History & Examination.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Patient History & Examination.",
                "missingSignal": "No mention of Patient History & Examination or related concepts in the CV."
            },
            {
                "skill": "Treatment Planning",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "physician",
                        "doctor",
                        "md"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Treatment Planning.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Treatment Planning.",
                "missingSignal": "No mention of Treatment Planning or related concepts in the CV."
            },
            {
                "skill": "Medical Procedure Competency",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "physician",
                        "doctor",
                        "md"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Medical Procedure Competency.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Medical Procedure Competency.",
                "missingSignal": "No mention of Medical Procedure Competency or related concepts in the CV."
            },
            {
                "skill": "EHR Documentation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "physician",
                        "doctor",
                        "md"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with EHR Documentation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to EHR Documentation.",
                "missingSignal": "No mention of EHR Documentation or related concepts in the CV."
            },
            {
                "skill": "Pharmacology Knowledge",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "physician",
                        "doctor",
                        "md"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Pharmacology Knowledge.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Pharmacology Knowledge.",
                "missingSignal": "No mention of Pharmacology Knowledge or related concepts in the CV."
            },
            {
                "skill": "Evidence-Based Medicine",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "physician",
                        "doctor",
                        "md"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Evidence-Based Medicine.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Evidence-Based Medicine.",
                "missingSignal": "No mention of Evidence-Based Medicine or related concepts in the CV."
            },
            {
                "skill": "Patient Communication",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "physician",
                        "doctor",
                        "md"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Patient Communication.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Patient Communication.",
                "missingSignal": "No mention of Patient Communication or related concepts in the CV."
            },
            {
                "skill": "Specialty-Specific Certifications",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "physician",
                        "doctor",
                        "md"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Specialty-Specific Certifications.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Specialty-Specific Certifications.",
                "missingSignal": "No mention of Specialty-Specific Certifications or related concepts in the CV."
            },
            {
                "skill": "Continuing Medical Education",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "physician",
                        "doctor",
                        "md"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Continuing Medical Education.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Continuing Medical Education.",
                "missingSignal": "No mention of Continuing Medical Education or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "medical_admin_billing_coding",
        "skills": [
            {
                "skill": "ICD-10/CPT Coding",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "medical biller",
                        "medical coder",
                        "health information"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with ICD-10/CPT Coding.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to ICD-10/CPT Coding.",
                "missingSignal": "No mention of ICD-10/CPT Coding or related concepts in the CV."
            },
            {
                "skill": "Medical Billing Systems",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "medical biller",
                        "medical coder",
                        "health information"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Medical Billing Systems.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Medical Billing Systems.",
                "missingSignal": "No mention of Medical Billing Systems or related concepts in the CV."
            },
            {
                "skill": "Insurance Claims Processing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "medical biller",
                        "medical coder",
                        "health information"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Insurance Claims Processing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Insurance Claims Processing.",
                "missingSignal": "No mention of Insurance Claims Processing or related concepts in the CV."
            },
            {
                "skill": "HIPAA Compliance",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "medical biller",
                        "medical coder",
                        "health information"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with HIPAA Compliance.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to HIPAA Compliance.",
                "missingSignal": "No mention of HIPAA Compliance or related concepts in the CV."
            },
            {
                "skill": "EHR Systems",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "medical biller",
                        "medical coder",
                        "health information"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with EHR Systems.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to EHR Systems.",
                "missingSignal": "No mention of EHR Systems or related concepts in the CV."
            },
            {
                "skill": "Revenue Cycle Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "medical biller",
                        "medical coder",
                        "health information"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Revenue Cycle Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Revenue Cycle Management.",
                "missingSignal": "No mention of Revenue Cycle Management or related concepts in the CV."
            },
            {
                "skill": "Patient Scheduling",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "medical biller",
                        "medical coder",
                        "health information"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Patient Scheduling.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Patient Scheduling.",
                "missingSignal": "No mention of Patient Scheduling or related concepts in the CV."
            },
            {
                "skill": "Denial Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "medical biller",
                        "medical coder",
                        "health information"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Denial Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Denial Management.",
                "missingSignal": "No mention of Denial Management or related concepts in the CV."
            },
            {
                "skill": "Medical Terminology",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "medical biller",
                        "medical coder",
                        "health information"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Medical Terminology.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Medical Terminology.",
                "missingSignal": "No mention of Medical Terminology or related concepts in the CV."
            },
            {
                "skill": "Health Records Auditing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "medical biller",
                        "medical coder",
                        "health information"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Health Records Auditing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Health Records Auditing.",
                "missingSignal": "No mention of Health Records Auditing or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "pharmacy_pharmacology",
        "skills": [
            {
                "skill": "Prescription Verification & Dispensing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "pharmacist",
                        "pharmacy technician",
                        "pharmacology"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Prescription Verification & Dispensing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Prescription Verification & Dispensing.",
                "missingSignal": "No mention of Prescription Verification & Dispensing or related concepts in the CV."
            },
            {
                "skill": "Drug Interaction Checking",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "pharmacist",
                        "pharmacy technician",
                        "pharmacology"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Drug Interaction Checking.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Drug Interaction Checking.",
                "missingSignal": "No mention of Drug Interaction Checking or related concepts in the CV."
            },
            {
                "skill": "Pharmaceutical Compounding",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "pharmacist",
                        "pharmacy technician",
                        "pharmacology"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Pharmaceutical Compounding.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Pharmaceutical Compounding.",
                "missingSignal": "No mention of Pharmaceutical Compounding or related concepts in the CV."
            },
            {
                "skill": "Patient Counseling",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "pharmacist",
                        "pharmacy technician",
                        "pharmacology"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Patient Counseling.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Patient Counseling.",
                "missingSignal": "No mention of Patient Counseling or related concepts in the CV."
            },
            {
                "skill": "Inventory & Controlled Substance Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "pharmacist",
                        "pharmacy technician",
                        "pharmacology"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Inventory & Controlled Substance Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Inventory & Controlled Substance Management.",
                "missingSignal": "No mention of Inventory & Controlled Substance Management or related concepts in the CV."
            },
            {
                "skill": "Pharmacy Software Systems",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "pharmacist",
                        "pharmacy technician",
                        "pharmacology"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Pharmacy Software Systems.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Pharmacy Software Systems.",
                "missingSignal": "No mention of Pharmacy Software Systems or related concepts in the CV."
            },
            {
                "skill": "Regulatory Compliance (FDA/Pharmacy Board)",
                "evidence": {
                    "tools": [
                        "FDA",
                        "Pharmacy Board"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "pharmacist",
                        "pharmacy technician",
                        "pharmacology"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Regulatory Compliance (FDA/Pharmacy Board).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Regulatory Compliance (FDA/Pharmacy Board).",
                "missingSignal": "No mention of Regulatory Compliance (FDA/Pharmacy Board) or related concepts in the CV."
            },
            {
                "skill": "Dosage Calculations",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "pharmacist",
                        "pharmacy technician",
                        "pharmacology"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Dosage Calculations.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Dosage Calculations.",
                "missingSignal": "No mention of Dosage Calculations or related concepts in the CV."
            },
            {
                "skill": "Clinical Pharmacology Knowledge",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "pharmacist",
                        "pharmacy technician",
                        "pharmacology"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Clinical Pharmacology Knowledge.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Clinical Pharmacology Knowledge.",
                "missingSignal": "No mention of Clinical Pharmacology Knowledge or related concepts in the CV."
            },
            {
                "skill": "Insurance/Pricing Processing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "pharmacist",
                        "pharmacy technician",
                        "pharmacology"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Insurance/Pricing Processing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Insurance/Pricing Processing.",
                "missingSignal": "No mention of Insurance/Pricing Processing or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "biotech_lab_research",
        "skills": [
            {
                "skill": "Laboratory Techniques (PCR/Electrophoresis)",
                "evidence": {
                    "tools": [
                        "PCR",
                        "Electrophoresis"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "lab technician",
                        "research scientist",
                        "biotechnology"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Laboratory Techniques (PCR/Electrophoresis).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Laboratory Techniques (PCR/Electrophoresis).",
                "missingSignal": "No mention of Laboratory Techniques (PCR/Electrophoresis) or related concepts in the CV."
            },
            {
                "skill": "Data Analysis & Statistics",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "lab technician",
                        "research scientist",
                        "biotechnology"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Data Analysis & Statistics.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Data Analysis & Statistics.",
                "missingSignal": "No mention of Data Analysis & Statistics or related concepts in the CV."
            },
            {
                "skill": "Lab Equipment Operation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "lab technician",
                        "research scientist",
                        "biotechnology"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Lab Equipment Operation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Lab Equipment Operation.",
                "missingSignal": "No mention of Lab Equipment Operation or related concepts in the CV."
            },
            {
                "skill": "Experimental Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "lab technician",
                        "research scientist",
                        "biotechnology"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Experimental Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Experimental Design.",
                "missingSignal": "No mention of Experimental Design or related concepts in the CV."
            },
            {
                "skill": "Bioinformatics Tools",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "lab technician",
                        "research scientist",
                        "biotechnology"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Bioinformatics Tools.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Bioinformatics Tools.",
                "missingSignal": "No mention of Bioinformatics Tools or related concepts in the CV."
            },
            {
                "skill": "Sample Preparation & Handling",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "lab technician",
                        "research scientist",
                        "biotechnology"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Sample Preparation & Handling.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Sample Preparation & Handling.",
                "missingSignal": "No mention of Sample Preparation & Handling or related concepts in the CV."
            },
            {
                "skill": "Lab Safety & Compliance (GLP)",
                "evidence": {
                    "tools": [
                        "GLP"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "lab technician",
                        "research scientist",
                        "biotechnology"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Lab Safety & Compliance (GLP).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Lab Safety & Compliance (GLP).",
                "missingSignal": "No mention of Lab Safety & Compliance (GLP) or related concepts in the CV."
            },
            {
                "skill": "Scientific Documentation/Reporting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "lab technician",
                        "research scientist",
                        "biotechnology"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Scientific Documentation/Reporting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Scientific Documentation/Reporting.",
                "missingSignal": "No mention of Scientific Documentation/Reporting or related concepts in the CV."
            },
            {
                "skill": "Cell Culture Techniques",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "lab technician",
                        "research scientist",
                        "biotechnology"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Cell Culture Techniques.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Cell Culture Techniques.",
                "missingSignal": "No mention of Cell Culture Techniques or related concepts in the CV."
            },
            {
                "skill": "Research Protocol Development",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "lab technician",
                        "research scientist",
                        "biotechnology"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Research Protocol Development.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Research Protocol Development.",
                "missingSignal": "No mention of Research Protocol Development or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "healthcare_management_admin",
        "skills": [
            {
                "skill": "Healthcare Operations Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "healthcare administrator",
                        "hospital manager",
                        "clinic manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Healthcare Operations Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Healthcare Operations Management.",
                "missingSignal": "No mention of Healthcare Operations Management or related concepts in the CV."
            },
            {
                "skill": "Regulatory Compliance (HIPAA/Joint Commission)",
                "evidence": {
                    "tools": [
                        "HIPAA",
                        "Joint Commission"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "healthcare administrator",
                        "hospital manager",
                        "clinic manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Regulatory Compliance (HIPAA/Joint Commission).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Regulatory Compliance (HIPAA/Joint Commission).",
                "missingSignal": "No mention of Regulatory Compliance (HIPAA/Joint Commission) or related concepts in the CV."
            },
            {
                "skill": "Budgeting & Financial Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "healthcare administrator",
                        "hospital manager",
                        "clinic manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Budgeting & Financial Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Budgeting & Financial Management.",
                "missingSignal": "No mention of Budgeting & Financial Management or related concepts in the CV."
            },
            {
                "skill": "Staff Scheduling & Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "healthcare administrator",
                        "hospital manager",
                        "clinic manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Staff Scheduling & Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Staff Scheduling & Management.",
                "missingSignal": "No mention of Staff Scheduling & Management or related concepts in the CV."
            },
            {
                "skill": "Patient Experience Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "healthcare administrator",
                        "hospital manager",
                        "clinic manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Patient Experience Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Patient Experience Management.",
                "missingSignal": "No mention of Patient Experience Management or related concepts in the CV."
            },
            {
                "skill": "Quality Improvement Initiatives",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "healthcare administrator",
                        "hospital manager",
                        "clinic manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Quality Improvement Initiatives.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Quality Improvement Initiatives.",
                "missingSignal": "No mention of Quality Improvement Initiatives or related concepts in the CV."
            },
            {
                "skill": "Healthcare IT Systems",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "healthcare administrator",
                        "hospital manager",
                        "clinic manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Healthcare IT Systems.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Healthcare IT Systems.",
                "missingSignal": "No mention of Healthcare IT Systems or related concepts in the CV."
            },
            {
                "skill": "Facility/Resource Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "healthcare administrator",
                        "hospital manager",
                        "clinic manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Facility/Resource Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Facility/Resource Management.",
                "missingSignal": "No mention of Facility/Resource Management or related concepts in the CV."
            },
            {
                "skill": "Insurance & Reimbursement Knowledge",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "healthcare administrator",
                        "hospital manager",
                        "clinic manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Insurance & Reimbursement Knowledge.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Insurance & Reimbursement Knowledge.",
                "missingSignal": "No mention of Insurance & Reimbursement Knowledge or related concepts in the CV."
            },
            {
                "skill": "Strategic Planning (Healthcare)",
                "evidence": {
                    "tools": [
                        "Healthcare"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "healthcare administrator",
                        "hospital manager",
                        "clinic manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Strategic Planning (Healthcare).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Strategic Planning (Healthcare).",
                "missingSignal": "No mention of Strategic Planning (Healthcare) or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "dentistry_dental_hygiene",
        "skills": [
            {
                "skill": "Clinical Dental Procedures",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "dentist",
                        "dental hygienist",
                        "dental assistant"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Clinical Dental Procedures.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Clinical Dental Procedures.",
                "missingSignal": "No mention of Clinical Dental Procedures or related concepts in the CV."
            },
            {
                "skill": "Dental Radiography (X-rays)",
                "evidence": {
                    "tools": [
                        "X-rays"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "dentist",
                        "dental hygienist",
                        "dental assistant"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Dental Radiography (X-rays).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Dental Radiography (X-rays).",
                "missingSignal": "No mention of Dental Radiography (X-rays) or related concepts in the CV."
            },
            {
                "skill": "Periodontal Assessment",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "dentist",
                        "dental hygienist",
                        "dental assistant"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Periodontal Assessment.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Periodontal Assessment.",
                "missingSignal": "No mention of Periodontal Assessment or related concepts in the CV."
            },
            {
                "skill": "Patient Education (Oral Hygiene)",
                "evidence": {
                    "tools": [
                        "Oral Hygiene"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "dentist",
                        "dental hygienist",
                        "dental assistant"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Patient Education (Oral Hygiene).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Patient Education (Oral Hygiene).",
                "missingSignal": "No mention of Patient Education (Oral Hygiene) or related concepts in the CV."
            },
            {
                "skill": "Sterilization & Infection Control",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "dentist",
                        "dental hygienist",
                        "dental assistant"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Sterilization & Infection Control.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Sterilization & Infection Control.",
                "missingSignal": "No mention of Sterilization & Infection Control or related concepts in the CV."
            },
            {
                "skill": "Dental Charting/Records",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "dentist",
                        "dental hygienist",
                        "dental assistant"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Dental Charting/Records.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Dental Charting/Records.",
                "missingSignal": "No mention of Dental Charting/Records or related concepts in the CV."
            },
            {
                "skill": "Restorative Procedures",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "dentist",
                        "dental hygienist",
                        "dental assistant"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Restorative Procedures.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Restorative Procedures.",
                "missingSignal": "No mention of Restorative Procedures or related concepts in the CV."
            },
            {
                "skill": "Dental Software Systems",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "dentist",
                        "dental hygienist",
                        "dental assistant"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Dental Software Systems.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Dental Software Systems.",
                "missingSignal": "No mention of Dental Software Systems or related concepts in the CV."
            },
            {
                "skill": "Anesthesia Administration",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "dentist",
                        "dental hygienist",
                        "dental assistant"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Anesthesia Administration.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Anesthesia Administration.",
                "missingSignal": "No mention of Anesthesia Administration or related concepts in the CV."
            },
            {
                "skill": "Treatment Planning",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "dentist",
                        "dental hygienist",
                        "dental assistant"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Treatment Planning.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Treatment Planning.",
                "missingSignal": "No mention of Treatment Planning or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "physical_therapy_rehab",
        "skills": [
            {
                "skill": "Patient Assessment & Diagnosis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "physical therapist",
                        "physiotherapist",
                        "rehabilitation specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Patient Assessment & Diagnosis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Patient Assessment & Diagnosis.",
                "missingSignal": "No mention of Patient Assessment & Diagnosis or related concepts in the CV."
            },
            {
                "skill": "Treatment Plan Development",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "physical therapist",
                        "physiotherapist",
                        "rehabilitation specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Treatment Plan Development.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Treatment Plan Development.",
                "missingSignal": "No mention of Treatment Plan Development or related concepts in the CV."
            },
            {
                "skill": "Manual Therapy Techniques",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "physical therapist",
                        "physiotherapist",
                        "rehabilitation specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Manual Therapy Techniques.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Manual Therapy Techniques.",
                "missingSignal": "No mention of Manual Therapy Techniques or related concepts in the CV."
            },
            {
                "skill": "Therapeutic Exercise Prescription",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "physical therapist",
                        "physiotherapist",
                        "rehabilitation specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Therapeutic Exercise Prescription.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Therapeutic Exercise Prescription.",
                "missingSignal": "No mention of Therapeutic Exercise Prescription or related concepts in the CV."
            },
            {
                "skill": "Rehabilitation Equipment Use",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "physical therapist",
                        "physiotherapist",
                        "rehabilitation specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Rehabilitation Equipment Use.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Rehabilitation Equipment Use.",
                "missingSignal": "No mention of Rehabilitation Equipment Use or related concepts in the CV."
            },
            {
                "skill": "Progress Documentation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "physical therapist",
                        "physiotherapist",
                        "rehabilitation specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Progress Documentation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Progress Documentation.",
                "missingSignal": "No mention of Progress Documentation or related concepts in the CV."
            },
            {
                "skill": "Patient Education",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "physical therapist",
                        "physiotherapist",
                        "rehabilitation specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Patient Education.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Patient Education.",
                "missingSignal": "No mention of Patient Education or related concepts in the CV."
            },
            {
                "skill": "Pain Management Strategies",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "physical therapist",
                        "physiotherapist",
                        "rehabilitation specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Pain Management Strategies.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Pain Management Strategies.",
                "missingSignal": "No mention of Pain Management Strategies or related concepts in the CV."
            },
            {
                "skill": "Mobility & Gait Training",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "physical therapist",
                        "physiotherapist",
                        "rehabilitation specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Mobility & Gait Training.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Mobility & Gait Training.",
                "missingSignal": "No mention of Mobility & Gait Training or related concepts in the CV."
            },
            {
                "skill": "Interdisciplinary Care Coordination",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "physical therapist",
                        "physiotherapist",
                        "rehabilitation specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Interdisciplinary Care Coordination.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Interdisciplinary Care Coordination.",
                "missingSignal": "No mention of Interdisciplinary Care Coordination or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "veterinary_medicine",
        "skills": [
            {
                "skill": "Animal Diagnosis & Examination",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "veterinarian",
                        "vet tech",
                        "veterinary technician"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Animal Diagnosis & Examination.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Animal Diagnosis & Examination.",
                "missingSignal": "No mention of Animal Diagnosis & Examination or related concepts in the CV."
            },
            {
                "skill": "Surgical Procedures (Veterinary)",
                "evidence": {
                    "tools": [
                        "Veterinary"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "veterinarian",
                        "vet tech",
                        "veterinary technician"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Surgical Procedures (Veterinary).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Surgical Procedures (Veterinary).",
                "missingSignal": "No mention of Surgical Procedures (Veterinary) or related concepts in the CV."
            },
            {
                "skill": "Vaccination & Preventive Care",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "veterinarian",
                        "vet tech",
                        "veterinary technician"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Vaccination & Preventive Care.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Vaccination & Preventive Care.",
                "missingSignal": "No mention of Vaccination & Preventive Care or related concepts in the CV."
            },
            {
                "skill": "Animal Handling & Restraint",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "veterinarian",
                        "vet tech",
                        "veterinary technician"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Animal Handling & Restraint.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Animal Handling & Restraint.",
                "missingSignal": "No mention of Animal Handling & Restraint or related concepts in the CV."
            },
            {
                "skill": "Veterinary Pharmacology",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "veterinarian",
                        "vet tech",
                        "veterinary technician"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Veterinary Pharmacology.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Veterinary Pharmacology.",
                "missingSignal": "No mention of Veterinary Pharmacology or related concepts in the CV."
            },
            {
                "skill": "Diagnostic Imaging (X-ray/Ultrasound)",
                "evidence": {
                    "tools": [
                        "X-ray",
                        "Ultrasound"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "veterinarian",
                        "vet tech",
                        "veterinary technician"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Diagnostic Imaging (X-ray/Ultrasound).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Diagnostic Imaging (X-ray/Ultrasound).",
                "missingSignal": "No mention of Diagnostic Imaging (X-ray/Ultrasound) or related concepts in the CV."
            },
            {
                "skill": "Client/Owner Communication",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "veterinarian",
                        "vet tech",
                        "veterinary technician"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Client/Owner Communication.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Client/Owner Communication.",
                "missingSignal": "No mention of Client/Owner Communication or related concepts in the CV."
            },
            {
                "skill": "Lab Sample Analysis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "veterinarian",
                        "vet tech",
                        "veterinary technician"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Lab Sample Analysis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Lab Sample Analysis.",
                "missingSignal": "No mention of Lab Sample Analysis or related concepts in the CV."
            },
            {
                "skill": "Emergency/Critical Care",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "veterinarian",
                        "vet tech",
                        "veterinary technician"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Emergency/Critical Care.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Emergency/Critical Care.",
                "missingSignal": "No mention of Emergency/Critical Care or related concepts in the CV."
            },
            {
                "skill": "Veterinary Records Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "veterinarian",
                        "vet tech",
                        "veterinary technician"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Veterinary Records Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Veterinary Records Management.",
                "missingSignal": "No mention of Veterinary Records Management or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "civil_structural_engineering",
        "skills": [
            {
                "skill": "Structural Analysis & Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "civil engineer",
                        "structural engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Structural Analysis & Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Structural Analysis & Design.",
                "missingSignal": "No mention of Structural Analysis & Design or related concepts in the CV."
            },
            {
                "skill": "AutoCAD/Revit/Civil 3D",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "civil engineer",
                        "structural engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with AutoCAD/Revit/Civil 3D.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to AutoCAD/Revit/Civil 3D.",
                "missingSignal": "No mention of AutoCAD/Revit/Civil 3D or related concepts in the CV."
            },
            {
                "skill": "Building Codes & Standards",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "civil engineer",
                        "structural engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Building Codes & Standards.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Building Codes & Standards.",
                "missingSignal": "No mention of Building Codes & Standards or related concepts in the CV."
            },
            {
                "skill": "Site Planning & Surveying",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "civil engineer",
                        "structural engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Site Planning & Surveying.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Site Planning & Surveying.",
                "missingSignal": "No mention of Site Planning & Surveying or related concepts in the CV."
            },
            {
                "skill": "Construction Materials Knowledge",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "civil engineer",
                        "structural engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Construction Materials Knowledge.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Construction Materials Knowledge.",
                "missingSignal": "No mention of Construction Materials Knowledge or related concepts in the CV."
            },
            {
                "skill": "Load Calculations",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "civil engineer",
                        "structural engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Load Calculations.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Load Calculations.",
                "missingSignal": "No mention of Load Calculations or related concepts in the CV."
            },
            {
                "skill": "Project Cost Estimation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "civil engineer",
                        "structural engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Project Cost Estimation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Project Cost Estimation.",
                "missingSignal": "No mention of Project Cost Estimation or related concepts in the CV."
            },
            {
                "skill": "Geotechnical Considerations",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "civil engineer",
                        "structural engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Geotechnical Considerations.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Geotechnical Considerations.",
                "missingSignal": "No mention of Geotechnical Considerations or related concepts in the CV."
            },
            {
                "skill": "Construction Drawings & Specs",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "civil engineer",
                        "structural engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Construction Drawings & Specs.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Construction Drawings & Specs.",
                "missingSignal": "No mention of Construction Drawings & Specs or related concepts in the CV."
            },
            {
                "skill": "Regulatory Permit Compliance",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "civil engineer",
                        "structural engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Regulatory Permit Compliance.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Regulatory Permit Compliance.",
                "missingSignal": "No mention of Regulatory Permit Compliance or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "mechanical_engineering",
        "skills": [
            {
                "skill": "CAD Design (SolidWorks/AutoCAD)",
                "evidence": {
                    "tools": [
                        "SolidWorks",
                        "AutoCAD"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "mechanical engineer",
                        "mech eng"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with CAD Design (SolidWorks/AutoCAD).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to CAD Design (SolidWorks/AutoCAD).",
                "missingSignal": "No mention of CAD Design (SolidWorks/AutoCAD) or related concepts in the CV."
            },
            {
                "skill": "Thermodynamics & Fluid Mechanics",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "mechanical engineer",
                        "mech eng"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Thermodynamics & Fluid Mechanics.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Thermodynamics & Fluid Mechanics.",
                "missingSignal": "No mention of Thermodynamics & Fluid Mechanics or related concepts in the CV."
            },
            {
                "skill": "Finite Element Analysis (FEA)",
                "evidence": {
                    "tools": [
                        "FEA"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "mechanical engineer",
                        "mech eng"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Finite Element Analysis (FEA).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Finite Element Analysis (FEA).",
                "missingSignal": "No mention of Finite Element Analysis (FEA) or related concepts in the CV."
            },
            {
                "skill": "Manufacturing Processes",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "mechanical engineer",
                        "mech eng"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Manufacturing Processes.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Manufacturing Processes.",
                "missingSignal": "No mention of Manufacturing Processes or related concepts in the CV."
            },
            {
                "skill": "Mechanical Systems Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "mechanical engineer",
                        "mech eng"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Mechanical Systems Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Mechanical Systems Design.",
                "missingSignal": "No mention of Mechanical Systems Design or related concepts in the CV."
            },
            {
                "skill": "Materials Selection",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "mechanical engineer",
                        "mech eng"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Materials Selection.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Materials Selection.",
                "missingSignal": "No mention of Materials Selection or related concepts in the CV."
            },
            {
                "skill": "Prototyping & Testing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "mechanical engineer",
                        "mech eng"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Prototyping & Testing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Prototyping & Testing.",
                "missingSignal": "No mention of Prototyping & Testing or related concepts in the CV."
            },
            {
                "skill": "GD&T (Tolerancing)",
                "evidence": {
                    "tools": [
                        "Tolerancing"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "mechanical engineer",
                        "mech eng"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with GD&T (Tolerancing).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to GD&T (Tolerancing).",
                "missingSignal": "No mention of GD&T (Tolerancing) or related concepts in the CV."
            },
            {
                "skill": "Project/Product Lifecycle Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "mechanical engineer",
                        "mech eng"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Project/Product Lifecycle Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Project/Product Lifecycle Management.",
                "missingSignal": "No mention of Project/Product Lifecycle Management or related concepts in the CV."
            },
            {
                "skill": "Technical Documentation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "mechanical engineer",
                        "mech eng"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Technical Documentation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Technical Documentation.",
                "missingSignal": "No mention of Technical Documentation or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "electrical_engineering",
        "skills": [
            {
                "skill": "Circuit Design & Analysis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "electrical engineer",
                        "power systems engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Circuit Design & Analysis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Circuit Design & Analysis.",
                "missingSignal": "No mention of Circuit Design & Analysis or related concepts in the CV."
            },
            {
                "skill": "PCB Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "electrical engineer",
                        "power systems engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with PCB Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to PCB Design.",
                "missingSignal": "No mention of PCB Design or related concepts in the CV."
            },
            {
                "skill": "Power Systems Engineering",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "electrical engineer",
                        "power systems engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Power Systems Engineering.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Power Systems Engineering.",
                "missingSignal": "No mention of Power Systems Engineering or related concepts in the CV."
            },
            {
                "skill": "Embedded Systems (Arduino/ESP32)",
                "evidence": {
                    "tools": [
                        "Arduino",
                        "ESP32"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "electrical engineer",
                        "power systems engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Embedded Systems (Arduino/ESP32).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Embedded Systems (Arduino/ESP32).",
                "missingSignal": "No mention of Embedded Systems (Arduino/ESP32) or related concepts in the CV."
            },
            {
                "skill": "Control Systems",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "electrical engineer",
                        "power systems engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Control Systems.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Control Systems.",
                "missingSignal": "No mention of Control Systems or related concepts in the CV."
            },
            {
                "skill": "Electrical Safety Standards",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "electrical engineer",
                        "power systems engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Electrical Safety Standards.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Electrical Safety Standards.",
                "missingSignal": "No mention of Electrical Safety Standards or related concepts in the CV."
            },
            {
                "skill": "SCADA/Automation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "electrical engineer",
                        "power systems engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with SCADA/Automation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to SCADA/Automation.",
                "missingSignal": "No mention of SCADA/Automation or related concepts in the CV."
            },
            {
                "skill": "Signal Processing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "electrical engineer",
                        "power systems engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Signal Processing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Signal Processing.",
                "missingSignal": "No mention of Signal Processing or related concepts in the CV."
            },
            {
                "skill": "CAD Tools (AutoCAD Electrical)",
                "evidence": {
                    "tools": [
                        "AutoCAD Electrical"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "electrical engineer",
                        "power systems engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with CAD Tools (AutoCAD Electrical).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to CAD Tools (AutoCAD Electrical).",
                "missingSignal": "No mention of CAD Tools (AutoCAD Electrical) or related concepts in the CV."
            },
            {
                "skill": "Testing & Troubleshooting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "electrical engineer",
                        "power systems engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Testing & Troubleshooting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Testing & Troubleshooting.",
                "missingSignal": "No mention of Testing & Troubleshooting or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "architecture_urban_planning",
        "skills": [
            {
                "skill": "Architectural Design Principles",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "architect",
                        "urban planner",
                        "architectural designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Architectural Design Principles.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Architectural Design Principles.",
                "missingSignal": "No mention of Architectural Design Principles or related concepts in the CV."
            },
            {
                "skill": "Revit/AutoCAD/SketchUp",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "architect",
                        "urban planner",
                        "architectural designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Revit/AutoCAD/SketchUp.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Revit/AutoCAD/SketchUp.",
                "missingSignal": "No mention of Revit/AutoCAD/SketchUp or related concepts in the CV."
            },
            {
                "skill": "Building Codes & Zoning",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "architect",
                        "urban planner",
                        "architectural designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Building Codes & Zoning.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Building Codes & Zoning.",
                "missingSignal": "No mention of Building Codes & Zoning or related concepts in the CV."
            },
            {
                "skill": "Sustainable/Green Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "architect",
                        "urban planner",
                        "architectural designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Sustainable/Green Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Sustainable/Green Design.",
                "missingSignal": "No mention of Sustainable/Green Design or related concepts in the CV."
            },
            {
                "skill": "Site Planning",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "architect",
                        "urban planner",
                        "architectural designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Site Planning.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Site Planning.",
                "missingSignal": "No mention of Site Planning or related concepts in the CV."
            },
            {
                "skill": "3D Modeling & Rendering",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "architect",
                        "urban planner",
                        "architectural designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with 3D Modeling & Rendering.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to 3D Modeling & Rendering.",
                "missingSignal": "No mention of 3D Modeling & Rendering or related concepts in the CV."
            },
            {
                "skill": "Construction Documentation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "architect",
                        "urban planner",
                        "architectural designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Construction Documentation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Construction Documentation.",
                "missingSignal": "No mention of Construction Documentation or related concepts in the CV."
            },
            {
                "skill": "Project Coordination with Engineers",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "architect",
                        "urban planner",
                        "architectural designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Project Coordination with Engineers.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Project Coordination with Engineers.",
                "missingSignal": "No mention of Project Coordination with Engineers or related concepts in the CV."
            },
            {
                "skill": "Urban Planning Frameworks",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "architect",
                        "urban planner",
                        "architectural designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Urban Planning Frameworks.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Urban Planning Frameworks.",
                "missingSignal": "No mention of Urban Planning Frameworks or related concepts in the CV."
            },
            {
                "skill": "Client Presentation & Design Review",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "architect",
                        "urban planner",
                        "architectural designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Client Presentation & Design Review.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Client Presentation & Design Review.",
                "missingSignal": "No mention of Client Presentation & Design Review or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "aerospace_engineering",
        "skills": [
            {
                "skill": "Aerodynamics",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "aerospace engineer",
                        "aeronautical engineer",
                        "propulsion engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Aerodynamics.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Aerodynamics.",
                "missingSignal": "No mention of Aerodynamics or related concepts in the CV."
            },
            {
                "skill": "Propulsion Systems",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "aerospace engineer",
                        "aeronautical engineer",
                        "propulsion engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Propulsion Systems.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Propulsion Systems.",
                "missingSignal": "No mention of Propulsion Systems or related concepts in the CV."
            },
            {
                "skill": "Structural Analysis (Aerospace)",
                "evidence": {
                    "tools": [
                        "Aerospace"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "aerospace engineer",
                        "aeronautical engineer",
                        "propulsion engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Structural Analysis (Aerospace).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Structural Analysis (Aerospace).",
                "missingSignal": "No mention of Structural Analysis (Aerospace) or related concepts in the CV."
            },
            {
                "skill": "CAD/CFD Tools",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "aerospace engineer",
                        "aeronautical engineer",
                        "propulsion engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with CAD/CFD Tools.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to CAD/CFD Tools.",
                "missingSignal": "No mention of CAD/CFD Tools or related concepts in the CV."
            },
            {
                "skill": "Flight Mechanics & Control",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "aerospace engineer",
                        "aeronautical engineer",
                        "propulsion engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Flight Mechanics & Control.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Flight Mechanics & Control.",
                "missingSignal": "No mention of Flight Mechanics & Control or related concepts in the CV."
            },
            {
                "skill": "Materials for Aerospace",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "aerospace engineer",
                        "aeronautical engineer",
                        "propulsion engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Materials for Aerospace.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Materials for Aerospace.",
                "missingSignal": "No mention of Materials for Aerospace or related concepts in the CV."
            },
            {
                "skill": "Systems Integration & Testing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "aerospace engineer",
                        "aeronautical engineer",
                        "propulsion engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Systems Integration & Testing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Systems Integration & Testing.",
                "missingSignal": "No mention of Systems Integration & Testing or related concepts in the CV."
            },
            {
                "skill": "Avionics Fundamentals",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "aerospace engineer",
                        "aeronautical engineer",
                        "propulsion engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Avionics Fundamentals.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Avionics Fundamentals.",
                "missingSignal": "No mention of Avionics Fundamentals or related concepts in the CV."
            },
            {
                "skill": "Regulatory Standards (FAA/Aviation Authority)",
                "evidence": {
                    "tools": [
                        "FAA",
                        "Aviation Authority"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "aerospace engineer",
                        "aeronautical engineer",
                        "propulsion engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Regulatory Standards (FAA/Aviation Authority).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Regulatory Standards (FAA/Aviation Authority).",
                "missingSignal": "No mention of Regulatory Standards (FAA/Aviation Authority) or related concepts in the CV."
            },
            {
                "skill": "Technical Documentation & Reporting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "aerospace engineer",
                        "aeronautical engineer",
                        "propulsion engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Technical Documentation & Reporting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Technical Documentation & Reporting.",
                "missingSignal": "No mention of Technical Documentation & Reporting or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "chemical_process_engineering",
        "skills": [
            {
                "skill": "Process Design & Simulation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "chemical engineer",
                        "process engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Process Design & Simulation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Process Design & Simulation.",
                "missingSignal": "No mention of Process Design & Simulation or related concepts in the CV."
            },
            {
                "skill": "Mass & Energy Balances",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "chemical engineer",
                        "process engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Mass & Energy Balances.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Mass & Energy Balances.",
                "missingSignal": "No mention of Mass & Energy Balances or related concepts in the CV."
            },
            {
                "skill": "Reactor Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "chemical engineer",
                        "process engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Reactor Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Reactor Design.",
                "missingSignal": "No mention of Reactor Design or related concepts in the CV."
            },
            {
                "skill": "Process Safety Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "chemical engineer",
                        "process engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Process Safety Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Process Safety Management.",
                "missingSignal": "No mention of Process Safety Management or related concepts in the CV."
            },
            {
                "skill": "P&ID Interpretation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "chemical engineer",
                        "process engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with P&ID Interpretation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to P&ID Interpretation.",
                "missingSignal": "No mention of P&ID Interpretation or related concepts in the CV."
            },
            {
                "skill": "Quality Control in Chemical Processes",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "chemical engineer",
                        "process engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Quality Control in Chemical Processes.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Quality Control in Chemical Processes.",
                "missingSignal": "No mention of Quality Control in Chemical Processes or related concepts in the CV."
            },
            {
                "skill": "Plant Operations Optimization",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "chemical engineer",
                        "process engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Plant Operations Optimization.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Plant Operations Optimization.",
                "missingSignal": "No mention of Plant Operations Optimization or related concepts in the CV."
            },
            {
                "skill": "Environmental/Regulatory Compliance",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "chemical engineer",
                        "process engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Environmental/Regulatory Compliance.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Environmental/Regulatory Compliance.",
                "missingSignal": "No mention of Environmental/Regulatory Compliance or related concepts in the CV."
            },
            {
                "skill": "Equipment Sizing & Specification",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "chemical engineer",
                        "process engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Equipment Sizing & Specification.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Equipment Sizing & Specification.",
                "missingSignal": "No mention of Equipment Sizing & Specification or related concepts in the CV."
            },
            {
                "skill": "Troubleshooting Process Issues",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "chemical engineer",
                        "process engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Troubleshooting Process Issues.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Troubleshooting Process Issues.",
                "missingSignal": "No mention of Troubleshooting Process Issues or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "k12_education",
        "skills": [
            {
                "skill": "Curriculum Planning & Delivery",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "teacher",
                        "k-12",
                        "elementary teacher"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Curriculum Planning & Delivery.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Curriculum Planning & Delivery.",
                "missingSignal": "No mention of Curriculum Planning & Delivery or related concepts in the CV."
            },
            {
                "skill": "Classroom Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "teacher",
                        "k-12",
                        "elementary teacher"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Classroom Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Classroom Management.",
                "missingSignal": "No mention of Classroom Management or related concepts in the CV."
            },
            {
                "skill": "Differentiated Instruction",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "teacher",
                        "k-12",
                        "elementary teacher"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Differentiated Instruction.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Differentiated Instruction.",
                "missingSignal": "No mention of Differentiated Instruction or related concepts in the CV."
            },
            {
                "skill": "Student Assessment & Grading",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "teacher",
                        "k-12",
                        "elementary teacher"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Student Assessment & Grading.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Student Assessment & Grading.",
                "missingSignal": "No mention of Student Assessment & Grading or related concepts in the CV."
            },
            {
                "skill": "Lesson Plan Development",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "teacher",
                        "k-12",
                        "elementary teacher"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Lesson Plan Development.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Lesson Plan Development.",
                "missingSignal": "No mention of Lesson Plan Development or related concepts in the CV."
            },
            {
                "skill": "Parent/Guardian Communication",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "teacher",
                        "k-12",
                        "elementary teacher"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Parent/Guardian Communication.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Parent/Guardian Communication.",
                "missingSignal": "No mention of Parent/Guardian Communication or related concepts in the CV."
            },
            {
                "skill": "Educational Technology Tools",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "teacher",
                        "k-12",
                        "elementary teacher"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Educational Technology Tools.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Educational Technology Tools.",
                "missingSignal": "No mention of Educational Technology Tools or related concepts in the CV."
            },
            {
                "skill": "Behavior Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "teacher",
                        "k-12",
                        "elementary teacher"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Behavior Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Behavior Management.",
                "missingSignal": "No mention of Behavior Management or related concepts in the CV."
            },
            {
                "skill": "Individualized Education Plans (IEP)",
                "evidence": {
                    "tools": [
                        "IEP"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "teacher",
                        "k-12",
                        "elementary teacher"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Individualized Education Plans (IEP).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Individualized Education Plans (IEP).",
                "missingSignal": "No mention of Individualized Education Plans (IEP) or related concepts in the CV."
            },
            {
                "skill": "Subject-Matter Expertise",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "teacher",
                        "k-12",
                        "elementary teacher"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Subject-Matter Expertise.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Subject-Matter Expertise.",
                "missingSignal": "No mention of Subject-Matter Expertise or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "higher_education_faculty",
        "skills": [
            {
                "skill": "Course Design & Curriculum Development",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "professor",
                        "lecturer",
                        "university faculty"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Course Design & Curriculum Development.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Course Design & Curriculum Development.",
                "missingSignal": "No mention of Course Design & Curriculum Development or related concepts in the CV."
            },
            {
                "skill": "Lecturing & Seminar Facilitation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "professor",
                        "lecturer",
                        "university faculty"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Lecturing & Seminar Facilitation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Lecturing & Seminar Facilitation.",
                "missingSignal": "No mention of Lecturing & Seminar Facilitation or related concepts in the CV."
            },
            {
                "skill": "Academic Research & Publication",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "professor",
                        "lecturer",
                        "university faculty"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Academic Research & Publication.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Academic Research & Publication.",
                "missingSignal": "No mention of Academic Research & Publication or related concepts in the CV."
            },
            {
                "skill": "Grant Writing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "professor",
                        "lecturer",
                        "university faculty"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Grant Writing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Grant Writing.",
                "missingSignal": "No mention of Grant Writing or related concepts in the CV."
            },
            {
                "skill": "Student Mentorship & Advising",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "professor",
                        "lecturer",
                        "university faculty"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Student Mentorship & Advising.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Student Mentorship & Advising.",
                "missingSignal": "No mention of Student Mentorship & Advising or related concepts in the CV."
            },
            {
                "skill": "Peer Review",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "professor",
                        "lecturer",
                        "university faculty"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Peer Review.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Peer Review.",
                "missingSignal": "No mention of Peer Review or related concepts in the CV."
            },
            {
                "skill": "Grading & Assessment Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "professor",
                        "lecturer",
                        "university faculty"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Grading & Assessment Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Grading & Assessment Design.",
                "missingSignal": "No mention of Grading & Assessment Design or related concepts in the CV."
            },
            {
                "skill": "Subject-Matter Expertise",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "professor",
                        "lecturer",
                        "university faculty"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Subject-Matter Expertise.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Subject-Matter Expertise.",
                "missingSignal": "No mention of Subject-Matter Expertise or related concepts in the CV."
            },
            {
                "skill": "Academic Committee Participation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "professor",
                        "lecturer",
                        "university faculty"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Academic Committee Participation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Academic Committee Participation.",
                "missingSignal": "No mention of Academic Committee Participation or related concepts in the CV."
            },
            {
                "skill": "Conference Presentation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "professor",
                        "lecturer",
                        "university faculty"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Conference Presentation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Conference Presentation.",
                "missingSignal": "No mention of Conference Presentation or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "instructional_design_edtech",
        "skills": [
            {
                "skill": "Curriculum/Course Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "instructional designer",
                        "edtech specialist",
                        "learning experience designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Curriculum/Course Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Curriculum/Course Design.",
                "missingSignal": "No mention of Curriculum/Course Design or related concepts in the CV."
            },
            {
                "skill": "Learning Management Systems (LMS)",
                "evidence": {
                    "tools": [
                        "LMS"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "instructional designer",
                        "edtech specialist",
                        "learning experience designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Learning Management Systems (LMS).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Learning Management Systems (LMS).",
                "missingSignal": "No mention of Learning Management Systems (LMS) or related concepts in the CV."
            },
            {
                "skill": "Adult Learning Theory",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "instructional designer",
                        "edtech specialist",
                        "learning experience designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Adult Learning Theory.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Adult Learning Theory.",
                "missingSignal": "No mention of Adult Learning Theory or related concepts in the CV."
            },
            {
                "skill": "E-Learning Authoring Tools (Articulate/Captivate)",
                "evidence": {
                    "tools": [
                        "Articulate",
                        "Captivate"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "instructional designer",
                        "edtech specialist",
                        "learning experience designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with E-Learning Authoring Tools (Articulate/Captivate).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to E-Learning Authoring Tools (Articulate/Captivate).",
                "missingSignal": "No mention of E-Learning Authoring Tools (Articulate/Captivate) or related concepts in the CV."
            },
            {
                "skill": "Needs Analysis & Assessment Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "instructional designer",
                        "edtech specialist",
                        "learning experience designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Needs Analysis & Assessment Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Needs Analysis & Assessment Design.",
                "missingSignal": "No mention of Needs Analysis & Assessment Design or related concepts in the CV."
            },
            {
                "skill": "Multimedia Content Development",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "instructional designer",
                        "edtech specialist",
                        "learning experience designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Multimedia Content Development.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Multimedia Content Development.",
                "missingSignal": "No mention of Multimedia Content Development or related concepts in the CV."
            },
            {
                "skill": "Learning Analytics",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "instructional designer",
                        "edtech specialist",
                        "learning experience designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Learning Analytics.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Learning Analytics.",
                "missingSignal": "No mention of Learning Analytics or related concepts in the CV."
            },
            {
                "skill": "Storyboarding for Courses",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "instructional designer",
                        "edtech specialist",
                        "learning experience designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Storyboarding for Courses.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Storyboarding for Courses.",
                "missingSignal": "No mention of Storyboarding for Courses or related concepts in the CV."
            },
            {
                "skill": "Accessibility in Learning Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "instructional designer",
                        "edtech specialist",
                        "learning experience designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Accessibility in Learning Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Accessibility in Learning Design.",
                "missingSignal": "No mention of Accessibility in Learning Design or related concepts in the CV."
            },
            {
                "skill": "Stakeholder Collaboration",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "instructional designer",
                        "edtech specialist",
                        "learning experience designer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Stakeholder Collaboration.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Stakeholder Collaboration.",
                "missingSignal": "No mention of Stakeholder Collaboration or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "corporate_training_ld",
        "skills": [
            {
                "skill": "Training Needs Analysis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "corporate trainer",
                        "learning and development",
                        "l&d specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Training Needs Analysis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Training Needs Analysis.",
                "missingSignal": "No mention of Training Needs Analysis or related concepts in the CV."
            },
            {
                "skill": "Workshop/Program Facilitation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "corporate trainer",
                        "learning and development",
                        "l&d specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Workshop/Program Facilitation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Workshop/Program Facilitation.",
                "missingSignal": "No mention of Workshop/Program Facilitation or related concepts in the CV."
            },
            {
                "skill": "Curriculum & Content Development",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "corporate trainer",
                        "learning and development",
                        "l&d specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Curriculum & Content Development.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Curriculum & Content Development.",
                "missingSignal": "No mention of Curriculum & Content Development or related concepts in the CV."
            },
            {
                "skill": "LMS Administration",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "corporate trainer",
                        "learning and development",
                        "l&d specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with LMS Administration.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to LMS Administration.",
                "missingSignal": "No mention of LMS Administration or related concepts in the CV."
            },
            {
                "skill": "Performance Measurement (Kirkpatrick Model)",
                "evidence": {
                    "tools": [
                        "Kirkpatrick Model"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "corporate trainer",
                        "learning and development",
                        "l&d specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Performance Measurement (Kirkpatrick Model).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Performance Measurement (Kirkpatrick Model).",
                "missingSignal": "No mention of Performance Measurement (Kirkpatrick Model) or related concepts in the CV."
            },
            {
                "skill": "Onboarding Program Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "corporate trainer",
                        "learning and development",
                        "l&d specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Onboarding Program Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Onboarding Program Design.",
                "missingSignal": "No mention of Onboarding Program Design or related concepts in the CV."
            },
            {
                "skill": "Leadership Development Programs",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "corporate trainer",
                        "learning and development",
                        "l&d specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Leadership Development Programs.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Leadership Development Programs.",
                "missingSignal": "No mention of Leadership Development Programs or related concepts in the CV."
            },
            {
                "skill": "Stakeholder Needs Assessment",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "corporate trainer",
                        "learning and development",
                        "l&d specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Stakeholder Needs Assessment.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Stakeholder Needs Assessment.",
                "missingSignal": "No mention of Stakeholder Needs Assessment or related concepts in the CV."
            },
            {
                "skill": "E-Learning Development",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "corporate trainer",
                        "learning and development",
                        "l&d specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with E-Learning Development.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to E-Learning Development.",
                "missingSignal": "No mention of E-Learning Development or related concepts in the CV."
            },
            {
                "skill": "Coaching & Feedback Delivery",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "corporate trainer",
                        "learning and development",
                        "l&d specialist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Coaching & Feedback Delivery.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Coaching & Feedback Delivery.",
                "missingSignal": "No mention of Coaching & Feedback Delivery or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "hotel_management_hospitality",
        "skills": [
            {
                "skill": "Guest Relations Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "hotel manager",
                        "hospitality manager",
                        "front office manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Guest Relations Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Guest Relations Management.",
                "missingSignal": "No mention of Guest Relations Management or related concepts in the CV."
            },
            {
                "skill": "Front Office/Reservation Systems",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "hotel manager",
                        "hospitality manager",
                        "front office manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Front Office/Reservation Systems.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Front Office/Reservation Systems.",
                "missingSignal": "No mention of Front Office/Reservation Systems or related concepts in the CV."
            },
            {
                "skill": "Revenue Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "hotel manager",
                        "hospitality manager",
                        "front office manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Revenue Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Revenue Management.",
                "missingSignal": "No mention of Revenue Management or related concepts in the CV."
            },
            {
                "skill": "Staff Scheduling & Training",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "hotel manager",
                        "hospitality manager",
                        "front office manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Staff Scheduling & Training.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Staff Scheduling & Training.",
                "missingSignal": "No mention of Staff Scheduling & Training or related concepts in the CV."
            },
            {
                "skill": "Hospitality Service Standards",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "hotel manager",
                        "hospitality manager",
                        "front office manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Hospitality Service Standards.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Hospitality Service Standards.",
                "missingSignal": "No mention of Hospitality Service Standards or related concepts in the CV."
            },
            {
                "skill": "Budget & P&L Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "hotel manager",
                        "hospitality manager",
                        "front office manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Budget & P&L Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Budget & P&L Management.",
                "missingSignal": "No mention of Budget & P&L Management or related concepts in the CV."
            },
            {
                "skill": "Housekeeping Operations Oversight",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "hotel manager",
                        "hospitality manager",
                        "front office manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Housekeeping Operations Oversight.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Housekeeping Operations Oversight.",
                "missingSignal": "No mention of Housekeeping Operations Oversight or related concepts in the CV."
            },
            {
                "skill": "Event/Conference Coordination",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "hotel manager",
                        "hospitality manager",
                        "front office manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Event/Conference Coordination.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Event/Conference Coordination.",
                "missingSignal": "No mention of Event/Conference Coordination or related concepts in the CV."
            },
            {
                "skill": "Quality Assurance & Guest Satisfaction",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "hotel manager",
                        "hospitality manager",
                        "front office manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Quality Assurance & Guest Satisfaction.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Quality Assurance & Guest Satisfaction.",
                "missingSignal": "No mention of Quality Assurance & Guest Satisfaction or related concepts in the CV."
            },
            {
                "skill": "Vendor & Supplier Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "hotel manager",
                        "hospitality manager",
                        "front office manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Vendor & Supplier Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Vendor & Supplier Management.",
                "missingSignal": "No mention of Vendor & Supplier Management or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "culinary_food_service",
        "skills": [
            {
                "skill": "Menu Planning & Development",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "chef",
                        "culinary",
                        "kitchen manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Menu Planning & Development.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Menu Planning & Development.",
                "missingSignal": "No mention of Menu Planning & Development or related concepts in the CV."
            },
            {
                "skill": "Food Safety & Sanitation (HACCP)",
                "evidence": {
                    "tools": [
                        "HACCP"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "chef",
                        "culinary",
                        "kitchen manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Food Safety & Sanitation (HACCP).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Food Safety & Sanitation (HACCP).",
                "missingSignal": "No mention of Food Safety & Sanitation (HACCP) or related concepts in the CV."
            },
            {
                "skill": "Kitchen Operations Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "chef",
                        "culinary",
                        "kitchen manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Kitchen Operations Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Kitchen Operations Management.",
                "missingSignal": "No mention of Kitchen Operations Management or related concepts in the CV."
            },
            {
                "skill": "Inventory & Cost Control",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "chef",
                        "culinary",
                        "kitchen manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Inventory & Cost Control.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Inventory & Cost Control.",
                "missingSignal": "No mention of Inventory & Cost Control or related concepts in the CV."
            },
            {
                "skill": "Recipe Standardization",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "chef",
                        "culinary",
                        "kitchen manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Recipe Standardization.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Recipe Standardization.",
                "missingSignal": "No mention of Recipe Standardization or related concepts in the CV."
            },
            {
                "skill": "Staff Supervision & Training",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "chef",
                        "culinary",
                        "kitchen manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Staff Supervision & Training.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Staff Supervision & Training.",
                "missingSignal": "No mention of Staff Supervision & Training or related concepts in the CV."
            },
            {
                "skill": "Plating & Presentation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "chef",
                        "culinary",
                        "kitchen manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Plating & Presentation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Plating & Presentation.",
                "missingSignal": "No mention of Plating & Presentation or related concepts in the CV."
            },
            {
                "skill": "Vendor/Supplier Relations",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "chef",
                        "culinary",
                        "kitchen manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Vendor/Supplier Relations.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Vendor/Supplier Relations.",
                "missingSignal": "No mention of Vendor/Supplier Relations or related concepts in the CV."
            },
            {
                "skill": "Allergen Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "chef",
                        "culinary",
                        "kitchen manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Allergen Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Allergen Management.",
                "missingSignal": "No mention of Allergen Management or related concepts in the CV."
            },
            {
                "skill": "Equipment Maintenance Knowledge",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "chef",
                        "culinary",
                        "kitchen manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Equipment Maintenance Knowledge.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Equipment Maintenance Knowledge.",
                "missingSignal": "No mention of Equipment Maintenance Knowledge or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "retail_store_management",
        "skills": [
            {
                "skill": "Sales Floor Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "retail manager",
                        "store manager",
                        "assistant store manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Sales Floor Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Sales Floor Management.",
                "missingSignal": "No mention of Sales Floor Management or related concepts in the CV."
            },
            {
                "skill": "Inventory & Stock Control",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "retail manager",
                        "store manager",
                        "assistant store manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Inventory & Stock Control.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Inventory & Stock Control.",
                "missingSignal": "No mention of Inventory & Stock Control or related concepts in the CV."
            },
            {
                "skill": "Staff Scheduling & Training",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "retail manager",
                        "store manager",
                        "assistant store manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Staff Scheduling & Training.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Staff Scheduling & Training.",
                "missingSignal": "No mention of Staff Scheduling & Training or related concepts in the CV."
            },
            {
                "skill": "Visual Merchandising",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "retail manager",
                        "store manager",
                        "assistant store manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Visual Merchandising.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Visual Merchandising.",
                "missingSignal": "No mention of Visual Merchandising or related concepts in the CV."
            },
            {
                "skill": "POS Systems",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "retail manager",
                        "store manager",
                        "assistant store manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with POS Systems.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to POS Systems.",
                "missingSignal": "No mention of POS Systems or related concepts in the CV."
            },
            {
                "skill": "Customer Service Excellence",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "retail manager",
                        "store manager",
                        "assistant store manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Customer Service Excellence.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Customer Service Excellence.",
                "missingSignal": "No mention of Customer Service Excellence or related concepts in the CV."
            },
            {
                "skill": "Loss Prevention",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "retail manager",
                        "store manager",
                        "assistant store manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Loss Prevention.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Loss Prevention.",
                "missingSignal": "No mention of Loss Prevention or related concepts in the CV."
            },
            {
                "skill": "Sales Target Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "retail manager",
                        "store manager",
                        "assistant store manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Sales Target Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Sales Target Management.",
                "missingSignal": "No mention of Sales Target Management or related concepts in the CV."
            },
            {
                "skill": "Store Budget & P&L",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "retail manager",
                        "store manager",
                        "assistant store manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Store Budget & P&L.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Store Budget & P&L.",
                "missingSignal": "No mention of Store Budget & P&L or related concepts in the CV."
            },
            {
                "skill": "Team Leadership & Motivation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "retail manager",
                        "store manager",
                        "assistant store manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Team Leadership & Motivation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Team Leadership & Motivation.",
                "missingSignal": "No mention of Team Leadership & Motivation or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "construction_management",
        "skills": [
            {
                "skill": "Project Scheduling (Gantt/Critical Path)",
                "evidence": {
                    "tools": [
                        "Gantt",
                        "Critical Path"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "construction manager",
                        "general contractor",
                        "site supervisor"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Project Scheduling (Gantt/Critical Path).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Project Scheduling (Gantt/Critical Path).",
                "missingSignal": "No mention of Project Scheduling (Gantt/Critical Path) or related concepts in the CV."
            },
            {
                "skill": "Budget & Cost Estimation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "construction manager",
                        "general contractor",
                        "site supervisor"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Budget & Cost Estimation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Budget & Cost Estimation.",
                "missingSignal": "No mention of Budget & Cost Estimation or related concepts in the CV."
            },
            {
                "skill": "Site Safety Management (OSHA)",
                "evidence": {
                    "tools": [
                        "OSHA"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "construction manager",
                        "general contractor",
                        "site supervisor"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Site Safety Management (OSHA).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Site Safety Management (OSHA).",
                "missingSignal": "No mention of Site Safety Management (OSHA) or related concepts in the CV."
            },
            {
                "skill": "Subcontractor Coordination",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "construction manager",
                        "general contractor",
                        "site supervisor"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Subcontractor Coordination.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Subcontractor Coordination.",
                "missingSignal": "No mention of Subcontractor Coordination or related concepts in the CV."
            },
            {
                "skill": "Building Codes & Permits",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "construction manager",
                        "general contractor",
                        "site supervisor"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Building Codes & Permits.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Building Codes & Permits.",
                "missingSignal": "No mention of Building Codes & Permits or related concepts in the CV."
            },
            {
                "skill": "Blueprint/Drawing Interpretation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "construction manager",
                        "general contractor",
                        "site supervisor"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Blueprint/Drawing Interpretation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Blueprint/Drawing Interpretation.",
                "missingSignal": "No mention of Blueprint/Drawing Interpretation or related concepts in the CV."
            },
            {
                "skill": "Quality Control Inspection",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "construction manager",
                        "general contractor",
                        "site supervisor"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Quality Control Inspection.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Quality Control Inspection.",
                "missingSignal": "No mention of Quality Control Inspection or related concepts in the CV."
            },
            {
                "skill": "Procurement of Materials",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "construction manager",
                        "general contractor",
                        "site supervisor"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Procurement of Materials.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Procurement of Materials.",
                "missingSignal": "No mention of Procurement of Materials or related concepts in the CV."
            },
            {
                "skill": "Risk Management (Construction)",
                "evidence": {
                    "tools": [
                        "Construction"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "construction manager",
                        "general contractor",
                        "site supervisor"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Risk Management (Construction).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Risk Management (Construction).",
                "missingSignal": "No mention of Risk Management (Construction) or related concepts in the CV."
            },
            {
                "skill": "Client/Stakeholder Communication",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "construction manager",
                        "general contractor",
                        "site supervisor"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Client/Stakeholder Communication.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Client/Stakeholder Communication.",
                "missingSignal": "No mention of Client/Stakeholder Communication or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "fleet_transport_management",
        "skills": [
            {
                "skill": "Fleet Maintenance Scheduling",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "fleet manager",
                        "transport manager",
                        "logistics fleet coordinator"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Fleet Maintenance Scheduling.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Fleet Maintenance Scheduling.",
                "missingSignal": "No mention of Fleet Maintenance Scheduling or related concepts in the CV."
            },
            {
                "skill": "Route Optimization",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "fleet manager",
                        "transport manager",
                        "logistics fleet coordinator"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Route Optimization.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Route Optimization.",
                "missingSignal": "No mention of Route Optimization or related concepts in the CV."
            },
            {
                "skill": "Driver Management & Compliance",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "fleet manager",
                        "transport manager",
                        "logistics fleet coordinator"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Driver Management & Compliance.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Driver Management & Compliance.",
                "missingSignal": "No mention of Driver Management & Compliance or related concepts in the CV."
            },
            {
                "skill": "Fuel & Cost Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "fleet manager",
                        "transport manager",
                        "logistics fleet coordinator"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Fuel & Cost Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Fuel & Cost Management.",
                "missingSignal": "No mention of Fuel & Cost Management or related concepts in the CV."
            },
            {
                "skill": "Vehicle Tracking/Telematics Systems",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "fleet manager",
                        "transport manager",
                        "logistics fleet coordinator"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Vehicle Tracking/Telematics Systems.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Vehicle Tracking/Telematics Systems.",
                "missingSignal": "No mention of Vehicle Tracking/Telematics Systems or related concepts in the CV."
            },
            {
                "skill": "Regulatory Compliance (DOT/Transport Law)",
                "evidence": {
                    "tools": [
                        "DOT",
                        "Transport Law"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "fleet manager",
                        "transport manager",
                        "logistics fleet coordinator"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Regulatory Compliance (DOT/Transport Law).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Regulatory Compliance (DOT/Transport Law).",
                "missingSignal": "No mention of Regulatory Compliance (DOT/Transport Law) or related concepts in the CV."
            },
            {
                "skill": "Inventory of Spare Parts",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "fleet manager",
                        "transport manager",
                        "logistics fleet coordinator"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Inventory of Spare Parts.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Inventory of Spare Parts.",
                "missingSignal": "No mention of Inventory of Spare Parts or related concepts in the CV."
            },
            {
                "skill": "Fleet Budgeting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "fleet manager",
                        "transport manager",
                        "logistics fleet coordinator"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Fleet Budgeting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Fleet Budgeting.",
                "missingSignal": "No mention of Fleet Budgeting or related concepts in the CV."
            },
            {
                "skill": "Safety & Incident Reporting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "fleet manager",
                        "transport manager",
                        "logistics fleet coordinator"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Safety & Incident Reporting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Safety & Incident Reporting.",
                "missingSignal": "No mention of Safety & Incident Reporting or related concepts in the CV."
            },
            {
                "skill": "Vendor/Supplier Negotiation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "fleet manager",
                        "transport manager",
                        "logistics fleet coordinator"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Vendor/Supplier Negotiation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Vendor/Supplier Negotiation.",
                "missingSignal": "No mention of Vendor/Supplier Negotiation or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "manufacturing_industrial_engineering",
        "skills": [
            {
                "skill": "Process Improvement (Lean/Kaizen)",
                "evidence": {
                    "tools": [
                        "Lean",
                        "Kaizen"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "manufacturing engineer",
                        "industrial engineer",
                        "production engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Process Improvement (Lean/Kaizen).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Process Improvement (Lean/Kaizen).",
                "missingSignal": "No mention of Process Improvement (Lean/Kaizen) or related concepts in the CV."
            },
            {
                "skill": "Production Line Optimization",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "manufacturing engineer",
                        "industrial engineer",
                        "production engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Production Line Optimization.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Production Line Optimization.",
                "missingSignal": "No mention of Production Line Optimization or related concepts in the CV."
            },
            {
                "skill": "Six Sigma Methodologies",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "manufacturing engineer",
                        "industrial engineer",
                        "production engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Six Sigma Methodologies.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Six Sigma Methodologies.",
                "missingSignal": "No mention of Six Sigma Methodologies or related concepts in the CV."
            },
            {
                "skill": "Plant Layout & Workflow Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "manufacturing engineer",
                        "industrial engineer",
                        "production engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Plant Layout & Workflow Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Plant Layout & Workflow Design.",
                "missingSignal": "No mention of Plant Layout & Workflow Design or related concepts in the CV."
            },
            {
                "skill": "Quality Control Systems",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "manufacturing engineer",
                        "industrial engineer",
                        "production engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Quality Control Systems.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Quality Control Systems.",
                "missingSignal": "No mention of Quality Control Systems or related concepts in the CV."
            },
            {
                "skill": "ERP/MES Systems",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "manufacturing engineer",
                        "industrial engineer",
                        "production engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with ERP/MES Systems.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to ERP/MES Systems.",
                "missingSignal": "No mention of ERP/MES Systems or related concepts in the CV."
            },
            {
                "skill": "Root Cause Analysis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "manufacturing engineer",
                        "industrial engineer",
                        "production engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Root Cause Analysis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Root Cause Analysis.",
                "missingSignal": "No mention of Root Cause Analysis or related concepts in the CV."
            },
            {
                "skill": "Equipment & Tooling Knowledge",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "manufacturing engineer",
                        "industrial engineer",
                        "production engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Equipment & Tooling Knowledge.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Equipment & Tooling Knowledge.",
                "missingSignal": "No mention of Equipment & Tooling Knowledge or related concepts in the CV."
            },
            {
                "skill": "Capacity Planning",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "manufacturing engineer",
                        "industrial engineer",
                        "production engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Capacity Planning.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Capacity Planning.",
                "missingSignal": "No mention of Capacity Planning or related concepts in the CV."
            },
            {
                "skill": "Safety & Compliance (OSHA)",
                "evidence": {
                    "tools": [
                        "OSHA"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "manufacturing engineer",
                        "industrial engineer",
                        "production engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Safety & Compliance (OSHA).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Safety & Compliance (OSHA).",
                "missingSignal": "No mention of Safety & Compliance (OSHA) or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "quality_control_six_sigma",
        "skills": [
            {
                "skill": "Six Sigma (Green/Black Belt)",
                "evidence": {
                    "tools": [
                        "Green",
                        "Black Belt"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "quality control",
                        "quality engineer",
                        "six sigma"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Six Sigma (Green/Black Belt).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Six Sigma (Green/Black Belt).",
                "missingSignal": "No mention of Six Sigma (Green/Black Belt) or related concepts in the CV."
            },
            {
                "skill": "Statistical Process Control (SPC)",
                "evidence": {
                    "tools": [
                        "SPC"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "quality control",
                        "quality engineer",
                        "six sigma"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Statistical Process Control (SPC).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Statistical Process Control (SPC).",
                "missingSignal": "No mention of Statistical Process Control (SPC) or related concepts in the CV."
            },
            {
                "skill": "Root Cause Analysis (RCA)",
                "evidence": {
                    "tools": [
                        "RCA"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "quality control",
                        "quality engineer",
                        "six sigma"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Root Cause Analysis (RCA).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Root Cause Analysis (RCA).",
                "missingSignal": "No mention of Root Cause Analysis (RCA) or related concepts in the CV."
            },
            {
                "skill": "ISO 9001 Compliance",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "quality control",
                        "quality engineer",
                        "six sigma"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with ISO 9001 Compliance.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to ISO 9001 Compliance.",
                "missingSignal": "No mention of ISO 9001 Compliance or related concepts in the CV."
            },
            {
                "skill": "Inspection & Testing Procedures",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "quality control",
                        "quality engineer",
                        "six sigma"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Inspection & Testing Procedures.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Inspection & Testing Procedures.",
                "missingSignal": "No mention of Inspection & Testing Procedures or related concepts in the CV."
            },
            {
                "skill": "Corrective/Preventive Action (CAPA)",
                "evidence": {
                    "tools": [
                        "CAPA"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "quality control",
                        "quality engineer",
                        "six sigma"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Corrective/Preventive Action (CAPA).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Corrective/Preventive Action (CAPA).",
                "missingSignal": "No mention of Corrective/Preventive Action (CAPA) or related concepts in the CV."
            },
            {
                "skill": "Quality Management Systems (QMS)",
                "evidence": {
                    "tools": [
                        "QMS"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "quality control",
                        "quality engineer",
                        "six sigma"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Quality Management Systems (QMS).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Quality Management Systems (QMS).",
                "missingSignal": "No mention of Quality Management Systems (QMS) or related concepts in the CV."
            },
            {
                "skill": "Failure Mode Analysis (FMEA)",
                "evidence": {
                    "tools": [
                        "FMEA"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "quality control",
                        "quality engineer",
                        "six sigma"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Failure Mode Analysis (FMEA).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Failure Mode Analysis (FMEA).",
                "missingSignal": "No mention of Failure Mode Analysis (FMEA) or related concepts in the CV."
            },
            {
                "skill": "Audit Preparation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "quality control",
                        "quality engineer",
                        "six sigma"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Audit Preparation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Audit Preparation.",
                "missingSignal": "No mention of Audit Preparation or related concepts in the CV."
            },
            {
                "skill": "Process Documentation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "quality control",
                        "quality engineer",
                        "six sigma"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Process Documentation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Process Documentation.",
                "missingSignal": "No mention of Process Documentation or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "electricians_skilled_trades",
        "skills": [
            {
                "skill": "Electrical Wiring & Installation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "electrician",
                        "skilled tradesperson",
                        "industrial electrician"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Electrical Wiring & Installation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Electrical Wiring & Installation.",
                "missingSignal": "No mention of Electrical Wiring & Installation or related concepts in the CV."
            },
            {
                "skill": "Circuit Troubleshooting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "electrician",
                        "skilled tradesperson",
                        "industrial electrician"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Circuit Troubleshooting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Circuit Troubleshooting.",
                "missingSignal": "No mention of Circuit Troubleshooting or related concepts in the CV."
            },
            {
                "skill": "Electrical Code Compliance",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "electrician",
                        "skilled tradesperson",
                        "industrial electrician"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Electrical Code Compliance.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Electrical Code Compliance.",
                "missingSignal": "No mention of Electrical Code Compliance or related concepts in the CV."
            },
            {
                "skill": "Blueprint Reading",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "electrician",
                        "skilled tradesperson",
                        "industrial electrician"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Blueprint Reading.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Blueprint Reading.",
                "missingSignal": "No mention of Blueprint Reading or related concepts in the CV."
            },
            {
                "skill": "Panel & Conduit Installation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "electrician",
                        "skilled tradesperson",
                        "industrial electrician"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Panel & Conduit Installation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Panel & Conduit Installation.",
                "missingSignal": "No mention of Panel & Conduit Installation or related concepts in the CV."
            },
            {
                "skill": "Safety Procedures (Lockout/Tagout)",
                "evidence": {
                    "tools": [
                        "Lockout",
                        "Tagout"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "electrician",
                        "skilled tradesperson",
                        "industrial electrician"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Safety Procedures (Lockout/Tagout).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Safety Procedures (Lockout/Tagout).",
                "missingSignal": "No mention of Safety Procedures (Lockout/Tagout) or related concepts in the CV."
            },
            {
                "skill": "Motor & Control Systems",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "electrician",
                        "skilled tradesperson",
                        "industrial electrician"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Motor & Control Systems.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Motor & Control Systems.",
                "missingSignal": "No mention of Motor & Control Systems or related concepts in the CV."
            },
            {
                "skill": "Power Tools Proficiency",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "electrician",
                        "skilled tradesperson",
                        "industrial electrician"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Power Tools Proficiency.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Power Tools Proficiency.",
                "missingSignal": "No mention of Power Tools Proficiency or related concepts in the CV."
            },
            {
                "skill": "Preventive Maintenance",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "electrician",
                        "skilled tradesperson",
                        "industrial electrician"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Preventive Maintenance.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Preventive Maintenance.",
                "missingSignal": "No mention of Preventive Maintenance or related concepts in the CV."
            },
            {
                "skill": "Permit & Inspection Knowledge",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "electrician",
                        "skilled tradesperson",
                        "industrial electrician"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Permit & Inspection Knowledge.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Permit & Inspection Knowledge.",
                "missingSignal": "No mention of Permit & Inspection Knowledge or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "plumbing_hvac",
        "skills": [
            {
                "skill": "Pipefitting & Installation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "plumber",
                        "hvac technician",
                        "hvac installer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Pipefitting & Installation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Pipefitting & Installation.",
                "missingSignal": "No mention of Pipefitting & Installation or related concepts in the CV."
            },
            {
                "skill": "HVAC System Installation & Repair",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "plumber",
                        "hvac technician",
                        "hvac installer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with HVAC System Installation & Repair.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to HVAC System Installation & Repair.",
                "missingSignal": "No mention of HVAC System Installation & Repair or related concepts in the CV."
            },
            {
                "skill": "Refrigeration Systems",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "plumber",
                        "hvac technician",
                        "hvac installer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Refrigeration Systems.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Refrigeration Systems.",
                "missingSignal": "No mention of Refrigeration Systems or related concepts in the CV."
            },
            {
                "skill": "Blueprint & Schematic Reading",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "plumber",
                        "hvac technician",
                        "hvac installer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Blueprint & Schematic Reading.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Blueprint & Schematic Reading.",
                "missingSignal": "No mention of Blueprint & Schematic Reading or related concepts in the CV."
            },
            {
                "skill": "Plumbing Code Compliance",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "plumber",
                        "hvac technician",
                        "hvac installer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Plumbing Code Compliance.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Plumbing Code Compliance.",
                "missingSignal": "No mention of Plumbing Code Compliance or related concepts in the CV."
            },
            {
                "skill": "Diagnostic Troubleshooting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "plumber",
                        "hvac technician",
                        "hvac installer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Diagnostic Troubleshooting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Diagnostic Troubleshooting.",
                "missingSignal": "No mention of Diagnostic Troubleshooting or related concepts in the CV."
            },
            {
                "skill": "Preventive Maintenance Scheduling",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "plumber",
                        "hvac technician",
                        "hvac installer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Preventive Maintenance Scheduling.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Preventive Maintenance Scheduling.",
                "missingSignal": "No mention of Preventive Maintenance Scheduling or related concepts in the CV."
            },
            {
                "skill": "Soldering/Brazing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "plumber",
                        "hvac technician",
                        "hvac installer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Soldering/Brazing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Soldering/Brazing.",
                "missingSignal": "No mention of Soldering/Brazing or related concepts in the CV."
            },
            {
                "skill": "Customer Service (Field Work)",
                "evidence": {
                    "tools": [
                        "Field Work"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "plumber",
                        "hvac technician",
                        "hvac installer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Customer Service (Field Work).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Customer Service (Field Work).",
                "missingSignal": "No mention of Customer Service (Field Work) or related concepts in the CV."
            },
            {
                "skill": "Tool & Equipment Operation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "plumber",
                        "hvac technician",
                        "hvac installer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Tool & Equipment Operation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Tool & Equipment Operation.",
                "missingSignal": "No mention of Tool & Equipment Operation or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "automotive_technology_repair",
        "skills": [
            {
                "skill": "Engine Diagnostics & Repair",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "automotive technician",
                        "mechanic",
                        "auto repair"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Engine Diagnostics & Repair.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Engine Diagnostics & Repair.",
                "missingSignal": "No mention of Engine Diagnostics & Repair or related concepts in the CV."
            },
            {
                "skill": "Electrical Systems Diagnosis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "automotive technician",
                        "mechanic",
                        "auto repair"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Electrical Systems Diagnosis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Electrical Systems Diagnosis.",
                "missingSignal": "No mention of Electrical Systems Diagnosis or related concepts in the CV."
            },
            {
                "skill": "OBD/Diagnostic Tools",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "automotive technician",
                        "mechanic",
                        "auto repair"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with OBD/Diagnostic Tools.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to OBD/Diagnostic Tools.",
                "missingSignal": "No mention of OBD/Diagnostic Tools or related concepts in the CV."
            },
            {
                "skill": "Brake & Suspension Systems",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "automotive technician",
                        "mechanic",
                        "auto repair"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Brake & Suspension Systems.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Brake & Suspension Systems.",
                "missingSignal": "No mention of Brake & Suspension Systems or related concepts in the CV."
            },
            {
                "skill": "Preventive Maintenance",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "automotive technician",
                        "mechanic",
                        "auto repair"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Preventive Maintenance.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Preventive Maintenance.",
                "missingSignal": "No mention of Preventive Maintenance or related concepts in the CV."
            },
            {
                "skill": "Transmission Repair",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "automotive technician",
                        "mechanic",
                        "auto repair"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Transmission Repair.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Transmission Repair.",
                "missingSignal": "No mention of Transmission Repair or related concepts in the CV."
            },
            {
                "skill": "Manufacturer Service Manuals",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "automotive technician",
                        "mechanic",
                        "auto repair"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Manufacturer Service Manuals.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Manufacturer Service Manuals.",
                "missingSignal": "No mention of Manufacturer Service Manuals or related concepts in the CV."
            },
            {
                "skill": "Customer Communication (Estimates)",
                "evidence": {
                    "tools": [
                        "Estimates"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "automotive technician",
                        "mechanic",
                        "auto repair"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Customer Communication (Estimates).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Customer Communication (Estimates).",
                "missingSignal": "No mention of Customer Communication (Estimates) or related concepts in the CV."
            },
            {
                "skill": "Tool & Equipment Proficiency",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "automotive technician",
                        "mechanic",
                        "auto repair"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Tool & Equipment Proficiency.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Tool & Equipment Proficiency.",
                "missingSignal": "No mention of Tool & Equipment Proficiency or related concepts in the CV."
            },
            {
                "skill": "Safety Compliance",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "automotive technician",
                        "mechanic",
                        "auto repair"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Safety Compliance.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Safety Compliance.",
                "missingSignal": "No mention of Safety Compliance or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "energy_renewables_utilities",
        "skills": [
            {
                "skill": "Renewable Energy Systems (Solar/Wind)",
                "evidence": {
                    "tools": [
                        "Solar",
                        "Wind"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "energy engineer",
                        "renewable energy",
                        "solar engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Renewable Energy Systems (Solar/Wind).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Renewable Energy Systems (Solar/Wind).",
                "missingSignal": "No mention of Renewable Energy Systems (Solar/Wind) or related concepts in the CV."
            },
            {
                "skill": "Energy Auditing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "energy engineer",
                        "renewable energy",
                        "solar engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Energy Auditing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Energy Auditing.",
                "missingSignal": "No mention of Energy Auditing or related concepts in the CV."
            },
            {
                "skill": "Grid/Power Systems Knowledge",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "energy engineer",
                        "renewable energy",
                        "solar engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Grid/Power Systems Knowledge.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Grid/Power Systems Knowledge.",
                "missingSignal": "No mention of Grid/Power Systems Knowledge or related concepts in the CV."
            },
            {
                "skill": "Regulatory & Permitting Compliance",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "energy engineer",
                        "renewable energy",
                        "solar engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Regulatory & Permitting Compliance.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Regulatory & Permitting Compliance.",
                "missingSignal": "No mention of Regulatory & Permitting Compliance or related concepts in the CV."
            },
            {
                "skill": "Energy Efficiency Analysis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "energy engineer",
                        "renewable energy",
                        "solar engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Energy Efficiency Analysis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Energy Efficiency Analysis.",
                "missingSignal": "No mention of Energy Efficiency Analysis or related concepts in the CV."
            },
            {
                "skill": "Project Management (Energy)",
                "evidence": {
                    "tools": [
                        "Energy"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "energy engineer",
                        "renewable energy",
                        "solar engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Project Management (Energy).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Project Management (Energy).",
                "missingSignal": "No mention of Project Management (Energy) or related concepts in the CV."
            },
            {
                "skill": "SCADA/Monitoring Systems",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "energy engineer",
                        "renewable energy",
                        "solar engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with SCADA/Monitoring Systems.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to SCADA/Monitoring Systems.",
                "missingSignal": "No mention of SCADA/Monitoring Systems or related concepts in the CV."
            },
            {
                "skill": "Sustainability Reporting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "energy engineer",
                        "renewable energy",
                        "solar engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Sustainability Reporting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Sustainability Reporting.",
                "missingSignal": "No mention of Sustainability Reporting or related concepts in the CV."
            },
            {
                "skill": "Technical Feasibility Studies",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "energy engineer",
                        "renewable energy",
                        "solar engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Technical Feasibility Studies.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Technical Feasibility Studies.",
                "missingSignal": "No mention of Technical Feasibility Studies or related concepts in the CV."
            },
            {
                "skill": "Equipment Maintenance & Safety",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "energy engineer",
                        "renewable energy",
                        "solar engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Equipment Maintenance & Safety.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Equipment Maintenance & Safety.",
                "missingSignal": "No mention of Equipment Maintenance & Safety or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "environmental_science_sustainability",
        "skills": [
            {
                "skill": "Environmental Impact Assessment",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "environmental scientist",
                        "sustainability manager",
                        "esg analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Environmental Impact Assessment.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Environmental Impact Assessment.",
                "missingSignal": "No mention of Environmental Impact Assessment or related concepts in the CV."
            },
            {
                "skill": "Sustainability Reporting (ESG)",
                "evidence": {
                    "tools": [
                        "ESG"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "environmental scientist",
                        "sustainability manager",
                        "esg analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Sustainability Reporting (ESG).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Sustainability Reporting (ESG).",
                "missingSignal": "No mention of Sustainability Reporting (ESG) or related concepts in the CV."
            },
            {
                "skill": "Regulatory Compliance (Environmental)",
                "evidence": {
                    "tools": [
                        "Environmental"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "environmental scientist",
                        "sustainability manager",
                        "esg analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Regulatory Compliance (Environmental).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Regulatory Compliance (Environmental).",
                "missingSignal": "No mention of Regulatory Compliance (Environmental) or related concepts in the CV."
            },
            {
                "skill": "Data Collection & Field Sampling",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "environmental scientist",
                        "sustainability manager",
                        "esg analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Data Collection & Field Sampling.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Data Collection & Field Sampling.",
                "missingSignal": "No mention of Data Collection & Field Sampling or related concepts in the CV."
            },
            {
                "skill": "GIS Mapping",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "environmental scientist",
                        "sustainability manager",
                        "esg analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with GIS Mapping.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to GIS Mapping.",
                "missingSignal": "No mention of GIS Mapping or related concepts in the CV."
            },
            {
                "skill": "Climate/Carbon Footprint Analysis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "environmental scientist",
                        "sustainability manager",
                        "esg analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Climate/Carbon Footprint Analysis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Climate/Carbon Footprint Analysis.",
                "missingSignal": "No mention of Climate/Carbon Footprint Analysis or related concepts in the CV."
            },
            {
                "skill": "Waste & Resource Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "environmental scientist",
                        "sustainability manager",
                        "esg analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Waste & Resource Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Waste & Resource Management.",
                "missingSignal": "No mention of Waste & Resource Management or related concepts in the CV."
            },
            {
                "skill": "Environmental Policy Knowledge",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "environmental scientist",
                        "sustainability manager",
                        "esg analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Environmental Policy Knowledge.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Environmental Policy Knowledge.",
                "missingSignal": "No mention of Environmental Policy Knowledge or related concepts in the CV."
            },
            {
                "skill": "Stakeholder Engagement",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "environmental scientist",
                        "sustainability manager",
                        "esg analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Stakeholder Engagement.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Stakeholder Engagement.",
                "missingSignal": "No mention of Stakeholder Engagement or related concepts in the CV."
            },
            {
                "skill": "Remediation Planning",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "environmental scientist",
                        "sustainability manager",
                        "esg analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Remediation Planning.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Remediation Planning.",
                "missingSignal": "No mention of Remediation Planning or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "agriculture_agronomy",
        "skills": [
            {
                "skill": "Crop Management & Rotation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "agronomist",
                        "agricultural specialist",
                        "farm manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Crop Management & Rotation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Crop Management & Rotation.",
                "missingSignal": "No mention of Crop Management & Rotation or related concepts in the CV."
            },
            {
                "skill": "Soil Science & Fertility Analysis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "agronomist",
                        "agricultural specialist",
                        "farm manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Soil Science & Fertility Analysis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Soil Science & Fertility Analysis.",
                "missingSignal": "No mention of Soil Science & Fertility Analysis or related concepts in the CV."
            },
            {
                "skill": "Pest & Disease Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "agronomist",
                        "agricultural specialist",
                        "farm manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Pest & Disease Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Pest & Disease Management.",
                "missingSignal": "No mention of Pest & Disease Management or related concepts in the CV."
            },
            {
                "skill": "Precision Agriculture Technology",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "agronomist",
                        "agricultural specialist",
                        "farm manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Precision Agriculture Technology.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Precision Agriculture Technology.",
                "missingSignal": "No mention of Precision Agriculture Technology or related concepts in the CV."
            },
            {
                "skill": "Irrigation Systems Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "agronomist",
                        "agricultural specialist",
                        "farm manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Irrigation Systems Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Irrigation Systems Management.",
                "missingSignal": "No mention of Irrigation Systems Management or related concepts in the CV."
            },
            {
                "skill": "Yield Forecasting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "agronomist",
                        "agricultural specialist",
                        "farm manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Yield Forecasting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Yield Forecasting.",
                "missingSignal": "No mention of Yield Forecasting or related concepts in the CV."
            },
            {
                "skill": "Farm Equipment Operation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "agronomist",
                        "agricultural specialist",
                        "farm manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Farm Equipment Operation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Farm Equipment Operation.",
                "missingSignal": "No mention of Farm Equipment Operation or related concepts in the CV."
            },
            {
                "skill": "Sustainable Farming Practices",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "agronomist",
                        "agricultural specialist",
                        "farm manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Sustainable Farming Practices.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Sustainable Farming Practices.",
                "missingSignal": "No mention of Sustainable Farming Practices or related concepts in the CV."
            },
            {
                "skill": "Supply Chain (Agro-Commodities)",
                "evidence": {
                    "tools": [
                        "Agro-Commodities"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "agronomist",
                        "agricultural specialist",
                        "farm manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Supply Chain (Agro-Commodities).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Supply Chain (Agro-Commodities).",
                "missingSignal": "No mention of Supply Chain (Agro-Commodities) or related concepts in the CV."
            },
            {
                "skill": "Regulatory/Quality Standards (Agriculture)",
                "evidence": {
                    "tools": [
                        "Agriculture"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "agronomist",
                        "agricultural specialist",
                        "farm manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Regulatory/Quality Standards (Agriculture).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Regulatory/Quality Standards (Agriculture).",
                "missingSignal": "No mention of Regulatory/Quality Standards (Agriculture) or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "insurance_underwriting",
        "skills": [
            {
                "skill": "Risk Assessment & Underwriting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "underwriter",
                        "insurance agent",
                        "claims adjuster"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Risk Assessment & Underwriting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Risk Assessment & Underwriting.",
                "missingSignal": "No mention of Risk Assessment & Underwriting or related concepts in the CV."
            },
            {
                "skill": "Policy Issuance & Review",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "underwriter",
                        "insurance agent",
                        "claims adjuster"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Policy Issuance & Review.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Policy Issuance & Review.",
                "missingSignal": "No mention of Policy Issuance & Review or related concepts in the CV."
            },
            {
                "skill": "Claims Processing & Investigation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "underwriter",
                        "insurance agent",
                        "claims adjuster"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Claims Processing & Investigation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Claims Processing & Investigation.",
                "missingSignal": "No mention of Claims Processing & Investigation or related concepts in the CV."
            },
            {
                "skill": "Insurance Regulatory Compliance",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "underwriter",
                        "insurance agent",
                        "claims adjuster"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Insurance Regulatory Compliance.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Insurance Regulatory Compliance.",
                "missingSignal": "No mention of Insurance Regulatory Compliance or related concepts in the CV."
            },
            {
                "skill": "Actuarial Data Interpretation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "underwriter",
                        "insurance agent",
                        "claims adjuster"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Actuarial Data Interpretation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Actuarial Data Interpretation.",
                "missingSignal": "No mention of Actuarial Data Interpretation or related concepts in the CV."
            },
            {
                "skill": "Client/Broker Relationship Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "underwriter",
                        "insurance agent",
                        "claims adjuster"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Client/Broker Relationship Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Client/Broker Relationship Management.",
                "missingSignal": "No mention of Client/Broker Relationship Management or related concepts in the CV."
            },
            {
                "skill": "Premium Calculation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "underwriter",
                        "insurance agent",
                        "claims adjuster"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Premium Calculation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Premium Calculation.",
                "missingSignal": "No mention of Premium Calculation or related concepts in the CV."
            },
            {
                "skill": "Reinsurance Basics",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "underwriter",
                        "insurance agent",
                        "claims adjuster"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Reinsurance Basics.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Reinsurance Basics.",
                "missingSignal": "No mention of Reinsurance Basics or related concepts in the CV."
            },
            {
                "skill": "Fraud Detection",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "underwriter",
                        "insurance agent",
                        "claims adjuster"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Fraud Detection.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Fraud Detection.",
                "missingSignal": "No mention of Fraud Detection or related concepts in the CV."
            },
            {
                "skill": "Insurance Software Systems",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "underwriter",
                        "insurance agent",
                        "claims adjuster"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Insurance Software Systems.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Insurance Software Systems.",
                "missingSignal": "No mention of Insurance Software Systems or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "investment_wealth_management",
        "skills": [
            {
                "skill": "Portfolio Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "wealth manager",
                        "investment advisor",
                        "portfolio manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Portfolio Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Portfolio Management.",
                "missingSignal": "No mention of Portfolio Management or related concepts in the CV."
            },
            {
                "skill": "Asset Allocation Strategy",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "wealth manager",
                        "investment advisor",
                        "portfolio manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Asset Allocation Strategy.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Asset Allocation Strategy.",
                "missingSignal": "No mention of Asset Allocation Strategy or related concepts in the CV."
            },
            {
                "skill": "Client Financial Planning",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "wealth manager",
                        "investment advisor",
                        "portfolio manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Client Financial Planning.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Client Financial Planning.",
                "missingSignal": "No mention of Client Financial Planning or related concepts in the CV."
            },
            {
                "skill": "Investment Research & Analysis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "wealth manager",
                        "investment advisor",
                        "portfolio manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Investment Research & Analysis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Investment Research & Analysis.",
                "missingSignal": "No mention of Investment Research & Analysis or related concepts in the CV."
            },
            {
                "skill": "Risk Tolerance Assessment",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "wealth manager",
                        "investment advisor",
                        "portfolio manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Risk Tolerance Assessment.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Risk Tolerance Assessment.",
                "missingSignal": "No mention of Risk Tolerance Assessment or related concepts in the CV."
            },
            {
                "skill": "Retirement & Estate Planning",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "wealth manager",
                        "investment advisor",
                        "portfolio manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Retirement & Estate Planning.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Retirement & Estate Planning.",
                "missingSignal": "No mention of Retirement & Estate Planning or related concepts in the CV."
            },
            {
                "skill": "Regulatory Compliance (Investment)",
                "evidence": {
                    "tools": [
                        "Investment"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "wealth manager",
                        "investment advisor",
                        "portfolio manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Regulatory Compliance (Investment).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Regulatory Compliance (Investment).",
                "missingSignal": "No mention of Regulatory Compliance (Investment) or related concepts in the CV."
            },
            {
                "skill": "Market Analysis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "wealth manager",
                        "investment advisor",
                        "portfolio manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Market Analysis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Market Analysis.",
                "missingSignal": "No mention of Market Analysis or related concepts in the CV."
            },
            {
                "skill": "Client Relationship Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "wealth manager",
                        "investment advisor",
                        "portfolio manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Client Relationship Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Client Relationship Management.",
                "missingSignal": "No mention of Client Relationship Management or related concepts in the CV."
            },
            {
                "skill": "Performance Reporting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "wealth manager",
                        "investment advisor",
                        "portfolio manager"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Performance Reporting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Performance Reporting.",
                "missingSignal": "No mention of Performance Reporting or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "actuarial_science",
        "skills": [
            {
                "skill": "Statistical & Probability Modeling",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "actuary",
                        "actuarial analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Statistical & Probability Modeling.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Statistical & Probability Modeling.",
                "missingSignal": "No mention of Statistical & Probability Modeling or related concepts in the CV."
            },
            {
                "skill": "Risk & Reserve Calculation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "actuary",
                        "actuarial analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Risk & Reserve Calculation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Risk & Reserve Calculation.",
                "missingSignal": "No mention of Risk & Reserve Calculation or related concepts in the CV."
            },
            {
                "skill": "Actuarial Software (Prophet/AXIS)",
                "evidence": {
                    "tools": [
                        "Prophet",
                        "AXIS"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "actuary",
                        "actuarial analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Actuarial Software (Prophet/AXIS).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Actuarial Software (Prophet/AXIS).",
                "missingSignal": "No mention of Actuarial Software (Prophet/AXIS) or related concepts in the CV."
            },
            {
                "skill": "Life/Health/P&C Actuarial Methods",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "actuary",
                        "actuarial analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Life/Health/P&C Actuarial Methods.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Life/Health/P&C Actuarial Methods.",
                "missingSignal": "No mention of Life/Health/P&C Actuarial Methods or related concepts in the CV."
            },
            {
                "skill": "Regulatory Reporting (Solvency)",
                "evidence": {
                    "tools": [
                        "Solvency"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "actuary",
                        "actuarial analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Regulatory Reporting (Solvency).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Regulatory Reporting (Solvency).",
                "missingSignal": "No mention of Regulatory Reporting (Solvency) or related concepts in the CV."
            },
            {
                "skill": "Pricing Model Development",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "actuary",
                        "actuarial analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Pricing Model Development.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Pricing Model Development.",
                "missingSignal": "No mention of Pricing Model Development or related concepts in the CV."
            },
            {
                "skill": "Data Analysis (SQL/R/Python)",
                "evidence": {
                    "tools": [
                        "SQL",
                        "R",
                        "Python"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "actuary",
                        "actuarial analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Data Analysis (SQL/R/Python).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Data Analysis (SQL/R/Python).",
                "missingSignal": "No mention of Data Analysis (SQL/R/Python) or related concepts in the CV."
            },
            {
                "skill": "Mortality/Morbidity Analysis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "actuary",
                        "actuarial analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Mortality/Morbidity Analysis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Mortality/Morbidity Analysis.",
                "missingSignal": "No mention of Mortality/Morbidity Analysis or related concepts in the CV."
            },
            {
                "skill": "Exam Progress (SOA/IFoA)",
                "evidence": {
                    "tools": [
                        "SOA",
                        "IFoA"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "actuary",
                        "actuarial analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Exam Progress (SOA/IFoA).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Exam Progress (SOA/IFoA).",
                "missingSignal": "No mention of Exam Progress (SOA/IFoA) or related concepts in the CV."
            },
            {
                "skill": "Financial Forecasting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "actuary",
                        "actuarial analyst"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Financial Forecasting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Financial Forecasting.",
                "missingSignal": "No mention of Financial Forecasting or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "journalism_editorial",
        "skills": [
            {
                "skill": "News Writing & Reporting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "journalist",
                        "editor",
                        "reporter"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with News Writing & Reporting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to News Writing & Reporting.",
                "missingSignal": "No mention of News Writing & Reporting or related concepts in the CV."
            },
            {
                "skill": "Investigative Research",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "journalist",
                        "editor",
                        "reporter"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Investigative Research.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Investigative Research.",
                "missingSignal": "No mention of Investigative Research or related concepts in the CV."
            },
            {
                "skill": "Editing & Proofreading",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "journalist",
                        "editor",
                        "reporter"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Editing & Proofreading.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Editing & Proofreading.",
                "missingSignal": "No mention of Editing & Proofreading or related concepts in the CV."
            },
            {
                "skill": "Source Verification & Fact-Checking",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "journalist",
                        "editor",
                        "reporter"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Source Verification & Fact-Checking.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Source Verification & Fact-Checking.",
                "missingSignal": "No mention of Source Verification & Fact-Checking or related concepts in the CV."
            },
            {
                "skill": "Interviewing Techniques",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "journalist",
                        "editor",
                        "reporter"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Interviewing Techniques.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Interviewing Techniques.",
                "missingSignal": "No mention of Interviewing Techniques or related concepts in the CV."
            },
            {
                "skill": "AP Style/Editorial Standards",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "journalist",
                        "editor",
                        "reporter"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with AP Style/Editorial Standards.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to AP Style/Editorial Standards.",
                "missingSignal": "No mention of AP Style/Editorial Standards or related concepts in the CV."
            },
            {
                "skill": "Multimedia Storytelling",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "journalist",
                        "editor",
                        "reporter"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Multimedia Storytelling.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Multimedia Storytelling.",
                "missingSignal": "No mention of Multimedia Storytelling or related concepts in the CV."
            },
            {
                "skill": "Deadline Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "journalist",
                        "editor",
                        "reporter"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Deadline Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Deadline Management.",
                "missingSignal": "No mention of Deadline Management or related concepts in the CV."
            },
            {
                "skill": "Ethics in Journalism",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "journalist",
                        "editor",
                        "reporter"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Ethics in Journalism.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Ethics in Journalism.",
                "missingSignal": "No mention of Ethics in Journalism or related concepts in the CV."
            },
            {
                "skill": "SEO for News Content",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "journalist",
                        "editor",
                        "reporter"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with SEO for News Content.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to SEO for News Content.",
                "missingSignal": "No mention of SEO for News Content or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "broadcasting_media_production",
        "skills": [
            {
                "skill": "Video Production & Editing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "video producer",
                        "broadcast technician",
                        "media producer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Video Production & Editing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Video Production & Editing.",
                "missingSignal": "No mention of Video Production & Editing or related concepts in the CV."
            },
            {
                "skill": "Camera Operation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "video producer",
                        "broadcast technician",
                        "media producer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Camera Operation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Camera Operation.",
                "missingSignal": "No mention of Camera Operation or related concepts in the CV."
            },
            {
                "skill": "Audio Engineering/Mixing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "video producer",
                        "broadcast technician",
                        "media producer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Audio Engineering/Mixing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Audio Engineering/Mixing.",
                "missingSignal": "No mention of Audio Engineering/Mixing or related concepts in the CV."
            },
            {
                "skill": "Broadcast Equipment Operation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "video producer",
                        "broadcast technician",
                        "media producer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Broadcast Equipment Operation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Broadcast Equipment Operation.",
                "missingSignal": "No mention of Broadcast Equipment Operation or related concepts in the CV."
            },
            {
                "skill": "Script Writing for Media",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "video producer",
                        "broadcast technician",
                        "media producer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Script Writing for Media.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Script Writing for Media.",
                "missingSignal": "No mention of Script Writing for Media or related concepts in the CV."
            },
            {
                "skill": "Post-Production Workflow",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "video producer",
                        "broadcast technician",
                        "media producer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Post-Production Workflow.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Post-Production Workflow.",
                "missingSignal": "No mention of Post-Production Workflow or related concepts in the CV."
            },
            {
                "skill": "Live Broadcast Coordination",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "video producer",
                        "broadcast technician",
                        "media producer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Live Broadcast Coordination.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Live Broadcast Coordination.",
                "missingSignal": "No mention of Live Broadcast Coordination or related concepts in the CV."
            },
            {
                "skill": "Lighting Setup",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "video producer",
                        "broadcast technician",
                        "media producer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Lighting Setup.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Lighting Setup.",
                "missingSignal": "No mention of Lighting Setup or related concepts in the CV."
            },
            {
                "skill": "Content Scheduling",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "video producer",
                        "broadcast technician",
                        "media producer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Content Scheduling.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Content Scheduling.",
                "missingSignal": "No mention of Content Scheduling or related concepts in the CV."
            },
            {
                "skill": "Media Asset Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "video producer",
                        "broadcast technician",
                        "media producer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Media Asset Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Media Asset Management.",
                "missingSignal": "No mention of Media Asset Management or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "translation_localization",
        "skills": [
            {
                "skill": "Bilingual/Multilingual Fluency",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "translator",
                        "localization specialist",
                        "interpreter"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Bilingual/Multilingual Fluency.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Bilingual/Multilingual Fluency.",
                "missingSignal": "No mention of Bilingual/Multilingual Fluency or related concepts in the CV."
            },
            {
                "skill": "Translation Accuracy & Nuance",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "translator",
                        "localization specialist",
                        "interpreter"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Translation Accuracy & Nuance.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Translation Accuracy & Nuance.",
                "missingSignal": "No mention of Translation Accuracy & Nuance or related concepts in the CV."
            },
            {
                "skill": "CAT Tools (Trados/MemoQ)",
                "evidence": {
                    "tools": [
                        "Trados",
                        "MemoQ"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "translator",
                        "localization specialist",
                        "interpreter"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with CAT Tools (Trados/MemoQ).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to CAT Tools (Trados/MemoQ).",
                "missingSignal": "No mention of CAT Tools (Trados/MemoQ) or related concepts in the CV."
            },
            {
                "skill": "Localization for Cultural Context",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "translator",
                        "localization specialist",
                        "interpreter"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Localization for Cultural Context.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Localization for Cultural Context.",
                "missingSignal": "No mention of Localization for Cultural Context or related concepts in the CV."
            },
            {
                "skill": "Terminology Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "translator",
                        "localization specialist",
                        "interpreter"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Terminology Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Terminology Management.",
                "missingSignal": "No mention of Terminology Management or related concepts in the CV."
            },
            {
                "skill": "Proofreading & Quality Assurance",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "translator",
                        "localization specialist",
                        "interpreter"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Proofreading & Quality Assurance.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Proofreading & Quality Assurance.",
                "missingSignal": "No mention of Proofreading & Quality Assurance or related concepts in the CV."
            },
            {
                "skill": "Subtitling/Transcription",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "translator",
                        "localization specialist",
                        "interpreter"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Subtitling/Transcription.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Subtitling/Transcription.",
                "missingSignal": "No mention of Subtitling/Transcription or related concepts in the CV."
            },
            {
                "skill": "Interpretation (Simultaneous/Consecutive)",
                "evidence": {
                    "tools": [
                        "Simultaneous",
                        "Consecutive"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "translator",
                        "localization specialist",
                        "interpreter"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Interpretation (Simultaneous/Consecutive).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Interpretation (Simultaneous/Consecutive).",
                "missingSignal": "No mention of Interpretation (Simultaneous/Consecutive) or related concepts in the CV."
            },
            {
                "skill": "Industry-Specific Terminology",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "translator",
                        "localization specialist",
                        "interpreter"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Industry-Specific Terminology.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Industry-Specific Terminology.",
                "missingSignal": "No mention of Industry-Specific Terminology or related concepts in the CV."
            },
            {
                "skill": "Deadline & Project Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "translator",
                        "localization specialist",
                        "interpreter"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Deadline & Project Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Deadline & Project Management.",
                "missingSignal": "No mention of Deadline & Project Management or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "library_information_science",
        "skills": [
            {
                "skill": "Cataloging & Classification",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "librarian",
                        "information specialist",
                        "archivist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Cataloging & Classification.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Cataloging & Classification.",
                "missingSignal": "No mention of Cataloging & Classification or related concepts in the CV."
            },
            {
                "skill": "Information Retrieval Systems",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "librarian",
                        "information specialist",
                        "archivist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Information Retrieval Systems.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Information Retrieval Systems.",
                "missingSignal": "No mention of Information Retrieval Systems or related concepts in the CV."
            },
            {
                "skill": "Reference Services",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "librarian",
                        "information specialist",
                        "archivist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Reference Services.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Reference Services.",
                "missingSignal": "No mention of Reference Services or related concepts in the CV."
            },
            {
                "skill": "Digital Archiving",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "librarian",
                        "information specialist",
                        "archivist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Digital Archiving.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Digital Archiving.",
                "missingSignal": "No mention of Digital Archiving or related concepts in the CV."
            },
            {
                "skill": "Database/Metadata Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "librarian",
                        "information specialist",
                        "archivist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Database/Metadata Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Database/Metadata Management.",
                "missingSignal": "No mention of Database/Metadata Management or related concepts in the CV."
            },
            {
                "skill": "Research Assistance",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "librarian",
                        "information specialist",
                        "archivist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Research Assistance.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Research Assistance.",
                "missingSignal": "No mention of Research Assistance or related concepts in the CV."
            },
            {
                "skill": "Collection Development",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "librarian",
                        "information specialist",
                        "archivist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Collection Development.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Collection Development.",
                "missingSignal": "No mention of Collection Development or related concepts in the CV."
            },
            {
                "skill": "Library Software Systems",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "librarian",
                        "information specialist",
                        "archivist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Library Software Systems.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Library Software Systems.",
                "missingSignal": "No mention of Library Software Systems or related concepts in the CV."
            },
            {
                "skill": "Information Literacy Instruction",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "librarian",
                        "information specialist",
                        "archivist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Information Literacy Instruction.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Information Literacy Instruction.",
                "missingSignal": "No mention of Information Literacy Instruction or related concepts in the CV."
            },
            {
                "skill": "Records Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "librarian",
                        "information specialist",
                        "archivist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Records Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Records Management.",
                "missingSignal": "No mention of Records Management or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "nonprofit_ngo_management",
        "skills": [
            {
                "skill": "Grant Writing & Fundraising",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "nonprofit manager",
                        "ngo program manager",
                        "program director"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Grant Writing & Fundraising.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Grant Writing & Fundraising.",
                "missingSignal": "No mention of Grant Writing & Fundraising or related concepts in the CV."
            },
            {
                "skill": "Program Design & Evaluation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "nonprofit manager",
                        "ngo program manager",
                        "program director"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Program Design & Evaluation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Program Design & Evaluation.",
                "missingSignal": "No mention of Program Design & Evaluation or related concepts in the CV."
            },
            {
                "skill": "Donor Relationship Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "nonprofit manager",
                        "ngo program manager",
                        "program director"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Donor Relationship Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Donor Relationship Management.",
                "missingSignal": "No mention of Donor Relationship Management or related concepts in the CV."
            },
            {
                "skill": "Budget & Financial Stewardship",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "nonprofit manager",
                        "ngo program manager",
                        "program director"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Budget & Financial Stewardship.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Budget & Financial Stewardship.",
                "missingSignal": "No mention of Budget & Financial Stewardship or related concepts in the CV."
            },
            {
                "skill": "Stakeholder/Community Engagement",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "nonprofit manager",
                        "ngo program manager",
                        "program director"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Stakeholder/Community Engagement.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Stakeholder/Community Engagement.",
                "missingSignal": "No mention of Stakeholder/Community Engagement or related concepts in the CV."
            },
            {
                "skill": "Monitoring & Evaluation (M&E)",
                "evidence": {
                    "tools": [
                        "M&E"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "nonprofit manager",
                        "ngo program manager",
                        "program director"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Monitoring & Evaluation (M&E).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Monitoring & Evaluation (M&E).",
                "missingSignal": "No mention of Monitoring & Evaluation (M&E) or related concepts in the CV."
            },
            {
                "skill": "Volunteer Coordination",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "nonprofit manager",
                        "ngo program manager",
                        "program director"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Volunteer Coordination.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Volunteer Coordination.",
                "missingSignal": "No mention of Volunteer Coordination or related concepts in the CV."
            },
            {
                "skill": "Compliance with Donor Requirements",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "nonprofit manager",
                        "ngo program manager",
                        "program director"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Compliance with Donor Requirements.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Compliance with Donor Requirements.",
                "missingSignal": "No mention of Compliance with Donor Requirements or related concepts in the CV."
            },
            {
                "skill": "Impact Reporting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "nonprofit manager",
                        "ngo program manager",
                        "program director"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Impact Reporting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Impact Reporting.",
                "missingSignal": "No mention of Impact Reporting or related concepts in the CV."
            },
            {
                "skill": "Partnership Development",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "nonprofit manager",
                        "ngo program manager",
                        "program director"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Partnership Development.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Partnership Development.",
                "missingSignal": "No mention of Partnership Development or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "government_public_administration",
        "skills": [
            {
                "skill": "Public Policy Analysis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "public administrator",
                        "government official",
                        "civil servant"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Public Policy Analysis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Public Policy Analysis.",
                "missingSignal": "No mention of Public Policy Analysis or related concepts in the CV."
            },
            {
                "skill": "Government Budgeting & Finance",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "public administrator",
                        "government official",
                        "civil servant"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Government Budgeting & Finance.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Government Budgeting & Finance.",
                "missingSignal": "No mention of Government Budgeting & Finance or related concepts in the CV."
            },
            {
                "skill": "Regulatory Implementation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "public administrator",
                        "government official",
                        "civil servant"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Regulatory Implementation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Regulatory Implementation.",
                "missingSignal": "No mention of Regulatory Implementation or related concepts in the CV."
            },
            {
                "skill": "Stakeholder/Community Consultation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "public administrator",
                        "government official",
                        "civil servant"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Stakeholder/Community Consultation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Stakeholder/Community Consultation.",
                "missingSignal": "No mention of Stakeholder/Community Consultation or related concepts in the CV."
            },
            {
                "skill": "Program Administration",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "public administrator",
                        "government official",
                        "civil servant"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Program Administration.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Program Administration.",
                "missingSignal": "No mention of Program Administration or related concepts in the CV."
            },
            {
                "skill": "Public Records Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "public administrator",
                        "government official",
                        "civil servant"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Public Records Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Public Records Management.",
                "missingSignal": "No mention of Public Records Management or related concepts in the CV."
            },
            {
                "skill": "Legislative Process Knowledge",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "public administrator",
                        "government official",
                        "civil servant"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Legislative Process Knowledge.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Legislative Process Knowledge.",
                "missingSignal": "No mention of Legislative Process Knowledge or related concepts in the CV."
            },
            {
                "skill": "Intergovernmental Coordination",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "public administrator",
                        "government official",
                        "civil servant"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Intergovernmental Coordination.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Intergovernmental Coordination.",
                "missingSignal": "No mention of Intergovernmental Coordination or related concepts in the CV."
            },
            {
                "skill": "Public Procurement",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "public administrator",
                        "government official",
                        "civil servant"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Public Procurement.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Public Procurement.",
                "missingSignal": "No mention of Public Procurement or related concepts in the CV."
            },
            {
                "skill": "Constituent Services",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "public administrator",
                        "government official",
                        "civil servant"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Constituent Services.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Constituent Services.",
                "missingSignal": "No mention of Constituent Services or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "urban_regional_planning_policy",
        "skills": [
            {
                "skill": "Land Use Planning",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "urban planner (policy)",
                        "regional planner",
                        "land use planner"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Land Use Planning.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Land Use Planning.",
                "missingSignal": "No mention of Land Use Planning or related concepts in the CV."
            },
            {
                "skill": "Zoning Regulation Analysis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "urban planner (policy)",
                        "regional planner",
                        "land use planner"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Zoning Regulation Analysis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Zoning Regulation Analysis.",
                "missingSignal": "No mention of Zoning Regulation Analysis or related concepts in the CV."
            },
            {
                "skill": "GIS Mapping & Spatial Analysis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "urban planner (policy)",
                        "regional planner",
                        "land use planner"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with GIS Mapping & Spatial Analysis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to GIS Mapping & Spatial Analysis.",
                "missingSignal": "No mention of GIS Mapping & Spatial Analysis or related concepts in the CV."
            },
            {
                "skill": "Public Consultation Facilitation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "urban planner (policy)",
                        "regional planner",
                        "land use planner"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Public Consultation Facilitation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Public Consultation Facilitation.",
                "missingSignal": "No mention of Public Consultation Facilitation or related concepts in the CV."
            },
            {
                "skill": "Environmental Impact Review",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "urban planner (policy)",
                        "regional planner",
                        "land use planner"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Environmental Impact Review.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Environmental Impact Review.",
                "missingSignal": "No mention of Environmental Impact Review or related concepts in the CV."
            },
            {
                "skill": "Transportation Planning",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "urban planner (policy)",
                        "regional planner",
                        "land use planner"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Transportation Planning.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Transportation Planning.",
                "missingSignal": "No mention of Transportation Planning or related concepts in the CV."
            },
            {
                "skill": "Comprehensive Plan Development",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "urban planner (policy)",
                        "regional planner",
                        "land use planner"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Comprehensive Plan Development.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Comprehensive Plan Development.",
                "missingSignal": "No mention of Comprehensive Plan Development or related concepts in the CV."
            },
            {
                "skill": "Policy Drafting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "urban planner (policy)",
                        "regional planner",
                        "land use planner"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Policy Drafting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Policy Drafting.",
                "missingSignal": "No mention of Policy Drafting or related concepts in the CV."
            },
            {
                "skill": "Community Development Strategy",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "urban planner (policy)",
                        "regional planner",
                        "land use planner"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Community Development Strategy.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Community Development Strategy.",
                "missingSignal": "No mention of Community Development Strategy or related concepts in the CV."
            },
            {
                "skill": "Regulatory Compliance (Planning Law)",
                "evidence": {
                    "tools": [
                        "Planning Law"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "urban planner (policy)",
                        "regional planner",
                        "land use planner"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Regulatory Compliance (Planning Law).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Regulatory Compliance (Planning Law).",
                "missingSignal": "No mention of Regulatory Compliance (Planning Law) or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "psychology_counseling",
        "skills": [
            {
                "skill": "Clinical Assessment & Diagnosis",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "psychologist",
                        "counselor",
                        "therapist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Clinical Assessment & Diagnosis.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Clinical Assessment & Diagnosis.",
                "missingSignal": "No mention of Clinical Assessment & Diagnosis or related concepts in the CV."
            },
            {
                "skill": "Therapeutic Techniques (CBT/etc.)",
                "evidence": {
                    "tools": [
                        "CBT",
                        "etc."
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "psychologist",
                        "counselor",
                        "therapist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Therapeutic Techniques (CBT/etc.).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Therapeutic Techniques (CBT/etc.).",
                "missingSignal": "No mention of Therapeutic Techniques (CBT/etc.) or related concepts in the CV."
            },
            {
                "skill": "Treatment Plan Development",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "psychologist",
                        "counselor",
                        "therapist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Treatment Plan Development.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Treatment Plan Development.",
                "missingSignal": "No mention of Treatment Plan Development or related concepts in the CV."
            },
            {
                "skill": "Crisis Intervention",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "psychologist",
                        "counselor",
                        "therapist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Crisis Intervention.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Crisis Intervention.",
                "missingSignal": "No mention of Crisis Intervention or related concepts in the CV."
            },
            {
                "skill": "Case Documentation & Notes",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "psychologist",
                        "counselor",
                        "therapist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Case Documentation & Notes.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Case Documentation & Notes.",
                "missingSignal": "No mention of Case Documentation & Notes or related concepts in the CV."
            },
            {
                "skill": "Ethical & Confidentiality Standards",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "psychologist",
                        "counselor",
                        "therapist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Ethical & Confidentiality Standards.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Ethical & Confidentiality Standards.",
                "missingSignal": "No mention of Ethical & Confidentiality Standards or related concepts in the CV."
            },
            {
                "skill": "Client Rapport Building",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "psychologist",
                        "counselor",
                        "therapist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Client Rapport Building.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Client Rapport Building.",
                "missingSignal": "No mention of Client Rapport Building or related concepts in the CV."
            },
            {
                "skill": "Group/Individual Therapy Facilitation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "psychologist",
                        "counselor",
                        "therapist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Group/Individual Therapy Facilitation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Group/Individual Therapy Facilitation.",
                "missingSignal": "No mention of Group/Individual Therapy Facilitation or related concepts in the CV."
            },
            {
                "skill": "Psychological Testing",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "psychologist",
                        "counselor",
                        "therapist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Psychological Testing.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Psychological Testing.",
                "missingSignal": "No mention of Psychological Testing or related concepts in the CV."
            },
            {
                "skill": "Referral Coordination",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "psychologist",
                        "counselor",
                        "therapist"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Referral Coordination.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Referral Coordination.",
                "missingSignal": "No mention of Referral Coordination or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "social_work",
        "skills": [
            {
                "skill": "Case Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "social worker",
                        "case manager",
                        "child welfare"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Case Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Case Management.",
                "missingSignal": "No mention of Case Management or related concepts in the CV."
            },
            {
                "skill": "Client Needs Assessment",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "social worker",
                        "case manager",
                        "child welfare"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Client Needs Assessment.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Client Needs Assessment.",
                "missingSignal": "No mention of Client Needs Assessment or related concepts in the CV."
            },
            {
                "skill": "Crisis Intervention",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "social worker",
                        "case manager",
                        "child welfare"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Crisis Intervention.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Crisis Intervention.",
                "missingSignal": "No mention of Crisis Intervention or related concepts in the CV."
            },
            {
                "skill": "Resource & Referral Coordination",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "social worker",
                        "case manager",
                        "child welfare"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Resource & Referral Coordination.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Resource & Referral Coordination.",
                "missingSignal": "No mention of Resource & Referral Coordination or related concepts in the CV."
            },
            {
                "skill": "Documentation & Case Notes",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "social worker",
                        "case manager",
                        "child welfare"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Documentation & Case Notes.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Documentation & Case Notes.",
                "missingSignal": "No mention of Documentation & Case Notes or related concepts in the CV."
            },
            {
                "skill": "Family/Community Engagement",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "social worker",
                        "case manager",
                        "child welfare"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Family/Community Engagement.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Family/Community Engagement.",
                "missingSignal": "No mention of Family/Community Engagement or related concepts in the CV."
            },
            {
                "skill": "Child/Adult Protection Protocols",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "social worker",
                        "case manager",
                        "child welfare"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Child/Adult Protection Protocols.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Child/Adult Protection Protocols.",
                "missingSignal": "No mention of Child/Adult Protection Protocols or related concepts in the CV."
            },
            {
                "skill": "Advocacy",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "social worker",
                        "case manager",
                        "child welfare"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Advocacy.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Advocacy.",
                "missingSignal": "No mention of Advocacy or related concepts in the CV."
            },
            {
                "skill": "Cultural Competency",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "social worker",
                        "case manager",
                        "child welfare"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Cultural Competency.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Cultural Competency.",
                "missingSignal": "No mention of Cultural Competency or related concepts in the CV."
            },
            {
                "skill": "Interagency Collaboration",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "social worker",
                        "case manager",
                        "child welfare"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Interagency Collaboration.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Interagency Collaboration.",
                "missingSignal": "No mention of Interagency Collaboration or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "funeral_services_mortuary",
        "skills": [
            {
                "skill": "Embalming & Body Preparation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "funeral director",
                        "mortician",
                        "embalmer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Embalming & Body Preparation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Embalming & Body Preparation.",
                "missingSignal": "No mention of Embalming & Body Preparation or related concepts in the CV."
            },
            {
                "skill": "Funeral Service Coordination",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "funeral director",
                        "mortician",
                        "embalmer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Funeral Service Coordination.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Funeral Service Coordination.",
                "missingSignal": "No mention of Funeral Service Coordination or related concepts in the CV."
            },
            {
                "skill": "Family Grief Support & Communication",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "funeral director",
                        "mortician",
                        "embalmer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Family Grief Support & Communication.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Family Grief Support & Communication.",
                "missingSignal": "No mention of Family Grief Support & Communication or related concepts in the CV."
            },
            {
                "skill": "Regulatory Compliance (Health/Burial Law)",
                "evidence": {
                    "tools": [
                        "Health",
                        "Burial Law"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "funeral director",
                        "mortician",
                        "embalmer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Regulatory Compliance (Health/Burial Law).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Regulatory Compliance (Health/Burial Law).",
                "missingSignal": "No mention of Regulatory Compliance (Health/Burial Law) or related concepts in the CV."
            },
            {
                "skill": "Funeral Arrangement Planning",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "funeral director",
                        "mortician",
                        "embalmer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Funeral Arrangement Planning.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Funeral Arrangement Planning.",
                "missingSignal": "No mention of Funeral Arrangement Planning or related concepts in the CV."
            },
            {
                "skill": "Documentation & Permits",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "funeral director",
                        "mortician",
                        "embalmer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Documentation & Permits.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Documentation & Permits.",
                "missingSignal": "No mention of Documentation & Permits or related concepts in the CV."
            },
            {
                "skill": "Vendor Coordination (Caskets/Flowers)",
                "evidence": {
                    "tools": [
                        "Caskets",
                        "Flowers"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "funeral director",
                        "mortician",
                        "embalmer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Vendor Coordination (Caskets/Flowers).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Vendor Coordination (Caskets/Flowers).",
                "missingSignal": "No mention of Vendor Coordination (Caskets/Flowers) or related concepts in the CV."
            },
            {
                "skill": "Facility & Equipment Maintenance",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "funeral director",
                        "mortician",
                        "embalmer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Facility & Equipment Maintenance.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Facility & Equipment Maintenance.",
                "missingSignal": "No mention of Facility & Equipment Maintenance or related concepts in the CV."
            },
            {
                "skill": "Cultural/Religious Sensitivity",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "funeral director",
                        "mortician",
                        "embalmer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Cultural/Religious Sensitivity.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Cultural/Religious Sensitivity.",
                "missingSignal": "No mention of Cultural/Religious Sensitivity or related concepts in the CV."
            },
            {
                "skill": "Record Keeping",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "funeral director",
                        "mortician",
                        "embalmer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Record Keeping.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Record Keeping.",
                "missingSignal": "No mention of Record Keeping or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "security_law_enforcement",
        "skills": [
            {
                "skill": "Patrol & Surveillance Procedures",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "security officer",
                        "police officer",
                        "law enforcement"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Patrol & Surveillance Procedures.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Patrol & Surveillance Procedures.",
                "missingSignal": "No mention of Patrol & Surveillance Procedures or related concepts in the CV."
            },
            {
                "skill": "Incident Reporting & Documentation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "security officer",
                        "police officer",
                        "law enforcement"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Incident Reporting & Documentation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Incident Reporting & Documentation.",
                "missingSignal": "No mention of Incident Reporting & Documentation or related concepts in the CV."
            },
            {
                "skill": "Conflict De-escalation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "security officer",
                        "police officer",
                        "law enforcement"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Conflict De-escalation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Conflict De-escalation.",
                "missingSignal": "No mention of Conflict De-escalation or related concepts in the CV."
            },
            {
                "skill": "Emergency Response Protocols",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "security officer",
                        "police officer",
                        "law enforcement"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Emergency Response Protocols.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Emergency Response Protocols.",
                "missingSignal": "No mention of Emergency Response Protocols or related concepts in the CV."
            },
            {
                "skill": "Access Control & Risk Assessment",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "security officer",
                        "police officer",
                        "law enforcement"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Access Control & Risk Assessment.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Access Control & Risk Assessment.",
                "missingSignal": "No mention of Access Control & Risk Assessment or related concepts in the CV."
            },
            {
                "skill": "Investigation Techniques",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "security officer",
                        "police officer",
                        "law enforcement"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Investigation Techniques.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Investigation Techniques.",
                "missingSignal": "No mention of Investigation Techniques or related concepts in the CV."
            },
            {
                "skill": "Use-of-Force Policy Knowledge",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "security officer",
                        "police officer",
                        "law enforcement"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Use-of-Force Policy Knowledge.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Use-of-Force Policy Knowledge.",
                "missingSignal": "No mention of Use-of-Force Policy Knowledge or related concepts in the CV."
            },
            {
                "skill": "Surveillance Systems (CCTV)",
                "evidence": {
                    "tools": [
                        "CCTV"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "security officer",
                        "police officer",
                        "law enforcement"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Surveillance Systems (CCTV).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Surveillance Systems (CCTV).",
                "missingSignal": "No mention of Surveillance Systems (CCTV) or related concepts in the CV."
            },
            {
                "skill": "Legal/Regulatory Knowledge",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "security officer",
                        "police officer",
                        "law enforcement"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Legal/Regulatory Knowledge.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Legal/Regulatory Knowledge.",
                "missingSignal": "No mention of Legal/Regulatory Knowledge or related concepts in the CV."
            },
            {
                "skill": "Community/Public Relations",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "security officer",
                        "police officer",
                        "law enforcement"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Community/Public Relations.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Community/Public Relations.",
                "missingSignal": "No mention of Community/Public Relations or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "aviation_flight_operations",
        "skills": [
            {
                "skill": "Flight Planning & Navigation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "pilot",
                        "flight crew",
                        "aviation operations"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Flight Planning & Navigation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Flight Planning & Navigation.",
                "missingSignal": "No mention of Flight Planning & Navigation or related concepts in the CV."
            },
            {
                "skill": "Aircraft Systems Knowledge",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "pilot",
                        "flight crew",
                        "aviation operations"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Aircraft Systems Knowledge.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Aircraft Systems Knowledge.",
                "missingSignal": "No mention of Aircraft Systems Knowledge or related concepts in the CV."
            },
            {
                "skill": "Regulatory Compliance (FAA/ICAO)",
                "evidence": {
                    "tools": [
                        "FAA",
                        "ICAO"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "pilot",
                        "flight crew",
                        "aviation operations"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Regulatory Compliance (FAA/ICAO).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Regulatory Compliance (FAA/ICAO).",
                "missingSignal": "No mention of Regulatory Compliance (FAA/ICAO) or related concepts in the CV."
            },
            {
                "skill": "Crew Resource Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "pilot",
                        "flight crew",
                        "aviation operations"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Crew Resource Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Crew Resource Management.",
                "missingSignal": "No mention of Crew Resource Management or related concepts in the CV."
            },
            {
                "skill": "Emergency Procedures",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "pilot",
                        "flight crew",
                        "aviation operations"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Emergency Procedures.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Emergency Procedures.",
                "missingSignal": "No mention of Emergency Procedures or related concepts in the CV."
            },
            {
                "skill": "Weather Interpretation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "pilot",
                        "flight crew",
                        "aviation operations"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Weather Interpretation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Weather Interpretation.",
                "missingSignal": "No mention of Weather Interpretation or related concepts in the CV."
            },
            {
                "skill": "Flight Documentation/Logs",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "pilot",
                        "flight crew",
                        "aviation operations"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Flight Documentation/Logs.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Flight Documentation/Logs.",
                "missingSignal": "No mention of Flight Documentation/Logs or related concepts in the CV."
            },
            {
                "skill": "Communication (ATC Protocols)",
                "evidence": {
                    "tools": [
                        "ATC Protocols"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "pilot",
                        "flight crew",
                        "aviation operations"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Communication (ATC Protocols).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Communication (ATC Protocols).",
                "missingSignal": "No mention of Communication (ATC Protocols) or related concepts in the CV."
            },
            {
                "skill": "Safety Management Systems",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "pilot",
                        "flight crew",
                        "aviation operations"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Safety Management Systems.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Safety Management Systems.",
                "missingSignal": "No mention of Safety Management Systems or related concepts in the CV."
            },
            {
                "skill": "Aircraft Pre-Flight Inspection",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "pilot",
                        "flight crew",
                        "aviation operations"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Aircraft Pre-Flight Inspection.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Aircraft Pre-Flight Inspection.",
                "missingSignal": "No mention of Aircraft Pre-Flight Inspection or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "maritime_shipping_operations",
        "skills": [
            {
                "skill": "Vessel Navigation & Operations",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "maritime officer",
                        "shipping operations",
                        "vessel operations"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Vessel Navigation & Operations.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Vessel Navigation & Operations.",
                "missingSignal": "No mention of Vessel Navigation & Operations or related concepts in the CV."
            },
            {
                "skill": "Maritime Safety Regulations (SOLAS)",
                "evidence": {
                    "tools": [
                        "SOLAS"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "maritime officer",
                        "shipping operations",
                        "vessel operations"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Maritime Safety Regulations (SOLAS).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Maritime Safety Regulations (SOLAS).",
                "missingSignal": "No mention of Maritime Safety Regulations (SOLAS) or related concepts in the CV."
            },
            {
                "skill": "Cargo Handling & Stowage",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "maritime officer",
                        "shipping operations",
                        "vessel operations"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Cargo Handling & Stowage.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Cargo Handling & Stowage.",
                "missingSignal": "No mention of Cargo Handling & Stowage or related concepts in the CV."
            },
            {
                "skill": "Port Operations Coordination",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "maritime officer",
                        "shipping operations",
                        "vessel operations"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Port Operations Coordination.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Port Operations Coordination.",
                "missingSignal": "No mention of Port Operations Coordination or related concepts in the CV."
            },
            {
                "skill": "Shipping Documentation (Bill of Lading)",
                "evidence": {
                    "tools": [
                        "Bill of Lading"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "maritime officer",
                        "shipping operations",
                        "vessel operations"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Shipping Documentation (Bill of Lading).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Shipping Documentation (Bill of Lading).",
                "missingSignal": "No mention of Shipping Documentation (Bill of Lading) or related concepts in the CV."
            },
            {
                "skill": "Marine Engineering Basics",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "maritime officer",
                        "shipping operations",
                        "vessel operations"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Marine Engineering Basics.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Marine Engineering Basics.",
                "missingSignal": "No mention of Marine Engineering Basics or related concepts in the CV."
            },
            {
                "skill": "Logistics & Freight Coordination",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "maritime officer",
                        "shipping operations",
                        "vessel operations"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Logistics & Freight Coordination.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Logistics & Freight Coordination.",
                "missingSignal": "No mention of Logistics & Freight Coordination or related concepts in the CV."
            },
            {
                "skill": "Customs/Regulatory Compliance",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "maritime officer",
                        "shipping operations",
                        "vessel operations"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Customs/Regulatory Compliance.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Customs/Regulatory Compliance.",
                "missingSignal": "No mention of Customs/Regulatory Compliance or related concepts in the CV."
            },
            {
                "skill": "Crew Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "maritime officer",
                        "shipping operations",
                        "vessel operations"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Crew Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Crew Management.",
                "missingSignal": "No mention of Crew Management or related concepts in the CV."
            },
            {
                "skill": "Emergency Response (Maritime)",
                "evidence": {
                    "tools": [
                        "Maritime"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "maritime officer",
                        "shipping operations",
                        "vessel operations"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Emergency Response (Maritime).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Emergency Response (Maritime).",
                "missingSignal": "No mention of Emergency Response (Maritime) or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "telecommunications_engineering",
        "skills": [
            {
                "skill": "RF/Wireless Network Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "telecom engineer",
                        "telecommunications",
                        "rf engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with RF/Wireless Network Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to RF/Wireless Network Design.",
                "missingSignal": "No mention of RF/Wireless Network Design or related concepts in the CV."
            },
            {
                "skill": "Telecom Infrastructure (4G/5G)",
                "evidence": {
                    "tools": [
                        "4G",
                        "5G"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "telecom engineer",
                        "telecommunications",
                        "rf engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Telecom Infrastructure (4G/5G).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Telecom Infrastructure (4G/5G).",
                "missingSignal": "No mention of Telecom Infrastructure (4G/5G) or related concepts in the CV."
            },
            {
                "skill": "Fiber Optic Systems",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "telecom engineer",
                        "telecommunications",
                        "rf engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Fiber Optic Systems.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Fiber Optic Systems.",
                "missingSignal": "No mention of Fiber Optic Systems or related concepts in the CV."
            },
            {
                "skill": "Network Protocols",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "telecom engineer",
                        "telecommunications",
                        "rf engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Network Protocols.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Network Protocols.",
                "missingSignal": "No mention of Network Protocols or related concepts in the CV."
            },
            {
                "skill": "Telecom Equipment Installation",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "telecom engineer",
                        "telecommunications",
                        "rf engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Telecom Equipment Installation.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Telecom Equipment Installation.",
                "missingSignal": "No mention of Telecom Equipment Installation or related concepts in the CV."
            },
            {
                "skill": "Signal Testing & Optimization",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "telecom engineer",
                        "telecommunications",
                        "rf engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Signal Testing & Optimization.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Signal Testing & Optimization.",
                "missingSignal": "No mention of Signal Testing & Optimization or related concepts in the CV."
            },
            {
                "skill": "Regulatory/Spectrum Compliance",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "telecom engineer",
                        "telecommunications",
                        "rf engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Regulatory/Spectrum Compliance.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Regulatory/Spectrum Compliance.",
                "missingSignal": "No mention of Regulatory/Spectrum Compliance or related concepts in the CV."
            },
            {
                "skill": "VoIP Systems",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "telecom engineer",
                        "telecommunications",
                        "rf engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with VoIP Systems.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to VoIP Systems.",
                "missingSignal": "No mention of VoIP Systems or related concepts in the CV."
            },
            {
                "skill": "Telecom Project Management",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "telecom engineer",
                        "telecommunications",
                        "rf engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Telecom Project Management.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Telecom Project Management.",
                "missingSignal": "No mention of Telecom Project Management or related concepts in the CV."
            },
            {
                "skill": "Troubleshooting & Maintenance",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "telecom engineer",
                        "telecommunications",
                        "rf engineer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Troubleshooting & Maintenance.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Troubleshooting & Maintenance.",
                "missingSignal": "No mention of Troubleshooting & Maintenance or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "fashion_design_merchandising",
        "skills": [
            {
                "skill": "Garment Design & Sketching",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "fashion designer",
                        "merchandiser",
                        "fashion buyer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Garment Design & Sketching.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Garment Design & Sketching.",
                "missingSignal": "No mention of Garment Design & Sketching or related concepts in the CV."
            },
            {
                "skill": "Pattern Making & Draping",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "fashion designer",
                        "merchandiser",
                        "fashion buyer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Pattern Making & Draping.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Pattern Making & Draping.",
                "missingSignal": "No mention of Pattern Making & Draping or related concepts in the CV."
            },
            {
                "skill": "Textile/Fabric Knowledge",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "fashion designer",
                        "merchandiser",
                        "fashion buyer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Textile/Fabric Knowledge.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Textile/Fabric Knowledge.",
                "missingSignal": "No mention of Textile/Fabric Knowledge or related concepts in the CV."
            },
            {
                "skill": "Trend Forecasting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "fashion designer",
                        "merchandiser",
                        "fashion buyer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Trend Forecasting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Trend Forecasting.",
                "missingSignal": "No mention of Trend Forecasting or related concepts in the CV."
            },
            {
                "skill": "Merchandising & Buying Strategy",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "fashion designer",
                        "merchandiser",
                        "fashion buyer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Merchandising & Buying Strategy.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Merchandising & Buying Strategy.",
                "missingSignal": "No mention of Merchandising & Buying Strategy or related concepts in the CV."
            },
            {
                "skill": "CAD for Fashion (Illustrator/CLO3D)",
                "evidence": {
                    "tools": [
                        "Illustrator",
                        "CLO3D"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "fashion designer",
                        "merchandiser",
                        "fashion buyer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with CAD for Fashion (Illustrator/CLO3D).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to CAD for Fashion (Illustrator/CLO3D).",
                "missingSignal": "No mention of CAD for Fashion (Illustrator/CLO3D) or related concepts in the CV."
            },
            {
                "skill": "Production & Sourcing Coordination",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "fashion designer",
                        "merchandiser",
                        "fashion buyer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Production & Sourcing Coordination.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Production & Sourcing Coordination.",
                "missingSignal": "No mention of Production & Sourcing Coordination or related concepts in the CV."
            },
            {
                "skill": "Collection Development",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "fashion designer",
                        "merchandiser",
                        "fashion buyer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Collection Development.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Collection Development.",
                "missingSignal": "No mention of Collection Development or related concepts in the CV."
            },
            {
                "skill": "Retail Visual Merchandising",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "fashion designer",
                        "merchandiser",
                        "fashion buyer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Retail Visual Merchandising.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Retail Visual Merchandising.",
                "missingSignal": "No mention of Retail Visual Merchandising or related concepts in the CV."
            },
            {
                "skill": "Brand & Market Positioning",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "fashion designer",
                        "merchandiser",
                        "fashion buyer"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Brand & Market Positioning.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Brand & Market Positioning.",
                "missingSignal": "No mention of Brand & Market Positioning or related concepts in the CV."
            }
        ]
    },
    {
        "categoryId": "fitness_coaching_personal_training",
        "skills": [
            {
                "skill": "Exercise Program Design",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "personal trainer",
                        "fitness coach",
                        "strength coach"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Exercise Program Design.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Exercise Program Design.",
                "missingSignal": "No mention of Exercise Program Design or related concepts in the CV."
            },
            {
                "skill": "Client Fitness Assessment",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "personal trainer",
                        "fitness coach",
                        "strength coach"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Client Fitness Assessment.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Client Fitness Assessment.",
                "missingSignal": "No mention of Client Fitness Assessment or related concepts in the CV."
            },
            {
                "skill": "Nutrition Basics & Guidance",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "personal trainer",
                        "fitness coach",
                        "strength coach"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Nutrition Basics & Guidance.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Nutrition Basics & Guidance.",
                "missingSignal": "No mention of Nutrition Basics & Guidance or related concepts in the CV."
            },
            {
                "skill": "Injury Prevention & Modification",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "personal trainer",
                        "fitness coach",
                        "strength coach"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Injury Prevention & Modification.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Injury Prevention & Modification.",
                "missingSignal": "No mention of Injury Prevention & Modification or related concepts in the CV."
            },
            {
                "skill": "Strength & Conditioning Techniques",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "personal trainer",
                        "fitness coach",
                        "strength coach"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Strength & Conditioning Techniques.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Strength & Conditioning Techniques.",
                "missingSignal": "No mention of Strength & Conditioning Techniques or related concepts in the CV."
            },
            {
                "skill": "Motivational Coaching",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "personal trainer",
                        "fitness coach",
                        "strength coach"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Motivational Coaching.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Motivational Coaching.",
                "missingSignal": "No mention of Motivational Coaching or related concepts in the CV."
            },
            {
                "skill": "Group Fitness Instruction",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "personal trainer",
                        "fitness coach",
                        "strength coach"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Group Fitness Instruction.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Group Fitness Instruction.",
                "missingSignal": "No mention of Group Fitness Instruction or related concepts in the CV."
            },
            {
                "skill": "Progress Tracking & Goal Setting",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "personal trainer",
                        "fitness coach",
                        "strength coach"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Progress Tracking & Goal Setting.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Progress Tracking & Goal Setting.",
                "missingSignal": "No mention of Progress Tracking & Goal Setting or related concepts in the CV."
            },
            {
                "skill": "Equipment & Facility Safety",
                "evidence": {
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "personal trainer",
                        "fitness coach",
                        "strength coach"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Equipment & Facility Safety.",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Equipment & Facility Safety.",
                "missingSignal": "No mention of Equipment & Facility Safety or related concepts in the CV."
            },
            {
                "skill": "Certification Maintenance (CPT/ACE/NASM)",
                "evidence": {
                    "tools": [
                        "CPT",
                        "ACE",
                        "NASM"
                    ],
                    "actionVerbs": [
                        "implemented",
                        "managed",
                        "developed",
                        "utilized",
                        "applied"
                    ],
                    "titles": [
                        "personal trainer",
                        "fitness coach",
                        "strength coach"
                    ],
                    "certifications": []
                },
                "exactCriteria": "Clear evidence of practical professional experience with Certification Maintenance (CPT/ACE/NASM).",
                "partialCriteria": "Academic knowledge, foundational understanding, or indirect exposure to Certification Maintenance (CPT/ACE/NASM).",
                "missingSignal": "No mention of Certification Maintenance (CPT/ACE/NASM) or related concepts in the CV."
            }
        ]
    }
];

export function getExtractionGuideForCategory(
    categoryId: string
): CategoryExtractionGuide | undefined {
    return EXTRACTION_GUIDE.find((c) => c.categoryId === categoryId);
}

export function serializeExtractionGuideForPrompt(
    guides: CategoryExtractionGuide[]
): string {
    const blocks = guides.map((category) => {
        const skillBlocks = category.skills.map((s) => {
            const evidenceParts: string[] = [];
            if (s.evidence.tools?.length) evidenceParts.push(`Tools/Tech: ${s.evidence.tools.join(", ")}`);
            if (s.evidence.certifications?.length)
                evidenceParts.push(`Certifications: ${s.evidence.certifications.join(", ")}`);
            if (s.evidence.actionVerbs?.length)
                evidenceParts.push(`Phrasing cues: ${s.evidence.actionVerbs.join(", ")}`);
            if (s.evidence.titles?.length) evidenceParts.push(`Titles: ${s.evidence.titles.join(", ")}`);

            const partialMatchLine = s.partialMatches?.length
                ? `\n  Counts as PARTIAL: ${s.partialMatches.join("; ")}`
                : "";

            return (
                `- ${s.skill}\n` +
                `  Evidence to look for: ${evidenceParts.join(" | ")}\n` +
                `  EXACT if: ${s.exactCriteria}\n` +
                `  PARTIAL if: ${s.partialCriteria}${partialMatchLine}\n` +
                `  MISSING if: ${s.missingSignal}`
            );
        });
        return skillBlocks.join("\n");
    });

    return blocks.join("\n\n");
}
