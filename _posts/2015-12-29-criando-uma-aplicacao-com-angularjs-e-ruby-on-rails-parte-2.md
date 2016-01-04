---
layout: post
title:  "Criando uma aplicação com AngularJS e Ruby on Rails - parte 02"
date:   2015-12-29 12:42:00
category: frontend
post_author: Paulo Henrique Bruce
comments: true
---

No post [anterior](http://feras.dito.com.br/posts/criando-uma-aplicacao-com-angularjs-e-ruby-on-rails-parte-1/) falei como criar e configurar o projeto no Rails adaptado para Angular e mostrei como configurar a aplicação no AngularJS. Neste post, irei mostrar uma simples maneira de consumir os dados do Rails através do AngularJS. Bora lá!

## _3 - "Preparando a Receita"_

No arquivo `routes.js.coffee`, vamos injetar o service `$locationProvider` e adicionar mais algumas configurações:

{% highlight coffee %}
# Injeção do $locationProvider:
@app.config ['$stateProvider', '$urlRouterProvider', '$locationProvider', ($stateProvider, $urlRouterProvider, $locationProvider) ->
  ...

  # Trecho a ser adicionado
  $locationProvider
    .html5Mode(true)
    .hashPrefix('!')
  # $locationProvider
{% endhighlight %}

O código acima impede que o angular faça o uso do [Hashbang Mode](https://docs.angularjs.org/guide/$location) (#!) e evita que temos que configurar as urls pelo server-side.

Agora em `application.html.erb`, adicione a tag `<base>` dentro de `<head>`:

{% highlight html %}
<base href="/">
{% endhighlight %}

Para organizar as requisições client-side, vamos criar um arquivo chamado `recipeFactory.js.coffee` com o seguinte conteúdo:

{% highlight coffee %}
# app/assets/javascripts/app/pages/recipes/factories/recipeFactory.js.coffee
@app.factory 'RecipeFactory', ['$http', '$q', ($http, $q) ->
  url = '/recipes'
  deferred = $q.defer()

  index = ->
    request = $http(method: 'GET', url: "#{url}.json")
    sendRequest(request)
  # index

  show = (id) ->
    request = $http(method: 'GET', url: "#{url}/#{id}.json")
    sendRequest(request)
  # show

  newRecipe = ->
    title: null
    ingredients: null
    directions: null
  # newRecipe

  create = (body) ->
    request = $http(method: 'POST', data: body, url: "#{url}.json")
    sendRequest(request)
  # create

  update = (id, body) ->
    request = $http(method: 'PUT', data: body, url: "#{url}/#{id}.json")
    sendRequest(request)
  # update

  destroy = (id) ->
    request = $http(method: 'DELETE', url: "#{url}/#{id}.json")
    sendRequest(request)
  # destroy

  sendRequest = (config) ->
    config.then((response) -> deferred.resolve(response)).catch((error) -> deferred.reject(error))
    config
  # sendRequest

  show: show
  index: index
  create: create
  update: update
  destroy: destroy
  newRecipe: newRecipe
] # RecipeFactory
{% endhighlight %}

Agora vamos adicionar o seguinte trecho no arquivo `recipes_controller.rb`, dentro das actions, `index` e `set_recipe`:

{% highlight ruby %}
# Dentro da action index
respond_to do |format|
  format.html
  format.json { render json: @recipes }
end

# Dentro da action set_recipe
respond_to do |format|
  format.html
  format.json { render json: @recipe }
end
{% endhighlight %}

Depois disso feito, no callback `before_action :set_recipe, only: [:show, :edit, :update, :destroy]`, você vai tirar `:destroy` e `:update` e logo em seguida você irá em suas respectivas actions e configurar desta forma:

{% highlight ruby %}
 # DELETE /recipes/1
def destroy
  @recipe = Recipe.find(params[:id])

  if @recipe.destroy
    render json: @recipe
  else
    render json: { error: true }
  end
end

# PATCH/PUT /recipes/1
def update
  @recipe = Recipe.find(params[:id])

  if @recipe.update_attributes(recipe_params)
    render json: @recipe
  else
    render json: { error: true }
  end
end
{% endhighlight %}

Vamos preparar os controllers do Angular:

{% highlight coffee %}
# Arquivo recipesCtrl.js.coffee
@app.controller 'RecipesCtrl', [ ->
  console.log "Bootstrap"
] # RecipesCtrl

# Arquivo indexCtrl.js.coffee
@app.controller 'RecipesIndexCtrl', [ ->
  console.log "Página index"
] # RecipesIndexCtrl

# Arquivo showCtrl.js.coffee
@app.controller 'RecipeShowController', [ ->
  console.log "Página show"
] # RecipeShowController

# Arquivo newCtrl.js.coffee
@app.controller 'RecipesNewCtrl', [ ->
  console.log "Página new"
] # RecipesNewCtrl

# Arquivo editCtrl.js.coffee
@app.controller 'RecipesEditController', [ ->
  console.log "Página edit"
] # RecipesEditController
{% endhighlight %}

Após isso, vamos testar os nossos controllers navegando nas páginas:

![Página index](http://i.imgur.com/bfn8Gcn.png){: .border-image}

![Página show](http://i.imgur.com/u9zf5FB.png){: .border-image}

![Página edit](http://i.imgur.com/BKaHewu.png){: .border-image}

![Página new](http://i.imgur.com/SxVpybL.png){: .border-image}

## _4 - Consumindo os dados_

Tudo certo! Vamos finalmente puxar os dados das receitas. Vamos começar pelo `recipesCtrl.js.coffee`. Faça o seguinte:

{% highlight coffee %}
@app.controller 'RecipesCtrl', ['$rootScope', ($rootScope) ->
  $rootScope.currentRecipe ||= null
  $rootScope.allRecipes ||= []
] # RecipesCtrl
{% endhighlight %}

No arquivo `indexCtrl.js.coffee`, vamos puxar as informações da index e colocar dentro de `allRecipes` e também criar um método para deletar uma receita:

{% highlight coffee %}
@app.controller 'RecipesIndexCtrl', ['$scope', '$rootScope', 'RecipeFactory', ($scope, $rootScope, RecipeFactory) ->

  RecipeFactory.index().then (response) ->
    $rootScope.allRecipes = response.data
  , (error) ->
    console.error error
  # index

  $scope.destroyRecipe = (id, index) ->
    confirm = window.confirm ('Are you sure?')

    if confirm
      RecipeFactory.destroy(id).then (success) ->
        alert 'Recipe deleted.'
        $rootScope.allRecipes.splice(index, 1)
      , (error) ->
        console.error
      # destroy
    # if
  # destroyRecipe
] # RecipesIndexCtrl
{% endhighlight %}

E no arquivo `index.html.erb`, vamos consumir os dados:

{% highlight html %}
<h1>Listing recipes</h1>

<table>
  <thead>
    <tr>
      <th>Title</th>
      <th>Ingredients</th>
      <th>Directions</th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
  </thead>

  <tbody>
    <tr ng-repeat="recipe in allRecipes">
      <td>{% raw %}{{ recipe.title }}{% endraw %}</td>
      <td>{% raw %}{{ recipe.ingredients }}{% endraw %}</td>
      <td>{% raw %}{{ recipe.directions }}{% endraw %}</td>
      <td><a href="javascript:void(0)" ui-sref="recipes.show({ id: recipe.id })">Show</td>
      <td><a href="javascript:void(0)" ui-sref="recipes.edit({ id: recipe.id })">Edit</td>
      <td><a href="javascript:void(0)" ng-click="destroyRecipe(recipe.id, $index)">Destroy</td>
    </tr>
  </tbody>
</table>

<br>

<a href="javascript:void(0)" ui-sref="recipes.new">New Recipe</a>
{% endhighlight %}

Antes de ir para a próxima página, vamos voltar em `application_controller.rb` e adicionar a seguinte linha: `skip_before_action :verify_authenticity_token`. Essa linha possibilita que deletemos as receitas.

Agora vamos configurar a página de `show`. Em `showCtrl.js.coffee`, altere o código para isso:

{% highlight coffee %}
@app.controller 'RecipeShowController', ['$rootScope', '$stateParams', 'RecipeFactory', ($rootScope, $stateParams, RecipeFactory) ->
  RecipeFactory.show($stateParams.id).then (response) ->
    $rootScope.currentRecipe = response.data
  , (error) ->
    console.error error
  # show
] # RecipeShowController
{% endhighlight %}

E em `show.html.erb`, altere para isso:

{% highlight html %}
<p>
  <strong>Title:</strong>
  {% raw %}{{ currentRecipe.title }}{% endraw %}
</p>

<p>
  <strong>Ingredients:</strong>
  {% raw %}{{ currentRecipe.ingredients }}{% endraw %}
</p>

<p>
  <strong>Directions:</strong>
  {% raw %}{{ currentRecipe.directions }}{% endraw %}
</p>

<a href="javascript:void(0)" ui-sref="recipes.edit({ id: currentRecipe.id })">Edit</a>
<a href="javascript:void(0)" ui-sref="recipes.index">Back</a>
{% endhighlight %}

Vamos agora construir os recursos necessários para a página `new`. Em `newCtrl.js.coffee`, altere o código para:

{% highlight coffee %}
@app.controller 'RecipesNewCtrl', ['$scope', '$rootScope', '$state', 'RecipeFactory', ($scope, $rootScope, $state, RecipeFactory) ->
  $rootScope.currentRecipe = RecipeFactory.newRecipe() if $rootScope.currentRecipe is null

  $scope.commitRecipe = (recipe) ->
    RecipeFactory.create(recipe).then (success) ->
      $rootScope.currentRecipe = null
      alert 'Recipe created successfully!'
      $rootScope.allRecipes.push success
      $state.go 'recipes.index'
    , (error) ->
      console.error error
    # create
  # commitRecipe
] # RecipesNewCtrl
{% endhighlight %}

Em `new.html.erb`, mude para:

{% highlight html %}
<h1>New recipe</h1>

<%= render 'form' %>

<a href="javascript:void(0)" ui-sref="recipes.index">Back</a>
{% endhighlight %}

Para construir os recursos de `edit` agora ficou fácil. Entre em `editCtrl.js.coffee` e defina `currentRecipe` novamente. Não se esqueça de criar um método para atualizar a receita:

{% highlight coffee %}
@app.controller 'RecipesEditController', ['$scope', '$rootScope', '$state', '$stateParams', 'RecipeFactory', ($scope, $rootScope, $state, $stateParams, RecipeFactory) ->
  RecipeFactory.show($stateParams.id).then (response) ->
    $rootScope.currentRecipe = response.data
  , (error) ->
    console.error error
  # show

  $scope.commitRecipe = (recipe) ->
    RecipeFactory.update($stateParams.id, recipe).then (success) ->
      alert 'Recipe updated successfully!'
      $state.go 'recipes.index'
    , (error) ->
      console.error error
    # create
  # commitRecipe
] # RecipesEditController
{% endhighlight %}

E para finalizar, vamos deixar a página `editCtrl.html.erb` assim:

{% highlight html %}
<h1>Editing recipe</h1>

<%= render 'form' %>

<a href="javascript:void(0)" ui-sref="recipes.show({ id: currentRecipe.id })">Show</a>
<a href="javascript:void(0)" ui-sref="recipes.index">Back</a>
{% endhighlight %}

O Veganizze está pronto! Espero ter ajudado. Qualquer dúvida ou sugestão, estou à disposição :).


