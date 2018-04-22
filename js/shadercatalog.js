"use strict";

/* Anhand von World- und Kind-Daten die Shader erstellen */


var ShaderCatalog={
    /* Code des Vertex- und Fragment-Shader zurückgeben */
    // World: Lichter und ViewMatrix
    // Child: Oberflächen Farbe|Reflektion|Textur
    getCode:function(voWorld,voChild){
      var v=this.getVertexShader(voWorld,voChild);
      var f=this.getFragmentShader(voWorld,voChild);
      return {vertexShader:v,fragmentShader:f};
    },
    /* Vertex-Shader Code */
    getVertexShader:function(voWorld,voChild){
        var t="";
        t+="attribute vec4 a_position;\n"; // Position hat nun 4 Komponenten
        t+="uniform mat4 u_matrix;\n"; // Manipulationsmatrx 4x4
        if(voWorld.shaderFlag.directLight){
            t+="uniform vec3 u_directLight;\n";  // Welt hat direktes Licht
        }

        if(voChild.shaderFlag.color){
            t+="attribute vec4 a_color;\n"; // Farbe hat 4 Komponenten            
        }

        if(voChild.shaderFlag.color){
            t+="varying vec4 v_color;\n"; // Farbe hat 4 Komponenten            
        }

        if(voChild.shaderFlag.normal){
            t+="attribute vec3 a_normal;\n"; // Normalen haben 3 Komponenten            
        }

        if(voChild.shaderFlag.normal){
            t+="varying vec3 v_normal;\n";             
        }
        if(voWorld.shaderFlag.directLight){
            t+="varying vec3 v_directLight;\n";  // Welt hat direktes Licht
        }

        // Hauptfunktion

        t+="void main(){\n";
        t+="gl_Position=vec4(u_matrix*a_position);\n"; // aus 3 Komponenten werden 4

        if(voChild.shaderFlag.color){
            t+="v_color = a_color;\n"; // Farbe hat 4 Komponenten            
        }

        if(voChild.shaderFlag.normal){
            //t+="vec4 normal = vec4(a_normal,1.0);\n";
            t+="v_normal = mat3(u_matrix)*-a_normal;\n"; // Normale übergeben           
        }
        if(voWorld.shaderFlag.directLight){
            t+="v_directLight = u_directLight;\n";  // Welt hat direktes Licht
        }


        t+="}\n";
        return t;
    },
    /* Fragment-Shader Code */
    getFragmentShader:function(voWorld,voChild){
        var t="";
        t+="precision mediump float;\n";  //  mediump|highp     

        if(voChild.shaderFlag.color){
            t+="varying vec4 v_color;\n"; // Farbe hat 4 Komponenten            
        }

        if(voChild.shaderFlag.normal){
            t+="varying vec3 v_normal;\n"; // Normal
        }
        if(voWorld.shaderFlag.directLight){
            t+="varying vec3 v_directLight;\n";  // Welt hat direktes Licht
       }

        t+="void main(){\n";

        if(voWorld.shaderFlag.directLight){            
            t+="vec3 normal = normalize(v_normal);\n"; // Muss immer die Länge 1 haben
            t+="float intensityDL = dot(normal,v_directLight);\n"; // Vektorprodukt = zahl            
        }


        if(voChild.shaderFlag.color){
            t+="gl_FragColor=v_color;\n"; // Benutzerfarbe
        }
        else{
            t+="gl_FragColor=vec4(0,0,1,1);\n"; // blau
        }

        if(voWorld.shaderFlag.directLight){
            t+="gl_FragColor.rgb *= intensityDL;\n";
        }
        
        t+="}\n";
        return t;
    },

}