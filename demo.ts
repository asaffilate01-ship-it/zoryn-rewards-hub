import { createFileRoute } from '@tanstack/react-router';
import { MerchantOnboarding } from '../../features/rewards-production/components/MerchantOnboarding';
export const Route = createFileRoute('/_authenticated/merchant-onboarding')({ component: MerchantOnboarding });
