---
layout: post
title:  "Criando uma aplicação com AngularJS e Ruby on Rails - parte 01"
date:   2015-12-28 19:12:00
category: frontend
post_author: Paulo Henrique Bruce
comments: true
---

O objetivo deste post é apresentar uma maneira de criar uma aplicação utilizando [AngularJS](https://angularjs.org/) e [Ruby on Rails](http://rubyonrails.org/). Como o conteúdo ficou maior do que pensei, eu o dividi em duas partes. Neste post você verá:

_1 - Criando e configurando o projeto Rails_
<br>
_2 - Configurando o AngularJS_

E no próximo post, veremos:

_2 - "Preparando a Receita"_
<br>
_3 - Consumindo os dados_

<div class="border-image">
<i>
  <strong>Disclaimer:</strong> para melhor compreensão dos posts, é recomendado que se tenha um conhecimento prévio das tecnologias de AngularJS e Ruby on Rails.
</i>
</div>
<br>

## _1 - Criando o projeto Rails_
Faremos um app que se chamará **_Veganizze_** e será um CRUD de receitas veganas. Neste exemplo, usaremos o MySQL como o banco de dados: `rails new veganizze -T -d mysql`.

Adicione ao `Gemfile`:

{% highlight ruby %}
source 'https://rails-assets.org' do
  gem 'rails-assets-jquery',  '~> 2.0.0'
  gem 'rails-assets-angular', '~> 1.4.0'
end
{% endhighlight %}

E depois, rode `bundle` no terminal.

Por enquanto, deixaremos o arquivo `application.js` assim:

{% highlight coffee %}
//= require jquery
//= require angular
{% endhighlight %}

Ok. Agora vamos criar um scaffold para as receitas:

{% highlight bash %}
rails g scaffold recipe title:string ingredients:text directions:text --no-helper --no-assets
{% endhighlight %}

Sem esquecer criar o banco de dados e rodar a _migration_: `rake db:create` e `rake db:migrate`. :)

No arquivo `routes.rb`, configuraremos o nosso root:

{% highlight ruby %}
root 'recipes#index'
{% endhighlight %}
Agora vamos verificar se já está criando as receitas: `rails s`:

