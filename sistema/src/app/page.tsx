"use client";

import { useState, useEffect } from "react";
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
import { GamepadIcon, Users, Calendar, TrendingUp, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface EstatisticasGerais {
  totalJogos: number;
  totalEventos: number;
  totalParticipantes: number;
  totalRegistros: number;
}

interface JogoPopular {
  jogo: {
    id: string;
    nome: string;
    categoria: string;
    duracaoMedia: number;
  };
  totalPartidas: number;
  totalParticipantes: number;
  mediaParticipantes: number;
  popularidade: number;
}

interface EventoRecente {
  id: string;
  nome: string;
  data: string;
  local: string;
  status: string;
  totalParticipantes: number;
}

export default function Dashboard() {
  const { user, isSupervisor } = useAuth();
  const [estatisticas, setEstatisticas] = useState<EstatisticasGerais | null>(null);
  const [jogosPopulares, setJogosPopulares] = useState<JogoPopular[]>([]);
  const [eventosRecentes, setEventosRecentes] = useState<EventoRecente[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTempo, setFiltroTempo] = useState<
    "hoje" | "semana" | "mes" | "ano" | "todos"
  >("mes");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        const data = await response.json();
        
        if (data.success) {
          setEstatisticas(data.data.estatisticasGerais);
          setJogosPopulares(data.data.jogosPopulares);
          setEventosRecentes(data.data.eventosRecentes);
        }
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const dadosGraficoBarras = jogosPopulares.slice(0, 5).map((stat) => ({
    nome: stat.jogo.nome.length > 10 ? stat.jogo.nome.substring(0, 10) + "..." : stat.jogo.nome,
    partidas: stat.totalPartidas,
    participantes: stat.totalParticipantes,
  }));

  const dadosGraficoPizza = jogosPopulares.slice(0, 5).map((stat) => ({
    name: stat.jogo.nome,
    value: stat.popularidade,
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const jogoMaisPopular = jogosPopulares[0];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bem-vindo, {user?.nome}!
          </h1>
          <p className="text-gray-600 mt-1">
            {isSupervisor ? "Painel de Controle do Supervisor" : "Seu Dashboard de Atividades"}
          </p>
        </div>
        
        {isSupervisor && (
          <div className="flex items-center space-x-2">
            <label htmlFor="filtro-tempo" className="text-sm font-medium text-gray-700">
              Período:
            </label>
            <select
              id="filtro-tempo"
              value={filtroTempo}
              onChange={(e) => setFiltroTempo(e.target.value as "hoje" | "semana" | "mes" | "ano" | "todos")}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="hoje">Hoje</option>
              <option value="semana">Esta Semana</option>
              <option value="mes">Este Mês</option>
              <option value="ano">Este Ano</option>
              <option value="todos">Todos</option>
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GamepadIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Jogos Disponíveis
              </p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                {estatisticas?.totalJogos || 0}
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
                {estatisticas?.totalParticipantes || 0}
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
                Eventos Realizados
              </p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                {estatisticas?.totalEventos || 0}
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
                Jogos Realizados
              </p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                {estatisticas?.totalRegistros || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {jogoMaisPopular && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-sm text-white p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">
                🏆 Jogo Mais Popular
              </h3>
              <p className="text-2xl sm:text-3xl font-bold">
                {jogoMaisPopular.jogo.nome}
              </p>
              <p className="text-blue-100 mt-2">
                {jogoMaisPopular.totalPartidas} partidas • {jogoMaisPopular.totalParticipantes} participantes
              </p>
            </div>
            <div className="hidden sm:block">
              <Trophy className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-300" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Jogos Mais Populares
          </h3>
          {dadosGraficoBarras.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosGraficoBarras}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="partidas" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Nenhum dado disponível
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribuição de Popularidade
          </h3>
          {dadosGraficoPizza.length > 0 ? (
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
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Nenhum dado disponível
            </div>
          )}
        </div>
      </div>

      {eventosRecentes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Eventos Recentes
          </h3>
          <div className="space-y-3">
            {eventosRecentes.slice(0, 5).map((evento) => (
              <div
                key={evento.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{evento.nome}</p>
                    <p className="text-sm text-gray-500">
                      {evento.local} • {new Date(evento.data).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    evento.status === 'finalizado' ? 'bg-green-100 text-green-800' :
                    evento.status === 'em-andamento' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {evento.status}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    {evento.totalParticipantes} participantes
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
