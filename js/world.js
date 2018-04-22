"use strict";

/* Strukturen, um eine Scene|World anzulegen */

/* WORLD*/
var World=function(){
    this.maChild=[]; // Objekte
    this.maLight=[]; // Lichter 
    
    /* externe Funktionen */
    this.addChildren = addChildren;
    this.addLights = addLights;

    // ********************************************************
    /* externe Funktionen */

    // Alle Kinder aus der Array-Liste hinzufügen
    function addChildren(vaoChild){
        if(!Array.isArray(vaoChild))
            this.maChild.push(vaoChild)
        else
        vaoChild.map(function(obj){
            this.maChild.push(obj);
        },this)
    }

    // Alle Lichter aus der Array-Liste hinzufügen
    function addLights(vaoChild){
        if(!Array.isArray(vaoChild))
            this.maLight.push(vaoChild)
        else
        vaoChild.map(function(obj){
            this.maLight.push(obj);
        },this)
    }

    // ********************************************************
}

/* Objekt */
var Child=function(voChildData){        
    this.type=voChildData.type||'triangle';   // Geometrische Form
    this.position=voChildData.position||{x:0,y:0,z:0}; // Position des Zentrums
    this.color=voChildData.color||null; // Farbe für alle Punkte
    this.normal=voChildData.normal||true; // Std: Normale verwenden
    this.direction=voChildData.direction||null; // Keine Richtung

    // Funktionen
    this.data;             //  externes Array verschieben, verdrehen (Zum Durchreichen an die engine)   

    // Beschreibung der Funktion    
    this.help = helpData;
    
    
    function helpData(){
        var t="";
        t+="usage:      {attribute:value,attribute:value,...}\n";
        t+="type:       'triangle'\n";
        t+="position:   {x:number,y:number,z:number}\n"; 
        t+="direction:  [x,y,z,] \n";           
        t+="color:      [r,g,b,a] values:[0.0 .. 1.0]\n";
        t+="normal:     true|false\n";
        t+="\n";
        t+="data.pos=[x,y,z] \n";
        t+="data.direction=[x,y,z] \n";
        return t;
    }
}