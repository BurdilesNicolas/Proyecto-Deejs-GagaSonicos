//Página de Términos y Condiciones + Política de Privacidad de Deej's
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import "../estilos/Politicas.css";

/* ==========================================================
   Politicas.jsx
   Términos y Condiciones + Política de Privacidad de Deej's.
   - El Navbar y el Footer los dibuja App.jsx para todas las páginas.
   - Los estilos están al final de este archivo (constante "estilos").
   ========================================================== */

// ---------- Ayudantes para escribir los documentos ----------
const h = (n, texto) => ({ tipo: "titulo", n, texto }); // "1. Responsable del sitio"
const p = (texto) => ({ tipo: "p", texto }); // párrafo
const aviso = (etiqueta, texto) => ({ tipo: "aviso", etiqueta, texto }); // nota destacada
const lista = (...items) => ({ tipo: "lista", items }); // lista con viñetas
const lineas = (...items) => ({ tipo: "lineas", items }); // varias líneas seguidas

// ---------- Contenido de los documentos (texto original) ----------
const DOCUMENTOS = [
  {
    id: "terminos",
    menu: "Términos y Condiciones",
    icono: "bi-file-earmark-text",
    titulo: "TÉRMINOS Y CONDICIONES DE SERVICIO",
    actualizacion: "octubre de 2026",
    bloques: [
      p("Bienvenido/a a deej´s, tienda online de música perteneciente a GagaSonicos Records."),
      p("Estos Términos y Condiciones regulan el acceso y utilización del sitio web, así como la compra de productos y entradas ofrecidos a través de la plataforma."),
      aviso("Importante:", "deej´s es un proyecto web ficticio desarrollado con fines educativos y escolares. Los datos empresariales y de contacto utilizados en este documento son ficticios."),

      h(1, "Aceptación de los términos"),
      p("Al acceder, registrarse o realizar una compra en deej´s, el usuario declara haber leído y aceptado estos Términos y Condiciones."),
      p("Si el usuario no está de acuerdo con alguno de ellos, deberá abstenerse de utilizar el sitio o realizar compras a través de la plataforma."),

      h(2, "Información del sitio"),
      p("deej´s es una tienda online dedicada a la comercialización de productos relacionados con la música."),
      p("Entre los productos ofrecidos se encuentran:"),
      lista(
        "CD y discos.",
        "Vinilos.",
        "Cassettes.",
        "Entradas para conciertos y eventos.",
        "Productos de merchandising."
      ),
      p("Todos los productos ofrecidos en el sitio son considerados nuevos, salvo que se indique expresamente lo contrario."),

      h(3, "Registro de usuarios"),
      p("Para realizar compras en deej´s es necesario crear una cuenta."),
      p("Durante el registro se podrán solicitar datos como:"),
      lista("Nombre.", "Apellido.", "Correo electrónico."),
      p("El usuario se compromete a proporcionar información verdadera, actualizada y suficiente para permitir el correcto funcionamiento de su cuenta y la gestión de sus pedidos."),
      p("El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso."),

      h(4, "Productos y disponibilidad"),
      p("Los productos publicados en el sitio estarán sujetos a disponibilidad."),
      p("Las imágenes utilizadas en deej´s tienen carácter ilustrativo y pueden presentar pequeñas diferencias respecto del producto recibido."),
      p("La disponibilidad de un producto puede modificarse sin previo aviso."),
      p("En caso de que un producto adquirido no se encuentre disponible, deej´s podrá comunicarse con el usuario para ofrecer una alternativa, gestionar la devolución del importe correspondiente o adoptar una solución acordada con el comprador."),

      h(5, "Precios"),
      p("Los precios de los productos serán los indicados en el sitio al momento de realizar la compra."),
      p("El precio mostrado podrá estar sujeto a modificaciones futuras. Los cambios de precio no afectarán, en principio, a una compra que ya haya sido correctamente confirmada."),
      p("Los costos de envío podrán informarse durante el proceso de compra."),

      h(6, "Medios de pago"),
      p("deej´s ofrece diferentes alternativas de pago, entre ellas:"),
      lista(
        "Mercado Pago.",
        "MODO.",
        "Tarjetas y medios ofrecidos por bancos argentinos.",
        "Otros medios de pago disponibles en el momento de la compra."
      ),
      p("El procesamiento de los pagos puede ser realizado por plataformas o entidades financieras externas."),
      p("Una compra se considerará correctamente realizada una vez que el pago haya sido aprobado y el pedido haya sido confirmado por el sistema."),

      h(7, "Envíos"),
      p("deej´s realiza envíos dentro de la República Argentina."),
      p("Los pedidos serán enviados mediante servicios de correo, principalmente Correo Argentino."),
      p("Los plazos de entrega pueden variar según el destino, el servicio seleccionado, la disponibilidad del producto y circunstancias relacionadas con el transporte."),
      p("Una vez entregado el paquete al servicio de correo, los tiempos propios del transporte dependerán del proveedor logístico."),
      p("El usuario deberá proporcionar correctamente los datos necesarios para la entrega."),

      h(8, "Productos dañados durante el envío"),
      p("Si un producto llega dañado como consecuencia del transporte, el usuario deberá comunicarse con deej´s para informar la situación."),
      p("Una vez verificado el reclamo, se realizará el cambio del producto cuando sea posible."),
      p("En los casos en los que corresponda realizar un cambio debido a daños producidos durante el envío, deej´s asumirá los costos asociados a dicho cambio."),
      p("Se podrá solicitar al usuario material fotográfico u otra información que permita comprobar el estado en que fue recibido el producto."),

      h(9, "Cambios y devoluciones"),
      p("Los usuarios podrán solicitar cambios o devoluciones dentro de un plazo de 10 días desde la recepción del producto, de acuerdo con las condiciones aplicables a cada caso."),
      p("Cuando corresponda una devolución por un motivo contemplado en estas condiciones, los costos de envío asociados serán asumidos por deej´s."),
      p("El producto deberá encontrarse en condiciones adecuadas para poder ser evaluado."),
      p("Los productos que hayan sido abiertos, utilizados o presenten signos de uso no podrán ser devueltos bajo esta política, salvo que presenten un defecto o daño que corresponda solucionar de acuerdo con las condiciones aplicables."),

      h(10, "Devolución de entradas"),
      p("Las entradas para conciertos y eventos también podrán ser objeto de solicitudes de devolución."),
      p("deej´s aceptará solicitudes de devolución de entradas dentro de los 10 días posteriores a la compra, siempre que las condiciones del evento y la operación permitan efectuar dicha devolución."),
      p("En caso de cancelación de un evento, se informará a los compradores sobre el procedimiento correspondiente."),

      h(11, "Cancelación y reprogramación de eventos"),
      p("En caso de que un concierto o evento sea cancelado o reprogramado, deej´s comunicará la situación a los compradores afectados."),
      p("Cuando corresponda, los compradores podrán solicitar la devolución del importe abonado o utilizar la entrada adquirida para la nueva fecha, según las condiciones establecidas para el evento."),
      p("Las condiciones específicas podrán variar según el organizador y las características de cada evento."),

      h(12, "Propiedad intelectual"),
      p("Todos los elementos que forman parte de deej´s, incluyendo su nombre, logotipo, diseño, textos, imágenes, gráficos y demás contenidos originales, se encuentran protegidos por las normas aplicables sobre propiedad intelectual."),
      p("No está permitido copiar, reproducir, modificar, distribuir o utilizar comercialmente los contenidos propios del sitio sin autorización."),
      p("Las marcas, nombres de artistas, sellos discográficos y demás elementos pertenecientes a terceros continúan siendo propiedad de sus respectivos titulares."),

      h(13, "Uso correcto del sitio"),
      p("El usuario se compromete a utilizar deej´s de forma responsable y legal."),
      p("No está permitido:"),
      lista(
        "Utilizar el sitio para actividades ilícitas.",
        "Intentar acceder sin autorización a cuentas o sistemas.",
        "Introducir código malicioso o realizar acciones destinadas a afectar el funcionamiento de la plataforma.",
        "Proporcionar información falsa con intención de perjudicar a otros usuarios o al sitio.",
        "Utilizar el sitio para realizar operaciones fraudulentas."
      ),
      p("deej´s podrá tomar medidas ante usos indebidos de la plataforma."),

      h(14, "Cuentas de usuario"),
      p("El usuario es responsable de mantener actualizados sus datos y de proteger sus credenciales de acceso."),
      p("Si sospecha que otra persona ha accedido a su cuenta sin autorización, deberá comunicarse con deej´s."),
      p("En situaciones de uso fraudulento o indebido, deej´s podrá suspender temporalmente una cuenta mientras se analiza la situación."),

      h(15, "Limitación de responsabilidad"),
      p("deej´s procurará mantener el sitio disponible y funcionando correctamente. Sin embargo, pueden producirse interrupciones ocasionadas por tareas de mantenimiento, problemas técnicos, fallas de terceros o circunstancias fuera del control del sitio."),
      p("En relación con los servicios de terceros, como plataformas de pago o empresas de correo, deej´s no controla directamente sus sistemas, tiempos de funcionamiento ni políticas internas."),

      h(16, "Protección de datos personales"),
      p("El tratamiento de los datos personales de los usuarios se encuentra explicado en la Política de Privacidad de deej´s, que forma parte de las condiciones de utilización del sitio."),
      p("Al utilizar la plataforma, el usuario declara conocer dicha política."),

      h(17, "Modificación de los términos"),
      p("deej´s podrá modificar estos Términos y Condiciones cuando sea necesario para reflejar cambios en los productos, servicios o funcionamiento de la plataforma."),
      p("Las modificaciones serán publicadas en el sitio."),
      p("El uso continuado de la plataforma después de la publicación de cambios implicará la aceptación de los nuevos términos."),

      h(18, "Legislación aplicable"),
      p("Estos Términos y Condiciones se encuentran redactados tomando como referencia el funcionamiento de una tienda online ficticia destinada al público argentino."),
      p("Para un comercio real, las condiciones deberán adecuarse a la legislación argentina vigente y a las características específicas de la actividad comercial."),

      h(19, "Contacto"),
      p("Para realizar consultas, reclamos o solicitar información relacionada con una compra, el usuario podrá comunicarse con:"),
      lineas("deej´s — GagaSonicos Records"),
      lineas(
        "Correo general: contacto@deejs.com",
        "Correo de GagaSonicos Records: contacto@gagasonicos.com"
      ),
    ],
  },

  {
    id: "privacidad",
    menu: "Política de Privacidad",
    icono: "bi-shield-lock",
    titulo: "POLÍTICA DE PRIVACIDAD",
    actualizacion: "octubre de 2026",
    bloques: [
      p("En deej´s, tienda online perteneciente a GagaSonicos Records, nos comprometemos a proteger la privacidad de nuestros usuarios y a utilizar sus datos personales de manera responsable."),
      p("La presente Política de Privacidad explica qué información recopilamos, para qué la utilizamos y cuáles son los derechos de los usuarios respecto de sus datos personales."),
      aviso("Importante:", "deej´s es un proyecto web ficticio desarrollado con fines educativos y escolares. Los datos de contacto y demás información empresarial incluidos en este documento son ficticios."),

      h(1, "Responsable del sitio"),
      p("El responsable ficticio del sitio web deej´s es:"),
      lineas("GagaSonicos Records", "Correo de contacto: contacto@gagasonicos.com"),
      p("Para consultas relacionadas específicamente con el sitio web y sus productos también puede utilizarse:"),
      p("contacto@deejs.com"),

      h(2, "Información que recopilamos"),
      p("Para utilizar determinadas funciones de deej´s, especialmente para realizar compras, puede ser necesario crear una cuenta de usuario."),
      p("Los datos que podemos solicitar son:"),
      lista(
        "Nombre.",
        "Apellido.",
        "Correo electrónico.",
        "Información necesaria para gestionar el pedido y su entrega.",
        "Información relacionada con la compra realizada."
      ),
      p("Los datos de pago no son almacenados directamente por deej´s cuando el pago se realiza mediante plataformas o entidades externas. El procesamiento del pago se realiza a través del proveedor de pago correspondiente."),

      h(3, "Finalidad de la recopilación de datos"),
      p("Los datos personales proporcionados por los usuarios pueden utilizarse para:"),
      lista(
        "Crear y administrar la cuenta del usuario.",
        "Procesar y gestionar pedidos.",
        "Confirmar compras.",
        "Coordinar el envío de los productos.",
        "Comunicarnos con el usuario en relación con su compra.",
        "Gestionar cambios, devoluciones o reclamos.",
        "Brindar atención al cliente.",
        "Mejorar el funcionamiento y la experiencia de navegación del sitio.",
        "Cumplir con las obligaciones que correspondan a una operación comercial."
      ),
      p("deej´s no utilizará los datos personales para finalidades distintas de aquellas para las que fueron recopilados, salvo que corresponda conforme a la normativa aplicable."),

      h(4, "Datos de pago"),
      p("deej´s ofrece diferentes medios de pago, entre ellos Mercado Pago, MODO y medios de pago proporcionados por bancos y entidades financieras argentinas."),
      p("La información necesaria para efectuar el pago puede ser procesada directamente por dichos proveedores. deej´s no pretende almacenar datos completos de tarjetas de crédito o débito en sus propios sistemas."),
      p("Cada proveedor de pago puede contar con sus propias políticas de privacidad y condiciones de utilización."),

      h(5, "Envíos"),
      p("Los productos adquiridos a través de deej´s se envían dentro de la República Argentina mediante servicios de correo, principalmente Correo Argentino."),
      p("Para poder realizar un envío correctamente, puede ser necesario solicitar información adicional a la utilizada para crear la cuenta, como datos de domicilio, localidad, provincia y otros datos necesarios para la entrega."),
      p("Esta información será utilizada exclusivamente para gestionar el pedido y su envío, así como para atender eventuales consultas o reclamos relacionados con la entrega."),

      h(6, "Cookies"),
      p("deej´s utiliza cookies y tecnologías similares con fines propios."),
      p("Las cookies pueden utilizarse para:"),
      lista(
        "Mantener el funcionamiento de la sesión del usuario.",
        "Recordar determinadas preferencias.",
        "Facilitar la navegación.",
        "Mantener productos agregados al carrito.",
        "Mejorar la experiencia de uso del sitio.",
        "Obtener información básica sobre el funcionamiento de determinadas funciones propias."
      ),
      p("Las cookies utilizadas por deej´s no tienen como finalidad solicitar información personal adicional de los usuarios que no resulte necesaria para el funcionamiento del sitio."),
      p("El usuario puede configurar su navegador para aceptar, bloquear o eliminar cookies. Sin embargo, algunas funciones del sitio podrían no funcionar correctamente si determinadas cookies son deshabilitadas."),

      h(7, "Protección de la información"),
      p("deej´s adopta medidas razonables destinadas a proteger la información personal de los usuarios frente a accesos, modificaciones, pérdidas o usos no autorizados."),
      p("Sin embargo, ningún sistema de almacenamiento o transmisión de información por Internet puede garantizar una seguridad absoluta."),

      h(8, "Conservación de los datos"),
      p("Los datos personales serán conservados durante el tiempo necesario para cumplir con las finalidades indicadas en esta Política de Privacidad y para atender las obligaciones que puedan corresponder."),
      p("Cuando los datos ya no resulten necesarios, podrán ser eliminados o anonimizados de acuerdo con las posibilidades técnicas y las obligaciones aplicables."),

      h(9, "Comunicación de datos a terceros"),
      p("Para poder prestar determinados servicios, deej´s puede necesitar compartir información limitada con terceros relacionados con la operación solicitada por el usuario."),
      p("Esto puede incluir, entre otros:"),
      lista(
        "Empresas de correo y servicios de logística.",
        "Plataformas de pago.",
        "Entidades financieras.",
        "Proveedores tecnológicos necesarios para el funcionamiento del sitio."
      ),
      p("La información compartida será la necesaria para cumplir con la finalidad correspondiente."),

      h(10, "Derechos de los usuarios"),
      p("Los usuarios podrán solicitar información acerca de los datos personales que se encuentren asociados a su cuenta y, cuando corresponda, solicitar su actualización, rectificación o eliminación."),
      p("También podrán realizar consultas relacionadas con el tratamiento de sus datos personales."),
      p("Para efectuar una consulta relacionada con la privacidad, el usuario podrá comunicarse mediante:"),
      p("contacto@deejs.com"),

      h(11, "Menores de edad"),
      p("deej´s está destinado a usuarios que tengan capacidad para realizar compras y contratar servicios conforme a la legislación aplicable."),
      p("Los menores de edad deberán contar con la autorización y supervisión de sus padres, tutores o representantes legales cuando corresponda."),

      h(12, "Modificaciones de esta Política"),
      p("deej´s podrá actualizar esta Política de Privacidad cuando resulte necesario para reflejar cambios en el funcionamiento del sitio, en los servicios ofrecidos o en las prácticas de tratamiento de información."),
      p("La versión vigente estará disponible en esta misma sección."),

      h(13, "Contacto"),
      p("Ante cualquier consulta relacionada con esta Política de Privacidad, los usuarios podrán comunicarse con:"),
      lineas("GagaSonicos Records", "Correo: contacto@gagasonicos.com"),
      p("También puede utilizarse contacto@deejs.com para consultas generales relacionadas con deej´s."),
    ],
  },
];

