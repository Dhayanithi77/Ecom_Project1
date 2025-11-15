document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();
  
      if (!username || !password) {
          alert('Please enter both username and password.');
          return;
      }
  
      try {
          const response = await fetch('/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, password })
          });
  
          const result = await response.json();
  
          if (result.success) {
              window.location.href = '/shop.html';
          } else {
              alert(result.message || 'Invalid login.');
          }
      } catch (error) {
          console.error('Login request failed:', error);
          alert('An error occurred while logging in. Please try again.');
      }
    });

    // Handle Forgot Password
    document.getElementById('forgotPassword').addEventListener('click', async () => {
        const email = prompt("Enter your registered email address:");
        if (!email) return;

        try {
            const response = await fetch('/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const result = await response.json();
            if (result.success) {
                alert("If this email is registered, a reset link has been sent.");
            } else {
                alert(result.message || "Unable to process request.");
            }
        } catch (error) {
            console.error('Forgot password request failed:', error);
            alert('An error occurred. Please try again.');
        }
    });

  });
  