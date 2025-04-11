const userListContainer = document.getElementById('user-list');
const addUserForm = document.getElementById('add-user-form');
const localStorageKey = 'users';

let users = [];

// 1. Fetch & Display Users
async function fetchAndDisplayUsers() {
    try {
        const response = await fetch('https://randomuser.me/api/?results=5');
        const data = await response.json();
        const fetchedUsers = data.results.map(user => ({
            name: `${user.name.first} ${user.name.last}`,
            email: user.email,
            location: `${user.location.city}, ${user.location.country}`,
            picture: user.picture.thumbnail // or user.picture.medium
        }));
        users = [...getStoredUsers(), ...fetchedUsers];
        renderUserList();
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

// Get users from localStorage
function getStoredUsers() {
    const storedUsers = localStorage.getItem(localStorageKey);
    return storedUsers ? JSON.parse(storedUsers) : [];
}

// Save users to localStorage
function saveUsersToStorage() {
    localStorage.setItem(localStorageKey, JSON.stringify(users));
}

// 2. Render Users in DOM
function renderUserList() {
    userListContainer.innerHTML = ''; // Clear existing list
    users.forEach((user, index) => {
        const userCard = document.createElement('div');
        userCard.classList.add('user-card');
        userCard.innerHTML = `
            <img src="${user.picture}" alt="${user.name}">
            <h3>${user.name}</h3>
            <p>Email: ${user.email}</p>
            <p>Location: ${user.location}</p>
            <button class="delete-btn" data-index="${index}">Delete</button>
        `;
        userListContainer.appendChild(userCard);
    });

    // Add event listeners to the newly created delete buttons
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', deleteUser);
    });
}

// Function to check for duplicate emails
function isDuplicateEmail(email) {
    return users.some(user => user.email === email);
}

// 3. Add a New User (Manual Input)
addUserForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const locationInput = document.getElementById('location');
    const imageInput = document.getElementById('image');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const location = locationInput.value.trim();
    const image = imageInput.value.trim();

    if (!name || !email) {
        alert('Name and email are required.');
        return;
    }

    if (!isValidEmail(email)) {
        alert('Invalid email format.');
        return;
    }

    if (isDuplicateEmail(email)) {
        alert('Email already exists.');
        return;
    }

    const newUser = { name, email, location, picture: image || 'default-user.png' }; // Default image if none provided
    users.push(newUser);
    saveUsersToStorage();
    renderUserList();

    // Clear the form
    addUserForm.reset();
});

function isValidEmail(email) {
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 4. Delete a User
function deleteUser(event) {
    const indexToDelete = parseInt(event.target.dataset.index);
    if (!isNaN(indexToDelete) && indexToDelete >= 0 && indexToDelete < users.length) {
        users.splice(indexToDelete, 1);
        saveUsersToStorage();
        renderUserList();
    }
}

// 5. Persistent Storage with localStorage
// On page load:
document.addEventListener('DOMContentLoaded', fetchAndDisplayUsers);