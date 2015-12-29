---
layout: post
title:  "Criando uma aplicação com AngularJS e Ruby on Rails - parte 02"
date:   2015-12-29 12:42:00
category: tecnologia
post_author: Paulo Henrique Bruce
comments: true
---

No post [anterior](http://feras.dito.com.br/posts/2015-12-29-criando-uma-aplicacao-com-angularjs-e-ruby-on-rails-parte-2/) falei como criar e configurar o projeto no Rails adaptado para Angular e mostrei como configurar a aplicação no AngularJS. Neste post, conforme prometido, irei mostrar uma simples maneira de consumir os dados do Rails através do AngularJS. Bora lá!

## _3. Consumindo os dados no AngularJS_

Primeiro, iremos criar uma Factory para organizar as requisições para o servidor. No diretório `app/asssets/javascripts/factories` vamos criar um arquivo chamado `recipeFactory`