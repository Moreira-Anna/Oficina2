"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  User,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Participante {
  id: string;
  nome: string;
  email: string;
  idade: number;
  telefone?: string;
  totalJogos?: number;
  jogosUnicos?: number;
  jogoMaisJogado?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ParticipantesPage() {
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [termoBusca, setTermoBusca] = useState<string>("");
  const [modalAberto, setModalAberto] = useState(false);
  const [participanteEditando, setParticipanteEditando] = useState<Participante | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isSupervisor = user?.cargo === 'supervisor';

  // Carregar participantes da API
  useEffect(() => {
    fetchParticipantes();
  }, []);

  const fetchParticipantes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/participantes');
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setParticipantes(data.data);
      } else {
        console.error('Erro ao carregar participantes:', data.error);
        setParticipantes([]);
      }
    } catch (error) {
      console.error('Erro ao carregar participantes:', error);
      alert('Erro ao carregar participantes');
      setParticipantes([]);
    } finally {
      setLoading(false);
    }
  };

  const participantesFiltrados = Array.isArray(participantes) ? participantes.filter((participante) => {
    const matchBusca =
      participante.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      participante.email.toLowerCase().includes(termoBusca.toLowerCase());
    return matchBusca;
  }) : [];

  const abrirModal = (participante?: Participante) => {
    setParticipanteEditando(participante || null);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setParticipanteEditando(null);
  };

  const salvarParticipante = async (dadosParticipante: {
    nome: string;
    email: string;
    idade: number;
    telefone?: string;
  }) => {
    try {
      setSalvando(true);
      const token = localStorage.getItem("token");
      const url = participanteEditando ? `/api/participantes/${participanteEditando.id}` : "/api/participantes";
      const method = participanteEditando ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(dadosParticipante),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar participante");
      }

      const participanteSalvo = await response.json();

      if (participanteEditando) {
        setParticipantes(Array.isArray(participantes) ? participantes.map(p => 
          p.id === participanteEditando.id ? participanteSalvo.data : p
        ) : [participanteSalvo.data]);
        alert("Participante atualizado com sucesso!");
      } else {
        setParticipantes(Array.isArray(participantes) ? [...participantes, participanteSalvo.data] : [participanteSalvo.data]);
        alert("Participante criado com sucesso!");
      }

      fecharModal();
    } catch (error) {
      console.error("Erro ao salvar participante:", error);
      alert("Erro ao salvar participante");
    } finally {
      setSalvando(false);
    }
  };

  const excluirParticipante = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este participante?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/participantes/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao excluir participante");
        }

        setParticipantes(Array.isArray(participantes) ? participantes.filter((p) => p.id !== id) : []);
        alert("Participante excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir participante:", error);
        alert("Erro ao excluir participante");
      }
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {isSupervisor ? "Gerenciar Participantes" : "Participantes"}
              </h1>
              {isSupervisor && (
                <button
                  onClick={() => abrirModal()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Novo Participante</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-8">
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Participantes
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  placeholder="Buscar por nome ou email..."
                  className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Carregando participantes...</span>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Participante
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Contato
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Idade
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Estatísticas
                      </th>
                      {isSupervisor && (
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {participantesFiltrados.map((participante) => (
                      <tr
                        key={participante.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-3 sm:ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {participante.nome}
                              </div>
                              <div className="text-xs text-gray-500 sm:hidden">
                                {participante.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-500">
                              <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate">
                                {participante.email}
                              </span>
                            </div>
                            {participante.telefone && (
                              <div className="flex items-center text-sm text-gray-500">
                                <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate">
                                  {participante.telefone}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {participante.idade} anos
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                          <div className="text-sm text-gray-900">
                            <div>{participante.totalJogos || 0} jogos participados</div>
                            <div className="text-xs text-gray-500">
                              {participante.jogosUnicos || 0} jogos diferentes
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              Favorito: {participante.jogoMaisJogado || "Nenhum"}
                            </div>
                          </div>
                        </td>
                        {isSupervisor && (
                          <td className="px-4 sm:px-6 py-4 text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => abrirModal(participante)}
                                className="text-blue-600 hover:text-blue-900 p-1 transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => excluirParticipante(participante.id)}
                                className="text-red-600 hover:text-red-900 p-1 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!loading && participantesFiltrados.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">
                Nenhum participante encontrado
              </div>
              <p className="text-gray-500">
                Tente ajustar os filtros ou adicionar um novo participante.
              </p>
            </div>
          )}
        </main>

        {modalAberto && (
          <ParticipanteModal
            participante={participanteEditando}
            onSalvar={salvarParticipante}
            onFechar={fecharModal}
            salvando={salvando}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

// Componente Modal para Participantes
interface ParticipanteModalProps {
  participante: Participante | null;
  onSalvar: (dados: {
    nome: string;
    email: string;
    idade: number;
    telefone?: string;
  }) => void;
  onFechar: () => void;
  salvando: boolean;
}

function ParticipanteModal({ participante, onSalvar, onFechar, salvando }: ParticipanteModalProps) {
  const [formData, setFormData] = useState({
    nome: participante?.nome || "",
    email: participante?.email || "",
    idade: participante?.idade || 18,
    telefone: participante?.telefone || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.email || !formData.idade) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    onSalvar({
      nome: formData.nome,
      email: formData.email,
      idade: formData.idade,
      telefone: formData.telefone || undefined,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {participante ? "Editar Participante" : "Novo Participante"}
            </h2>
            <button
              onClick={onFechar}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={salvando}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="Ex: João Silva"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="joao@email.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idade *
                </label>
                <input
                  type="number"
                  name="idade"
                  value={formData.idade}
                  onChange={handleChange}
                  min="1"
                  max="120"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="25"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone (opcional)
                </label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6">
              <button
                type="button"
                onClick={onFechar}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={salvando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={salvando}
              >
                {salvando ? "Salvando..." : (participante ? "Salvar Alterações" : "Criar Participante")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
