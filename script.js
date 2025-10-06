const toggles = document.getElementsByClassName("paramtoggle");
const genButton = document.getElementById("submitbutton");
const min1 = document.getElementById("rowmin");
const max1 = document.getElementById("rowmax");
const min2 = document.getElementById("colmin");
const max2 = document.getElementById("colmax");
const resTable = document.getElementById("resulttable");
const customCheck = document.getElementById("customColors");
const hiddenDiv = document.getElementsByClassName("hiddendiv")[0];
const colorPickers = document.getElementsByClassName("colorpick");

customCheck.addEventListener("change", showColorPicks);

const invalids = new Set();
const customHSLs = [];

min1.addEventListener("blur", validatein);
max1.addEventListener("blur", validatein);
min2.addEventListener("blur", validatein);
max2.addEventListener("blur", validatein);

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


for (const toggle of toggles) {
    toggle.addEventListener("click", toggleFunct);
}

genButton.addEventListener("click", checkparams);

function toggleFunct() {
    this.childNodes[1].firstChild.classList.toggle("toggon");
    this.childNodes[1].firstChild.classList.toggle("toggoff");

    this.previousSibling.previousSibling.classList.toggle("parahidden");
}

function validatein() {
    if (this.value == "") {
        this.classList.add("invalidinput");
        invalids.add(this.id);
    }
    else {
        this.classList.remove("invalidinput");
        if(invalids.has(this.id))
            invalids.remove(this.id);
    }
}

function checkparams() {
    if(invalids.size != 0){
        invalidParams();
        return;
    }
    const values = [Number(min1.value), Number(max1.value), Number(min2.value), Number(max2.value)];
    for(const value of values) {
        if(value < -50 || value > 50 || value == NaN){
            invalidParams();
            return;
        }
    }
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

function invalidParams() {
    console.log("no\n");
}

function createTable(coEffs, values, diffs) {
    resTable.innerHTML = "";
    let cMin, crMax, ccMax;
    if(customCheck.checked == false){
        cMin = randcolor();
        crMax = randcolor();
        ccMax = randcolor();
    } else {
        cMin = toHSL(colorPickers[0].value);
        crMax = toHSL(colorPickers[2].value);
        ccMax = toHSL(colorPickers[1].value);
    }
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
