// ✅ FUNCIÓN: Validar email
export function validarEmail(correo) {
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmail.test(correo)) {
    return { valido: false, error: "Formato de correo inválido" };
  }
  if (correo.length > 100) {
    return { valido: false, error: "Correo muy largo (máx 100 caracteres)" };
  }
  return { valido: true };
}

// ✅ FUNCIÓN: Validar teléfono (10 dígitos)
export function validarTelefono(telefono) {
  const telefonoLimpio = String(telefono).replace(/\D/g, '');
  if (telefonoLimpio.length !== 10) {
    return { valido: false, error: "Teléfono debe ser exactamente 10 dígitos" };
  }
  return { valido: true };
}

// ✅ FUNCIÓN: Validar contraseña fuerte
export function validarContraseñaFuerte(contraseña) {
  if (contraseña.length < 8) {
    return { valido: false, error: "Contraseña mínimo 8 caracteres" };
  }
  if (!/[A-Z]/.test(contraseña)) {
    return { valido: false, error: "Debe tener al menos 1 mayúscula (A-Z)" };
  }
  if (!/[a-z]/.test(contraseña)) {
    return { valido: false, error: "Debe tener al menos 1 minúscula (a-z)" };
  }
  if (!/[0-9]/.test(contraseña)) {
    return { valido: false, error: "Debe tener al menos 1 número (0-9)" };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};:'",.<>?/]/.test(contraseña)) {
    return { valido: false, error: "Debe tener al menos 1 carácter especial (!@#$%)" };
  }
  return { valido: true };
}

// ✅ FUNCIÓN: Validar hora formato HH:MM
export function validarHora(hora) {
  const regexHora = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
  return regexHora.test(hora);
}

// ✅ FUNCIÓN: Comparar horas
export function horaInicio_MenorQue_horaFin(inicio, fin) {
  const [hI, mI] = inicio.split(":").map(Number);
  const [hF, mF] = fin.split(":").map(Number);

  const minutosI = hI * 60 + mI;
  const minutosF = hF * 60 + mF;

  return minutosI < minutosF;
}

// ✅ FUNCIÓN: Validar formato fecha YYYY-MM-DD
export function validarFecha(fecha) {
  const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
  if (!regexFecha.test(fecha)) {
    return { valido: false, error: "Formato de fecha inválido. Use YYYY-MM-DD" };
  }
  const fechaObj = new Date(fecha);
  if (isNaN(fechaObj.getTime())) {
    return { valido: false, error: "La fecha especificada no es válida" };
  }
  return { valido: true };
}

// ✅ FUNCIÓN: Validar nombre (no vacío, longitud 2-100)
export function validarNombre(nombre) {
  if (typeof nombre !== "string" || nombre.trim() === "") {
    return { valido: false, error: "El nombre es obligatorio" };
  }
  if (nombre.length < 2 || nombre.length > 100) {
    return { valido: false, error: "El nombre debe tener entre 2 y 100 caracteres" };
  }

  return { valido: true };

}
