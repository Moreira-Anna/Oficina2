const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

async function testarCriacaoEventoSemSalas() {
  try {
    console.log('🧪 Testando criação de evento sem salas...')
    
    // Buscar um usuário supervisor
    const supervisor = await prisma.user.findFirst({
      where: { cargo: 'supervisor' }
    })
    
    if (!supervisor) {
      console.log('❌ Erro: Nenhum supervisor encontrado')
      return
    }
    
    console.log(`✅ Supervisor encontrado: ${supervisor.email}`)
    
    // Criar token JWT
    const token = jwt.sign(
      { userId: supervisor.id, email: supervisor.email, cargo: supervisor.cargo },
      process.env.JWT_SECRET || 'seu-jwt-secret-aqui',
      { expiresIn: '1h' }
    )
    
    // Teste 1: Tentar criar evento sem salas
    console.log('\n🔴 Teste 1: Criar evento sem salas (deve falhar)')
    const response1 = await fetch('http://localhost:3003/api/eventos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        nome: 'Evento Teste Sem Salas',
        data: new Date('2025-08-15').toISOString(),
        local: 'Local Teste',
        descricao: 'Teste de evento sem salas',
        organizador: 'Organizador Teste',
        status: 'planejado',
        jogoIds: []
      })
    })
    
    const result1 = await response1.json()
    console.log('Status:', response1.status)
    console.log('Resposta:', result1)
    
    if (response1.status === 400 && result1.error?.includes('sala')) {
      console.log('✅ Teste 1 PASSOU: API rejeitou evento sem salas')
    } else {
      console.log('❌ Teste 1 FALHOU: API deveria ter rejeitado evento sem salas')
    }
    
    // Teste 2: Tentar criar evento com array de salas vazio
    console.log('\n🔴 Teste 2: Criar evento com array de salas vazio (deve falhar)')
    const response2 = await fetch('http://localhost:3003/api/eventos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        nome: 'Evento Teste Salas Vazio',
        data: new Date('2025-08-15').toISOString(),
        local: 'Local Teste',
        descricao: 'Teste de evento com salas vazio',
        organizador: 'Organizador Teste',
        status: 'planejado',
        jogoIds: [],
        salas: []
      })
    })
    
    const result2 = await response2.json()
    console.log('Status:', response2.status)
    console.log('Resposta:', result2)
    
    if (response2.status === 400 && result2.error?.includes('sala')) {
      console.log('✅ Teste 2 PASSOU: API rejeitou evento com salas vazio')
    } else {
      console.log('❌ Teste 2 FALHOU: API deveria ter rejeitado evento com salas vazio')
    }
    
    // Teste 3: Tentar criar evento com sala inválida (sem nome)
    console.log('\n🔴 Teste 3: Criar evento com sala inválida (deve falhar)')
    const response3 = await fetch('http://localhost:3003/api/eventos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        nome: 'Evento Teste Sala Inválida',
        data: new Date('2025-08-15').toISOString(),
        local: 'Local Teste',
        descricao: 'Teste de evento com sala inválida',
        organizador: 'Organizador Teste',
        status: 'planejado',
        jogoIds: [],
        salas: [{ nome: '', capacidade: 30 }]
      })
    })
    
    const result3 = await response3.json()
    console.log('Status:', response3.status)
    console.log('Resposta:', result3)
    
    if (response3.status === 400 && result3.error?.includes('sala')) {
      console.log('✅ Teste 3 PASSOU: API rejeitou evento com sala inválida')
    } else {
      console.log('❌ Teste 3 FALHOU: API deveria ter rejeitado evento com sala inválida')
    }
    
    // Teste 4: Criar evento com salas válidas (deve passar)
    console.log('\n🟢 Teste 4: Criar evento com salas válidas (deve passar)')
    const response4 = await fetch('http://localhost:3003/api/eventos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        nome: 'Evento Teste Salas Válidas',
        data: new Date('2025-08-15').toISOString(),
        local: 'Local Teste',
        descricao: 'Teste de evento com salas válidas',
        organizador: 'Organizador Teste',
        status: 'planejado',
        jogoIds: [],
        salas: [
          { nome: 'Sala Principal', capacidade: 30 },
          { nome: 'Sala Secundária', capacidade: 20 }
        ]
      })
    })
    
    const result4 = await response4.json()
    console.log('Status:', response4.status)
    console.log('Resposta:', result4)
    
    if (response4.status === 200 && result4.success) {
      console.log('✅ Teste 4 PASSOU: API criou evento com salas válidas')
      
      // Verificar se as salas foram criadas
      const eventoId = result4.data.id
      const evento = await prisma.evento.findUnique({
        where: { id: eventoId },
        include: { salas: true }
      })
      
      console.log(`📋 Evento criado com ${evento.salas.length} salas:`)
      evento.salas.forEach((sala, index) => {
        console.log(`   ${index + 1}. ${sala.nome} (capacidade: ${sala.capacidade})`)
      })
      
      // Limpar o evento de teste
      await prisma.evento.delete({ where: { id: eventoId } })
      console.log('🗑️  Evento de teste removido')
    } else {
      console.log('❌ Teste 4 FALHOU: API deveria ter criado evento com salas válidas')
    }
    
    console.log('\n🏁 Testes concluídos!')
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testarCriacaoEventoSemSalas()
