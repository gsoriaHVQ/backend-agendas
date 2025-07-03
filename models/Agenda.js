class Agenda {
  constructor(data) {
    this.id_agenda = data.id_agenda || null;
    this.codigo_prestador = data.codigo_prestador;
    this.fecha = data.fecha;
    this.hora = data.hora;
    this.estado = data.estado || 'DISPONIBLE';
    this.nombre_prestador = data.nombre_prestador || null;
    this.mnemonico = data.mnemonico || null;
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  // Validaciones
  static validate(data) {
    const errors = [];

    if (!data.codigo_prestador) {
      errors.push('El código del prestador es requerido');
    }

    if (!data.fecha) {
      errors.push('La fecha es requerida');
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(data.fecha)) {
        errors.push('La fecha debe tener el formato YYYY-MM-DD');
      }
    }

    if (!data.hora) {
      errors.push('La hora es requerida');
  
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(data.hora)) {
        errors.push('La hora debe tener el formato HH:MM');
      }
    }

    if (data.estado && !['DISPONIBLE', 'OCUPADO', 'CANCELADO'].includes(data.estado)) {
      errors.push('El estado debe ser: DISPONIBLE, OCUPADO o CANCELADO');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toJSON() {
    return {
      id_agenda: this.id_agenda,
      codigo_prestador: this.codigo_prestador,
      fecha: this.fecha,
      hora: this.hora,
      estado: this.estado,
      nombre_prestador: this.nombre_prestador,
      mnemonico: this.mnemonico
    };
  }
}

module.exports = Agenda; 