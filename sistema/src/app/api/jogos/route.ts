import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET() {
  try {
    const jogos = await prisma.jogo.findMany({
      include: {
        registros: {
          include: {
            participantes: true
          }
        }
      },
      orderBy: {
        nome: 'asc'
      }
    })

    // Adicionar estatísticas para cada jogo
    const jogosComStats = jogos.map(jogo => ({
      ...jogo,
      material: JSON.parse(jogo.material),
      totalPartidas: jogo.registros.length,
      totalParticipantes: jogo.registros.reduce((acc, registro) => 
        acc + registro.participantes.length, 0
      )
    }))

    return NextResponse.json({
      success: true,
      data: jogosComStats
    })
  } catch (error) {
    console.error('Erro ao buscar jogos:', error)
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

    const { nome, categoria, descricao, minJogadores, maxJogadores, duracaoMedia, material } = await request.json()

    if (!nome || !categoria || !descricao || !minJogadores || !maxJogadores || !duracaoMedia) {
      return NextResponse.json(
        { success: false, error: 'Todos os campos obrigatórios devem ser preenchidos' },
        { status: 400 }
      )
    }

    const jogo = await prisma.jogo.create({
      data: {
        nome,
        categoria,
        descricao,
        minJogadores: parseInt(minJogadores),
        maxJogadores: parseInt(maxJogadores),
        duracaoMedia: parseInt(duracaoMedia),
        material: JSON.stringify(material || [])
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...jogo,
        material: JSON.parse(jogo.material)
      }
    })
  } catch (error) {
    console.error('Erro ao criar jogo:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
