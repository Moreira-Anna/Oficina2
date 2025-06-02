"use client";

import { useState } from "react";
import {
  Plus,
  Calendar,
  MapPin,
  Users,
  Search,
  Edit,
  Trash2,
} from "lucide-react";
import { eventosMock } from "@/data/mockData";
import { Evento } from "@/types";

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>(eventosMock);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [termoBusca, setTermoBusca] = useState<string>("");
  const [modalAberto, setModalAberto] = useState(false);
  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null);

  const eventosFiltrados = eventos.filter((evento) => {
    const matchStatus =
      filtroStatus === "todos" || evento.status === filtroStatus;
    const matchBusca =
      evento.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      evento.local.toLowerCase().includes(termoBusca.toLowerCase()) ||
      evento.organizador.toLowerCase().includes(termoBusca.toLowerCase());
    return matchStatus && matchBusca;
  });

  const abrirModal = (evento?: Evento) => {
    setEventoEditando(evento || null);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setEventoEditando(null);
  };

  const excluirEvento = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este evento?")) {
      setEventos(eventos.filter((evento) => evento.id !== id));
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
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Gerenciar Eventos
        </h1>
        <button
          onClick={() => abrirModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Evento</span>
        </button>
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
        {eventosFiltrados.map((evento) => (
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
                <div className="flex space-x-1">
                  <button
                    onClick={() => abrirModal(evento)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => excluirEvento(evento.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 text-sm">
                <div className="flex items-center text-gray-500">
                  <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">
                    {evento.data.toLocaleDateString("pt-BR")}
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
            </div>
          </div>
        ))}
      </div>

      {eventosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">
            Nenhum evento encontrado
          </div>
          <p className="text-gray-500">
            Tente ajustar os filtros ou adicionar um novo evento.
          </p>
        </div>
      )}

      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {eventoEditando ? "Editar Evento" : "Novo Evento"}
                </h2>
                <button
                  onClick={fecharModal}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  ✕
                </button>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Evento
                  </label>
                  <input
                    type="text"
                    defaultValue={eventoEditando?.nome}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Festival de Jogos de Verão"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    defaultValue={eventoEditando?.descricao}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descrição do evento..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data do Evento
                    </label>
                    <input
                      type="date"
                      defaultValue={
                        eventoEditando?.data.toISOString().split("T")[0]
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Local
                    </label>
                    <input
                      type="text"
                      defaultValue={eventoEditando?.local}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Centro Cultural"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organizador
                    </label>
                    <input
                      type="text"
                      defaultValue={eventoEditando?.organizador}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Equipe Lúdica"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      defaultValue={eventoEditando?.status}
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
                    Salas do Evento
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Nome da sala, Capacidade (ex: Sala Azul, 20)"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      className="text-blue-600 text-sm hover:text-blue-700"
                    >
                      + Adicionar Sala
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
                  <button
                    type="button"
                    onClick={fecharModal}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {eventoEditando ? "Salvar Alterações" : "Criar Evento"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
