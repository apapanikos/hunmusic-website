"use client";

import { useActionState, useId } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { joinWaitlist, type WaitlistState } from "@/app/actions/join-waitlist";
import { EASE } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { site } from "@/lib/site";

const INITIAL: WaitlistState = { status: "idle" };

/**
 * The mailing-list capture. All behaviour (Server Action, loading, success,
 * error, dedupe-as-success, honeypot, live regions) predates the redesign and
 * is unchanged — only the chrome moved to the hard-rectangle language:
 * bordered input, inverting "+ Notify me" submit, no pills.
 */
export function WaitlistForm() {
  const [state, formAction, isPending] = useActionState(joinWaitlist, INITIAL);

  const emailId = useId();
  const messageId = useId();

  const isDone = state.status === "success" || state.status === "duplicate";
  const errorMessage =
    state.status === "invalid" || state.status === "error" ? state.message : null;

  const copy = state.status === "duplicate" ? site.subscribe.duplicate : site.subscribe.confirmation;

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <AnimatePresence mode="wait" initial={false}>
        {isDone ? (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="relative overflow-hidden border border-border bg-card px-8 py-10 text-center"
          >
            {/* Soft bloom behind the confirmation — the page's one moment of warmth. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(80% 120% at 50% 0%, color-mix(in srgb, var(--magenta), transparent 86%), transparent 70%)",
              }}
            />

            <motion.span
              aria-hidden
              className="relative mx-auto flex size-11 items-center justify-center border border-magenta/50"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="size-5 stroke-magenta stroke-[1.75]">
                <motion.path
                  d="M4.5 12.5 10 18 19.5 6.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
                />
              </svg>
            </motion.span>

            <p
              className="relative mt-6 text-2xl font-semibold tracking-[-0.02em]"
              role="status"
              aria-live="polite"
            >
              {copy.title}
            </p>
            <p className="relative mt-3 text-[0.94rem] leading-relaxed text-muted-foreground">
              {copy.body}
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            action={formAction}
            noValidate
            initial={false}
            exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            transition={{ duration: 0.4, ease: EASE }}
            className="relative"
          >
            <label htmlFor={emailId} className="sr-only">
              Email address
            </label>

            {/* Honeypot. Hidden from people and from assistive tech; only bots
                fill it, and the action silently drops those submissions. */}
            <div aria-hidden className="pointer-events-none absolute -left-[9999px] opacity-0">
              <label htmlFor="company">Company</label>
              <input
                id="company"
                name="company"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="group relative flex flex-col gap-3 sm:flex-row sm:gap-0 sm:border sm:border-input sm:bg-card/60 sm:transition-colors sm:duration-500 sm:focus-within:border-foreground/40">
              {/* Focus edge, desktop only — the rectangle lights from within. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 hidden opacity-0 transition-opacity duration-500 group-focus-within:opacity-100 sm:block"
                style={{
                  boxShadow:
                    "0 0 0 1px color-mix(in srgb, var(--blue), transparent 55%), 0 18px 60px -24px color-mix(in srgb, var(--blue), transparent 45%)",
                }}
              />

              <Input
                id={emailId}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                disabled={isPending}
                placeholder={site.subscribe.placeholder}
                aria-invalid={errorMessage ? true : undefined}
                aria-describedby={errorMessage ? messageId : undefined}
                // Focus target for the "Get notified" buttons elsewhere on the page.
                data-subscribe-input
                className="relative h-12 rounded-none border-input bg-card/60 px-5 text-[0.95rem] placeholder:text-muted-foreground/60 focus-visible:ring-0 sm:border-0 sm:bg-transparent"
              />

              <Button
                type="submit"
                size="lg"
                disabled={isPending}
                className="h-12 shrink-0 gap-2 rounded-none border border-foreground bg-foreground px-7 font-ui text-[0.72rem] tracking-[0.2em] text-background uppercase transition-colors duration-300 hover:bg-transparent hover:text-foreground disabled:opacity-100 sm:-m-px"
              >
                {isPending ? (
                  <>
                    <span
                      aria-hidden
                      className="size-3.5 animate-spin rounded-full border-[1.5px] border-current/30 border-t-current"
                    />
                    Sending
                  </>
                ) : (
                  <>
                    <span aria-hidden>+</span>
                    {site.subscribe.cta}
                  </>
                )}
              </Button>
            </div>

            {/* Live region is always mounted so messages are announced reliably. */}
            <div id={messageId} role="status" aria-live="polite" className="min-h-6 px-1 pt-3">
              <AnimatePresence mode="wait">
                {errorMessage ? (
                  <motion.p
                    key={errorMessage}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="text-center text-[0.82rem] text-destructive sm:text-left"
                  >
                    {errorMessage}
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
