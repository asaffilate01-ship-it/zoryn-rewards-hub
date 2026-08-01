import { createFileRoute } from '@tanstack/react-router';
import { CampaignStudio } from '../../features/rewards-production/components/CampaignStudio';
export const Route = createFileRoute('/_authenticated/campaign-studio')({ component: CampaignStudio });
