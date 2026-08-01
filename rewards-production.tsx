import { createFileRoute } from '@tanstack/react-router';
import { LiabilityCentre } from '../../features/rewards-production/components/LiabilityCentre';
export const Route = createFileRoute('/_authenticated/liability-centre')({ component: LiabilityCentre });
