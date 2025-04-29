
import { Button } from "@/components/ui/button";
import Game from "@/components/game/Game";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background p-4">
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink inline-block text-transparent bg-clip-text">
          Last Pick Standing
        </h1>
        <p className="text-muted-foreground mt-2">Last team standing is your Survivor Pick for the Week</p>
      </header>
      
      <main className="flex-grow">
        <Game />
      </main>
      
      <footer className="mt-6 text-center text-muted-foreground text-sm">
        <p>Created with React & Tailwind CSS • 2025</p>
      </footer>
    </div>
  );
};

export default Index;
