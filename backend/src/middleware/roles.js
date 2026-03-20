



export const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {

    const { rol } = req.usuario;
    console.log("Rol del usuario:", rol);
    console.log("Roles permitidos:", rolesPermitidos);
    if (!rolesPermitidos.includes(rol)) {
      return res.status(403).json({
        error: "No tienes permisos para acceder a este recurso"
      });
    }

    next();
  };
};