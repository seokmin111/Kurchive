"use client";
import Image from "next/image";
export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">

        <div className="flex justify-center mb-6">
          <Image 
            src="/kurchive_logo.png" 
            alt="Kurchive Logo" 
            width={128} 
            height={128} 
            priority
          />
        </div>

        <h1 className="text-2xl font-bold mb-6 text-center text-red-900">커카이브</h1>
        
        <form className="space-y-4">
          <div>
            <label htmlFor="id" className="block text-sm font-medium text-gray-700">ID</label>
            <input 
              type="id" 
              id="email" 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="id"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              id="password" 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-red-900 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
          >
            Login
          </button>   
        </form>
      </div>
    </div>
  );
}
