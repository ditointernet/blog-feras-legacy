---
layout: post
title:  "Arquitetura Dito 2017 - Parte 1: Motivação"
subtitle: Construir o Estado da Arte em Software que lida com Big Data, precisa mais do que bons conceitos. Como chegamos onde estamos e miramos mais alto!
date:   2017-03-24 12:42:00
category: tecnologia
post_author: Allan Sene Oliveira
comments: true
---


Não há nada mais satisfatório para uma empresa que ver seu site ou app bombando. Poucos web apps/sites no mundo têm milhões de pageviews ou usuários únicos por dia. Para efeito de comparação: o StackOveflow que está entre [os 50 sites mais acessados dos EUA](http://www.alexa.com/topsites/countries/US), só em 09 de fevereiro de 2016, teve que responder [209 Milhões de requisições](https://nickcraver.com/blog/2016/02/17/stack-overflow-the-architecture-2016-edition/). 

Quando a Dito começou, aposto que o Bruno e o André sonhavam longe e alto, mas mal sabiam como e quando iriam ter que lidar com a marca atual de *100 mil requisições por minuto* e *23 milhões de eventos coletados por dia*. 

Gosto de dizer que, lá por volta de 2011, o que vemos da nossa plataforma ~~momentâneamente~~ moderna de hoje era tudo mato: Railszão monolito, MySQL parrudo e cache no Redis pra todo lado. Obviamente, como devia mesmo ser, um MVP pivotável e de construção rápida para garantir a entrega de valor rápida com um custo ultra reduzido. Muito código com [_blame_](https://git-scm.com/docs/git-blame) de 2012 ainda sobrevive em alguns módulos e serviços, algo que alguns desenvolvedores podem ver com algum receio, mas o que eu particularmente acho de um [valor inestimável](https://www.joelonsoftware.com/2000/04/06/things-you-should-never-do-part-i/).

O intuito dessa série de posts é mostrar o estado atual de nossa arquitetura, quais métricas utilizamos no nosso dia a dia e, talvez o mais interessante, quais projetos nossos foram tão importantes para mantermos nossa plataforma eficiênte e escalável, a fim de crescermos sempre, sem solavancos, atendendo as necessidades de nossos clientes, que em momento algum não vão parar enquanto recuperamos o fôlego.

## Pés no Chão e cabeça nas Métricas!

Antes de procurar projetos inovadores, algo que faz brilhar os nossos olhos de desenvolvedores, precisamos sempre nos manter focados em métricas que mostram onde estamos e para onde queremos ir. A cultura [data-driven é essencial](https://medium.freecodecamp.com/what-growth-engineers-can-teach-us-about-engineering-f8bd38516e3e?gi=bca330aac0ff) para manter o sucesso de um time de tecnologia. Para entender nossas decisões arquiteturais, precisamos primeiramente tornar intrínsecas as análises de nossas principais métricas. Seguindo os conceitos pregados pelo [Manifesto Reativo](http://www.reactivemanifesto.org/) vamos dividí-los em 3 principais [KPIs](https://en.wikipedia.org/wiki/Performance_indicator):

### Disponibilidade

### Responsividade

### Elasticidade

## Foco nos Desafios



## Começando pelo fim

