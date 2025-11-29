$(document).ready(function(){
/* File: script.js
GUI Assignment: HW4
Kathryn Merck, UMass Lowell Computer Science, kathryn_merck@student.uml.edu
Copyright (c) 2025 by Kathryn. All rights reserved. May be freely copied or
excerpted for educational purposes with credit to the author.
 */


const toggles = document.getElementsByClassName("paramtoggle");
const genButton = document.getElementById("submitbutton");
const min1 = document.getElementById("rowmin");
const max1 = document.getElementById("rowmax");
const min2 = document.getElementById("colmin");
const max2 = document.getElementById("colmax");
const customCheck = document.getElementById("customColors");
const hiddenDiv = document.getElementsByClassName("hiddendiv")[0];
const colorPickers = document.getElementsByClassName("colorpick");
const warndiv = document.getElementById("invalidwarn");
const form = $("#inputform");
let tabnum = 0;
let cMin, crMax, ccMax; //Sorry for the global vars :(

customCheck.addEventListener("change", showColorPicks);


class HSL {
    constructor(h, s, l) {
        this.h = h;
        this.s = s;
        this.l = l;
        if(l > 80)
            this.t = "black;"
        else
            this.t = "white;"
    }
   
    get string() {
        return "hsl(" + Math.floor(this.h) + ", " + Math.floor(this.s) + "%, " + Math.floor(this.l) + "%);";
    }

    static add(hsl1, hsl2) {
        let nh = (hsl1.h + hsl2.h);
        let ns = (hsl1.s + hsl2.s);
        let nl = (hsl1.l + hsl2.l);
        
        return new HSL(nh, ns, nl);
    }
}
genNewColors();

for (const toggle of toggles) {
    toggle.addEventListener("click", toggleFunct);
}

genButton.addEventListener("click", genNewColors);
genButton.addEventListener("click", checkparams);

function toggleFunct() {
    this.childNodes[1].firstChild.classList.toggle("toggon");
    this.childNodes[1].firstChild.classList.toggle("toggoff");

    this.previousSibling.previousSibling.classList.toggle("parahidden");
}


form.validate({
    rules: {
        colmin: {
            step: 1,
            max: 50,
            min: -50,
            required: true
        },
        colmax: {
            step: 1,
            max: 50,
            min: -50,
            required: true
        },
        rowmin: {
            step: 1,
            max: 50,
            min: -50,
            required: true
        },
        rowmax: {
            step: 1,
            max: 50,
            min: -50,
            required: true
        }
    },
    messages: {
        colmin: {
            step: "All inputs must be integers",
            max: "All inputs must be <= 50",
            min: "All inputs must be >= -50",
            required: "All inputs are required"
        },
        colmax: {
            step: "All inputs must be integers",
            max: "All inputs must be <= 50",
            min: "All inputs must be >= -50",
            required: "All inputs are required"
        },
        rowmin: {
            step: "All inputs must be integers",
            max: "All inputs must be <= 50",
            min: "All inputs must be >= -50",
            required: "All inputs are required"
        },
        rowmax: {
            step: "All inputs must be integers",
            max: "All inputs must be <= 50",
            min: "All inputs must be >= -50",
            required: "All inputs are required"
        }
    },
    highlight: function(element) {
        $(element).addClass("invalidinput");
    },
    unhighlight: function(element) {
        $(element).removeClass("invalidinput");
    },
    errorPlacement: function(error, placement) {
        error.appendTo(form);
    }
});


$("input").change(checkparams);


function checkparams() {
    if(!form.valid())
        return;
    console.log("yay");

    const values = [Number(min1.value), Number(max1.value), Number(min2.value), Number(max2.value)];

    let rowDiff = values[1] - values[0];
    let colDiff = values[3] - values[2];
    const diffs = [Math.abs(rowDiff), Math.abs(colDiff)];
    const coEffs = [rowDiff / Math.abs(rowDiff), colDiff / Math.abs(colDiff)];
    if(coEffs[0] != -1 && coEffs[0] != 1)
        coEffs[0] = 1;
    if(coEffs[1] != -1 && coEffs[1] != 1)
        coEffs[1] = 1;
    createTable(coEffs, values, diffs);
}



function genNewColors() {
    if(customCheck.checked == false){
        cMin = randcolor();
        crMax = randcolor();
        ccMax = randcolor();
    } else {
        cMin = toHSL(colorPickers[0].value);
        crMax = toHSL(colorPickers[2].value);
        ccMax = toHSL(colorPickers[1].value);
    }
}

function createTable(coEffs, values, diffs) {

    //creating tab and setup
    $("#tabsl").append('<li id="tli-' + tabnum + '"><a href="#tdiv-' + tabnum + '">Table ' + (tabnum + 1) + '</a> <span id="span-' + tabnum + '" class="closetab"><i class="bi bi-x-lg"></i></span></li>');
    $("#tabsl").after('<div class="tab" id="tdiv-' + tabnum +'"><table id="resulttable-' + tabnum + '"></div>');
    $( "#tabs" ).tabs("refresh");
    $( "#tabs" ).tabs( "option", "active", tabnum);
    document.getElementById('span-' + tabnum).addEventListener("click", closetab);
    let resTable = document.getElementById('resulttable-' + tabnum);
    if(customCheck.checked == true){
        cMin = toHSL(colorPickers[0].value);
        crMax = toHSL(colorPickers[2].value);
        ccMax = toHSL(colorPickers[1].value);
    }
    if(!warndiv.classList.contains("inactivewarn"))
        warndiv.classList.add("inactivewarn");
    resTable.innerHTML = "";
    
    const blendFact = colorBlend(cMin, crMax, diffs[0]+1)[1];
    const blendArr = [colorBlend(cMin, ccMax, diffs[1]+1)[0]];
    
    for(let i = 0; i < diffs[0]+1; i++) {
        //I'd explain this, but I don't want to have to look into the void again :/
        blendArr.push(colorBlend(HSL.add(blendArr[i][0], blendFact), HSL.add(blendArr[i][blendArr[i].length-1], blendFact), diffs[1]+1)[0]);
    }



    let rowStart = document.createElement("tr");
    let xCell = document.createElement("td");
    xCell.innerHTML = "&times;";
    xCell.setAttribute("class", "rescell timescell");
    xCell.setAttribute("style", "color: " + blendArr[0][0].string);
    rowStart.appendChild(xCell);
    for (let i = 0; i <= diffs[1]; i++) {
        let cellsTop = document.createElement("td");
        cellsTop.innerHTML = (i * coEffs[1]) + values[2];
        cellsTop.setAttribute("class", "rescell startrow");
        cellsTop.setAttribute("style", "color: " + blendArr[0][i+1].string);
        rowStart.appendChild(cellsTop);
    }
    resTable.appendChild(rowStart);
    for(let r = 0; r <= diffs[0]; r++) {
        let row = document.createElement("tr");
        row.setAttribute("id", "row" + r);
        let cellStart = document.createElement("td");
        cellStart.setAttribute("class", "startcell rescell");
        cellStart.setAttribute("style", "color: " + blendArr[r+1][0].string);
        cellStart.innerHTML = (r * coEffs[0]) + values[0];
        row.appendChild(cellStart);
        for (let c = 0; c <= diffs[1]; c++) {
            let cell = document.createElement("td");
            cell.innerHTML = (values[0] + r * coEffs[0]) * (values[2] + c * coEffs[1]);
            cell.setAttribute("class", "rescell");
            cell.setAttribute("style", "background-color: " + blendArr[r+1][c+1].string + " color: " + blendArr[r+1][c+1].t);
            row.appendChild(cell);
        }
        resTable.appendChild(row);
    }
    tabnum++;
}

function randcolor() {
    let h1, s1, l1;
    h1 = Math.random();
    h1 = Math.floor(h1 * 360);

    s1 = Math.random();
    s1 = Math.floor(s1 * 50) + 50;

    l1 = Math.random();
    l1 = Math.floor(l1 * 60) + 20;
    return new HSL(h1, s1, l1);
}

function colorBlend(hsl1, hsl2, n) {
    const carr = [hsl1];
    const hDiff = hsl2.h - hsl1.h;
    const sDiff = hsl2.s - hsl1.s;
    const lDiff = hsl2.l - hsl1.l;
    const hFact = hDiff / n;
    const sFact = sDiff / n;
    const lFact = lDiff / n;
    const fact = new HSL(hFact, sFact, lFact);
    for(let i = 0; i < n; i++) {
        carr.push(HSL.add(carr[i], fact));
    }
    return [carr, fact];
}

function showColorPicks() {
    hiddenDiv.classList.toggle("showhiddendiv");
}

function toHSL(hex) {
    const decs = [[hex.charCodeAt(1), hex.charCodeAt(2)], 
               [hex.charCodeAt(3), hex.charCodeAt(4)], 
               [hex.charCodeAt(5), hex.charCodeAt(6)]];
    const hexcodes = [];
    let text = "";
        for (const dec of decs) {
            if(dec[0] > 64)
                dec[0] = dec[0] - 33;
            if(dec[1] > 64)
                dec[1] = dec[1] - 33;
            let b = "";
            let c = "";
            b += Math.floor(dec[0] / 16);
            c += Math.floor(dec[1] / 16);
            b += (dec[0] % 16);
            c += (dec[1] % 16);
            hexcodes.push([Number(b) - 30, Number(c) - 30]);
        }
    const rgbs = [];
        for (const hexcode of hexcodes) {
            rgbs.push(hexcode[0] * 16 + hexcode[1]);
        }
    let max = Math.max(rgbs[0], rgbs[1], rgbs[2]);
    let min = Math.min(rgbs[0], rgbs[1], rgbs[2]);
    let chr = max - min;

    let h;
    if (chr == 0) {
        h = 0;
    } else {
        if (max == rgbs[0]) {
            h = ((rgbs[1] - rgbs[2]) / chr) % 6;
        } else if (max == rgbs[1]) {
            h = ((rgbs[2] - rgbs[0]) / chr) + 2;
        } else if (max == rgbs[2]) {
            h = ((rgbs[0] - rgbs[1]) / chr) + 4;
        }
    }
    h = h*60;

    let l = 100 * ((max + min) / (2 * 255));
    let s;
    if(chr == 0) {
        s = 0;
    } else {
        s = ((chr / 2.55) / (1 - Math.abs(2 * (l / 100) - 1)));
    }
    return new HSL(h, Math.round(s), Math.round(l));
    
}

////////////////////////////////////////////////////////////////////////////////

// https://api.jqueryui.com/slider/ used as reference for this part

$("#cns").slider({
    value: 1,
    slide: function(event, ui){
        if($("#colmin").val() != ui.value)
            $("#colmin").val(ui.value);
        checkparams();
    },
    orientation: "horizontal",
    min: -50,
    max: 50,
    step: 1
})
$("#cxs").slider({
    value: 4,
    slide: function(event, ui){
        if($("#colmax").val() != ui.value)
            $("#colmax").val(ui.value);
        checkparams();
    },
    orientation: "horizontal",
    min: -50,
    max: 50,
    step: 1
})
$("#rns").slider({
    value: 3,
    slide: function(event, ui){
        if($("#rowmin").val() != ui.value)
            $("#rowmin").val(ui.value);
        checkparams();
    },
    orientation: "vertical",
    min: -50,
    max: 50,
    step: 1
})
$("#rxs").slider({
    value: 5,
    slide: function(event, ui){
        if($("#rowmax").val() != ui.value)
            $("#rowmax").val(ui.value);
        checkparams();
    },
    orientation: "vertical",
    min: -50,
    max: 50,
    step: 1
})

$("#colmin").change(function(){
    if(form.valid()) {
        $("#cns").slider("value", $("#colmin").val());
    }
})
$("#colmax").change(function(){
    if(form.valid()) {
        $("#cxs").slider("value", $("#colmax").val());
    }
})
$("#rowmin").change(function(){
    if(form.valid()) {
        $("#rns").slider("value", $("#rowmin").val());
    }
})
$("#rowmax").change(function(){
    if(form.valid()) {
        $("#rxs").slider("value", $("#rowmax").val());
    }
})

$( ".selector" ).tabs({
  active: 1
});

$( "#tabs" ).tabs({
    heightStyle: "fill"
});

function closetab(){
    let thisnum = this.id.match(/\d+/)[0];
    $(this).parent().remove();
    $("#tdiv-" + thisnum).remove();
}

$("#xbutton").click(function(){
    $("#tabsl").empty();
    $("div").remove(".tab");
})

});