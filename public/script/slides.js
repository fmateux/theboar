/**
 * @file slides.js
 * @description Configuração e inicialização da biblioteca Reveal.js para apresentação de slides.
 */

/**
 * @module slides
 */

/**
 * Inicializa a apresentação Reveal.js com configurações específicas.
 * @function
 * @memberof module:slides
 * @returns {void}
 */
Reveal.initialize({
  /** Habilita a navegação pela URL via hash */
  hash: true,

  /** Exibe o número do slide atual */
  slideNumber: true,

  /** Define o tipo de transição entre slides */
  transition: 'slide',

  /** Plugins utilizados na apresentação */
  plugins: [ Reveal.Math.Jax3 ],

  /** Configurações específicas para renderização matemática */
  math: {
    /** URL do script do MathJax para renderização das fórmulas */
    mathjax: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js',

    /** Configuração do MathJax */
    config: 'TeX-AMS_HTML-full'
  }
});
