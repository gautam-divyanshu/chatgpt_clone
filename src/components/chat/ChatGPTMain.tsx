"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatInput } from "./ChatInput";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  isStreaming?: boolean;
  isEditing?: boolean;
  originalContent?: string;
}

export function ChatGPTMain() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const streamingControllerRef = useRef<AbortController | null>(null);

  // Check if user is scrolled to bottom
  const isScrolledToBottom = () => {
    if (!chatContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    return Math.abs(scrollHeight - clientHeight - scrollTop) < 50;
  };

  // Handle scroll events to detect manual scrolling
  const handleScroll = () => {
    setShouldAutoScroll(isScrolledToBottom());
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [shouldAutoScroll]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, shouldAutoScroll, scrollToBottom]);

  // Generate mock responses based on prompt
  const generateMockResponse = (prompt: string) => {
    const responses = {
      quantum: `Quantum computing is fascinating! Here's a simple explanation:\n\n**What is it?**\nQuantum computers use quantum bits (qubits) instead of regular bits. While regular bits can only be 0 or 1, qubits can be both at the same time through "superposition."\n\n**Why is it powerful?**\n• Can solve certain problems exponentially faster\n• Excellent for cryptography, optimization, and simulation\n• Can break current encryption methods\n\n**Current limitations:**\n• Very sensitive to environmental interference\n• Requires extremely cold temperatures\n• Still mostly experimental\n\n**Real-world applications:**\n• Drug discovery and molecular modeling\n• Financial portfolio optimization\n• Artificial intelligence enhancement\n• Weather prediction improvements`,

      python: `Here's a Python function to sort a list with multiple approaches:\n\n\`\`\`python\ndef sort_list(arr, method='quick', reverse=False):\n    """\n    Sort a list using different algorithms\n    \n    Args:\n        arr: List to sort\n        method: 'quick', 'merge', 'built-in'\n        reverse: Sort in descending order if True\n    """\n    \n    if method == 'built-in':\n        return sorted(arr, reverse=reverse)\n    \n    elif method == 'quick':\n        if len(arr) <= 1:\n            return arr\n        \n        pivot = arr[len(arr) // 2]\n        left = [x for x in arr if x < pivot]\n        middle = [x for x in arr if x == pivot]\n        right = [x for x in arr if x > pivot]\n        \n        result = quicksort(left) + middle + quicksort(right)\n        return result[::-1] if reverse else result\n    \n    elif method == 'merge':\n        # Merge sort implementation\n        if len(arr) <= 1:\n            return arr\n            \n        mid = len(arr) // 2\n        left = merge_sort(arr[:mid])\n        right = merge_sort(arr[mid:])\n        \n        return merge(left, right, reverse)\n\n# Example usage:\nnumbers = [64, 34, 25, 12, 22, 11, 90]\nsorted_numbers = sort_list(numbers, method='quick')\nprint(sorted_numbers)  # [11, 12, 22, 25, 34, 64, 90]\n\`\`\`\n\n**Time Complexities:**\n• Built-in sort: O(n log n) - Timsort algorithm\n• Quick sort: O(n log n) average, O(n²) worst case\n• Merge sort: O(n log n) guaranteed`,

      space: `# The Last Frontier\n\n*A Short Story About Space Exploration*\n\n---\n\nCaptain Elena Vasquez pressed her palm against the viewport, watching Earth shrink to a pale blue dot behind them. The *Horizon's Edge* hummed quietly as its fusion engines carried humanity's first interstellar crew toward Proxima Centauri.\n\n"Second thoughts?" asked Dr. Chen, floating beside her in the observation deck.\n\nElena smiled. "Never. Just... taking it in. We're actually doing it."\n\nTwenty-three years of preparation had led to this moment. The breakthrough in fusion propulsion, the development of hibernation pods, the discovery of potentially habitable worlds—all converging into humanity's greatest adventure.\n\n"The probe data looks promising," Chen continued, pulling up a holographic display. "Proxima b shows signs of liquid water, and the atmospheric composition suggests—"\n\n"I know the data by heart," Elena interrupted gently. "But data is just numbers. What we're doing... we're becoming a spacefaring species. Our children will grow up among the stars."\n\nThe ship's AI chimed softly. "Beginning hibernation sequence in T-minus 60 minutes. All crew to preparation stations."\n\nElena took one last look at Earth, then turned toward the hibernation bay. When they woke up, they'd be orbiting another star. The first humans to call another world home.\n\n*The age of exploration had truly begun.*\n\n---\n\n**Themes explored:** Human ambition, the unknown frontier, technological advancement, and the courage to venture into the cosmos for future generations.`,

      energy: `# Benefits of Renewable Energy\n\nRenewable energy sources offer numerous advantages for our planet and society:\n\n## Environmental Benefits\n• **Reduced carbon emissions** - Significantly lower greenhouse gas output\n• **Cleaner air and water** - No harmful pollutants or waste products\n• **Ecosystem preservation** - Minimal impact on natural habitats\n• **Climate change mitigation** - Helps limit global temperature rise\n\n## Economic Advantages\n• **Job creation** - Growing industry with diverse employment opportunities\n• **Energy independence** - Reduced reliance on fossil fuel imports\n• **Stable pricing** - Protection from volatile fossil fuel market fluctuations\n• **Long-term savings** - Lower operational costs after initial investment\n\n## Technological Progress\n• **Innovation driver** - Spurs development of new technologies\n• **Grid modernization** - Encourages smart grid development\n• **Energy storage advances** - Improves battery and storage solutions\n• **Efficiency improvements** - Continuously increasing energy output\n\n## Social Impact\n• **Public health** - Reduced respiratory and cardiovascular diseases\n• **Energy access** - Brings power to remote and underserved areas\n• **Community development** - Local energy projects create community benefits\n• **Future sustainability** - Ensures energy security for coming generations\n\n## Types of Renewable Energy\n1. **Solar** - Photovoltaic and thermal systems\n2. **Wind** - Onshore and offshore wind farms\n3. **Hydroelectric** - Dams and run-of-river systems\n4. **Geothermal** - Earth's natural heat\n5. **Biomass** - Organic matter conversion\n6. **Tidal/Wave** - Ocean energy harvesting\n\nThe transition to renewable energy is not just an environmental necessity, but an economic opportunity that benefits society as a whole.`,
    };

    const prompt_lower = prompt.toLowerCase();
    if (prompt_lower.includes("quantum")) return responses.quantum;
    if (
      prompt_lower.includes("python") ||
      prompt_lower.includes("function") ||
      prompt_lower.includes("sort")
    )
      return responses.python;
    if (prompt_lower.includes("story") || prompt_lower.includes("space"))
      return responses.space;
    if (prompt_lower.includes("energy") || prompt_lower.includes("renewable"))
      return responses.energy;

    return `Thank you for your question: "${prompt}"\n\nThis is a comprehensive response that demonstrates the message editing functionality. You can:\n\n• Click the edit button to modify your message\n• The conversation will regenerate from that point\n• All subsequent messages will be updated\n• The edit maintains conversation context\n\nKey features:\n✓ Inline editing with save/cancel options\n✓ Conversation branching and regeneration\n✓ Maintains message history and context\n✓ Seamless user experience\n\nThis creates a dynamic conversation flow where you can refine your questions and explore different conversation paths, just like in the real ChatGPT interface.`;
  };

  // Mock streaming API function
  const streamResponse = async (prompt: string, messageId: string) => {
    const controller = new AbortController();
    streamingControllerRef.current = controller;

    const mockResponse = generateMockResponse(prompt);
    const words = mockResponse.split(" ");
    let currentContent = "";

    try {
      for (let i = 0; i < words.length; i++) {
        if (controller.signal.aborted) break;

        currentContent += (i > 0 ? " " : "") + words[i];

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, content: currentContent } : msg
          )
        );

        await new Promise((resolve) =>
          setTimeout(resolve, 30 + Math.random() * 20)
        );
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, isStreaming: false } : msg
        )
      );
    } catch {
      console.log("Streaming cancelled or failed");
    } finally {
      setIsLoading(false);
      streamingControllerRef.current = null;
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    if (streamingControllerRef.current) {
      streamingControllerRef.current.abort();
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setShouldAutoScroll(true);

    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      content: "",
      isUser: false,
      timestamp: new Date().toLocaleTimeString(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, aiMessage]);
    await streamResponse(content, aiMessageId);
  };

  // Handle message editing
  const handleEditMessage = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, isEditing: true, originalContent: msg.content }
          : msg
      )
    );
  };

  // Handle edit save
  const handleSaveEdit = async (messageId: string, newContent: string) => {
    if (!newContent.trim()) return;

    // Find the message being edited
    const messageIndex = messages.findIndex((msg) => msg.id === messageId);
    if (messageIndex === -1) return;

    // Cancel any ongoing streaming
    if (streamingControllerRef.current) {
      streamingControllerRef.current.abort();
    }

    // Update the edited message and remove all subsequent messages
    const updatedMessages = messages.slice(0, messageIndex + 1).map((msg) =>
      msg.id === messageId
        ? {
            ...msg,
            content: newContent,
            isEditing: false,
            originalContent: undefined,
            timestamp: new Date().toLocaleTimeString(), // Update timestamp
          }
        : msg
    );

    setMessages(updatedMessages);
    setIsLoading(true);
    setShouldAutoScroll(true);

    // Generate new AI response
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      content: "",
      isUser: false,
      timestamp: new Date().toLocaleTimeString(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, aiMessage]);
    await streamResponse(newContent, aiMessageId);
  };

  // Handle edit cancel
  const handleCancelEdit = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              isEditing: false,
              content: msg.originalContent || msg.content,
              originalContent: undefined,
            }
          : msg
      )
    );
  };

  const handleExampleClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="flex-1 flex flex-col h-full chatgpt-main">
      {/* Header - Desktop Only */}
      <div className="hidden md:flex justify-between items-center border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="chatgpt-text text-lg font-medium">ChatGPT</span>
          <svg
            className="w-4 h-4 chatgpt-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg chatgpt-hover">
            <svg
              className="w-5 h-5 chatgpt-text"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
          </button>
          <button className="p-2 rounded-lg chatgpt-hover">
            <svg
              className="w-5 h-5 chatgpt-text"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {messages.length === 0 ? (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="max-w-4xl w-full">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-normal chatgpt-text mb-8">
                  How can I help you today?
                </h1>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-8">
                <button
                  onClick={() =>
                    handleExampleClick(
                      "Explain quantum computing in simple terms"
                    )
                  }
                  className="p-4 rounded-2xl border border-white/20 chatgpt-hover text-left transition-all hover:border-white/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
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
                    </div>
                    <div>
                      <div className="font-medium chatgpt-text text-sm mb-1">
                        Explain a concept
                      </div>
                      <div className="text-sm chatgpt-text-muted">
                        Explain quantum computing in simple terms
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() =>
                    handleExampleClick("Write a Python function to sort a list")
                  }
                  className="p-4 rounded-2xl border border-white/20 chatgpt-hover text-left transition-all hover:border-white/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
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
                    </div>
                    <div>
                      <div className="font-medium chatgpt-text text-sm mb-1">
                        Help with code
                      </div>
                      <div className="text-sm chatgpt-text-muted">
                        Write a Python function to sort a list
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() =>
                    handleExampleClick(
                      "Write a short story about space exploration"
                    )
                  }
                  className="p-4 rounded-2xl border border-white/20 chatgpt-hover text-left transition-all hover:border-white/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
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
                    </div>
                    <div>
                      <div className="font-medium chatgpt-text text-sm mb-1">
                        Creative writing
                      </div>
                      <div className="text-sm chatgpt-text-muted">
                        Write a short story about space exploration
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() =>
                    handleExampleClick(
                      "What are the benefits of renewable energy?"
                    )
                  }
                  className="p-4 rounded-2xl border border-white/20 chatgpt-hover text-left transition-all hover:border-white/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
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
                    </div>
                    <div>
                      <div className="font-medium chatgpt-text text-sm mb-1">
                        Answer questions
                      </div>
                      <div className="text-sm chatgpt-text-muted">
                        What are the benefits of renewable energy?
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Messages - Scrollable Container */
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#6b7280 transparent",
            }}
          >
            <div className="pb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`px-4 py-6 ${message.isUser && "bg-transparent"}`}
                >
                  <div className="max-w-3xl mx-auto">
                    {message.isUser ? (
                      // User message with editing functionality
                      <div className="flex flex-col items-end">
                        {message.isEditing ? (
                          // Edit mode
                          <div className="w-full max-w-fit">
                            <EditableMessage
                              content={message.content}
                              onSave={(newContent) =>
                                handleSaveEdit(message.id, newContent)
                              }
                              onCancel={() => handleCancelEdit(message.id)}
                            />
                          </div>
                        ) : (
                          // Display mode
                          <>
                            <div className="bg-[#2f2f2f] rounded-3xl px-4 py-3 max-w-fit">
                              <pre className="text-[#ececec] text-base leading-7 whitespace-pre-wrap font-sans">
                                {message.content}
                              </pre>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleEditMessage(message.id)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                title="Edit message"
                              >
                                <svg
                                  className="w-4 h-4 text-[#8e8ea0]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <button
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                title="Copy message"
                              >
                                <svg
                                  className="w-4 h-4 text-[#8e8ea0]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      // AI message content
                      <div className="text-[#ececec] text-base leading-7 space-y-4">
                        <div className="whitespace-pre-wrap">
                          {message.content}
                          {message.isStreaming && (
                            <span
                              className="inline-block w-2 h-5 ml-1 animate-pulse"
                              style={{ backgroundColor: "#ececec" }}
                            ></span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading state */}
              {isLoading &&
                messages.length > 0 &&
                !messages[messages.length - 1]?.isStreaming && (
                  <div className="px-4 py-6 bg-[#212121]">
                    <div className="max-w-3xl mx-auto">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        <ChatInput
          input={input}
          setInput={setInput}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

// Editable Message Component
interface EditableMessageProps {
  content: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}

function EditableMessage({ content, onSave, onCancel }: EditableMessageProps) {
  const [editContent, setEditContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  const adjustTextareaSize = useCallback(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;

      // Reset height to get accurate scroll height
      textarea.style.height = "auto";

      // Calculate the number of lines
      const lines = editContent.split("\n");
      const lineHeight = 28; // Approximate line height in pixels (based on leading-7 = 1.75rem)
      const paddingVertical = 0; // No extra padding needed
      const calculatedHeight = Math.max(
        lineHeight,
        lines.length * lineHeight + paddingVertical
      );

      // Set the height
      textarea.style.height = `${calculatedHeight}px`;

      // Calculate width based on content
      const maxLineLength = Math.max(...lines.map((line) => line.length), 10); // Minimum 10 chars

      // Set a dynamic width based on content length
      const minWidth = 200;
      const maxWidth = 600;
      const charWidth = 8.5; // More accurate character width for the font
      const calculatedWidth = Math.min(
        maxWidth,
        Math.max(minWidth, maxLineLength * charWidth + 32)
      ); // +32 for padding

      textarea.style.width = `${calculatedWidth}px`;
    }
  }, [editContent]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        editContent.length,
        editContent.length
      );
      adjustTextareaSize();
    }
  }, [editContent.length, adjustTextareaSize]);

  useEffect(() => {
    adjustTextareaSize();
  }, [editContent, adjustTextareaSize]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  const handleSave = () => {
    if (editContent.trim()) {
      onSave(editContent.trim());
    }
  };

  return (
    <div className="bg-[#424242] rounded-3xl px-4 py-3 max-w-fit">
      <textarea
        ref={textareaRef}
        value={editContent}
        onChange={(e) => {
          setEditContent(e.target.value);
          adjustTextareaSize();
        }}
        onKeyDown={handleKeyPress}
        className="bg-transparent text-[#ececec] resize-none outline-none text-base font-sans whitespace-pre-wrap"
        style={{
          minHeight: "28px",
          width: "auto",
          minWidth: "200px",
          overflow: "hidden",
          lineHeight: "28px",
          padding: "0",
          margin: "0",
          border: "none",
        }}
        rows={1}
      />
      <div className="flex gap-2 mt-3 justify-end">
        <button
          onClick={onCancel}
          className="px-3 py-1 text-sm text-[#8e8ea0] hover:text-[#ececec] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1 text-sm bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
