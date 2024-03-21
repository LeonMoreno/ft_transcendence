// const resolveRoutes = (route) => {
//   if (route.length <= 3) {
//     let validRoute = route === "/" ? route : "/:id";
//     return validRoute;
//   }

//   return `/${route}`; // /about
// };

// export default resolveRoutes;

/**
 * Resuelve la ruta proporcionada a un formato estandarizado para el enrutamiento.
 * 
 * @param {string} route La ruta actual obtenida de la URL.
 * @returns {string} La ruta resuelta.
 */
const resolveRoutes = (route) => {
  // Si la ruta es exactamente "/" (inicio), la devuelve tal cual.
  if (route === "/") {
    return route;
  }

  // Dividimos la ruta por "/" para analizar sus partes.
  const routeParts = route.split("/");

  // Rutas dinámicas: asumimos que cualquier ruta con un segmento después del primero es dinámica, como "/posts/1".
  // Para este ejemplo, convertiremos cualquier ruta con un segundo segmento a "/:id".
  // Nota: Esto es bastante simplificado y deberías ajustarlo según tus necesidades específicas.
  if (routeParts.length > 1) {
    return `/${routeParts[1]}${routeParts.length > 2 ? '/:id' : ''}`;
  }

  // Si ninguna de las condiciones anteriores se cumple, se asume que es una ruta estática y se devuelve tal cual.
  return route;
};

export default resolveRoutes;
