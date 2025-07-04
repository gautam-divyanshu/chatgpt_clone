export default function Home() {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          ChatGPT Clone - Step 1
        </h1>
        <p className="text-gray-700 mb-4">
          If you can see this styled page, Tailwind CSS is working correctly!
        </p>
        <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
          <p className="text-green-700 font-semibold">✅ Step 1 Complete</p>
          <p className="text-green-600 text-sm">
            Next.js + TypeScript + Tailwind CSS
          </p>
        </div>
        <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
          Test Button (Hover Me)
        </button>
      </div>
    </div>
  );
}
