// Import AI text generation function and Google Gemini model
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

// Import Firestore database instance and utility to get random cover image
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

// Handle POST requests to generate and save interview questions
export async function POST(request: Request) {
    // Extract relevant fields from the incoming request body
    const { type, role, level, techstack, amount, userid } = await request.json();

    try {
        // Generate interview questions using Gemini AI
        const { text: questions } = await generateText({
            model: google("gemini-2.0-flash-001"),
            prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
    `,
        });

        // Structure the interview object to be stored in Firestore
        const interview = {
            role: role,
            type: type,
            level: level,
            techstack: techstack.split(","), // Convert comma-separated string to array
            questions: JSON.parse(questions), // Parse generated JSON array of questions
            userId: userid,
            finalized: true,
            coverImage: getRandomInterviewCover(), // Assign a random cover image
            createdAt: new Date().toISOString(), // Timestamp for sorting
        };

        // Save the interview to Firestore under the "interviews" collection
        await db.collection("interviews").add(interview);

        // Return success response
        return Response.json({ success: true }, { status: 200 });

        // Log and return error if anything goes wrong
    } catch (error) {
        console.error("Error:", error);
        return Response.json({ success: false, error: error }, { status: 500 });
    }
}

// testing get request
export async function GET() {
    return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}