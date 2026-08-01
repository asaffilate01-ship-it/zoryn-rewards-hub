# Merge checklist

1. Back up the current repository or create a branch.
2. Extract this ZIP.
3. Copy all extracted files into the repository root.
4. Allow folders to merge; do not delete existing files.
5. Do not edit `src/routeTree.gen.ts` manually.
6. Apply the migration in Supabase.
7. Apply seed data only to a development project.
8. Deploy the three Edge Functions.
9. Add environment secrets listed in `.env.rewards-production.example`.
10. Run `npm install`, `npm run lint`, and `npm run build`.
11. Verify the five new routes.
12. Commit: `Add Zoryn Rewards production upgrade v3`.
