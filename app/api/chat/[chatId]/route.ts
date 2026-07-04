import { currentUser } from '@clerk/nextjs/server'
import OpenAI from 'openai'
import { NextResponse } from 'next/server'

import { MemoryManager } from '@/lib/memory'
import { rateLimit } from '@/lib/rate-limit'
import { prismadb } from '@/lib/prismadb'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const { chatId } = await params
    const { prompt } = await request.json()
    const user = await currentUser()

    if (!user || !user.firstName || !user.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const identifier = `${request.url}-${user.id}`
    const { success } = await rateLimit(identifier)

    if (!success) {
      return new NextResponse('Rate limit exceeded', { status: 429 })
    }

    const companion = await prismadb.companion.update({
      where: {
        id: chatId,
      },
      data: {
        messages: {
          create: {
            content: prompt,
            role: 'user',
            userId: user.id,
          },
        },
      },
    })

    if (!companion) {
      return new NextResponse('Companion not found', { status: 404 })
    }

    const name = companion.id
    const companionFileName = `${name}.txt`

    const companionKey = {
      companionName: name,
      userId: user.id,
      modelName: 'gpt-4o-mini',
    }
    const memoryManager = await MemoryManager.getInstance()

    const records = await memoryManager.readLatestHistory(companionKey)
    if (records.length === 0) {
      await memoryManager.seedChatHistory(companion.seed, '\n\n', companionKey)
    }
    await memoryManager.writeToHistory('User: ' + prompt + '\n', companionKey)

    const recentChatHistory = await memoryManager.readLatestHistory(companionKey)

    const similarDocs = await memoryManager.vectorSearch(
      recentChatHistory,
      companionFileName,
    )

    let relevantHistory = ''
    if (similarDocs && similarDocs.length !== 0) {
      relevantHistory = similarDocs
        .map((doc) => doc.metadata?.text ?? '')
        .join('\n')
    }

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      stream: true,
      messages: [
        {
          role: 'system',
          content: `You are ${companion.name}. ${companion.instructions}

ONLY generate plain sentences without prefix of who is speaking. DO NOT use "${companion.name}:" prefix.

Below are relevant details about ${companion.name}'s past and the conversation you are in.
${relevantHistory}`,
        },
        {
          role: 'user',
          content: `${recentChatHistory}\n${prompt}`,
        },
      ],
      max_tokens: 2048,
    })

    let fullResponse = ''

    const encoder = new TextEncoder()

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const token = chunk.choices[0]?.delta?.content ?? ''
            if (token) {
              fullResponse += token
              controller.enqueue(encoder.encode(token))
            }
          }
        } catch (err) {
          console.error('Streaming error:', err)
        } finally {
          controller.close()

          // Save the complete response once streaming finishes
          const trimmed = fullResponse.trim()
          if (trimmed.length > 1) {
            await memoryManager.writeToHistory('' + trimmed, companionKey)

            await prismadb.companion.update({
              where: {
                id: chatId,
              },
              data: {
                messages: {
                  create: {
                    content: trimmed,
                    role: 'system',
                    userId: user.id,
                  },
                },
              },
            })
          }
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  } catch (error) {
    console.error(error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}