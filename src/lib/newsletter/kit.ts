import "server-only";

/**
 * Mailing-list provider: Kit (formerly ConvertKit), v4 API.
 *
 * This replaced a Supabase table. A table can hold addresses but it can't send
 * anything — the point of the list is emailing people when a record lands, and
 * that means an actual sending platform with unsubscribes, bounce handling and
 * CAN-SPAM/GDPR footers. Kit's free tier covers 10k subscribers.
 *
 * The whole provider surface is this file: one function, one result type. To
 * move to Buttondown, Resend or EmailOctopus, reimplement `subscribeEmail` —
 * the Server Action and the form don't know which service is behind it.
 *
 * `server-only` makes an accidental client import a build error rather than a
 * leaked API key.
 */

const API_ROOT = "https://api.kit.com/v4";

/**
 * Kit is a third party on the critical path of a form submission. Without a
 * deadline a hung connection would hold the Server Action open until the
 * platform's own timeout, and the visitor would watch a spinner the whole time.
 */
const TIMEOUT_MS = 8000;

export type SubscribeResult =
  /** Newly added. */
  | { status: "subscribed" }
  /** Already on the list — a success from the visitor's point of view. */
  | { status: "already" }
  /** Something we couldn't recover from; `reason` is for the server log only. */
  | { status: "error"; reason: string };

type CreateSubscriberResponse = {
  subscriber?: { id?: number; email_address?: string };
};

/**
 * Adds an address to the list.
 *
 * `POST /v4/subscribers` is an upsert, and its status code carries the one
 * distinction the UI cares about: 201 for a new subscriber, 200 when the
 * address was already known. That maps straight onto the form's "You're in." /
 * "Already on the list." states, so the page can stay honest without us keeping
 * our own copy of the list to check against.
 */
export async function subscribeEmail(email: string, referrer?: string): Promise<SubscribeResult> {
  const apiKey = process.env.KIT_API_KEY;
  if (!apiKey) {
    return { status: "error", reason: "KIT_API_KEY is not set — see .env.example" };
  }

  let response: Response;
  try {
    response = await fetch(`${API_ROOT}/subscribers`, {
      method: "POST",
      headers: {
        "X-Kit-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email_address: email }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      // Never let a POST to a third party be cached or deduped.
      cache: "no-store",
    });
  } catch (cause) {
    const timedOut = cause instanceof Error && cause.name === "TimeoutError";
    return {
      status: "error",
      reason: timedOut ? `Kit did not respond within ${TIMEOUT_MS}ms` : `fetch failed: ${String(cause)}`,
    };
  }

  if (response.status !== 200 && response.status !== 201 && response.status !== 202) {
    // 401 = bad or revoked key, 422 = Kit rejected the address. Both are ours
    // to fix, and neither is worth explaining to the visitor.
    const body = await response.text().catch(() => "");
    return {
      status: "error",
      reason: `Kit returned ${response.status}: ${body.slice(0, 300)}`,
    };
  }

  const already = response.status === 200;

  /*
   * Optional second step: attach the subscriber to a Kit form.
   *
   * This is what fires that form's welcome email and any sequence behind it, so
   * it's worth doing — but the person is already on the list by now. A failure
   * here is logged and swallowed rather than shown as a failed signup, which
   * would invite them to submit again to fix something that isn't broken.
   */
  const formId = process.env.KIT_FORM_ID;
  if (formId) {
    const payload = (await response.json().catch(() => null)) as CreateSubscriberResponse | null;
    const subscriberId = payload?.subscriber?.id;

    if (!subscriberId) {
      console.warn("[newsletter] subscribed, but Kit returned no subscriber id — skipped form attach");
    } else {
      try {
        const attach = await fetch(`${API_ROOT}/forms/${formId}/subscribers/${subscriberId}`, {
          method: "POST",
          headers: {
            "X-Kit-Api-Key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(referrer ? { referrer } : {}),
          signal: AbortSignal.timeout(TIMEOUT_MS),
          cache: "no-store",
        });

        if (!attach.ok) {
          console.warn(`[newsletter] form attach failed with ${attach.status} (subscriber was still added)`);
        }
      } catch (cause) {
        console.warn("[newsletter] form attach threw (subscriber was still added)", cause);
      }
    }
  }

  return already ? { status: "already" } : { status: "subscribed" };
}
