# Merge checklist

1. Create a branch: `feature/unified-rewards-platform`.
2. Copy this overlay into the repository root and merge folders.
3. Do not edit `src/routeTree.gen.ts`; TanStack regenerates it.
4. Run `npm install` then `npm run build` and `npm run lint`.
5. Apply the SQL migration in a development Supabase project.
6. Run the seed only in development.
7. Deploy Edge Functions and set secrets.
8. Add a navigation link to `/merchant/integrations` if desired.
9. Map Zoryn Platform Swan/Adyen events to the shared contract.
10. Add production campaign evaluation, reversal worker and settlement reconciliation before launch.
