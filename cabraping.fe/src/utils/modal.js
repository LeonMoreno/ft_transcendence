// Function to show the modal
export function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

// Function to hide the modal
export function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Attach event listeners to close the modal when the close button or outside area is clicked
document.addEventListener('DOMContentLoaded', () => {
    const closeButtons = document.querySelectorAll('.modal .close');
    closeButtons.forEach(button => {
        button.onclick = function() {
            const modal = button.closest('.modal');
            hideModal(modal.id);
        };
    });

    window.onclick = function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target == modal) {
                hideModal(modal.id);
            }
        });
    };
});
