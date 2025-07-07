// Test script for API endpoints
const testEndpoints = async () => {
  try {
    // Test login first
    const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'supervisor@jogos.com',
        password: 'supervisor123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (loginData.success) {
      const token = loginData.token;
      
      // Test eventos endpoint
      const eventosResponse = await fetch('http://localhost:3002/api/eventos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const eventosData = await eventosResponse.json();
      console.log('Eventos response structure:', {
        success: eventosData.success,
        dataType: Array.isArray(eventosData.data) ? 'array' : typeof eventosData.data,
        dataLength: eventosData.data?.length || 0
      });
      
      // Test jogos endpoint
      const jogosResponse = await fetch('http://localhost:3002/api/jogos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const jogosData = await jogosResponse.json();
      console.log('Jogos response structure:', {
        success: jogosData.success,
        dataType: Array.isArray(jogosData.data) ? 'array' : typeof jogosData.data,
        dataLength: jogosData.data?.length || 0
      });
      
      // Test participantes endpoint
      const participantesResponse = await fetch('http://localhost:3002/api/participantes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const participantesData = await participantesResponse.json();
      console.log('Participantes response structure:', {
        success: participantesData.success,
        dataType: Array.isArray(participantesData.data) ? 'array' : typeof participantesData.data,
        dataLength: participantesData.data?.length || 0
      });
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testEndpoints();
