import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'

import { prismadb } from '@/lib/prismadb'

import { ChatClient } from './components/client'

interface ChatIdPageProps {
    params: Promise<{
        chatId: string
    }>
}

const ChatIdPage = async ({ params }: ChatIdPageProps) => {
    const { userId, redirectToSignIn } = await auth()

    if (!userId) {
        return redirectToSignIn()
    }

    const companion = await prismadb.companion.findUnique({ 
        where: {
            id: (await params).chatId,
        },
        include: {
            messages: {
                orderBy: {
                    createdAt: 'asc',
                },
                where: {
                    userId,
                },
            },
            _count: {
                select: {
                    messages: true,
                },
            },
        },
    })

    if (!companion) {
        return redirect('/')
    }

    return <ChatClient companion={companion} />
}

export default ChatIdPage
