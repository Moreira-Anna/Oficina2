// Test evento editing
const testEventoEdit = async () => {
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
    
    // 2. Get eventos
    const eventosResponse = await fetch('http://localhost:3002/api/eventos', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const eventosData = await eventosResponse.json();
    console.log('✅ Eventos fetched:', eventosData.success);
    
    if (!eventosData.success || !eventosData.data?.length) {
      throw new Error('No eventos found');
    }
    
    // 3. Edit first evento
    const eventoToEdit = eventosData.data[0];
    console.log('📝 Editing evento:', eventoToEdit.nome);
    
    const updateData = {
      nome: eventoToEdit.nome + ' (Editado)',
      descricao: eventoToEdit.descricao + ' - Atualizado',
      data: eventoToEdit.data, // Keep same date
      local: eventoToEdit.local,
      organizador: eventoToEdit.organizador,
      status: eventoToEdit.status
    };
    
    const updateResponse = await fetch(`http://localhost:3002/api/eventos/${eventoToEdit.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });
    
    const updateResult = await updateResponse.json();
    console.log('📊 Update response:', updateResult);
    
    if (updateResult.success) {
      console.log('✅ Evento updated successfully:', updateResult.data.nome);
      console.log('📅 Date preserved:', updateResult.data.data);
    } else {
      console.error('❌ Update failed:', updateResult.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testEventoEdit();
