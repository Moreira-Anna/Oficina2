import { prisma } from '../src/lib/prisma'
import { hashPassword } from '../src/lib/auth'

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar usuário supervisor
  const supervisorSenha = await hashPassword('supervisor123')
  const supervisor = await prisma.user.create({
    data: {
      email: 'supervisor@jogos.com',
      nome: 'Supervisor Admin',
      senha: supervisorSenha,
      cargo: 'supervisor',
      idade: 30,
      telefone: '(11) 99999-9999'
    }
  })

  // Criar usuário aluno
  const alunoSenha = await hashPassword('aluno123')
  const aluno = await prisma.user.create({
    data: {
      email: 'aluno@jogos.com',
      nome: 'Aluno Teste',
      senha: alunoSenha,
      cargo: 'aluno',
      idade: 22,
      telefone: '(11) 88888-8888'
    }
  })

  // Criar usuários adicionais para compatibilidade
  const adminSenha = await hashPassword('admin123')
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      nome: 'Admin Sistema',
      senha: adminSenha,
      cargo: 'supervisor',
      idade: 35,
      telefone: '(11) 77777-7777'
    }
  })

  const studentSenha = await hashPassword('student123')
  const student = await prisma.user.create({
    data: {
      email: 'student@example.com',
      nome: 'Estudante Teste',
      senha: studentSenha,
      cargo: 'aluno',
      idade: 20,
      telefone: '(11) 66666-6666'
    }
  })

  // Criar jogos
  const jogos = await Promise.all([
    prisma.jogo.create({
      data: {
        nome: 'Uno',
        categoria: 'Cartas',
        descricao: 'Jogo de cartas clássico',
        minJogadores: 2,
        maxJogadores: 10,
        duracaoMedia: 30,
        material: JSON.stringify(['Baralho Uno'])
      }
    }),
    prisma.jogo.create({
      data: {
        nome: 'Xadrez',
        categoria: 'Estratégia',
        descricao: 'Jogo de tabuleiro estratégico',
        minJogadores: 2,
        maxJogadores: 2,
        duracaoMedia: 45,
        material: JSON.stringify(['Tabuleiro de Xadrez', 'Peças'])
      }
    }),
    prisma.jogo.create({
      data: {
        nome: 'Monopoly',
        categoria: 'Tabuleiro',
        descricao: 'Jogo de negócios e propriedades',
        minJogadores: 2,
        maxJogadores: 8,
        duracaoMedia: 90,
        material: JSON.stringify(['Tabuleiro', 'Dados', 'Peões', 'Dinheiro'])
      }
    }),
    prisma.jogo.create({
      data: {
        nome: 'Imagem & Ação',
        categoria: 'Desenho',
        descricao: 'Jogo de desenho e adivinhação',
        minJogadores: 4,
        maxJogadores: 12,
        duracaoMedia: 40,
        material: JSON.stringify(['Cartas', 'Papel', 'Lápis', 'Ampulheta'])
      }
    }),
    prisma.jogo.create({
      data: {
        nome: 'Damas',
        categoria: 'Estratégia',
        descricao: 'Jogo de tabuleiro clássico',
        minJogadores: 2,
        maxJogadores: 2,
        duracaoMedia: 25,
        material: JSON.stringify(['Tabuleiro de Damas', 'Peças'])
      }
    })
  ])

  // Criar eventos
  const eventos = await Promise.all([
    prisma.evento.create({
      data: {
        nome: 'Festival de Jogos de Verão',
        data: new Date('2024-12-15'),
        local: 'Centro Cultural',
        descricao: 'Grande evento com diversos jogos lúdicos',
        organizador: 'Equipe Lúdica',
        status: 'finalizado'
      }
    }),
    prisma.evento.create({
      data: {
        nome: 'Torneio de Estratégia',
        data: new Date('2025-01-20'),
        local: 'Biblioteca Municipal',
        descricao: 'Competição focada em jogos de estratégia',
        organizador: 'Clube de Xadrez',
        status: 'finalizado'
      }
    }),
    prisma.evento.create({
      data: {
        nome: 'Noite dos Jogos',
        data: new Date('2025-02-10'),
        local: 'Escola Municipal',
        descricao: 'Evento noturno com jogos diversos',
        organizador: 'Professora Maria',
        status: 'planejado'
      }
    })
  ])

  // Criar salas
  const salas = await Promise.all([
    prisma.sala.create({
      data: {
        nome: 'Sala Azul',
        capacidade: 20,
        eventoId: eventos[0].id
      }
    }),
    prisma.sala.create({
      data: {
        nome: 'Sala Verde',
        capacidade: 15,
        eventoId: eventos[0].id
      }
    }),
    prisma.sala.create({
      data: {
        nome: 'Sala Vermelha',
        capacidade: 25,
        eventoId: eventos[0].id
      }
    }),
    prisma.sala.create({
      data: {
        nome: 'Sala Principal',
        capacidade: 30,
        eventoId: eventos[1].id
      }
    }),
    prisma.sala.create({
      data: {
        nome: 'Sala Secundária',
        capacidade: 20,
        eventoId: eventos[1].id
      }
    })
  ])

  // Criar alguns usuários participantes adicionais
  const participantes = await Promise.all([
    prisma.user.create({
      data: {
        email: 'ana.silva@email.com',
        nome: 'Ana Silva',
        senha: await hashPassword('123456'),
        cargo: 'aluno',
        idade: 25
      }
    }),
    prisma.user.create({
      data: {
        email: 'bruno.santos@email.com',
        nome: 'Bruno Santos',
        senha: await hashPassword('123456'),
        cargo: 'aluno',
        idade: 28
      }
    }),
    prisma.user.create({
      data: {
        email: 'carla.oliveira@email.com',
        nome: 'Carla Oliveira',
        senha: await hashPassword('123456'),
        cargo: 'aluno',
        idade: 22
      }
    }),
    prisma.user.create({
      data: {
        email: 'daniel.costa@email.com',
        nome: 'Daniel Costa',
        senha: await hashPassword('123456'),
        cargo: 'aluno',
        idade: 30
      }
    })
  ])

  // Criar registros de jogos
  const registros = await Promise.all([
    prisma.registroJogo.create({
      data: {
        jogoId: jogos[0].id, // Uno
        eventoId: eventos[0].id,
        salaId: salas[0].id,
        dataInicio: new Date('2024-12-15T10:00:00'),
        dataFim: new Date('2024-12-15T10:30:00'),
        observacoes: 'Jogo muito animado!'
      }
    }),
    prisma.registroJogo.create({
      data: {
        jogoId: jogos[1].id, // Xadrez
        eventoId: eventos[1].id,
        salaId: salas[3].id,
        dataInicio: new Date('2025-01-20T14:00:00'),
        dataFim: new Date('2025-01-20T14:45:00'),
        observacoes: 'Partida equilibrada'
      }
    }),
    prisma.registroJogo.create({
      data: {
        jogoId: jogos[2].id, // Monopoly
        eventoId: eventos[0].id,
        salaId: salas[1].id,
        dataInicio: new Date('2024-12-15T15:00:00'),
        dataFim: new Date('2024-12-15T16:30:00'),
        observacoes: 'Jogo longo mas divertido'
      }
    })
  ])

  // Criar relacionamentos participante-registro
  await Promise.all([
    // Registro 1 (Uno) - Ana, Bruno, Carla
    prisma.participanteRegistro.create({
      data: {
        registroJogoId: registros[0].id,
        participanteId: participantes[0].id
      }
    }),
    prisma.participanteRegistro.create({
      data: {
        registroJogoId: registros[0].id,
        participanteId: participantes[1].id
      }
    }),
    prisma.participanteRegistro.create({
      data: {
        registroJogoId: registros[0].id,
        participanteId: participantes[2].id
      }
    }),
    // Registro 2 (Xadrez) - Bruno, Daniel
    prisma.participanteRegistro.create({
      data: {
        registroJogoId: registros[1].id,
        participanteId: participantes[1].id
      }
    }),
    prisma.participanteRegistro.create({
      data: {
        registroJogoId: registros[1].id,
        participanteId: participantes[3].id
      }
    }),
    // Registro 3 (Monopoly) - Ana, Carla, Daniel, Aluno
    prisma.participanteRegistro.create({
      data: {
        registroJogoId: registros[2].id,
        participanteId: participantes[0].id
      }
    }),
    prisma.participanteRegistro.create({
      data: {
        registroJogoId: registros[2].id,
        participanteId: participantes[2].id
      }
    }),
    prisma.participanteRegistro.create({
      data: {
        registroJogoId: registros[2].id,
        participanteId: participantes[3].id
      }
    }),
    prisma.participanteRegistro.create({
      data: {
        registroJogoId: registros[2].id,
        participanteId: aluno.id
      }
    })
  ])

  console.log('✅ Seed concluído com sucesso!')
  console.log('👤 Usuários criados:')
  console.log('   - Supervisor: supervisor@jogos.com / supervisor123')
  console.log('   - Admin: admin@example.com / admin123')
  console.log('   - Aluno: aluno@jogos.com / aluno123')
  console.log('   - Student: student@example.com / student123')
  console.log(`🎲 ${jogos.length} jogos criados`)
  console.log(`📅 ${eventos.length} eventos criados`)
  console.log(`🏠 ${salas.length} salas criadas`)
  console.log(`👥 ${participantes.length + 4} participantes criados`)
  console.log(`🎯 ${registros.length} registros de jogos criados`)
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
