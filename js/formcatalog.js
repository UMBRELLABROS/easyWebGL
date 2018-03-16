"use strict";

/*
+y zeigt nach oben
+z zeigt in den Bildschirm
+x zeigt nach rechts
*/

/* Geometrische Formen mit allen erforderlichen Daten */

var FormCatalog={
    // Alle Attribute-Daten bestimmen
    getFormAttributes:function(child){
        var attribute=null;
        switch(child.type){
            case 'triangle': attribute=this.formTriangle(child); break;
        } // Ende switch
        // Je nach Anforderung Daten wieder nullen
        if(!child.indexBuffer) attribute.index=null;
        return attribute;
    },

    /* Daten für ein Dreieck berechnen */
    formTriangle:function(child){
        // Drei Punkte in y=0 Ebene mit Normalen
        var pos,nor,idx,col;
        var w=child.width/2||0.25; // Default 0.25
        var h=child.height/2||0.25; // Default: 0.25
        var p=child.position||{x:0,y:0,z:0}; // Default mitte
        pos=[  -w+p.x,-h+p.y,p.z,   w+p.x,-h+p.y,p.z,   0+p.x,h+p.y,p.z];  // Dreieck in der Ebene
        nor=[0,0,1.0,   0,0,1.0,  0,0,1.0];  // Normale in y Richtung
        if(child.color){
            col=child.color.concat(child.color).concat(child.color);
        }
        else{
            col=[0,0,1.0,1,  0,0,1.0,1,    0,0,1.0,1 ]; // blau
        }
        idx=[0,1,2];
        return {position:pos, normal:nor,color:col,index:idx};
    },
}