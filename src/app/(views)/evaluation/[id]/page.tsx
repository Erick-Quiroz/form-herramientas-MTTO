'use client';

import { useParams, useRouter } from 'next/navigation';
import EvaluationDetail from '@/components/EvaluationDetail';

export default function EvaluationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const technicianId = params.id as string;

    return (
        <EvaluationDetail
            technicianId={technicianId}
            onBack={() => router.back()}
        />
    );
}
