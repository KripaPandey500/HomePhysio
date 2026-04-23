function hideAlert(id, timeout = 9000) {
    setTimeout(function() {
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
    }, timeout);
}
