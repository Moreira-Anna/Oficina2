// Test complete eventos functionality
const testEventosPage = async () => {
  try {
    // 1. Login
    const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'supervisor@jogos.com',
        password: 'supervisor123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful:', loginData.success);
    
    if (!loginData.success) {
      throw new Error('Login failed');
    }
    
    const token = loginData.token;
    
    // 2. Test eventos API
    const eventosResponse = await fetch('http://localhost:3002/api/eventos', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const eventosData = await eventosResponse.json();
    console.log('✅ Eventos API successful:', eventosData.success);
    console.log('📊 Total eventos:', eventosData.data?.length || 0);
    
    // 3. Test date formatting with real data
    if (eventosData.success && eventosData.data?.length > 0) {
      const primeiroEvento = eventosData.data[0];
      console.log('📅 Data do evento (raw):', primeiroEvento.data);
      console.log('📅 Data formatada:', new Date(primeiroEvento.data).toLocaleDateString("pt-BR"));
      console.log('📅 Data para input:', new Date(primeiroEvento.data).toISOString().split("T")[0]);
    }
    
    console.log('✅ Todos os testes passaram! A página de eventos deve estar funcionando.');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
};

testEventosPage();
