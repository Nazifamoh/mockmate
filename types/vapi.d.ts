// Enum for all possible message types
enum MessageTypeEnum {
  TRANSCRIPT = "transcript",              // Real-time speech transcript message
  FUNCTION_CALL = "function-call",        // Message representing a function call
  FUNCTION_CALL_RESULT = "function-call-result",  // Result of a function call
  ADD_MESSAGE = "add-message",            // Generic message add (not used in interfaces here)
}

// Enum for sender role of the message
enum MessageRoleEnum {
  USER = "user",          // Message from user
  SYSTEM = "system",      // System-generated message
  ASSISTANT = "assistant" // AI assistant message
}

// Enum for transcript message status
enum TranscriptMessageTypeEnum {
  PARTIAL = "partial",    // Partial/in-progress transcript
  FINAL = "final",        // Finalized transcript
}

// Base interface for all messages with a type field
interface BaseMessage {
  type: MessageTypeEnum;
}

// Transcript message with role, transcript type, and text
interface TranscriptMessage extends BaseMessage {
  type: MessageTypeEnum.TRANSCRIPT;
  role: MessageRoleEnum;
  transcriptType: TranscriptMessageTypeEnum;
  transcript: string;
}

// Function call message carrying function name and parameters
interface FunctionCallMessage extends BaseMessage {
  type: MessageTypeEnum.FUNCTION_CALL;
  functionCall: {
    name: string;
    parameters: unknown;
  };
}

// Function call result message with result and optional flags
interface FunctionCallResultMessage extends BaseMessage {
  type: MessageTypeEnum.FUNCTION_CALL_RESULT;
  functionCallResult: {
    forwardToClientEnabled?: boolean;
    result: unknown;
    [key: string]: unknown; // Allow extra properties
  };
}

// Union type representing any valid message type
type Message =
  | TranscriptMessage
  | FunctionCallMessage
  | FunctionCallResultMessage;
