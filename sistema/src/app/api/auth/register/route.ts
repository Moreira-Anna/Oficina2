import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, nome, cargo, idade, telefone } = await request.json()

    if (!email || !password || !nome || !cargo) {
      return NextResponse.json(
        { success: false, error: 'Email, senha, nome e cargo são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se cargo é válido
    if (!['supervisor', 'aluno'].includes(cargo)) {
      return NextResponse.json(
        { success: false, error: 'Cargo deve ser "supervisor" ou "aluno"' },
        { status: 400 }
      )
    }

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Usuário já existe com este email' },
        { status: 409 }
      )
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password)

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        senha: hashedPassword,
        nome,
        cargo,
        idade: idade || null,
        telefone: telefone || null
      }
    })

    // Gerar token JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      nome: user.nome,
      cargo: user.cargo
    })

    return NextResponse.json({
      success: true,
      token,
      user: {
        userId: user.id,
        email: user.email,
        nome: user.nome,
        cargo: user.cargo
      }
    })
  } catch (error) {
    console.error('Erro no registro:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
