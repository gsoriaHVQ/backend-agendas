# 📋 Endpoints API - Backend Agendas

## 🌐 Base URL
```
http://localhost:3001 (desarrollo)
https://tu-dominio.com (producción)
```

## 🔍 Endpoints de Información y Estado

### 1. Información de la API
```http
GET /
```
**Respuesta:**
```json
{
  "name": "API de Agendas Médicas",
  "version": "1.0.0",
  "environment": "production",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "endpoints": {
    "health": "/health",
    "especialidades": "/especialidades",
    "medicos": {
      "all": "/medicos",
      "byEspecialidad": "/medicos/especialidad/:especialidad",
      "byItem": "/medicos/item/:codigo_item",
      "byNombre": "/medicos/nombre/:nombre"
    }
  },
  "status": "active"
}
```

### 2. Health Check
```http
GET /health
```
**Respuesta:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production",
  "database": "connected",
  "uptime": 3600
}
```

## 👨‍⚕️ Endpoints de Médicos

### 3. Obtener Todos los Médicos
```http
GET /medicos
```
**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "codigo_prestador": "12345",
      "nombre_prestador": "Dr. Juan Pérez",
      "mnemonico": "JPEREZ",
      "codigo_item_agendamiento": "001",
      "descripcion_item": "Consulta General"
    }
  ],
  "total": 150
}
```

### 4. Obtener Especialidades
```http
GET /especialidades
```
**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "codigo": "001",
      "nombre": "Medicina General",
      "descripcion": "Consulta médica general"
    }
  ]
}
```

### 5. Médicos por Especialidad
```http
GET /medicos/especialidad/:especialidad
```
**Ejemplo:**
```http
GET /medicos/especialidad/CARDIOLOGIA
```
**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "codigo_prestador": "12345",
      "nombre_prestador": "Dr. María García",
      "especialidad": "CARDIOLOGIA",
      "consultorio": "A-101"
    }
  ]
}
```

### 6. Médicos por Código de Item
```http
GET /medicos/item/:codigo_item
```
**Ejemplo:**
```http
GET /medicos/item/001
```
**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "codigo_prestador": "12345",
      "nombre_prestador": "Dr. Juan Pérez",
      "codigo_item": "001",
      "descripcion_item": "Consulta General"
    }
  ]
}
```

### 7. Médicos por Nombre
```http
GET /medicos/nombre/:nombre
```
**Ejemplo:**
```http
GET /medicos/nombre/Juan
```
**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "codigo_prestador": "12345",
      "nombre_prestador": "Dr. Juan Pérez",
      "especialidad": "MEDICINA GENERAL"
    }
  ]
}
```

### 8. Estadísticas de Médicos
```http
GET /api/medicos/estadisticas
```
**Respuesta:**
```json
{
  "success": true,
  "data": {
    "total_medicos": 150,
    "por_especialidad": {
      "CARDIOLOGIA": 25,
      "MEDICINA_GENERAL": 45,
      "PEDIATRIA": 30
    },
    "medicos_activos": 142
  }
}
```

## 📅 Endpoints de Agendas

### 9. Obtener Todas las Agendas
```http
GET /api/agendas
```
**Parámetros de consulta opcionales:**
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10)
- `fecha_inicio`: Fecha de inicio (YYYY-MM-DD)
- `fecha_fin`: Fecha de fin (YYYY-MM-DD)
- `estado`: Estado de la agenda (ACTIVA, CANCELADA, COMPLETADA)

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "codigo_prestador": "12345",
      "nombre_prestador": "Dr. Juan Pérez",
      "fecha": "2024-01-15",
      "hora_inicio": "09:00",
      "hora_fin": "10:00",
      "estado": "ACTIVA",
      "consultorio": "A-101"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```

### 10. Obtener Agenda por ID
```http
GET /api/agendas/:id
```
**Ejemplo:**
```http
GET /api/agendas/1
```
**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "codigo_prestador": "12345",
    "nombre_prestador": "Dr. Juan Pérez",
    "fecha": "2024-01-15",
    "hora_inicio": "09:00",
    "hora_fin": "10:00",
    "estado": "ACTIVA",
    "consultorio": "A-101",
    "paciente": "María García",
    "observaciones": "Primera consulta"
  }
}
```

