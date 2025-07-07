// Test date formatting
const testDateFormatting = () => {
  const testData = {
    id: "test",
    nome: "Evento Teste",
    data: "2025-02-10T00:00:00.000Z", // formato que vem da API
    local: "Local Teste",
    organizador: "Org Teste",
    status: "planejado"
  };

  console.log("Data original:", testData.data);
  console.log("Data como objeto Date:", new Date(testData.data));
  console.log("Data formatada:", new Date(testData.data).toLocaleDateString("pt-BR"));
  
  // Simular o input de formulário
  const formattedForInput = new Date(testData.data).toISOString().split("T")[0];
  console.log("Data para input:", formattedForInput);
};

testDateFormatting();
