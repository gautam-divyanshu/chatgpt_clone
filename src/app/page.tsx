import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Simple Test - Step 2
        </h1>
        <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
          Test ShadCN Button
        </Button>
        <p className="text-gray-600 mb-4">
          Basic Tailwind styling test before adding ShadCN components.
        </p>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors">
          Test Button
        </button>
        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded">
          <p className="text-green-700 text-sm">
            ✅ If you see colors and styling, basic Tailwind is working!
          </p>
        </div>
      </div>
    </div>
  );
}
