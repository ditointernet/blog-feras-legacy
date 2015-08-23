---
layout: post
title:  "Realizando requisições paralelas"
date:   2015-08-23 19:39:00
categories: tecnologia
post_author: Victor Lellis
comments: true
---

Em um projeto recente, eu precisava realizar requisições JSON paralelas a um endpoint de uma API e de forma assíncrona para lidar com as respostas. Eu gosto de abordagem baseada em _middleware_ para lidar com requests HTTP no lado do servidor, então eu decidi tentar com o **Faraday** (configurado com o adapter **Typhoeus**), que lida com semelhante respostas HTTP no lado do cliente usando uma pilha de _middleware_. Typhoeus é um cliente HTTP que faz requisições paralelas de alto desempenho. O **Faraday** foi projetado para fornecer uma abstração consistente para um número de diferentes HTTP adapters e **Typhoeus** para solicitações paralelas.

Primeiro, vamos criar uma classe que inicializa a conexão utilizando o **Typhoeus** para gerenciar as requisições paralelas e inserir nosso _middleware_ personalidado na pilha para lidar com as respostas.

Na nossa classe será possível passar um objeto para nosso _middleware_ personalizado. Em nosso método _parallel_get_all_, chamamos _in_parallel_ no objeto da conexão que enfileira as requisições para exeutar em modo paralelo. Em nosso método _sequential_get_all_ são realizados as requisições são enfileiradas para executar em modo sequencial.

A cada solicitação HTTP que fazemos dentro desse bloco será enfileirado e retornará imediatamente ao nosso _middleware_.

```ruby
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
```

Construção da classe com o _Middleware_ personalizado
---------------------------------------------------------

A seguir, vamos implementar uma classe com um _response handler_ personalizado, ou seja, nosso _middleware_ de resposta. O callback _on_complete_ será acionado quando nosso requeste recebe uma resposta do servidor (ou com o _timeout_). 

O argumento _env_response_ contém o satus da resposta e o retorno. A variável _success_count_ é utilizada para verificar as requisições que foram retornadas com sucesso.

```ruby
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
      # "env" contains the request
      @app.call(env).on_complete do
        # "env" contains the request AND response
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
```

Resultado e comparação de velocidade
-------------------------------------

Foi verificado o retorno de 100 requisições com sucesso e utilizando o _benchmark-ips_ foi medido a comparação de velocidade entre as requisições paralelas e sequenciais.


```ruby
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
```

Foi obtido o seguinte retorno:

```
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
```

Logo, podemos concluir que é possível obter uma melhoria de performance superior a 16 vezes com 100 requisições utilizando o método paralelo (_in_parallel_) do **Faraday** configurado com o **Typhoeus** e retornando a resposta ao nosso _middleware_ personalizado.