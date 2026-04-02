import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/AuthPages.css";

function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    contraseña: "",
    confirmarContraseña: "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { register, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Si ya está autenticado, redirigir
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Validar campo de nombre
  const validateNombre = (nombre) => {
    if (!nombre.trim()) return "El nombre es requerido";
    if (nombre.trim().length < 2 || nombre.trim().length > 100)
      return "El nombre debe tener entre 2 y 100 caracteres";
    if (/\d/.test(nombre)) return "El nombre no puede contener números";
    return "";
  };

  // Validar campo de teléfono
  const validateTelefono = (telefono) => {
    const telefonoLimpio = telefono.replace(/\D/g, "");
    if (telefonoLimpio.length !== 10) {
      return "El teléfono debe tener exactamente 10 dígitos";
    }
    return "";
  };

  // Validar email
  const validateEmail = (email) => {
    if (!email.trim()) return "El correo es requerido";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Por favor ingresa un correo válido";
    return "";
  };

  // Validar contraseña
  const validateContraseña = (contraseña) => {
    if (!contraseña) return "La contraseña es requerida";
    if (contraseña.length < 8)
      return "La contraseña debe tener mínimo 8 caracteres";
    if (!/[A-Z]/.test(contraseña))
      return "La contraseña debe tener al menos 1 mayúscula";
    if (!/[a-z]/.test(contraseña))
      return "La contraseña debe tener al menos 1 minúscula";
    if (!/\d/.test(contraseña))
      return "La contraseña debe tener al menos 1 número";
    if (!/[!@#$%^&*()_+\-=\[\];:'",.<>?\/\\|`~]/.test(contraseña))
      return "La contraseña debe tener al menos 1 carácter especial (!@#$%^&*...)";
    return "";
  };

  const validateForm = () => {
    const errors = {};

    const nombreError = validateNombre(formData.nombre);
    if (nombreError) errors.nombre = nombreError;

    const telefonoError = validateTelefono(formData.telefono);
    if (telefonoError) errors.telefono = telefonoError;

    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    const contraseñaError = validateContraseña(formData.contraseña);
    if (contraseñaError) errors.contraseña = contraseñaError;

    if (formData.contraseña !== formData.confirmarContraseña) {
      errors.confirmarContraseña = "Las contraseñas no coinciden";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo mientras escribe
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      clearError();
      setSuccessMessage("");

      await register(
        formData.nombre,
        formData.telefono,
        formData.email,
        formData.contraseña
      );

      setSuccessMessage(
        "¡Registro exitoso! Redirigiendo a login en 2 segundos..."
      );
      setFormData({
        nombre: "",
        telefono: "",
        email: "",
        contraseña: "",
        confirmarContraseña: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Register error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Mi Sistema Barbería</h1>
        <h2>Crear Cuenta</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre Completo</label>
            <input
              id="nombre"
              type="text"
              name="nombre"
              placeholder="Juan Pérez"
              value={formData.nombre}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
            {validationErrors.nombre && (
              <span className="field-error">{validationErrors.nombre}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Teléfono</label>
            <input
              id="telefono"
              type="text"
              name="telefono"
              placeholder="3105551234"
              value={formData.telefono}
              onChange={handleChange}
              maxLength="10"
              disabled={isSubmitting}
              required
            />
            {validationErrors.telefono && (
              <span className="field-error">{validationErrors.telefono}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
            {validationErrors.email && (
              <span className="field-error">{validationErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="contraseña">Contraseña</label>
            <input
              id="contraseña"
              type="password"
              name="contraseña"
              placeholder="Contraseña segura"
              value={formData.contraseña}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
            {validationErrors.contraseña && (
              <span className="field-error">{validationErrors.contraseña}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmarContraseña">
              Confirmar Contraseña
            </label>
            <input
              id="confirmarContraseña"
              type="password"
              name="confirmarContraseña"
              placeholder="Confirma tu contraseña"
              value={formData.confirmarContraseña}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
            {validationErrors.confirmarContraseña && (
              <span className="field-error">
                {validationErrors.confirmarContraseña}
              </span>
            )}
          </div>

          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registrando..." : "Crear Cuenta"}
          </button>
        </form>

        <div className="auth-links">
          <p>
            ¿Ya tienes cuenta? <a href="/login">Inicia sesión aquí</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
