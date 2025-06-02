"use client";

import { useState } from "react";
import { Plus, Search, Edit, Trash2, Users, Clock, Tag } from "lucide-react";
import { jogosMock } from "@/data/mockData";
import { Jogo } from "@/types";

export default function JogosPage() {
  const [jogos, setJogos] = useState<Jogo[]>(jogosMock);
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [termoBusca, setTermoBusca] = useState<string>("");
  const [modalAberto, setModalAberto] = useState(false);
  const [jogoEditando, setJogoEditando] = useState<Jogo | null>(null);

  const categorias = Array.from(new Set(jogos.map((jogo) => jogo.categoria)));

  const jogosFiltrados = jogos.filter((jogo) => {
    const matchCategoria =
      filtroCategoria === "todas" || jogo.categoria === filtroCategoria;
    const matchBusca =
      jogo.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      jogo.descricao.toLowerCase().includes(termoBusca.toLowerCase());
    return matchCategoria && matchBusca;
  });

  const abrirModal = (jogo?: Jogo) => {
    setJogoEditando(jogo || null);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setJogoEditando(null);
  };

  const excluirJogo = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este jogo?")) {
      setJogos(jogos.filter((jogo) => jogo.id !== id));
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Gerenciar Jogos
        </h1>
        <button
          onClick={() => abrirModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Jogo</span>
        </button>
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
        {jogosFiltrados.map((jogo) => (
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
                  {jogo.material.slice(0, 3).map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                    >
                      {item}
                    </span>
                  ))}
                  {jogo.material.length > 3 && (
                    <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      +{jogo.material.length - 3} mais
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {jogosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">
            Nenhum jogo encontrado
          </div>
          <p className="text-gray-500">
            Tente ajustar os filtros ou adicionar um novo jogo.
          </p>
        </div>
      )}

      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {jogoEditando ? "Editar Jogo" : "Novo Jogo"}
                </h2>
                <button
                  onClick={fecharModal}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  ✕
                </button>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Jogo
                    </label>
                    <input
                      type="text"
                      defaultValue={jogoEditando?.nome}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Uno"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria
                    </label>
                    <input
                      type="text"
                      defaultValue={jogoEditando?.categoria}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Cartas"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    defaultValue={jogoEditando?.descricao}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descrição do jogo..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mín. Jogadores
                    </label>
                    <input
                      type="number"
                      defaultValue={jogoEditando?.minJogadores}
                      min="1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Máx. Jogadores
                    </label>
                    <input
                      type="number"
                      defaultValue={jogoEditando?.maxJogadores}
                      min="1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duração (min)
                    </label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Máx. Jogadores
                    </label>
                    <input
                      type="number"
                      defaultValue={jogoEditando?.maxJogadores}
                      min="1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 8"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duração (min)
                    </label>
                    <input
                      type="number"
                      defaultValue={jogoEditando?.duracaoMedia}
                      min="1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Material Necessário
                  </label>
                  <input
                    type="text"
                    defaultValue={jogoEditando?.material.join(", ")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Baralho, Dados, Tabuleiro (separado por vírgulas)"
                  />
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
                    {jogoEditando ? "Salvar Alterações" : "Criar Jogo"}
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
