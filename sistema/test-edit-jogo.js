// Test PUT jogo
const testEditJogo = async () => {
  try {
    // Login first
    const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'supervisor@jogos.com',
        password: 'supervisor123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login:', loginData.success ? 'success' : 'failed');
    
    if (!loginData.success) {
      console.error('Login failed:', loginData.error);
      return;
    }
    
    const token = loginData.token;
    
    // Get jogos first
    const jogosResponse = await fetch('http://localhost:3002/api/jogos', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const jogosData = await jogosResponse.json();
    console.log('Jogos fetched:', jogosData.success ? 'success' : 'failed');
    
    if (!jogosData.success || !jogosData.data || jogosData.data.length === 0) {
      console.error('No jogos found');
      return;
    }
    
    // Take first jogo to edit
    const jogoToEdit = jogosData.data[0];
    console.log('Editing jogo:', jogoToEdit.nome);
    console.log('Material field:', jogoToEdit.material);
    console.log('Material type:', typeof jogoToEdit.material);
    
    // Handle material parsing
    let materialArray;
    try {
      if (typeof jogoToEdit.material === 'string') {
        materialArray = JSON.parse(jogoToEdit.material);
      } else if (Array.isArray(jogoToEdit.material)) {
        materialArray = jogoToEdit.material;
      } else {
        materialArray = [];
      }
    } catch (e) {
      console.error('Error parsing material:', e.message);
      console.log('Raw material:', jogoToEdit.material);
      materialArray = [];
    }
    
    console.log('Parsed material:', materialArray);
    
    // Update the jogo
    const updateResponse = await fetch(`http://localhost:3002/api/jogos/${jogoToEdit.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        nome: jogoToEdit.nome + ' (Editado)',
        categoria: jogoToEdit.categoria,
        descricao: jogoToEdit.descricao + ' - Atualizado',
        minJogadores: jogoToEdit.minJogadores,
        maxJogadores: jogoToEdit.maxJogadores,
        duracaoMedia: jogoToEdit.duracaoMedia,
        material: materialArray
      })
    });
    
    const updateData = await updateResponse.json();
    console.log('Update result:', updateData);
    
    if (updateData.success) {
      console.log('Jogo updated successfully:', updateData.data.nome);
    } else {
      console.error('Update failed:', updateData.error);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testEditJogo();
