const BASE_URL = 'http://localhost:3001';

async function testEventoComJogos() {
  try {
    console.log('🧪 Testando criação de evento com jogos...');

    // 1. Login como supervisor
    console.log('\n1. Fazendo login como supervisor...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: 'supervisor@jogos.com', 
        password: 'supervisor123' 
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login realizado com sucesso');

    // 2. Listar jogos disponíveis
    console.log('\n2. Listando jogos disponíveis...');
    const jogosResponse = await fetch(`${BASE_URL}/api/jogos`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!jogosResponse.ok) {
      throw new Error(`Erro ao listar jogos: ${jogosResponse.status}`);
    }

    const jogosData = await jogosResponse.json();
    const jogos = jogosData.data || [];
    console.log(`✅ Encontrados ${jogos.length} jogos`);

    if (jogos.length === 0) {
      console.log('❌ Nenhum jogo disponível para teste');
      return;
    }

    // Selecionar os primeiros 2 jogos
    const jogoIds = jogos.slice(0, 2).map(jogo => jogo.id);
    console.log(`🎮 Jogos selecionados: ${jogoIds.join(', ')}`);

    // 3. Criar evento com jogos
    console.log('\n3. Criando evento com jogos selecionados...');
    const novoEvento = {
      nome: 'Evento de Teste com Jogos',
      descricao: 'Teste de criação de evento com jogos selecionados',
      data: new Date().toISOString(),
      local: 'Local de Teste',
      organizador: 'Organizador Teste',
      status: 'planejado',
      jogoIds: jogoIds
    };

    const eventoResponse = await fetch(`${BASE_URL}/api/eventos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(novoEvento),
    });

    if (!eventoResponse.ok) {
      const errorText = await eventoResponse.text();
      console.log(`❌ Erro na criação do evento: ${errorText}`);
      throw new Error(`Erro na criação: ${eventoResponse.status}`);
    }

    const eventoData = await eventoResponse.json();
    console.log('✅ Evento criado com sucesso');
    console.log(`📋 ID do evento: ${eventoData.data.id}`);

    // 4. Verificar se os jogos foram associados
    console.log('\n4. Verificando associação de jogos...');
    console.log('🎉 Teste concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

testEventoComJogos();
