
function Registro(){
return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
            
            {/* Tarjeta Contenedora */}
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="card-body">
                
                {/* Cabecera del Registro */}
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-dark mb-1">Crea tu cuenta</h2>
                  <p className="text-muted small">Regístrate para empezar a disfrutar del servicio</p>
                </div>

                <form>
                  {/* Input de Nombre Completo */}
                  <div className="form-floating mb-3">
                    <input 
                      type="text" 
                      id="registerName" 
                      className="form-control bg-light border-0 text-secondary" 
                      placeholder="Nombre completo"
                    />
                    <label htmlFor="registerName" className="text-muted">Nombre completo</label>
                  </div>

                  {/* Input de Email */}
                  <div className="form-floating mb-3">
                    <input 
                      type="email" 
                      id="registerEmail" 
                      className="form-control bg-light border-0 text-secondary" 
                      placeholder="Dirección de correo"
                    />
                    <label htmlFor="registerEmail" className="text-muted">Dirección de correo</label>
                  </div>

                  {/* Input de Contraseña */}
                  <div className="form-floating mb-3">
                    <input 
                      type="password" 
                      id="registerPassword" 
                      className="form-control bg-light border-0 text-secondary" 
                      placeholder="Contraseña"
                    />
                    <label htmlFor="registerPassword" className="text-muted">Contraseña</label>
                  </div>

                  {/* Términos y Condiciones */}
                  <div className="row my-4 align-items-center">
                    <div className="col-12">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          value=""
                          id="registerTerms"
                        />
                        <label className="form-check-label small text-secondary" htmlFor="registerTerms">
                          Acepto los <a href="#!" className="text-decoration-none fw-semibold text-primary">Términos de servicio</a> y la <a href="#!" className="text-decoration-none fw-semibold text-primary">Política de privacidad</a>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Botón de Registro */}
                  <button type="button" className="btn btn-primary w-100 py-2.5 fw-bold text-uppercase shadow-sm mb-4 rounded-3">
                    Registrarse
                  </button>

                  {/* Volver al Login y Redes Sociales */}
                  <div className="text-center">
                    <p className="small text-muted mb-4">
                      ¿Ya tienes una cuenta? <a href="paginas/login" className="text-decoration-none fw-semibold text-primary">Iniciar sesión</a>
                    </p>

                    <div className="position-relative mb-4">
                      <hr className="text-muted" />
                      <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
                        O regístrate con
                      </span>
                    </div>

                    {/* Botones de Redes Sociales con Íconos */}
                    <div className="d-flex justify-content-center gap-2">
                      <button type="button" className="btn btn-outline-light text-dark border shadow-sm px-3" title="Google">
                        <i className="bi bi-google text-danger"></i>
                      </button>
                      <button type="button" className="btn btn-outline-light text-dark border shadow-sm px-3" title="Facebook">
                        <i className="bi bi-facebook text-primary"></i>
                      </button>
                      <button type="button" className="btn btn-outline-light text-dark border shadow-sm px-3" title="GitHub">
                        <i className="bi bi-github"></i>
                      </button>
                      <button type="button" className="btn btn-outline-light text-dark border shadow-sm px-3" title="Twitter">
                        <i className="bi bi-twitter-x"></i>
                      </button>
                    </div>
                  </div>

                </form>
              </div>
            </div>
            {/* Fin Tarjeta */}

          </div>
        </div>
      </div>
    </div>
  );
}
export default Registro;