// Dibuja un bloque del documento según su tipo
const renderBloque = (bloque, i) => {
  switch (bloque.tipo) {
    case "titulo":
      return (
        <h3 key={i} className="pol-seccion">
          <span className="pol-num">{bloque.n}.</span>
          {bloque.texto}
        </h3>
      );

    case "aviso":
      return (
        <p key={i} className="pol-aviso">
          <strong>{bloque.etiqueta}</strong> {bloque.texto}
        </p>
      );

    case "lista":
      return (
        <ul key={i} className="pol-lista">
          {bloque.items.map((item, j) => (
            <li key={j}>{item}</li>
          ))}
        </ul>
      );

    case "lineas":
      return (
        <p key={i} className="pol-lineas">
          {bloque.items.map((linea, j) => (
            <span key={j}>{linea}</span>
          ))}
        </p>
      );

    default:
      return <p key={i}>{bloque.texto}</p>;
  }
};

function Politicas() {
  const { hash } = useLocation();

  // Por defecto se muestran los Términos y Condiciones.
  // Si llegan con /Politicas#privacidad se abre la Política de Privacidad.
  const [docActual, setDocActual] = useState(
    hash === "#privacidad" ? "privacidad" : "terminos"
  );
  const lecturaRef = useRef(null);

  useEffect(() => {
    if (hash === "#privacidad") setDocActual("privacidad");
    if (hash === "#terminos") setDocActual("terminos");
  }, [hash]);

  // Al cambiar de documento, la lectura vuelve al comienzo
  useEffect(() => {
    if (lecturaRef.current) lecturaRef.current.scrollTop = 0;
  }, [docActual]);

  const documento = DOCUMENTOS.find((d) => d.id === docActual) || DOCUMENTOS[0];

  return ( //Muestra la vista de politicas
    <div className="pol-page">
        
      <div className="pol-contenedor">
        <header className="pol-encabezado">
          <h1 className="pol-titulo">Información legal</h1>
          <p className="pol-subtitulo">
            Consultá los documentos que regulan el uso de Deej&apos;s.
          </p>
        </header>

        <div className="pol-layout">

          {/* Menú lateral */}
          <nav className="pol-menu" aria-label="Documentos legales">
            <h2 className="pol-menu-titulo">Documentos</h2>

            <div className="pol-opciones">
              {DOCUMENTOS.map((doc) => ( // Genera los botones del menú dependiendo de cuantos documentos estén definidos
                <button
                  key={doc.id}
                  type="button"
                  className={`pol-opcion ${doc.id === docActual ? "pol-opcion--activa" : ""}`}
                  onClick={() => setDocActual(doc.id)}
                  aria-current={doc.id === docActual ? "true" : undefined}
                >
                  <i className={`bi ${doc.icono}`}></i>
                  <span>{doc.menu}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Tarjeta de lectura con scroll que carga cada el documento seleccionado*/}
          <article className="pol-tarjeta">
            <div
              className="pol-scroll"
              ref={lecturaRef}
              tabIndex={0}
              aria-label={`Texto de ${documento.menu}`}
            >
              <div className="pol-documento" key={documento.id}>
                <header>
                  <h2 className="pol-doc-titulo">{documento.titulo}</h2>
                  <p className="pol-doc-fecha">
                    Última actualización: {documento.actualizacion}
                  </p>
                </header>

                <div className="pol-doc-cuerpo">
                  {documento.bloques.map((bloque, i) => renderBloque(bloque, i))}
                </div>
              </div>
            </div>
          </article>

        </div>
      </div>
    </div>
  );
}

export default Politicas;