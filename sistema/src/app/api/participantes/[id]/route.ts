import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const participante = await prisma.user.findUnique({
      where: { 
        id,
        cargo: 'aluno'
      },
      include: {
        participacoes: {
          include: {
            registroJogo: {
              include: {
                jogo: true,
                evento: true,
                sala: true
              }
            }
          }
        }
      }
    })

    if (!participante) {
      return NextResponse.json(
        { success: false, error: 'Participante não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: participante.id,
        nome: participante.nome,
        email: participante.email,
        cargo: participante.cargo,
        idade: participante.idade,
        telefone: participante.telefone,
        createdAt: participante.createdAt,
        updatedAt: participante.updatedAt,
        participacoes: participante.participacoes
      }
    })
  } catch (error) {
    console.error('Erro ao buscar participante:', error)
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

    const { nome, email, idade, telefone } = await request.json()

    // Verificar se email já existe em outro usuário
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: { 
          email,
          id: { not: id }
        }
      })

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Este email já está sendo usado' },
          { status: 409 }
        )
      }
    }

    const participante = await prisma.user.update({
      where: { id },
      data: {
        nome,
        email,
        idade: idade ? parseInt(idade) : null,
        telefone: telefone || null
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: participante.id,
        nome: participante.nome,
        email: participante.email,
        cargo: participante.cargo,
        idade: participante.idade,
        telefone: participante.telefone,
        createdAt: participante.createdAt,
        updatedAt: participante.updatedAt
      }
    })
  } catch (error) {
    console.error('Erro ao atualizar participante:', error)
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

    // Verificar se o participante tem participações em jogos
    const participacoes = await prisma.participanteRegistro.count({
      where: { participanteId: id }
    })

    if (participacoes > 0) {
      return NextResponse.json(
        { success: false, error: 'Não é possível excluir um participante que possui histórico de jogos' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Participante excluído com sucesso'
    })
  } catch (error) {
    console.error('Erro ao excluir participante:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
