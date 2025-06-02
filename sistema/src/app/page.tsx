"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { GamepadIcon, Users, Calendar, TrendingUp, Plus } from "lucide-react";
import {
  estatisticasJogosMock,
  eventosMock,
  registrosJogoMock,
} from "@/data/mockData";

export default function Dashboard() {
  const [filtroTempo, setFiltroTempo] = useState<
    "hoje" | "semana" | "mes" | "ano" | "todos"
  >("mes");

  const dadosGraficoBarras = estatisticasJogosMock.map((stat) => ({
    nome: stat.jogo.nome,
    partidas: stat.totalPartidas,
    participantes: stat.totalParticipantes,
  }));

  const dadosGraficoPizza = estatisticasJogosMock.map((stat) => ({
    name: stat.jogo.nome,
    value: stat.popularidade,
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const totalJogos = registrosJogoMock.length;
  const totalParticipantesUnicos = new Set(
    registrosJogoMock.flatMap((r) => r.participantes.map((p) => p.id))
  ).size;
  const totalEventos = eventosMock.length;
  const jogoMaisPopular = estatisticasJogosMock[0];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Dashboard
        </h2>
        <div className="flex flex-wrap gap-2">
          {["hoje", "semana", "mes", "ano", "todos"].map((periodo) => (
            <button
              key={periodo}
              onClick={() =>
                setFiltroTempo(
                  periodo as "hoje" | "semana" | "mes" | "ano" | "todos"
                )
              }
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroTempo === periodo
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GamepadIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Total de Jogos
              </p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                {totalJogos}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Participantes
              </p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                {totalParticipantesUnicos}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Eventos
              </p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                {totalEventos}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Mais Popular
              </p>
              <p className="text-sm sm:text-lg font-semibold text-gray-900">
                {jogoMaisPopular.jogo.nome}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Jogos Mais Jogados
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosGraficoBarras}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="partidas" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Popularidade dos Jogos
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dadosGraficoPizza}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dadosGraficoPizza.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              Jogos Recentes
            </h3>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 transition-colors">
              <Plus className="h-4 w-4" />
              <span>Novo Registro</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jogo
                </th>
                <th className="px-4 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evento
                </th>
                <th className="px-4 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participantes
                </th>
                <th className="px-4 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duração
                </th>
                <th className="px-4 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {registrosJogoMock.slice(0, 5).map((registro) => {
                const evento = eventosMock.find(
                  (e) => e.id === registro.eventoId
                );
                const duracao = registro.dataFim
                  ? Math.round(
                      (registro.dataFim.getTime() -
                        registro.dataInicio.getTime()) /
                        (1000 * 60)
                    )
                  : null;

                return (
                  <tr key={registro.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 sm:px-6 whitespace-nowrap text-sm font-medium text-gray-900">
                      {
                        estatisticasJogosMock.find(
                          (j) => j.jogo.id === registro.jogoId
                        )?.jogo.nome
                      }
                    </td>
                    <td className="px-4 py-4 sm:px-6 whitespace-nowrap text-sm text-gray-500">
                      {evento?.nome}
                    </td>
                    <td className="px-4 py-4 sm:px-6 whitespace-nowrap text-sm text-gray-500">
                      {registro.participantes.length} jogadores
                    </td>
                    <td className="px-4 py-4 sm:px-6 whitespace-nowrap text-sm text-gray-500">
                      {duracao ? `${duracao} min` : "Em andamento"}
                    </td>
                    <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          registro.dataFim
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {registro.dataFim ? "Finalizado" : "Em andamento"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
