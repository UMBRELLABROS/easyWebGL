"use strict";

/* Strukturen, um eine Scene|World anzulegen */

/* WORLD*/
var World=function(){
    this.maChild=[]; // Objekte
    this.viewMatrix; // Transformation für die Ansicht

    /* externe Funktionen */
    this.addChildren=addChildren;

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

    // ********************************************************
}

/* Objekt */
var Child=function(voChildData){        
    this.type=voChildData.type||'triangle';   // Geometrische Form
    this.position=voChildData.position||{x:0,y:0,z:0}; // Position des Zentrums
    this.color=voChildData.color||[0.0,0.0,0.0,1.0]; // Farbe für alle Punkte

    // Funktionen
    this.data;             //  externes Array verschieben, verdrehen (Zum Durchreichen an die engine)   

    // Beschreibung der Funktion    
    this.help = helpData;
    
    
    function helpData(){
        var t="";
        t+="usage: {attribute:value,attribute:value,...}\n";
        t+="type:     'triangle'\n";
        t+="position: {x:number,y:number,z:number}\n";            
        t+="color:    [r,g,b,a] values:[0.0 .. 1.0]\n";
        t+="\n";
        t+="data.pos=[x,y,z] \n";
        return t;
    }
}