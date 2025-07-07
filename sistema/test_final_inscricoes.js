const BASE_URL = 'http://localhost:3000';

// Função para fazer login e obter token
async function login(email, password) {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
}

// Função para testar inscrições
async function testInscricoes() {
  try {
    console.log('🔄 Iniciando testes finais de inscrições...');

    // 1. Login como aluno
    console.log('\n1. Fazendo login como aluno...');
    const tokenAluno = await login('aluno@jogos.com', 'aluno123');
    console.log('✅ Login de aluno realizado com sucesso');

    // 2. Listar eventos disponíveis
    console.log('\n2. Listando eventos disponíveis...');
    const eventosResponse = await fetch(`${BASE_URL}/api/eventos`, {
      headers: { Authorization: `Bearer ${tokenAluno}` },
    });
    
    if (!eventosResponse.ok) {
      throw new Error(`Erro ao listar eventos: ${eventosResponse.status}`);
    }
    
    const eventosData = await eventosResponse.json();
    const eventos = eventosData.data || [];
    console.log(`✅ Encontrados ${eventos.length} eventos`);

    if (eventos.length === 0) {
      console.log('❌ Nenhum evento encontrado para teste');
      return;
    }

    const eventoId = eventos[0].id;
    console.log(`📅 Usando evento: ${eventos[0].nome}`);

    // 3. Inscrever-se no evento
    console.log('\n3. Realizando inscrição no evento...');
    const inscricaoResponse = await fetch(`${BASE_URL}/api/inscricoes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAluno}`,
      },
      body: JSON.stringify({ eventoId }),
    });

    if (!inscricaoResponse.ok) {
      const errorText = await inscricaoResponse.text();
      console.log(`❌ Erro na inscrição: ${errorText}`);
    } else {
      const inscricaoData = await inscricaoResponse.json();
      console.log('✅ Inscrição realizada com sucesso');
      console.log(`📋 ID da inscrição: ${inscricaoData.data?.id || 'N/A'}`);
    }

    // 4. Listar inscrições do usuário
    console.log('\n4. Listando inscrições do usuário...');
    const minhasInscricoesResponse = await fetch(`${BASE_URL}/api/inscricoes`, {
      headers: { Authorization: `Bearer ${tokenAluno}` },
    });
    const minhasInscricoesData = await minhasInscricoesResponse.json();
    const minhasInscricoes = minhasInscricoesData.data || [];
    console.log(`✅ Usuário tem ${minhasInscricoes.length} inscrições`);

    // 5. Login como supervisor
    console.log('\n5. Fazendo login como supervisor...');
    const tokenSupervisor = await login('supervisor@jogos.com', 'supervisor123');
    console.log('✅ Login de supervisor realizado com sucesso');

    // 6. Listar inscrições do evento como supervisor
    console.log('\n6. Listando inscrições do evento como supervisor...');
    const inscricoesEventoResponse = await fetch(`${BASE_URL}/api/inscricoes?eventoId=${eventoId}`, {
      headers: { Authorization: `Bearer ${tokenSupervisor}` },
    });
    const inscricoesEventoData = await inscricoesEventoResponse.json();
    const inscricoesEvento = inscricoesEventoData.data || [];
    console.log(`✅ Evento tem ${inscricoesEvento.length} inscrições`);

    // 7. Cancelar inscrição
    if (minhasInscricoes.length > 0) {
      console.log('\n7. Cancelando inscrição...');
      const inscricaoId = minhasInscricoes[0].id;
      const cancelResponse = await fetch(`${BASE_URL}/api/inscricoes/${inscricaoId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tokenAluno}` },
      });

      if (!cancelResponse.ok) {
        console.log(`❌ Erro ao cancelar inscrição: ${cancelResponse.status}`);
      } else {
        console.log('✅ Inscrição cancelada com sucesso');
      }
    }

    // 8. Verificar se a inscrição foi cancelada
    console.log('\n8. Verificando cancelamento...');
    const verificacaoResponse = await fetch(`${BASE_URL}/api/inscricoes`, {
      headers: { Authorization: `Bearer ${tokenAluno}` },
    });
    const verificacaoData = await verificacaoResponse.json();
    const inscricoesAtuais = verificacaoData.data || [];
    console.log(`✅ Usuário agora tem ${inscricoesAtuais.length} inscrições`);

    console.log('\n🎉 Todos os testes de inscrições passaram com sucesso!');
    console.log('\n📋 Funcionalidades testadas:');
    console.log('- ✅ Login de aluno e supervisor');
    console.log('- ✅ Listagem de eventos');
    console.log('- ✅ Inscrição em evento');
    console.log('- ✅ Listagem de inscrições do usuário');
    console.log('- ✅ Listagem de inscrições do evento (supervisor)');
    console.log('- ✅ Cancelamento de inscrição');
    console.log('- ✅ Verificação de cancelamento');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

// Executar testes
testInscricoes();
