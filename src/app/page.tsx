'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, Users, CheckCircle, AlertCircle } from 'lucide-react';

export default function Home() {
  const [stats, setStats] = useState({
    totalTools: 0,
    totalTechnicians: 0,
    totalEvaluations: 0,
    completedEvaluations: 0,
    pendingEvaluations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [toolsRes, techniciansRes, evaluationsRes] = await Promise.all([
          fetch('/api/tools'),
          fetch('/api/technicians'),
          fetch('/api/evaluations'),
        ]);

        const tools = toolsRes.ok ? await toolsRes.json() : [];
        const technicians = techniciansRes.ok ? await techniciansRes.json() : [];
        const evaluations = evaluationsRes.ok ? await evaluationsRes.json() : [];

        // Todas las evaluaciones en la BD están completadas
        const completed = evaluations.length;

        setStats({
          totalTools: tools.length,
          totalTechnicians: technicians.length,
          totalEvaluations: completed,
          completedEvaluations: completed,
          pendingEvaluations: 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    color = 'blue'
  }: {
    title: string;
    value: string | number;
    description: string;
    icon: any;
    color?: string;
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 border-blue-200',
      green: 'bg-green-50 border-green-200',
      orange: 'bg-orange-50 border-orange-200',
      purple: 'bg-purple-50 border-purple-200',
    };

    const iconColorClasses = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      orange: 'text-orange-600',
      purple: 'text-purple-600',
    };

    return (
      <Card className={`border-2 ${colorClasses[color as keyof typeof colorClasses]}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{title}</CardTitle>
            <Icon className={`w-6 h-6 ${iconColorClasses[color as keyof typeof iconColorClasses]}`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2">{loading ? '-' : value}</div>
          <p className="text-sm text-gray-600">{description}</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Panel de Control
          </h1>
          <p className="text-lg text-gray-600">
            Vista general del sistema de evaluación de técnicos
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Herramientas"
            value={stats.totalTools}
            description="Total de herramientas en el sistema"
            icon={Wrench}
            color="blue"
          />
          <StatCard
            title="Técnicos"
            value={stats.totalTechnicians}
            description="Total de técnicos registrados"
            icon={Users}
            color="green"
          />
          <StatCard
            title="Evaluaciones Completadas"
            value={stats.completedEvaluations}
            description={`de ${stats.totalEvaluations} evaluaciones`}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Evaluaciones Pendientes"
            value={stats.pendingEvaluations}
            description={`${stats.totalEvaluations > 0 ? Math.round((stats.pendingEvaluations / stats.totalEvaluations) * 100) : 0}% del total`}
            icon={AlertCircle}
            color="orange"
          />
        </div>
      </div>
    </div>
  );
}