![Index Veganizze](http://i.imgur.com/k7cRLTa.png){: .border-image }

![New Veganizze](http://i.imgur.com/L1xZ5aR.png){: .border-image }

![Index Veganizze](http://i.imgur.com/1YRQoY1.png){: .border-image }

Tudo ok!

## _2 - Configurando o AngularJS_

Para começar, vamos criar a estrutura dos arquivos do Angular. Dentro do diretório `app/assets/javascripts`, deixaremos assim:

        javascripts
        │   application.js
        ├───app
        │   ├───controllers
        │   ├───directives
        │   ├───factories
        │   ├───filters
        │   ├───pages
        │   └───services
        |       └───models
        │       app.js.coffee
        └───config
                routes.js.coffee

De volta ao arquivo `application.js`:

{% highlight coffee %}
//= require jquery
//= require angular

//= require ./app/app

//= require_tree ./config
//= require_tree ./app/controllers/
//= require_tree ./app/factories/
//= require_tree ./app/directives/
//= require_tree ./app/filters/
//= require_tree ./app/pages/
{% endhighlight %}

O módulo principal da aplicação ficará dentro de `app/assets/javascripts/app/app.js.coffee`:

{% highlight coffee %}
@app = angular.module 'Veganizze'
{% endhighlight %}

### Rotas

Nós vamos usar o [ui-router](https://github.com/angular-ui/ui-router/wiki) para controlar as rotas do lado do cliente. Ele é um _framework_ para AngularJS que permite que você organize sua interface por meio do conceito de [state machine](https://en.wikipedia.org/wiki/Finite-state_machine). Diferente da abortagem tradicional que é organizada por meio de `urls`.

Então vamos adicionar o `ui-router` em nosso projeto. Primeiro, vamos ao `Gemfile`:

{% highlight ruby %}
gem 'rails-assets-ui-router', '~> 0.2.0'
{% endhighlight %}

No arquivo `application.js`, vamos adicionar o `ui-router`:

{% highlight coffee %}
//= require angular
//= require ui-router
{% endhighlight %}

Em seguida, vamos injetar o ui-router no nosso módulo principal:

{% highlight coffee %}
# app/assets/javascripts/app/app.js.coffee
@app = angular.module 'Veganizze', [
  'ui.router'
]
{% endhighlight %}

Pronto. Agora falta criar o nosso primeiro estado. Ele se chamará "home" e será o _bootstrap_ da nossa aplicação.

No arquivo `routes.js.coffee`, configure:

{% highlight coffee %}
# app/assets/javascripts/config/routes.js.coffee
@app.config ['$stateProvider', '$urlRouterProvider', ($stateProvider, $urlRouterProvider) ->

  $urlRouterProvider
    .otherwise('/404')
  # $urlRouterProvider

  $stateProvider
    .state 'home',
      url: ''
      controller: 'ApplicationCtrl'
    # home
  # $stateProvider
] # config
{% endhighlight %}

No código acima estamos informando ao `ui-router` que, caso a página for requisitada e não for encontrada, será redirecionado para a página `/404`. Também estamos adicionando a nossa rota `root` do projeto chamada "home".

Precisaremos definir o nosso _bootstrap_ no `ApplicationController`:

{% highlight ruby %}
# app/controllers/application_controller.rb
def home
end
{% endhighlight %}

Lembre-se de criar a pasta `application` dentro de `app/views` e o arquivo `home.html.erb` dentro dela.

Vamos criar a rota do _bootstrap_ e alterar o root da aplicação:

{% highlight ruby %}
# config/routes.rb
root 'application#home'
get '*', to: 'application#home'
{% endhighlight %}

Agora vamos redirecionar o root da aplicação para a action `index` das receitas:

{% highlight ruby %}
# app/controllers/application_controller.rb
def home
  redirect_to recipes_path
end
{% endhighlight %}

Mais tarde voltaremos a falar sobre as rotas. Agora iremos configurar o nosso layout da aplicação, onde será renderizado o conteúdo do bootstrap.

Vamos ao arquivo `app/views/layouts/application.html.erb` e configurar para bindar as informações do `AngularJS`:

{% highlight html %}
<!DOCTYPE html>
<html>
<head>
  <title>Veganizze</title>
  <%= stylesheet_link_tag    "application" %>
  <%= javascript_include_tag "application" %>
  <%= csrf_meta_tags %>
</head>
<body ng-app="Veganizze" ng-controller="ApplicationCtrl">
  {% raw %}{{test}}{% endraw %}
  <div ui-view><%= yield %></div>
</body>
</html>
{% endhighlight %}

Em `ng-controller="ApplicationCtrl"` atribuimos o nosso controller principal. Como ainda não temos o arquivo de controller que foi atribuido `ApplicationCtrl`, então vamos criar:

{% highlight coffee %}
# app/assets/javascripts/app/controllers/applicationCtrl.js.coffee
@app.controller 'ApplicationCtrl', ['$scope', ($scope) ->
  $scope.test = "lorem ipsum"
] # ApplicationCtrl
{% endhighlight %}

Vamos ver se a página está renderizando "lorem ipsum":

![Examples ui-router states](http://i.imgur.com/CMBQ9bo.png){: .border-image }

Voltando a `app/views/layouts/application.html.erb`:

{% highlight html %}
<!DOCTYPE html>
<html>
<head>
  <title>Veganizze</title>
  <%= stylesheet_link_tag    "application" %>
  <%= javascript_include_tag "application" %>
  <%= csrf_meta_tags %>
</head>
<body ng-app="Veganizze" ng-controller="ApplicationCtrl">
  <div ui-view><%= yield %></div>
</body>
</html>
{% endhighlight %}

Em `ui-view`, ficará todos os estados com seus respectivos conteúdos adicionados na configuração das rotas do `ui-router`. Coloquei o `<%= yield %>` dentro do `ui-view` para caso for necessário, puxar alguma informação diretamente do `Rails`.

Já que estamos falando de estados e `ui-router`, vamos abrir o arquivo de rotas e configurar as rotas das receitas:

{% highlight coffee %}
$stateProvider
  .state 'home',
    url: ''
    controller: 'ApplicationCtrl'
  # home

  .state 'recipes',
    abstract: true
    views:
      '':
        controller: 'RecipesCtrl'
        templateUrl: '/recipes/layout.html'
      # ''
    # views
  # recipe

  .state 'recipes.index',
    url: '/recipes'
    views:
      'recipes':
        controller: 'RecipesIndexCtrl'
        templateUrl: '/recipes.html'
      # 'recipes'
    # views
  # recipe.index

  .state 'recipes.new',
    url: '/recipes/new'
    views:
      'recipes':
        controller: 'RecipesNewCtrl'
        templateUrl: '/recipes/new.html'
      # 'recipes'
    # views
  # recipe.new

  .state 'recipes.show',
    url: '/recipes/:id'
    views:
      'recipes':
        controller: 'RecipeShowController'
        templateUrl: (stateParams) -> '/recipes/' + stateParams.id + '.html'
      # 'recipes'
    # views
  # recipe.show

  .state 'recipes.edit',
    url: '/recipes/:id/edit'
    views:
      'recipes':
        controller: 'RecipesEditController'
        templateUrl: (stateParams) -> '/recipes/' + stateParams.id + '/edit.html'
      # 'recipes'
    # views
  # recipe.edit
# $stateProvider
{% endhighlight %}

Reparem que criei um estado abstrato chamado `recipes`, que servirá como um outro _bootstrap_ para os conteúdos pertencentes ao nó `recipes`. Isso significa que existirá um estado com um conteúdo estático com outros estados dentro dele. Para facilitar a compreensão veja o desenho abaixo:

![Examples ui-router states](http://i.imgur.com/25dgGGB.png){: .border-image }

No exemplo mostrado acima, o menu (elemento de cor cinza escuro) é um conteúdo abstrato que, ao mudar de página (estado), continua estático. Somente o conteúdo de cor cinza claro altera de acordo com a url. Isso sem precisar de recarregar a página.

Não entrarei muito em detalhe sobre o restante do código acima, pois o post já está ficando grandinho. O que basicamente ele faz é informar ao `ui-router` os estados das receitas, declarar suas respectivas `urls` e definir os `controllers` e hierarquias de estados para renderização na página.

Vamos adicionar nas rotas do Rails o layout para ser a página onde agrega o conteúdo das receitas:

{% highlight ruby %}
# config/routes.rb
resources :recipes do
  collection do
    get :layout
  end
end
{% endhighlight %}

Sem esquecer de criar a action em `app/controllers/recipes_controller.rb`:

{% highlight ruby %}
def layout
end
{% endhighlight %}

E a página `layout.html.erb` em `app/views/recipes/`:

{% highlight html %}
<div ui-view="recipes"></div>
{% endhighlight %}

Agora vamos ajustar a estrutura dos nossos assets. Dentro do diretório `app/assets/javascripts/app/pages` deixe assim:


      pages
      └───recipes
          ├───controllers
          │    indexCtrl.js.coffee
          │    showCtrl.js.coffee
          │    formCtrl.js.coffee
          │    newCtrl.js.coffee
          │    editCtrl.js.coffee
          │   recipesCtrl.js.coffe
          ├───directives
          ├───factories
          ├───filters
          └───services
              └───models
              recipes.js.coffee

No [próximo e último post](http://feras.dito.com.br/posts/criando-uma-aplicacao-com-angularjs-e-ruby-on-rails-parte-2/), eu mostrarei como consumir os dados do Rails através do AngularJS. Até a próxima :)