## 🎮 Sistema de Controle de Jogos Lúdicos

Sistema de gerenciamento para eventos lúdicos, com controle de participantes e estatísticas gráficas dos jogos mais jogados.

## 📋 Funcionalidades

- ✅ Registro de quem jogou cada jogo
- 📊 Análise gráfica por evento e por sala
- 👥 Controle de número de jogadores por atividade
- 🕹️ Histórico dos jogos mais populares

## 🚀 Tecnologias Utilizadas

## 📝 Requisitos Funcionais
 ### Aluno
- RF01. Fazer login no sistema.
- RF06. Reservar um horário para jogar, na Sala do Lúdico.
- RF07. Não permitir reservas em horários conflitantes e verificar disponibilidade de vagas.
- RF08. Receber e-mails de confirmação e lembrete de reservas.
- RF09. Editar ou cancelar suas reservas.
- RF10. Limitação de cancelamentos por aluno, conforme regras do sistema.
- RF11. Receber e-mails ao editar ou cancelar reservas.
- RF13. Avaliar jogos apenas após confirmação de participação.
- RF14. Visualizar histórico de reservas e jogos realizados.
- RF18. Visualizar uma tela introdutória com sugestões ao primeiro acesso (usuários novatos).
- RF19. Visualizar preferências com base no histórico de uso (jogos mais jogados, tipos preferidos, tempo em sessões).

  ### Administrador
- RF01. Fazer login no sistema.
- RF02. Cadastrar jogos com os campos obrigatórios (ID, Nome, Código, Quantidade de Jogadores, Tipo, Idade Mínima, Data de Cadastro).
- RF15. O sistema deve registrar logs das ações administrativas, como cadastro, edição e exclusão de jogos.
- RF16. Definir e gerenciar níveis de permissão (administrador, monitor, participante interno, externo).
- RF10. Configurar regras de limite de cancelamento e período para cancelamento.

  ### Todos os Usuários (Logados)
  
- RF03. Visualizar uma listagem de jogos cadastrados.
- RF04. Ordenar a listagem por nome, data de cadastro, código e popularidade.
- RF05. Utilizar filtros para buscar jogos (por nome, código, número de jogadores, tipo).
- RF12. Acessar gráficos dinâmicos com métricas de popularidade e avaliação dos jogos.

  ### Sistema / Regras Internas
- RF20. Utilizar banco de dados MySQL e armazenar os jogos com a estrutura correta.
- RF15. Registrar logs administrativos no banco de dados.
- RF01. Armazenar senha com criptografia hash para segurança.
- RF07. Validar conflito de horários e disponibilidade no momento da reserva.
- RF10. Controlar e aplicar política de cancelamentos por aluno.
- RF12. Calcular métricas (número de reservas, avaliações) para exibir nos gráficos.
- RF13. Validar se o aluno participou da reserva antes de permitir avaliação.
- RF18. Identificar novos usuários para exibição da tela de introdução.
- RF19. Gerar preferências personalizadas para cada aluno com base em dados históricos.


