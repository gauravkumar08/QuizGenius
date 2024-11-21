document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
  
    const response = await fetch("http://localhost:5000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  
    if (response.ok) {
      alert("Registration successful! You can now log in.");
      document.getElementById("registerForm").style.display = "none";
      document.getElementById("loginForm").style.display = "block";
    } else {
      alert("Registration failed. Try again.");
    }
  });

  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (data.token) {
            localStorage.setItem("token", data.token); 

            alert("Login successful!");
            window.location.href = 'quiz.html'; 
        } else {
            alert(data.message); 
        }
    } catch (error) {
        alert('Error: ' + error.message); 
    }
});

if (window.location.pathname === "/quiz.html" && !localStorage.getItem("token")) {
    window.location.href = 'login.html';
}

  