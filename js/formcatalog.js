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
            case 'rectangle': attribute=this.formRectangle(child); break;
            case 'cube': attribute=this.formCube(child); break;
        } // Ende switch
        // Je nach Anforderung Daten wieder nullen
        if(!child.indexBuffer) attribute.index=null;
        return attribute;
    },

    /* Daten für ein Dreieck berechnen */
    formTriangle:function(child){
        // Drei Punkte in y=0 Ebene mit Normalen
        var pos,nor,idx,col;
        var w=child.width/2||10; // Default 20
        var h=child.height/2||10; // Default: 20
        var p=child.position||{x:0,y:0,z:0}; // Default Mitte
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
    /* Daten für ein Rechteck berechnen */
    formRectangle:function(child){
        // Sechs Punkte in y=0 Ebene mit Normalen
        var pos,nor,idx,col;
        var w=child.width/2||10; // Default 20
        var h=child.height/2||10; // Default: 20
        var p=child.position||{x:0,y:0,z:0}; // Default Mitte
        pos=[  -w+p.x,-h+p.y,p.z,   w+p.x,-h+p.y,p.z,   w+p.x,h+p.y,p.z,
               -w+p.x,-h+p.y,p.z,   w+p.x,h+p.y,p.z,   -w+p.x,h+p.y,p.z];  // Rechteck in der Ebene
        nor=[0,0,1.0,   0,0,1.0,  0,0,1.0 ,
             0,0,1.0,   0,0,1.0,  0,0,1.0];  // Normale in y Richtung
        if(child.color){
            col=child.color.concat(child.color).concat(child.color);
            col=col.concat(col);
        }
        else{
            col=[0,0,1.0,1,  0,0,1.0,1,    0,0,1.0,1, 
                 0,0,1.0,1,  0,0,1.0,1,    0,0,1.0,1]; // blau
        }
        idx=[0,1,2,3,4,5];
        return {position:pos, normal:nor,color:col,index:idx};
    },
    /* Daten für einen Würfel berechnen */
    formCube:function(child){
        // Sechs Punkte in y=0 Ebene mit Normalen
        var pos=[],nor,idx,col;
        var w=child.width/2||10; // Default 20
        var h=child.height/2||10; // Default: 20
        var d=child.depth/2||10; // Default: 20
        
        var aDir=[];

        var p=child.position||{x:0,y:0,z:0}; // Default Mitte     
        var aPoint=[]; // Koordinaten der 8 Ecken  
        for(var i=0;i<8;i++){ // 8 Ecken           
            var pt =[(!!(i&1)*2-1) * w + p.x, (!!(i&2)*2-1) * h + p.y, (!!(i&4)*2-1) * d + p.z];
            aPoint.push(pt); 
        }
       
        pos = pos.concat(face(aPoint,7,3,2,6)); // hinten z+
        pos = pos.concat(face(aPoint,5,1,3,7)); // rechts x+
        pos = pos.concat(face(aPoint,0,2,3,1)); // vorne z-
        pos = pos.concat(face(aPoint,4,6,2,0)); // links x-
        pos = pos.concat(face(aPoint,4,5,7,6)); // oben y+
        pos = pos.concat(face(aPoint,4,0,1,5)); // unten y- (pos hat 108 indices, 36 Koordinaten a 3 Werte)

        // Die Indices a,b,c,d bilden ein Quadrat entgegen dem Uhrzeigersinn    
        function face(aPt,a,b,c,d){
            var tri=[];
            tri[0] =[a,b,d];
            tri[1] =[b,c,d];
            var aRet=[];
            for(var i=0;i<2;i++){
                for(var j=0;j<3;j++){
                    aRet=aRet.concat(aPt[tri[i][j]]);
                }
            }           
            return aRet;
        }

        // Jeweils vier Punkte haben den gleichen Normalen-Vektor 
        // und eine gleiche Farbe (jede Seite anders)
        var nor=[],aNorm=[[0,0,1],[1,0,0],[0,0,-1],[-1,0,0],[0,1,0],[0,-1,0]]; 
        // weiß, rot, blau, grün , cyan, pink
        var col=[],aCol=[[1,1,1,1],[1,0,0,1],[0,0,1,1],[0,1,0,1],[0,0.7,0.7,1],[0.7,0,0.7,1]]; 
        for(var i=0;i<6;i++){
            for(var j=0;j<6;j++){
                nor = nor.concat(aNorm[i]);
                if(child.color){
                    col = col.concat(child.color);
                }
                else{
                    col = col.concat(aCol[i]);
                }    
            }    
        }
            
        idx=[0,1,2,3,4,5,
            6,7,8,9,10,11,
            12,13,14,15,16,17,
            18,19,20,21,22,23,
            24,25,26,27,28,29,
            30,31,32,33,34,35];
        return {position:pos, normal:nor,color:col,index:idx};
    },
}