import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET() {
  try {
    const eventos = await prisma.evento.findMany({
      include: {
        salas: true,
        registros: {
          include: {
            participantes: true,
            jogo: true
          }
        }
      },
      orderBy: {
        data: 'desc'
      }
    })

    // Adicionar estatísticas para cada evento
    const eventosComStats = eventos.map(evento => ({
      ...evento,
      totalParticipantes: evento.registros.reduce((acc, registro) => 
        acc + registro.participantes.length, 0
      ),
      totalJogos: evento.registros.length,
      capacidadeTotal: evento.salas.reduce((acc, sala) => acc + sala.capacidade, 0)
    }))

    return NextResponse.json({
      success: true,
      data: eventosComStats
    })
  } catch (error) {
    console.error('Erro ao buscar eventos:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authorization.split(' ')[1]
    const payload = verifyToken(token)

    if (!payload || payload.cargo !== 'supervisor') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { nome, data, local, descricao, organizador, status, salas, jogoIds } = await request.json()

    if (!nome || !data || !local || !descricao || !organizador) {
      return NextResponse.json(
        { success: false, error: 'Todos os campos obrigatórios devem ser preenchidos' },
        { status: 400 }
      )
    }

    // Validar se pelo menos uma sala foi informada
    if (!salas || !Array.isArray(salas) || salas.length === 0) {
      return NextResponse.json(
        { success: false, error: 'É obrigatório informar pelo menos uma sala para o evento' },
        { status: 400 }
      )
    }

    // Validar se todas as salas têm nome e capacidade
    const salasValidas = salas.every((sala: { nome: string; capacidade: number }) => 
      sala.nome && typeof sala.nome === 'string' && sala.nome.trim().length > 0 &&
      sala.capacidade && typeof sala.capacidade === 'number' && sala.capacidade > 0
    )

    if (!salasValidas) {
      return NextResponse.json(
        { success: false, error: 'Todas as salas devem ter nome e capacidade válidos' },
        { status: 400 }
      )
    }

    // Validar se os jogos selecionados existem
    if (jogoIds && jogoIds.length > 0) {
      const jogosExistentes = await prisma.jogo.findMany({
        where: {
          id: { in: jogoIds }
        }
      })
      
      if (jogosExistentes.length !== jogoIds.length) {
        return NextResponse.json(
          { success: false, error: 'Alguns jogos selecionados não foram encontrados' },
          { status: 400 }
        )
      }
    }

    const evento = await prisma.evento.create({
      data: {
        nome,
        data: new Date(data),
        local,
        descricao,
        organizador,
        status: status || 'planejado',
        salas: {
          create: salas?.map((sala: { nome: string; capacidade: number }) => ({
            nome: sala.nome,
            capacidade: sala.capacidade
          })) || []
        }
      },
      include: {
        salas: true
      }
    })

    // TODO: Criar relacionamentos com jogos após resolver problema de tipagem
    // if (jogoIds && jogoIds.length > 0) {
    //   const eventosJogos = jogoIds.map((jogoId: string, index: number) => ({
    //     eventoId: evento.id,
    //     jogoId,
    //     prioridade: index
    //   }))
    //   
    //   for (const eventoJogo of eventosJogos) {
    //     await prisma.eventoJogo.create({
    //       data: eventoJogo
    //     })
    //   }
    // }

    return NextResponse.json({
      success: true,
      data: evento
    })
  } catch (error) {
    console.error('Erro ao criar evento:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
