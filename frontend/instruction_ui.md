# iNextLabs Frontend UI Rules

You are building a modern SaaS-style admin dashboard using:

- React + Vite
- TailwindCSS
- No blue colors allowed
- Brand primary color: #f05742 (Coral Red)

---

## DESIGN STYLE

Modern SaaS style (Stripe / Vercel inspired):

- Clean
- Minimal borders
- Soft shadows
- Rounded corners (rounded-xl or rounded-2xl)
- Large spacing
- Strong visual hierarchy
- Neutral background (bg-gray-50)
- White cards
- Subtle hover animations

---

## COLOR RULES

Primary Brand Color: #f05742

Use:

- text-[#f05742]
- bg-[#f05742]
- bg-[#f05742]/10
- border-[#f05742]/20
- hover:bg-[#f05742]
- hover:text-[#f05742]

NEVER use blue classes.

Success: green-600
Warning: yellow-600
Error: red-600

---

## LAYOUT STRUCTURE

App Layout must include:

- Fixed sidebar (w-64)
- Top navigation bar
- Main content area (flex-1)
- Max width container (max-w-7xl mx-auto)
- Padding: px-8 py-8

---

## CARD DESIGN

All dashboard cards must use:

bg-white
rounded-2xl
shadow-sm
hover:shadow-md
transition-all
duration-200
p-6

No heavy borders.

---

## METRIC CARDS

- Large number (text-3xl font-semibold)
- Small label (text-sm text-gray-500)
- Growth badge in top-right
- Subtle hover elevation

---

## TABLE STYLE

- No harsh borders
- Rounded container
- Soft header background
- Hover row highlight (bg-gray-50)
- Clean spacing

---

## SPACING RULE

Use consistent spacing scale:

- Gap: gap-6
- Section spacing: mb-8
- Internal padding: p-6

---

## TYPOGRAPHY

- Page title: text-3xl font-semibold
- Section title: text-lg font-semibold
- Body text: text-sm text-gray-600
- Avoid serif fonts

---

Always build components cleanly and modular.
Never create cluttered layouts.
Keep whitespace intentional.
