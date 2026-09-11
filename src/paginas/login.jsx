function Login(){
    return(
        <div>
            <h1>Inicio de sesión</h1>
            <form>
                <label>Usuario</label>
                <input type="text" placeholder="Username" />
                <label>Contraseña</label>
                <input type="password" placeholder="Password" />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}
export default Login