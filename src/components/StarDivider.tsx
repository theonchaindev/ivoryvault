export default function StarDivider({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`star-divider${dark ? ' star-divider--dark' : ''}`} aria-hidden>
      <span className="star-divider__line" />
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="star-divider__star">
        <path d="M7 0L8.4 5.6L14 7L8.4 8.4L7 14L5.6 8.4L0 7L5.6 5.6L7 0Z" fill="currentColor" />
      </svg>
      <span className="star-divider__line" />
    </div>
  )
}
