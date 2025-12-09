import ChatKitPanel from "@/components/ChatKitPanel";

export default function Home() {
  return (
    <main className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Managed ChatKit · Agent Builder</p>
          <h1>Chat with your workflow</h1>
          <p className="lede">
            This UI talks to your published Agent Builder workflow using
            ChatKit. No backend to maintain—just your Vercel-hosted Next.js app.
          </p>
        </div>
      </header>

      <section className="panel">
        <ChatKitPanel />
      </section>
    </main>
  );
}
