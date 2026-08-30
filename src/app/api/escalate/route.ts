import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { AI_CONFIG } from "@/lib/ai/config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export const dynamic = "force-dynamic";

// Initialize OpenAI safely for Vercel build
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "mock-key-for-build" 
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const textComplaint = formData.get("textComplaint") as string | null;
    const imageFile = formData.get("image") as File | null;

    if (!audioFile && !textComplaint) {
      return NextResponse.json({ error: "Either audio or text complaint is required" }, { status: 400 });
    }

    let transcriptText = "";

    if (audioFile) {
      console.log("Transcribing audio with Whisper...");
      // 1. Transcribe the audio using Whisper
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: AI_CONFIG.openai.transcriptionModel,
      });
      transcriptText = transcription.text;
      console.log("Transcript:", transcriptText);
    } else if (textComplaint) {
      transcriptText = textComplaint;
    }

    // 2. Prepare content for GPT-4o
    const userMessages: any[] = [
      {
        type: "text",
        text: `
          Analyze the following user grievance context:
          Location: Unknown, India (Extract from context if available)
          User Complaint / Transcript: "${transcriptText}"
          Evidence attached: ${imageFile ? 'Yes' : 'No'}
          
          Perform the following:
          1. Identify the Respondent Entity (Company) and the specific Deficiency in Service or Unfair Trade Practice.
          2. Quantify the exact financial claim (Refund + Compensation for mental agony).
          3. Draft a ruthless but professional 'Notice of Deficiency' email targeting the company's Nodal Grievance Officer (Keep the body under 200 words).
          4. Draft a concise 280-character Twitter/X post tagging the company handle.
          5. Output STRICTLY in the following JSON format and nothing else. Keep the tl_dr under 2 sentences.
          {
            "case_metadata": {
              "respondent_company": "string",
              "category": "string",
              "statutory_violation": "string",
              "estimated_claim_value_inr": 0
            },
            "escalation_assets": {
              "nodal_officer_email": {
                "subject_line": "string",
                "body": "string",
                "cc_authorities": ["string"]
              },
              "social_media_draft": {
                "platform": "string",
                "content": "string",
                "suggested_hashtags": ["string"]
              }
            },
            "user_summary": {
              "tl_dr": "string"
            }
          }
        `,
      }
    ];

    if (imageFile) {
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
      const imageBase64 = imageBuffer.toString("base64");
      userMessages.push({
        type: "image_url",
        image_url: {
          url: `data:${imageFile.type};base64,${imageBase64}`,
        },
      });
    }

    console.log("Calling OpenAI with cascading fallback...");
    // 3. Call OpenAI API with Fallback Logic
    const callOpenAI = async (modelName: string) => {
      return await openai.chat.completions.create({
        model: modelName,
        messages: [
          { role: "system", content: AI_CONFIG.systemPrompt },
          { role: "user", content: userMessages }
        ],
        response_format: { type: "json_object" },
      });
    };

    let response;
    const modelChain = [AI_CONFIG.openai.primaryModel, AI_CONFIG.openai.fallbackModel];
    let lastError = null;

    for (const model of modelChain) {
      try {
        response = await callOpenAI(model);
        console.log(`Successfully generated content using model: ${model}`);
        break; // Success! Break out of the fallback loop.
      } catch (err: any) {
        console.warn(`Model (${model}) failed: ${err.message}. Cascading to next fallback...`);
        lastError = err;
      }
    }

    if (!response || !response.choices[0].message.content) {
      throw new Error(`All OpenAI models failed. Last error: ${lastError?.message}`);
    }

    const aiResult = JSON.parse(response.choices[0].message.content);
    const userId = formData.get("userId") as string | null;

    // 4. Save to Firestore
    let claimId = "mock-claim-" + Date.now();
    try {
      if (userId) {
        const claimRef = await addDoc(collection(db, "claims"), {
          userId,
          status: "drafted",
          createdAt: serverTimestamp(),
          data: aiResult,
        });
        claimId = claimRef.id;
        console.log("Claim successfully saved to Firestore:", claimId);
      }
    } catch (dbError) {
      console.error("Failed to save claim to Firestore:", dbError);
    }

    return NextResponse.json({ success: true, claimId, data: aiResult });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message || error.toString() },
      { status: 500 }
    );
  }
}
