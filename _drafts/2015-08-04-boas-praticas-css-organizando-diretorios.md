---
layout: post
title:  "Boas práticas de CSS: Organizando os diretórios"
date:   2015-08-04 09:00:00
categories: front-end css
post_author: Jordan Lenon
comments: true
meta_description: 'Boas práticas de CSS para organizar os seus assets e diretórios. Essa estrutura serve tanto para LESS quando para SASS'
---

Vamos aprender algumas boas práticas para organizar os seus assets e diretórios. Irei mostrar alguns exemplos e explicar a forma com que busco trabalhar. Você poderá seguir a risca ou adaptar para a forma com que achar melhor. Essa estrutura serve tanto para **LESS** quanto para **SASS**.

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
Arquivo usado como bootstrap de todo o projeto, nele eu importo os vendors, módulos, componentes e páginas. Seguindo uma ordem como no exemplo abaixo, onde evito problemas de sobrescrição de estilos.

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

## /modules
Aqui ficam todos os módulos que podem ser compartilhados junto ao projeto, você pode criar alerts, estilo de formulário, botões etc.

## /components
Muitos usam também como 'core', você pode inserir partes isoladas do layout, mas que não são necessariamente um módulo. Como por exemplo o header e o footer.

## /pages
Aqui vão os estilos personalizados para as páginas do projeto. Lembre sempre de fazer bom uso da modularização e evitar repetição e sobrescrição de estilos para que o código fique bem performático.

## /vendors
Diretório destinado para bibliotecas feitas por outros desenvolvedores como: twitter bootstrap, normalize etc.

## Conclusão
É sempre bom manter uma boa organização dos seus diretórios, pois isso evita possíveis problemas com a modularização do projeto, além disso, conforme o projeto vai crescendo, novas pessoas vão entrando na equipe e isso torna o compreendimento mais fácil para elas.
