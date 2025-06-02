export interface Jogo {
  id: string;
  nome: string;
  categoria: string;
  descricao: string;
  minJogadores: number;
  maxJogadores: number;
  duracaoMedia: number;
  material: string[];
}

export interface Participante {
  id: string;
  nome: string;
  email: string;
  idade: number;
  telefone?: string;
}

export interface Evento {
  id: string;
  nome: string;
  data: Date;
  local: string;
  descricao: string;
  organizador: string;
  status: "planejado" | "em-andamento" | "finalizado";
  salas: Sala[];
}

export interface Sala {
  id: string;
  nome: string;
  capacidade: number;
  eventoId: string;
}

export interface RegistroJogo {
  id: string;
  jogoId: string;
  eventoId: string;
  salaId: string;
  participantes: Participante[];
  dataInicio: Date;
  dataFim?: Date;
  observacoes?: string;
}

export interface EstatisticaJogo {
  jogo: Jogo;
  totalPartidas: number;
  totalParticipantes: number;
  tempoMedioJogo: number;
  popularidade: number;
}

export interface EstatisticaEvento {
  evento: Evento;
  totalJogos: number;
  totalParticipantes: number;
  jogosMaisJogados: EstatisticaJogo[];
  distribuicaoPorSala: {
    sala: Sala;
    totalJogos: number;
  }[];
}

export type FiltroTempo = "hoje" | "semana" | "mes" | "ano" | "todos";
