"use client";

import { useMemo } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { createClientSecretFetcher, workflowId } from "../lib/chatkit";

export function ChatKitPanel() {
  const getClientSecret = useMemo(
    () => createClientSecretFetcher(workflowId),
    []
  );

  const chatkit = useChatKit({
    api: { getClientSecret },
  });

  const status = chatkit.control?.state?.status;
  const error = chatkit.control?.state?.error;

  return (
    <div className="chatkit-shell">
      {status === "error" ? (
        <div className="chatkit-fallback">
          <p className="fallback-title">Não foi possível iniciar a sessão.</p>
          <p className="fallback-sub">
            Verifique a chave OPENAI_API_KEY (mesma org/projeto do workflow) e
            tente recarregar a página.
          </p>
          <pre className="fallback-log">
            {error?.message || "Erro desconhecido do ChatKit"}
          </pre>
        </div>
      ) : (
        <ChatKit control={chatkit.control} className="chatkit-frame" />
      )}
    </div>
  );
}

export default ChatKitPanel;
