import { prismadb } from '@/lib/prismadb'
import { CompanionForm } from './components/companion-form'
import { auth } from '@clerk/nextjs/server'

interface CompanionIdPageProps {
    params: Promise<{
        companionId: string
    }>
}

const CompanionIdPage = async ({ params }: CompanionIdPageProps) => {
    const { companionId } = await params
    const { isAuthenticated, redirectToSignIn, userId } = await auth()
    if (!isAuthenticated) return redirectToSignIn()

    const companion = await prismadb.companion.findUnique({
        where: {
            id: companionId,
        },
    })

    const categories = await prismadb.category.findMany()

    return <CompanionForm initialData={companion} categories={categories} />
}

export default CompanionIdPage