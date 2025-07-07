const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testModels() {
  try {
    console.log('Testando modelos disponíveis...')
    
    // Listar todas as propriedades do prisma
    const models = Object.keys(prisma).filter(key => !key.startsWith('_') && !key.startsWith('$'))
    console.log('Modelos disponíveis:', models)
    
    await prisma.$disconnect()
  } catch (error) {
    console.error('Erro:', error)
  }
}

testModels()
