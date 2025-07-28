interface Feedback {
  id: string;                     // Feedback document ID
  interviewId: string;            // Associated interview ID
  totalScore: number;             // Overall score (0-100)
  categoryScores: Array<{         // Scores & comments per category
    name: string;
    score: number;
    comment: string;
  }>;
  strengths: string[];            // Candidate's strengths summary
  areasForImprovement: string[];  // Areas to improve summary
  finalAssessment: string;        // Overall feedback summary
  createdAt: string;              // Timestamp of feedback creation
}

interface Interview {
  id: string;                    // Interview document ID
  role: string;                  // Job role for the interview
  level: string;                 // Experience level (e.g., junior)
  questions: string[];           // List of interview questions
  techstack: string[];           // Tech stack related to role
  createdAt: string;             // Timestamp of creation
  userId: string;                // User who created/interviewed
  type: string;                  // Interview type (technical/behavioral)
  finalized: boolean;            // Whether interview is finalized
}

interface CreateFeedbackParams {
  interviewId: string;           // Interview ID to associate feedback
  userId: string;                // User ID creating feedback
  transcript: {                  // Transcript of interview conversation
    role: string;
    content: string;
  }[];
  feedbackId?: string;           // Optional existing feedback document ID
}

interface User {
  name: string;                  // User's full name
  email: string;                 // User's email
  id: string;                   // User document ID
}

interface InterviewCardProps {
  interviewId?: string;          // Optional interview ID (for UI cards)
  userId?: string;               // Optional user ID (for UI cards)
  role: string;                  // Job role for card display
  type: string;                  // Interview type for card display
  techstack: string[];           // Tech stack for card display
  createdAt?: string;            // Optional creation date
}

interface AgentProps {
  userName: string;              // Display name of user interacting with agent
  userId?: string;               // Optional user ID
  interviewId?: string;          // Optional interview ID
  feedbackId?: string;           // Optional feedback ID (for feedback editing)
  type: "generate" | "interview"; // Mode: generate interview or conduct it
  questions?: string[];          // Optional list of questions for interview mode
}

interface RouteParams {
  params: Promise<Record<string, string>>;       // Dynamic route params as promise
  searchParams: Promise<Record<string, string>>; // Query params as promise
}

interface GetFeedbackByInterviewIdParams {
  interviewId: string;           // Interview ID to fetch feedback for
  userId: string;                // User ID who owns the feedback
}

interface GetLatestInterviewsParams {
  userId: string;                // Current user ID (to exclude their interviews)
  limit?: number;                // Number of interviews to fetch (default limit)
}

interface SignInParams {
  email: string;                 // User email for signing in
  idToken: string;               // Firebase ID token for session creation
}

interface SignUpParams {
  uid: string;                  // Firebase UID for new user
  name: string;                 // User's name
  email: string;                // User's email
  password: string;             // User's password (usually not stored directly)
}

type FormType = "sign-in" | "sign-up";  // Type for auth forms

interface InterviewFormProps {
  interviewId: string;           // Interview ID if editing
  role: string;                  // Job role for interview creation
  level: string;                 // Experience level for interview
  type: string;                  // Interview type (behavioral/technical)
  techstack: string[];           // Technologies involved
  amount: number;                // Number of questions to generate
}

interface TechIconProps {
  techStack: string[];           // Array of technology names to display icons
}
