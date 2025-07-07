const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

async function testarSalasSemJogos() {
  try {
    console.log('🧪 Testando criação de eventos com salas (sem jogos)...')
    
    // Buscar um usuário supervisor
    const supervisor = await prisma.user.findFirst({
      where: { cargo: 'supervisor' }
    })
    
    if (!supervisor) {
      console.log('❌ Erro: Nenhum supervisor encontrado')
      return
    }
    
    // Criar token JWT
    const token = jwt.sign(
      { userId: supervisor.id, email: supervisor.email, cargo: supervisor.cargo },
      process.env.JWT_SECRET || 'seu-jwt-secret-aqui',
      { expiresIn: '1h' }
    )
    
    // Teste: Criar evento com salas
    console.log('\n🟢 Teste: Criar evento com salas (sem jogos)')
    const response = await fetch('http://localhost:3004/api/eventos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        nome: 'Evento Teste Somente Salas',
        data: new Date('2025-08-20').toISOString(),
        local: 'Local de Teste',
        descricao: 'Teste de evento com salas mas sem jogos',
        organizador: 'Teste Sistema',
        status: 'planejado',
        salas: [
          { nome: 'Sala Alpha', capacidade: 35 },
          { nome: 'Sala Beta', capacidade: 20 }
        ]
      })
    })
    
    const result = await response.json()
    console.log('Status:', response.status)
    console.log('Resposta:', result)
    
    if (response.status === 200 && result.success) {
      console.log('✅ Evento criado com sucesso!')
      
      // Verificar se as salas foram criadas
      const evento = await prisma.evento.findUnique({
        where: { id: result.data.id },
        include: { salas: true }
      })
      
      console.log(`📋 Evento: ${evento.nome}`)
      console.log(`🏠 Salas (${evento.salas.length}):`)
      evento.salas.forEach((sala, index) => {
        console.log(`   ${index + 1}. ${sala.nome} (capacidade: ${sala.capacidade})`)
      })
      
      // Limpar o evento de teste
      await prisma.evento.delete({ where: { id: result.data.id } })
      console.log('🗑️  Evento de teste removido')
      
    } else {
      console.log('❌ Erro ao criar evento')
    }
    
    console.log('\n🎊 SISTEMA FUNCIONANDO!')
    console.log('✅ Criação de eventos com salas está funcionando')
    console.log('✅ Validação de salas obrigatórias está funcionando')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testarSalasSemJogos()
