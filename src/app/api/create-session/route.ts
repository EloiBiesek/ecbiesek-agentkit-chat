import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "chatkit_session_id";
const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
const DEFAULT_CHATKIT_BASE = "https://api.openai.com";
const FALLBACK_WORKFLOW_ID =
  "wf_6937702f3d8c8190acf7661cc70844170605978c093b1063";

const isProd = () => (process.env.NODE_ENV || "").toLowerCase() === "production";

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY environment variable" },
      { status: 500 }
    );
  }

  const body = await readJson(request);
  const workflowId = resolveWorkflowId(body);
  if (!workflowId) {
    return NextResponse.json({ error: "Missing workflow id" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const existing = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const userId = existing ?? crypto.randomUUID();
  const shouldSetCookie = !existing;

  const apiBase =
    process.env.CHATKIT_API_BASE ||
    process.env.NEXT_PUBLIC_CHATKIT_API_BASE ||
    DEFAULT_CHATKIT_BASE;

  let upstream;
  try {
    upstream = await fetch(`${apiBase}/v1/chatkit/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "OpenAI-Beta": "chatkit_beta=v1",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ workflow: { id: workflowId }, user: userId }),
      cache: "no-store",
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to reach ChatKit API: ${String(error)}` },
      { status: 502 }
    );
  }

  const payload = (await upstream.json().catch(() => ({}))) as
    | {
        client_secret?: string;
        expires_after?: string;
        error?: string;
      }
    | Record<string, never>;

  if (!upstream.ok) {
    const message = payload?.error || upstream.statusText || "Failed to create session";
    return NextResponse.json({ error: message }, { status: upstream.status });
  }

  const clientSecret = payload?.client_secret;
  const expiresAfter = payload?.expires_after;

  if (!clientSecret) {
    return NextResponse.json(
      { error: "Missing client secret in response" },
      { status: 502 }
    );
  }

  const response = NextResponse.json(
    {
      client_secret: clientSecret,
      expires_after: expiresAfter,
    },
    { status: 200 }
  );

  if (shouldSetCookie) {
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: userId,
      httpOnly: true,
      sameSite: "lax",
      secure: isProd(),
      maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
      path: "/",
    });
  }

  return response;
}

function resolveWorkflowId(body: unknown): string | null {
  const envWorkflow =
    process.env.NEXT_PUBLIC_CHATKIT_WORKFLOW_ID ||
    process.env.CHATKIT_WORKFLOW_ID ||
    FALLBACK_WORKFLOW_ID;

  if (body && typeof body === "object") {
    const maybeWorkflow =
      (body as { workflow?: { id?: string }; workflowId?: string }).workflow;
    const direct = (body as { workflowId?: string }).workflowId;
    const workflowId = maybeWorkflow?.id || direct || envWorkflow;
    return normalizeWorkflowId(workflowId);
  }

  return normalizeWorkflowId(envWorkflow);
}

function normalizeWorkflowId(id: unknown): string | null {
  if (typeof id === "string" && id.trim()) {
    return id.trim();
  }
  return null;
}

async function readJson(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
