"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface Evento {
  id: string;
  nome: string;
  descricao: string;
  local: string;
  data: string;
  status: string;
  organizador: string;
}

export default function EventosDirectPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, isLoading: authLoading } = useAuth();

  console.log("EventosDirectPage - authLoading:", authLoading, "user:", user);

  useEffect(() => {
    if (!authLoading && !user) {
      setError("Usuário não autenticado");
      setLoading(false);
      return;
    }

    if (user) {
      fetchEventos();
    }
  }, [user, authLoading]);

  const fetchEventos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      console.log("Fetching eventos with token:", token ? "exists" : "missing");
      
      const response = await fetch("/api/eventos", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log("Eventos data:", data);
      
      if (data.success && Array.isArray(data.data)) {
        setEventos(data.data);
      } else {
        setError("Dados inválidos recebidos");
      }
    } catch (err) {
      console.error("Erro ao buscar eventos:", err);
      setError("Erro ao carregar eventos: " + (err instanceof Error ? err.message : "Erro desconhecido"));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>{authLoading ? "Autenticando..." : "Carregando eventos..."}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Eventos Diretos - {user?.nome}
        </h1>
        
        {eventos.length === 0 ? (
          <p className="text-gray-600">Nenhum evento encontrado.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {eventos.map((evento) => (
              <div key={evento.id} className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-2">{evento.nome}</h2>
                <p className="text-gray-600 mb-4">{evento.descricao}</p>
                <div className="space-y-2 text-sm">
                  <p><strong>Local:</strong> {evento.local}</p>
                  <p><strong>Data:</strong> {new Date(evento.data).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> {evento.status}</p>
                  <p><strong>Organizador:</strong> {evento.organizador}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
