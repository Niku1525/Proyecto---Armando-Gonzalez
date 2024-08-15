document.addEventListener('DOMContentLoaded', () => {
    const userSection = document.getElementById('user-section');
    const loginSection = document.getElementById('login-section');
    const userName = document.getElementById('user-name');
    const postForm = document.getElementById('post-form');
    const loginRequiredMessage = document.getElementById('login-required-message');

    fetch('/session')
        .then(response => response.json())
        .then(data => {
            if (data.user) {
                loginSection.style.display = 'none';
                userSection.style.display = 'block';
                userName.textContent = data.user;

                if (postForm && loginRequiredMessage) {
                    postForm.style.display = 'block';
                    loginRequiredMessage.style.display = 'none';
                }
            } else {
                loginSection.style.display = 'block';
                userSection.style.display = 'none';

                if (postForm && loginRequiredMessage) {
                    postForm.style.display = 'none';
                    loginRequiredMessage.style.display = 'block';
                }
            }
        });

    const registerLink = document.getElementById('register-link');
    const loginLink = document.getElementById('login-link');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (registerLink && loginLink && loginForm && registerForm) {
        registerLink.addEventListener('click', () => {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        });

        loginLink.addEventListener('click', () => {
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
        });
    }

    document.getElementById('post-form').addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData();
        formData.append('titulo', document.getElementById('titulo').value);
        formData.append('descripcion', document.getElementById('descripcion').value);
        formData.append('imagen', document.getElementById('imagen').files[0]);

        fetch('/publicar', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            alert('Publicación exitosa');
            window.location.reload();
        })
        .catch(error => {
            console.error('Error al publicar:', error);
            alert('Error al publicar');
        });
    });

    fetch('/posts', {
        method: 'GET',
    })
    .then(response => response.json())
    .then(posts => {
        const postsContainer = document.getElementById('posts-container');
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post';
            postElement.innerHTML = `
                <h3>${post.titulo}</h3>
                <p>${post.descripcion}</p>
                <img src="${post.imagen}" alt="${post.titulo}">
                <p>Publicado por: ${post.nombre_usuario} ${new Date(post.fecha_publicacion).toLocaleString()}</p>
            `;
            postsContainer.appendChild(postElement);
        });
    })
    .catch(error => {
        console.error('Error al cargar publicaciones:', error);
    });
});

async function handleLogin(event) {
    event.preventDefault();
    const loginEmail = document.getElementById('loginEmail').value;
    const loginPassword = document.getElementById('loginPassword').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ loginEmail, loginPassword })
    });

    const result = await response.json();
    if (result.success) {
        window.location.href = '/index.html';
    } else {
        alert(result.message);
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const registerEmail = document.getElementById('registerEmail').value;
    const registerPassword = document.getElementById('registerPassword').value;

    const response = await fetch('/registro', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ firstName, lastName, registerEmail, registerPassword })
    });

    const result = await response.json();
    if (result.success) {
        alert('Usuario registrado con éxito');
        window.location.href = '/login.html';
    } else {
        alert(result.message);
    }
}

function logout() {
    fetch('/logout')
        .then(() => {
            window.location.href = '/index.html';
        });
}
document.getElementById('adminLoginForm').addEventListener('submit', handleAdminLogin);

async function handleAdminLogin(event) {
    event.preventDefault();
    const adminLoginEmail = document.getElementById('adminLoginEmail').value;
    const adminLoginPassword = document.getElementById('adminLoginPassword').value;

    const response = await fetch('/admin-login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: adminLoginEmail,
            password: adminLoginPassword
        })
    });

    if (response.ok) {
        window.location.href = '/admin-dashboard.html';
    } else {
        alert('Inicio de sesión fallido. Verifica tus credenciales.');
    }
}
function showAdminLogin() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('admin-login-form').style.display = 'block';
}

document.getElementById('back-to-login').addEventListener('click', () => {
    document.getElementById('admin-login-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
});