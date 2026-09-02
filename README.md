# Workspace Cost Insights

# Dashboard de Gestão de Workspaces




## 1. Objetivo




Criar um painel de gerenciamento que ofereça uma visão consolidada da utilização e dos custos dos workspaces. O painel deve permitir acompanhar a evolução dos gastos, identificar os workspaces mais caros e consultar detalhadamente a origem de cada custo.




## 2. Público-alvo




O painel é destinado principalmente a usuários responsáveis pela gestão da infraestrutura, como administradores e coordenadores com permissão para visualizar custos e gerenciar workspaces.




## 3. Estrutura geral




O painel será composto pelas seguintes áreas:




1. Cabeçalho e filtros de período e seletor da turma.

2. Indicadores resumidos.

3. Gráficos de custos e utilização.

4. Área de acesso rápido.

5. Tabela de entradas de custo.

6. Detalhamento de uma entrada de custo.




## 3.1 Referência visual




O dashboard deve seguir a organização visual do Painel de Gerenciamento usado como referência no Eduvora:




- área de identificação do usuário à esquerda, reaproveitando o layout geral da plataforma;

- cabeçalho com título da página e ação de voltar;

- conteúdo principal em uma coluna central com rolagem;

- filtros apresentados horizontalmente no topo do conteúdo;

- indicadores resumidos em cards logo abaixo dos filtros;

- gráficos organizados em cards com bordas leves e espaçamento consistente;

- painel de **Acesso rápido** em uma coluna lateral direita;

- rodapé padrão da plataforma.




A referência deve ser utilizada para estrutura, espaçamento e hierarquia visual. Os textos, indicadores, ícones, cores semânticas e ações serão próprios do domínio de workspaces.




### Distribuição sugerida da tela




```text

┌───────────────┬────────────────────────────────────────────┬────────────────────┐

│ Identificação │ Cabeçalho: Gestão de Workspaces            │                    │

│ do usuário    ├────────────────────────────────────────────┤ Acesso rápido      │

│               │ Filtros: período e agrupamento             │                    │

│               ├─────────────────────┬──────────────────────┤ Gerenciar          │

│               │ Total workspaces    │ Custo do período     │ workspaces         │

│               ├─────────────────────┴──────────────────────┤                    │

│               │ Gráficos principais                       │ Ver ativos         │

│               │                                            │                    │

│               ├────────────────────────────────────────────┤ Ver falhas         │

│               │ Entradas de custo                          │                    │

└───────────────┴────────────────────────────────────────────┴────────────────────┘

```




Em telas menores, a coluna de acesso rápido deve ser movida para baixo do conteúdo principal ou transformada em um menu recolhível.




## 4. Filtros de período




Todas as informações do painel devem respeitar o mesmo período selecionado pelo usuário.




Opções de agrupamento:




- Dia.

- Mês.

- Ano.




Além do agrupamento, o usuário deve conseguir selecionar a data ou o intervalo desejado. Ao alterar o filtro, devem ser atualizados:




- indicadores;

- gráficos;

- ranking de workspaces;

- entradas de custo;

- informações da subaba de detalhes.




### Comportamento esperado




- **Dia:** apresenta dados do dia selecionado, preferencialmente agrupados por hora.

- **Mês:** apresenta dados do mês selecionado, agrupados por dia.

- **Ano:** apresenta dados do ano selecionado, agrupados por mês.




O filtro ativo deve permanecer visível para evitar que o usuário interprete valores de períodos diferentes como equivalentes.




## 5. Indicadores resumidos




### 5.1 Contagem de workspaces




Card com a quantidade de workspaces encontrados no período selecionado.




Informação principal:




- total de workspaces no período.




Informações complementares sugeridas:




- workspaces em execução;

- workspaces parados;

- workspaces com falha;

- workspaces removidos.




### 5.2 Custo do período




Card com a soma das entradas de custo registradas no período filtrado.




Esse valor representa o custo do período selecionado e não necessariamente o custo histórico total dos workspaces.




## 6. Gráficos do painel principal




O painel terá três gráficos.




### 6.1 Evolução de custo




**Tipo sugerido:** gráfico de linha.




Mostra como o custo evoluiu ao longo do período selecionado.




