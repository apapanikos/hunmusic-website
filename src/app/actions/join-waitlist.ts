"use server";

import { z } from "zod";

import { createServiceClient } from "@/lib/supabase/server";

/**
 * Result of a waitlist submission.
 *
 * `duplicate` is intentionally a distinct status rather than an error — being
 * already signed up is a success from the visitor's point of view, and the UI
 * shows a confirmation panel either way.
 */
export type WaitlistState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "duplicate" }
  | { status: "invalid"; message: string }
  | { status: "error"; message: string };

const emailSchema = z
  .email("That doesn't look like an email address.")
  .max(254, "That email address is too long.");

/** Postgres unique-violation. Raised by the waitlist_email_lower_key index. */
const UNIQUE_VIOLATION = "23505";

export async function joinWaitlist(
  _prev: WaitlistState,
  formData: FormData
): Promise<WaitlistState> {
  // Honeypot: a field hidden from humans. Anything filling it is a bot, so we
  // return the success shape without writing — no signal that it was caught.
  if (typeof formData.get("company") === "string" && formData.get("company") !== "") {
    return { status: "success" };
  }

  const raw = formData.get("email");
  const email = typeof raw === "string" ? raw.trim().toLowerCase() : "";

  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    return {
      status: "invalid",
      message: parsed.error.issues[0]?.message ?? "Please enter a valid email address.",
    };
  }

  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("waitlist").insert({ email: parsed.data });

    if (error) {
      if (error.code === UNIQUE_VIOLATION) {
        return { status: "duplicate" };
      }

      console.error("[waitlist] insert failed", { code: error.code, message: error.message });
      return {
        status: "error",
        message: "Something went wrong on our end. Try again in a moment.",
      };
    }

    return { status: "success" };
  } catch (cause) {
    console.error("[waitlist] unexpected failure", cause);
    return {
      status: "error",
      message: "Something went wrong on our end. Try again in a moment.",
    };
  }
}
