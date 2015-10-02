---
layout: post
title:  "Design Patterns: Aplicação Prática"
date:   2015-09-29 16:00:00
category: tecnologia
post_author: Sérgio Silva
comments: true
---

Escrever um código-fonte de fácil compreensão, manutenção e escalabilidade pode ser uma tarefa difícil até para desenvolvedores mais experientes. Para nos auxiliar nesta tarefa, recorremos aos Padrões de Projeto.

Os Padrões não têm o propósito de serem soluções prontas e específicas mas sim, modelos e princípios gerais para a resolução de algo, já testados e recomendados por especialistas.

Aqui na Dito prezamos pela aplicação destes padrões e reconhecemos a importância de se ter em mente seus conceitos durante o desenvolvimento de software para a construção de um produto de qualidade. Este post trás uma breve explicação sobre alguns padrões e a seguir uma aplicação prática destes em uma de nossas funcionalidades.

_Information Expert_
-------------------

O padrão Especialista atribui uma responsabilidade a um especialista - a classe que possui a informação necessária para satisfazer a uma responsabilidade. Este padrão procura resolver a seguinte questão: "Como atribuir responsabilidades para objetos?"

_Creator_
--------

Define qual classe deverá ser responsável pela criação de instâncias de outra classe. Nos orienta a atribuir à classe 'B' responsabilidade por criar a classe 'A' se:

* 'B' agrega 'A'
* 'B' contém 'A'
* 'B' registra instâncias de 'A'

_Low Coupling and High Cohesion_
-------------------------------

Como obter dependência baixa, menor impacto nas mudanças e propiciar reuso? Como manter a complexidade de alterações gerenciável? A medida é buscar manter um baixo acoplamento e uma coesão alta.

Acoplamento é uma medida do quão fortemente uma classe está conectada; conhece ou depende de outras classes.

Coesão é uma medida do quão fortemente relacionada e focalizada é a responsabilidade de uma classe.

Aplicação Prática
------------------

A plataforma da Dito permite a exportação de dados de nossa base em arquivos disponibilizados ao usuário. Os arquivos podem ser em extensão .csv ou .xls. Para a geração dos arquivos possuímos três classes: _File_, _XlsxManipulator_ e _CsvManipulator_. Abaixo, um fragmento do código da classe _File_ escrita em Ruby:

{% highlight ruby %}
module Export
  class File
    include Export::CommonMethods

    def initialize(options = {})
      ...
      @format    = options[:type] || 'csv'
      @format    = 'xlsx' if @format.to_s.downcase == 'excel'

      @file_name = "#{@segment_id}_#{Time.now.strftime('%d-%m-%Y-%H:%M:%S')}_#{@format}"
      ...
    end

    def generate
      file_open
      ...
      file_close
      ...
    end

    private

    def is_xlsx?
      @format == 'xlsx'
    end

    def file_open
      @file_manipulator = build_file_manipulator
    end

    def build_file_manipulator
      if is_xlsx?
        XlsxManipulator.new(@local_file_path)
      else
        CsvManipulator.new(@local_file_path)
      end
    end

    def file_add_row(row)
      @file_manipulator.add_row(row)
    end

    def file_close
      @file_manipulator.close
    end

    def build_header
      ...
      file_add_row(header)
    end

    def set_user_data_on_file(options={})
      ...
      file_add_row(user_attrs)
    end
  end
end
{% endhighlight %}

Representação em UML
---------------------

![UML Representation](http://blog.dito.com.br/wp-content/uploads/2015/10/uml-class-diagram.png)

Funcionamento
--------------

A classe _File_ é inicializada recebendo um hash de parâmetros. Um destes parâmetros é o formato desejado do arquivo de saída. O método _build_file_manipulator_ é responsável por instanciar em _@file_manipulator_ o objeto manipulador necessário para a geração, de acordo com o formato desejado.

A classe _File_ desconhece os mecanismos de construção e inserção de linhas de cada tipo de arquivo, delegando para a instância do manipulador esta responsabilidade através de chamadas ao método _add_row_.

_Quick Wins_
-----------

Numa funcionalidade simples como a geração de arquivos conseguimos destacar diversas vantagens ao se desenvolver com base nos princípios de Orientação a Objetos, reforçados nos padrões:

* A classe _File_ possui um propósito bem específico. Sua finalidade é fornecer a interface para a geração dos arquivos através de seus métodos. Ao não assumir responsabilidades que  não lhe dizem respeito, ela torna-se coesa, delegando para as classes especialistas as funções que não lhe cabem - **_High Cohesion_**

* _File_ é responsável por criar os objetos para cada tipo de exportação. É a classe mais indicada para realizar esta tarefa pois ela contém e utiliza tais objetos em seus métodos. Além disso ela possui a informação de qual extensão de arquivo foi solicitada.  - **_Creator_** e **_Information Expert_**

* Após a construção do manipulador (csv ou xlsx) a classe _File_ desconhece os mecanismos internos do mesmo. Cada classe manipulator pode possuir métodos privados adicionais e específicos para cada tipo de extensão desejada sem que a classe _File_ precise ser alterada para a obtenção do resultado esperado. - **_Low Coupling_**

* Se desejarmos trabalhar com outra extensão de arquivos além das existentes, as alterações necessárias são relativamente simples. Basta criarmos a classe manipuladora (tal qual as existentes) com seus métodos específicos e realizarmos modificações no método _build_file_manipulator_, aproximando sua implementação do padrão [FactoryMethod](https://en.wikipedia.org/wiki/Factory_method_pattern).

Considerações
--------------

A aplicabilidade de alguns dos padrões [GRASP](https://en.wikipedia.org/wiki/GRASP_(object-oriented_design)) em uma tarefa de complexidade baixa, tal qual a geração de arquivos para o usuário, demonstra que boas práticas de programação não se restringem aos grandes projetos de software. Mesmo em pequenas features existe a possibilidade de se aplicar padrões.

Com esta abordagem conseguimos conferir ao módulo de exportação as características desejáveis de baixo acoplamento e alta coesão, que certamente irão contribuir para a  manutenção do código e indiretamente com a qualidade do produto como um todo.
