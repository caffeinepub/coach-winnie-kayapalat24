export interface WhatsAppTemplate {
  id: string;
  name: string;
  content: string;
}

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'weekly_followup',
    name: 'Weekly Follow-up',
    content: 'Hi {{name}} 😊 Quick follow-up for this week. Please update your weight + waist and share how your energy and digestion were. I\'m here to help you stay on track 💪',
  },
  {
    id: 'daily_reminder',
    name: 'Daily Check-in Reminder',
    content: 'Hi {{name}} 👋 30-sec check-in time! Reply in the app (water, workout, sleep, mood). Small steps daily = big change 🌿',
  },
  {
    id: 'missed_checkin',
    name: 'Missed Check-in',
    content: 'Hi {{name}} 😊 Noticed no update today. Just reply with 1–5 for compliance and 1 line on how you feel.',
  },
  {
    id: 'congrats',
    name: 'Congratulations',
    content: 'Proud of you {{name}} 🎉 Your consistency is showing. Keep going — one day at a time!',
  },
];

export function substituteTemplate(template: string, name: string): string {
  return template.replace(/\{\{name\}\}/g, name);
}
