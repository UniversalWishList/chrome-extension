document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('addItemToList');
    if (!btn) return;

    btn.addEventListener('click', function () {
        console.log("Added item to list!")

        // after the script runs, disable the button and change its text
        this.disabled = true;
        this.textContent = 'Added to list';
    });
});