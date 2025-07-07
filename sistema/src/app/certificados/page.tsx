"use client";

import { useState, useEffect } from "react";
import {
  Award,
  Download,
  Calendar,
  Clock,
  User,
  Search,
  Plus,
  Loader2,
  FileText,
  CheckCircle,
} from "lucide-react";
import { Certificado, Evento } from "@/types";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

export default function CertificadosPage() {
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState<string>("");
  const [modalAberto, setModalAberto] = useState(false);
  const [modalTodosAberto, setModalTodosAberto] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState<string>("");
  const [participanteSelecionado, setParticipanteSelecionado] = useState<string>("");
  const [horasParticipacao, setHorasParticipacao] = useState<number>(0);
  const [participantes, setParticipantes] = useState<{id: string; nome: string; email: string}[]>([]);
  const [participantesEvento, setParticipantesEvento] = useState<{id: string; nome: string; email: string}[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [notificacao, setNotificacao] = useState<{tipo: 'sucesso' | 'erro'; mensagem: string} | null>(null);
  const { user } = useAuth();
  const isSupervisor = user?.cargo === 'supervisor';

  useEffect(() => {
    if (user) {
      fetchCertificados();
      if (isSupervisor) {
        fetchEventosFinalizados();
        fetchParticipantes();
      }
    }
  }, [user, isSupervisor]);

  const fetchCertificados = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/certificados", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar certificados");
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setCertificados(data.data);
      } else {
        console.error("Dados inválidos recebidos:", data);
        setCertificados([]);
      }
    } catch (error) {
      console.error("Erro ao buscar certificados:", error);
      alert("Erro ao carregar certificados");
      setCertificados([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventosFinalizados = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/eventos", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Mostrar todos os eventos para o supervisor escolher
          setEventos(data.data);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
    }
  };

  const fetchParticipantes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/participantes", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setParticipantes(data.data);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar participantes:", error);
    }
  };

  const fetchParticipantesEvento = async (eventoId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/certificados?eventoId=${eventoId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setParticipantesEvento(data.data);
        }
      } else {
        console.error("Erro ao buscar participantes do evento");
        setParticipantesEvento([]);
      }
    } catch (error) {
      console.error("Erro ao buscar participantes do evento:", error);
      setParticipantesEvento([]);
    }
  };

  const gerarCertificadoTodos = async () => {
    if (!eventoSelecionado || horasParticipacao <= 0) {
      setNotificacao({ tipo: 'erro', mensagem: 'Por favor, selecione um evento e informe as horas de participação' });
      setTimeout(() => setNotificacao(null), 3000);
      return;
    }

    const eventoEscolhido = eventos.find(e => e.id === eventoSelecionado);
    if (!eventoEscolhido) {
      setNotificacao({ tipo: 'erro', mensagem: 'Evento não encontrado' });
      setTimeout(() => setNotificacao(null), 3000);
      return;
    }

    if (eventoEscolhido.status !== 'finalizado') {
      setNotificacao({ tipo: 'erro', mensagem: 'Apenas eventos finalizados podem gerar certificados' });
      setTimeout(() => setNotificacao(null), 3000);
      return;
    }

    try {
      setSalvando(true);
      
      // Buscar participantes do evento se ainda não foram carregados
      if (participantesEvento.length === 0) {
        await fetchParticipantesEvento(eventoSelecionado);
      }
      
      if (participantesEvento.length === 0) {
        setNotificacao({ tipo: 'erro', mensagem: 'Nenhum participante encontrado para este evento' });
        setTimeout(() => setNotificacao(null), 3000);
        return;
      }

      const token = localStorage.getItem("token");
      let certificadosGerados = 0;
      let erros = 0;

      // Gerar certificados para todos os participantes
      for (const participante of participantesEvento) {
        try {
          const response = await fetch("/api/certificados", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
              eventoId: eventoSelecionado,
              participanteId: participante.id,
              horasParticipacao,
            }),
          });

          const result = await response.json();

          if (response.ok && result.success) {
            certificadosGerados++;
          } else {
            erros++;
            console.error(`Erro ao gerar certificado para ${participante.nome}:`, result.error);
          }
        } catch (error) {
          erros++;
          console.error(`Erro ao gerar certificado para ${participante.nome}:`, error);
        }
      }

      if (certificadosGerados > 0) {
        setNotificacao({ 
          tipo: 'sucesso', 
          mensagem: `${certificadosGerados} certificados gerados com sucesso!${erros > 0 ? ` (${erros} erros)` : ''}` 
        });
        fetchCertificados();
        fecharModalTodos();
      } else {
        setNotificacao({ tipo: 'erro', mensagem: 'Nenhum certificado foi gerado' });
      }
      
      setTimeout(() => setNotificacao(null), 5000);
    } catch (error) {
      console.error("Erro ao gerar certificados:", error);
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao gerar certificados' });
      setTimeout(() => setNotificacao(null), 3000);
    } finally {
      setSalvando(false);
    }
  };

  const abrirModalTodos = () => {
    setModalTodosAberto(true);
    setEventoSelecionado("");
    setHorasParticipacao(0);
    setParticipantesEvento([]);
  };

  const fecharModalTodos = () => {
    setModalTodosAberto(false);
    setEventoSelecionado("");
    setHorasParticipacao(0);
    setParticipantesEvento([]);
  };

  const handleEventoSelecionadoTodos = async (eventoId: string) => {
    setEventoSelecionado(eventoId);
    if (eventoId) {
      await fetchParticipantesEvento(eventoId);
    }
  };

  const gerarCertificado = async () => {
    if (!eventoSelecionado || !participanteSelecionado || horasParticipacao <= 0) {
      alert("Por favor, preencha todos os campos corretamente");
      return;
    }

    try {
      setSalvando(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/certificados", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventoId: eventoSelecionado,
          participanteId: participanteSelecionado,
          horasParticipacao,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setNotificacao({ tipo: 'sucesso', mensagem: 'Certificado gerado com sucesso!' });
        fetchCertificados();
        fecharModal();
        setTimeout(() => setNotificacao(null), 3000);
      } else {
        setNotificacao({ tipo: 'erro', mensagem: result.error || 'Erro ao gerar certificado' });
        setTimeout(() => setNotificacao(null), 3000);
      }
    } catch (error) {
      console.error("Erro ao gerar certificado:", error);
      alert("Erro ao gerar certificado");
    } finally {
      setSalvando(false);
    }
  };

  const fecharModal = () => {
    setModalAberto(false);
    setEventoSelecionado("");
    setParticipanteSelecionado("");
    setHorasParticipacao(0);
  };

  const baixarCertificado = (certificado: Certificado) => {
    // Generate a professional HTML certificate
    const certificadoHTML = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificado de Participação</title>
        <style>
          body {
            font-family: 'Georgia', serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .certificate {
            background: white;
            border: 8px solid #d4af37;
            border-radius: 20px;
            padding: 60px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 800px;
            width: 100%;
          }
          .header {
            border-bottom: 3px solid #d4af37;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .title {
            font-size: 48px;
            color: #2c3e50;
            font-weight: bold;
            margin: 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
          }
          .subtitle {
            font-size: 20px;
            color: #7f8c8d;
            margin: 10px 0;
          }
          .participant-name {
            font-size: 36px;
            color: #2c3e50;
            font-weight: bold;
            margin: 30px 0;
            text-decoration: underline;
          }
          .event-info {
            font-size: 18px;
            color: #34495e;
            margin: 20px 0;
            line-height: 1.6;
          }
          .hours {
            font-size: 20px;
            color: #e74c3c;
            font-weight: bold;
            margin: 20px 0;
          }
          .date {
            font-size: 16px;
            color: #7f8c8d;
            margin-top: 40px;
          }
          .signature {
            margin-top: 50px;
            border-top: 2px solid #bdc3c7;
            padding-top: 20px;
          }
          .logo {
            width: 80px;
            height: 80px;
            background: #d4af37;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            color: white;
          }
          .code {
            font-size: 12px;
            color: #95a5a6;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="logo">🏆</div>
          <div class="header">
            <h1 class="title">CERTIFICADO</h1>
            <p class="subtitle">de Participação</p>
          </div>
          
          <p class="event-info">
            Certificamos que
          </p>
          
          <h2 class="participant-name">${certificado.participante?.nome}</h2>
          
          <p class="event-info">
            participou do evento <strong>"${certificado.evento?.nome}"</strong><br>
            realizado em ${new Date(certificado.evento?.data || '').toLocaleDateString('pt-BR')}<br>
            ${certificado.evento?.local ? `Local: ${certificado.evento.local}` : ''}
          </p>
          
          <p class="hours">
            Carga horária: ${certificado.horasParticipacao} horas
          </p>
          
          <div class="signature">
            <p class="date">
              Certificado emitido em ${new Date(certificado.dataEmissao).toLocaleDateString('pt-BR')}
            </p>
            <p class="code">
              Código: ${certificado.codigoCertificado}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create a blob and download as HTML with UTF-8 encoding
    // Add BOM (Byte Order Mark) to ensure UTF-8 encoding
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + certificadoHTML], { type: 'text/html; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const linkElement = document.createElement('a');
    linkElement.href = url;
    linkElement.download = `certificado-${certificado.codigoCertificado}.html`;
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
    URL.revokeObjectURL(url);
  };

  const certificadosFiltrados = certificados.filter(certificado =>
    certificado.evento?.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
    certificado.participante?.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
    certificado.codigoCertificado.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <div className="space-y-6 sm:space-y-8">
        {/* Notification */}
        {notificacao && (
          <div className={`p-4 rounded-lg ${
            notificacao.tipo === 'sucesso' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {notificacao.tipo === 'sucesso' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <FileText className="h-5 w-5 mr-2" />
              )}
              <p className="font-medium">{notificacao.mensagem}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {isSupervisor ? "Gerenciar Certificados" : "Meus Certificados"}
          </h1>
          {isSupervisor && (
            <div className="flex gap-3">
              <button
                onClick={() => setModalAberto(true)}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5 mr-2" />
                Gerar Certificado
              </button>
              <button
                onClick={abrirModalTodos}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Award className="h-5 w-5 mr-2" />
                Gerar para Todos
              </button>
            </div>
          )}
        </div>

        {/* Barra de busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            placeholder="Buscar certificados..."
            className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Carregando certificados...</span>
          </div>
        ) : certificadosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {termoBusca ? "Nenhum certificado encontrado" : "Nenhum certificado disponível"}
            </h3>
            <p className="text-gray-500">
              {termoBusca 
                ? "Tente buscar com outros termos" 
                : isSupervisor 
                  ? "Gere certificados para eventos finalizados"
                  : "Seus certificados aparecerão aqui quando forem emitidos"
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificadosFiltrados.map((certificado) => (
              <div
                key={certificado.id}
                className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-3">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 text-lg">
                          {certificado.evento?.nome}
                        </h3>
                        <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block mt-1">
                          {certificado.codigoCertificado}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs font-medium">Válido</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-700">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium">{certificado.participante?.nome}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <Calendar className="h-4 w-4 text-purple-600" />
                      </div>
                      <span>
                        {new Date(certificado.evento?.data || '').toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <Clock className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="font-medium">{certificado.horasParticipacao} horas</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                      Emitido em {new Date(certificado.dataEmissao).toLocaleDateString('pt-BR')}
                    </span>
                    <button
                      onClick={() => baixarCertificado(certificado)}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal para gerar certificado */}
        {modalAberto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Gerar Certificado
                  </h2>
                  <button
                    onClick={fecharModal}
                    className="text-gray-400 hover:text-gray-600"
                    disabled={salvando}
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Evento *
                    </label>
                    <select
                      value={eventoSelecionado}
                      onChange={(e) => setEventoSelecionado(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={salvando}
                    >
                      <option value="">Selecione um evento</option>
                      {eventos.map((evento) => (
                        <option key={evento.id} value={evento.id}>
                          {evento.nome} - {new Date(evento.data).toLocaleDateString('pt-BR')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Participante *
                    </label>
                    <select
                      value={participanteSelecionado}
                      onChange={(e) => setParticipanteSelecionado(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={salvando}
                    >
                      <option value="">Selecione um participante</option>
                      {participantes.map((participante) => (
                        <option key={participante.id} value={participante.id}>
                          {participante.nome} ({participante.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Horas de Participação *
                    </label>
                    <input
                      type="number"
                      value={horasParticipacao || ""}
                      onChange={(e) => setHorasParticipacao(parseInt(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 8"
                      min="1"
                      disabled={salvando}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <button
                    onClick={fecharModal}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={salvando}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={gerarCertificado}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={salvando}
                  >
                    {salvando ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Gerar Certificado
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal para gerar certificados para todos os participantes */}
        {modalTodosAberto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  Gerar Certificados para Todos os Participantes
                </h2>
                <button
                  onClick={fecharModalTodos}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Evento
                  </label>
                  <select
                    value={eventoSelecionado}
                    onChange={(e) => handleEventoSelecionadoTodos(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione um evento</option>
                    {eventos.map((evento) => (
                      <option key={evento.id} value={evento.id}>
                        {evento.nome} - {evento.status} ({new Date(evento.data).toLocaleDateString('pt-BR')})
                      </option>
                    ))}
                  </select>
                </div>

                {eventoSelecionado && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Participantes Encontrados
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        {participantesEvento.length} participantes encontrados
                      </p>
                      {participantesEvento.length > 0 && (
                        <ul className="mt-2 text-sm text-gray-700 max-h-32 overflow-y-auto">
                          {participantesEvento.map((participante) => (
                            <li key={participante.id} className="py-1">
                              • {participante.nome}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horas de Participação
                  </label>
                  <input
                    type="number"
                    value={horasParticipacao}
                    onChange={(e) => setHorasParticipacao(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="24"
                    placeholder="Digite as horas"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={fecharModalTodos}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={gerarCertificadoTodos}
                    disabled={salvando || !eventoSelecionado || horasParticipacao <= 0 || participantesEvento.length === 0}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {salvando ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Award className="h-4 w-4 mr-2" />
                        Gerar {participantesEvento.length} Certificados
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
