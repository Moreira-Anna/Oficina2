// Teste para verificar se o Prisma Client está funcionando corretamente
import { prisma } from '@/lib/prisma'

async function testPrismaEventoJogo() {
  try {
    // Tentar criar um relacionamento evento-jogo
    const resultado = await prisma.eventoJogo.create({
      data: {
        eventoId: 'test-id',
        jogoId: 'test-jogo-id',
        prioridade: 0
      }
    })
    
    console.log('Teste bem-sucedido:', resultado)
  } catch (error) {
    console.error('Erro no teste:', error)
  }
}

export default testPrismaEventoJogo