### 11. Agendas por Prestador
```http
GET /api/agendas/prestador/:codigo_prestador
```
**Ejemplo:**
```http
GET /api/agendas/prestador/12345
```
**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "fecha": "2024-01-15",
      "hora_inicio": "09:00",
      "hora_fin": "10:00",
      "estado": "ACTIVA",
      "consultorio": "A-101"
    }
  ]
}
```

### 12. Crear Nueva Agenda
```http
POST /api/agendas
```
**Body:**
```json
{
  "codigo_prestador": "12345",
  "fecha": "2024-01-20",
  "hora_inicio": "14:00",
  "hora_fin": "15:00",
  "consultorio": "A-101",
  "paciente": "María García",
  "observaciones": "Consulta de seguimiento"
}
```
**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 156,
    "codigo_prestador": "12345",
    "fecha": "2024-01-20",
    "hora_inicio": "14:00",
    "hora_fin": "15:00",
    "estado": "ACTIVA",
    "consultorio": "A-101",
    "paciente": "María García",
    "observaciones": "Consulta de seguimiento",
    "created_at": "2024-01-15T10:30:00.000Z"
  },
  "message": "Agenda creada exitosamente"
}
```

### 13. Actualizar Agenda
```http
PUT /api/agendas/:id
```
**Ejemplo:**
```http
PUT /api/agendas/1
```
**Body:**
```json
{
  "hora_inicio": "15:00",
  "hora_fin": "16:00",
  "observaciones": "Consulta reprogramada"
}
```
**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "hora_inicio": "15:00",
    "hora_fin": "16:00",
    "observaciones": "Consulta reprogramada",
    "updated_at": "2024-01-15T10:35:00.000Z"
  },
  "message": "Agenda actualizada exitosamente"
}
```

### 14. Cancelar Agenda
```http
PUT /api/agendas/:id/cancelar
```
**Ejemplo:**
```http
PUT /api/agendas/1/cancelar
```
**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "estado": "CANCELADA",
    "fecha_cancelacion": "2024-01-15T10:40:00.000Z"
  },
  "message": "Agenda cancelada exitosamente"
}
```

### 15. Eliminar Agenda
```http
DELETE /api/agendas/:id
```
**Ejemplo:**
```http
DELETE /api/agendas/1
```
**Respuesta:**
```json
{
  "success": true,
  "message": "Agenda eliminada exitosamente"
}
```

### 16. Estadísticas de Agendas
```http
GET /api/agendas/estadisticas
```
**Respuesta:**
```json
{
  "success": true,
  "data": {
    "total_agendas": 1500,
    "agendas_activas": 1200,
    "agendas_canceladas": 200,
    "agendas_completadas": 100,
    "por_mes": {
      "enero": 150,
      "febrero": 180
    }
  }
}
```

## 📚 Endpoints de Catálogos

### 17. Obtener Consultorios
```http
GET /api/catalogos/consultorios
```
**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "codigo": "A-101",
      "nombre": "Consultorio A-101",
      "edificio": "A",
      "piso": 1
    }
  ]
}
```

### 18. Obtener Días
```http
GET /api/catalogos/dias
```
**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "codigo": "LUN",
      "nombre": "Lunes",
      "nombre_corto": "Lun"
    }
  ]
}
```

### 19. Obtener Edificios
```http
GET /api/catalogos/edificios
```
**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "codigo": "A",
      "nombre": "Edificio A",
      "descripcion": "Edificio principal"
    }
  ]
}
```

### 20. Obtener Pisos por Edificio
```http
GET /api/catalogos/edificios/:codigo_edificio/pisos
```
**Ejemplo:**
```http
GET /api/catalogos/edificios/A/pisos
```
**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "codigo": "1",
      "nombre": "Primer Piso",
      "edificio": "A"
    }
  ]
}
```

## 📋 Endpoints de Agenda Personalizada

### 21. Listar Agendas Personalizadas
```http
GET /api/agnd-agenda
```
**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "titulo": "Reunión de equipo",
      "descripcion": "Reunión semanal del equipo médico",
      "fecha": "2024-01-15",
      "hora_inicio": "08:00",
      "hora_fin": "09:00",
      "tipo": "REUNION"
    }
  ]
}
```

### 22. Obtener Agenda Personalizada por ID
```http
GET /api/agnd-agenda/:id
```
**Ejemplo:**
```http
GET /api/agnd-agenda/1
```
**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "titulo": "Reunión de equipo",
    "descripcion": "Reunión semanal del equipo médico",
    "fecha": "2024-01-15",
    "hora_inicio": "08:00",
    "hora_fin": "09:00",
    "tipo": "REUNION",
    "participantes": ["Dr. Juan", "Dr. María"]
  }
}
```

