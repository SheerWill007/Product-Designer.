---
name: booking-contact-section
description: A "let's talk" contact section with a booking call to action. Two panels hold reasons to reach out, an avatar, rotating quotes, and a cal.com booking link, popup or inline calendar where visitors pick a time slot that suits them. Covers choosing link vs popup vs inline embed, theme sync, the cal.com event setup checklist, and accessible quote rotation. Use when adding a contact or CTA section, a "book a call" button, cal.com or Calendly scheduling, or a meeting-booking embed, or when a booking link or embed isn't working.
---

# Booking contact section

On willx.tech, the contact block sits just above the crowd footer. The left card lists reasons to reach out, each coloured differently. The right card shows the owner's avatar, "Ready to chat?", a pill button that books a 30-minute cal.com call, and a quote that changes every few seconds.

## Pick the integration

| Option | How | Use when |
| --- | --- | --- |
| **Link** (willx today) | `<a href="https://cal.com/<user>/30min" target="_blank">` | Simplest and most robust. Works everywhere, adds no JavaScript |
| **Popup** | `@calcom/embed-react`: `getCalApi({ namespace })` once, then a button with `data-cal-link="<user>/30min"` + `data-cal-namespace` | Keep visitors on the site. The calendar opens over the page |
| **Inline** | `<Cal calLink="<user>/30min" namespace=… />` in a fixed-height box | A dedicated "Book" page or section where the calendar is the content |

- `calLink` is `user/event-slug` **without** the `https://cal.com/` prefix.
- Embeds are client components (`"use client"`).
- Sync the theme with `cal("ui", { theme: resolvedTheme, layout: "month_view" })`, re-run when the theme changes.
- Put `data-lenis-prevent` on an inline embed's container so smooth scroll doesn't swallow its scrolling.
- The embed is an iframe, so a custom cursor will hide over it (see `custom-cursor`).

## cal.com event checklist

1. Event type: a slug (`30min`), duration, a clear title ("30 min intro call") and a short description.
2. Availability: working hours **in the owner's time zone**. Visitors see slots in their own time zone automatically.
3. Location: Cal Video (willx), Google Meet or a phone call.
4. Buffers before and after, a minimum notice (for example 4h) and a daily limit if needed.
5. Booking questions: name and email (required), plus "What would you like to talk about?" (optional).
6. Confirmation and reminder emails are on. Connect the calendar so busy times are blocked.
7. **Test:** book from a private window on desktop and on a phone, then cancel.

## Section design

- Two columns from `md:` and stacked below. Use `max-w-5xl`, `rounded-2xl` cards and `border-border`. The left card is `bg-muted/30 dark:bg-neutral-900`.
- **Reasons:** a coloured title (`text-sky-400`, `text-emerald-400`, `text-orange-400`) and a muted body that brightens on hover. Each reason is a link: booking by default, `mailto:` for "grab a coffee".
- **Booking card:** an avatar in a dashed ring, then heading, body, the CTA pill (`+ You` + avatar + "Book a free call", min 44px tall), and an email fallback underneath.
- **Quotes:**
  - They rotate every 4.5s, pause while hovered or focused, and don't rotate with reduced motion.
  - The dots are real buttons with 24px hit areas and `aria-current`.
  - Reserve the quote's height so the card doesn't jump.

## Rules

- Make the primary action obvious and single: one booking CTA per section.
- External links say so to screen readers ("opens in a new tab") and use `rel="noopener noreferrer"`.
- Never put a visitor's personal data in booking URLs as query parameters.
- Keep a no-JavaScript path: even with the popup, `href`/`mailto` fallbacks should exist somewhere on the page.

## References

- `references/ContactSection.tsx`: the two-panel section with reasons, booking card, email fallback and accessible quote rotation
- `references/CalBooking.tsx`: `CalPopupButton` and `CalInline` using `@calcom/embed-react`, with theme sync
