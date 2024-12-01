const wrapper = document.querySelector('.wrapper');
const loginLink = document.querySelector('.login-link');
const registerLink = document.querySelector('.register-link');
const closeButton = document.getElementById('close-button');
const loginButton = document.querySelector('.login-button');
const registerButton = document.querySelector('.register-button');

registerLink.addEventListener('click', () => {
    wrapper.classList.add('active');
});

loginLink.addEventListener('click', () => {
    wrapper.classList.remove('active');
});

closeButton.addEventListener('click', () => {
    window.location.href = 'index.html'; // Redirect to home page
});

registerButton.addEventListener('click', (event) => {
    event.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    // Store user information as an object
    let user = {
        username: username,
        email: email,
        password: password
    };

    // Save user information to localStorage
    localStorage.setItem('user', JSON.stringify(user));

    // Pre-fill login form with registered email and password
    document.getElementById('login-email').value = email;
    document.getElementById('login-password').value = password;

    alert('You have successfully registered!');
    wrapper.classList.remove('active');
});

loginButton.addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // Retrieve user information from localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (storedUser) {
        if (email === storedUser.email && password === storedUser.password) {
            alert('Login successful!');
            window.location.href = 'index.html'; // Redirect to home page
        } else {
            alert('Please enter the correct password or email.');
        }
    } else {
        alert('Please register your information.');
    }
});