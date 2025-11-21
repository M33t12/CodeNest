// services/aiModeration.js
const { Groq } = require('groq-sdk');
const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const sharp = require("sharp");


// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function checkGroqLimits() {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 5
      })
    });

    const headers = response.headers;
    const data = await response.json();

    return {
      requestsLimit: headers.get("x-ratelimit-limit-requests"),
      requestsRemaining: headers.get("x-ratelimit-remaining-requests"),
      tokensLimit: headers.get("x-ratelimit-limit-tokens"),
      tokensRemaining: headers.get("x-ratelimit-remaining-tokens"),
      rawResponse: data
    };
  } catch (error) {
    console.error("Error checking Groq limits:", error);
    return null;
  }
}

/**
 * Extract text content from PDF (basic implementation)
 * Use pdf-parse library for better PDF text extraction
 */
async function extractPdfContent(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath); // Read PDF file
    const pdfData = await pdfParse(dataBuffer);     // Parse PDF content

    console.log("Services :: ExtractPDFContent :: pdfData ::",pdfData);
    return {
      fileSize: (await fs.stat(filePath)).size,
      extractedText: pdfData.text || "No text extracted",
      pages: pdfData.numpages || null
    };
  } catch (error) {
    console.error('Error extracting PDF content:', error);
    return {
      fileSize: 0,
      extractedText: "Could not extract PDF content",
      pages: null
    };
  }
}


async function summarizePdfText(pdfText) {
  const prompt = `Summarize the following text concisely, keeping technical details relevant for CS students:\n\n${pdfText}`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 512,
    temperature: 0.2
  });

  const aiResponse = completion.choices[0].message.content;
  const tokensUsed = completion.usage?.total_tokens || 0; // Track token usage
  return { summary: aiResponse, tokensUsed };
}

/**
 * Analyze image file (basic implementation)
 * You might want to use sharp for image analysis
 */
async function analyzeImage(filePath) {
  try {
    const stats = await fs.stat(filePath);

    // Use sharp to get metadata
    const metadata = await sharp(filePath).metadata();

    return {
      fileSize: stats.size,
      analysis: `Image format: ${metadata.format}, Dimensions: ${metadata.width}x${metadata.height}, Color depth: ${metadata.hasAlpha ? "RGBA" : "RGB"}`,
      dimensions: {
        width: metadata.width,
        height: metadata.height
      },
      format: metadata.format || null,
      hasAlpha: metadata.hasAlpha || false
    };
  } catch (error) {
    console.error("Error analyzing image:", error);
    return {
      fileSize: 0,
      analysis: "Could not analyze image",
      dimensions: null,
      format: null,
      hasAlpha: null
    };
  }
}

/**
 * Enhanced resource moderation with file content analysis
 * @param {Object} resourceData - Resource data to moderate
 * @returns {Object} AI moderation result
 */
