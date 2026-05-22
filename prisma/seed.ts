import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.winner.deleteMany()
  await prisma.ticket.deleteMany()
  await prisma.competition.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.user.deleteMany()

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@ivoryvault.com',
      password: adminPassword,
      role: 'admin',
    },
  })
  console.log('Created admin:', admin.email)

  // Create a regular user for demo
  const userPassword = await bcrypt.hash('password123', 12)
  const testUser = await prisma.user.create({
    data: {
      name: 'James Harrison',
      email: 'james@example.com',
      password: userPassword,
      role: 'user',
    },
  })
  console.log('Created test user:', testUser.email)

  // Create competitions
  const drawDate1 = new Date()
  drawDate1.setDate(drawDate1.getDate() + 14) // 2 weeks from now

  const drawDate2 = new Date()
  drawDate2.setDate(drawDate2.getDate() + 21) // 3 weeks from now

  const drawDate3 = new Date()
  drawDate3.setDate(drawDate3.getDate() + 7) // 1 week from now

  const comp1 = await prisma.competition.create({
    data: {
      slug: 'rolex-submariner-date',
      title: 'Rolex Submariner Date',
      subtitle: 'The most iconic dive watch ever made',
      description: `Win this stunning Rolex Submariner Date in Oystersteel with a black dial and bezel. Reference 126610LN.

This watch represents the pinnacle of Rolex's dive watch collection. Featuring:
• 41mm Oystersteel case
• Black Cerachrom bezel insert
• Triplock winding crown
• Water-resistant to 300m
• Calibre 3235 self-winding movement
• 70-hour power reserve
• Full manufacturer's warranty

The prize includes the watch in its original box with all papers, and delivery to a UK address of your choice. This is a brand new, unworn piece purchased directly from an authorised dealer.`,
      prizeValue: 9850,
      ticketPrice: 4.99,
      maxTickets: 5000,
      ticketsSold: 1847,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80',
      ]),
      drawDate: drawDate1,
      status: 'active',
      featured: true,
      sortOrder: 1,
    },
  })
  console.log('Created competition:', comp1.title)

  const comp2 = await prisma.competition.create({
    data: {
      slug: '10000-cash-prize',
      title: '£10,000 Cash Prize',
      subtitle: 'Life-changing money, yours to keep',
      description: `Enter for your chance to win £10,000 cash — paid directly to your bank account within 5 working days of the draw.

There are no restrictions on what you do with your winnings. Buy a car, pay off debts, treat your family, or invest it. The choice is entirely yours.

The draw will be conducted live on our YouTube channel, with the winner selected by verified random number generation. Every ticket number is published before the draw begins.

This is one of our most popular competitions — don't miss your chance.`,
      prizeValue: 10000,
      ticketPrice: 2.99,
      maxTickets: 10000,
      ticketsSold: 4231,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
      ]),
      drawDate: drawDate2,
      status: 'active',
      featured: true,
      sortOrder: 2,
    },
  })
  console.log('Created competition:', comp2.title)

  const comp3 = await prisma.competition.create({
    data: {
      slug: 'macbook-pro-m4-max',
      title: 'MacBook Pro M4 Max',
      subtitle: '16-inch, 128GB RAM, Space Black',
      description: `Win the ultimate MacBook Pro — the most powerful laptop Apple has ever made.

Specification:
• 16-inch Liquid Retina XDR display
• Apple M4 Max chip with 16-core CPU
• 128GB unified memory
• 4TB SSD storage
• Space Black finish
• All accessories included

This is the top-spec configuration, valued at over £5,000. Whether you're a creative professional, developer, or just want the very best — this machine will transform how you work.

Winner notified within 24 hours of draw. Delivered to UK address, fully insured.`,
      prizeValue: 5199,
      ticketPrice: 1.99,
      maxTickets: 3000,
      ticketsSold: 2156,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
      ]),
      drawDate: drawDate3,
      status: 'active',
      featured: true,
      sortOrder: 3,
    },
  })
  console.log('Created competition:', comp3.title)

  // Create a completed competition with a winner
  const drawDatePast = new Date()
  drawDatePast.setDate(drawDatePast.getDate() - 7)

  const comp4 = await prisma.competition.create({
    data: {
      slug: 'cartier-love-bracelet-gold',
      title: 'Cartier Love Bracelet',
      subtitle: '18ct Yellow Gold — the ultimate status piece',
      description: `The iconic Cartier Love Bracelet in 18ct yellow gold. One of the most recognisable pieces of jewellery in the world.

This competition has now closed. Congratulations to our winner.`,
      prizeValue: 7200,
      ticketPrice: 3.49,
      maxTickets: 3000,
      ticketsSold: 3000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
      ]),
      drawDate: drawDatePast,
      status: 'completed',
      featured: false,
      sortOrder: 10,
    },
  })

  // Create a ticket for test user in comp4
  await prisma.ticket.create({
    data: {
      userId: testUser.id,
      competitionId: comp4.id,
      quantity: 10,
      stripePaymentId: 'pi_demo_winner',
    },
  })

  // Create winner for comp4
  await prisma.winner.create({
    data: {
      competitionId: comp4.id,
      userId: testUser.id,
      ticketNumber: 7,
      announced: true,
      prizeTitle: 'Cartier Love Bracelet — 18ct Yellow Gold',
      prizeValue: 7200,
    },
  })
  console.log('Created completed competition with winner')

  // Add some tickets to active competitions for demo
  await prisma.ticket.create({
    data: {
      userId: testUser.id,
      competitionId: comp1.id,
      quantity: 5,
      stripePaymentId: 'pi_demo_active1',
    },
  })

  await prisma.ticket.create({
    data: {
      userId: testUser.id,
      competitionId: comp2.id,
      quantity: 10,
      stripePaymentId: 'pi_demo_active2',
    },
  })

  console.log('\n✓ Seed complete!')
  console.log('\nAdmin credentials:')
  console.log('  Email: admin@ivoryvault.com')
  console.log('  Password: admin123')
  console.log('\nTest user credentials:')
  console.log('  Email: james@example.com')
  console.log('  Password: password123')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
