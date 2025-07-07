import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const evento = await prisma.evento.findUnique({
      where: { id },
      include: {
        salas: true,
        registros: {
          include: {
            participantes: true,
            jogo: true,
            sala: true
          }
        }
      }
    })

    if (!evento) {
      return NextResponse.json(
        { success: false, error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: evento
    })
  } catch (error) {
    console.error('Erro ao buscar evento:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const { nome, data, local, descricao, organizador, status } = await request.json()

    const evento = await prisma.evento.update({
      where: { id },
      data: {
        nome,
        data: new Date(data),
        local,
        descricao,
        organizador,
        status
      },
      include: {
        salas: true
      }
    })

    return NextResponse.json({
      success: true,
      data: evento
    })
  } catch (error) {
    console.error('Erro ao atualizar evento:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Verificar se o evento tem registros
    const registros = await prisma.registroJogo.count({
      where: { eventoId: id }
    })

    if (registros > 0) {
      return NextResponse.json(
        { success: false, error: 'Não é possível excluir um evento que possui registros de jogos' },
        { status: 400 }
      )
    }

    await prisma.evento.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Evento excluído com sucesso'
    })
  } catch (error) {
    console.error('Erro ao excluir evento:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { status } = await request.json()
    const { id } = await params

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status é obrigatório' },
        { status: 400 }
      )
    }

    const statusValidos = ['planejado', 'em-andamento', 'finalizado']
    if (!statusValidos.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Status inválido' },
        { status: 400 }
      )
    }

    const evento = await prisma.evento.update({
      where: { id },
      data: { status },
      include: {
        salas: true
      }
    })

    return NextResponse.json({
      success: true,
      data: evento
    })
  } catch (error) {
    console.error('Erro ao alterar status do evento:', error)
    
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Evento não encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
