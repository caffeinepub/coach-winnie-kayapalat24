import { useState } from 'react';
import { useGetAllMembers, useGetAllDailyCheckins, useGetAllWeeklyCheckins, useGetAllMessageLogs } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportToCSV } from './csv';

export default function ReportsExportPage() {
  const { data: members = [] } = useGetAllMembers();
  const { data: dailyCheckins = [] } = useGetAllDailyCheckins();
  const { data: weeklyCheckins = [] } = useGetAllWeeklyCheckins();
  const { data: messageLogs = [] } = useGetAllMessageLogs();

  const handleExport = (type: string) => {
    switch (type) {
      case 'members':
        exportToCSV(
          members.map((m) => ({
            Name: m.name,
            Age: Number(m.age),
            Gender: m.gender,
            Phone: m.whatsappPhone,
            'Current Weight': m.currentWeight,
            'Target Weight': m.targetWeight || 'N/A',
            Program: m.programType,
            'Consent Status': m.consentStatus,
          })),
          'members.csv'
        );
        break;
      case 'daily':
        exportToCSV(
          dailyCheckins.map((c) => ({
            'Member ID': c.memberId,
            Date: new Date(Number(c.date) / 1_000_000).toLocaleDateString(),
            Water: c.waterIntake,
            'Workout Minutes': Number(c.workoutMinutes),
            Steps: Number(c.steps),
            Sleep: c.sleepHours,
            Mood: Number(c.moodScore),
            Digestion: Number(c.digestionScore),
            Compliance: Number(c.complianceScore),
          })),
          'daily-checkins.csv'
        );
        break;
      case 'weekly':
        exportToCSV(
          weeklyCheckins.map((c) => ({
            'Member ID': c.memberId,
            Date: new Date(Number(c.date) / 1_000_000).toLocaleDateString(),
            Weight: c.weight,
            Waist: c.waist || 'N/A',
            Hip: c.hip || 'N/A',
            Chest: c.chest || 'N/A',
          })),
          'weekly-checkins.csv'
        );
        break;
      case 'messages':
        exportToCSV(
          messageLogs.map((m) => ({
            'Member ID': m.memberId,
            Template: m.templateId,
            Status: m.status,
            Timestamp: new Date(Number(m.timestamp) / 1_000_000).toLocaleString(),
          })),
          'message-logs.csv'
        );
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Export</h1>
        <p className="text-muted-foreground">Download data for analysis</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Export all member profiles with demographics and goals
            </p>
            <Button onClick={() => handleExport('members')} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Export Members ({members.length})
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Export all daily check-in data with metrics
            </p>
            <Button onClick={() => handleExport('daily')} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Export Daily ({dailyCheckins.length})
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Export weekly measurements and progress
            </p>
            <Button onClick={() => handleExport('weekly')} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Export Weekly ({weeklyCheckins.length})
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Message Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Export WhatsApp message history and status
            </p>
            <Button onClick={() => handleExport('messages')} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Export Messages ({messageLogs.length})
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
