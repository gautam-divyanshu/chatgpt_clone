import React from "react";

interface ExamplePrompt {
  title: string;
  description: string;
  prompt: string;
  icon: React.ReactNode;
  color: string;
}

interface WelcomeScreenProps {
  onExampleClick: (prompt: string) => void;
}

const examplePrompts: ExamplePrompt[] = [
  {
    title: "Explain a concept",
    description: "Explain quantum computing in simple terms",
    prompt: "Explain quantum computing in simple terms",
    color: "blue",
    icon: (
      <svg
        className="w-4 h-4 text-blue-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
  },
  {
    title: "Help with code",
    description: "Write a Python function to sort a list",
    prompt: "Write a Python function to sort a list",
    color: "green",
    icon: (
      <svg
        className="w-4 h-4 text-green-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
        />
      </svg>
    ),
  },
  {
    title: "Creative writing",
    description: "Write a short story about space exploration",
    prompt: "Write a short story about space exploration",
    color: "purple",
    icon: (
      <svg
        className="w-4 h-4 text-purple-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    ),
  },
  {
    title: "Answer questions",
    description: "What are the benefits of renewable energy?",
    prompt: "What are the benefits of renewable energy?",
    color: "orange",
    icon: (
      <svg
        className="w-4 h-4 text-orange-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
];

export function WelcomeScreen({ onExampleClick }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-normal chatgpt-text mb-8">
            How can I help you today?
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-8">
          {examplePrompts.map((example, index) => (
            <button
              key={index}
              onClick={() => onExampleClick(example.prompt)}
              className="p-4 rounded-2xl border border-white/20 chatgpt-hover text-left transition-all hover:border-white/30"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-lg bg-${example.color}-500/20 flex items-center justify-center flex-shrink-0`}
                >
                  {example.icon}
                </div>
                <div>
                  <div className="font-medium chatgpt-text text-sm mb-1">
                    {example.title}
                  </div>
                  <div className="text-sm chatgpt-text-muted">
                    {example.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
