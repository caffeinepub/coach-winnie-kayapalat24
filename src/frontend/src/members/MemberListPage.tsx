import { useState } from 'react';
import { useGetAllMembers } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { Search, Plus, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import MemberFormDialog from './MemberFormDialog';

export default function MemberListPage() {
  const { data: members = [] } = useGetAllMembers();
  const [search, setSearch] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const navigate = useNavigate();

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.programType.toLowerCase().includes(search.toLowerCase()) ||
    m.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-muted-foreground">Manage your member profiles</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member) => (
          <Card
            key={member.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => navigate({ to: `/coach/members/${member.id}` })}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{member.programType}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <span className="text-xs font-medium text-muted-foreground">Member ID:</span>
                  <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded truncate max-w-[180px]" title={member.id}>
                    {member.id}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Weight:</span>
                  <span className="font-medium">{member.currentWeight} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target:</span>
                  <span className="font-medium">{member.targetWeight ? `${member.targetWeight} kg` : 'Not set'}</span>
                </div>
                <div className="mt-2">
                  <Badge variant={member.consentStatus === 'active' ? 'default' : 'secondary'}>
                    {member.consentStatus}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No members found</p>
          </CardContent>
        </Card>
      )}

      <MemberFormDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  );
}
