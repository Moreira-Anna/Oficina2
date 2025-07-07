"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export default function AuthTestPage() {
  const { user, isLoading } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  useEffect(() => {
    addLog(`AuthContext - isLoading: ${isLoading}, user: ${user ? user.nome : 'null'}`);
  }, [isLoading, user]);

  useEffect(() => {
    addLog("Component mounted");
    
    const token = localStorage.getItem('token');
    addLog(`Token in localStorage: ${token ? 'exists' : 'not found'}`);
    
    if (token) {
      addLog(`Token starts with: ${token.substring(0, 20)}...`);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Auth Test Page
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Current Auth State</h2>
          <div className="space-y-2">
            <p><strong>isLoading:</strong> {isLoading ? 'true' : 'false'}</p>
            <p><strong>user:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Logs</h2>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <p key={index} className="text-sm text-gray-600 font-mono">
                {log}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
