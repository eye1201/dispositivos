/* Última actualización: 25/05/2026 02:45h */
/* Script de Extracción desde Almacén HTML */
document.addEventListener("DOMContentLoaded", () => {
    // 1. Buscamos dónde hay que inyectar los productos en la página actual
    const contenedores = document.querySelectorAll(".contenedor-dinamico");
    if (contenedores.length === 0) return;

    // 2. Ruta de tu archivo maestro (verifica que la ruta sea correcta)
    const urlAlmacen = 'datos/lista-productos.html';

    fetch(urlAlmacen)
        .then(response => {
            if (!response.ok) throw new Error("No se pudo cargar el almacén de productos");
            return response.text();
        })
        .then(htmlString => {
            // 3. Convertimos el texto descargado en un DOM virtual navegable
            const parser = new DOMParser();
            const docVirtual = parser.parseFromString(htmlString, 'text/html');

            contenedores.forEach(contenedor => {
                const categoriaFiltro = contenedor.getAttribute("data-categoria");
                const gamaFiltro = contenedor.getAttribute("data-gama");

                // 4. Seleccionamos TODAS las filas de esa categoría (Cabeceras y Productos)
                const selector = `tr[data-categoria="${categoriaFiltro}"]`;
                const filasEncontradas = docVirtual.querySelectorAll(selector);

                let hayProductos = false;

                filasEncontradas.forEach(fila => {
                    // 5. Lógica de filtrado por Gama (Corregida)
                    const gamaFila = fila.getAttribute('data-gama');

                    // Si la fila tiene una gama definida y el contenedor también, deben coincidir.
                    // Si no coinciden, se salta esta fila (sea marca o producto).
                    if (gamaFila && gamaFiltro && gamaFila !== gamaFiltro) {
                        return; 
                    }
                    
                    // 6. Clonamos e inyectamos la fila en la tabla real
                    const filaClonada = fila.cloneNode(true);
                    contenedor.appendChild(filaClonada);
                    
                    if (fila.classList.contains('producto')) {
                        hayProductos = true;
                    }
                });

                // 7. Mensaje de seguridad si la categoría/gama está vacía
                if (!hayProductos) {
                    contenedor.innerHTML = `
                    <tr>
                        <td colspan="2" style="text-align: center; padding: 40px; color: #666;">
                            🚫 No hay productos disponibles en esta sección.
                        </td>
                    </tr>
                    `;
                }
            });

            // --- 8. SCROLL DE SEGURIDAD PARA ENLACES CON # ---
            if (window.location.hash) {
                setTimeout(() => {
                    const targetId = decodeURIComponent(window.location.hash.substring(1));
                    const element = document.getElementById(targetId);
                    if (element) {
                        element.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                }, 300); // 300ms de margen para que el navegador pinte el HTML inyectado
            }
        })
        .catch(error => {
            // 9. Pantalla de error crítico
            console.error("Error crítico de carga:", error);
            contenedores.forEach(c => {
                c.innerHTML = `
                    <tr>
                        <td colspan="2" style="text-align: center; padding: 50px; background-color: #fff0f0; border: 1px solid #ffcccc;">
                            <b style="color: #d9534f;">⚠️ Error de conexión</b>
                            <p>No se pudo cargar el catálogo de productos.</p>
                            <button onclick="location.reload()" style="margin-top: 15px; cursor: pointer; padding: 8px 16px;">Reintentar carga</button>
                        </td>
                    </tr>
                `;
            });
        });
});