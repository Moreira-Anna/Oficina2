const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verificarModelos() {
  try {
    console.log('Verificando modelos do Prisma Client...')
    
    // Tentar diferentes nomes para o modelo
    const nomesPossiveis = [
      'eventoJogo',
      'eventosJogos', 
      'EventoJogo',
      'EventosJogos',
      'evento_jogo',
      'eventos_jogos'
    ]
    
    for (const nome of nomesPossiveis) {
      try {
        if (prisma[nome]) {
          console.log(`✅ Modelo encontrado: ${nome}`)
        } else {
          console.log(`❌ Modelo não encontrado: ${nome}`)
        }
      } catch (error) {
        console.log(`❌ Erro ao verificar ${nome}:`, error.message)
      }
    }
    
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

verificarModelos()
