document.addEventListener('DOMContentLoaded', () => {
    const paymentForm = document.getElementById('paymentForm');
    const proofInput = document.getElementById('paymentProof');
    const proofPreview = document.getElementById('proofPreview');
    const transactionIdInput = document.getElementById('transactionId');
    const submitButton = document.getElementById('submitBtn');
    
    // Handle image preview
    if (proofInput) {
        proofInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Only show preview for image files
                if (file.type.match('image.*')) {
                    const reader = new FileReader();
                    
                    reader.onload = (e) => {
                        proofPreview.src = e.target.result;
                        proofPreview.style.display = 'block';
                    };
                    
                    reader.readAsDataURL(file);
                } else {
                    proofPreview.style.display = 'none';
                    alert('Please upload an image file');
                    proofInput.value = '';
                }
            } else {
                proofPreview.style.display = 'none';
            }
        });
    }
    
    // Form validation
    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            let valid = true;
            
            // Check if transaction ID is filled
            if (transactionIdInput.value.trim() === '') {
                valid = false;
                transactionIdInput.classList.add('error');
            } else {
                transactionIdInput.classList.remove('error');
            }
            
            // Check if proof file is selected
            if (proofInput.files.length === 0) {
                valid = false;
                proofInput.classList.add('error');
            } else {
                proofInput.classList.remove('error');
            }
            
            if (!valid) {
                e.preventDefault();
                alert('Please fill in all required fields');
            } else {
                // Disable submit button to prevent multiple submissions
                submitButton.disabled = true;
                submitButton.textContent = 'Submitting...';
            }
        });
    }
}); 