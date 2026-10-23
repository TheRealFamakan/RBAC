// roles.js — Role Based Access Control (RBAC) UI configuration (English, no emojis)

export const ROLE_CONFIG = {
  c_level: {
    label: 'C-Level Executive',
    code: 'c_level',
    color: 'from-amber-500 to-orange-600',
    accent: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    badge: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800/40',
    description: 'Full enterprise visibility across all 5 operational divisions',
    accessibleDepartments: ['Finance', 'HR', 'Marketing', 'Engineering', 'General'],
  },
  finance: {
    label: 'Finance Specialist',
    code: 'finance',
    color: 'from-emerald-500 to-teal-600',
    accent: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    badge: 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800/40',
    description: 'Financial statements, quarterly reports, margins, and expenses',
    accessibleDepartments: ['Finance', 'General'],
  },
  marketing: {
    label: 'Marketing Lead',
    code: 'marketing',
    color: 'from-purple-500 to-indigo-600',
    accent: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
    badge: 'bg-purple-50 text-purple-900 border-purple-200 dark:bg-purple-950/40 dark:text-purple-200 dark:border-purple-800/40',
    description: 'Campaign analytics, ROI benchmarks, and customer acquisition',
    accessibleDepartments: ['Marketing', 'General'],
  },
  hr: {
    label: 'People & Culture',
    code: 'hr',
    color: 'from-rose-500 to-pink-600',
    accent: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    badge: 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800/40',
    description: 'Workforce records, department headcounts, and employee profiles',
    accessibleDepartments: ['HR', 'General'],
  },
  engineering: {
    label: 'Engineering & DevOps',
    code: 'engineering',
    color: 'from-blue-500 to-cyan-600',
    accent: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
    badge: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800/40',
    description: 'System architecture, API specifications, and infrastructure protocols',
    accessibleDepartments: ['Engineering', 'General'],
  },
  employee: {
    label: 'General Associate',
    code: 'employee',
    color: 'from-slate-600 to-slate-800',
    accent: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
    badge: 'bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700',
    description: 'Employee handbook, corporate policies, benefits, and workplace FAQs',
    accessibleDepartments: ['General'],
  },
};

// Curated enterprise queries per role
export const SUGGESTED_QUESTIONS = {
  c_level: [
    'What was the Q3 2024 revenue and YoY growth rate?',
    'What was the projected ROI for Q4 2024 marketing campaigns?',
    'How many employee records are in the workforce dataset?',
    'Summarize the core technical architecture and capabilities.',
  ],
  finance: [
    'What is the Q3 2024 revenue?',
    'What were the main expense categories in 2024?',
    'What is the gross margin reported for Q2 2024?',
    'What was the cash flow from operations in Q3 2024?',
  ],
  marketing: [
    'What was the projected ROI for Q4 2024 marketing campaigns?',
    'What was the customer acquisition target for Q4 2024?',
    'What were the primary campaign pillars for Q4 2024?',
    'What conversion rate target was established in Q4?',
  ],
  hr: [
    'How many total employee records are in the HR dataset?',
    'What is the role and department of employee FINEMP1000?',
    'What is the title and location of employee FINEMP1005?',
    'What performance metrics and attributes are tracked in HR records?',
  ],
  engineering: [
    'What are the core capabilities and mission of FinSolve Technologies?',
    'What software development lifecycle guidelines are specified?',
    'What security and compliance frameworks are implemented?',
    'Describe the deployment and monitoring practices in engineering.',
  ],
  employee: [
    'What is the annual leave allowance at FinSolve?',
    'How should an employee submit an expense reimbursement request?',
    'What are the core company values and vision?',
    'What is the standard onboarding process for new employees?',
  ],
};
