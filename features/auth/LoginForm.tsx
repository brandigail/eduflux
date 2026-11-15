"use client";

import { Eye, EyeOff } from "lucide-react";
import { useActionState, useState } from "react";
import { loginAction, type LoginState } from "./actions";

interface LoginFormProps {
  next: string;
  demoEmail: string;
  demoPassword: string;
  instructorEmail: string;
}

const initial: LoginState = { error: null };

export function LoginForm({ next, demoEmail, demoPassword, instructorEmail }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(loginAction, initial);
  const [email, setEmail] = useState(demoEmail);
  const [password, setPassword] = useState(demoPassword);
  const [reveal, setReveal] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 w-full rounded-lg border border-border bg-background px-3 text-foreground"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={reveal ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-background px-3 pr-12 text-foreground"
          />
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? "Hide password" : "Show password"}
            aria-pressed={reveal}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-foreground"
          >
            {reveal ? <EyeOff className="h-5 w-5" aria-hidden /> : <Eye className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>
      {state.error && (
        <p role="alert" className="rounded-lg bg-surface-muted px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-lg bg-accent font-semibold text-white hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60 dark:text-[#0d1020]"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <div className="flex flex-wrap gap-2 text-sm">
        <button
          type="button"
          onClick={() => setEmail(demoEmail)}
          className="rounded-lg border border-border px-3 py-2 hover:bg-surface-muted"
        >
          Use demo student
        </button>
        <button
          type="button"
          onClick={() => setEmail(instructorEmail)}
          className="rounded-lg border border-border px-3 py-2 hover:bg-surface-muted"
        >
          Use demo instructor
        </button>
      </div>
    </form>
  );
}