- Eixo X: hora, dia ou mês, conforme o filtro.

- Eixo Y: valor do custo.

- Tooltip: período, valor do intervalo e custo acumulado, quando aplicável.




Objetivo: identificar aumentos, quedas e picos de custo.




### 6.2 Top custos por workspace




**Tipo:** gráfico de barras.




Apresenta os workspaces com maior custo dentro do período selecionado.




- Eixo X: valor do custo.

- Eixo Y: nome do workspace.

- Ordenação: maior custo para o menor.

- Tooltip: nome, custo no período e tempo de uso.




O gráfico deve limitar inicialmente a quantidade de itens, por exemplo aos 5 ou 10 maiores custos, para preservar a legibilidade.




### 6.3 Distribuição de workspaces




**Tipo sugerido:** gráfico de rosca ou barras.




Apresenta a distribuição dos workspaces por status no período:




- em execução;

- parados;

- em criação;

- com falha;

- removidos.




> Este terceiro gráfico é uma proposta, pois sua finalidade ainda não foi especificada. Ele pode ser substituído por outro indicador de negócio.




## 7. Acesso rápido




A seção de acesso rápido deve destacar uma ação principal relacionada à gestão dos workspaces.




### Ação principal sugerida




**Gerenciar workspaces**




Ao ser acionada, direciona o usuário para a listagem completa de workspaces, onde poderá visualizar o estado e executar as ações permitidas pelo seu perfil.




Possíveis ações secundárias:




- visualizar workspaces ativos;

- visualizar workspaces com falha;

- abrir entradas de custo;

- exportar dados do período.




Visualmente, cada ação deve ser apresentada como um botão largo, seguindo o padrão da referência: texto centralizado e ícone alinhado à direita. As ações devem ser separadas e fáceis de identificar, sem concentrar comandos diferentes em um único botão.




> A descrição original da ação principal ficou incompleta. O comando exato e as permissões necessárias precisam ser confirmados antes da implementação.




## 8. Entradas de custo




A área de entradas de custo deve exibir os lançamentos individuais recebidos pelo sistema.




Cada linha deve conter:




| Campo | Descrição |

|---|---|

| Workspace | Nome do workspace relacionado à entrada. |

| Data/hora | Momento de referência ou registro do custo. |

| Serviço | Serviço responsável pela cobrança, quando disponível. |

| Custo da entrada | Valor cadastrado naquela entrada específica. |

| Ação | Opção para visualizar os detalhes. |




O campo de custo não deve mostrar o custo histórico total do workspace. Ele deve mostrar apenas o valor daquela entrada de custo.




### Comportamento da tabela




- Respeitar os filtros de dia, mês e ano.

- Permitir ordenação por data e custo.

- Permitir busca pelo nome do workspace.

- Utilizar paginação quando houver muitas entradas.

- Formatar valor e moeda de maneira consistente.

- Tornar o nome ou a ação **Visualizar** clicável.




## 9. Subaba de detalhes da entrada




Ao clicar em uma entrada, deve ser aberta uma subaba ou painel de detalhes sem perder o contexto do dashboard.




### 9.1 Identificação




- nome do workspace;

- identificador do workspace;

- período atualmente selecionado;

- status do workspace;

- usuário, grupo ou turma relacionada, quando disponível.




### 9.2 Informações da entrada




| Campo | Descrição |

|---|---|

| Service | Serviço que originou a cobrança. |

| Measured Service | Unidade ou recurso medido para calcular o custo. |

| Origin File | Arquivo ou fonte de onde a entrada foi importada. |

| Tempo de uso | Tempo durante o qual o workspace ou recurso esteve em uso. |

| Custo | Valor da entrada selecionada. |

| Data/hora | Momento de referência da medição. |




Caso `Origin File` contenha um caminho interno ou dado sensível, sua exibição deve depender das permissões do usuário.




## 10. Gráficos da subaba




Os gráficos da subaba devem considerar o workspace selecionado e continuar respeitando os filtros de dia, mês e ano.




### 10.1 Relação entre custo e horas de uso




**Tipo sugerido:** gráfico combinado de linha e barras ou gráfico de dispersão.




- Eixo X: período.

- Eixo Y primário: horas de uso.

