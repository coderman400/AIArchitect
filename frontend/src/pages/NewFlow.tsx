import React from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { FileText, Image, Mic, ArrowLeft, Bot } from "lucide-react";

const NewFlow: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Link
                to="/apps"
                className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
              <h2 className="text-3xl font-bold mb-2">Create New Flow</h2>
              <p className="text-muted-foreground">
                Choose your preferred input method to get started
              </p>
            </div>

            {/* Input Options - First Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Text Input Option */}
              <Link to="/apps/text-input">
                <div className="bg-card rounded-lg p-8 border border-border hover:border-primary transition-colors cursor-pointer group h-48 flex flex-col items-center justify-center text-center">
                  <FileText className="h-16 w-16 text-blue-600 group-hover:text-blue-700 transition-colors mb-4" />
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    Text Input
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Create flows using text descriptions and written
                    instructions
                  </p>
                </div>
              </Link>

              {/* Image Input Option */}
              <Link to="/apps/flows?input=image">
                <div className="bg-card rounded-lg p-8 border border-border hover:border-primary transition-colors cursor-pointer group h-48 flex flex-col items-center justify-center text-center">
                  <Image className="h-16 w-16 text-green-600 group-hover:text-green-700 transition-colors mb-4" />
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    Image Input
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Upload images, diagrams, or screenshots to create flows
                  </p>
                </div>
              </Link>

              {/* Voice Input Option */}
              <Link to="/apps/flows?input=voice">
                <div className="bg-card rounded-lg p-8 border border-border hover:border-primary transition-colors cursor-pointer group h-48 flex flex-col items-center justify-center text-center">
                  <Mic className="h-16 w-16 text-purple-600 group-hover:text-purple-700 transition-colors mb-4" />
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    Voice Input
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Speak your requirements and let AI transcribe and understand
                  </p>
                </div>
              </Link>
            </div>

            {/* AI Chat Option - Second Row */}
            <div className="flex justify-start">
              <Link to="/apps/flows?input=chat" className="w-full max-w-md">
                <div className="bg-card rounded-lg p-8 border border-border hover:border-primary transition-colors cursor-pointer group h-48 flex flex-col items-center justify-center text-center">
                  <Bot className="h-16 w-16 text-orange-600 group-hover:text-orange-700 transition-colors mb-4" />
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    Talk to AI
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Have a conversation with AI to design your workflow
                    interactively
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewFlow;
