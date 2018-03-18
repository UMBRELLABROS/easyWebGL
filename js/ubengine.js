"use strict";

var UBEngine=function(vsId){
    var sDivId = vsId;
    var gl; // webGL
    var maoWorld=[]; // Speicher für alle Welten (idR nur eine) [UBWorld]
    var simpleCode=""; // Einfacher Code, wie man ihn im Internet für Einsteiger findet

    getContext();   // Initial-Funktion um gl zubestimmen

    // ***********************************************************************************
    /* Klassen, die nur intern|temporär benötigt werden */    

    // Objekte in der World im WebGL Format
    var UBWorld=function(){
        this.maoChild=[];     // Kinder mit Verweisen|index auf Attribute-Buffer und Uniforms
        this.maoBuffer=[];    // Attribute-Buffer (können von vielen Kindern verwendet werden)
        this.moViewMatrix;    // Darstellungsmatrix 
        this.maoProgram=[];   // Verwendete Programme (mit Vertex und Fragment Shadern)
    }
    UBWorld.prototype={
        /* Viewport Matrix festlegen */
        setViewMatrix:function(type){
            switch(type){
                default:
                    this.moViewMatrix =[1,0,0,0,
                                        0,1,0,0,
                                        0,0,1,0,
                                        0,0,0,1];
                break;
            }
        },
    };     


    var UBChild=function(){
        this.buffer=[];           // {attribute:,index:} // Verknüpfen von Kind und Buffern
        this.uniform=[];          // {name:, value: } // Daten nur im Kind  vorhanden
        this.programIndex=null;   // Referenz auf das Programm (aus IntWorld)
        this.shaderFlag={position:false,
                         color:false};      // Daten für die Shader-Steuerung

        /* Positions- und Bewegungsinformationen */
        this.matrix;                          // Matrix-Daten          
      
        this.setUniforms=setUniforms;         // Setzen der Uniform-Locations  (Eigenschaften)
        this.setAttributes=setAttributes;     // Setzen der Attribute-Locations (das sind die Buffer)
        this.drawTriangles=drawTriangles;     // Zeichnen von Dreiecken oder IndexBufferSatz
        this.setUniformVariable=setUniformVariable; // Wert in Javascript Variable schreiben
        this.addUniform=addUniform;           // Eigenschaften von Objekten bestimmen die Uniforms. (Reflexion, sichtbar, gedreht, verschoben, ...)
      
        /* lokale Uniforms anlegen/merken */ 
        function addUniform(){
            // u_matrix ist immer erforderlich                               
            var worldMatrix = {type:'4fv',id:'u_matrix',name:'worldMatrix'}; // Noch keine Daten, nur Referenz  
            this.uniform.push(worldMatrix);
        }

        /* Wert in Uniform schreiben */ 
        function setUniformVariable(name,value){
            this.uniform.map(function(u){
                if(u.name == name){u.value = value;}
            })
        }

        /* alle Uniforms uniform{index:, type: ,value: ,name:} setzen */
        function setUniforms(){
          simpleCode+=`//setUniforms<br>`;  
          this.uniform.map(function(u){
                switch (u.type){
                    case "4fv": 
                        gl.uniformMatrix4fv(u.variable, false, u.value); 
                        simpleCode+=`gl.uniformMatrix4fv(`+u.variable+`, false, `+u.value+` );<br>`;
                    break;
              } // Ende switch u.type
          })
        }

       

        /* alle Buffer setzen */
        function setAttributes(voWorld){
            simpleCode+=`//setAttributes<br>`;
            var n=0;
            var bIndex=false; // Ist vom Typ a_index
            var bPosition=false; // Ist vom Typ a_position
            
            this.buffer.map(function(data){
                var buffer=voWorld.maoBuffer[data.index]; // WebGL Buffer
                if(data.attributeIndex>=0){  // Sicherheit, falls ein Buffer nicht angelegt wurde
                    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
                    gl.enableVertexAttribArray(data.attributeIndex);
                    gl.vertexAttribPointer(data.attributeIndex,  data.elementCount, gl.FLOAT, false, 0, 0);
                    simpleCode+=`
                    gl.bindBuffer(gl.ARRAY_BUFFER,aBuffer[`+data.index+`]);<br>
                    gl.enableVertexAttribArray(`+data.attributeIndex+`);<br>
                    gl.vertexAttribPointer(`+data.attributeIndex+`, `+data.elementCount+`, gl.FLOAT, false, 0, 0);<br>
                    <br>`;

                    if(data.attribute=="a_position"){bPosition=true;n=data.triangleCount;}
                    if(data.attribute=="a_index"){bIndex=true;n=data.triangleCount}
                }              
            } )
          return {position:bPosition,isIndex:bIndex,count:n};
        }
      
        /* Dreiecke zeichnen */
        function drawTriangles(voDrawMode){
            simpleCode+=`//drawTriangles<br>`;
            if(voDrawMode.index==true){
                // Mit Referenzen auf Dreiecke zeichnen
                gl.drawElements(gl.TRIANGLES, voDrawMode.count, gl.UNSIGNED_SHORT, 0);
                simpleCode+=`gl.drawElements(gl.TRIANGLES, `+voDrawMode.count+`, gl.UNSIGNED_SHORT, 0);`;
            }
            else{
                // Jeden Punkt einzeln zeichnen
                gl.drawArrays(gl.TRIANGLES, 0, voDrawMode.count);
                simpleCode+=`gl.drawArrays(gl.TRIANGLES,0, `+voDrawMode.count+`);`;

            }
        }
      
    }





    // Ende interne Klassen
    // ***********************************************************************************

    // ***********************************************************************************
    /* Externe Funktionen */
    
    this.start=start;               // Darstellung starten
    this.addWorlds=addWorlds;       // Scene(n)|World(s) hinzufügen
    this.getSimpleCode=getSimpleCode;  // Tatsächlichen Code holen
    
    /* Externe START Funktion */
    function start(){
        // nur einmal zeichnen
        simpleCode+=`// Teil 3 drawScene<br><br>`;
        drawScene();
    }

    /* Eine interne World hinzufügen */
    /* Parameter: alle World-Rohdaten (array) mit n Kindern (array) */
    /* nur relevante WebGL Daten in der internen Welt speichern */
    function addWorlds(vaoWorld){                
        var aProgram=[];    // teporäre Programme für die World (Kinder verweisen mit Index auf Programm)
        var aRawFloatOrInt=[];  // temporäre Rohdaten FLOAT [r,g,b,a], [x,y,z], [u,v] INTEGER (für Index)        
        var aBuffer=[];     // temporäre Buffer-Daten (compiliert)     
        var aRawShader=[];  // Shader-Rohdaten (nur Code|Text)
        var actExtWorld;    // aktuelle externe Welt (für Programm [Licht, View,...])

        // Benötigte Daten auslesen/erzeugen und in lokaler WebGL maoWorld speichern (push)
        // addNewWorld ist eine function (s.u.)
        vaoWorld.map(addNewWord); // >> addNewWorld >> addNewChild

        // Welt fertigstellen
        function addNewWord(extWorld){
            simpleCode+=`// Teil 2 addNewWord erzeugt keinen Code<br><br>
            var aBuffer=[]; // nur für Script <br>
            var aUniforms=[]; // nur für Script <br>
            var aProg=[]; // nur für Script<br>
            <br>
            `;

            // 3D Daten der Kinder erzeugen
            actExtWorld = extWorld; // Merken für die Programmerstellung
            var intWorld = new UBWorld();  // lokale Klasse (s.u.)
            // Jede Welt kann mehrere Objekte beinhalten
            // addNewChild ist eine function (s.u.), die diese Kinder formatiert
            // intWorld.maoChild ist der this-Zeiger
            extWorld.maChild.map(addNewChild,intWorld.maoChild);
            intWorld.setViewMatrix(extWorld.viewMatrix); //   
            intWorld.maoBuffer=aBuffer; // merken der erzeugten WebGL Attribute-Buffer in der internen Welt            
            intWorld.maoProgram=aProgram; // Merken der erzeugten WebGL Programme in der internen Welt                      
            maoWorld.push(intWorld);
        }

        // Objekte fertigstellen (3D Daten)
        // Umwandlung von externen Daten in WebGL kompatibles Format
        function addNewChild(extChild){
            simpleCode+=`// addNewChild erzeugt keinen Code<br><br>`;
            // this Zeiger ist hier: intWorld aus addNewWorld
            var intChild=new UBChild();  
            intChild.matrix = extChild.data;  
            
            // Im FormCatalog stehen alle gültigen Geometrien | Formen
            var form = FormCatalog.getFormAttributes(extChild) // alle Attribut-Rohdaten erzeugen 
            simpleCode+=`// FormCatalog<br>
            var pos=[`+form.position+`];<br>
            var color=[`+form.color+`];<br><br>
            `;
            addNewBuffer(intChild,form);  // Buffer temporär speichern (im Kind nur einen Index auf Buffer)                        
            addNewUniform(intChild); // Uniforms mit Kindern verknüpfen  
            addNewProgram(actExtWorld,intChild); // Programme temporär speichern (im Kind nur einen Index auf Programm)                      
            this.push(intChild); // Zur Liste der Kinder hinzufügen
        }

        // Buffer-Index hinzufügen, falls noch nicht vorhanden
        // Hier der Buffer NUR bei Bedarf erzeugt. Ist er bereits vorhanden
        //      wird der entsprechnde Index eingetragen
        // Es gibt hier drei verschiedene Buffer-Formate
        // a_position : Geometrie (keine Ahung, warum das Position heißt)
        // a_color    : Farbe einer Eckkorrdinate
        // a_index    : Index, damit Ecken nur einmal in a_position stehen müssen   
        function addNewBuffer(roIntChild,form){
            if (!form) return;
            simpleCode+=`// addNewBuffer erzeugt keinen Code<br><br>`;
            var index;
            if(form.position){ // Position            // bufferIndex holen
                roIntChild.shaderFlag.position=true;
                roIntChild.buffer.push({attribute:'a_position',
                                        attributeIndex:null,  // Nummer von a_position im Program
                                        index : getBufferIndex('pos',form.position,gl.ARRAY_BUFFER),
                                        elementCount:3, // x,y,z
                                        triangleCount:form.position.length/3});
            }
            if(form.color){ // Farbe, falls für jeden Punkt verwendet
                roIntChild.shaderFlag.color=true;
                roIntChild.buffer.push({attribute:'a_color',
                                        attributeIndex:null, // Nummer von a_color im Program
                                        index : getBufferIndex('color',form.color,gl.ARRAY_BUFFER),
                                        elementCount:4, // r,g,b,a 
                                        });
            }
            if(form.index){ // Index der Koordinaten 
                roIntChild.buffer.push({attribute:'a_index',
                                        attributeIndex:null, // Nummer von a_color im Program
                                        index : getBufferIndex('index',form.index,gl.ELEMENT_ARRAY_BUFFER),
                                        elementCount:3, // 3 Werte bilden ein Dreieck
                                        triangleCount:form.index.length});
            }

        }

        // Uniform merken
        function addNewUniform(roIntChild){
            roIntChild.addUniform();              
        }

        // prüfen, ob es diesen Buffer schon gibt
        function getBufferIndex(vsDebug,vaData,voGLType){
            simpleCode+=`// getBufferIndex erzeugt keinen Code `+vsDebug+` `+vaData+`<br><br>`;
            var nFound=null;
            // Entweder FLOAT oder INTEGERT - Buffer            
            aRawFloatOrInt.forEach(function(aV,index){
                // Array-Vergleichsfunktion (function.js)
                if(aV.equals(vaData)){nFound=index;} // Gibt es schon, also nur eine Referenz zurückgeben
            })
            if(nFound!==null) return nFound;
            aRawFloatOrInt.push(vaData);   // Daten temp. lokal für Vergleich merken
            var index=aRawFloatOrInt.length-1;
            createBuffer(vsDebug,index,vaData,voGLType);   // Buffer erzeugen
            return index;
        }

        // Tatsächlich einen Attribute-Buffer erzeugen (noch ohne Verbindung zu einem Attribute)
        function createBuffer(vsDebug,vnIndex,vaData,voGLType){
            simpleCode+=`// createBuffer `+vsDebug+` `+voGLType+` <br>`;
            var buffer=gl.createBuffer();
            simpleCode+=`var buffer=gl.createBuffer(); <br>`;
            switch (voGLType){
                case gl.ARRAY_BUFFER: 
                    var array= new Float32Array(vaData);
                    simpleCode+=`var array= new Float32Array(`+vsDebug+`);<br>`;
                break; // Floats
                case gl.ELEMENT_ARRAY_BUFFER: 
                    var array= new Uint16Array(vaData); 
                    simpleCode+=`var array= new Uint16Array(`+vsDebug+`);<br>`;
                break; // Integers
            }
            gl.bindBuffer(voGLType,buffer);
            gl.bufferData(voGLType, array, gl.STATIC_DRAW);

            simpleCode+=`
            gl.bindBuffer(`+voGLType+`,buffer);<br>
            gl.bufferData(`+voGLType+`, array, gl.STATIC_DRAW);<br>
            aBuffer[`+vnIndex+`]=buffer;<br>
            <br>
            `;

            aBuffer[vnIndex]=buffer; // Buffer merken
        }



        // ************************************************************************************
        // Programme
        // Daten kommen aus dem ShaderCatalog in Abh. von den Optionen
        function addNewProgram(voExtWorld,roIntChild){
            simpleCode+=`// addNewProgram erzeugt keinen Code <br><br>`;
            // Im ShaderCatalog stehen die Fragment und VertexShader
            var oShader = ShaderCatalog.getCode(voExtWorld,roIntChild);
            simpleCode+=`// ShaderCatalog<br>
            var vertexShader="`+oShader.vertexShader+`";<br>
            var fragmentShader="`+oShader.fragmentShader+`";<br><br>
            `;
            // diese Shader schon vorhanden? Programm in WebGL-World merken, Im Kind nur den Programm-Index
            roIntChild.programIndex = getProgramIndex(oShader);

            // Indices der Attribute finden und merken
            getAttributeIndices(roIntChild); // z.B: "a_position" zu 4 (oder andere Integer-Zahl) zuweisen
            getUniformIndices(roIntChild);
        }

        // Holen der Nummer des Attributes aus dem erstellen Programm
        function getAttributeIndices(voChild){
            simpleCode+=`// getAttributeIndices erzeugt keinen Code<br><br>`;
            voChild.buffer.map(function(buffer){
                // Der Name (a_position|a_color) wird im Programm gesucht und die zugehörige Nummer wird zurückgegeben
                buffer.attributeIndex=gl.getAttribLocation(aProgram[voChild.programIndex], buffer.attribute);                
            },voChild);            
        }

        // Holen der Nummer des Uniformss aus dem erstellen Programm        
        function getUniformIndices(voChild){
            simpleCode+=`// getUniformIndices erzeugt keinen Code<br><br>`;
            voChild.uniform.map(function(uniform){
                // Der Name (a_position|a_color) wird im Programm gesucht und die zugehörige Nummer wird zurückgegeben
                uniform.variable=gl.getUniformLocation(aProgram[voChild.programIndex], uniform.id);                
            },voChild);            
        }

        // Prüfen, ob es das Programm schon gibt
        function getProgramIndex(voData){
            simpleCode+=`// getProgramIndex erzeugt keinen Code<br><br>`;
            // Das ist nur roher (Shader-)Text
            var sData=voData.vertexShader+voData.fragmentShader;
            var nFound=null;
            aRawShader.forEach(function(aSH,index){
                // Vergleich von Text
                if(aSH==sData){nFound=index;} // Das Programm existiert schon
            })
            if(nFound!==null) return nFound;
            aRawShader.push(sData);   // Daten temp. lokal für Vergleich merken
            var index=aRawShader.length-1;
            createProgram(index,voData);   // Buffer erzeugen
            return index;
        }

        // Programm erzeugen
        function createProgram(vnIndex,voShader){
            simpleCode+=`// createProgram<br>`;            
            var v=createShader('v',gl.VERTEX_SHADER,'vertexShader',voShader.vertexShader);     // Vertex Shader anlegen             
            var f=createShader('f',gl.FRAGMENT_SHADER,'fragmentShader',voShader.fragmentShader); // Fragment Shader anlegen            
            var prog= gl.createProgram(); // Program erzeugen
            gl.attachShader(prog, v);
            gl.attachShader(prog, f);
            gl.linkProgram(prog);  // Programm linken alle anderen Daten können gelöscht werden.
            simpleCode+=`
            var prog= gl.createProgram();<br> 
            gl.attachShader(prog, v);<br>
            gl.attachShader(prog, f);<br>
            gl.linkProgram(prog);<br>
            aProg[`+vnIndex+`]=prog;<br>
            <br>
            `; 

            // Fehlermeldungen, immens wichtig bei Shadern
            if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
                {alert('Error during program linking:\n' + gl.getProgramInfoLog(prog));return;}
            // Validieren des Programmes
            gl.validateProgram(prog);
            if (!gl.getProgramParameter(prog, gl.VALIDATE_STATUS))
                {alert('Error during program validation:\n' + gl.getProgramInfoLog(prog));return;}
            aProgram[vnIndex]=prog; // Programm mit kompilierten Shadern            
        }

        // Shader erzeugen, linken
        function createShader(vsDebug,voType,vsShader,vsCode){
            simpleCode+=`// createShader<br>`; 
            var shader = gl.createShader(voType);
            gl.shaderSource(shader,vsCode);
            gl.compileShader(shader);
            simpleCode+=`
            var `+vsDebug+` = gl.createShader(`+voType+`);<br>
            gl.shaderSource(`+vsDebug+`,`+vsShader+`);<br>
            gl.compileShader(`+vsDebug+`);<br>            
            <br>`;
            // Fehlermeldungen, immens wichtig bei Shadern
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
                {alert('Error during '+voType+' shader compilation:\n\n'+ vsCode+ '\n'+ gl.getShaderInfoLog(shader)); return;}
            return shader;
        }


    }

    function getSimpleCode(){
        return simpleCode;
    }
    // Ende externe Funktionen
    // ***********************************************************************************

    // ***********************************************************************************
    // Private Funktionen
    // ***********************************************************************************
    /* gl erzeugen */
    /* Parameter: ID des DIVs  */
    function getContext(){
        var div=$(sDivId);   // DIV Datensatz holen
        var canvas=dcE('canvas');    // Canvas in der Größe des Divs erzeugen
        canvas.width=div.offsetWidth;
        canvas.height=div.offsetHeight;
        div.appendChild(canvas);
        div.style.backgroundColor='#eeeeee';
        div.style.border='solid 1px #333';
        try {gl = canvas.getContext('webgl')   }
        catch(e) {alert('Exception init: '+e.toString());return;}
        if(!gl) {alert('Unable to create Web GL context');return;}

        // Erforderlicher Code    
        simpleCode+=`
// Teil 1 (getContext)<br>
// canvas und gl(webGL) erzeugen<br> 
var div=document.getElementById('canvas');<br>
var canvas=document.createElement('canvas');<br>
canvas.width=div.offsetWidth;<br>
canvas.height=div.offsetHeight;<br>
div.appendChild(canvas);<br>
div.style.backgroundColor='#eeeeee';<br>
div.style.border='solid 1px #333';<br>
try {gl = canvas.getContext('webgl')   }<br>
catch(e) {alert('Exception init: '+e.toString());}<br>
if(!gl) {alert('Unable to create Web GL context');}<br><br>
`;
    }

    /* RENDER LOOP */
    /* oder einfacher Aufruf */
    function drawScene(){
        // WebGL Optionen setzen (alles löschen, cull mode, depth buffer)
        setWebGLDrawOptions();
    
        // Schleife über alle Welten
        maoWorld.map(function(world){
    
            // Schleife über alle Kinder
            world.maoChild.map(function(child){
        
                var world=this;
        
                // Programm aktivieren
                gl.useProgram(world.maoProgram[child.programIndex]); // Program in Eng, Index in Child
  
                simpleCode+=`
                gl.useProgram(aProg[`+child.programIndex+`]);<br>
                `;

                // Ein Objekt zeichnen
                drawObject(world,child);
        
            }, world) ; // world in map bekannt machen (wird zu this)
    
        } );    
    }

    /* Setzen von CULL, BIT, DEPTH*/
    function setWebGLDrawOptions(){
        simpleCode+=`// setWebGLDrawOptions<br>`;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);     // Canvas löschen
        gl.enable(gl.CULL_FACE);  // Nur Vorderseite zeigen
        gl.enable(gl.DEPTH_TEST); // Dreiecke werden richtig angeordnet (und schneiden sich sogar)
        simpleCode+=`
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);<br>
        gl.enable(gl.CULL_FACE);<br>
        gl.enable(gl.DEPTH_TEST);<br>
        <br>`;
    }
   
    /* Ein Objekt aus der Szene zeichnen */
    /* Immer drei Schritte: 
    1. Uniforms, 
    2. Attributes, 
    3. Dreiecke auf Medium zeichnen */
    function drawObject(voWorld,voChild){
        simpleCode+=`// drawObject<br>`;
        var drawMode; // {index:false,position:true,count:}
     
        // Objekt-Matrix
        var objectMatrix = voWorld.moViewMatrix;

        var pos=voChild.matrix;
      
        // Matrizen berechnen
        voChild.setUniformVariable('worldMatrix',objectMatrix);

        // Objekt - Uniforms (Matrizen und sonstige veränderbare Informationen (z.B: an/aus))
        voChild.setUniforms();

        // Atribute (Datensätze: punkte, normale, farbe, indices) setzen
        drawMode = voChild.setAttributes(voWorld);

        // Dreiecke oder Index-Buffer zeichen (auf Screen oder in Framebuffer)
        voChild.drawTriangles(drawMode);

    }

    /* Ende der lokalen Funktionen */ 

}