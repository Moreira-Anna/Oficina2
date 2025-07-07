"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Calendar,
  MapPin,
  Users,
  Search,
  Edit,
  Trash2,
  Loader2,
  Clock,
  User,
  X,
} from "lucide-react";
import { Evento } from "@/types";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [termoBusca, setTermoBusca] = useState<string>("");
  const [modalAberto, setModalAberto] = useState(false);
  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [inscricoes, setInscricoes] = useState<Record<string, boolean>>({});
  const [carregandoInscricao, setCarregandoInscricao] = useState<Record<string, boolean>>({});
  const { user } = useAuth();
  const isSupervisor = user?.cargo === 'supervisor';

  useEffect(() => {
    const buscarInscricoes = async () => {
      if (!user || user.cargo === 'supervisor') return;

      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/inscricoes", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const inscricoesMap: Record<string, boolean> = {};
            data.data.forEach((inscricao: {eventoId: string}) => {
              inscricoesMap[inscricao.eventoId] = true;
            });
            setInscricoes(inscricoesMap);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar inscrições:", error);
      }
    };

    if (user) {
      fetchEventos();
      buscarInscricoes();
    }
  }, [user]);

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
      } else {
        console.error("Dados inválidos recebidos:", data);
        setEventos([]);
      }
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      alert("Erro ao carregar eventos");
      setEventos([]);
    } finally {
      setLoading(false);
    }
  };

  const inscreverEvento = async (eventoId: string) => {
    try {
      setCarregandoInscricao(prev => ({ ...prev, [eventoId]: true }));
      const token = localStorage.getItem("token");
      
      const response = await fetch("/api/inscricoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ eventoId }),
      });

      const data = await response.json();
      
      if (data.success) {
        setInscricoes(prev => ({ ...prev, [eventoId]: true }));
        alert("Inscrição realizada com sucesso!");
      } else {
        alert(data.error || "Erro ao se inscrever no evento");
      }
    } catch (error) {
      console.error("Erro ao se inscrever:", error);
      alert("Erro ao se inscrever no evento");
    } finally {
      setCarregandoInscricao(prev => ({ ...prev, [eventoId]: false }));
    }
  };

  const cancelarInscricao = async (eventoId: string) => {
    if (!confirm("Tem certeza que deseja cancelar sua inscrição neste evento?")) {
      return;
    }

    try {
      setCarregandoInscricao(prev => ({ ...prev, [eventoId]: true }));
      const token = localStorage.getItem("token");
      
      // Primeiro, buscar a inscrição do usuário para este evento
      const inscricoesResponse = await fetch("/api/inscricoes", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (inscricoesResponse.ok) {
        const inscricoesData = await inscricoesResponse.json();
        const inscricao = inscricoesData.data.find((i: {eventoId: string, id: string}) => i.eventoId === eventoId);
        
        if (inscricao) {
          const response = await fetch(`/api/inscricoes/${inscricao.id}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });

          const data = await response.json();
          
          if (data.success) {
            setInscricoes(prev => ({ ...prev, [eventoId]: false }));
            alert("Inscrição cancelada com sucesso!");
          } else {
            alert(data.error || "Erro ao cancelar inscrição");
          }
        }
      }
    } catch (error) {
      console.error("Erro ao cancelar inscrição:", error);
      alert("Erro ao cancelar inscrição");
    } finally {
      setCarregandoInscricao(prev => ({ ...prev, [eventoId]: false }));
    }
  };

  const alterarStatusEvento = async (eventoId: string, novoStatus: "planejado" | "em-andamento" | "finalizado") => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/eventos/${eventoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status: novoStatus }),
      });

      if (!response.ok) {
        throw new Error("Erro ao alterar status do evento");
      }

      const result = await response.json();
      
      if (result.success) {
        // Atualizar o evento na lista
        setEventos(Array.isArray(eventos) ? eventos.map(evento => 
          evento.id === eventoId ? { ...evento, status: novoStatus } : evento
        ) : []);
        alert(`Status do evento alterado para "${getStatusLabel(novoStatus)}" com sucesso!`);
      } else {
        alert(result.error || "Erro ao alterar status do evento");
      }
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      alert("Erro ao alterar status do evento");
    }
  };

  const eventosFiltrados = Array.isArray(eventos) ? eventos.filter((evento) => {
    const matchStatus =
      filtroStatus === "todos" || evento.status === filtroStatus;
    const matchBusca =
      evento.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      evento.local.toLowerCase().includes(termoBusca.toLowerCase()) ||
      evento.organizador.toLowerCase().includes(termoBusca.toLowerCase());
    return matchStatus && matchBusca;
  }) : [];

  const abrirModal = (evento?: Evento) => {
    setEventoEditando(evento || null);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setEventoEditando(null);
  };

  const excluirEvento = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este evento?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/eventos/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao excluir evento");
        }

        setEventos(Array.isArray(eventos) ? eventos.filter((evento) => evento.id !== id) : []);
        alert("Evento excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir evento:", error);
        alert("Erro ao excluir evento");
      }
    }
  };

  const salvarEvento = async (dadosEvento: {
    nome: string;
    descricao: string;
    data: Date;
    local: string;
    organizador: string;
    status: string;
    jogoIds?: string[];
    salas: { nome: string; capacidade: number }[];
  }) => {
    try {
      setSalvando(true);
      const token = localStorage.getItem("token");
      const url = eventoEditando ? `/api/eventos/${eventoEditando.id}` : "/api/eventos";
      const method = eventoEditando ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(dadosEvento),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar evento");
      }

      const result = await response.json();
      const eventoSalvo = result.data || result;

      if (eventoEditando) {
        setEventos(Array.isArray(eventos) ? eventos.map(evento => 
          evento.id === eventoEditando.id ? eventoSalvo : evento
        ) : [eventoSalvo]);
        alert("Evento atualizado com sucesso!");
      } else {
        setEventos(Array.isArray(eventos) ? [...eventos, eventoSalvo] : [eventoSalvo]);
        alert("Evento criado com sucesso!");
      }

      fecharModal();
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
      alert("Erro ao salvar evento");
    } finally {
      setSalvando(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planejado":
        return "bg-blue-100 text-blue-800";
      case "em-andamento":
        return "bg-yellow-100 text-yellow-800";
      case "finalizado":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "planejado":
        return "Planejado";
      case "em-andamento":
        return "Em Andamento";
      case "finalizado":
        return "Finalizado";
      default:
        return status;
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          {isSupervisor ? "Gerenciar Eventos" : "Eventos"}
        </h1>
        {isSupervisor && (
          <button
            onClick={() => abrirModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Evento</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar Eventos
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                placeholder="Buscar por nome, local ou organizador..."
                className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os Status</option>
              <option value="planejado">Planejado</option>
              <option value="em-andamento">Em Andamento</option>
              <option value="finalizado">Finalizado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Carregando eventos...</span>
          </div>
        ) : eventosFiltrados.length > 0 ? (
          eventosFiltrados.map((evento) => (
          <div
            key={evento.id}
            className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                      {evento.nome}
                    </h3>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        evento.status
                      )}`}
                    >
                      {getStatusLabel(evento.status)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{evento.descricao}</p>
                </div>
                {isSupervisor && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Dropdown para alterar status */}
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Status:</label>
                      <select
                        value={evento.status}
                        onChange={(e) => alterarStatusEvento(evento.id, e.target.value as "planejado" | "em-andamento" | "finalizado")}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="planejado">Planejado</option>
                        <option value="em-andamento">Em Andamento</option>
                        <option value="finalizado">Finalizado</option>
                      </select>
                    </div>
                    {/* Botões de ação */}
                    <div className="flex space-x-1">
                      <button
                        onClick={() => abrirModal(evento)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Editar evento"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => excluirEvento(evento.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Excluir evento"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
                {!isSupervisor && (
                  <div className="flex space-x-2">
                    {inscricoes[evento.id] ? (
                      <button
                        onClick={() => cancelarInscricao(evento.id)}
                        disabled={carregandoInscricao[evento.id]}
                        className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {carregandoInscricao[evento.id] ? "Cancelando..." : "Cancelar Inscrição"}
                      </button>
                    ) : (
                      <button
                        onClick={() => inscreverEvento(evento.id)}
                        disabled={carregandoInscricao[evento.id]}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {carregandoInscricao[evento.id] ? "Inscrevendo..." : "Inscrever-se"}
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 text-sm">
                <div className="flex items-center text-gray-500">
                  <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">
                    {new Date(evento.data).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div className="flex items-center text-gray-500">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{evento.local}</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Org: {evento.organizador}</span>
                </div>
              </div>

              {evento.salas && evento.salas.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Salas ({evento.salas.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {evento.salas.map((sala) => (
                      <div
                        key={sala.id}
                        className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg"
                      >
                        <span className="font-medium">{sala.nome}</span>
                        <span className="ml-2 text-xs text-gray-500">
                          (Cap: {sala.capacidade})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!isSupervisor && (
                <div className="mt-4">
                  {carregandoInscricao[evento.id] ? (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  ) : inscricoes[evento.id] ? (
                    <button
                      onClick={() => cancelarInscricao(evento.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Cancelar Inscrição
                    </button>
                  ) : (
                    <button
                      onClick={() => inscreverEvento(evento.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Inscrever-se
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">
              Nenhum evento encontrado
            </div>
            <p className="text-gray-500">
              Tente ajustar os filtros ou adicionar um novo evento.
            </p>
          </div>
        )}
      </div>

      {modalAberto && (
        <EventoModal
          evento={eventoEditando}
          onSalvar={salvarEvento}
          onFechar={fecharModal}
          salvando={salvando}
        />
      )}
    </div>
    </ProtectedRoute>
  );
}

// Componente Modal para Eventos
interface EventoModalProps {
  evento: Evento | null;
  onSalvar: (dados: {
    nome: string;
    descricao: string;
    data: Date;
    local: string;
    organizador: string;
    status: string;
    jogoIds?: string[];
    salas: { nome: string; capacidade: number }[];
  }) => void;
  onFechar: () => void;
  salvando: boolean;
}

function EventoModal({ evento, onSalvar, onFechar, salvando }: EventoModalProps) {
  const [formData, setFormData] = useState({
    nome: evento?.nome || "",
    descricao: evento?.descricao || "",
    data: evento?.data ? new Date(evento.data).toISOString().split("T")[0] : "",
    local: evento?.local || "",
    organizador: evento?.organizador || "",
    status: evento?.status || "planejado",
    jogoIds: [] as string[],
    salas: [] as { nome: string; capacidade: number }[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.data || !formData.local || !formData.organizador) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    if (!formData.salas || formData.salas.length === 0) {
      alert("É obrigatório informar pelo menos uma sala para o evento");
      return;
    }

    const salasValidas = formData.salas.every(sala => 
      sala.nome && sala.nome.trim().length > 0 && sala.capacidade && sala.capacidade > 0
    );

    if (!salasValidas) {
      alert("Todas as salas devem ter nome e capacidade válidos");
      return;
    }
    
    onSalvar({
      ...formData,
      data: new Date(formData.data),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {evento ? "Editar Evento" : "Novo Evento"}
            </h2>
            <button
              onClick={onFechar}
              className="text-gray-400 hover:text-gray-600 p-1"
              disabled={salvando}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Evento *
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Festival de Jogos de Verão"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descrição do evento..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data do Evento *
                </label>
                <input
                  type="date"
                  name="data"
                  value={formData.data}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Local *
                </label>
                <input
                  type="text"
                  name="local"
                  value={formData.local}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Centro Cultural"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organizador *
                </label>
                <input
                  type="text"
                  name="organizador"
                  value={formData.organizador}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Equipe Lúdica"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="planejado">Planejado</option>
                  <option value="em-andamento">Em Andamento</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jogos do Evento
              </label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                <JogoSelector 
                  jogosSelecionados={formData.jogoIds || []}
                  onJogosChange={(jogoIds: string[]) => setFormData({...formData, jogoIds})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salas do Evento *
              </label>
              <div className="border border-gray-300 rounded-lg p-3">
                <SalaManager 
                  salas={formData.salas || []}
                  onSalasChange={(salas: { nome: string; capacidade: number }[]) => setFormData({...formData, salas})}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
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
                {salvando ? "Salvando..." : (evento ? "Salvar Alterações" : "Criar Evento")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Componente para seleção de jogos
interface JogoSelectorProps {
  jogosSelecionados: string[];
  onJogosChange: (jogoIds: string[]) => void;
}

function JogoSelector({ jogosSelecionados, onJogosChange }: JogoSelectorProps) {
  const [jogos, setJogos] = useState<{
    id: string;
    nome: string;
    categoria: string;
    descricao: string;
    duracaoMedia: number;
    minJogadores: number;
    maxJogadores: number;
  }[]>([]);
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    fetchJogos();
  }, []);

  const fetchJogos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/jogos", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setJogos(data.data || []);
      }
    } catch (error) {
      console.error("Erro ao buscar jogos:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleJogo = (jogoId: string) => {
    if (jogosSelecionados.includes(jogoId)) {
      onJogosChange(jogosSelecionados.filter(id => id !== jogoId));
    } else {
      onJogosChange([...jogosSelecionados, jogoId]);
    }
  };

  const jogosFiltrados = jogos.filter(jogo =>
    jogo.nome.toLowerCase().includes(busca.toLowerCase()) ||
    jogo.categoria.toLowerCase().includes(busca.toLowerCase())
  );

  const jogosSelecionadosDetalhes = jogos.filter(jogo => 
    jogosSelecionados.includes(jogo.id)
  );

  const duracaoTotal = jogosSelecionadosDetalhes.reduce((total, jogo) => 
    total + jogo.duracaoMedia, 0
  );

  const participantesMinimos = jogosSelecionadosDetalhes.reduce((max, jogo) => 
    Math.max(max, jogo.minJogadores), 0
  );

  const participantesMaximos = jogosSelecionadosDetalhes.reduce((sum, jogo) => 
    sum + jogo.maxJogadores, 0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-gray-600">Carregando jogos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar jogos..."
          className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Resumo dos jogos selecionados */}
      {jogosSelecionados.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-3">
          <h4 className="font-medium text-blue-900 mb-2">Resumo dos Jogos Selecionados</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center text-blue-700">
              <Clock className="h-4 w-4 mr-1" />
              <span>Duração total: {duracaoTotal} min</span>
            </div>
            <div className="flex items-center text-blue-700">
              <User className="h-4 w-4 mr-1" />
              <span>Participantes: {participantesMinimos}-{participantesMaximos}</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex flex-wrap gap-1">
              {jogosSelecionadosDetalhes.map(jogo => (
                <span
                  key={jogo.id}
                  className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs"
                >
                  {jogo.nome}
                  <button
                    onClick={() => toggleJogo(jogo.id)}
                    className="ml-1 hover:text-blue-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lista de jogos */}
      <div className="max-h-48 overflow-y-auto">
        {jogosFiltrados.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            {busca ? "Nenhum jogo encontrado" : "Nenhum jogo disponível"}
          </p>
        ) : (
          <div className="space-y-2">
            {jogosFiltrados.map(jogo => (
              <div
                key={jogo.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  jogosSelecionados.includes(jogo.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => toggleJogo(jogo.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h5 className="font-medium text-gray-900">{jogo.nome}</h5>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {jogo.categoria}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{jogo.descricao}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {jogo.duracaoMedia} min
                      </span>
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {jogo.minJogadores}-{jogo.maxJogadores} jogadores
                      </span>
                    </div>
                  </div>
                  <div className="ml-2">
                    <input
                      type="checkbox"
                      checked={jogosSelecionados.includes(jogo.id)}
                      onChange={() => toggleJogo(jogo.id)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para gerenciar salas do evento
interface SalaManagerProps {
  salas: { nome: string; capacidade: number }[];
  onSalasChange: (salas: { nome: string; capacidade: number }[]) => void;
}

function SalaManager({ salas, onSalasChange }: SalaManagerProps) {
  const [novaSala, setNovaSala] = useState({
    nome: "",
    capacidade: 0,
  });

  const adicionarSala = () => {
    if (!novaSala.nome.trim()) {
      alert("Por favor, informe o nome da sala");
      return;
    }
    
    if (novaSala.capacidade <= 0) {
      alert("A capacidade deve ser maior que zero");
      return;
    }

    if (salas.some(sala => sala.nome.toLowerCase() === novaSala.nome.toLowerCase())) {
      alert("Já existe uma sala com esse nome");
      return;
    }

    onSalasChange([...salas, { ...novaSala, nome: novaSala.nome.trim() }]);
    setNovaSala({ nome: "", capacidade: 0 });
  };

  const removerSala = (index: number) => {
    onSalasChange(salas.filter((_, i) => i !== index));
  };

  const capacidadeTotal = salas.reduce((total, sala) => total + sala.capacidade, 0);

  return (
    <div className="space-y-4">
      {/* Lista de salas adicionadas */}
      {salas.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Salas adicionadas ({salas.length})</h4>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="grid grid-cols-1 gap-2 mb-3">
              {salas.map((sala, index) => (
                <div key={index} className="flex items-center justify-between bg-white rounded-md p-2 border">
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">{sala.nome}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      (Capacidade: {sala.capacidade})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removerSala(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Remover sala"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-600 flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>Capacidade total: {capacidadeTotal} pessoas</span>
            </div>
          </div>
        </div>
      )}

      {/* Formulário para adicionar nova sala */}
      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-3">Adicionar Nova Sala</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Sala *
            </label>
            <input
              type="text"
              value={novaSala.nome}
              onChange={(e) => setNovaSala({ ...novaSala, nome: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Sala Principal, Auditório..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacidade *
            </label>
            <input
              type="number"
              value={novaSala.capacidade || ""}
              onChange={(e) => setNovaSala({ ...novaSala, capacidade: parseInt(e.target.value) || 0 })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 30"
              min="1"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={adicionarSala}
          className="mt-3 flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm transition-colors"
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar Sala
        </button>
      </div>

      {salas.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">Nenhuma sala adicionada ainda</p>
          <p className="text-xs">É obrigatório adicionar pelo menos uma sala</p>
        </div>
      )}
    </div>
  );
}
