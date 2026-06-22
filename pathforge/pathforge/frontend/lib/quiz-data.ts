export type SkillCategory =
  | 'frontend_dev'
  | 'backend_dev'
  | 'data_analysis'
  | 'machine_learning'
  | 'marketing'
  | 'finance'
  | 'design'
  | 'general'

export interface QuizQuestion {
  id: string
  skillCategory: SkillCategory
  question: string
  options: [string, string, string, string]
  correctIndex: 0 | 1 | 2 | 3
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export const quizQuestions: QuizQuestion[] = [
  // ── Frontend Dev ────────────────────────────────────────────────────────────
  {
    id: 'fe-1',
    skillCategory: 'frontend_dev',
    question: 'Which CSS property controls the stacking order of overlapping elements?',
    options: ['position', 'z-index', 'display', 'overflow'],
    correctIndex: 1,
    explanation: 'z-index determines the stacking order of positioned elements (elements with position other than static).',
    difficulty: 'easy',
  },
  {
    id: 'fe-2',
    skillCategory: 'frontend_dev',
    question: 'What does the React useEffect hook run after?',
    options: ['Before the component mounts', 'After every render by default', 'Only on component unmount', 'Before state updates'],
    correctIndex: 1,
    explanation: 'useEffect runs after every render by default. The dependency array controls when it re-runs.',
    difficulty: 'easy',
  },
  {
    id: 'fe-3',
    skillCategory: 'frontend_dev',
    question: 'What is the purpose of the "key" prop in React lists?',
    options: [
      'It styles each list item',
      'It helps React identify which items changed, added, or removed',
      'It defines the order of rendering',
      'It sets the accessibility label',
    ],
    correctIndex: 1,
    explanation: 'Keys help React efficiently update the DOM by identifying which list items have changed, been added, or removed.',
    difficulty: 'easy',
  },
  {
    id: 'fe-4',
    skillCategory: 'frontend_dev',
    question: 'In TypeScript, what is the difference between "interface" and "type"?',
    options: [
      'interface is only for objects; type can represent any type including primitives and unions',
      'type is only for functions; interface is for objects',
      'They are completely identical',
      'interface supports generics; type does not',
    ],
    correctIndex: 0,
    explanation: 'interface is primarily for object shapes and supports declaration merging. type is more flexible and can represent primitives, unions, tuples, and complex types.',
    difficulty: 'medium',
  },
  {
    id: 'fe-5',
    skillCategory: 'frontend_dev',
    question: 'What does CSS Grid\'s "fr" unit represent?',
    options: ['Fixed resolution', 'A fraction of the available free space', 'Font-relative sizing', 'Flexible ratio units'],
    correctIndex: 1,
    explanation: '"fr" represents a fraction of the available free space in the grid container, making it great for responsive layouts.',
    difficulty: 'medium',
  },
  {
    id: 'fe-6',
    skillCategory: 'frontend_dev',
    question: 'What is code splitting in React and why is it used?',
    options: [
      'Splitting CSS from JavaScript to reduce parse time',
      'Dividing React code into smaller chunks loaded on demand to improve initial load performance',
      'Separating component logic from render functions',
      'Running components in parallel threads',
    ],
    correctIndex: 1,
    explanation: 'Code splitting divides the bundle into smaller chunks that are loaded on demand (lazy loading), reducing initial page load time.',
    difficulty: 'hard',
  },

  // ── Backend Dev ─────────────────────────────────────────────────────────────
  {
    id: 'be-1',
    skillCategory: 'backend_dev',
    question: 'What does REST stand for?',
    options: ['Remote Execution State Transfer', 'Representational State Transfer', 'Resource Entity Service Template', 'Relational Entity State Transfer'],
    correctIndex: 1,
    explanation: 'REST (Representational State Transfer) is an architectural style for distributed hypermedia systems, typically used for web APIs.',
    difficulty: 'easy',
  },
  {
    id: 'be-2',
    skillCategory: 'backend_dev',
    question: 'Which HTTP status code indicates a resource was successfully created?',
    options: ['200 OK', '204 No Content', '201 Created', '202 Accepted'],
    correctIndex: 2,
    explanation: '201 Created indicates that the request has been fulfilled and a new resource has been created.',
    difficulty: 'easy',
  },
  {
    id: 'be-3',
    skillCategory: 'backend_dev',
    question: 'What is the primary purpose of database indexing?',
    options: [
      'To encrypt data for security',
      'To speed up data retrieval operations',
      'To normalize database tables',
      'To define relationships between tables',
    ],
    correctIndex: 1,
    explanation: 'Indexes create a data structure that allows the database to find rows quickly without scanning the entire table.',
    difficulty: 'easy',
  },
  {
    id: 'be-4',
    skillCategory: 'backend_dev',
    question: 'What is the difference between authentication and authorization?',
    options: [
      'They mean the same thing',
      'Authentication verifies identity; authorization determines what a verified user can do',
      'Authorization verifies identity; authentication grants permissions',
      'Authentication is for users; authorization is for services',
    ],
    correctIndex: 1,
    explanation: 'Authentication confirms who you are (login), while authorization determines what you are allowed to do (permissions).',
    difficulty: 'medium',
  },
  {
    id: 'be-5',
    skillCategory: 'backend_dev',
    question: 'What does ACID stand for in database transactions?',
    options: [
      'Atomic, Consistent, Isolated, Durable',
      'Available, Consistent, Isolated, Distributed',
      'Atomic, Concurrent, Indexed, Durable',
      'Available, Concurrent, Incremental, Durable',
    ],
    correctIndex: 0,
    explanation: 'ACID ensures database transactions are processed reliably: Atomicity, Consistency, Isolation, Durability.',
    difficulty: 'medium',
  },
  {
    id: 'be-6',
    skillCategory: 'backend_dev',
    question: 'In microservices, what is a circuit breaker pattern used for?',
    options: [
      'Encrypting inter-service communication',
      'Preventing cascading failures by stopping requests to a failing service',
      'Load balancing between service instances',
      'Splitting services into smaller units',
    ],
    correctIndex: 1,
    explanation: 'Circuit breaker detects failures and prevents the application from repeatedly trying to call a failing service, allowing it to recover.',
    difficulty: 'hard',
  },

  // ── Data Analysis ───────────────────────────────────────────────────────────
  {
    id: 'da-1',
    skillCategory: 'data_analysis',
    question: 'What does SQL\'s GROUP BY clause do?',
    options: [
      'Sorts result rows',
      'Filters individual rows',
      'Groups rows that have the same values, used with aggregate functions',
      'Joins tables together',
    ],
    correctIndex: 2,
    explanation: 'GROUP BY groups rows with the same values in specified columns, enabling aggregate functions (SUM, COUNT, AVG) to operate on each group.',
    difficulty: 'easy',
  },
  {
    id: 'da-2',
    skillCategory: 'data_analysis',
    question: 'What is the median of the dataset: [3, 1, 7, 9, 2]?',
    options: ['3', '4.4', '2', '7'],
    correctIndex: 0,
    explanation: 'Sorted: [1, 2, 3, 7, 9]. The median is the middle value = 3.',
    difficulty: 'easy',
  },
  {
    id: 'da-3',
    skillCategory: 'data_analysis',
    question: 'What does pandas .describe() method return?',
    options: [
      'Column names and data types',
      'Summary statistics (count, mean, std, min, max, quartiles)',
      'The first 5 rows of the DataFrame',
      'The number of missing values per column',
    ],
    correctIndex: 1,
    explanation: '.describe() returns summary statistics for numeric columns: count, mean, std, min, 25%, 50%, 75%, and max.',
    difficulty: 'easy',
  },
  {
    id: 'da-4',
    skillCategory: 'data_analysis',
    question: 'What is the difference between LEFT JOIN and INNER JOIN in SQL?',
    options: [
      'No difference; they return the same results',
      'INNER JOIN returns only matching rows; LEFT JOIN returns all rows from the left table and matching rows from the right',
      'LEFT JOIN is faster than INNER JOIN',
      'INNER JOIN keeps all rows from both tables',
    ],
    correctIndex: 1,
    explanation: 'INNER JOIN returns only rows with matching values in both tables. LEFT JOIN returns all rows from the left table, with NULLs for non-matching right table rows.',
    difficulty: 'medium',
  },
  {
    id: 'da-5',
    skillCategory: 'data_analysis',
    question: 'What is the purpose of data normalization in a database?',
    options: [
      'To scale all values to 0-1 range',
      'To reduce redundancy and improve data integrity by organizing tables',
      'To speed up query execution',
      'To encrypt sensitive data',
    ],
    correctIndex: 1,
    explanation: 'Database normalization organizes tables to reduce data redundancy and dependency, improving data integrity through normal forms (1NF, 2NF, 3NF).',
    difficulty: 'medium',
  },
  {
    id: 'da-6',
    skillCategory: 'data_analysis',
    question: 'In A/B testing, what does statistical significance tell you?',
    options: [
      'That the result is practically important',
      'The probability that the observed difference is due to chance rather than a real effect',
      'The size of the effect between variants',
      'The minimum sample size required',
    ],
    correctIndex: 1,
    explanation: 'Statistical significance (p-value) measures how likely the observed difference could occur by random chance. Low p-value (e.g. < 0.05) means the result is unlikely due to chance.',
    difficulty: 'hard',
  },

  // ── Machine Learning ─────────────────────────────────────────────────────────
  {
    id: 'ml-1',
    skillCategory: 'machine_learning',
    question: 'What is overfitting in machine learning?',
    options: [
      'When the model is too simple to capture the data patterns',
      'When the model learns training data too well and fails to generalize to new data',
      'When training takes too long',
      'When the model has too few parameters',
    ],
    correctIndex: 1,
    explanation: 'Overfitting occurs when a model memorizes training data including noise, resulting in high training accuracy but poor performance on unseen data.',
    difficulty: 'easy',
  },
  {
    id: 'ml-2',
    skillCategory: 'machine_learning',
    question: 'What does the learning rate control in gradient descent?',
    options: [
      'The number of training epochs',
      'How many layers the neural network has',
      'The step size when updating model weights',
      'The batch size during training',
    ],
    correctIndex: 2,
    explanation: 'The learning rate controls how much model weights are updated in response to the estimated error each time the weights are updated.',
    difficulty: 'easy',
  },
  {
    id: 'ml-3',
    skillCategory: 'machine_learning',
    question: 'What is cross-validation primarily used for?',
    options: [
      'Speeding up model training',
      'Assessing how a model generalizes to an independent dataset',
      'Reducing the size of the training dataset',
      'Normalizing input features',
    ],
    correctIndex: 1,
    explanation: 'Cross-validation evaluates how well a model generalizes by training and testing on different subsets of the data, giving a more reliable performance estimate.',
    difficulty: 'medium',
  },
  {
    id: 'ml-4',
    skillCategory: 'machine_learning',
    question: 'What is the vanishing gradient problem?',
    options: [
      'Gradients become very large during backpropagation, causing instability',
      'Gradients become extremely small during backpropagation, preventing early layers from learning',
      'The loss function converges too quickly',
      'The model forgets earlier training data',
    ],
    correctIndex: 1,
    explanation: 'In deep networks, gradients can become exponentially small as they backpropagate through many layers, making it hard for early layers to learn. This is solved by ReLU activations, batch normalization, and residual connections.',
    difficulty: 'medium',
  },
  {
    id: 'ml-5',
    skillCategory: 'machine_learning',
    question: 'What is the purpose of an attention mechanism in transformers?',
    options: [
      'To reduce model size',
      'To allow the model to focus on relevant parts of the input when producing each output token',
      'To speed up inference',
      'To regularize the model and prevent overfitting',
    ],
    correctIndex: 1,
    explanation: 'Attention mechanisms allow models to weigh the importance of different input tokens when generating each output, enabling capturing of long-range dependencies without sequential processing.',
    difficulty: 'hard',
  },
  {
    id: 'ml-6',
    skillCategory: 'machine_learning',
    question: 'What distinguishes MLOps from traditional DevOps?',
    options: [
      'MLOps only handles deployment; DevOps handles the full lifecycle',
      'MLOps includes model versioning, data validation, feature stores, and continuous training pipelines in addition to software delivery',
      'They are the same set of practices',
      'MLOps is for research; DevOps is for production',
    ],
    correctIndex: 1,
    explanation: 'MLOps extends DevOps with ML-specific concerns: data versioning, model drift monitoring, feature stores, experiment tracking, and continuous retraining pipelines.',
    difficulty: 'hard',
  },

  // ── Marketing ────────────────────────────────────────────────────────────────
  {
    id: 'mkt-1',
    skillCategory: 'marketing',
    question: 'What does CAC stand for in marketing metrics?',
    options: ['Customer Acquisition Cost', 'Conversion Analytics Cycle', 'Channel Attribution Count', 'Customer Activity Curve'],
    correctIndex: 0,
    explanation: 'Customer Acquisition Cost (CAC) is the total cost to acquire a new customer, including all marketing and sales expenses.',
    difficulty: 'easy',
  },
  {
    id: 'mkt-2',
    skillCategory: 'marketing',
    question: 'What is a conversion rate?',
    options: [
      'The percentage of visitors who complete a desired action',
      'The cost per click in paid advertising',
      'The ratio of leads to qualified leads',
      'The number of page views per session',
    ],
    correctIndex: 0,
    explanation: 'Conversion rate is the percentage of visitors or leads who complete a desired action (purchase, signup, form fill) out of total visitors.',
    difficulty: 'easy',
  },
  {
    id: 'mkt-3',
    skillCategory: 'marketing',
    question: 'What is the difference between branded and non-branded keywords in SEO?',
    options: [
      'No difference in performance',
      'Branded include your company/product name; non-branded are generic terms related to your category',
      'Branded terms cost more in PPC; non-branded are free',
      'Non-branded keywords have higher conversion rates always',
    ],
    correctIndex: 1,
    explanation: 'Branded keywords include your brand name (e.g., "Nike shoes"), while non-branded keywords are category terms (e.g., "running shoes"). Branded typically has higher conversion but lower discovery volume.',
    difficulty: 'medium',
  },
  {
    id: 'mkt-4',
    skillCategory: 'marketing',
    question: 'What does LTV (Lifetime Value) represent?',
    options: [
      'Total revenue from all customers',
      'The total revenue a business can expect from a single customer account',
      'The time a customer stays on the website',
      'The number of purchases in a customer\'s first year',
    ],
    correctIndex: 1,
    explanation: 'Customer Lifetime Value (LTV or CLV) predicts the total net profit attributed to the entire future relationship with a customer.',
    difficulty: 'medium',
  },
  {
    id: 'mkt-5',
    skillCategory: 'marketing',
    question: 'What is the AIDA marketing framework?',
    options: [
      'Analyze, Implement, Deploy, Assess',
      'Attention, Interest, Desire, Action — stages of the customer journey',
      'Audience, Intent, Data, Attribution',
      'Awareness, Influence, Discovery, Acquisition',
    ],
    correctIndex: 1,
    explanation: 'AIDA describes the stages a customer goes through: Attention (awareness), Interest (learning more), Desire (wanting it), and Action (purchasing).',
    difficulty: 'easy',
  },

  // ── Finance ──────────────────────────────────────────────────────────────────
  {
    id: 'fin-1',
    skillCategory: 'finance',
    question: 'What does DCF stand for in valuation?',
    options: ['Discounted Cash Flow', 'Direct Cost Formula', 'Dynamic Capital Funding', 'Derivative Contract Factor'],
    correctIndex: 0,
    explanation: 'Discounted Cash Flow (DCF) is a valuation method that estimates the value of an investment based on its expected future cash flows, discounted back to present value.',
    difficulty: 'easy',
  },
  {
    id: 'fin-2',
    skillCategory: 'finance',
    question: 'What is the P/E ratio used for?',
    options: [
      'Measuring a company\'s debt level',
      'Valuing a company by comparing its price to earnings per share',
      'Calculating the cost of equity capital',
      'Determining dividend payout ratio',
    ],
    correctIndex: 1,
    explanation: 'The Price-to-Earnings (P/E) ratio compares a company\'s stock price to its earnings per share, indicating how much investors pay per dollar of earnings.',
    difficulty: 'easy',
  },
  {
    id: 'fin-3',
    skillCategory: 'finance',
    question: 'What does EBITDA measure?',
    options: [
      'Net profit after all deductions',
      'Earnings before interest, taxes, depreciation, and amortization — a proxy for operating cash flow',
      'Total revenue minus cost of goods sold',
      'Free cash flow available to equity holders',
    ],
    correctIndex: 1,
    explanation: 'EBITDA removes non-cash charges (depreciation, amortization) and financing effects (interest) to show core operating performance, often used to compare companies across capital structures.',
    difficulty: 'medium',
  },
  {
    id: 'fin-4',
    skillCategory: 'finance',
    question: 'What is the difference between a bond\'s coupon rate and its yield to maturity?',
    options: [
      'They are the same if the bond trades at par',
      'Coupon rate is fixed at issuance; YTM reflects current market price and varies with interest rates',
      'YTM is always higher than coupon rate',
      'Coupon rate is the actual return; YTM is just an estimate',
    ],
    correctIndex: 1,
    explanation: 'Coupon rate is the fixed annual interest rate stated at issuance. YTM is the total return anticipated if the bond is held to maturity, which changes as the bond\'s price changes in the secondary market.',
    difficulty: 'hard',
  },
  {
    id: 'fin-5',
    skillCategory: 'finance',
    question: 'In portfolio theory, what is the Sharpe ratio?',
    options: [
      'Portfolio return minus benchmark return',
      'Risk-adjusted return: excess return over the risk-free rate divided by portfolio standard deviation',
      'Ratio of dividends to portfolio value',
      'Maximum drawdown divided by average gain',
    ],
    correctIndex: 1,
    explanation: 'The Sharpe ratio measures return per unit of risk taken: (portfolio return − risk-free rate) / standard deviation of portfolio returns. Higher is better.',
    difficulty: 'hard',
  },

  // ── Design ───────────────────────────────────────────────────────────────────
  {
    id: 'des-1',
    skillCategory: 'design',
    question: 'What is the purpose of a design system?',
    options: [
      'To create a single design file for the entire product',
      'A collection of reusable components, guidelines, and standards that ensure consistency across a product',
      'A process for conducting user research',
      'A way to automate design handoff to developers',
    ],
    correctIndex: 1,
    explanation: 'A design system provides shared components, patterns, and guidelines (like tokens, typography, colors) that keep products visually consistent and speed up design/development.',
    difficulty: 'easy',
  },
  {
    id: 'des-2',
    skillCategory: 'design',
    question: 'What does "affordance" mean in UX design?',
    options: [
      'The cost to produce a design asset',
      'A visual or physical property that suggests how an object should be used',
      'The spacing between UI elements',
      'The accessibility rating of an interface',
    ],
    correctIndex: 1,
    explanation: 'An affordance is a property of an object that communicates how it can be used. For example, a button that appears raised affords clicking.',
    difficulty: 'medium',
  },
  {
    id: 'des-3',
    skillCategory: 'design',
    question: 'What is the 60-30-10 color rule in design?',
    options: [
      'Use primary colors 60% of the time, secondary 30%, tertiary 10%',
      'Allocate 60% to a dominant color, 30% to secondary, 10% to accent for visual harmony',
      'Use color in 60% of screens, grayscale in 30%, and black/white in 10%',
      'Limit color palette to 6 hues, 3 tones, and 1 highlight',
    ],
    correctIndex: 1,
    explanation: 'The 60-30-10 rule is a guide for balanced color composition: 60% dominant color (neutral), 30% secondary, and 10% accent color for emphasis.',
    difficulty: 'easy',
  },
  {
    id: 'des-4',
    skillCategory: 'design',
    question: 'What is Gestalt\'s law of proximity in design?',
    options: [
      'Similar-looking elements are perceived as related',
      'Elements close together are perceived as a group',
      'Simpler forms are preferred over complex ones',
      'The eye follows the direction of lines or curves',
    ],
    correctIndex: 1,
    explanation: 'Gestalt proximity: objects that are close to each other tend to be perceived as a unified group. Used in UI to group related controls and create visual hierarchy.',
    difficulty: 'medium',
  },
  {
    id: 'des-5',
    skillCategory: 'design',
    question: 'What is the purpose of a usability test moderation protocol?',
    options: [
      'To grade participants on task performance',
      'To standardize how the facilitator introduces tasks, responds to participant questions, and avoids leading bias',
      'To set up screen recording software',
      'To determine which participants to recruit',
    ],
    correctIndex: 1,
    explanation: 'A moderation protocol ensures consistent test conditions, prevents the facilitator from inadvertently biasing participants with hints or reactions, and guides the session flow.',
    difficulty: 'hard',
  },

  // ── General ─────────────────────────────────────────────────────────────────
  {
    id: 'gen-1',
    skillCategory: 'general',
    question: 'What does version control (like Git) help teams do?',
    options: [
      'Deploy code automatically',
      'Track changes to code over time, enabling collaboration and rollback',
      'Test code for bugs',
      'Monitor application performance',
    ],
    correctIndex: 1,
    explanation: 'Version control systems like Git track every change to code, enable multiple developers to work on the same codebase, and allow reverting to previous versions.',
    difficulty: 'easy',
  },
  {
    id: 'gen-2',
    skillCategory: 'general',
    question: 'What is the difference between a library and a framework?',
    options: [
      'A library is larger than a framework',
      'A framework calls your code; a library is code you call',
      'Libraries are only for backend; frameworks for frontend',
      'They are the same thing',
    ],
    correctIndex: 1,
    explanation: 'Inversion of control: a framework defines the structure and calls your code (e.g., Django, Next.js), while a library is code you call when you need it (e.g., Lodash, NumPy).',
    difficulty: 'medium',
  },
  {
    id: 'gen-3',
    skillCategory: 'general',
    question: 'What does CI/CD stand for?',
    options: [
      'Code Integration / Code Deployment',
      'Continuous Integration / Continuous Delivery (or Deployment)',
      'Central Infrastructure / Cloud Distribution',
      'Container Isolation / Container Distribution',
    ],
    correctIndex: 1,
    explanation: 'CI/CD automates the building, testing, and deployment of code changes, allowing teams to ship software faster and more reliably.',
    difficulty: 'easy',
  },
  {
    id: 'gen-4',
    skillCategory: 'general',
    question: 'What is the purpose of a README file in a software project?',
    options: [
      'To store project credentials securely',
      'To provide documentation: what the project does, how to install/run it, and contribution guidelines',
      'To list all dependencies automatically',
      'To configure the CI/CD pipeline',
    ],
    correctIndex: 1,
    explanation: 'A README is the entry point for anyone discovering the project — it explains purpose, installation, usage, and contribution instructions.',
    difficulty: 'easy',
  },
  {
    id: 'gen-5',
    skillCategory: 'general',
    question: 'What is Big O notation used for?',
    options: [
      'Measuring the physical size of a program',
      'Describing the performance or complexity of an algorithm as input size grows',
      'Naming variables in a standardized way',
      'Calculating memory usage of data structures',
    ],
    correctIndex: 1,
    explanation: 'Big O notation describes the upper bound of an algorithm\'s time or space complexity, showing how it scales with input size (e.g., O(n), O(log n), O(n²)).',
    difficulty: 'medium',
  },
]

// Map skill category → proficiency buckets based on score
export function scoreToProficiency(scorePercent: number): number {
  if (scorePercent <= 40) return 20
  if (scorePercent <= 60) return 50
  if (scorePercent <= 80) return 75
  return 95
}

// Get questions for specific categories (20 questions max, balanced)
export function getQuizQuestions(categories: SkillCategory[] = []): QuizQuestion[] {
  if (categories.length === 0) {
    return quizQuestions.slice(0, 20)
  }
  const filtered = quizQuestions.filter(q => categories.includes(q.skillCategory))
  return filtered.slice(0, 20)
}
