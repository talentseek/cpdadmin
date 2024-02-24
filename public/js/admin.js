document.addEventListener('DOMContentLoaded', function() {
    const addUserForm = document.getElementById('add-user-form');
    const usersList = document.getElementById('users-list');
    
    addUserForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(addUserForm);
        let jsonObject = {};
        for (const [key, value] of formData.entries()) {
            jsonObject[key] = value;
        }
        console.log('Attempting to add/update user with data:', jsonObject);
        const response = await fetch('/admin/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonObject)
        }).catch(error => {
            console.error('Error making fetch request to add user:', error.message, error.stack);
        });

        if(response && response.ok) {
            console.log('User added/updated successfully');
            addUserForm.reset();
            fetchUsers(); // Refresh the users list after adding a new user
        } else {
            alert('Failed to add/update user');
            console.error('Failed to add/update user. Response status: ' + response.status);
        }
    });

    async function fetchUsers() {
        console.log('Fetching users...');
        const response = await fetch('/admin/users').catch(error => {
            console.error('Error fetching users:', error.message, error.stack);
        });
        if(response && response.ok) {
            console.log('Users fetched successfully');
            const users = await response.json();
            usersList.innerHTML = ''; // Clear the list before repopulating
            users.forEach(user => {
                const userElement = document.createElement('div');
                userElement.textContent = `${user.firstName} ${user.lastName} (${user.email}) - Campaign IDs: ${user.campaignIds.join(', ')}`;
                usersList.appendChild(userElement);
            });
        } else {
            alert('Failed to fetch users');
            console.error('Failed to fetch users. Response status: ' + response.status);
        }
    }

    fetchUsers(); // Initial fetch of users
});