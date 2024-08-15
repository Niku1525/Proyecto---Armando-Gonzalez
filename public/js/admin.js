document.addEventListener('DOMContentLoaded', () => {
    loadRequests();
});

async function loadRequests() {
    try {
        const response = await fetch('/admin-requests');
        if (response.ok) {
            const requests = await response.json();
            const requestsTableBody = document.getElementById('requestsTableBody');
            requestsTableBody.innerHTML = '';

            requests.forEach(request => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${request.titulo}</td>
                    <td>${request.descripcion}</td>
                    <td>${request.nombre_usuario} ${request.apellido_usuario}</td>
                    <td><img src="${request.imagen}" alt="Imagen de Publicación" class="img-thumbnail" style="width: 100px; height: auto;"></td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="handleApprove(${request.id_publicacion})">Aprobar</button>
                        <button class="btn btn-danger btn-sm" onclick="handleReject(${request.id_publicacion})">Rechazar</button>
                    </td>
                `;
                requestsTableBody.appendChild(row);
            });
        } else {
            console.error('Error al cargar las solicitudes:', response.statusText);
        }
    } catch (error) {
        console.error('Error al cargar las solicitudes:', error);
    }
}

async function handleApprove(id_publicacion) {
    try {
        const response = await fetch(`/admin-approve/${id_publicacion}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_admin: 1 })
        });

        if (response.ok) {
            loadRequests();
        } else {
            alert('Error al aprobar la solicitud');
        }
    } catch (error) {
        console.error('Error al aprobar la solicitud:', error);
    }
}

async function handleReject(id_publicacion) {
    try {
        const response = await fetch(`/admin-reject/${id_publicacion}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_admin: 1 }) 
        });

        if (response.ok) {
            loadRequests();
        } else {
            alert('Error al rechazar la solicitud');
        }
    } catch (error) {
        console.error('Error al rechazar la solicitud:', error);
    }
}
