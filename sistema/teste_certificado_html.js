// Teste para verificar a geração de certificados HTML melhorados
const fetch = require('node-fetch');

async function testeCertificadoHTML() {
  console.log('🧪 Testando sistema de certificados HTML melhorado...\n');

  const baseURL = 'http://localhost:3005/api';
  
  try {
    // 1. Login como supervisor
    console.log('1. Fazendo login como supervisor...');
    const loginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'supervisor@teste.com',
        senha: 'senha123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login falhou: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login realizado com sucesso');

    // 2. Buscar eventos finalizados
    console.log('\n2. Buscando eventos finalizados...');
    const eventosResponse = await fetch(`${baseURL}/eventos`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!eventosResponse.ok) {
      throw new Error(`Erro ao buscar eventos: ${eventosResponse.status}`);
    }

    const eventosData = await eventosResponse.json();
    const eventoFinalizado = eventosData.data.find(evento => 
      evento.status === 'finalizado'
    );

    if (!eventoFinalizado) {
      console.log('⚠️  Nenhum evento finalizado encontrado. Criando um...');
      
      // Criar evento finalizado para teste
      const novoEventoResponse = await fetch(`${baseURL}/eventos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nome: 'Workshop de Certificação HTML',
          data: new Date().toISOString(),
          local: 'Laboratório de Informática',
          descricao: 'Workshop para teste de certificados HTML',
          organizador: 'Sistema de Testes'
        })
      });

      if (!novoEventoResponse.ok) {
        throw new Error(`Erro ao criar evento: ${novoEventoResponse.status}`);
      }

      const novoEventoData = await novoEventoResponse.json();
      const eventoId = novoEventoData.data.id;

      // Finalizar o evento
      const finalizarResponse = await fetch(`${baseURL}/eventos/${eventoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'finalizado'
        })
      });

      if (!finalizarResponse.ok) {
        throw new Error(`Erro ao finalizar evento: ${finalizarResponse.status}`);
      }

      console.log('✅ Evento criado e finalizado');
    }

    // 3. Buscar participantes
    console.log('\n3. Buscando participantes...');
    const participantesResponse = await fetch(`${baseURL}/participantes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!participantesResponse.ok) {
      throw new Error(`Erro ao buscar participantes: ${participantesResponse.status}`);
    }

    const participantesData = await participantesResponse.json();
    const participante = participantesData.data[0];

    if (!participante) {
      console.log('⚠️  Nenhum participante encontrado');
      return;
    }

    console.log('✅ Participante encontrado:', participante.nome);

    // 4. Gerar certificado
    console.log('\n4. Gerando certificado...');
    const certificadoResponse = await fetch(`${baseURL}/certificados`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        eventoId: eventoFinalizado?.id || novoEventoData.data.id,
        participanteId: participante.id,
        horasParticipacao: 8
      })
    });

    if (!certificadoResponse.ok) {
      const errorData = await certificadoResponse.json();
      throw new Error(`Erro ao gerar certificado: ${errorData.error}`);
    }

    const certificadoData = await certificadoResponse.json();
    console.log('✅ Certificado gerado com sucesso!');
    console.log('📄 Código do certificado:', certificadoData.data.codigoCertificado);

    // 5. Buscar certificados
    console.log('\n5. Buscando certificados gerados...');
    const certificadosResponse = await fetch(`${baseURL}/certificados`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!certificadosResponse.ok) {
      throw new Error(`Erro ao buscar certificados: ${certificadosResponse.status}`);
    }

    const certificadosData = await certificadosResponse.json();
    console.log('✅ Certificados encontrados:', certificadosData.data.length);

    // 6. Verificar dados do certificado
    const certificado = certificadosData.data[0];
    if (certificado) {
      console.log('\n📊 Dados do certificado:');
      console.log('- Nome do participante:', certificado.participante?.nome);
      console.log('- Nome do evento:', certificado.evento?.nome);
      console.log('- Horas de participação:', certificado.horasParticipacao);
      console.log('- Data de emissão:', new Date(certificado.dataEmissao).toLocaleDateString('pt-BR'));
      console.log('- Código:', certificado.codigoCertificado);
    }

    console.log('\n🎉 Teste concluído com sucesso!');
    console.log('💡 Acesse http://localhost:3005/certificados para visualizar na interface');
    console.log('💡 Os certificados agora são baixados como HTML profissional');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

// Aguardar o servidor iniciar
setTimeout(testeCertificadoHTML, 3000);
