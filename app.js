const express = require('express');
const mysql = require('mysql');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'save_a_paw'
});

connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.stack);
        return;
    }
    console.log('Conexión a la base de datos establecida.');
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.post('/registro', (req, res) => {
    const { firstName, lastName, registerEmail, registerPassword } = req.body;

    const queryString = 'INSERT INTO usuarios (nombre, apellido, correo, contraseña) VALUES (?, ?, ?, ?)';
    connection.query(queryString, [firstName, lastName, registerEmail, registerPassword], (err, result) => {
        if (err) {
            console.error('Error al insertar usuario:', err.stack);
            res.status(500).send('Error al registrar usuario');
            return;
        }
        res.send('<script>alert("Usuario registrado con éxito"); window.location.href = "/login.html";</script>');
        console.log('Usuario registrado correctamente:', result);
    });
});

app.post('/login', (req, res) => {
    const { loginEmail, loginPassword } = req.body;

    const queryString = 'SELECT * FROM usuarios WHERE correo = ? AND contraseña = ?';
    connection.query(queryString, [loginEmail, loginPassword], (err, results) => {
        if (err) {
            console.error('Error al buscar usuario:', err.stack);
            res.status(500).send('Error al iniciar sesión');
            return;
        }

        if (results.length > 0) {
            req.session.user = results[0];
            res.json({ success: true, user: results[0].nombre });
        } else {
            res.json({ success: false, message: 'Correo o contraseña incorrectos' });
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err.stack);
            res.status(500).send('Error al cerrar sesión');
            return;
        }
        res.redirect('/index.html');
    });
});

app.get('/session', (req, res) => {
    if (req.session.user) {
        res.json({ user: req.session.user.nombre });
    } else {
        res.json({ user: null });
    }
});

app.post('/publicar', upload.single('imagen'), (req, res) => {
    if (!req.session.user || !req.session.user.id_user) {
        console.error('No se encontró el ID de usuario en la sesión:', req.session.user);
        return res.status(401).json({ error: 'Debes iniciar sesión para publicar' });
    }

    const { titulo, descripcion } = req.body;
    const imagen = `/uploads/${req.file.filename}`;
    const fecha_publicacion = new Date();
    const estado = 'pendiente';

    const sql = 'INSERT INTO publicaciones (id_user, titulo, descripcion, imagen, fecha_publicacion, estado) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(sql, [req.session.user.id_user, titulo, descripcion, imagen, fecha_publicacion, estado], (err, result) => {
        if (err) {
            console.error('Error al publicar:', err);
            return res.status(500).json({ error: 'Error al publicar' });
        }
        res.json({ success: true, message: 'Publicación exitosa' });
    });
});

app.get('/posts', (req, res) => {
    const sql = `
        SELECT publicaciones.*, usuarios.nombre AS nombre_usuario FROM publicaciones JOIN usuarios ON publicaciones.id_user = usuarios.id_user WHERE publicaciones.estado = "aprobada"`;
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error al cargar publicaciones:', err);
            return res.status(500).json({ error: 'Error al cargar publicaciones' });
        }
        res.json(results);
    });
});

app.post('/admin-login', (req, res) => {
    const { email, password } = req.body;
  
    const query = 'SELECT * FROM administradores WHERE correo = ? AND contraseña = ?';
    connection.query(query, [email, password], (error, results) => {
        if (error) {
            res.status(500).send('Error en el servidor');
            return;
        }
  
        if (results.length > 0) {
            res.status(200).send('Inicio de sesión exitoso');
        } else {
            res.status(401).send('Correo electrónico o contraseña incorrectos');
        }
    });
});

app.get('/admin-requests', (req, res) => {
    const sql = `
        SELECT p.*, u.nombre AS nombre_usuario, u.apellido AS apellido_usuario
        FROM publicaciones p 
        JOIN usuarios u ON p.id_user = u.id_user 
        WHERE p.estado = "pendiente"
    `;
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error al cargar las solicitudes:', err);
            return res.status(500).json({ error: 'Error al cargar las solicitudes' });
        }
        res.json(results);
    });
});


