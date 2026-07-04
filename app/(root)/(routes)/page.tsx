
import { prismadb } from '@/lib/prismadb'
import { Categories } from '@/components/categories'
import { SearchInput } from '@/components/search-input'
import { Companions } from '@/components/companions'

import { currentUser } from "@clerk/nextjs/server"

interface RootPageProps {
  searchParams: Promise<{
    categoryId?: string
    name?: string
  }>
}

const RootPage = async ({
  searchParams,
}: RootPageProps) => {
  const data = await prismadb.companion.findMany({
    where: {
      categoryId: (await searchParams).categoryId,
      name: {
        search: (await searchParams).name,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      _count: {
        select: {
          messages: true,
        },
      },
    },
  })

  const  user  = await currentUser()


  const categories = await prismadb.category.findMany()

  return (
    <div className="h-full p-4 space-y-2">
      <h1>{'welcome, '} {user?.firstName}</h1>
      <SearchInput />
      <Categories data={categories} />
      <Companions data={data} />
    </div>
  )
}

export default RootPage
