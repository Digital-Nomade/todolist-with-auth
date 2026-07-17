import { getVerificationEmailFromError } from "@/lib/features/auth/authErrors";

export const VERIFICATION_FLOW_KEY = "email-verification-flow";
export const VERIFICATION_RESEND_COOLDOWN_MS = 60_000;

const LEGACY_EMAIL_KEY = "todo-auth.verification-email";
const LEGACY_MESSAGE_KEY = "todo-auth.verification-message";
const LEGACY_RESEND_COOLDOWN_KEY = "todo-auth.verification-resend-cooldown";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface VerificationFlowSnapshot {
  email: string;
  message: string;
  resendAvailableAt: number | null;
}

function canUseSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function identifierLooksLikeEmail(identifier: string) {
  return EMAIL_PATTERN.test(identifier.trim());
}

export function emailFromLoginIdentifier(identifier: string) {
  const trimmed = identifier.trim();
  return identifierLooksLikeEmail(trimmed) ? trimmed.toLowerCase() : null;
}

function readLegacyResendAvailableAt(email: string) {
  if (!canUseSessionStorage()) return null;

  const raw = sessionStorage.getItem(LEGACY_RESEND_COOLDOWN_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { email?: string; expiresAt?: number };
    if (parsed.email !== normalizeEmail(email) || typeof parsed.expiresAt !== "number") {
      return null;
    }

    return parsed.expiresAt;
  } catch {
    return null;
  }
}

function loadLegacyVerificationFlow(): VerificationFlowSnapshot | null {
  if (!canUseSessionStorage()) return null;

  const email = sessionStorage.getItem(LEGACY_EMAIL_KEY);
  if (!email) return null;

  return {
    email: normalizeEmail(email),
    message: sessionStorage.getItem(LEGACY_MESSAGE_KEY) ?? "",
    resendAvailableAt: readLegacyResendAvailableAt(email),
  };
}

export function saveVerificationFlow(snapshot: VerificationFlowSnapshot) {
  if (!canUseSessionStorage()) return;

  sessionStorage.setItem(VERIFICATION_FLOW_KEY, JSON.stringify({
    email: normalizeEmail(snapshot.email),
    message: snapshot.message,
    resendAvailableAt: snapshot.resendAvailableAt,
  }));
}

export function loadVerificationFlow(): VerificationFlowSnapshot | null {
  if (!canUseSessionStorage()) return null;

  const raw = sessionStorage.getItem(VERIFICATION_FLOW_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as VerificationFlowSnapshot;
      if (typeof parsed.email === "string" && parsed.email.includes("@")) {
        return {
          email: normalizeEmail(parsed.email),
          message: typeof parsed.message === "string" ? parsed.message : "",
          resendAvailableAt: typeof parsed.resendAvailableAt === "number"
            ? parsed.resendAvailableAt
            : null,
        };
      }
    } catch {
      // Fall back to legacy keys below.
    }
  }

  return loadLegacyVerificationFlow();
}

export function storeVerificationEmail(email: string) {
  const current = loadVerificationFlow();
  saveVerificationFlow({
    email: normalizeEmail(email),
    message: current?.message ?? "",
    resendAvailableAt: current?.resendAvailableAt ?? null,
  });
}

export function getVerificationEmail() {
  return loadVerificationFlow()?.email ?? null;
}

export function storeVerificationMessage(message: string) {
  const current = loadVerificationFlow();
  if (!current?.email) {
    if (!canUseSessionStorage()) return;
    sessionStorage.setItem(LEGACY_MESSAGE_KEY, message);
    return;
  }

  saveVerificationFlow({
    ...current,
    message,
  });
}

export function getVerificationMessage() {
  const snapshot = loadVerificationFlow();
  if (snapshot?.message) {
    return snapshot.message;
  }

  if (!canUseSessionStorage()) return null;
  return sessionStorage.getItem(LEGACY_MESSAGE_KEY);
}

export function clearVerificationFlowState() {
  if (!canUseSessionStorage()) return;

  sessionStorage.removeItem(VERIFICATION_FLOW_KEY);
  sessionStorage.removeItem(LEGACY_EMAIL_KEY);
  sessionStorage.removeItem(LEGACY_MESSAGE_KEY);
  sessionStorage.removeItem(LEGACY_RESEND_COOLDOWN_KEY);
}

export function setResendCooldown(email: string, durationMs = VERIFICATION_RESEND_COOLDOWN_MS) {
  const current = loadVerificationFlow();
  const normalizedEmail = normalizeEmail(email);
  const resendAvailableAt = Date.now() + durationMs;

  if (current?.email === normalizedEmail) {
    saveVerificationFlow({
      ...current,
      resendAvailableAt,
    });
    return;
  }

  saveVerificationFlow({
    email: normalizedEmail,
    message: current?.message ?? "",
    resendAvailableAt,
  });
}

export function getRemainingResendCooldownMs(email: string) {
  const snapshot = loadVerificationFlow();
  const normalizedEmail = normalizeEmail(email);

  if (!snapshot || snapshot.email !== normalizedEmail) {
    return 0;
  }

  if (snapshot.resendAvailableAt === null) {
    return 0;
  }

  return Math.max(0, snapshot.resendAvailableAt - Date.now());
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

export function resolveVerificationEmail(
  queryEmail?: string | null,
  inMemoryEmail?: string | null,
) {
  const storedEmail = getVerificationEmail();
  const query = queryEmail ? normalizeEmail(queryEmail) : "";

  if (storedEmail) {
    return storedEmail;
  }

  if (inMemoryEmail) {
    storeVerificationEmail(inMemoryEmail);
    return inMemoryEmail;
  }

  if (query) {
    storeVerificationEmail(query);
    return query;
  }

  return "";
}

export function resolveVerificationEmailFromLogin(
  identifier: string,
  error?: unknown,
) {
  const emailFromError = getVerificationEmailFromError(error);
  const emailFromIdentifier = emailFromLoginIdentifier(identifier);
  return emailFromError || emailFromIdentifier || "";
}
