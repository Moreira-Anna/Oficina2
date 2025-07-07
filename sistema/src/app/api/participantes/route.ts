import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, hashPassword } from '@/lib/auth'

export async function GET() {
  try {
    const participantes = await prisma.user.findMany({
      where: { cargo: 'aluno' },
      include: {
        participacoes: {
          include: {
            registroJogo: {
              include: {
                jogo: true,
                evento: true
              }
            }
          }
        }
      },
      orderBy: {
        nome: 'asc'
      }
    })

    // Adicionar estatísticas para cada participante
    const participantesComStats = participantes.map(participante => {
      const totalJogos = participante.participacoes.length
      const jogosUnicos = new Set(
        participante.participacoes.map(p => p.registroJogo.jogoId)
      ).size

      // Encontrar jogo mais jogado
      const jogoCount = participante.participacoes.reduce((acc, p) => {
        const jogoId = p.registroJogo.jogoId
        acc[jogoId] = (acc[jogoId] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const jogoMaisJogadoId = Object.entries(jogoCount).sort(([,a], [,b]) => b - a)[0]?.[0]
      const jogoMaisJogado = participante.participacoes.find(
        p => p.registroJogo.jogoId === jogoMaisJogadoId
      )?.registroJogo.jogo.nome || 'Nenhum'

      return {
        id: participante.id,
        nome: participante.nome,
        email: participante.email,
        idade: participante.idade,
        telefone: participante.telefone,
        cargo: participante.cargo,
        createdAt: participante.createdAt,
        updatedAt: participante.updatedAt,
        estatisticas: {
          totalJogos,
          jogosUnicos,
          jogoMaisJogado
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: participantesComStats
    })
  } catch (error) {
    console.error('Erro ao buscar participantes:', error)
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

    const { nome, email, idade, telefone, senha } = await request.json()

    if (!nome || !email || !senha) {
      return NextResponse.json(
        { success: false, error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Este email já está sendo usado' },
        { status: 409 }
      )
    }

    const hashedPassword = await hashPassword(senha)

    const participante = await prisma.user.create({
      data: {
        nome,
        email,
        senha: hashedPassword,
        cargo: 'aluno',
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
    console.error('Erro ao criar participante:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
