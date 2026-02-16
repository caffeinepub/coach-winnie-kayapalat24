/**
 * Utility for persisting login intent (coach vs member) across Internet Identity flow
 */

const LOGIN_INTENT_KEY = 'coach-winnie-login-intent';

export type LoginIntent = 'coach' | 'member';

export function setLoginIntent(intent: LoginIntent): void {
  try {
    sessionStorage.setItem(LOGIN_INTENT_KEY, intent);
  } catch (err) {
    console.error('Failed to save login intent:', err);
  }
}

export function getLoginIntent(): LoginIntent | null {
  try {
    const intent = sessionStorage.getItem(LOGIN_INTENT_KEY);
    return intent === 'coach' || intent === 'member' ? intent : null;
  } catch (err) {
    console.error('Failed to read login intent:', err);
    return null;
  }
}

export function clearLoginIntent(): void {
  try {
    sessionStorage.removeItem(LOGIN_INTENT_KEY);
  } catch (err) {
    console.error('Failed to clear login intent:', err);
  }
}
