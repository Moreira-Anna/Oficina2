import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Estatísticas básicas
    const totalJogos = await prisma.jogo.count()
    const totalEventos = await prisma.evento.count()
    const totalParticipantes = await prisma.user.count({
      where: { cargo: 'aluno' }
    })
    const totalRegistros = await prisma.registroJogo.count()

    // Jogos mais populares
    const jogosPopulares = await prisma.jogo.findMany({
      include: {
        registros: {
          include: {
            participantes: true
          }
        }
      }
    })

    // Calcular estatísticas dos jogos
    const estatisticasJogos = jogosPopulares.map(jogo => {
      const totalPartidas = jogo.registros.length
      const totalParticipantes = jogo.registros.reduce((acc, registro) => 
        acc + registro.participantes.length, 0
      )
      const mediaParticipantes = totalPartidas > 0 ? totalParticipantes / totalPartidas : 0
      
      return {
        jogo: {
          id: jogo.id,
          nome: jogo.nome,
          categoria: jogo.categoria,
          duracaoMedia: jogo.duracaoMedia
        },
        totalPartidas,
        totalParticipantes,
        mediaParticipantes: Math.round(mediaParticipantes),
        popularidade: Math.min(100, Math.round((totalPartidas / Math.max(totalRegistros, 1)) * 100))
      }
    }).sort((a, b) => b.totalPartidas - a.totalPartidas)

    // Eventos recentes
    const eventosRecentes = await prisma.evento.findMany({
      include: {
        salas: true,
        registros: {
          include: {
            participantes: true
          }
        }
      },
      orderBy: {
        data: 'desc'
      },
      take: 5
    })

    return NextResponse.json({
      success: true,
      data: {
        estatisticasGerais: {
          totalJogos,
          totalEventos,
          totalParticipantes,
          totalRegistros
        },
        jogosPopulares: estatisticasJogos,
        eventosRecentes: eventosRecentes.map(evento => ({
          ...evento,
          salas: evento.salas,
          totalParticipantes: evento.registros.reduce((acc, registro) => 
            acc + registro.participantes.length, 0
          )
        }))
      }
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
