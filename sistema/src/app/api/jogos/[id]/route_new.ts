import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const jogo = await prisma.jogo.findUnique({
      where: { id },
      include: {
        registros: {
          include: {
            participantes: true,
            evento: true,
            sala: true
          }
        }
      }
    })

    if (!jogo) {
      return NextResponse.json(
        { success: false, error: 'Jogo não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: jogo })
  } catch (error) {
    console.error('Erro ao buscar jogo:', error)
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
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.cargo !== 'supervisor') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { nome, categoria, descricao, minJogadores, maxJogadores, duracaoMedia, material } = body

    if (!nome || !categoria || !descricao || !minJogadores || !maxJogadores || !duracaoMedia) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    const jogo = await prisma.jogo.update({
      where: { id },
      data: {
        nome,
        categoria,
        descricao,
        minJogadores,
        maxJogadores,
        duracaoMedia,
        material: JSON.stringify(material || [])
      }
    })

    return NextResponse.json({ success: true, data: jogo })
  } catch (error) {
    console.error('Erro ao atualizar jogo:', error)
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
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.cargo !== 'supervisor') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Verificar se o jogo tem registros
    const registros = await prisma.registroJogo.count({
      where: { jogoId: id }
    })

    if (registros > 0) {
      return NextResponse.json(
        { success: false, error: 'Não é possível excluir um jogo que possui registros' },
        { status: 400 }
      )
    }

    await prisma.jogo.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Jogo excluído com sucesso'
    })
  } catch (error) {
    console.error('Erro ao excluir jogo:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
