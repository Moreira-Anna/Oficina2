"use client";

import { useState } from "react";
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
import {
  participantesMock,
  registrosJogoMock,
  estatisticasJogosMock,
} from "@/data/mockData";
import { Participante } from "@/types";

export default function ParticipantesPage() {
  const [participantes, setParticipantes] =
    useState<Participante[]>(participantesMock);
  const [termoBusca, setTermoBusca] = useState<string>("");
  const [modalAberto, setModalAberto] = useState(false);
  const [participanteEditando, setParticipanteEditando] =
    useState<Participante | null>(null);

  const participantesFiltrados = participantes.filter((participante) => {
    const matchBusca =
      participante.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      participante.email.toLowerCase().includes(termoBusca.toLowerCase());
    return matchBusca;
  });

  const abrirModal = (participante?: Participante) => {
    setParticipanteEditando(participante || null);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setParticipanteEditando(null);
  };

  const excluirParticipante = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este participante?")) {
      setParticipantes(
        participantes.filter((participante) => participante.id !== id)
      );
    }
  };

  const getEstatisticasParticipante = (participanteId: string) => {
    const registros = registrosJogoMock.filter((registro) =>
      registro.participantes.some((p) => p.id === participanteId)
    );

    const jogosUnicos = new Set(registros.map((r) => r.jogoId));
    const jogoMaisJogado = registros.reduce((acc, registro) => {
      acc[registro.jogoId] = (acc[registro.jogoId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const jogoMaisJogadoId = Object.entries(jogoMaisJogado).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0];

    const nomeJogoMaisJogado = jogoMaisJogadoId
      ? estatisticasJogosMock.find((j) => j.jogo.id === jogoMaisJogadoId)?.jogo
          .nome
      : "Nenhum";

    return {
      totalJogos: registros.length,
      jogosUnicos: jogosUnicos.size,
      jogoMaisJogado: nomeJogoMaisJogado || "Nenhum",
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Gerenciar Participantes
            </h1>
            <button
              onClick={() => abrirModal()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Participante</span>
            </button>
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
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {participantesFiltrados.map((participante) => {
                  const stats = getEstatisticasParticipante(participante.id);
                  return (
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
                          <div>{stats.totalJogos} jogos participados</div>
                          <div className="text-xs text-gray-500">
                            {stats.jogosUnicos} jogos diferentes
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            Favorito: {stats.jogoMaisJogado}
                          </div>
                        </div>
                      </td>
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {participantesFiltrados.length === 0 && (
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {participanteEditando
                    ? "Editar Participante"
                    : "Novo Participante"}
                </h2>
                <button
                  onClick={fecharModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    defaultValue={participanteEditando?.nome}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="Ex: João Silva"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={participanteEditando?.email}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="joao@email.com"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Idade
                    </label>
                    <input
                      type="number"
                      defaultValue={participanteEditando?.idade}
                      min="1"
                      max="120"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      placeholder="25"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone (opcional)
                    </label>
                    <input
                      type="tel"
                      defaultValue={participanteEditando?.telefone}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6">
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
                    {participanteEditando
                      ? "Salvar Alterações"
                      : "Criar Participante"}
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
