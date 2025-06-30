/**
 * @file apresentacao.js
 * @description Exibe documentação e apresentação de slides.
 */

/**
 * Botão de voltar para a página inicial.
 * @constant {HTMLButtonElement|null}
 * @memberof module:cadastro
 */
const btnVoltar = document.querySelector(".botaovoltar button");
if (btnVoltar) {
  /**
   * Redireciona para a página inicial ao clicar no botão voltar.
   * @function
   * @memberof module:cadastro
   * @returns {void}
   */
  btnVoltar.addEventListener("click", () => {
    window.location.href = "/";
  });
}