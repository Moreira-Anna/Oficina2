## 🎮 Sistema de Controle de Jogos Lúdicos

Sistema de gerenciamento para eventos lúdicos, com controle de participantes e estatísticas gráficas dos jogos mais jogados.

## 📋 Funcionalidades

- ✅ Registro de quem jogou cada jogo
- 📊 Análise gráfica por evento e por sala
- 👥 Controle de número de jogadores por atividade
- 🕹️ Histórico dos jogos mais populares

## 🚀 Tecnologias Utilizadas

## 📝 Requisitos Funcionais
***2.1. Requisitos Funcionais***

| Identificador | Descrição | Prioridade | Depende de |
| --- | --- | --- | --- |
| RF01 | O software deve permitir que o usuário faça cadastro e login no sistema. | M |  
| RF02 | O sistema deve permitir o cadastro de jogos. | M | RF01, RF10 |
| RF03 | O Software deve permitir ao usuário uma tela de visualização de jogos. | C | RF01, RF10, RF02 |
| RF04 | O software deve permitir ao usuário fazer uma reserva do jogo que deseja utilizar. | M | RF01, RF10, RF02, RF03 |
| RF05 | O sistema deve permitir ao usuário editar ou cancelar suas reservas de jogos. | M | RF01, RF10, RF02, RF03, RF04 |
| RF06 | O sistema deve permitir ao usuário avaliar os jogos utilizados. | S | RF01, RF10, RF02, RF03, RF04 |
| RF07 | O sistema deve permitir ao usuário não conflitar com outros horários marcados. | M | RF01, RF10, RF02, RF03, RF04, RF05 |
| RF08 | O sistema deve permitir ao usuário buscar jogos por meio de filtros (nomes, códigos, id). | S | RF01, RF10, RF02, RF03, RF04, RF06 |
| RF09 | O sistema deve permitir ao usuário visualizar suas preferências com base no histórico de jogos utilizados. | S | RF01, RF10, RF02, RF03, RF04, RF05, RF06, RF07 |
| RF10 | O sistema deve permitir a categorização de 2 opções, usuário (Para quem deseja utilizar o software para reservar um jogo), e usuário administrador (Para os membros do lúdico poderem manipular o que quiserem). | M | RF01 |

***2.2. Requisitos Não Funcionais***
| Identificador | Descrição | Prioridade | Depende de |
| --- | --- | --- | --- |
| RNF01 | O usuario deve ser capaz de acessar a homepage de qualquer outra parte. | S | RF01 |
| RNF02 | Deve ser intuitivo o suficiente para que qualquer estudante possa utilizá-lo sem necessidade de treinamento formal. | M | RF01, RF02, RF03, RF04 |
| RNF03 | O sistema deve responder às requisições do usuário em até 2 segundos para ações básicas (como login, reserva de jogos, avaliação). | M | RF01, RF04, RF06 |
| RNF04 | Deve suportar pelo menos 80 usuários simultâneos sem degradação significativa da performance. | M | RF01, RF02, RF03, RF04, RF05, RF06, RF07, RF08, RF09, RF10 |
| RNF06 | O sistema deve estar disponível 98% do tempo durante os horários de funcionamento do projeto Lúdico. | M | RF01, RF02, RF03, RF04, RF05, RF06, RF07, RF08, RF09, RF10 |
| RNF07 | O sistema deve ser capaz de realizar backup de dados a cada 12 horas para evitar perda de dados. | M | RF01, RF02, RF03, RF04, RF05, RF06, RF07, RF08, RF09, RF10 |
| RNF09 | sistema deve ser acessível por navegadores modernos (Chrome, Firefox, Edge) e dispositivos móveis (responsivo). | M | RF01 |
| RNF10 | Deve funcionar tanto em sistemas operacionais Windows quanto Android/iOS. | M | RF01 |
| RNF11 | O sistema LudCon deve seguir as diretrizes de tecnologia da informação e extensão da universidade, respeitando normas de segurança, acessibilidade e uso de software institucional.  | M | RF01, RF02, RF03, RF04, RF05, RF06, RF07, RF08, RF09, RF10 |
| RNF12 | A administração do sistema será responsabilidade dos universitários envolvidos no projeto Lúdico, sob supervisão de um professor ou coordenador, garantindo que a manutenção e operação estejam alinhadas com os objetivos acadêmicos do projeto. | C | RF10 |
| RNF13 | O sistema deverá utilizará Java para o backend, utilizando Spring boot. No frontend será utilizado TypeScript com Angular. No banco de dados, PostgreSQL. | M | RF01, RF02, RF03, RF04, RF05, RF06, RF07, RF08, RF09, RF10 |
| RNF14 | O sistema deve ser produzido utilizando a metódologia SCRUM. | M | RF01, RF02, RF03, RF04, RF05, RF06, RF07, RF08, RF09, RF10 |
| RNF15 | O acesso ao sistema deve ser controlado por autenticação de usuário (login e senha). | M | RF01 |
| RNF16 | Os dados pessoais dos usuários e administradores devem ser armazenados de forma segura, respeitando a LGPD. | M | RF01, RF10, RF05 |
| RNF17 | O sistema deve registrar logs de acesso e ações administrativas para auditoria. | M | RF01, RF10 |
| RNF18 | O sistema deve ser modular, facilitando alterações e atualizações futuras.  | S | RF01, RF02, RF03, RF04, RF05, RF06, RF07, RF08, RF09, RF10 |
| RNF19 | O código deve seguir boas práticas de desenvolvimento, com documentação básica e padronização. | M | RF01, RF02, RF03, RF04, RF05, RF06, RF07, RF08, RF09, RF10 
| RNF20 | O Sistema precisa dar autonomia para os administradores cancelar as reservas. | W | RNF13
