// @ts-nocheck

/**
 * Utilidades para cálculos del módulo de Calidad
 */

// Convertir fecha ISO a semana del año
export const obtenerSemanaDelAno = (fechaISO) => {
  const fecha = new Date(fechaISO);
  const primerDiaAno = new Date(fecha.getFullYear(), 0, 1);
  const diasTranscurridos = Math.floor((fecha - primerDiaAno) / (24 * 60 * 60 * 1000));
  const semana = Math.ceil((diasTranscurridos + primerDiaAno.getDay() + 1) / 7);
  return semana;
};

// Formatear semana como "Semana 1", "Semana 2", etc.
export const formatearSemana = (numeroSemana) => {
  return `Semana ${numeroSemana}`;
};

// Normalizar calificaciones al rango 0 - 10
const normalizarCalificacion = (valor) => {
  const numero = Number(valor);
  if (Number.isNaN(numero)) return 0;
  return Math.min(10, Math.max(0, numero));
};

// Obtener límites Q1, Q2 y Q3 dinamicamente
export const calcularLimitesCuartiles = () => {
  const rangoMin = 0;
  const rangoMax = 10;
  const intervalo = (rangoMax - rangoMin) / 4;

  return {
    Q1: rangoMin + intervalo,
    Q2: rangoMin + intervalo * 2,
    Q3: rangoMin + intervalo * 3
  };
};

// Determinar cuartil a partir de límites dinámicos
export const calcularCuartil = (calificacion, limitesCuartiles) => {
  const cal = normalizarCalificacion(calificacion);
  
  if (!limitesCuartiles) return 'Q1';
  // Q1 represents the highest performance, so boundaries are evaluated from top to bottom.
  if (cal >= limitesCuartiles.Q3) return 'Q1';
  if (cal >= limitesCuartiles.Q2) return 'Q2';
  if (cal >= limitesCuartiles.Q1) return 'Q3';
  return 'Q4';
};

// Calcular promedio de un array de números
export const calcularPromedio = (valores) => {
  if (!valores || valores.length === 0) return 0;
  const suma = valores.reduce((acc, val) => acc + normalizarCalificacion(val), 0);
  return (suma / valores.length).toFixed(2);
};

// Agrupar datos por asesor
export const agruparPorAsesor = (datos) => {
  const agrupado = {};
  
  datos.forEach(item => {
    const asesor = item.asesor || 'Sin Asesor';
    
    if (!agrupado[asesor]) {
      agrupado[asesor] = {
        asesor,
        supervisor: item.supervisor || item.grupo || '',
        agencia: item.agencia || '',
        llamadas: [],
        totalLlamadas: 0,
        promedio: 0,
        cantidad: 0, // nuevo
        cuartil: ''
        // Criterios individuales
        /*criterio1: [],
        criterio2: [],
        criterio3: [],
        criterio4: [],
        criterio5: [],
        criterio6: [],
        criterio7: []*/
      };
    }
    
    agrupado[asesor].llamadas.push(item);
    agrupado[asesor].totalLlamadas++;
    
    // Agregar criterios
    for (let i = 1; i <= 7; i++) {
      const criterio = item[`criterio${i}`];
      if (criterio != null) {
        agrupado[asesor][`criterio${i}`].push(Number(criterio));
      }
    }
  });
  
  const grupos = Object.values(agrupado);
  
  // Calcular promedios
  grupos.forEach(grupo => {
    const calificaciones = grupo.llamadas.map(l => normalizarCalificacion(l.promedio));
    grupo.promedio = calcularPromedio(calificaciones);
    grupo.cantidad = grupo.totalLlamadas;
    
    // Promedios de criterios
    for (let i = 1; i <= 7; i++) {
      grupo[`criterio${i}Promedio`] = calcularPromedio(grupo[`criterio${i}`]);
    }
  });
  
  const limitesCuartiles = calcularLimitesCuartiles(grupos.map(g => normalizarCalificacion(g.promedio)));
  
  if (limitesCuartiles) {
    grupos.forEach(grupo => {
      grupo.cuartil = calcularCuartil(grupo.promedio, limitesCuartiles);
    });
  }
  
  return grupos;
};

