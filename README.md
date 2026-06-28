# Dynamis — Backend Final (TechRetail Solutions S.R.L.)

**Empresa de desarrollo:** Dynamis

API backend para la gestión de comercios, tiendas, productos y ventas de **TechRetail Solutions S.R.L.** Esta es la entrega final del proyecto: incorpora autenticación con JWT, persistencia en **MongoDB Atlas** mediante Mongoose, un módulo de **chat en tiempo real por roles** con Socket.IO, y una suite de pruebas automatizadas con Jest y Supertest.

## Tabla de contenidos

- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Frontend](#frontend)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Ejecución](#ejecución)
- [Carga de datos de prueba (seed)](#carga-de-datos-de-prueba-seed)
- [Pruebas automatizadas](#pruebas-automatizadas)
- [API — Endpoints principales](#api--endpoints-principales)
- [WebSockets — Chat por roles](#websockets--chat-por-roles)
- [Equipo de desarrollo](#equipo-de-desarrollo)

## Tecnologías utilizadas

- **Entorno de ejecución:** Node.js
- **Framework:** Express 5
- **Base de datos:** MongoDB Atlas (cloud)
- **ODM / Modelado:** Mongoose
- **Autenticación:** JSON Web Tokens (jsonwebtoken) + hashing de contraseñas (bcrypt / bcryptjs)
- **Comunicación en tiempo real:** Socket.IO
- **Middlewares:** CORS, validadores personalizados, dotenv
- **Testing:** Jest + Supertest + cross-env
- **Desarrollo:** Nodemon

## Frontend

El frontend (dashboard visual) está construido con **HTML, CSS y JavaScript puro** (sin frameworks), y se sirve como contenido estático desde la carpeta `public/`. Para la visualización del historial de ventas se utiliza **[Chart.js](https://www.chartjs.org/)**, que renderiza los gráficos consumiendo los datos expuestos por la API (`/api/ventas`).

Una vez levantado el servidor, el dashboard es accesible en:

```
http://localhost:3000/
```

## Estructura del proyecto

```
.
├── config/             # Configuración de la app (conexión a la base de datos, etc.)
├── public/             # Frontend estático (HTML, CSS, JS) + dashboard con Chart.js
├── src/
│   ├── models/         # Modelos de Mongoose (Comercio, Tienda, etc.)
│   ├── routes/         # Rutas de la API (auth, comercios, tiendas, productos, ventas)
│   ├── middlewares/    # Middlewares personalizados (ej. validarBodyVacio)
│   └── utils/          # Utilidades, incluido el seeder de datos
├── tests/              # Pruebas automatizadas (Jest / Supertest)
├── server.js           # Punto de entrada de la aplicación
├── package.json
└── .gitignore
```

## Requisitos previos

- [Node.js](https://nodejs.org/) instalado.
- Una base de datos en **MongoDB Atlas** (o instancia de MongoDB accesible vía URI de conexión).

## Instalación

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/rodgpinto/Dynamis-Back-End-Final
   ```

2. Ingresar a la carpeta del proyecto:

   ```bash
   cd Dynamis-Back-End-Final
   ```

3. Instalar las dependencias:

   ```bash
   npm install
   ```

## Variables de entorno

El proyecto utiliza `dotenv` para la configuración. Crear un archivo `.env` en la raíz del proyecto con, al menos, las siguientes variables:

```env
PORT=3000
MONGO_URI=<tu_uri_de_conexión_a_MongoDB_Atlas>
JWT_SECRET=<tu_clave_secreta_para_firmar_tokens>
NODE_ENV=development
```

> ⚠️ El archivo `.env` no debe subirse al repositorio (ya está incluido en `.gitignore`).

## Ejecución

Levantar el servidor en modo desarrollo (con reinicio automático vía Nodemon):

```bash
npm run dev
```

Levantar el servidor en modo producción:

```bash
npm start
```

Por defecto, la aplicación queda disponible en:

```
http://localhost:3000
```

## Carga de datos de prueba (seed)

El proyecto incluye un script para poblar la base de datos con datos de ejemplo (comercios, tiendas, etc.), útil para evaluación y pruebas:

```bash
npm run seed
```

## Pruebas automatizadas

Las pruebas están escritas con **Jest** y **Supertest**, y corren en modo aislado gracias a `cross-env NODE_ENV=test` (en este modo el servidor no queda escuchando en un puerto, lo que permite testear la app de forma controlada).

```bash
npm test
```

## API — Endpoints principales

Todas las rutas de la API están montadas bajo el prefijo `/api`:

| Recurso        | Prefijo de ruta     | Descripción                                  |
|----------------|----------------------|-----------------------------------------------|
| Autenticación  | `/api/auth`          | Registro, login y gestión de sesión (JWT)     |
| Comercios      | `/api/comercios`     | CRUD de comercios                             |
| Tiendas        | `/api/tiendas`       | CRUD de tiendas asociadas a un comercio       |
| Productos      | `/api/productos`     | CRUD de productos                             |
| Ventas         | `/api/ventas`        | Registro y consulta de ventas                 |

Todas las peticiones bajo `/api` pasan por un middleware de validación (`validarBodyVacio`) que rechaza solicitudes con cuerpo vacío cuando corresponde.

## WebSockets — Chat por roles

El servidor expone un canal de comunicación en tiempo real mediante **Socket.IO**, pensado para un sistema de soporte/chat diferenciado por rol:

- **Administradores:** al conectarse y emitir `unirseAConversacion` con `rol: "Admin"`, se unen a una sala compartida `sala_soporte`, donde reciben todos los mensajes de los usuarios.
- **Usuarios:** se unen a una sala privada individual (`usuario_<usuarioId>`).
- **Envío de mensajes:** mediante el evento `mensaje_cliente`:
  - Si lo envía un Admin, el mensaje se reenvía tanto a la sala privada del usuario destinatario (`para`) como a `sala_soporte`.
  - Si lo envía un usuario, el mensaje se reenvía a `sala_soporte` y a su propia sala privada (para reflejarlo en su historial).
- El servidor emite las respuestas mediante el evento `mensaje_servidor`.

## Equipo de desarrollo

- Facal, Ximena
- Guarachi, Franco
- Pinto, Rodrigo
- Skaarup, Mara