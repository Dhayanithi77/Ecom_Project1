document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('forgotForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        if (!username) {
            alert("Please enter your username or email.");
            return;
        }

        try {
            const response = await fetch('/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });

            const result = await response.json();

            if (result.success) {
                alert("If this account exists, a reset link has been sent to your email.");
                window.location.href = "login.html"; // redirect back to login
            } else {
                alert(result.message || "Unable to process request.");
            }
        } catch (error) {
            console.error("Forgot password request failed:", error);
            alert("An error occurred. Please try again.");
        }
    });
    document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('forgotForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const newPassword = document.getElementById('newPassword').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();

        if (!username || !newPassword || !confirmPassword) {
            alert("Please fill all fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const response = await fetch('/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, newPassword })
            });

            const result = await response.json();

            if (result.success) {
                alert("Password reset successful! Please login again.");
                window.location.href = "login.html"; 
            } else {
                alert(result.message || "Unable to reset password.");
            }
        } catch (error) {
            console.error("Reset password request failed:", error);
            alert("An error occurred. Please try again.");
        }
    });
});

});
