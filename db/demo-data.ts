import type { Chapter } from "@/types";

export const DEMO_PASSWORD = "demo1234";
export const DEMO_STUDENT_EMAIL = "sam@eduflux.demo";
export const DEMO_INSTRUCTOR_EMAIL = "naledi@eduflux.demo";

/** Every generated lesson clip is this long (see scripts/make-videos.md). */
export const CLIP_SECONDS = 9;

export interface DemoQuestion {
  text: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface DemoLesson {
  title: string;
  summary: string;
  chapters: Chapter[];
}

export interface DemoCourse {
  slug: string;
  title: string;
  description: string;
  level: "Beginner" | "Intermediate";
  thumbnail: string;
  lessons: DemoLesson[];
  passMark: number;
  questions: DemoQuestion[];
}

const chapters = (a: string, b: string, c: string): Chapter[] => [
  { at: 0, title: a },
  { at: 3, title: b },
  { at: 6, title: c },
];

export const DEMO_COURSES: DemoCourse[] = [
  {
    slug: "web-fundamentals",
    title: "Web Fundamentals: HTML, CSS and the Browser",
    description:
      "How a web page is built and shown: semantic HTML, the CSS box model and layout, and what the browser does between a URL and pixels.",
    level: "Beginner",
    thumbnail: "/thumbs/web-fundamentals.svg",
    passMark: 70,
    lessons: [
      {
        title: "Semantic HTML",
        summary: "Choose elements for meaning, not looks, so pages work for screen readers and search engines.",
        chapters: chapters("Why semantics matter", "Landmarks and headings", "Forms and labels"),
      },
      {
        title: "The CSS box model",
        summary: "Content, padding, border and margin, and why box-sizing: border-box saves you.",
        chapters: chapters("Four boxes in one", "Margin collapsing", "box-sizing"),
      },
      {
        title: "Layout with Flexbox and Grid",
        summary: "One-dimensional versus two-dimensional layout, and when to reach for each.",
        chapters: chapters("Flexbox axes", "Grid tracks", "Responsive patterns"),
      },
    ],
    questions: [
      {
        text: "Which element should wrap the main navigation links of a page?",
        options: ["<div class=\"nav\">", "<nav>", "<section>", "<menu>"],
        answerIndex: 1,
        explanation: "<nav> is a landmark that assistive technology can jump to directly.",
      },
      {
        text: "With box-sizing: border-box, a 200px wide element with 20px padding and a 5px border is how wide in total?",
        options: ["200px", "250px", "245px", "225px"],
        answerIndex: 0,
        explanation: "border-box includes padding and border inside the declared width.",
      },
      {
        text: "Every form input needs what for accessibility?",
        options: ["A placeholder", "A title attribute", "An associated <label>", "A unique class"],
        answerIndex: 2,
        explanation: "Placeholders disappear and are not reliably announced; a label is always available.",
      },
      {
        text: "Which is best suited to laying out a page in rows AND columns at once?",
        options: ["Flexbox", "CSS Grid", "float", "inline-block"],
        answerIndex: 1,
        explanation: "Grid is two-dimensional; Flexbox lays out along one axis at a time.",
      },
      {
        text: "What happens to the vertical margins of two adjacent block siblings?",
        options: ["They add together", "The larger one wins (they collapse)", "They are ignored", "The smaller one wins"],
        answerIndex: 1,
        explanation: "Adjoining vertical margins collapse to the larger of the two.",
      },
    ],
  },
  {
    slug: "typescript-for-js-developers",
    title: "TypeScript for JavaScript Developers",
    description:
      "Add types to the JavaScript you already write: inference, unions, generics and narrowing, with a strict compiler on your side.",
    level: "Intermediate",
    thumbnail: "/thumbs/typescript-for-js-developers.svg",
    passMark: 70,
    lessons: [
      {
        title: "Types you already use",
        summary: "Primitives, arrays, objects and how much TypeScript can infer without annotations.",
        chapters: chapters("Inference first", "Interfaces vs types", "Optional and readonly"),
      },
      {
        title: "Unions and narrowing",
        summary: "Model 'one of several shapes' and let the compiler prove which one you have.",
        chapters: chapters("Union types", "Discriminated unions", "Exhaustive checks"),
      },
      {
        title: "Generics in practice",
        summary: "Write one function that works for many types without giving up safety.",
        chapters: chapters("Why generics", "Constraints", "Utility types"),
      },
    ],
    questions: [
      {
        text: "What does `strict: true` in tsconfig do?",
        options: [
          "Makes the build slower",
          "Enables a family of strict checks such as noImplicitAny and strictNullChecks",
          "Removes all type errors",
          "Forces tabs over spaces",
        ],
        answerIndex: 1,
        explanation: "strict is an umbrella for several checks that catch the most common bugs.",
      },
      {
        text: "Which type is safest for a value you know nothing about yet?",
        options: ["any", "object", "unknown", "never"],
        answerIndex: 2,
        explanation: "unknown forces you to narrow before use; any silently switches checking off.",
      },
      {
        text: "In a discriminated union, what makes narrowing work?",
        options: [
          "A shared literal property such as `kind`",
          "Using instanceof only",
          "Casting with `as`",
          "Optional properties",
        ],
        answerIndex: 0,
        explanation: "Checking the shared literal tag tells the compiler which variant you hold.",
      },
      {
        text: "What does `function first<T>(xs: T[]): T | undefined` demonstrate?",
        options: ["Overloading", "A generic function", "Type erasure at runtime", "A decorator"],
        answerIndex: 1,
        explanation: "T is a type parameter chosen by the caller, so the result type follows the input.",
      },
      {
        text: "Which utility type makes every property of T optional?",
        options: ["Required<T>", "Readonly<T>", "Partial<T>", "Pick<T>"],
        answerIndex: 2,
        explanation: "Partial<T> maps each property to optional.",
      },
    ],
  },
  {
    slug: "data-literacy",
    title: "Data Literacy: Reading Charts Honestly",
    description:
      "Spot misleading axes, cherry-picked ranges and confusing correlation with cause, then build charts that tell the truth.",
    level: "Beginner",
    thumbnail: "/thumbs/data-literacy.svg",
    passMark: 75,
    lessons: [
      {
        title: "How charts mislead",
        summary: "Truncated axes, dual scales and cherry-picked windows, and how to check for each.",
        chapters: chapters("Truncated axes", "Dual axes", "Choosing the window"),
      },
      {
        title: "Correlation is not causation",
        summary: "Confounders, coincidence and the questions that separate a pattern from a cause.",
        chapters: chapters("Spurious patterns", "Confounders", "Asking better questions"),
      },
    ],
    questions: [
      {
        text: "A bar chart's y-axis starts at 90 instead of 0. What is the main risk?",
        options: [
          "Bars look the same size",
          "Small differences look huge",
          "The chart cannot be printed",
          "Nothing, it is standard practice",
        ],
        answerIndex: 1,
        explanation: "Bar length encodes value, so cutting the baseline exaggerates differences.",
      },
      {
        text: "Ice cream sales and sunburn both rise in summer. The best explanation is:",
        options: [
          "Ice cream causes sunburn",
          "Sunburn causes ice cream sales",
          "A confounder (hot sunny weather) drives both",
          "Pure coincidence with no pattern",
        ],
        answerIndex: 2,
        explanation: "Weather is the shared driver; the two outcomes are correlated but not causal.",
      },
      {
        text: "Which question best tests a surprising headline statistic?",
        options: [
          "Is the font readable?",
          "What is it compared against, over what period?",
          "Who shared it first?",
          "Is the chart colourful?",
        ],
        answerIndex: 1,
        explanation: "Without a baseline and time frame a number has no meaning.",
      },
      {
        text: "Dual-axis line charts are risky mainly because:",
        options: [
          "They use too much ink",
          "The two scales can be tuned to suggest any relationship",
          "They cannot show trends",
          "They require three colours",
        ],
        answerIndex: 1,
        explanation: "Rescaling either axis changes where the lines cross, implying a story that isn't there.",
      },
    ],
  },
];

export interface DemoStudent {
  name: string;
  email: string;
  /** Lessons completed per course slug. */
  completed: Record<string, number>;
  /** Best quiz percentage per course slug, if attempted. */
  scores: Record<string, number>;
}

export const DEMO_EXTRA_STUDENTS: DemoStudent[] = [
  { name: "Amara Okafor", email: "amara@eduflux.demo", completed: { "web-fundamentals": 3, "typescript-for-js-developers": 3 }, scores: { "web-fundamentals": 100, "typescript-for-js-developers": 80 } },
  { name: "Liam Fischer", email: "liam@eduflux.demo", completed: { "web-fundamentals": 3, "data-literacy": 2 }, scores: { "web-fundamentals": 80, "data-literacy": 100 } },
  { name: "Priya Nair", email: "priya@eduflux.demo", completed: { "web-fundamentals": 2, "typescript-for-js-developers": 1 }, scores: { "web-fundamentals": 60 } },
  { name: "Tomás Herrera", email: "tomas@eduflux.demo", completed: { "typescript-for-js-developers": 3, "data-literacy": 1 }, scores: { "typescript-for-js-developers": 100 } },
  { name: "Zanele Dlamini", email: "zanele@eduflux.demo", completed: { "data-literacy": 2, "web-fundamentals": 1 }, scores: { "data-literacy": 75 } },
  { name: "Noah Becker", email: "noah@eduflux.demo", completed: { "web-fundamentals": 3 }, scores: { "web-fundamentals": 60 } },
  { name: "Mei Lin", email: "mei@eduflux.demo", completed: { "typescript-for-js-developers": 2, "web-fundamentals": 3 }, scores: { "web-fundamentals": 100 } },
  { name: "Kofi Mensah", email: "kofi@eduflux.demo", completed: { "data-literacy": 1 }, scores: {} },
  { name: "Elena Rossi", email: "elena@eduflux.demo", completed: { "typescript-for-js-developers": 3, "web-fundamentals": 3, "data-literacy": 2 }, scores: { "typescript-for-js-developers": 100, "web-fundamentals": 100, "data-literacy": 75 } },
  { name: "Jabu Mokoena", email: "jabu@eduflux.demo", completed: { "web-fundamentals": 1 }, scores: {} },
];
