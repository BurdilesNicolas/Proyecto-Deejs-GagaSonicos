function Login() {
  return (
    <div className="container mt-5">
    <form>
      {/* Email input */}
      <div className="form-outline mb-4">      
        <input type="email" id="form2Example1" className="form-control" placeholder="Dirección de correo"/>
      </div>

      {/* Password input */}
      <div className="form-outline mb-4">
        <input type="password" id="form2Example2" className="form-control" placeholder="Contraseña"/>
      </div>

      {/* 2 column grid layout */}
      <div className="row mb-4">
        <div className="col d-flex justify-content-center">
          {/* Checkbox */}
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              value=""
              id="form2Example31"
              defaultChecked
            />
            <label className="form-check-label" htmlFor="form2Example31">Recordar datos </label>
          </div>
        </div>

        <div className="col">
          {/* Simple link */}
          <a href="#!">¿Olvidaste tu contraseña?</a>
        </div>
      </div>

      {/* Submit button */}
      <button type="button" className="btn btn-primary btn-block mb-4">Iniciar sesión</button>

      {/* Register buttons */}
      <div className="text-center">
        <p>
          ¿No tienes una cuenta? <a href="#!">Registrarse</a>
        </p>

        <p>Iniciar sesión con:</p>
        <button type="button" className="btn btn-link btn-floating mx-1">Facebook</button>
        <button type="button" className="btn btn-link btn-floating mx-1">Google </button>
        <button type="button" className="btn btn-link btn-floating mx-1">Twitter</button>
        <button type="button" className="btn btn-link btn-floating mx-1">GitHub</button>
      </div>
    </form>
    </div>
  );
}

export default Login;
