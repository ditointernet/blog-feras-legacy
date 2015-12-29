---
layout: post
title:  "Criando uma aplicação com AngularJS e Ruby on Rails - parte 02"
date:   2015-12-29 12:42:00
category: tecnologia
post_author: Paulo Henrique Bruce
comments: true
---

No post [anterior](http://feras.dito.com.br/posts/2015-12-29-criando-uma-aplicacao-com-angularjs-e-ruby-on-rails-parte-2/) falei como criar e configurar o projeto no Rails adaptado para Angular e mostrei como configurar a aplicação no AngularJS. Neste post, irei mostrar uma simples maneira de consumir os dados do Rails através do AngularJS. Bora lá!

## _3. Preparando a Receita..._

No arquivo `routes.js.coffee`, vamos injetar o service `$locationProvider` e adicionar o seguinte trecho:

{% highlight coffee %}
$locationProvider
  .html5Mode(true)
  .hashPrefix('!')
# $locationProvider
{% endhighlight %}

O código acima impede que o angular faça o uso do [Hashbang Mode](https://docs.angularjs.org/guide/$location) (#!) e evita que temos que configurar as urls pelo server-side.

Para organizar as requisições client-side, vamos ao diretório `app/asssets/javascripts/recipes/factories` e criar um arquivo chamado `recipeFactory.js.coffee` com o seguinte conteúdo:

{% highlight coffee %}
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

Agora vamos adicionar um trecho no arquivo `recipes_controller.rb`, dentro das actions, `index` e `set_recipe`:

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
  @recipe.destroy
  render nothing: true
end

# PATCH/PUT /recipes/1
def update
  @recipe = Recipe.find(params[:id])

  if @recipe.update_attributes(recipe_params)
    respond_to do |format|
      format.html
      format.json { render json: @recipe }
    end
  else
    render action: 'edit'
  end
end
{% endhighlight %}

Vamos preparar os controllers do Angular:

{% highlight coffee %}
@app.controller 'RecipesCtrl', ['$scope', ($scope) ->
  console.log "Bootstrap"
] # RecipesCtrl

@app.controller 'RecipesIndexCtrl', ['$scope', ($scope) ->
  console.log "Página index"
] # RecipesIndexCtrl

@app.controller 'RecipeShowController', ['$scope', ($scope) ->
  console.log "Página show"
] # RecipeShowController

@app.controller 'RecipesNewCtrl', ['$scope', ($scope) ->
  console.log "Página new"
] # RecipesNewCtrl

@app.controller 'RecipesEditController', ['$scope', ($scope) ->
  console.log "Página edit"
] # RecipesEditController
{% endhighlight %}

Após isso, vamos testar os nossos controllers navegando nas páginas:

![Página index](http://i.imgur.com/bfn8Gcn.png){: .border-image}

![Página show](http://i.imgur.com/u9zf5FB.png){: .border-image}

![Página edit](http://i.imgur.com/BKaHewu.png){: .border-image}

![Página new](http://i.imgur.com/SxVpybL.png){: .border-image}

## _4. Consumindo os dados_

Tudo certo! Vamos finalmente puxar os dados das receitas. Vamos começar pelo `recipesCtrl.js.coffee`. Faça o seguinte:

{% highlight coffee %}
@app.controller 'RecipesCtrl', ['$rootScope', ($rootScope) ->
  $rootScope.currentRecipe ||= null
  $rootScope.allRecipes ||= []
] # RecipesCtrl
{% endhighlight %}

No arquivo `index.js.coffee`, vamos puxar as informações da index e colocar dentro de `allRecipes` e também criar um método para deletar uma receita:

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
      <td>{{ recipe.title }}</td>
      <td>{{ recipe.ingredients }}</td>
      <td>{{ recipe.directions }}</td>
      <td><a href="javascript:void(0)" ui-sref="recipes.show({ id: recipe.id })">Show</td>
      <td><a href="javascript:void(0)" ui-sref="recipes.edit({ id: recipe.id })">Edit</td>
      <td><a href="javascript:void(0)" ng-click="destroyRecipe(recipe.id, $index)">Destroy</td>
    </tr>
  </tbody>
</table>

<br>

<a href="javascript:void(0)" ui-sref="recipes.new">New Recipe</a>
{% endhighlight %}

Agora vamos configurar a página de `show`. Em `show.js.coffee`, altere o código para isso:

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
  {{ currentRecipe.title }}
</p>

<p>
  <strong>Ingredients:</strong>
  {{ currentRecipe.ingredients }}
</p>

<p>
  <strong>Directions:</strong>
  {{ currentRecipe.directions }}
</p>

<a href="javascript:void(0)" ui-sref="recipes.edit({ id: currentRecipe.id })">Edit</a>
<a href="javascript:void(0)" ui-sref="recipes.index">Back</a>
{% endhighlight %}

Vamos agora construir os recursos necessários para a página `new`. Em `new.js.coffee`, altere o código para:

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

Para construir os recursos de `edit` agora ficou fácil. Entre em `edit.js.coffee` e defina `currentRecipe` novamente. Não se esqueça de criar um método para atualizar a receita:

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

Pronto! O Veganizze está pronto para uso. Espero ter ajudado. Qualquer dúvida ou sugestão, estou à disposição :).


