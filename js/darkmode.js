function darkMode() {
    var bodyEl = document.body;
    bodyEl.classList.toggle("dark-mode");
    var modeButton = document.getElementById('switch');
    if (bodyEl.classList.contains("dark-mode")){
        modeButton.innerHTML="light_mode";
    } else {
        modeButton.innerHTML="dark_mode";
    }
}