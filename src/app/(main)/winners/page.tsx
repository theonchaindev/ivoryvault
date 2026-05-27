import { prisma } from '@/lib/prisma'
import WinnerCard from '@/components/WinnerCard'
import WinnersHero from './WinnersHero'

export const metadata = {
  title: 'Winners — Ivory Vault',
  description: 'Meet the lucky winners of Ivory Vault luxury prize competitions.',
}

async function getWinners() {
  try {
    return await prisma.winner.findMany({
      where: { announced: true },
      orderBy: { drawnAt: 'desc' },
      include: {
        user: { select: { name: true } },
        competition: { select: { title: true, prizeValue: true } },
      },
    })
  } catch {
    return []
  }
}

export default async function WinnersPage() {
  const winners = await getWinners()
  const total = winners.reduce((s, w) => s + (w.prizeValue ?? w.competition.prizeValue), 0)

  return (
    <div className="wpage">
      <WinnersHero count={winners.length} total={total} />

      <div className="wpage__grid-wrap">
        {winners.length > 0 ? (
          <div className="wpage__grid">
            {winners.map((w, i) => (
              <WinnerCard
                key={w.id}
                index={i}
                winner={{
                  ...w,
                  drawnAt: w.drawnAt.toISOString(),
                  prizeTitle: w.prizeTitle ?? null,
                  prizeValue: w.prizeValue ?? null,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="wpage__empty">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ margin: '0 auto 1.5rem', display: 'block', opacity: .25 }}>
              <path d="M28 4 L34 19 L51 21 L39 32 L42 49 L28 41 L14 49 L17 32 L5 21 L22 19 Z" stroke="#b8687a" strokeWidth="1.5" fill="none" />
            </svg>
            <p className="wpage__empty-text">Winners will be announced here</p>
            <p className="wpage__empty-sub">Be the first — enter a live competition today.</p>
          </div>
        )}
      </div>

      <style>{`
        .wpage { background: var(--off); min-height: calc(100vh - 68px); }
        .wpage__grid-wrap { max-width: 1280px; margin: 0 auto; padding: 4rem 2rem 6rem; }
        .wpage__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
        .wpage__empty { text-align: center; padding: 5rem 2rem; }
        .wpage__empty-text { font-family: var(--font-cormorant,serif); font-size: 1.5rem; color: var(--ink3); margin-bottom: .5rem; }
        .wpage__empty-sub { font-size: .875rem; color: var(--ink3); }
        @media (max-width: 640px) { .wpage__grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  )
}
