"use client";

import { useState } from "react";
import FileUpload from "../components/FileUpload";
import ChatInterface from "../components/ChatInterface";
import DashboardRenderer from "../components/DashboardRenderer";

export default function Home() {
  const [schemaReady, setSchemaReady] = useState(false);
  const [chartData, setChartData] = useState<Record<string, unknown> | null>(null);

  const handleUploadSuccess = () => {
    setSchemaReady(true);
  };

  const handleQueryResponse = (response: Record<string, unknown>) => {
    setChartData(response);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex font-sans">
      {/* Sidebar / Chat Interface */}
      <div className="w-1/3 border-r border-neutral-800 bg-neutral-900/50 flex flex-col p-6 shadow-2xl z-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold shadow-lg shadow-blue-500/30">
            BI
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Conversational BI</h1>
        </div>
        
        {!schemaReady ? (
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            <div className="shrink-0">
              <FileUpload onSuccess={handleUploadSuccess} />
            </div>
            <ChatInterface 
              onQueryResponse={handleQueryResponse} 
              disabled={true} 
              initialMessage="Please upload a supported CSV file above to start analyzing your data."
            />
          </div>
        ) : (
          <ChatInterface onQueryResponse={handleQueryResponse} />
        )}
      </div>

      {/* Main Dashboard Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto h-full flex flex-col">
          <header className="mb-10 flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-light tracking-tight text-white mb-2">Executive Overview</h2>
              <p className="text-neutral-400">Your insights will appear here.</p>
            </div>
          </header>

          <main className="flex-1 flex items-center justify-center">
             {!schemaReady ? (
               <div className="text-center space-y-4 text-neutral-500 max-w-lg">
                 <div className="w-24 h-24 mx-auto rounded-full border border-neutral-800 flex items-center justify-center bg-neutral-900 shadow-xl">
                   <svg className="w-10 h-10 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                   </svg>
                 </div>
                 <h3 className="text-xl text-neutral-300 font-medium">Ready for Data Analysis</h3>
                 <p className="text-sm">Upload a valid CSV file to unlock the chat interface, run textual queries, and automatically generate data visualizations and analytical dashboards here.</p>
               </div>
             ) : (
               <DashboardRenderer data={chartData} />
             )}
          </main>
        </div>
      </div>
    </div>
  );
}
