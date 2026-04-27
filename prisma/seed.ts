import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('--- START SEEDING ---')

  // 1. Create/Sync Users
  console.log('Syncing users...')
  
  // Ensure test@example.com is ADMIN (using raw to bypass local MongoDB limits and stale types)
  await (prisma as any).$runCommandRaw({
    update: 'User',
    updates: [{ q: { email: 'test@example.com' }, u: { $set: { role: 'ADMIN' } } }]
  })
  
  // Ensure user@example.com is USER
  await (prisma as any).$runCommandRaw({
    update: 'User',
    updates: [{ q: { email: 'user@example.com' }, u: { $set: { role: 'USER' } } }]
  })

  // Fetch users back
  const admin = await prisma.user.findFirst({ where: { email: 'test@example.com' } }) as any
  const regular = await prisma.user.findFirst({ where: { email: 'user@example.com' } }) as any

  if (!admin || !regular) {
    throw new Error('Required users not found. Please log in once to create the admin account.')
  }

  console.log(`Admin (Role: ${admin.role}) ID: ${admin.id}`)
  console.log(`User (Role: ${regular.role}) ID: ${regular.id}`)

  // 2. Create a Board
  let board: any
  board = await prisma.board.findFirst({ where: { ownerId: admin.id } }) as any
  if (!board) {
    try {
      board = await prisma.board.create({
        data: {
          name: 'Main Support Board',
          ownerId: admin.id
        }
      }) as any
      console.log('Created Main Support Board')
    } catch (error: any) {
      if (error.code === 'P2031') {
        await (prisma as any).$runCommandRaw({
          insert: 'Board',
          documents: [{ name: 'Main Support Board', ownerId: { "$oid": admin.id }, createdAt: { "$date": new Date().toISOString() } }]
        })
        board = await prisma.board.findFirst({ where: { ownerId: admin.id } }) as any
        console.log('Created Main Support Board (raw)')
      }
    }
  }

  // 3. Create 10 Tickets
  console.log('Seeding 10 Tickets...')
  const ticketData = [
    { title: 'Server connectivity issues in Region A', status: 'Open', priority: 'High', category: 'Infrastructure' },
    { title: 'New feature request: Dark Mode', status: 'Open', priority: 'Low', category: 'Feature' },
    { title: 'Cannot reset password via email', status: 'In Progress', priority: 'Medium', category: 'Access' },
    { title: 'Bug: Dashboard charts not loading', status: 'Open', priority: 'High', category: 'Frontend' },
    { title: 'Database migration scheduled for Sunday', status: 'Closed', priority: 'Low', category: 'Maintenance' },
    { title: 'API latency higher than usual', status: 'In Progress', priority: 'Medium', category: 'Backend' },
    { title: 'User permissions mismatch in Admin panel', status: 'Open', priority: 'High', category: 'Security' },
    { title: 'Documentation update for v2.0', status: 'Closed', priority: 'Low', category: 'Docs' },
    { title: 'Mobile app crashing on login', status: 'Open', priority: 'High', category: 'Mobile' },
    { title: 'Bulk export feature not working', status: 'In Progress', priority: 'Medium', category: 'Feature' },
  ]

  for (let i = 0; i < ticketData.length; i++) {
    const data = ticketData[i]
    const creatorId = i % 2 === 0 ? admin.id : regular.id
    const assigneeId = i % 3 === 0 ? admin.id : null

    try {
      await prisma.ticket.create({
        data: {
          ...data,
          creatorId,
          assigneeId
        }
      })
    } catch (error: any) {
      if (error.code === 'P2031') {
        await (prisma as any).$runCommandRaw({
          insert: 'Ticket',
          documents: [{
            ...data,
            creatorId: { "$oid": creatorId },
            assigneeId: assigneeId ? { "$oid": assigneeId } : null,
            createdAt: { "$date": new Date().toISOString() },
            updatedAt: { "$date": new Date().toISOString() }
          }]
        })
      }
    }
  }

  // 4. Create 10 Tasks
  console.log('Seeding 10 Kanban Tasks...')
  const taskData = [
    { title: 'Review security logs', status: 'To Do', order: 1 },
    { title: 'Optimize database queries', status: 'In Progress', order: 2 },
    { title: 'Implement new login UI', status: 'Done', order: 3 },
    { title: 'Fix CSS layout on mobile', status: 'To Do', order: 4 },
    { title: 'Update project dependencies', status: 'In Progress', order: 5 },
    { title: 'Setup CI/CD pipeline', status: 'To Do', order: 6 },
    { title: 'Draft technical specification', status: 'Done', order: 7 },
    { title: 'Refactor Auth middleware', status: 'In Progress', order: 8 },
    { title: 'Create unit tests for API', status: 'To Do', order: 9 },
    { title: 'Finalize project presentation', status: 'Done', order: 10 },
  ]

  for (const data of taskData) {
    try {
      await prisma.task.create({
        data: {
          ...data,
          boardId: board.id,
          assignedToId: admin.id
        }
      })
    } catch (error: any) {
      if (error.code === 'P2031') {
        await (prisma as any).$runCommandRaw({
          insert: 'Task',
          documents: [{
            ...data,
            boardId: { "$oid": board.id },
            assignedToId: { "$oid": admin.id },
            createdAt: { "$date": new Date().toISOString() }
          }]
        })
      }
    }
  }

  console.log('--- SEEDING COMPLETE ---')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
