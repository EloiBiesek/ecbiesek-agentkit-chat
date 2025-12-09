# AgentKit ChatKit frontend

Next.js 16 (App Router) frontend using `@openai/chatkit-react` for a published Agent Builder workflow.

## Stack
- Next.js 16 / React 19 (App Router)
- `@openai/chatkit-react` for UI and session management
- API route `/api/create-session` exchanges workflow id for `client_secret`

## Local setup
1) Install deps
```bash
npm install
```
2) Create `.env.local` (gitignored):
```
OPENAI_API_KEY=<sua-chave-da-mesma-org/projeto-do-workflow>
NEXT_PUBLIC_CHATKIT_WORKFLOW_ID=wf_6937702f3d8c8190acf7661cc70844170605978c093b1063
```
3) Dev server
```bash
npm run dev
```

## Production (Vercel)
- Root Directory: `agentkit-chatkit`
- Build command: `npm run build`
- Output: `.next`
- Node: padrão Vercel (24.x OK)
- Env vars (Production/Preview): `OPENAI_API_KEY`, `NEXT_PUBLIC_CHATKIT_WORKFLOW_ID`

## Allowlist (ChatKit)
Se sua org exigir allowlist de domínio, inclua os domínios da Vercel:
- Produção: `https://ecbiesek-agentkit-chat.vercel.app`
- Preview (branch `main` atual): `https://ecbiesek-agentkit-chat-git-main-eloi-bieseks-projects.vercel.app`

## Atualizar e redeploy
- Basta commit + push em `main`; a Vercel faz o redeploy automático.

## Onde editar
- UI: `src/components/ChatKitPanel.tsx` e `src/app/page.tsx`
- Session endpoint: `src/app/api/create-session/route.ts`
