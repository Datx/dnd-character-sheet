from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)



# Método GET para obtener los datos
@app.route('/datos', methods=['GET'])
def obtener_datos():    
    file = open("character_sheet.json")
    string = ""
    for line in file:
        string += line.strip()
    return jsonify(string)

# Método PUT para actualizar los datos
@app.route('/datos', methods=['PUT'])
def actualizar_datos():
    # Recibe los nuevos datos desde el cuerpo de la petición
    nuevos_datos = request.get_json()
    
    file = open("character_sheet.json", "w")
    file.write(str(nuevos_datos["string"]))
    return nuevos_datos

app.run(debug=False)
