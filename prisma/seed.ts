import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  await prisma.winner.deleteMany()
  await prisma.ticket.deleteMany()
  await prisma.competition.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.user.deleteMany()

  // Admin
  const adminPw = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.create({
    data: { name: 'Admin', email: 'admin@ivoryvault.com', password: adminPw, role: 'admin' },
  })

  // Test users (winners)
  const userPw = await bcrypt.hash('password123', 12)
  const users = await Promise.all([
    prisma.user.create({ data: { name: 'James Harrison', email: 'james@example.com', password: userPw, role: 'user' } }),
    prisma.user.create({ data: { name: 'Sophie Williams', email: 'sophie@example.com', password: userPw, role: 'user' } }),
    prisma.user.create({ data: { name: 'Oliver Bennett', email: 'oliver@example.com', password: userPw, role: 'user' } }),
    prisma.user.create({ data: { name: 'Charlotte Davies', email: 'charlotte@example.com', password: userPw, role: 'user' } }),
    prisma.user.create({ data: { name: 'Marcus Reid', email: 'marcus@example.com', password: userPw, role: 'user' } }),
  ])

  const inDays = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d }
  const agodays = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d }

  // ─── ACTIVE COMPETITIONS ─────────────────────────────────────
  const comps = await Promise.all([
    prisma.competition.create({
      data: {
        slug: 'rolex-submariner-date',
        title: 'Rolex Submariner Date',
        subtitle: 'The most iconic dive watch ever made',
        description: `Win this stunning Rolex Submariner Date in Oystersteel with a black dial and bezel. Reference 126610LN.\n\nFeaturing a 41mm Oystersteel case, black Cerachrom bezel, Triplock crown, 300m water resistance, Calibre 3235 movement with 70-hour power reserve. Full box and papers. Brand new, unworn, from an authorised dealer.`,
        prizeValue: 9850,
        ticketPrice: 4.99,
        maxTickets: 5000,
        ticketsSold: 2847,
        images: JSON.stringify(['https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=1200&q=85']),
        drawDate: inDays(14),
        status: 'active',
        featured: true,
        sortOrder: 1,
      },
    }),
    prisma.competition.create({
      data: {
        slug: '10000-cash-prize',
        title: '£10,000 Cash Prize',
        subtitle: 'Life-changing money, yours to keep',
        description: `Enter for your chance to win £10,000 cash — paid directly to your bank account within 5 working days of the draw.\n\nNo restrictions on spending. The draw is conducted live on our YouTube channel with verified random number generation. Every ticket number published before the draw begins.`,
        prizeValue: 10000,
        ticketPrice: 2.99,
        maxTickets: 8000,
        ticketsSold: 6721,
        images: JSON.stringify(['https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=85']),
        drawDate: inDays(8),
        status: 'active',
        featured: true,
        sortOrder: 2,
      },
    }),
    prisma.competition.create({
      data: {
        slug: 'macbook-pro-m4-max',
        title: 'MacBook Pro M4 Max',
        subtitle: '16-inch · 128GB RAM · Space Black',
        description: `Win the ultimate MacBook Pro — the most powerful laptop Apple has ever made.\n\nSpec: 16-inch Liquid Retina XDR, M4 Max chip, 16-core CPU, 128GB unified memory, 4TB SSD, Space Black. Valued over £5,000. Delivered to any UK address, fully insured.`,
        prizeValue: 5199,
        ticketPrice: 1.99,
        maxTickets: 3000,
        ticketsSold: 2156,
        images: JSON.stringify(['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=85']),
        drawDate: inDays(5),
        status: 'active',
        featured: false,
        sortOrder: 3,
      },
    }),
    prisma.competition.create({
      data: {
        slug: 'porsche-911-carrera-experience',
        title: 'Porsche 911 Track Day',
        subtitle: 'Full day at Silverstone with pro instruction',
        description: `Experience the thrill of driving a Porsche 911 Carrera S on the legendary Silverstone Circuit.\n\nIncludes full-day access, professional instructor tuition, all safety equipment, breakfast and lunch, and a personalised lap time certificate. For one person, transferable, valid 12 months.`,
        prizeValue: 3500,
        ticketPrice: 0.99,
        maxTickets: 4000,
        ticketsSold: 1102,
        images: JSON.stringify(['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=85']),
        drawDate: inDays(21),
        status: 'active',
        featured: false,
        sortOrder: 4,
      },
    }),
    prisma.competition.create({
      data: {
        slug: 'omega-seamaster-300m',
        title: 'Omega Seamaster 300m',
        subtitle: "James Bond's watch of choice since 1995",
        description: `Win the iconic Omega Seamaster Professional Diver 300M in stainless steel with a blue dial.\n\nFeatures: 42mm Co-Axial Master Chronometer, ceramic bezel, 300m water resistance, helium escape valve, magnetic resistance to 15,000 gauss. Box and papers included.`,
        prizeValue: 5100,
        ticketPrice: 2.49,
        maxTickets: 4500,
        ticketsSold: 889,
        images: JSON.stringify(['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=85']),
        drawDate: inDays(18),
        status: 'active',
        featured: false,
        sortOrder: 5,
      },
    }),
    prisma.competition.create({
      data: {
        slug: 'ps5-gaming-bundle',
        title: 'PlayStation 5 Ultimate Bundle',
        subtitle: 'PS5 Pro + 10 games + 12 months PS Plus',
        description: `The ultimate gaming setup. Includes the PS5 Pro console, DualSense Edge controller, 10 top titles (your choice), and 12 months PS Plus Premium.\n\nDelivered to any UK address within 7 days of draw.`,
        prizeValue: 1200,
        ticketPrice: 0.49,
        maxTickets: 5000,
        ticketsSold: 3341,
        images: JSON.stringify(['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1200&q=85']),
        drawDate: inDays(10),
        status: 'active',
        featured: false,
        sortOrder: 6,
      },
    }),
  ])

  // ─── COMPLETED COMPETITIONS WITH WINNERS ─────────────────────
  const pastComps = await Promise.all([
    prisma.competition.create({
      data: {
        slug: 'cartier-love-bracelet-gold',
        title: 'Cartier Love Bracelet',
        subtitle: '18ct Yellow Gold — the ultimate status piece',
        description: 'The iconic Cartier Love Bracelet in 18ct yellow gold. This competition has now closed.',
        prizeValue: 7200,
        ticketPrice: 3.49,
        maxTickets: 3000,
        ticketsSold: 3000,
        images: JSON.stringify(['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=85']),
        drawDate: agodays(7),
        status: 'completed',
        featured: false,
        sortOrder: 10,
      },
    }),
    prisma.competition.create({
      data: {
        slug: 'range-rover-sport-experience',
        title: '£25,000 Cash Prize',
        subtitle: 'Our biggest cash prize to date',
        description: 'Our record-breaking cash competition. This competition has now closed.',
        prizeValue: 25000,
        ticketPrice: 9.99,
        maxTickets: 5000,
        ticketsSold: 5000,
        images: JSON.stringify(['https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?w=1200&q=85']),
        drawDate: agodays(21),
        status: 'completed',
        featured: false,
        sortOrder: 11,
      },
    }),
    prisma.competition.create({
      data: {
        slug: 'iphone-16-pro-max',
        title: 'iPhone 16 Pro Max',
        subtitle: '1TB Natural Titanium — sold out competition',
        description: 'The ultimate iPhone. This competition has now closed.',
        prizeValue: 1599,
        ticketPrice: 0.99,
        maxTickets: 3000,
        ticketsSold: 3000,
        images: JSON.stringify(['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&q=85']),
        drawDate: agodays(14),
        status: 'completed',
        featured: false,
        sortOrder: 12,
      },
    }),
    prisma.competition.create({
      data: {
        slug: 'richard-mille-rm11',
        title: 'Richard Mille RM 11-03',
        subtitle: 'The £180k flyback chronograph',
        description: 'The pinnacle of haute horlogerie. This competition has now closed.',
        prizeValue: 180000,
        ticketPrice: 24.99,
        maxTickets: 10000,
        ticketsSold: 10000,
        images: JSON.stringify(['https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=1200&q=85']),
        drawDate: agodays(30),
        status: 'completed',
        featured: false,
        sortOrder: 13,
      },
    }),
  ])

  // Add tickets for users in past comps
  for (const [i, user] of users.entries()) {
    await prisma.ticket.create({
      data: {
        userId: user.id,
        competitionId: pastComps[i % pastComps.length].id,
        quantity: Math.floor(Math.random() * 20) + 5,
        stripePaymentId: `pi_demo_${user.id}`,
      },
    })
  }

  // Create winners for all past comps
  const winnerData = [
    { user: users[0], comp: pastComps[0], ticket: 2481, prize: 'Cartier Love Bracelet — 18ct Yellow Gold', value: 7200 },
    { user: users[1], comp: pastComps[1], ticket: 3107, prize: '£25,000 Cash Prize', value: 25000 },
    { user: users[2], comp: pastComps[2], ticket: 1896, prize: 'iPhone 16 Pro Max — 1TB Natural Titanium', value: 1599 },
    { user: users[3], comp: pastComps[3], ticket: 8742, prize: 'Richard Mille RM 11-03 Flyback Chronograph', value: 180000 },
  ]

  for (const w of winnerData) {
    await prisma.winner.create({
      data: {
        competitionId: w.comp.id,
        userId: w.user.id,
        ticketNumber: w.ticket,
        announced: true,
        prizeTitle: w.prize,
        prizeValue: w.value,
      },
    })
  }

  // Add some tickets to active comps for test user
  for (const comp of comps.slice(0, 3)) {
    await prisma.ticket.create({
      data: {
        userId: users[0].id,
        competitionId: comp.id,
        quantity: 5,
        stripePaymentId: `pi_demo_active_${comp.id}`,
      },
    })
  }

  console.log('\n✓ Seed complete!')
  console.log(`  ${comps.length} active competitions`)
  console.log(`  ${pastComps.length} completed competitions with winners`)
  console.log('\nAdmin:  admin@ivoryvault.com / admin123')
  console.log('User:   james@example.com / password123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
