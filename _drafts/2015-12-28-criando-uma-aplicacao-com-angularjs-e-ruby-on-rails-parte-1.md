---
layout: post
title:  "Criando uma aplicação com AngularJS e Ruby on Rails - parte 01"
date:   2015-12-28 19:12:00
category: tecnologia
post_author: Paulo Henrique Bruce
comments: true
---

Como o título já sugere, neste post eu explicarei uma maneira de criar uma aplicação com [AngularJS](https://angularjs.org/) com o Rails. Como o conteúdo ficou maior do que eu imaginava, eu o dividi em duas partes. Portanto, neste post veremos:

    1. Criando e configurando o projeto Rails
    2. Configurando o AngularJS

E no próximo post, veremos:

    2. Preparando a Receita...
    3. Consumindo os dados

## _1. Criando o projeto Rails_
O nosso app se chamará **_Veganizze_** e será um CRUD de receitas veganas. Não usaremos testes e usaremos o MySQL como o banco de dados, portanto, o nosso primeiro comando será `rails new veganizze -T -d mysql`.

Vamos deixar o arquivo `Gemfile` desse jeito:

{% highlight ruby %}
source 'https://rubygems.org' do
  gem 'rails',        '4.0.0'
  gem 'mysql2',       '~> 0.3.0'
  gem 'sass-rails',   '~> 4.0.0'
  gem 'uglifier',     '>= 1.3.0'
  gem 'coffee-rails', '~> 4.0.0'
end

source 'https://rails-assets.org' do
  gem 'rails-assets-jquery',  '~> 2.0.0'
  gem 'rails-assets-angular', '~> 1.4.0'
end
{% endhighlight %}

Por enquanto, deixaremos o arquivo application.js.coffee assim:

{% highlight coffee %}
//= require jquery
//= require angular
{% endhighlight %}

Ok. Agora vamos criar um scaffold para as receitas:

{% highlight bash %}
rails g scaffold recipe title:string ingredients:text directions:text --no-helper --no-assets
{% endhighlight %}

Sem esquecer de rodar a _migration_: `rake db:migrate`. :)

Agora vamos verificar se já está criando as receitas: `rails s`:

