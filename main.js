import express from 'express'
import router from './routers/authRouter.js';
import 'colors'
// Se crea la instancia de express
const app= express();           

// Conexion a la BD con Sequelice   
try {
    await db.authenticate();
    db.sync()   // Crea las tabla en la base de datos, si o existe
    console.log('Conexión realizada con exito a la base de datos jesusrvasDB'.bgGreen.red.bold)
} catch (error) {
    console.log('El error en la conexión es: ' + error)
}

// Configurar pug para las vistas desde el servidor
app.set('view engine','pug');   // Se establece el templeate
app.set('views','./views')      // Se configura la ruta desde donde se serviran las vistas

// Se le indica a express el sitio de la carpeta de archivos estaticos
app.use(express.static('public'))

// Se agrega el router que asigna las rutas, se debe importar el modulo Router de Express
app.use('/auth',router)

const port= 3000 || process.env.port

app.listen(port,()=>{
    console.log(`Es servidor para el formulario esta funcionando correctamente por el puerto ${port}`.bgGreen.bold )
})