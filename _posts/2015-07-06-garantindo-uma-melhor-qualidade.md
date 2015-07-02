---
layout: post
title:  "Garantindo uma melhor qualidade de código"
date:   2015-07-06 09:10:31
categories: tecnologia
post_author: Sérgio Miranda
---

Ao longo do processo de desenvolvimento, todo desenvolvedor de software possui a seguinte certeza: mudanças acontecerão. Para atender às demandas do mercado e dos clientes que estão sendo atendidos, o software sofre alterações. Estas, quando não bem planejadas e executadas, levam ao aparecimento do fenômeno conhecido como erosão arquitetural. É nesse momento que a manutenibilidade do sistema que está sendo desenvolvido começa a degradar: adicionar novas features tende a ser mais difícil, problemas de escalabilidade começam a vir à tona, etc. O problema de erosão arquitetural é ainda mais servero em linguagens dinâmicas, devido a alguns recursos providos por tais linguagens (eg., invocações dinâmicas, construções dinâmicas, eval, etc.). À medida que novos desenvolvedores são integrados ao time para ajudar a evoluir e manter o software, o problema pode se complicar ainda mais. Pensando nesses pontos descritos, a Dito criou um processo que guia a equipe de desenvolvimento para que o fenômeno de erosão arquitetural seja minimizado no software criado pela empresa. Então, vamos entender como o processo funciona.

Desenvolvimento
---------------

A Dito utiliza o GitHub, tanto para gerenciar sua base de código, quanto para promover a interação entre seus desenvolvedores. Quando uma nova funcionalidade deve ser desenvolvida, é planejada por mais de um desenvolvedor, validada por outro e o acompanhamento é feito pelo [Trello](https://trello.com/). Antes do planejamento, os desenvolvedores precisam estar certos de que entenderam perfeitamente como a nova funcionalidade deve se comportar e quais são os casos de validação que devem ser tratados com cuidado. Para agilizar a comunicação, utilizamos o [Slack](https://slack.com/). Após o entendimento, a funcionalidade é detalhada e uma estimativa é calculada para a tarefa. Em seguida, o desenvolvimento é iniciado seguindo os padrões de conduta de escrita de código adotado pela [Dito](https://github.com/bbatsov/ruby-style-guide). Acreditamos que padronizando a maneira de escrever o código, torna-se mais fácil nivelarmos as discussões sobre sintaxe. Logo após a finalização do desenvolvimento da tarefa, é aberto um [pull request](https://help.github.com/articles/creating-a-pull-request/) no GitHub detalhando o que foi feito e o que se espera de resultado após testar a nova funcionalidade. Assim, a tarefa é passada para a etapa de Quality Assurance (QA).

QA
--

Nesta etapa, alguns passos devem ser seguidos pelo desenvolvedor que realizará o QA: O primeiro item a ser verificado é se os testes automatizados foram desenvolvidos, pois, com isso, garantimos uma maior confiança para realizar posteriores manutenções. Ainda é necessário que todos os testes estejam passando em nosso servidor de [integração contínua](https://circleci.com/). Logo em seguida, o segundo item a ser verificado é a nota que o código possui no [CodeClimate](http://codeclimate.com/). Através da análise estática do código, conseguimos detectar métodos complexos, códigos duplicados e até falhas de segurança. Após garantir que esses dois primeiros pontos estão ok, é feito o teste da nova funcionalidade no nosso servidor de homologação. Assim conseguimos garantir que a funcionalidade está se comportando da maneira esperada em um ambiente bastante parecido com o ambiente de produção. Somente após cumprir os passos anteriores é que o desenvolvedor analisará o código feito para realizar os comentários que julgar relevante. Após todos esses passos, garantimos que o conhecimento da base de código será disseminado entre todos os integrantes da equipe e o código produzido no final será de maior qualidade, uma vez que vários desenvolvedores estão interagindo com o mesmo.

Deploy em produção
------------------

A última etapa pela qual uma nova funcionalidade passa é o deploy em produção. Após movimentar-se por todas as etapas anteriores, a funcionalidade é enviada para os servidores de produção. O release é feito de maneira controlada, ou seja, é colocado no ar aos poucos. Retiramos um servidor de produção do nosso [loadbalancer](https://en.wikipedia.org/wiki/Load_balancing_(computing)) e realizamos o deploy nesse servidor. O time interno testa a nova funcionalidade com dados reais de produção e garante que tudo está operando normalmente. Em seguida, o servidor é colocado de volta ao loadbalance e o processo se repete para o próximo servidor. Com essa entrega gradativa garantimos que nosso software se comportará de maneira estável durante todo o processo. Somente após a confirmação total de que tudo está funcionando corretamente em produção é que o branch da nova funcionalidade é levado para o branch master do repositório.

Acompanhamento
--------------

Durante a fase de deploy em produção, o time acompanha em tempo real algumas métricas que indicam se todo o sistema está se comportando normalmente. Para acompanhar o tempo de resposta dos sistemas e os erros que podem vir a acontecer, é utilizado o Newrelic. Dentro do Newrelic temos vários alertas configurados para serem disparados caso alguma métrica saia do comportamento esperado. Os logs são acompanhados através do LogEntries. Nele encontram-se todos os logs que são gerados pelo sistema e algumas queries que geram inteligência em cima dos logs para que seja possível identificar anomalias.

Todo esse processo criado tem como finalidade aumentar a qualidade de entrega do time como um todo e diminuir os efeitos causado pela erosão arquitetural. Ainda, todo o time é beneficiado através da disseminação de conhecimento proporcionada pelo pull request feito. A confiança de que tudo ocorrerá bem em produção é maior, pois o QA procura garantir ao máximo que tudo está bem. Para completar o ciclo, a funcionalidade é implantada aos poucos nos servidores de produção, pois, dessa forma, caso aconteça algum problema, conseguimos controlar rapidamente. É dessa forma que a Dito mantem a organização e a qualidade do software produzido!
