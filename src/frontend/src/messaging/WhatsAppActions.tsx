import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, ExternalLink } from 'lucide-react';
import { WHATSAPP_TEMPLATES, substituteTemplate } from './templates';
import { useLogMessage } from '../hooks/useQueries';
import type { MemberProfile } from '../backend';
import { Badge } from '@/components/ui/badge';

interface WhatsAppActionsProps {
  member: MemberProfile;
}

export default function WhatsAppActions({ member }: WhatsAppActionsProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(WHATSAPP_TEMPLATES[0].id);
  const logMessage = useLogMessage();

  const canSend = member.consentStatus === 'active' && member.reminderPreference !== 'none';

  const handleSend = () => {
    const template = WHATSAPP_TEMPLATES.find((t) => t.id === selectedTemplate);
    if (!template) return;

    const message = substituteTemplate(template.content, member.name);
    const encodedMessage = encodeURIComponent(message);
    const phone = member.whatsappPhone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;

    // Log the message attempt
    logMessage.mutate({
      id: `msg_${Date.now()}`,
      memberId: member.id,
      templateId: template.id,
      status: 'sent',
      timestamp: BigInt(Date.now() * 1_000_000),
      providerMessageId: undefined,
    });

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          WhatsApp Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canSend && (
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">
              WhatsApp messaging is disabled for this member.
              {member.consentStatus !== 'active' && ' Consent is not active.'}
              {member.reminderPreference === 'none' && ' Reminders are turned off.'}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Select Template</label>
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate} disabled={!canSend}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WHATSAPP_TEMPLATES.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border p-3">
          <p className="text-sm">
            {substituteTemplate(
              WHATSAPP_TEMPLATES.find((t) => t.id === selectedTemplate)?.content || '',
              member.name
            )}
          </p>
        </div>

        <Button onClick={handleSend} disabled={!canSend || logMessage.isPending} className="w-full">
          <ExternalLink className="mr-2 h-4 w-4" />
          Open WhatsApp
        </Button>
      </CardContent>
    </Card>
  );
}
