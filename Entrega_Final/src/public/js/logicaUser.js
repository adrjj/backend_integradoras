
function modifyRole(_id) {
    // Obtener el valor seleccionado del select
    const newRole = document.getElementById(`roleSelect-${_id}`).value;

    // Enviar el rol al servidor mediante una solicitud PUT
    fetch(`/users/${_id}/role`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }), // Enviar el nuevo rol en el body
    })
    .then(response => {
        if (!response.ok) {
            // Manejar errores de red o HTTP
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Convertir la respuesta a JSON
    })
    .then(data => {
        if (data.success) {
            alert('Rol modificado con éxito');
            window.location.reload(); // Recargar la página para ver los cambios
        } else {
            alert('Error al modificar el rol');
        }
    })
    .catch(err => console.error('Fetch error:', err)); // Capturar errores de fetch
}


// Función para eliminar un usuario
function deleteUser(_id) {
    if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
        fetch(`/users/${_id}`, {
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Usuario eliminado con éxito');
                    window.location.reload(); // Recargar la página para ver los cambios
                } else {
                    alert('Error al eliminar el usuario');
                }
            })
            .catch(err => console.error(err));
    }
}

// Función para eliminar usuarios inactivos
/*function deleteInactiveUsers() {
    console.log('Botón presionado, iniciando eliminación de usuarios inactivos');
    if (confirm('¿Está seguro de que desea eliminar los usuarios inactivos de los últimos 2 días?')) {
        fetch("/users", {
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Usuarios inactivos eliminados con éxito');
                    window.location.reload(); // Recargar la página para ver los cambios
                }
                 else {
                    alert('Error al eliminar los usuarios inactivos');
                }
            })
            .catch(err => console.error(err));
    }
}*/

function deleteInactiveUsers() {
    console.log('Botón presionado, iniciando eliminación de usuarios inactivos');
    
    if (confirm('¿Está seguro de que desea eliminar los usuarios inactivos de los últimos 2 días?')) {
        fetch("/users", {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.message.includes('eliminados')) {
                alert(data.message);  // Mostrará el mensaje con el número de usuarios eliminados
                window.location.reload();  // Recargar la página para ver los cambios
            } else if (data.message.includes('No se encontraron')) {
                alert('No se encontraron usuarios inactivos para eliminar');
            } else {
                alert('Error al eliminar los usuarios inactivos');
            }
        })
        .catch(err => console.error(err));
    }
}
