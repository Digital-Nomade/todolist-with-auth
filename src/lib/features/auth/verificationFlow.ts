const VERIFICATION_EMAIL_KEY = "todo-auth.verification-email";
const VERIFICATION_MESSAGE_KEY = "todo-auth.verification-message";
const VERIFICATION_RESEND_COOLDOWN_KEY = "todo-auth.verification-resend-cooldown";

export const VERIFICATION_RESEND_COOLDOWN_MS = 60_000;

function canUseSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function storeVerificationEmail(email: string) {
  if (!canUseSessionStorage()) return;
  sessionStorage.setItem(VERIFICATION_EMAIL_KEY, normalizeEmail(email));
}

export function getVerificationEmail() {
  if (!canUseSessionStorage()) return null;
  return sessionStorage.getItem(VERIFICATION_EMAIL_KEY);
}

export function clearVerificationEmail() {
  if (!canUseSessionStorage()) return;
  sessionStorage.removeItem(VERIFICATION_EMAIL_KEY);
}

export function storeVerificationMessage(message: string) {
  if (!canUseSessionStorage()) return;
  sessionStorage.setItem(VERIFICATION_MESSAGE_KEY, message);
}

export function getVerificationMessage() {
  if (!canUseSessionStorage()) return null;
  return sessionStorage.getItem(VERIFICATION_MESSAGE_KEY);
}

export function clearVerificationMessage() {
  if (!canUseSessionStorage()) return;
  sessionStorage.removeItem(VERIFICATION_MESSAGE_KEY);
}

export function clearVerificationFlowState() {
  clearVerificationEmail();
  clearVerificationMessage();
}

export function setResendCooldown(email: string, durationMs = VERIFICATION_RESEND_COOLDOWN_MS) {
  if (!canUseSessionStorage()) return;
  sessionStorage.setItem(
    VERIFICATION_RESEND_COOLDOWN_KEY,
    JSON.stringify({
      email: normalizeEmail(email),
      expiresAt: Date.now() + durationMs,
    }),
  );
}

export function getRemainingResendCooldownMs(email: string) {
  if (!canUseSessionStorage()) return 0;

  const raw = sessionStorage.getItem(VERIFICATION_RESEND_COOLDOWN_KEY);
  if (!raw) return 0;

  try {
    const parsed = JSON.parse(raw) as { email?: string; expiresAt?: number };
    if (parsed.email !== normalizeEmail(email) || typeof parsed.expiresAt !== "number") {
      return 0;
    }

    return Math.max(0, parsed.expiresAt - Date.now());
  } catch {
    return 0;
  }
}

export function normalizeVerificationCode(value: string) {
  return value.replace(/\D/g, "").slice(0, 6);
}

export function isValidVerificationCode(code: string) {
  return /^\d{6}$/.test(code);
}

export function maskEmail(email: string) {
  const normalized = normalizeEmail(email);
  const [localPart = "", domain = ""] = normalized.split("@");

  if (!localPart || !domain) {
    return "your email address";
  }

  if (localPart.length <= 2) {
    return `***@${domain}`;
  }

  return `${localPart[0]}***@${domain}`;
}

export function resolveVerificationEmail(queryEmail?: string | null) {
  const storedEmail = getVerificationEmail();
  const query = queryEmail ? normalizeEmail(queryEmail) : "";

  if (storedEmail) {
    return storedEmail;
  }

  if (query) {
    storeVerificationEmail(query);
    return query;
  }

  return "";
}