- Eixo Y secundário: custo.




Objetivo: permitir comparar o tempo de utilização com o custo gerado.




### 10.2 Progressão de custo por máquina




**Tipo sugerido:** gráfico de linha.




Mostra a progressão do custo do workspace/máquina ao longo do período.




- Eixo X: hora, dia ou mês.

- Eixo Y: custo.

- Tooltip: período, custo do intervalo e valor acumulado.




Se um workspace tiver utilizado mais de uma configuração de máquina no período, cada configuração poderá ser representada por uma série diferente.




## 11. Regras de consistência




- Todos os valores devem indicar a moeda utilizada.

- O painel deve diferenciar custo da entrada, custo do período e custo histórico total.

- Os gráficos e tabelas devem utilizar o mesmo fuso horário.

- Períodos sem dados devem apresentar estado vazio, não erro.

- Workspaces removidos devem continuar aparecendo no histórico de custos.

- Valores importados novamente não devem ser contabilizados em duplicidade.

- O usuário só poderá consultar tenants e workspaces para os quais possui permissão.




## 12. Estados da interface




A interface deve prever:




- carregamento dos indicadores e gráficos;

- ausência de dados no período;

- falha ao consultar os custos;

- entrada sem workspace correspondente;

- workspace removido;

- valor ou moeda não informado;

- ausência de dados suficientes para montar um gráfico.




## 13. Wireframe conceitual




```text

┌──────────────────────────────────────────────────────────────────────┐

│ Gestão de Workspaces                  [Dia | Mês | Ano] [Período]   │

├───────────────────────┬───────────────────────┬──────────────────────┤

│ Total de workspaces   │ Custo do período      │ Acesso rápido        │

│ 128                   │ USD 1.245,30          │ Gerenciar workspaces │

├───────────────────────────────────┬──────────────────────────────────┤

│ Evolução de custo                │ Distribuição por status          │

│ Gráfico de linha                 │ Gráfico de rosca/barras          │

├───────────────────────────────────┴──────────────────────────────────┤

│ Top custos por workspace — gráfico de barras                        │

├──────────────────────────────────────────────────────────────────────┤

│ Entradas de custo                                                    │

│ Workspace | Data | Serviço | Custo da entrada | Visualizar           │

└──────────────────────────────────────────────────────────────────────┘




Ao selecionar uma entrada:




┌──────────────────────────────────────────────────────────────────────┐

│ Detalhes do workspace/entrada                                        │

│ Service | Measured Service | Origin File | Tempo de uso | Custo      │

├───────────────────────────────────┬──────────────────────────────────┤

│ Custo × horas de uso             │ Progressão de custo por máquina  │

└───────────────────────────────────┴──────────────────────────────────┘

```




## 14. Critérios de aceitação iniciais




1. O usuário consegue filtrar o painel por dia, mês e ano.

2. A contagem de workspaces é atualizada de acordo com o filtro.

3. Os três gráficos principais respondem ao mesmo filtro.

4. O ranking apresenta os workspaces de maior custo no período.

5. A tabela mostra o custo de cada entrada, e não apenas o total do workspace.

6. O usuário consegue abrir os detalhes de uma entrada.

7. A subaba apresenta `Service`, `Measured Service`, `Origin File`, tempo de uso e custo.

8. Os dois gráficos de detalhes são filtrados pelo workspace e pelo período.

9. A interface apresenta estados adequados de carregamento, vazio e erro.

10. As consultas respeitam tenant e permissões do usuário.




## 15. Pontos pendentes de definição




- Qual será exatamente o terceiro gráfico principal?

- Qual será o comando principal da área de acesso rápido?

- O filtro selecionará uma única data ou um intervalo de datas?

- Quantos workspaces aparecerão no ranking?

- A subaba será um modal, painel lateral ou nova seção da página?

- Quais perfis poderão visualizar valores de custo e `Origin File`?

- Qual moeda será usada e haverá conversão entre moedas?

- O custo exibido é bruto, estimado, faturado ou já confirmado pelo broker?

- O tempo de uso virá das entradas de custo ou será calculado pelo ciclo de vida do workspace?

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://cloud-clutter-cleanser.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/87874320-0d4c-493f-b204-6c01f48c9115).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
