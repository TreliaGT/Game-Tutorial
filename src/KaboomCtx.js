import kaboom from "kaboom";

export const k = kaboom({
    global:false,
    //mobile friendly
    touchToMouse: true,
    canvas: document.getElementById('game'),
});