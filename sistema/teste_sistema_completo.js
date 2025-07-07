const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

async function testarSistemaCompleto() {
  try {
    console.log('🧪 Testando sistema completo de certificados e status de eventos...')
    
    // Buscar um usuário supervisor
    const supervisor = await prisma.user.findFirst({
      where: { cargo: 'supervisor' }
    })
    
    // Buscar um aluno
    const aluno = await prisma.user.findFirst({
      where: { cargo: 'aluno' }
    })
    
    if (!supervisor || !aluno) {
      console.log('❌ Erro: Usuários necessários não encontrados')
      return
    }
    
    // Criar token do supervisor
    const tokenSupervisor = jwt.sign(
      { userId: supervisor.id, email: supervisor.email, cargo: supervisor.cargo },
      process.env.JWT_SECRET || 'seu-jwt-secret-aqui',
      { expiresIn: '1h' }
    )
    
    // Criar token do aluno
    const tokenAluno = jwt.sign(
      { userId: aluno.id, email: aluno.email, cargo: aluno.cargo },
      process.env.JWT_SECRET || 'seu-jwt-secret-aqui',
      { expiresIn: '1h' }
    )
    
    console.log(`✅ Supervisor: ${supervisor.email}`)
    console.log(`✅ Aluno: ${aluno.email}`)
    
    // Teste 1: Criar evento e alterar status
    console.log('\n🟢 Teste 1: Criar evento com status planejado')
    const responseEvento = await fetch('http://localhost:3004/api/eventos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenSupervisor}`
      },
      body: JSON.stringify({
        nome: 'Evento Teste Certificados',
        data: new Date('2025-08-25').toISOString(),
        local: 'Local de Teste',
        descricao: 'Evento para testar certificados',
        organizador: 'Sistema de Teste',
        status: 'planejado',
        salas: [
          { nome: 'Sala Teste', capacidade: 30 }
        ]
      })
    })
    
    const resultEvento = await responseEvento.json()
    
    if (responseEvento.ok && resultEvento.success) {
      const eventoId = resultEvento.data.id
      console.log(`✅ Evento criado: ${resultEvento.data.nome}`)
      
      // Teste 2: Alterar status para finalizado
      console.log('\n🟢 Teste 2: Alterar status para finalizado')
      const responseStatus = await fetch(`http://localhost:3004/api/eventos/${eventoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenSupervisor}`
        },
        body: JSON.stringify({ status: 'finalizado' })
      })
      
      const resultStatus = await responseStatus.json()
      
      if (responseStatus.ok && resultStatus.success) {
        console.log('✅ Status alterado para finalizado')
        
        // Teste 3: Gerar certificado
        console.log('\n🟢 Teste 3: Gerar certificado para o aluno')
        const responseCertificado = await fetch('http://localhost:3004/api/certificados', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenSupervisor}`
          },
          body: JSON.stringify({
            eventoId: eventoId,
            participanteId: aluno.id,
            horasParticipacao: 8
          })
        })
        
        const resultCertificado = await responseCertificado.json()
        
        if (responseCertificado.ok && resultCertificado.success) {
          console.log('✅ Certificado gerado com sucesso!')
          console.log(`📜 Código: ${resultCertificado.data.codigoCertificado}`)
          console.log(`⏰ Horas: ${resultCertificado.data.horasParticipacao}`)
          
          // Teste 4: Aluno buscar seus certificados
          console.log('\n🟢 Teste 4: Aluno buscar seus certificados')
          const responseCertificadosAluno = await fetch('http://localhost:3004/api/certificados', {
            headers: {
              'Authorization': `Bearer ${tokenAluno}`
            }
          })
          
          const resultCertificadosAluno = await responseCertificadosAluno.json()
          
          if (responseCertificadosAluno.ok && resultCertificadosAluno.success) {
            console.log(`✅ Aluno encontrou ${resultCertificadosAluno.data.length} certificado(s)`)
            
            // Teste 5: Supervisor buscar todos os certificados
            console.log('\n🟢 Teste 5: Supervisor buscar todos os certificados')
            const responseCertificadosSupervisor = await fetch('http://localhost:3004/api/certificados', {
              headers: {
                'Authorization': `Bearer ${tokenSupervisor}`
              }
            })
            
            const resultCertificadosSupervisor = await responseCertificadosSupervisor.json()
            
            if (responseCertificadosSupervisor.ok && resultCertificadosSupervisor.success) {
              console.log(`✅ Supervisor encontrou ${resultCertificadosSupervisor.data.length} certificado(s)`)
              
              console.log('\n🎊 TODOS OS TESTES PASSARAM!')
              console.log('✅ Criação de eventos funcionando')
              console.log('✅ Alteração de status funcionando')
              console.log('✅ Geração de certificados funcionando')
              console.log('✅ Busca de certificados por aluno funcionando')
              console.log('✅ Busca de certificados por supervisor funcionando')
              
            } else {
              console.log('❌ Erro ao buscar certificados como supervisor')
            }
          } else {
            console.log('❌ Erro ao buscar certificados como aluno')
          }
        } else {
          console.log('❌ Erro ao gerar certificado:', resultCertificado.error)
        }
      } else {
        console.log('❌ Erro ao alterar status:', resultStatus.error)
      }
      
      // Limpar evento de teste
      await prisma.evento.delete({ where: { id: eventoId } })
      console.log('\n🗑️  Evento de teste removido')
      
    } else {
      console.log('❌ Erro ao criar evento:', resultEvento.error)
    }
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testarSistemaCompleto()