app.post('/admin-approve/:id', (req, res) => {
    const { id } = req.params;
    const id_admin = req.body.id_admin; 

    const updatePublicationSql = 'UPDATE publicaciones SET estado = "aprobada" WHERE id_publicacion = ?';
    const insertRevisionSql = 'INSERT INTO revision_publicaciones (id_publicacion, id_admin, estado, fecha_revision) VALUES (?, ?, "aprobada", NOW())';

    connection.query(updatePublicationSql, [id], (err, result) => {
        if (err) {
            console.error('Error al aprobar la solicitud:', err);
            return res.status(500).json({ error: 'Error al aprobar la solicitud' });
        }
        connection.query(insertRevisionSql, [id, id_admin], (err, result) => {
            if (err) {
                console.error('Error al registrar la revisión:', err);
                return res.status(500).json({ error: 'Error al registrar la revisión' });
            }
            res.status(200).send('Solicitud aprobada');
        });
    });
});

app.post('/admin-reject/:id', (req, res) => {
    const { id } = req.params;
    const id_admin = req.body.id_admin;

    const updatePublicationSql = 'UPDATE publicaciones SET estado = "rechazada" WHERE id_publicacion = ?';
    const insertRevisionSql = 'INSERT INTO revision_publicaciones (id_publicacion, id_admin, estado, fecha_revision) VALUES (?, ?, "rechazada", NOW())';

    connection.query(updatePublicationSql, [id], (err, result) => {
        if (err) {
            console.error('Error al rechazar la solicitud:', err);
            return res.status(500).json({ error: 'Error al rechazar la solicitud' });
        }
        connection.query(insertRevisionSql, [id, id_admin], (err, result) => {
            if (err) {
                console.error('Error al registrar la revisión:', err);
                return res.status(500).json({ error: 'Error al registrar la revisión' });
            }
            res.status(200).send('Solicitud rechazada');
        });
    });
});

const chatResponses = {
    "inicio": {
        "message": "Hola, ¿cómo puedo ayudarte hoy?",
        "options": ["Contacto", "Preguntas frecuentes", "Donaciones"]
    },
    "contacto": {
        "message": "¿De que forma te gustaria ponerte en contacto con un administrador?",
        "options": ["Correo electronico", "Número de telefono"]
    },
    "correo electronico": {
        "message": "Puedes ponerte en contacto con un administrador mediante el siguiente correo: admin_save_a_paw@gmail.com",
        "options": ["¡Muchas Gracias!"]
    },
    "número de telefono": {
        "message": "Puedes ponerte en contacto con un administrador mediante el siguiente número telefonico: 3015504211",
        "options": ["¡Muchas Gracias!"]
    },
    "preguntas frecuentes": {
        "message": "Aquí hay algunas de las preguntas frecuentes de nuestros usuarios",
        "options": ["¿Cuales son los requisitos para poder adoptar?", "¿Debo pagar algo por el servicio?"]
    }, 
    "¿cuales son los requisitos para poder adoptar?": {
        "message": "Ser mayor de edad y Comprometerse al cuidado de la mascota",
        "options": ["¡Muchas Gracias!"]
    },
    "¿debo pagar algo por el servicio?":{
        "message": "El servicio es totalmente gratis, pero si deseas brindar tu apoyo puedes hacerlo por medio de Nequi",
        "options": ["¡Muchas Gracias!"]
    },
    "no":{
        "message": "Lamentamos no haber podido resolver tus inquietudes, haremos lo posible por mejorar!",
        "options": ["Inicio"]
    },
    "si":{
        "message": "¡Nos alegra poder ayudarte!",
        "options": ["Inicio"]
    },
    "donaciones":{
        "message": "Puedes brindar tu apoyo mediante nuestro Nequi: 300xxxxxxx",
        "options": ["¡Muchas Gracias!"]
    },
    "¡muchas gracias!": {
        "message": "¿Ha sido de utilidad la información",
        "options": ["Si", "No"]
    }
};

app.post('/chat', (req, res) => {
    const { option } = req.body;
    const response = chatResponses[option.toLowerCase()] || {
        "message": "Lo siento, no entiendo tu elección.",
        "options": ["Inicio"]
    };
    res.json(response);
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});