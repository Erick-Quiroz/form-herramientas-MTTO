'use client';

import { useParams, useRouter } from 'next/navigation';
import TechnicianDetail from '@/components/TechnicianDetail';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TechnicianDetailPage() {
    const params = useParams();
    const router = useRouter();
    const technicianId = params.id as string;

    return (
        <div className="w-full">
            <div className="max-w-6xl mx-auto p-6">
                <div className="mb-6 flex items-center gap-2">
                    <Button
                        onClick={() => router.back()}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        Volver
                    </Button>
                </div>

                <TechnicianDetail
                    technicianId={technicianId}
                    onClose={() => router.back()}
                />
            </div>
        </div>
    );
}
