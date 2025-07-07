const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function corrigirEventosSemSalas() {
  try {
    console.log('🔧 Corrigindo eventos sem salas...')
    
    // Buscar eventos sem salas
    const eventosSemSalas = await prisma.evento.findMany({
      where: {
        salas: {
          none: {}
        }
      },
      include: {
        salas: true
      }
    })
    
    console.log(`\n📊 Eventos sem salas encontrados: ${eventosSemSalas.length}`)
    
    if (eventosSemSalas.length === 0) {
      console.log('✅ Todos os eventos já têm salas associadas')
      return
    }
    
    // Corrigir cada evento
    for (const evento of eventosSemSalas) {
      console.log(`\n🔧 Corrigindo evento: ${evento.nome}`)
      
      // Adicionar uma sala padrão baseada no nome do evento
      const nomeSala = `Sala ${evento.nome.replace(/[^a-zA-Z0-9 ]/g, '')}`
      const capacidadePadrao = 30
      
      await prisma.sala.create({
        data: {
          nome: nomeSala,
          capacidade: capacidadePadrao,
          eventoId: evento.id
        }
      })
      
      console.log(`   ✅ Adicionada sala: ${nomeSala} (capacidade: ${capacidadePadrao})`)
    }
    
    // Verificar se todos os eventos agora têm salas
    const eventosSemSalasAposCorrecao = await prisma.evento.findMany({
      where: {
        salas: {
          none: {}
        }
      }
    })
    
    if (eventosSemSalasAposCorrecao.length === 0) {
      console.log('\n✅ Todos os eventos agora têm salas associadas!')
    } else {
      console.log(`\n❌ Ainda existem ${eventosSemSalasAposCorrecao.length} eventos sem salas`)
    }
    
    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

corrigirEventosSemSalas()
