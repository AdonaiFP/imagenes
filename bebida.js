let listBebidas = [];
const palabrasProhibidas = ["pinche", "puto", "perro", "estupido", "mamon", "gei", "puta"];
let nombreU = localStorage.getItem("nombre");
let token = localStorage.getItem("token");

init();

function init() {
    fetch(`http://localhost:8081/zarape_bebidas/api/bebidas/getAll?nombreU=${encodeURIComponent(nombreU)}&token=${encodeURIComponent(token)}`)
            .then(response => response.json())
            .then(datos => {
                listBebidas = datos;
                console.log("Lista de" + listBebidas);
                cargarBebidasActivas();
                cargarBebidasInactivas();
            });
}

function cargarBebidasActivas() {
    let table = document.getElementById("registrosA");
    let renglonA = "";
    listBebidas.forEach(bebida => {
        if (bebida.producto.activo == 1) {
            renglonA += `<tr onclick="controladorBebida.selectDeBebida(this)"><td>`
                    + bebida.producto.nombre + "</td><td>"
                    + bebida.producto.descripcion + "</td><td>"
                    + `<img alt="${bebida.producto.nombre}" src="data:image/jpeg;base64,${bebida.producto.foto}" data-foto="${bebida.producto.foto}" style="max-width: 150px;"/>`
                    + "</td><td>" + bebida.producto.precio + "</td><td>"
                    + bebida.producto.categoria.nombre + "</td><td style='display:none;'>"
                    + bebida.idBebida + "</td><td style='display:none;'>"
                    + bebida.producto.categoria.idCategoria + "</td></tr>";
        }
    });
    table.innerHTML = renglonA;
}

function cargarBebidasInactivas() {
    let table = document.getElementById("registrosI");
    let renglonI = "";
    listBebidas.forEach(bebida => {
        if (bebida.producto.activo == 0) {
            renglonI += `<tr><td>` + bebida.producto.nombre + "</td><td>"
                    + bebida.producto.descripcion + "</td><td>"
                    + `<img alt="${bebida.producto.nombre}" src="data:image/jpeg;base64,${bebida.producto.foto}" style="max-width: 150px;"/>` + "</td><td>"
                    + bebida.producto.precio + "</td><td>"
                    + bebida.producto.categoria.nombre + "</td></tr>";
        }
    });
    table.innerHTML = renglonI;
}

export function agregarB() {
    let v_id = document.getElementById("id").value;
    let v_nombre = document.getElementById("nombre").value;
    let v_descripcion = document.getElementById("descripcion").value;
    let v_foto = document.getElementById("fotoBebida").value;
    let v_precio = document.getElementById("precio").value;
    let v_categoria = document.getElementById("categoriasB").value;

    if (!v_nombre || !v_descripcion || !v_precio || !v_categoria) {
        alert("Todos los campos son obligatorios.");
        return;
    }

    if (/\d/.test(v_nombre)) {
        alert("El nombre no debe tener números.");
        return;
    }

    for (const palabra of palabrasProhibidas) {
        if (v_nombre.toLowerCase().includes(palabra)) {
            alert("El nombre contiene palabras no permitidas.");
            return;
        }
    }

    for (const palabra of palabrasProhibidas) {
        if (v_descripcion.toLowerCase().includes(palabra)) {
            alert("La descripcion contiene palabras no permitidas.");
            return;
        }
    }

    if (v_nombre.length > 45) {
        alert("El nombre no puede ser mayor a 45 carácteres");
    }

    if (v_descripcion.length > 45) {
        alert("La descripcion no puede ser mayor a 45 carácteres");
    }

    if (isNaN(v_precio) || parseFloat(v_precio) <= 0 || parseFloat(v_precio) >= 99) {
        alert("Por favor, ingresa un precio válido.");
        return;
    }

    let bebida = {
        producto: {
            nombre: v_nombre,
            descripcion: v_descripcion,
            foto: v_foto,
            precio: parseFloat(v_precio),
            categoria: {idCategoria: v_categoria}
        }
    };

    if (v_id) {
        bebida.idBebida = parseInt(v_id);
    }

    let datos_servidor = {"datosBebida": JSON.stringify(bebida),
        "nombreU": nombreU,
        "token": token};
    let parametro = new URLSearchParams(datos_servidor);

    let registro = {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: parametro
    };

    fetch('http://localhost:8081/zarape_bebidas/api/bebidas/agregar', registro)
            .then(response => response.json())
            .then(json => {
                console.log(json);
                init();
                clean();
            });
}

export function eliminarB() {
    let id = document.getElementById('id').value;

    let datos_servidor = {"idBebida": id,
        "nombreU": nombreU,
        "token": token};
    let parametro = new URLSearchParams(datos_servidor);

    let registro = {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: parametro
    };

    fetch('http://localhost:8081/zarape_bebidas/api/bebidas/eliminar', registro)
            .then(response => response.json())
            .then(json => {
                console.log(json);
                init();
                clean();
            });
}



function clean() {
    document.getElementById('id').value = "";
    document.getElementById('nombre').value = "";
    document.getElementById('descripcion').value = "";
    document.getElementById('fotoBebida').value = "";
    document.getElementById('imgFotoBebida').src = "imagenes/logo-blanco.png";
    document.getElementById('precio').value = "";
    document.getElementById('categoriasB').value = 0;
    document.getElementById('inputFotoBebida').value = "";
}

export function cargarFotografia(input) {
    // Revisamos si el usuario ha seleccionado un archivo
    if (input.files && input.files[0]) {
        let reader = new FileReader();

        reader.onload = function (e) {
            // Muestra la imagen en el <img>
            document.getElementById("imgFotoBebida").src = e.target.result;

            // Guarda la cadena Base64 sin el encabezado en el <textarea>
            document.getElementById("fotoBebida").value = e.target.result.split(",")[1];
        };

        // Leer el archivo seleccionado como Base64
        reader.readAsDataURL(input.files[0]);
    }
}

export function selectDeBebida(fila) {

    let nombre = fila.cells[0].innerText;
    let descripcion = fila.cells[1].innerText;
    let foto = fila.cells[2].querySelector("img").getAttribute("data-foto");
    let precio = fila.cells[3].innerText;
    let idBebida = fila.cells[5].innerText;
    let idCategoria = fila.cells[6].innerText;

    // Mostrar los datos en un formulario o modal (ejemplo)
    document.getElementById("nombre").value = nombre;
    document.getElementById("descripcion").value = descripcion;
    document.getElementById("imgFotoBebida").src = `data:image/jpeg;base64,${foto}`;
    document.getElementById('fotoBebida').value = foto;
    document.getElementById("precio").value = precio;
    document.getElementById("id").value = idBebida;
    document.getElementById("categoriasB").value = idCategoria;

}