![Index Veganizze](http://i.imgur.com/k7cRLTa.png){: .border-image .image-center}

![New Veganizze](http://i.imgur.com/L1xZ5aR.png){: .border-image .image-center}

![Index Veganizze](http://i.imgur.com/1YRQoY1.png){: .border-image .image-center}

Tudo ok!

### Renderização

A cada nova requisição feita no Browser, o Rails renderiza o esqueleto da aplicação (que fica na em `app/views/layouts/application.html.erb`). Como agora iremos fazer as requisições via ajax no AngularJS, nós precisaremos evitar que isso aconteça. Caso contrário, a cada página visitada, teria ela própria sendo renderizada dentro dela múltiplas vezes.

Uma maneira evitar que isso aconteça é adicionando no arquivo `application_controller.rb` o seguinte método:

{% highlight ruby %}
def render_for_angular
  if params[:format] == 'html' || params[:format].blank?
    should_render_empty_page = %W{
      recipes#layout
      recipes#index
      recipes#show
      recipes#new
      recipes#edit
    }.include? params[:controller] + '#' + params[:action]

    render file: '/application/empty' if should_render_empty_page
  end
end
{% endhighlight %}

O método acima pede ao Rails que renderize uma página em branco a cada vez que a Rota bater no `controller#action` que estão adicionados dentro do array `should_render_empty_page`.

Essa action deve ser carregada antes do ApplicationController ter sido processado: `before_filter: :render_for_angular`

Não se esqueça de criar o arquivo `empty.html.erb` no diretório `app/views/application`.

## _2. Configurando o AngularJS_

Para começar, vamos criar a estrutura dos arquivos do Angular. Dentro do diretório `app/assets/javascripts`, deixaremos assim:

        javascripts
        │   application.js.coffee
        ├───app
        │   ├───controllers
        │   ├───directives
        │   ├───factories
        │   ├───filters
        │   └───services
        |       └───models
        │       app.js.coffee
        └───config
                csrf.js.coffee
                routes.js.coffee

Vamos mudar o arquivo application.js.coffee agora:

{% highlight coffee %}
//= require jquery
//= require angular

//= require ./app/app

//= require_tree ./config
//= require_tree ./app/controllers/
//= require_tree ./app/factories/
//= require_tree ./app/directives/
//= require_tree ./app/filters/
{% endhighlight %}

O módulo principal da aplicação ficará dentro do arquivo `app/assets/javascripts/app/app.js.coffee`:

{% highlight coffee %}
@app = angular.module 'Veganizze'
{% endhighlight %}

### Rotas

Nós iremos usar o [ui-router](https://github.com/angular-ui/ui-router/wiki) para controlar as rotas do lado do cliente. Ele é um _framework_ para AngularJS que permite que você organize sua aplicação por meio de estados declarados no nó `state`. Para saber mais sobre o ui-router, clique [aqui](https://github.com/angular-ui/ui-router/wiki).

Vamos adicionar o ui-router em nosso projeto. Primeiro, vamos acrescentar o ui-router na Gemfile:

{% highlight ruby %}
  gem 'rails-assets-ui-router', '~> 0.2.0'
{% endhighlight %}

Depois, no arquivo `application.js.coffee`, adicionar o `ui-router`:

{% highlight coffee %}
//= require angular
//= require ui-router
{% endhighlight %}

Em seguida, vamos injetar o ui-router no nosso módulo principal (`app/assets/javascripts/app/app.js.coffee`):

{% highlight coffee %}
@app = angular.module 'Veganizze', [
  'ui.router'
]
{% endhighlight %}

Pronto. Agora falta criar o nosso primeiro estado. Ele se chamará "home" e será o bootstrap da nossa aplicação.

No arquivo `routes.js.coffee`, configure:

{% highlight coffee %}
@app.config ['$stateProvider', '$urlRouterProvider', ($stateProvider, $urlRouterProvider) ->

  $urlRouterProvider
    .otherwise('/404')
  # $urlRouterProvider

  $stateProvider
    .state 'home',
      url: ''
      views:
        '':
          controller: 'ApplicationCtrl'
          templateUrl: '/'
        # ''
      # views'
    # home
] # config
{% endhighlight %}

No código acima estamos informando ao `ui-router` que, caso a página for requisitada e não for encontrada, será redirecionado para a página `/404`. Também estamos adicionando a nossa rota `root` do projeto chamada "home".

Precisaremos definir o nosso bootstrap no ApplicationController (`app/controllers/application_controller.rb`):

{% highlight ruby %}
def home
end
{% endhighlight %}

Lembre-se de criar o arquivo `home.html.erb` dentro de `app/views/application`.

Criar a rota do bootstrap (`config/routes.rb`):

{% highlight ruby %}
  get '*', to: 'application#home'
{% endhighlight %}

E criar o arquivo `home` no diretório `app/views/application/home.html.erb`.

Mais tarde voltaremos a falar sobre as rotas. Agora iremos configurar o nosso layout da aplicação, onde será renderizado o conteúdo do bootstrap.

Vamos ao `app/views/application.html.erb` e definir o aplicativo e o controller:

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
  {{teste}}
  <div ui-view><%= yield %></div>
</body>
</html>
{% endhighlight %}

Em `ng-controller="ApplicationCtrl"` atribuimos o nosso controller principal. Como ainda não temos esse arquivo, então vamos criar (`app/assets/javascripts/app/controllers/applicationCtrl.js.coffee`):

{% highlight coffee %}
@app.controller 'ApplicationCtrl', ['$scope', ($scope) ->
  $scope.test = "lorem ipsum"
] # ApplicationCtrl
{% endhighlight %}

Vamos testar e ver se a página está renderizando "lorem ipsum":

![Examples ui-router states](http://i.imgur.com/CMBQ9bo.png){: .border-image .image-center}

Voltando ao arquivo `app/views/application.html.erb`:

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

Em `ui-view`, ficará todos os estados com seus respectivos conteúdos adicionados na configuração das rotas do `ui-router`. Coloquei o `<%= yield %>` dentro do `ui-view` para caso for necessário, puxar alguma informação diretamente do Rails.

Já que estamos falando de estados e `ui-router`, vamos abrir o arquivo de rotas e configurar os `resources` das receitas:

{% highlight coffee %}
$stateProvider
  .state 'home',
    abstract: true
    url: '/'
    views:
      '':
        controller: 'ApplicationCtrl'
        templateUrl: '/'
      # ''
    # views
  # home

  ##### RESOURCES RECIPE ######

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

Reparem que criei um estado abstrato chamado `recipes`, que servirá como um outro bootstrap para os conteúdos pertencentes ao nó `recipes`. Isso significa que existirá um estado com um conteúdo estático com outros estados dentro dele. Para facilitar a compreensão veja o desenho abaixo:

![Examples ui-router states](http://i.imgur.com/25dgGGB.png){: .border-image .image-center}

No exemplo mostrado acima, o menu (de cor cinza escuro) é o estado abstrato que, ao mudar de página (estado), continua estático e o conteúdo de cor cinza claro muda de acordo com a url. Isso sem precisar recarregar a página.

Não entrarei muito em detalhe sobre o restante do código acima, pois o post já está ficando grandinho. O que basicamente ele faz é informar ao `ui-router` os estados das receitas, declarar suas respectivas `urls` e definir os `controllers` e hierarquias de estados para renderização na página.

Vamos adicionar nas rotas do Rails o layout para ser a página onde agrega o conteúdo das receitas:

{% highlight ruby %}
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

E a página `layout.html.erb` em `app/views/recipes/` com o seguinte conteúdo:

{% highlight html %}
<div ui-view="recipes"></div>
{% endhighlight %}

Agora vamos criar a seguinte estrutura dentro do diretório `app/assets/javascripts/app/`:

        app
        └───recipes
            ├───controllers
            │       indexCtrl.js.coffee
            │       showCtrl.js.coffee
            │       formCtrl.js.coffee
            │       newCtrl.js.coffee
            │       editCtrl.js.coffee
            │       recipesCtrl.js.coffee
            ├───directives
            ├───factories
            ├───filters
            ├───models
            └───services
                └───models

No próximo e último post, eu mostrarei como consumir os dados do Rails através do AngularJS. Até a próxima :)