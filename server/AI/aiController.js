import { mainCategoryNames, subcategoryNamesByMainCategory } from "./ai-categories.js"
import fetch from "node-fetch"

export const classifyServiceAI = async (name, description) => {
  try {
    if (!name || !description) {
      throw new Error("Service name and description are required.")
    }

    const prompt = `You are an expert service classifier for an online home services platform. Your job is to categorize services and estimate workers needed.

STEP 1 — VALIDATE: Is the service name and description meaningful and legitimate?
- INVALID if: nonsensical (e.g. "asdfasdf"), clearly spam (e.g. "buy now"), or too vague (e.g. "test service", "random stuff").
- VALID if: it describes a real-world service someone would pay for, even if unusual.

STEP 2 — CLASSIFY (only if valid):
Try to match the service to one of these existing main categories: ${JSON.stringify(mainCategoryNames)}
Subcategories per category: ${JSON.stringify(subcategoryNamesByMainCategory)}

Matching rules (apply in order):
1. Cleaning-related (septic, drain, gutter, pressure washing) → "Home Cleaning Services"
2. Plumbing repairs, pipe/leak fixes → "Plumbing Services"
3. General small repairs → "Handyman Services"
4. Pest removal/extermination → "Pest Control Services"
5. If it fits an existing main category but no matching subcategory → use that main category, use the service name as subcategory.
6. If it does NOT fit ANY existing main category → INVENT a new descriptive main category name. Use the service name as subcategory.
   Examples of invented categories: "Pet Services", "Photography Services", "Tutoring & Education", "Beauty & Grooming", "Music & Arts", "Fitness & Sports"

CRITICAL RULES:
- NEVER use "Uncategorized Services", "Other", or any vague placeholder as mainCategory for a valid service.
- ALWAYS invent a specific, descriptive category if none fits. Think: what industry or domain does this belong to?
- workersNeeded must be an integer ≥ 1.
- estimatedTime must be a human-readable string (e.g. "1-2 hours", "30 mins", "1 day"). Use "Varies" only if truly impossible to estimate.

New Service:
Name: ${name}
Description: ${description}

Respond ONLY with a valid JSON object. No markdown, no explanation, just the JSON.

Schema:
{
  "isValid": boolean,
  "mainCategory": string,
  "subCategory": string,
  "workersNeeded": integer,
  "estimatedTime": string,
  "reason": string  // only include if isValid is false
}

Examples:
Invalid: { "isValid": false, "reason": "Name is nonsensical.", "mainCategory": "", "subCategory": "", "workersNeeded": null, "estimatedTime": "" }
Dog Walking: { "isValid": true, "mainCategory": "Pet Services", "subCategory": "Dog Walking", "workersNeeded": 1, "estimatedTime": "30-60 mins" }
Septic Tank: { "isValid": true, "mainCategory": "Home Cleaning Services", "subCategory": "Septic Tank Declogging", "workersNeeded": 2, "estimatedTime": "2-4 hours" }
Solar Panel Prep: { "isValid": true, "mainCategory": "Roofing Services", "subCategory": "Solar Panel Roofing Prep", "workersNeeded": 3, "estimatedTime": "1-2 days" }
Haircut at Home: { "isValid": true, "mainCategory": "Beauty & Grooming", "subCategory": "Home Haircut", "workersNeeded": 1, "estimatedTime": "30-45 mins" }
`
    console.log("AI Prompt:", prompt)

    const deepseekResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY || "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"}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemma-3-4b-it:free",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0,
      }),
    })

    if (!deepseekResponse.ok) {
      const errorData = await deepseekResponse.json()
      console.error("DeepSeek API error:", deepseekResponse.status, errorData)
      throw new Error(`DeepSeek API error: ${deepseekResponse.status}`)
    }

    const deepseekData = await deepseekResponse.json()
    const aiResponseText = deepseekData.choices[0].message.content
    console.log("Raw AI Response:", aiResponseText)

    const jsonMatch = aiResponseText.match(/```json\n([\s\S]*?)\n```/)
    const cleanedAiResponseText = jsonMatch ? jsonMatch[1] : aiResponseText

    let classificationResult
    try {
      classificationResult = JSON.parse(cleanedAiResponseText)
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", aiResponseText, parseError)
      classificationResult = {
        isValid: false,
        reason: "AI response parsing failed or malformed JSON.",
        mainCategory: "",
        subCategory: "",
        workersNeeded: null,
      }
    }

    console.log("Parsed AI Classification Result:", classificationResult)

    if (typeof classificationResult.isValid !== "boolean") {
      classificationResult.isValid = true
    }

    // Guard: never allow "Uncategorized Services", "Other", or blank mainCategory for valid services
    const vagueCategories = ["uncategorized services", "uncategorized", "other", "others", ""]
    if (
      classificationResult.isValid &&
      (!classificationResult.mainCategory ||
        vagueCategories.includes(classificationResult.mainCategory.trim().toLowerCase()))
    ) {
      // Derive a sensible category from the service name as a last resort
      const words = name.trim().split(/\s+/)
      const keyword = words[words.length - 1] || words[0] || "General"
      classificationResult.mainCategory = `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Services`
      console.warn(
        `aiController: AI returned vague category. Overriding to: "${classificationResult.mainCategory}"`
      )
    }
    if (!classificationResult.subCategory && classificationResult.isValid) {
      classificationResult.subCategory = name
    }
    if (!classificationResult.reason && !classificationResult.isValid) {
      classificationResult.reason = "Invalid service details provided by user."
    }
    if (typeof classificationResult.workersNeeded !== "number" || classificationResult.workersNeeded < 1) {
      classificationResult.workersNeeded = 1
    }
    if (typeof classificationResult.estimatedTime !== "string" || classificationResult.estimatedTime.trim() === "") {
      classificationResult.estimatedTime = "Varies"
    }

    return classificationResult
  } catch (error) {
    console.error("Error classifying service:", error)
    throw error
  }
}

export const classifyServiceRoute = async (req, res) => {
  try {
    const { name, description } = req.body
    const result = await classifyServiceAI(name, description)
    return res.status(200).json(result)
  } catch (error) {
    console.error("Error in classifyServiceRoute:", error)
    return res.status(500).json({ error: "Failed to classify service.", details: error.message })
  }
}