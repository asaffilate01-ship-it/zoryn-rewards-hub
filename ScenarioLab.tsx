import { createFileRoute } from '@tanstack/react-router';
import { ProductionDashboard } from '../features/rewards-production/components/ProductionDashboard';
export const Route = createFileRoute('/rewards-production')({ component: ProductionDashboard });
