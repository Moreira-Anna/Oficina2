const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verificarEventoJogos() {
  try {
    console.log('🔍 Verificando eventos com jogos...')
    
    const eventos = await prisma.evento.findMany({
      include: {
        eventosJogos: {
          include: {
            jogo: true
          },
          orderBy: {
            prioridade: 'asc'
          }
        }
      }
    })
    
    eventos.forEach(evento => {
      console.log(`\n📅 Evento: ${evento.nome}`)
      console.log(`   ID: ${evento.id}`)
      console.log(`   Jogos (${evento.eventosJogos.length}):`)
      evento.eventosJogos.forEach((ej, index) => {
        console.log(`   ${index + 1}. ${ej.jogo.nome} (prioridade: ${ej.prioridade})`)
      })
    })
    
    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

verificarEventoJogos()
