"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function EventosTestPage() {
  const [eventos, setEventos] = useState<Array<{id: string, nome: string, descricao: string, local: string, status: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const { user } = useAuth();

  useEffect(() => {
    console.log("useEffect triggered, user:", user);
    
    if (user) {
      fetchEventos();
    }
  }, [user]);

  const fetchEventos = async () => {
    try {
      console.log("Fetching eventos...");
      setLoading(true);
      const token = localStorage.getItem("token");
      console.log("Token:", token);
      
      const response = await fetch("/api/eventos", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        throw new Error("Erro ao buscar eventos");
      }

      const data = await response.json();
      console.log("Data received:", data);
      
      if (data.success && Array.isArray(data.data)) {
        setEventos(data.data);
        console.log("Eventos set:", data.data.length);
      } else {
        console.error("Dados inválidos recebidos:", data);
        setEventos([]);
      }
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      setError("Erro ao carregar eventos");
      setEventos([]);
    } finally {
      setLoading(false);
    }
  };

  console.log("Rendering EventosTestPage, loading:", loading, "user:", user, "eventos:", eventos.length);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando eventos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchEventos}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Eventos (Teste) - User: {user?.nome || "N/A"}
        </h1>
        
        {eventos.length === 0 ? (
          <p className="text-gray-600">Nenhum evento encontrado.</p>
        ) : (
          <div className="space-y-4">
            {eventos.map((evento) => (
              <div key={evento.id} className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold">{evento.nome}</h2>
                <p className="text-gray-600">{evento.descricao}</p>
                <p className="text-sm text-gray-500">
                  Local: {evento.local} | Status: {evento.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
