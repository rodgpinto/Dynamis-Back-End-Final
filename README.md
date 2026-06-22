
#  TechRetail Solutions S.R.L. - Backend MVP (Fase 2)

**Empresa de Desarrollo:** Dynamis

Este repositorio contiene la segunda entrega del sistema backend para la gestión de comercios y tiendas de TechRetail Solutions S.R.L. En esta fase, la aplicación evolucionó de una persistencia en archivos físicos hacia una arquitectura basada en bases de datos NoSQL.
 

## Tecnologías Utilizadas

*  **Entorno de ejecución:** Node.js

*  **Framework:** Express.js

*  **Base de Datos:** MongoDB (Local)

*  **ODM / Modelado:** Mongoose

*  **Motor de Plantillas:** Pug (Interfaz visual Dashboard)

*  **Middlewares:** CORS, validadores personalizados.

  
## Requisitos Previos

Para que el proyecto funcione correctamente en un entorno local, es necesario contar con:

1. [Node.js](https://nodejs.org/) instalado.

2. [MongoDB](https://www.mongodb.com/try/download/community) instalado y corriendo localmente en el puerto por defecto (`27017`).
  

## Instalación y Ejecución


1. Clonar este repositorio en tu máquina local:

	```git clone https://github.com/rodgpinto/Dynamis-Back-End-2```

2. Ingresar a la carpeta del proyecto:

	```cd Dynamis-Back-End-2``` 

3. Instalar las dependencias de Node:

	```npm install``` 

4. Levantar el servidor:

	```npm run dev``` 

Aclaración importante sobre la Base de Datos

Para facilitar la evaluación y las pruebas del sistema, la aplicación cuenta con un Inicializador Automático de Datos.

  

Si el sistema detecta que la base de datos dynamis_db está vacía (por ejemplo, en la primera ejecución), inyectará automáticamente un set de datos de prueba que incluye comercios activos, comercios con baja lógica y tiendas asociadas. Podrás visualizarlos inmediatamente accediendo a:

  

```http://localhost:3000/dashboard```

  

**Equipo de Desarrollo:**

Facal, Ximena
Guarachi, Franco
Pinto, Rodrigo
Skaarup, Mara