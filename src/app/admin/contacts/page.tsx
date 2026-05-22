import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

async function getContacts() {
  try {
    return await prisma.contact.findMany({ orderBy: { createdAt: 'desc' } })
  } catch {
    return []
  }
}

export default async function AdminContactsPage() {
  const contacts = await getContacts()

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 600, color: '#1c1a18' }}>
          Contact Messages
        </h1>
        <p style={{ color: '#9a8878', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          {contacts.length} messages
        </p>
      </div>

      <div style={{ backgroundColor: 'white', border: '1px solid #e8d8cc' }}>
        {contacts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {contacts.map(contact => (
              <div
                key={contact.id}
                style={{
                  padding: '1.5rem 2rem',
                  borderBottom: '1px solid #f0e3d3',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#1c1a18' }}>{contact.name}</span>
                    <span style={{ fontSize: '0.8rem', color: '#9a8878', marginLeft: '0.75rem' }}>{contact.email}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#9a8878' }}>{formatDate(contact.createdAt)}</span>
                </div>
                {contact.subject && (
                  <p style={{ fontSize: '0.85rem', fontWeight: 500, color: '#5c524a', marginBottom: '0.375rem' }}>
                    {contact.subject}
                  </p>
                )}
                <p style={{ fontSize: '0.875rem', color: '#5c524a', lineHeight: 1.7 }}>{contact.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: '#9a8878' }}>No contact messages yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