### 23. Crear Agenda Personalizada
```http
POST /api/agnd-agenda
```
**Body:**
```json
{
  "titulo": "Nueva reunión",
  "descripcion": "Reunión de coordinación",
  "fecha": "2024-01-20",
  "hora_inicio": "10:00",
  "hora_fin": "11:00",
  "tipo": "REUNION",
  "participantes": ["Dr. Juan", "Dr. María"]
}
```
**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "titulo": "Nueva reunión",
    "descripcion": "Reunión de coordinación",
    "fecha": "2024-01-20",
    "hora_inicio": "10:00",
    "hora_fin": "11:00",
    "tipo": "REUNION",
    "participantes": ["Dr. Juan", "Dr. María"],
    "created_at": "2024-01-15T10:30:00.000Z"
  },
  "message": "Agenda personalizada creada exitosamente"
}
```

### 24. Actualizar Agenda Personalizada
```http
PUT /api/agnd-agenda/:id
```
**Ejemplo:**
```http
PUT /api/agnd-agenda/1
```
**Body:**
```json
{
  "titulo": "Reunión de equipo actualizada",
  "hora_inicio": "09:00",
  "hora_fin": "10:00"
}
```
**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "titulo": "Reunión de equipo actualizada",
    "hora_inicio": "09:00",
    "hora_fin": "10:00",
    "updated_at": "2024-01-15T10:35:00.000Z"
  },
  "message": "Agenda personalizada actualizada exitosamente"
}
```

### 25. Eliminar Agenda Personalizada
```http
DELETE /api/agnd-agenda/:id
```
**Ejemplo:**
```http
DELETE /api/agnd-agenda/1
```
**Respuesta:**
```json
{
  "success": true,
  "message": "Agenda personalizada eliminada exitosamente"
}
```

## 🔗 Endpoints de Servicios Externos

### 26. Médicos Externos
```http
GET /api/external/medicos
```
**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ext_001",
      "nombre": "Dr. Carlos López",
      "especialidad": "CARDIOLOGIA",
      "institucion": "Hospital Externo"
    }
  ]
}
```

### 27. Estado de Autenticación Externa
```http
GET /api/external/auth/status
```
**Respuesta:**
```json
{
  "success": true,
  "auth": {
    "authenticated": true,
    "token_expires": "2024-01-15T11:30:00.000Z"
  }
}
```

### 28. Configuración de Servicios Externos
```http
GET /api/external/config
```
**Respuesta:**
```json
{
  "success": true,
  "config": {
    "baseUrl": "https://api-externa.com",
    "medicosPath": "/medicos",
    "especialidadesPath": "/especialidades",
    "authUrl": "https://api-externa.com/auth",
    "refreshUrl": "https://api-externa.com/refresh"
  }
}
```

## 🚨 Códigos de Error Comunes

### 400 - Bad Request
```json
{
  "success": false,
  "error": "Datos de entrada inválidos",
  "details": ["El campo fecha es requerido"]
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "error": "No autorizado",
  "message": "Token de autenticación requerido"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "error": "Recurso no encontrado",
  "message": "La agenda con ID 999 no existe"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "error": "Error interno del servidor",
  "message": "Error de conexión a la base de datos"
}
```

## 📝 Notas Importantes

1. **Autenticación:** Algunos endpoints pueden requerir autenticación (headers de Authorization)
2. **CORS:** Los endpoints están configurados para aceptar peticiones desde orígenes permitidos
3. **Paginación:** Los endpoints que devuelven listas soportan paginación con parámetros `page` y `limit`
4. **Filtros:** Muchos endpoints soportan filtros por fecha, estado, etc.
5. **Validación:** Todos los endpoints validan los datos de entrada y devuelven errores descriptivos

## 🔧 Ejemplos de Uso con JavaScript/Fetch

```javascript
// Obtener todos los médicos
const response = await fetch('http://localhost:3001/medicos');
const data = await response.json();

// Crear una nueva agenda
const newAgenda = await fetch('http://localhost:3001/api/agendas', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    codigo_prestador: "12345",
    fecha: "2024-01-20",
    hora_inicio: "14:00",
    hora_fin: "15:00"
  })
});

// Obtener agendas con filtros
const agendas = await fetch('http://localhost:3001/api/agendas?fecha_inicio=2024-01-01&estado=ACTIVA');
```
