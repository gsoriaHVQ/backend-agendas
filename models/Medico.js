class Medico {
  constructor(data) {
    this.codigo_item = data.codigo_item;
    this.descripcion_agendamiento = data.descripcion_agendamiento;
    this.codigo_prestador = data.codigo_prestador;
    this.nombre_prestador = data.nombre_prestador;
    this.mnemonico = data.mnemonico;
  }

  // Obtener especialidad desde la descripción del agendamiento
  get especialidad() {
    return this.descripcion_agendamiento;
  }

  // Formatear para respuesta
  toJSON() {
    return {
      codigo_item: this.codigo_item,
      especialidad: this.especialidad,
      codigo_prestador: this.codigo_prestador,
      nombre_prestador: this.nombre_prestador,
      mnemonico: this.mnemonico
    };
  }

  // Método estático para crear instancia desde row de BD
  static fromDatabaseRow(row) {
    return new Medico({
      codigo_item: row[0],
      descripcion_agendamiento: row[1],
      codigo_prestador: row[2],
      nombre_prestador: row[3],
      mnemonico: row[4]
    });
  }
}

module.exports = Medico; 