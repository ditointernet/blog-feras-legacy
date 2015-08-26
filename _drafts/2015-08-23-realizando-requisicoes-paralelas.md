---
layout: post
title:  "Realizando requisições paralelas"
date:   2015-08-23 19:39:00
categories: tecnologia
post_author: Victor Lellis
comments: true
---

Em um projeto recente, foi necessário realizar mudanças para realizar requisições JSON paralelas a um endpoint de uma API e de forma assíncrona a fim de lidar com as respostas. Nesse projeto estava sendo realizados requisições sequenciais. 

Para solucionar o problema foi verificado a abordagem baseada em _middleware_ para lidar com requests HTTP no lado do servidor. Baseado em estudos na documentação de dois Gems de ruby (**Faraday** e **Typhoeus**) foi verificado que com o **Faraday** com o _adapter_ **Typhoeus** é possível realizar paralelismo nas requisições e lidar com as respostas HTTP no lado do cliente usando uma pilha de _middleware_.  

O [**Typhoeus**][typhoeus], um Gem desenvolvido em ruby, é utilizado para o cliente HTTP fazer requisições paralelas de alto desempenho. **Typhoeus** é um _wrapper_ para a _libcurl_, que é uma biblioteca madura e robusta em C para a realização de requisições HTTP com alto desempenho. Requisições paralelas podem ser executadas com a interface _hydra_. Conexões persistentes também são habilitadas por padrão desde que a connexão _curl_ da API tente reutilizar conexões existentes automaticamente.

A interface [_Hydra_][hydra] gerencia as requisições HTTP paralelas. Seu limite padrão de concorrência de parelelismo é 200 e quanto mais solicitações são enfileiradas, _hydra_ irá salvá-las e iniciá-las a medida que as outras requisições forem finalizadas. A concorrência pode ser modificada através do construtor de _hydra_.

Já o [**Faraday**][faraday], outro Gem desenvolvido em ruby, é um cliente HTTP projetado para fornecer uma abstração consistente entre diferentes tipos de _apdapters_, como o Gem **Typhoeus** quanto o Gem **Net::Http**, por exemplo.

A vantagem de se utilizar requisições paralelas é que a biblioteca _libcurl_ fica encarregada de realizar as requisições paralelas e retorna as requisições para o **Typhoeus** e o **Faraday** tem com o papel de entregar a resposta ao _middleware_.

No modo de concorrência, a biblioteca _libcurl_ fica responsável de executar a técnica _HTTP pipelining_, que é uma técnica para enviar requisiçõs em uma única conexão TCP sem esperar pelas respostas correspondentes, resultando em uma melhoria dramática no ganho de performance.

Abaixo segue o esquema de funcionamento de requisições síncronas e as requisições que utilizam a conexão com o método pipelining.

