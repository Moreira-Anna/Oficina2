const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verificarModelosCertificado() {
  try {
    console.log('Verificando modelos do Prisma Client...')
    
    // Listar todos os modelos disponíveis
    console.log('\nModelos disponíveis no Prisma Client:')
    const prismaKeys = Object.keys(prisma).filter(key => 
      !key.startsWith('_') && 
      !key.startsWith('$') &&
      typeof prisma[key] === 'object' &&
      prisma[key] !== null &&
      typeof prisma[key].create === 'function'
    )
    
    prismaKeys.forEach(key => {
      console.log(`- ${key}`)
    })
    
  } catch (error) {
    console.error('Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarModelosCertificado()
