const movieCatalog = "https://japceibal.github.io/japflix_api/movies-data.json";
const inputBuscar = document.getElementById("inputBuscar");
const btnBuscar = document.getElementById("btnBuscar");
const listaUl = document.getElementById("lista");
let movieList = [];

// Función que realiza el fetch para obtener la información de las películas
function getJSONData() {
  fetch(movieCatalog)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error de la red: " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      movieList.push(...data); 
      // ...data (operador de propagación) toma todos los elementos del arreglo data y los pasa como argumentos 
      //individuales a la función push  que agrega todos los elementos de data al final del arreglo movieList
    })
    .catch((error) => {
      console.error("El fetch salió mal:", error);
    });
}

// se llama a getJSONData al cargar la página
document.addEventListener("DOMContentLoaded", getJSONData);

// se borra el contenido de la lista antes de mostrar nuevos resultados
function cleanList() {
  listaUl.innerHTML = "";
}

//se muestran las estrellas según el vote average
function mostrarEstrellas(voteAverage) {
  const estrellasTotales = 5;
  const estrellasLlenas = Math.round(voteAverage / 2); // Ajusta el rango de 0 a 10 a 0 a 5
  let estrellasHTML = '';

  for (let i = 0; i < estrellasTotales; i++) {
    estrellasHTML += i < estrellasLlenas
      ? '<span class="fa fa-star checked"></span>'
      : '<span class="fa fa-star"></span>';
  }

  return estrellasHTML;
}

// función que crea un elemento li que representa una película
function createListItem(item) { 
  const newItem = document.createElement("li"); // se crea el elemento
  newItem.classList.add( // se le agregan clases para aplicar estilos de bootstrap
    "list-group-item",
    "list-group-item-action",
    "bg-dark",
    "text-light"
  );
//se configuran atributos que permiten que el elemento se comporte como un botón que activa un offcanvas 
//(un panel que se desliza desde el borde de la pantalla)
  newItem.setAttribute("data-bs-toggle", "offcanvas");
  newItem.setAttribute("data-bs-target", "#offcanvasTop");
  newItem.setAttribute("aria-controls", "offcanvasTop"); 

  // se define el contenido HTML del nuevo elemento de lista con el título, tagline y estrellas
  let HTMLtoAppend = `
    <div class="col">
      <div class="col movie-title">${item.title}</div>
      <div class="col movie-overview">${item.tagline || 'Sin tagline'}</div>
      <div class="stars-container">${mostrarEstrellas(item.vote_average)}</div>
    </div>
  `;

  newItem.innerHTML = HTMLtoAppend; //se inserta ek contenido html en new item
  listaUl.appendChild(newItem); // se agrega new item a la lista 

  // se establece el contenido del offcanvas en un evento para mostrar información adicional sobre la película seleccionada
  newItem.addEventListener("click", function () {
    const offcanvas = document.getElementById("offcanvasTop");
    const offCanvasTitle = document.getElementById("offcanvasTopLabel");
    const offcanvasOverview = document.getElementById("offcanvasOverview");
    const offcanvasGenres = document.getElementById("offcanvasGenres");
    const dropdownMenu = document.getElementById("more-info");
    
    offCanvasTitle.innerText = item.title; //se establece el texto del título del offcanvas con el título de la película
    offcanvasOverview.innerText = item.overview; // se establece el texto del resumen de la película

// con map se transforma el array de géneros en un array de cadenas HTML
// Por cada género, se crea un span con el nombre del género
// join(', ') une todos esos spans en una sola cadena. 
    offcanvasGenres.innerHTML = item.genres.map(genre => `<span>${genre.name}</span>`).join(', '); 

   // se toma el año de la fecha de lanzamiento
    const releaseDate = item.release_date;
    const year = releaseDate.split("-")[0];

    // se construye una lista de elementos que muestra información adicional sobre la pelicula
    dropdownMenu.innerHTML = `
      <li class="dropdown-item-text d-flex justify-content-between">
          <span class="me-2">Año:</span>
          <span>${year}</span>
      </li>
      <li class="dropdown-item-text d-flex justify-content-between">
          <span class="me-2">Duración:</span>
          <span>${item.runtime} min</span>
      </li>
      <li class="dropdown-item-text d-flex justify-content-between">
          <span class="me-2">Presupuesto:</span>
          <span>$${item.budget.toLocaleString()}</span>
      </li>
      <li class="dropdown-item-text d-flex justify-content-between">
          <span class="me-2">Ganancias:</span>
          <span>$${item.revenue.toLocaleString()}</span>
      </li>
    `;
  });
}

// se stablece un listener para el evento click en el botón de búsqueda
btnBuscar.addEventListener("click", () => {
  // se limpia la lista existente 
  cleanList();
  // se obtiene el valor del campo de búsqueda, se eliminan los espacios en blanco con trim()
  const inputValue = inputBuscar.value.trim();
  
  if (inputValue === "") {
    return; // No hacer nada si el campo está vacío
  }

  // se crea una expresión regular que busca coincidencias con el texto ingresado
  const regex = new RegExp(inputValue, "i"); // 'i' para que no tome mayúsculas o minúsculas

  //se recorre cada elemento de movieList y se verifica si coincide con el título, género, tagline o el resumen utilizando regex.test()
  movieList.forEach(item => {
    if (
      regex.test(item.title) ||
      item.genres.some(genre => regex.test(genre.name)) ||
      regex.test(item.tagline) ||
      regex.test(item.overview)
    ) 
    //Si se encuentra una coincidencia, se llama a createListItem(item) para mostrar la película en la lista.
    {
      createListItem(item);
    }
  });
});
