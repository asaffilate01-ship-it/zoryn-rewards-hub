import { createFileRoute } from '@tanstack/react-router';
import { ScenarioLab } from '../../features/rewards-production/components/ScenarioLab';
export const Route = createFileRoute('/_authenticated/rewards-scenario-lab')({ component: ScenarioLab });