![Conexão síncrona vs pipelined](https://upload.wikimedia.org/wikipedia/commons/1/19/HTTP_pipelining2.svg)

Considerando o seguinte código em ruby:

{% highlight ruby %}
require 'typhoeus'
require 'faraday'
require 'typhoeus/adapters/faraday'

class Request

  def initialize(options={})
    manager = Typhoeus::Hydra.new(max_concurrency: 100)
    @connection = Faraday.new(parallel_manager: manager) do |builder|
      builder.request  :url_encoded
      builder.adapter :typhoeus
      builder.use options[:handler] if options[:handler]
    end
    @object = options[:object]
  end

  def parallel_get_all(arr=[])
    @connection.in_parallel do
      arr.each do |d|
        get(d)
      end
    end
  end

  def sequential_get_all(arr = [])
    arr.each do |d|
      get(d)
    end
  end

  private

  def get(options={})
    @connection.get do |req|
      req.url options[:url]
      req.options[:timeout] = options[:timeout] || 10
      req.headers['Content-Type'] = 'application/json'
      req.options[:params_encoder] = { object: @object }
    end
  end
end
{% endhighlight %}


Verifica-se que foi criado a classe _Request_ que inicializa a conexão utilizando o **Typhoeus** para gerenciar as requisições paralelas e inserir o _middleware_ customizado na pilha para lidar com as respostas, o _middleware_ é inserido com a opção _handler_.

Na classe _Request_ é possível passar um objeto para o _middleware_ customizado, definido com a opção _object_. No método _parallel_get_all_ é chamado _in_parallel_ no objeto da conexão que enfileira as requisições para executar em modo paralelo. No método _sequential_get_all_ são realizados as requisições que são enfileiradas para executar em modo sequencial.

A requisição é enfileirada a cada solicitação HTTP que é realizada dentro desse bloco e a reposta é retornada imediatamente ao _middleware_ customizado.


Construção da classe com o _Middleware_ customizado
---------------------------------------------------------

A seguir, foi implementado a classe _MultipleRequests_ com um _response handler_, ou seja, o _middleware_ de resposta. O código pode ser observado abaixo.

{% highlight ruby %}
class MultipleRequests
  attr_reader :success_count

  def initialize(options = {})
    @request = Request.new(handler: RequestResponseHandler, object: self)

    @arr = []
    (options[:size] || 100).times do
      @arr << {url: 'http://jquery-ui-map.googlecode.com/svn/trunk/demos/json/demo.json'}
    end

    @success_count = 0
  end

  class RequestResponseHandler < Faraday::Response::Middleware

    def call(env)
      @app.call(env).on_complete do
        env[:response].on_complete do |env_response|
          response = {
            request_url: env[:url].to_s,
            response_status: env_response.status,
            response_body: env_response.body
          }
          params_encoder = env[:request].params_encoder
          object = params_encoder[:object]
          object.add_success if response[:response_status] == 200
        end
      end
    end
  end

  def add_success
    @success_count += 1
  end

  def sendParalell
    @success_count = 0
    @request.parallel_get_all @arr
  end

  def sendSequential
    @success_count = 0
    @request.sequential_get_all @arr
  end
end
{% endhighlight %}

O callback _on_complete_ é acionado quando nosso _request_ recebe uma resposta do servidor (ou quando atinge o _timeout_). 

O argumento _env_response_ contém o status e o retorno da resposta. 

A variável _success_count_ é utilizada para verificar as requisições que foram retornadas com sucesso.


Resultado e comparação de velocidade
-------------------------------------

Foi verificado o retorno de 100 requisições com sucesso e foi utilizado o Gem [_benchmark-ips_][benchmark_ips] para medir a comparação de velocidade entre as requisições paralelas e sequenciais.

{% highlight ruby %}
require 'benchmark/ips'

requests = MultipleRequests.new(size: 100)

requests.sendParalell
puts "Requisições com sucesso no modo paralelo: #{requests.success_count}"

requests.sendSequential
puts "Requisições com sucesso no modo sequencial: #{requests.success_count}"

Benchmark.ips do |x|
  x.report("parallel") { requests.sendParalell }
  x.report("sequential") { requests.sendSequential }

  x.compare!
end
{% endhighlight %}

Foi obtido o seguinte retorno:

{% highlight sh %}
Requisições com sucesso no modo paralelo: 100
Requisições com sucesso no modo sequencial: 100
Calculating -------------------------------------
            parallel     1.000  i/100ms
          sequential     1.000  i/100ms
-------------------------------------------------
            parallel      2.261  (± 0.0%) i/s -     12.000  in   5.360215s
          sequential      0.138  (± 0.0%) i/s -      1.000  in   7.257456s

Comparison:
            parallel:        2.3 i/s
          sequential:        0.1 i/s - 16.41x slower
{% endhighlight %}

Foi observado que o controle das requisições pode ser realizado através do parâmetro _object_, pois dentro do _middleware_ é verificado se ocorreu um erro na resposta da requisição. No retorno foi verificado que todas as requisições foram retornadas com sucesso.

Com o resultado do _benchmark-ips_, foi verificado a melhoria de performance superior a 16 vezes enviando 100 requisições através do método paralelo (_in_parallel_) em relação ao método sequencial do **Faraday** configurado com o _adapter_ **Typhoeus**.

Referências
-----------
- [Faraday][faraday]
- [Typhoeus][typhoeus]
- [benchmark-ips][benchmark_ips]
- [Parallel requests][paralell-requests]
- [Class: Faraday::Response::Middleware][faraday-response-middleware]
- [Class: Faraday::Response][faraday-response]
- [Wikipedia: HTTP pipelining][HTTP-pipelining]


[faraday]: https://github.com/lostisland/faraday
[typhoeus]: https://github.com/typhoeus/typhoeus
[benchmark_ips]: https://github.com/evanphx/benchmark-ips
[paralell-requests]: https://github.com/lostisland/faraday/wiki/Parallel-requests
[faraday-response-middleware]: http://www.rubydoc.info/github/lostisland/faraday/Faraday/Response/Middleware
[faraday-response]: http://www.rubydoc.info/github/lostisland/faraday/Faraday/Response
[hydra]: http://www.rubydoc.info/github/typhoeus/typhoeus/Typhoeus/Hydra
[HTTP-pipelining]: https://en.wikipedia.org/wiki/HTTP_pipelining
