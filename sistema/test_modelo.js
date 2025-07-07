const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testEventoJogo() {
  try {
    console.log('Testando modelo EventoJogo...')
    
    // Verificar se o modelo existe
    console.log('eventoJogo exists:', typeof prisma.eventoJogo)
    console.log('All models:', Object.getOwnPropertyNames(prisma).filter(name => !name.startsWith('_') && !name.startsWith('$')))
    
    await prisma.$disconnect()
  } catch (error) {
    console.error('Erro:', error)
  }
}

testEventoJogo()
