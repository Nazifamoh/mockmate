"use server";

import { generateObject } from "ai"; // AI generation function
import { google } from "@ai-sdk/google"; // Google Gemini AI SDK

import { db } from "@/firebase/admin"; // Firebase Admin SDK for Firestore access
import { feedbackSchema } from "@/constants"; // Zod schema for AI feedback validation

/**
 * Creates or updates feedback for a mock interview using AI analysis.
 * @param params - Contains interviewId, userId, transcript, and optionally feedbackId
 * @returns Success status and feedback document ID if successful
 */
export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    // Format the transcript into a string suitable for AI prompt
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    // Call the AI model to generate structured feedback based on the transcript
    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema, // Schema to validate AI output
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    // Prepare feedback object to save to Firestore
    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;

    // If feedbackId is provided, update existing feedback doc, else create new
    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    // Save feedback document to Firestore
    await feedbackRef.set(feedback);

    // Return success status and feedback doc ID
    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    // Return failure status on error
    return { success: false };
  }
}

/**
 * Fetch a single interview document by its ID.
 * @param id - Interview document ID
 * @returns Interview object or null if not found
 */
export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  return interview.data() as Interview | null;
}

/**
 * Fetch feedback for a specific interview and user.
 * @param params - Contains interviewId and userId
 * @returns Feedback object or null if not found
 */
export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  // Query Firestore for feedback matching interviewId and userId
  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

/**
 * Retrieve latest finalized interviews excluding the current user's interviews.
 * @param params - Contains userId and optional limit
 * @returns Array of Interview objects or null
 */
export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  // Query Firestore for latest finalized interviews excluding current user
  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

/**
 * Fetch all interviews created by a specific user.
 * @param userId - User ID
 * @returns Array of Interview objects or null
 */
export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  // Query Firestore for interviews matching userId
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}
