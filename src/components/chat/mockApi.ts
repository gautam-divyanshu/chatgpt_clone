import { ChatMessage } from "./types";

export const generateMockResponse = (prompt: string): string => {
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

export const streamResponse = async (
  prompt: string,
  messageId: string,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  controller: AbortController
): Promise<void> => {
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
  }
};
