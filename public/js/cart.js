const payBtn = document.querySelector('.btn-buy');

payBtn.addEventListener('click', async () => {
  try {
    // Get cart items from localStorage
    const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    
    // Validate cart
    if (cartItems.length === 0) {
      throw new Error("Your cart is empty");
    }

    // Send to backend
    const response = await fetch('/stripe-checkout', {
      method: "POST",
      headers: { 'Content-Type': "application/json" },
      body: JSON.stringify({ items: cartItems })
    });

    // Handle response
    const data = await response.json();
    
    if (!data.url) {
      throw new Error("No checkout URL received");
    }

    // Redirect to Stripe (use the URL provided by Stripe)
    window.location.href = data.url;

  } catch (err) {
    console.error("Checkout error:", err);
    alert(`Payment failed: ${err.message}`);
    // Optional: Show error to user in UI
  }
});