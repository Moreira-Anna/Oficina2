"use client";

import { useState, useEffect } from "react";
import { Users, Calendar, MapPin, UserCheck, UserX, Loader2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

interface Inscricao {
  id: string;
  eventoId: string;
  participanteId: string;
  dataInscricao: string;
  status: string;
  participante: {
    id: string;
    nome: string;
    email: string;
    idade?: number;
    telefone?: string;
  };
}

interface Evento {
  id: string;
  nome: string;
  data: string;
  local: string;
  descricao: string;
  organizador: string;
  status: string;
}

export default function InscricoesPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [inscricoes, setInscricoes] = useState<Record<string, Inscricao[]>>({});
  const [loading, setLoading] = useState(true);
  const [eventoSelecionado, setEventoSelecionado] = useState<string>("");
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.cargo === 'supervisor') {
      fetchEventos();
    }
  }, [user]);

  useEffect(() => {
    if (eventoSelecionado) {
      fetchInscricoes(eventoSelecionado);
    }
  }, [eventoSelecionado]);

  const fetchEventos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/eventos", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar eventos");
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setEventos(data.data);
        if (data.data.length > 0) {
          setEventoSelecionado(data.data[0].id);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      alert("Erro ao carregar eventos");
    } finally {
      setLoading(false);
    }
  };

  const fetchInscricoes = async (eventoId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/inscricoes?eventoId=${eventoId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setInscricoes(prev => ({ ...prev, [eventoId]: data.data }));
        }
      }
    } catch (error) {
      console.error("Erro ao buscar inscrições:", error);
    }
  };

  const eventoAtual = eventos.find(e => e.id === eventoSelecionado);
  const inscricoesAtual = inscricoes[eventoSelecionado] || [];

  if (loading) {
    return (
      <ProtectedRoute requiredRole="supervisor">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-gray-600">Carregando...</span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="supervisor">
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Inscrições de Eventos
          </h1>
        </div>

        {eventos.length > 0 ? (
          <>
            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecionar Evento
                </label>
                <select
                  value={eventoSelecionado}
                  onChange={(e) => setEventoSelecionado(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {eventos.map((evento) => (
                    <option key={evento.id} value={evento.id}>
                      {evento.nome} - {new Date(evento.data).toLocaleDateString("pt-BR")}
                    </option>
                  ))}
                </select>
              </div>

              {eventoAtual && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {eventoAtual.nome}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(eventoAtual.data).toLocaleDateString("pt-BR")}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {eventoAtual.local}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {inscricoesAtual.length} inscritos
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{eventoAtual.descricao}</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 sm:p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Participantes Inscritos
                  </h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <UserCheck className="h-4 w-4" />
                    <span>{inscricoesAtual.length} total</span>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {inscricoesAtual.length > 0 ? (
                  <div className="space-y-4">
                    {inscricoesAtual.map((inscricao) => (
                      <div
                        key={inscricao.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {inscricao.participante.nome}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {inscricao.participante.email}
                            </p>
                            {inscricao.participante.telefone && (
                              <p className="text-sm text-gray-600">
                                Tel: {inscricao.participante.telefone}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="text-sm text-gray-500">
                              <div>Inscrito em:</div>
                              <div className="font-medium">
                                {new Date(inscricao.dataInscricao).toLocaleString("pt-BR")}
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                {inscricao.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <UserX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhuma inscrição encontrada
                    </h3>
                    <p className="text-gray-500">
                      Este evento ainda não possui participantes inscritos.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">
              Nenhum evento encontrado
            </div>
            <p className="text-gray-500">
              Crie eventos para visualizar as inscrições.
            </p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
