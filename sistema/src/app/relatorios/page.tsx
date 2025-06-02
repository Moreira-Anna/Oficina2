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
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  Download,
  Filter,
  TrendingUp,
  Users,
  Clock,
  Trophy,
} from "lucide-react";
import {
  estatisticasJogosMock,
  eventosMock,
  registrosJogoMock,
} from "@/data/mockData";

export default function RelatoriosPage() {
  const [filtroTempo, setFiltroTempo] = useState<
    "semana" | "mes" | "trimestre" | "ano"
  >("mes");
  const [eventoSelecionado, setEventoSelecionado] = useState<string>("todos");

  // Dados para gráfico de barras - Jogos mais populares
  const dadosJogosPopulares = estatisticasJogosMock.map((stat) => ({
    nome:
      stat.jogo.nome.length > 10
        ? stat.jogo.nome.substring(0, 10) + "..."
        : stat.jogo.nome,
    partidas: stat.totalPartidas,
    participantes: stat.totalParticipantes,
    popularidade: stat.popularidade,
  }));

  // Dados para gráfico de pizza - Distribuição por categoria
  const dadosCategoria = estatisticasJogosMock.reduce((acc, stat) => {
    const categoria = stat.jogo.categoria;
    acc[categoria] = (acc[categoria] || 0) + stat.totalPartidas;
    return acc;
  }, {} as Record<string, number>);

  const dadosPizzaCategoria = Object.entries(dadosCategoria).map(
    ([categoria, partidas]) => ({
      name: categoria,
      value: partidas,
    })
  );

  // Dados para gráfico de linha - Evolução temporal
  const dadosEvolucao = [
    { mes: "Jan", jogos: 12, participantes: 45 },
    { mes: "Fev", jogos: 18, participantes: 67 },
    { mes: "Mar", jogos: 25, participantes: 89 },
    { mes: "Abr", jogos: 22, participantes: 78 },
    { mes: "Mai", jogos: 30, participantes: 112 },
    { mes: "Jun", jogos: 35, participantes: 134 },
  ];

  // Dados para gráfico de área - Participação por faixa etária
  const dadosFaixaEtaria = [
    { faixa: "18-25", participantes: 25, porcentagem: 31 },
    { faixa: "26-35", participantes: 32, porcentagem: 40 },
    { faixa: "36-45", participantes: 18, porcentagem: 22 },
    { faixa: "46+", participantes: 5, porcentagem: 7 },
  ];

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];

  // Estatísticas gerais
  const totalJogosRealizados = registrosJogoMock.length;
  const totalParticipantesUnicos = new Set(
    registrosJogoMock.flatMap((r) => r.participantes.map((p) => p.id))
  ).size;
  const mediaParticipantesPorJogo = Math.round(
    registrosJogoMock.reduce(
      (acc, registro) => acc + registro.participantes.length,
      0
    ) / totalJogosRealizados
  );
  const jogoMaisPopular = estatisticasJogosMock[0];

  const exportarRelatorio = () => {
    alert("Funcionalidade de exportação seria implementada aqui");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Relatórios e Estatísticas
            </h1>
            <button
              onClick={exportarRelatorio}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Exportar Relatório</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Filter className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Período
                  </label>
                  <select
                    value={filtroTempo}
                    onChange={(e) =>
                      setFiltroTempo(
                        e.target.value as "semana" | "mes" | "trimestre" | "ano"
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <option value="semana">Última Semana</option>
                    <option value="mes">Último Mês</option>
                    <option value="trimestre">Último Trimestre</option>
                    <option value="ano">Último Ano</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Evento
                  </label>
                  <select
                    value={eventoSelecionado}
                    onChange={(e) => setEventoSelecionado(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <option value="todos">Todos os Eventos</option>
                    {eventosMock.map((evento) => (
                      <option key={evento.id} value={evento.id}>
                        {evento.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Jogos Realizados
                  </p>
                  <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                    {totalJogosRealizados}
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
                    Participantes Únicos
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
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Média por Jogo
                  </p>
                  <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                    {mediaParticipantesPorJogo}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Tempo Médio
                  </p>
                  <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                    {jogoMaisPopular.tempoMedioJogo}min
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Jogos Mais Populares
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosJogosPopulares}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="partidas" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Distribuição por Categoria
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosPizzaCategoria}
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
                    {dadosPizzaCategoria.map((entry, index) => (
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

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Evolução Mensal
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosEvolucao}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="jogos"
                    stroke="#3B82F6"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="participantes"
                    stroke="#10B981"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Participação por Faixa Etária
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dadosFaixaEtaria}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="faixa" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="participantes"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Ranking dos Jogos
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posição
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jogo
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Categoria
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Partidas
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Participantes
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Tempo Médio
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Popularidade
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {estatisticasJogosMock.map((stat, index) => (
                    <tr
                      key={stat.jogo.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                              index === 0
                                ? "bg-yellow-100 text-yellow-800"
                                : index === 1
                                ? "bg-gray-100 text-gray-800"
                                : index === 2
                                ? "bg-orange-100 text-orange-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900">
                        <div className="truncate max-w-[150px]">
                          {stat.jogo.nome}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">
                        {stat.jogo.categoria}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">
                        {stat.totalPartidas}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                        {stat.totalParticipantes}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                        {stat.tempoMedioJogo} min
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-2 max-w-[80px]">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${stat.popularidade}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500 whitespace-nowrap">
                            {stat.popularidade}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
