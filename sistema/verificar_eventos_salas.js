const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verificarEventosSalas() {
  try {
    console.log('🔍 Verificando eventos com salas...')
    
    const eventos = await prisma.evento.findMany({
      include: {
        salas: true
      }
    })
    
    console.log(`\n📊 Total de eventos: ${eventos.length}`)
    
    eventos.forEach(evento => {
      console.log(`\n📅 Evento: ${evento.nome}`)
      console.log(`   ID: ${evento.id}`)
      console.log(`   Salas (${evento.salas.length}):`)
      if (evento.salas.length === 0) {
        console.log('   ❌ NENHUMA SALA ASSOCIADA')
      } else {
        evento.salas.forEach((sala, index) => {
          console.log(`   ${index + 1}. ${sala.nome} (capacidade: ${sala.capacidade})`)
        })
      }
    })
    
    const eventosSemSalas = eventos.filter(evento => evento.salas.length === 0)
    console.log(`\n⚠️  Eventos sem salas: ${eventosSemSalas.length}`)
    
    if (eventosSemSalas.length > 0) {
      console.log('📋 Eventos que precisam de salas:')
      eventosSemSalas.forEach(evento => {
        console.log(`   - ${evento.nome} (${evento.id})`)
      })
    }
    
    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

verificarEventosSalas()
