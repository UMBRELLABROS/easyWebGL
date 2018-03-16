"use strict"; 

// kurz für document
function d(){return document}

// Zugriff auf Objekte via ID
function $(vsID){return d().getElementById(vsID)}

// Neues Objekt erzeugen
function dcE(vsName){return d().createElement(vsName)}

// Vergleichen von Array
Array.prototype.equals = function (array) {
    if (!array) // ist kein Array
        return false;
    if (this.length != array.length)    // Längen vergleichen spart Zeit
        return false;
    for (var i = 0, l=this.length; i < l; i++) {
         if (this[i] != array[i]) {return false;}
    }
    return true;
}
// Zur Eigenschaftenliste von Array hizufügen
// Einsatz: if (aDataA.equals(aDataB) )
Object.defineProperty(Array.prototype, "equals", {enumerable: false}); 
