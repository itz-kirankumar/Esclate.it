import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
// import { db, storage } from "@/lib/firebase/config"; // Uncomment when Firebase is configured
// import { collection, addDoc, serverTimestamp } from "firebase/firestore";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are the Chief Legal AI for Escalate.it. You are aggressive on behalf of the consumer, yet strictly professional and compliant with the Consumer Protection Act, 2019. You analyze multimodal inputs (frustrated user audio and image evidence) to generate legally binding escalation documents.`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const imageFile = formData.get("image") as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: "Audio is required" }, { status: 400 });
    }

    // 1. Convert files to formats Gemini accepts (Base64)
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const audioBase64 = audioBuffer.toString("base64");
    
    let imagePart = null;
    if (imageFile) {
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
      imagePart = {
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType: imageFile.type,
        },
      };
    }

    const audioPart = {
      inlineData: {
        data: audioBase64,
        mimeType: audioFile.type || "audio/webm",
      },
    };

    const executionPrompt = `
      Analyze the following user grievance context:
      Location: Unknown, India (Extract from audio if available)
      Evidence attached: ${imageFile ? 'Yes' : 'No'}
      
      Perform the following:
      1. Identify the Respondent Entity (Company) and the specific Deficiency in Service or Unfair Trade Practice.
      2. Quantify the exact financial claim (Refund + Compensation for mental agony).
      3. Draft a ruthless but professional 'Notice of Deficiency' email targeting the company's Nodal Grievance Officer.
      4. Draft a concise 280-character Twitter/X post tagging the company handle.
      5. Output STRICTLY in the JSON schema provided below, with no markdown formatting or conversational text.
    `;

    // 2. Call Gemini API
    const contents: any[] = [audioPart, executionPrompt];
    if (imagePart) contents.splice(1, 0, imagePart);

    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            case_metadata: {
              type: "OBJECT",
              properties: {
                respondent_company: { type: "STRING" },
                category: { type: "STRING" },
                statutory_violation: { type: "STRING" },
                estimated_claim_value_inr: { type: "NUMBER" },
              },
            },
            escalation_assets: {
              type: "OBJECT",
              properties: {
                nodal_officer_email: {
                  type: "OBJECT",
                  properties: {
                    subject_line: { type: "STRING" },
                    body: { type: "STRING" },
                    cc_authorities: { type: "ARRAY", items: { type: "STRING" } },
                  },
                },
                social_media_draft: {
                  type: "OBJECT",
                  properties: {
                    platform: { type: "STRING" },
                    content: { type: "STRING" },
                    suggested_hashtags: { type: "ARRAY", items: { type: "STRING" } },
                  },
                },
              },
            },
            user_summary: {
              type: "OBJECT",
              properties: {
                tl_dr: { type: "STRING" },
              },
            },
          },
        },
      },
    });

    const aiResult = JSON.parse(response.text || "{}");

    // 3. Save to Firebase (Mocked for now)
    // const claimRef = await addDoc(collection(db, "claims"), {
    //   ...aiResult,
    //   status: "drafted",
    //   createdAt: serverTimestamp(),
    // });
    // const claimId = claimRef.id;

    // MOCK ID FOR NOW
    const claimId = "mock-claim-" + Date.now();

    return NextResponse.json({ success: true, claimId, data: aiResult });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message || error.toString() },
      { status: 500 }
    );
  }
}
