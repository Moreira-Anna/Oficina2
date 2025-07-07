// Test inscricoes functionality
const testInscricoes = async () => {
  try {
    console.log('🧪 Testando funcionalidade de inscrições...');
    
    // 1. Login como aluno
    const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'aluno@jogos.com',
        password: 'aluno123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login aluno:', loginData.success);
    
    if (!loginData.success) {
      throw new Error('Login failed');
    }
    
    const token = loginData.token;
    
    // 2. Buscar eventos
    const eventosResponse = await fetch('http://localhost:3002/api/eventos', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const eventosData = await eventosResponse.json();
    console.log('✅ Eventos buscados:', eventosData.success);
    
    if (!eventosData.success || !eventosData.data?.length) {
      throw new Error('No eventos found');
    }
    
    const primeiroEvento = eventosData.data[0];
    console.log('📅 Testando com evento:', primeiroEvento.nome);
    
    // 3. Fazer inscrição
    const inscricaoResponse = await fetch('http://localhost:3002/api/inscricoes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        eventoId: primeiroEvento.id
      })
    });
    
    const inscricaoData = await inscricaoResponse.json();
    console.log('📝 Inscrição resultado:', inscricaoData);
    
    if (inscricaoData.success) {
      console.log('✅ Inscrição realizada com sucesso!');
      
      // 4. Verificar inscrições do usuário
      const minhasInscricoesResponse = await fetch('http://localhost:3002/api/inscricoes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const minhasInscricoesData = await minhasInscricoesResponse.json();
      console.log('📋 Minhas inscrições:', minhasInscricoesData.data?.length || 0);
      
      // 5. Testar cancelamento
      if (minhasInscricoesData.success && minhasInscricoesData.data?.length > 0) {
        const inscricaoId = minhasInscricoesData.data[0].id;
        
        const cancelResponse = await fetch(`http://localhost:3002/api/inscricoes/${inscricaoId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const cancelData = await cancelResponse.json();
        console.log('❌ Cancelamento:', cancelData.success ? 'sucesso' : 'falha');
      }
    } else {
      console.log('❌ Erro na inscrição:', inscricaoData.error);
    }
    
    console.log('🎉 Teste de inscrições concluído!');
    
  } catch (error) {
    console.error('💥 Erro no teste:', error.message);
  }
};

testInscricoes();
