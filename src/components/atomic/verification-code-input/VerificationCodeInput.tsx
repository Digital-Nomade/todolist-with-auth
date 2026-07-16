import { ForwardedRef, forwardRef, InputHTMLAttributes } from "react";
import { normalizeVerificationCode } from "@/lib/features/auth/verificationFlow";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  errorMessage?: string;
  onChange: (value: string) => void;
  value: string;
}

const VerificationCodeInput = forwardRef((
  { errorMessage, onChange, value, className, ...props }: Props,
  ref: ForwardedRef<HTMLInputElement>,
) => (
  <div className={className}>
    <label htmlFor="verification-code" className="sr-only">
      Verification code
    </label>
    <input
      ref={ref}
      id="verification-code"
      name="verification-code"
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern="\d{6}"
      maxLength={6}
      value={value}
      aria-invalid={Boolean(errorMessage)}
      aria-describedby={errorMessage ? "verification-code-error" : undefined}
      className="block w-full border-b-2 border-danger-light bg-transparent py-3 text-center text-3xl tracking-[0.5em] text-danger-light focus:border-danger-light focus:outline-none"
      onChange={(event) => onChange(normalizeVerificationCode(event.target.value))}
      onPaste={(event) => {
        event.preventDefault();
        const pasted = event.clipboardData.getData("text");
        onChange(normalizeVerificationCode(pasted));
      }}
      {...props}
    />
    {errorMessage && (
      <p id="verification-code-error" role="alert" className="mt-3 text-danger font-light">
        {errorMessage}
      </p>
    )}
  </div>
));

VerificationCodeInput.displayName = "VerificationCodeInput";

export { VerificationCodeInput };