async function moderateResource(resourceData) {
  try {
    const { type, name, subject, content, tags = [] } = resourceData;
    
    console.log("Services :: moderateResoureces :: Data :: ResourceData ::",resourceData);
    // Prepare content for AI analysis
    let analysisText = `Resource Details:\n`;
    analysisText += `Name: ${name}\n`;
    analysisText += `Subject: ${subject}\n`;
    analysisText += `Type: ${type}\n`;
    
    if (tags && tags.length > 0) {
      analysisText += `Tags: ${tags.join(', ')}\n`;
    }
    
    // Handle different resource types
    switch (type) {
      case 'pdf':
        if (content?.filePath) {
          try {
            const pdfContent = await extractPdfContent(content.filePath);
            // const { summary, tokensUsed } = await summarizePdfText(pdfContent.extractedText);
            // console.log("Summary:",summary ,"Token used :",tokensUsed);
            const pdfTextPreview = pdfContent.extractedText.substring(0, 5000); // first 5k chars
            analysisText += `File Size: ${(content.fileSize / (1024 * 1024)).toFixed(2)} MB\n`;
            analysisText += `PDF Analysis based on the summary: ${pdfTextPreview}\n`;
          } catch (error) {
            analysisText += `PDF Analysis: Could not analyze PDF file\n`;
          }
        }
        break;
        
      case 'image':
        if (content?.filePath) {
          try {
            const imageAnalysis = await analyzeImage(content.filePath);
            analysisText += `File Size: ${(content.fileSize / (1024 * 1024)).toFixed(2)} MB\n`;
            analysisText += `Image Analysis: ${imageAnalysis.analysis}\n`;
          } catch (error) {
            analysisText += `Image Analysis: Could not analyze image file\n`;
          }
        }
        break;
        
      case 'blog':
      case 'markdown':
        if (content?.text) {
          analysisText += `Content Preview: ${content.text.substring(0, 2000)}\n`;
          analysisText += `Word Count: ${content.text.split(/\s+/).length}\n`;
        }
        break;
        
      case 'link':
        if (content?.url) {
          analysisText += `URL: ${content.url}\n`;
        }
        if (content?.title) {
          analysisText += `Link Title: ${content.title}\n`;
        }
        if (content?.siteName) {
          analysisText += `Site: ${content.siteName}\n`;
        }
        break;
    }
    
    if (content?.description) {
      analysisText += `Description: ${content.description}\n`;
    }

    const prompt = `
You are an AI content moderator for an educational Computer Science platform. Analyze the following resource submission and determine if it's appropriate for CS students and professionals.

${analysisText}

Evaluation Criteria:
1. Educational Value: Does this genuinely help CS students learn?
2. Content Quality: Is it well-structured, accurate, and informative?
3. Subject Relevance: Does it match the declared CS subject area?
4. Safety & Appropriateness: Is it safe for all audiences?
5. Technical Accuracy: Is the CS content technically sound?

Specific Red Flags to Check:
- Misleading or incorrect technical information
- Spam or promotional content disguised as educational
- Inappropriate or offensive material

Provide your response in this exact JSON format:
{
  "verdict": "approve|reject|neutral",
  "confidence": 0.85,
  "feedback": "Detailed explanation of your decision with specific reasons",
  "issues": ["specific", "issues", "found"],
  "recommendations": ["suggestions", "for", "improvement"]
}

Verdict Guidelines:
- "approve": High-quality, relevant, safe educational content (confidence > 0.7)
- "reject": Inappropriate, low-quality, or harmful content (confidence > 0.7)
- "neutral": Needs human review due to uncertainty (confidence < 0.7)

Be thorough but concise in your analysis.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert AI content moderator specializing in educational Computer Science resources. You have deep knowledge of CS subjects and can identify quality educational content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2, // Lower temperature for more consistent results
      max_tokens: 512
    });

    console.log("Completion :: data ::",completion);
    // console.log("Completion :: data ::",completion);

    const aiResponse = completion.choices[0].message.content;
    console.log("SERVICES :: aiModeration :: moderateREsourecs :: Response From AI :: ",aiResponse);
    
    try {
      // Try to parse the JSON response
      let cleanedResponse = aiResponse.trim().replace(/^```json\s*/, '').replace(/```$/, '');
      const result = JSON.parse(cleanedResponse);
      console.log("Response from AI MODEL :: result ::",result);
      // Validate the response structure
      const validVerdicts = ['approve', 'reject', 'neutral'];
      if (!validVerdicts.includes(result.verdict)) {
        result.verdict = 'neutral';
      }
      
      // Ensure confidence is between 0 and 1
      if (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 1) {
        result.confidence = 0.5;
      }
      
      return {
        feedback: result.feedback || "AI analysis completed",
        verdict: result.verdict,
        confidence: result.confidence,
        issues: Array.isArray(result.issues) ? result.issues : [],
        recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
        rawResponse: aiResponse,
        analyzedAt: new Date()
      };
      
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.log('Raw AI response:', aiResponse);
      
      // Enhanced fallback analysis
      const lowerResponse = aiResponse.toLowerCase();
      let verdict = "neutral";
      let confidence = 0.5;
      let issues = [];
      
      // Look for specific indicators
      if (lowerResponse.includes("approve") && (lowerResponse.includes("high quality") || lowerResponse.includes("educational"))) {
        verdict = "approve";
        confidence = 0.7;
      } else if (lowerResponse.includes("reject") && (lowerResponse.includes("inappropriate") || lowerResponse.includes("low quality"))) {
        verdict = "reject";
        confidence = 0.7;
        issues = ["Content flagged by AI"];
      }
      
      return {
        feedback: aiResponse || "AI analysis completed with parsing issues",
        verdict,
        confidence,
        issues,
        recommendations: [],
        rawResponse: aiResponse,
        parseError: parseError.message,
        analyzedAt: new Date()
      };
    }

  } catch (error) {
    console.error('AI moderation error:', error);
    
    // Comprehensive fallback response
    return {
      feedback: "AI moderation service temporarily unavailable. Manual admin review required.",
      verdict: "neutral",
      confidence: 0.0,
      issues: ["ai-service-error"],
      recommendations: ["Manual review recommended"],
      error: error.message,
      analyzedAt: new Date()
    };
  }
}

/**
 * Re-analyze resource with updated criteria
 * @param {Object} resource - Resource document
 * @returns {Object} Updated AI analysis
 */
async function reanalyzeResource(resource) {
  console.log('Re-analyzing resource:', resource._id);
  return await moderateResource({
    type: resource.type,
    name: resource.name,
    subject: resource.subject,
    content: resource.content,
    tags: resource.tags
  });
}

/**
 * Batch analyze multiple resources
 * @param {Array} resources - Array of resource objects
 * @returns {Array} Array of AI moderation results
 */
async function batchModerateResources(resources) {
  const results = [];
  
  for (const resource of resources) {
    try {
      const result = await moderateResource(resource);
      results.push({
        resourceId: resource._id,
        ...result
      });
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      results.push({
        resourceId: resource._id,
        error: error.message,
        verdict: "neutral",
        confidence: 0.0
      });
    }
  }
  
  return results;
}

/**
 * Get moderation statistics
 * @param {Array} moderationResults - Array of moderation results
 * @returns {Object} Statistics summary
 */
function getModerationStats(moderationResults) {
  const stats = {
    total: moderationResults.length,
    approved: 0,
    rejected: 0,
    neutral: 0,
    avgConfidence: 0,
    commonIssues: {}
  };
  
  let totalConfidence = 0;
  
  moderationResults.forEach(result => {
    stats[result.verdict]++;
    totalConfidence += result.confidence;
    
    if (result.issues) {
      result.issues.forEach(issue => {
        stats.commonIssues[issue] = (stats.commonIssues[issue] || 0) + 1;
      });
    }
  });
  
  stats.avgConfidence = stats.total > 0 ? totalConfidence / stats.total : 0;
  
  return stats;
}

module.exports = {
  moderateResource,
  reanalyzeResource,
  batchModerateResources,
  getModerationStats,
  extractPdfContent,
  analyzeImage,
  checkGroqLimits,
};













// const prompt = `
// You are an AI content moderator for an educational Computer Science platform. Analyze the following resource submission and determine if it's appropriate for CS students and professionals.

// ${analysisText}

// Evaluation Criteria:
// 1. Educational Value: Does this genuinely help CS students learn?
// 2. Content Quality: Is it well-structured, accurate, and informative?
// 3. Subject Relevance: Does it match the declared CS subject area?
// 4. Safety & Appropriateness: Is it safe for all audiences?
// 5. Authenticity: Does it appear original or properly attributed?
// 6. Technical Accuracy: Is the CS content technically sound?

// Specific Red Flags to Check:
// - Plagiarized or copyrighted content
// - Misleading or incorrect technical information
// - Spam or promotional content disguised as educational
// - Inappropriate or offensive material
// - Low-quality or irrelevant content
// - Malicious links or suspicious files

// Provide your response in this exact JSON format:
// {
//   "verdict": "approve|reject|neutral",
//   "confidence": 0.85,
//   "feedback": "Detailed explanation of your decision with specific reasons",
//   "issues": ["specific", "issues", "found"],
//   "recommendations": ["suggestions", "for", "improvement"]
// }

// Verdict Guidelines:
// - "approve": High-quality, relevant, safe educational content (confidence > 0.7)
// - "reject": Inappropriate, low-quality, or harmful content (confidence > 0.7)
// - "neutral": Needs human review due to uncertainty (confidence < 0.7)

// Be thorough but concise in your analysis.`;