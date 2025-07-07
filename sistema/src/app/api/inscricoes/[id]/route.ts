import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

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

    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Buscar a inscrição
    const inscricao = await prisma.inscricaoEvento.findUnique({
      where: { id },
      include: {
        evento: true,
        participante: true
      }
    })

    if (!inscricao) {
      return NextResponse.json(
        { success: false, error: 'Inscrição não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o usuário pode cancelar a inscrição
    // (próprio usuário ou supervisor)
    if (inscricao.participanteId !== payload.userId && payload.cargo !== 'supervisor') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Deletar a inscrição
    await prisma.inscricaoEvento.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Inscrição cancelada com sucesso'
    })
  } catch (error) {
    console.error('Erro ao cancelar inscrição:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
