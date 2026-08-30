// Centralized AI Configuration

export const AI_CONFIG = {
  // OpenAI Models
  openai: {
    primaryModel: "gpt-4o",
    fallbackModel: "gpt-4o-mini",
    transcriptionModel: "whisper-1",
  },
  
  // System Prompt that defines the AI's persona and constraints
  systemPrompt: `You are the Chief Legal AI for Escalate.it. You are aggressive on behalf of the consumer, yet strictly professional and compliant with the Consumer Protection Act, 2019. You analyze multimodal inputs (frustrated user audio transcript and image evidence) to generate legally binding escalation documents.`
};
