---
layout: post
title:  "Boas práticas de CSS: Organizando os diretórios"
date:   2015-08-04 09:00:00
categories: frontend
post_author: Jordan Lenon
comments: true
meta_description: 'Boas práticas de CSS para organizar os seus assets e diretórios. Essa estrutura serve tanto para LESS quando para SASS'
---

Vamos aprender algumas boas práticas para organizar os seus assets e diretórios. Irei mostrar alguns exemplos e explicar cada um deles. Essa estrutura serve tanto para **LESS** quanto para **SASS**.

## Estrutura de diretórios
{% highlight php %}
sass/
----- main.scss
----- modules/
---------- alert.scss
---------- box.scss
---------- form.scss
---------- button.scss
----- components/
---------- header.scss
---------- footer.scss
---------- toolbar.scss
----- pages/
---------- login.scss
---------- home.scss
---------- dashboard.scss
----- vendors/
---------- mixins.scss
---------- normalize.scss
{% endhighlight %}

## main.scss
Arquivo usado como bootstrap de todo o projeto, nele importamos os vendors, módulos, componentes e páginas. Seguindo uma ordem como no exemplo abaixo, onde evitamos problemas de sobrescrição de estilos.

{% highlight sass %}
// VENDOR
@import 'vendor/elements';
@import 'vendor/normalize';

// GLOBAL STYLE
@import 'fonts';
@import 'scaffolding';

// GENERAL MODULES
@import 'modules/box';
@import 'modules/form';
@import 'modules/button';
@import 'modules/icon';
@import 'modules/alert';
@import 'modules/table';
@import 'modules/modal';

// PANEL COMPONENTS
@import 'components/header';
@import 'components/footer';
@import 'components/toolbar';

// PAGES
@import 'pages/login';
@import 'pages/dashboard';
@import 'pages/account';
{% endhighlight %}

## modules
Aqui ficam todos os módulos que podem ser compartilhados junto ao projeto, você pode criar alerts, estilo de formulário, botões etc.

## components
Muitos usam também como 'core', você pode inserir partes isoladas do layout, mas que não são necessariamente um módulo. Como por exemplo o header e o footer.

## pages
Aqui vão os estilos personalizados para as páginas do projeto. Lembre sempre de fazer bom uso da modularização e evitar repetição e sobrescrição de estilos para que o código fique bem performático.

## vendors
Diretório destinado para bibliotecas feitas por outros desenvolvedores como: twitter bootstrap, normalize etc.

## Mantenha seus arquivos organizados
É sempre bom manter uma boa organização dos seus diretórios, pois isso evita possíveis problemas com a modularização do projeto, além disso, conforme o projeto vai crescendo, novas pessoas vão entrando na equipe e isso torna o compreendimento mais fácil para elas.

## Alguns artigos para auxiliar no estudo
* [Organizando projeto Sass](http://helabs.com/blog/2014/02/17/organizando-projeto-sass/)
* [A Look at Different Sass Architectures](http://www.sitepoint.com/look-different-sass-architectures/)
* [Architecture for a Sass Project](http://www.sitepoint.com/architecture-sass-project/)
* [How to structure a Sass project](http://thesassway.com/beginner/how-to-structure-a-sass-project)
