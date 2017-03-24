---
layout: post
title:  "Arquitetura Dito 2017 - Parte 1: Motivação"
date:   2015-12-29 12:42:00
category: tecnologia
post_author: Allan Sene Oliveira
comments: true
---

Não há nada mais satisfatório para uma empresa que ver seu site ou app bombando. Poucos web apps/sites no mundo têm milhões de pageviews ou usuários únicos por dia. A efeito de comparação: o StackOveflow que está entre [os 50 sites mais acessados dos EUA](http://www.alexa.com/topsites/countries/US), só em 09 de fevereiro de 2016, teve que responder [209 Milhões de requisições](https://nickcraver.com/blog/2016/02/17/stack-overflow-the-architecture-2016-edition/). 

Quando a Dito começou, aposto que o Bruno e o André sonhavam longe e alto, mas mal sabiam como e quando iriam ter que lidar com a marca atual de *100 mil requisições por minuto* e *23 milhões de eventos coletados por dia*. 

Gosto de dizer que, lá por volta de 2011, o que vemos da nossa plataforma _momentâneamente_ moderna de hoje era tudo mato: Railszão monolito, MySQL parrudo e cache no Redis pra todo lado. Obviamente, como devia mesmo ser, um MVP pivotável e de construção rápida para garantir a entrega de valor rápida com um custo ultra reduzido. Muito código com blame de 2012 ainda sobrevive em alguns módulos e serviços, algo que alguns desenvolvedores podem ver com algum receio, mas o que eu particularmente acho de um [valor inestimável](https://www.joelonsoftware.com/2000/04/06/things-you-should-never-do-part-i/).

O intuito dessa série de posts é mostrar o estado atual de nossa arquitetura, quais métricas utilizamos no nosso dia a dia e, talvez o mais interessante, quais projetos nossos foram tão importantes para mantermos nossa plataforma [reativa e escalável](), a fim de crescermos sempre, sem solavancos inesperados.

