"use server";

import { auth, db } from "@/firebase/admin"; // Firebase Admin SDK for auth and Firestore
import { cookies } from "next/headers"; // To access cookies in server components

// Session duration set to 1 week (in seconds)
const SESSION_DURATION = 60 * 60 * 24 * 7;

/**
 * Creates and sets a session cookie in the user's browser
 * @param idToken - Firebase ID token from client sign-in
 */
export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  // Create Firebase session cookie with expiry time in milliseconds
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000,
  });

  // Set the session cookie in browser with secure and HTTP-only flags
  cookieStore.set("session", sessionCookie, {
    maxAge: SESSION_DURATION, // seconds
    httpOnly: true, // inaccessible to JS client-side
    secure: process.env.NODE_ENV === "production", // only over HTTPS in prod
    path: "/", // available to entire site
    sameSite: "lax", // CSRF protection
  });
}

/**
 * Registers a new user by saving their details in Firestore
 * @param params - Contains uid, name, email
 * @returns Success status and message
 */
export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;

  try {
    // Check if user already exists in Firestore
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists)
      return {
        success: false,
        message: "User already exists. Please sign in.",
      };

    // Create new user document with basic info
    await db.collection("users").doc(uid).set({
      name,
      email,
      // profileURL, resumeURL can be added later
    });

    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (error: any) {
    console.error("Error creating user:", error);

    // Handle Firebase-specific errors
    if (error.code === "auth/email-already-exists") {
      return {
        success: false,
        message: "This email is already in use",
      };
    }

    // Generic failure message
    return {
      success: false,
      message: "Failed to create account. Please try again.",
    };
  }
}

/**
 * Signs in user by verifying email and setting session cookie
 * @param params - Contains email and Firebase ID token
 * @returns Success status and message
 */
export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    // Verify if user exists with the given email
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord)
      return {
        success: false,
        message: "User does not exist. Create an account.",
      };

    // Set session cookie for authenticated session
    await setSessionCookie(idToken);
  } catch (error: any) {
    console.log(error);

    return {
      success: false,
      message: "Failed to log into account. Please try again.",
    };
  }
}

/**
 * Signs out the user by deleting the session cookie
 */
export async function signOut() {
  const cookieStore = await cookies();

  // Remove session cookie to log out user
  cookieStore.delete("session");
}

/**
 * Retrieves the current authenticated user from session cookie
 * @returns User object or null if no valid session
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  // Get session cookie value
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  try {
    // Verify session cookie with Firebase Auth
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    // Fetch user details from Firestore by UID
    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();
    if (!userRecord.exists) return null;

    // Return user data including Firestore document ID
    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (error) {
    console.log(error);

    // If session is invalid or expired, return null
    return null;
  }
}

/**
 * Checks if there is an authenticated user session
 * @returns Boolean indicating authentication status
 */
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}
