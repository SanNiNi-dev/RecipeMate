import Groq from 'groq-sdk'

const SYSTEM_PROMPT = `You are Chef Mate, an expert AI cooking assistant built into RecipeMate.
You are friendly, enthusiastic, and deeply knowledgeable about:
- Recipes and cooking techniques
- Ingredient substitutions
- Meal planning and nutrition
- Kitchen tips, equipment, and food storage
- Dietary restrictions (vegan, gluten-free, keto, etc.)
- World cuisines and food culture

Keep responses concise but warm. Use emojis sparingly to add personality.
When suggesting recipes, always list key ingredients.
If asked something unrelated to food or cooking, politely redirect to culinary topics.
Format lists with • bullet points for readability.`

export async function POST(request) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    return Response.json(
      {
        error:
          'GROQ_API_KEY is not configured or is still the placeholder value. Add a real Groq API key to your .env file.',
      },
      { status: 503 }
    )
  }

  let messages
  try {
    const body = await request.json()
    messages = body.messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'messages array is required.' }, { status: 400 })
    }
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  try {
    const groq = new Groq({ apiKey })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',   // Free, fast, very capable
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      stream: true,
      max_tokens: 800,
      temperature: 0.7,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const text = chunk.choices[0]?.delta?.content
            if (text) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              )
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (err) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: err.message })}\n\n`)
          )
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    console.error('[chat/route] Groq error:', err)
    return Response.json(
      { error: err.message || 'Failed to get AI response.' },
      { status: 500 }
    )
  }
}
