import { PrismaClient } from '../src/generated/prisma/index.js'

const prisma = new PrismaClient()

async function main() {
  const email = 'sanni072006@gmail.com'
  const user = await prisma.user.update({
    where: { email },
    data: { isAdmin: true },
  })
  console.log(`✅ Made admin: ${user.name} (${user.email})`)
}

main()
  .catch((e) => { console.error('❌ Error:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