// Agrupar por asesor y semana
export const agruparPorAsesorYSemana = (datos) => {
  const agrupado = {};
  
  datos.forEach(item => {
    const asesor = item.asesor || 'Sin Asesor';
    const semana = obtenerSemanaDelAno(item.fecha);
    const clave = `${asesor}_${semana}`;
    
    if (!agrupado[clave]) {
      agrupado[clave] = {
        asesor,
        supervisor: item.supervisor || item.grupo || '',
        agencia: item.agencia || '',
        semana,
        llamadas: [],
        totalLlamadas: 0,
        promedio: 0,
        cuartil: ''
      };
    }
    
    agrupado[clave].llamadas.push(item);
    agrupado[clave].totalLlamadas++;
  });
  
  const grupos = Object.values(agrupado);
  
  // Calcular promedios
  grupos.forEach(grupo => {
    const calificaciones = grupo.llamadas.map(l => normalizarCalificacion(l.calificacion));
    grupo.promedio = calcularPromedio(calificaciones);
  });
  
  const limitesCuartiles = calcularLimitesCuartiles(grupos.map(g => normalizarCalificacion(g.promedio)));
  
  if (limitesCuartiles) {
    grupos.forEach(grupo => {
      grupo.cuartil = calcularCuartil(grupo.promedio, limitesCuartiles);
    });
  }
  
  return grupos;
};

// Calcular tendencia entre dos valores
export const calcularTendencia = (valorActual, valorAnterior) => {
  const actual = Number(valorActual) || 0;
  const anterior = Number(valorAnterior) || 0;
  
  if (anterior === 0) return { icono: '−', delta: 0, clase: 'neutral' };
  
  const diferencia = actual - anterior;
  const porcentaje = ((diferencia / anterior) * 100).toFixed(1);
  
  if (diferencia > 0) {
    return { icono: '▲', delta: `+${porcentaje}%`, clase: 'positivo' };
  } else if (diferencia < 0) {
    return { icono: '▼', delta: `${porcentaje}%`, clase: 'negativo' };
  }
  
  return { icono: '−', delta: '0%', clase: 'neutral' };
};

// Obtener últimas 4 semanas de datos
export const obtenerUltimas4Semanas = (datosAgrupados) => {
  const semanasUnicas = [...new Set(datosAgrupados.map(d => d.semana))].sort((a, b) => b - a);
  const ultimas4 = semanasUnicas.slice(0, 4).sort((a, b) => a - b);
  
  return datosAgrupados.filter(d => ultimas4.includes(d.semana));
};

// Normalizar texto (sin tildes, mayúsculas)
export const normalizar = (texto) => {
  return (texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
};

// Calcular KPIs generales
export const calcularKPIsGenerales = (datos) => {
  if (!datos || datos.length === 0) {
    return {
      totalLlamadas: 0,
      totalAsesores:0,
      promedioGeneral: 0,
      mejorPromedio: 0
    };
  }
  
  let calificaciones = [];
  let totalAsesores = 0;
  let mejorPromedio = 0;
  let totalLlamadas = 0;
  
if (datos[0]?.llamadas) {
    // Datos agrupados
    totalAsesores = datos.length;
    calificaciones = datos.map(d => normalizarCalificacion(d.promedio));
    mejorPromedio = Math.max(...calificaciones);
    totalLlamadas = datos.reduce((sum, d) => sum + (d.totalLlamadas || 0), 0);
  } else {
    // Datos sin agrupar (vista detalle)
    calificaciones = datos.map(d => normalizarCalificacion(d.promedio));
    totalLlamadas = datos.length;
    mejorPromedio = Math.max(...calificaciones);
  }

  return {
    totalLlamadas: totalLlamadas,
    totalAsesores: totalAsesores,
    promedioGeneral: calcularPromedio(calificaciones),
    mejorPromedio: mejorPromedio
  };
};

// Distribuir por cuartiles
export const distribuirPorCuartiles = (datosAgrupados) => {
  const distribucion = {
    Q1: datosAgrupados.filter(d => d.cuartil === 'Q1').length,
    Q2: datosAgrupados.filter(d => d.cuartil === 'Q2').length,
    Q3: datosAgrupados.filter(d => d.cuartil === 'Q3').length,
    Q4: datosAgrupados.filter(d => d.cuartil === 'Q4').length
  };
  
  return distribucion;
};
