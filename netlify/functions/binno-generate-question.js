// Binno AI Question Generator - JavaScript Version
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

exports.handler = async (event, context) => {
  console.log('Skill Compass AI Question Generator - Start');
  console.log('API Key configured:', !!OPENAI_API_KEY);
  
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'OpenAI API key not configured' })
      };
    }

    const requestData = JSON.parse(event.body || '{}');
    const { 
      questionNumber = 1,
      previousAnswers = [],
      sessionContext = {}
    } = requestData;

    console.log(`Generating question ${questionNumber} with ${previousAnswers.length} previous answers`);

    // Generate context from previous answers
    let contextSummary = '';
    if (previousAnswers.length > 0) {
      contextSummary = previousAnswers.map((answer, index) => 
        `Q${index + 1}: ${answer.question_text}\nA${index + 1}: ${answer.user_response}`
      ).join('\n\n');
    }

    // Build adaptive prompt based on question number and context
    const systemPrompt = `You are Binno AI, an expert Web3 consultant conducting a professional skill assessment. 

Based on previous responses, generate question ${questionNumber} of 15 for the CTD Skill Compass assessment.

CONTEXT FROM PREVIOUS ANSWERS:
${contextSummary}

ASSESSMENT GUIDELINES:
- Questions should be adaptive based on user's demonstrated knowledge level
- Focus on practical Web3 skills, blockchain understanding, and project experience
- Each question should reveal specific competencies
- Maintain professional consulting tone
- Questions should be open-ended to allow detailed responses
- Progressively increase complexity based on user's answers

Generate a focused question that builds on previous responses and assesses a new dimension of Web3 competency.

Return ONLY a JSON object in this exact format:
{
  "question": {
    "id": "q${questionNumber}_adaptive",
    "question_text": "Your adaptive question here",
    "context": "Brief context about what this question assesses",
    "stage": "assessment_${questionNumber}",
    "difficulty_level": "beginner|intermediate|advanced|expert",
    "bnb_relevance": 85,
    "critical_factors": ["factor1", "factor2"]
  }
}`;

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Generate question ${questionNumber} for the Web3 skill assessment.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const generatedContent = openaiData.choices[0]?.message?.content;

    if (!generatedContent) {
      throw new Error('No content generated from OpenAI');
    }

    // Parse the JSON response
    let questionData;
    try {
      questionData = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', generatedContent);
      throw new Error('Invalid JSON response from AI');
    }

    console.log('Question generated successfully:', questionData.question?.question_text?.substring(0, 50));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(questionData)
    };

  } catch (error) {
    console.error('Error generating question:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to generate question',
        details: error.message 
      })
    };
  }
};