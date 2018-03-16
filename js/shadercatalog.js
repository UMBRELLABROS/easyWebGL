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
        t+="attribute vec3 a_position;\n"; // Position hat 3 Komponenten
        t+="void main(){\n";
        t+="gl_Position=vec4(a_position,1);\n"; // aus 3 Komponenten werden 4
        t+="}\n";
        return t;
    },
    /* Fragment-Shader Code */
    getFragmentShader:function(voWorld,voChild){
        var t="";
        t+="precision mediump float;\n";  //  mediump|highp     
        t+="void main(){\n";
        t+="gl_FragColor=vec4(0,0,1,1);\n"; // blau
        t+="}\n";
        return t;
    },

}