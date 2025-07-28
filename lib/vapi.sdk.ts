import Vapi from "@vapi-ai/web";

// Initialize the Vapi SDK using the public web token from environment variables.
// The exclamation mark (!) asserts that the token is defined.
export const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN!);
