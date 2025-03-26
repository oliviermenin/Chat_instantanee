import ChatInterface from "@/components/chat-interface";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="z-10 w-full max-w-5xl">
        <h1 className="mb-6 text-3xl font-bold text-center">Chat</h1>
        <ChatInterface />
      </div>
    </main>
  );
}