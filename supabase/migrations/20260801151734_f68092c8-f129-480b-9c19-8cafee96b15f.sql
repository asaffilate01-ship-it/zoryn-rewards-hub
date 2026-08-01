ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS excerpt_en TEXT,
  ADD COLUMN IF NOT EXISTS body_md_en TEXT;

UPDATE public.blog_posts SET
  title_en = 'Welcome to Zoryn — More than just points',
  excerpt_en = 'Why we built Zoryn and what a real wallet changes for you.',
  body_md_en = '# Welcome to Zoryn

Zoryn is the one wallet for all your points, cashback and rewards.

## Why?

Because one card per café, per bakery, per shop simply is not up to date anymore. We bundle everything in one place — secure, transparent, made in Germany.

## What you get

- **One** membership number for every partner
- A transparent points ledger — every transaction traceable
- Local offers near you
- Invite friends and collect 500 points

Get started on the [home screen](/app).'
WHERE slug = 'willkommen-bei-zoryn';

UPDATE public.blog_posts SET
  title_en = 'How points work at Zoryn',
  excerpt_en = 'The double-entry ledger behind every points booking — explained simply.',
  body_md_en = '# How points work

Every booking in Zoryn runs through a **double-entry ledger**. That is the same standard used in accounting.

## Why this matters

- No "disappearing" points
- Every change is traceable
- We can calculate the total points liability at any time

## The rate

**100 points = €1** — simple and stable.

## Expiry

Points you collect with a partner are normally valid for 24 months. You can see the details in your wallet.'
WHERE slug = 'wie-punkte-funktionieren';

UPDATE public.blog_posts SET
  title_en = 'How Café Nord tripled its regulars',
  excerpt_en = 'A field report from Berlin-Mitte — with real numbers.',
  body_md_en = '# Café Nord × Zoryn

Since launching with Zoryn, Café Nord has almost **tripled** its customer return rate.

## What they do

- On every coffee: **2× points** before 10am
- Fridays: **free croissant reward** from 500 points
- QR code at the counter — no app required for new customers

## Numbers after 90 days

- +180% returning customers
- Average basket +12%
- 4 minutes of setup per week in the merchant portal

> "Zoryn is the first loyalty tool my customers actually use." — Ana, owner'
WHERE slug = 'cafe-nord-success-story';