import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

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

    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      )
    }

    const { eventoId } = await request.json()

    if (!eventoId) {
      return NextResponse.json(
        { success: false, error: 'ID do evento é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o evento existe
    const evento = await prisma.evento.findUnique({
      where: { id: eventoId }
    })

    if (!evento) {
      return NextResponse.json(
        { success: false, error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o usuário já está inscrito
    const inscricaoExistente = await prisma.inscricaoEvento.findUnique({
      where: {
        eventoId_participanteId: {
          eventoId,
          participanteId: payload.userId
        }
      }
    })

    if (inscricaoExistente) {
      return NextResponse.json(
        { success: false, error: 'Você já está inscrito neste evento' },
        { status: 400 }
      )
    }

    // Criar nova inscrição
    const inscricao = await prisma.inscricaoEvento.create({
      data: {
        eventoId,
        participanteId: payload.userId,
        status: 'confirmada'
      },
      include: {
        evento: true,
        participante: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: inscricao,
      message: 'Inscrição realizada com sucesso!'
    })
  } catch (error) {
    console.error('Erro ao criar inscrição:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
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

    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const eventoId = searchParams.get('eventoId')

    if (eventoId) {
      // Buscar inscrições de um evento específico (para supervisores)
      if (payload.cargo !== 'supervisor') {
        return NextResponse.json(
          { success: false, error: 'Acesso negado' },
          { status: 403 }
        )
      }

      const inscricoes = await prisma.inscricaoEvento.findMany({
        where: { eventoId },
        include: {
          participante: {
            select: {
              id: true,
              nome: true,
              email: true,
              idade: true,
              telefone: true
            }
          }
        },
        orderBy: {
          dataInscricao: 'asc'
        }
      })

      return NextResponse.json({
        success: true,
        data: inscricoes
      })
    } else {
      // Buscar inscrições do usuário logado
      const inscricoes = await prisma.inscricaoEvento.findMany({
        where: { participanteId: payload.userId },
        include: {
          evento: true
        },
        orderBy: {
          dataInscricao: 'desc'
        }
      })

      return NextResponse.json({
        success: true,
        data: inscricoes
      })
    }
  } catch (error) {
    console.error('Erro ao buscar inscrições:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
