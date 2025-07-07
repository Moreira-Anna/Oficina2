import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

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

    // Check if request is for participants of an event
    const { searchParams } = new URL(request.url)
    const eventoId = searchParams.get('eventoId')
    
    if (eventoId) {
      // Return participants for specific event
      if (payload.cargo !== 'supervisor') {
        return NextResponse.json(
          { success: false, error: 'Acesso negado' },
          { status: 403 }
        )
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const inscricoes = await (prisma as any).inscricaoEvento.findMany({
        where: {
          eventoId: eventoId,
          status: 'confirmada'
        },
        include: {
          participante: {
            select: {
              id: true,
              nome: true,
              email: true
            }
          }
        }
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const participantes = inscricoes.map((inscricao: any) => inscricao.participante)

      return NextResponse.json({
        success: true,
        data: participantes
      })
    }

    // Se for aluno, retornar apenas seus certificados
    // Se for supervisor, retornar todos os certificados
    const whereClause = payload.cargo === 'aluno' 
      ? { participanteId: payload.userId }
      : {}

    // TODO: Resolver tipagem do Prisma - certificado existe no runtime
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const certificados = await (prisma as any).certificado.findMany({
      where: whereClause,
      include: {
        evento: true,
        participante: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      },
      orderBy: {
        dataEmissao: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: certificados
    })
  } catch (error) {
    console.error('Erro ao buscar certificados:', error)
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

    const { eventoId, participanteId, horasParticipacao } = await request.json()

    if (!eventoId || !participanteId || !horasParticipacao) {
      return NextResponse.json(
        { success: false, error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Verificar se o evento existe e está finalizado
    const evento = await prisma.evento.findUnique({
      where: { id: eventoId }
    })

    if (!evento) {
      return NextResponse.json(
        { success: false, error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    if (evento.status !== 'finalizado') {
      return NextResponse.json(
        { success: false, error: 'Só é possível gerar certificados para eventos finalizados' },
        { status: 400 }
      )
    }

    // Verificar se o participante existe
    const participante = await prisma.user.findUnique({
      where: { id: participanteId }
    })

    if (!participante) {
      return NextResponse.json(
        { success: false, error: 'Participante não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se já existe certificado para este evento e participante
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const certificadoExistente = await (prisma as any).certificado.findUnique({
      where: {
        eventoId_participanteId: {
          eventoId,
          participanteId
        }
      }
    })

    if (certificadoExistente) {
      return NextResponse.json(
        { success: false, error: 'Certificado já foi emitido para este participante neste evento' },
        { status: 400 }
      )
    }

    // Gerar código único do certificado
    const codigoCertificado = `CERT-${evento.nome.replace(/\s+/g, '').toUpperCase().substring(0, 8)}-${participante.nome.replace(/\s+/g, '').toUpperCase().substring(0, 4)}-${Date.now().toString().slice(-6)}`

    // Criar certificado
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const certificado = await (prisma as any).certificado.create({
      data: {
        eventoId,
        participanteId,
        horasParticipacao,
        codigoCertificado
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
      data: certificado
    })
  } catch (error) {
    console.error('Erro ao criar certificado:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
