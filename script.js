const toggles = document.getElementsByClassName("paramtoggle");


for (const toggle of toggles) {
    toggle.addEventListener("click", toggleFunct);
}


function toggleFunct() {
    this.childNodes[1].firstChild.classList.toggle("toggon");
    this.childNodes[1].firstChild.classList.toggle("toggoff");

    this.previousSibling.previousSibling.classList.toggle("parahidden");
}