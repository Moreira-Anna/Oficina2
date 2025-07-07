"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Users, Clock, Tag } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

interface Jogo {
  id: string;
  nome: string;
  categoria: string;
  descricao: string;
  minJogadores: number;
  maxJogadores: number;
  duracaoMedia: number;
  material: string[];
  totalPartidas?: number;
  totalParticipantes?: number;
  createdAt: string;
  updatedAt: string;
}

export default function JogosPage() {
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [termoBusca, setTermoBusca] = useState<string>("");
  const [modalAberto, setModalAberto] = useState(false);
  const [jogoEditando, setJogoEditando] = useState<Jogo | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isSupervisor = user?.cargo === 'supervisor';

  // Carregar jogos da API
  useEffect(() => {
    fetchJogos();
  }, []);

  const fetchJogos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jogos');
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setJogos(data.data);
      } else {
        console.error('Erro ao carregar jogos:', data.error);
        setJogos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar jogos:', error);
      alert('Erro ao carregar jogos');
      setJogos([]);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (jogo?: Jogo) => {
    setJogoEditando(jogo || null);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setJogoEditando(null);
  };

  const salvarJogo = async (dadosJogo: {
    nome: string;
    categoria: string;
    descricao: string;
    minJogadores: number;
    maxJogadores: number;
    duracaoMedia: number;
    material: string[];
  }) => {
    try {
      setSalvando(true);
      const token = localStorage.getItem("token");
      const url = jogoEditando ? `/api/jogos/${jogoEditando.id}` : "/api/jogos";
      const method = jogoEditando ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(dadosJogo),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar jogo");
      }

      const jogoSalvo = await response.json();

      if (jogoEditando) {
        setJogos(Array.isArray(jogos) ? jogos.map(jogo => 
          jogo.id === jogoEditando.id ? jogoSalvo.data : jogo
        ) : [jogoSalvo.data]);
        alert("Jogo atualizado com sucesso!");
      } else {
        setJogos(Array.isArray(jogos) ? [...jogos, jogoSalvo.data] : [jogoSalvo.data]);
        alert("Jogo criado com sucesso!");
      }

      fecharModal();
    } catch (error) {
      console.error("Erro ao salvar jogo:", error);
      alert("Erro ao salvar jogo");
    } finally {
      setSalvando(false);
    }
  };

  const excluirJogo = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este jogo?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/jogos/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao excluir jogo");
        }

        setJogos(Array.isArray(jogos) ? jogos.filter((jogo) => jogo.id !== id) : []);
        alert("Jogo excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir jogo:", error);
        alert("Erro ao excluir jogo");
      }
    }
  };

  const categorias = Array.isArray(jogos) ? Array.from(new Set(jogos.map((jogo) => jogo.categoria))) : [];

  const jogosFiltrados = Array.isArray(jogos) ? jogos.filter((jogo) => {
    const matchCategoria =
      filtroCategoria === "todas" || jogo.categoria === filtroCategoria;
    const matchBusca =
      jogo.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      jogo.descricao.toLowerCase().includes(termoBusca.toLowerCase());
    return matchCategoria && matchBusca;
  }) : [];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {isSupervisor ? "Gerenciar Jogos" : "Jogos"}
              </h1>
              {isSupervisor && (
                <button
                  onClick={() => abrirModal()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Novo Jogo</span>
                </button>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar Jogos
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={termoBusca}
                      onChange={(e) => setTermoBusca(e.target.value)}
                      placeholder="Buscar por nome ou descrição..."
                      className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todas">Todas as Categorias</option>
                    {categorias.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {loading ? (
                <div className="col-span-full flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Carregando jogos...</span>
                </div>
              ) : jogosFiltrados.length > 0 ? (
                jogosFiltrados.map((jogo) => (
                  <div
                    key={jogo.id}
                    className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                  >
                    <div className="p-4 sm:p-6">
                      <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 truncate">
                    {jogo.nome}
                  </h3>
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    <Tag className="h-3 w-3 mr-1 flex-shrink-0" />
                    {jogo.categoria}
                  </span>
                </div>
                {isSupervisor && (
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => abrirModal(jogo)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => excluirJogo(jogo.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {jogo.descricao}
              </p>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>
                    {jogo.minJogadores} - {jogo.maxJogadores} jogadores
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{jogo.duracaoMedia} minutos</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm text-gray-500 mb-2">
                  Material necessário:
                </div>
                <div className="flex flex-wrap gap-1">
                  {(Array.isArray(jogo.material) ? jogo.material : []).slice(0, 3).map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                    >
                      {item}
                    </span>
                  ))}
                  {(Array.isArray(jogo.material) ? jogo.material : []).length > 3 && (
                    <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      +{(Array.isArray(jogo.material) ? jogo.material : []).length - 3} mais
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-400 text-lg mb-2">
                    Nenhum jogo encontrado
                  </div>
                  <p className="text-gray-500">
                    Tente ajustar os filtros ou adicionar um novo jogo.
                  </p>
                </div>
              )}
            </div>

            {modalAberto && (
              <JogoModal
                jogo={jogoEditando}
                onSalvar={salvarJogo}
                onFechar={fecharModal}
                salvando={salvando}
              />
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

// Componente Modal para Jogos
interface JogoModalProps {
  jogo: Jogo | null;
  onSalvar: (dados: {
    nome: string;
    categoria: string;
    descricao: string;
    minJogadores: number;
    maxJogadores: number;
    duracaoMedia: number;
    material: string[];
  }) => void;
  onFechar: () => void;
  salvando: boolean;
}

function JogoModal({ jogo, onSalvar, onFechar, salvando }: JogoModalProps) {
  const [formData, setFormData] = useState({
    nome: jogo?.nome || "",
    categoria: jogo?.categoria || "",
    descricao: jogo?.descricao || "",
    minJogadores: jogo?.minJogadores || 2,
    maxJogadores: jogo?.maxJogadores || 4,
    duracaoMedia: jogo?.duracaoMedia || 30,
    material: jogo?.material && Array.isArray(jogo.material) ? jogo.material.join(", ") : "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.categoria || !formData.descricao) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    onSalvar({
      ...formData,
      material: formData.material.split(",").map(item => item.trim()).filter(item => item),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {jogo ? "Editar Jogo" : "Novo Jogo"}
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
                Nome do Jogo *
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Uno"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria *
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="Cartas">Cartas</option>
                  <option value="Tabuleiro">Tabuleiro</option>
                  <option value="Estratégia">Estratégia</option>
                  <option value="Desenho">Desenho</option>
                  <option value="Educativo">Educativo</option>
                  <option value="Esporte">Esporte</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duração Média (min) *
                </label>
                <input
                  type="number"
                  name="duracaoMedia"
                  value={formData.duracaoMedia}
                  onChange={handleChange}
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 30"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descrição do jogo..."
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mín. Jogadores *
                </label>
                <input
                  type="number"
                  name="minJogadores"
                  value={formData.minJogadores}
                  onChange={handleChange}
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máx. Jogadores *
                </label>
                <input
                  type="number"
                  name="maxJogadores"
                  value={formData.maxJogadores}
                  onChange={handleChange}
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 8"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material Necessário
              </label>
              <input
                type="text"
                name="material"
                value={formData.material}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Baralho, Dados, Tabuleiro (separado por vírgulas)"
              />
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
                {salvando ? "Salvando..." : (jogo ? "Salvar Alterações" : "Criar Jogo")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
