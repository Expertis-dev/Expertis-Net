interface SaldosVacacionesParams {
    meses: number;
    dias: number;
    info: {
        VG_Habiles_PeriodoAnterior: number;
        VG_NoHabiles_PeriodoAnterior: number;
        VG_Habiles_PeriodoActual: number;
        VG_NoHabiles_PeriodoActual: number;
    };
    dayStats: {
        laborables: number;
        noLaborables: number;
    };
}

interface SaldosVacaciones {
    saldoH: number;
    saldoNH: number;
}
export function calcularSaldosVacaciones({ meses, dias, info, dayStats }: SaldosVacacionesParams): SaldosVacaciones {
    function truncar({ num, decimales = 2 }: { num: number, decimales?: number }) {
        const factor = 10 ** decimales;
        return Math.trunc(num * factor) / factor;
    }
    const totalMeses = truncar({ num: meses + (dias / 30), decimales: 2 });
    //console.log("Numero de meses:", totalMeses);

    const años = Math.floor(totalMeses / 12);
    //console.log("Numero de años:", años);

    const mesesSinAnios = truncar({ num: totalMeses % 12, decimales: 2 });
    //console.log("Meses sin años:", mesesSinAnios);

    const vacaciones = truncar({ num: mesesSinAnios * 2.5, decimales: 2 });
    //console.log("Días Periodo actual:", vacaciones);

    const periodos22 = truncar({ num: años * 22 + (vacaciones * 22 / 30), decimales: 2 });
    //console.log("H_periodos:", periodos22);

    const periodos8 = truncar({ num: años * 8 + (vacaciones * 8 / 30), decimales: 2 });
    //console.log("NH_periodos:", periodos8);

    const H_meta = truncar({ num: periodos22 - info.VG_Habiles_PeriodoAnterior, decimales: 2 });
    //console.log("H_meta:", H_meta);

    const NH_meta = truncar({ num: periodos8 - info.VG_NoHabiles_PeriodoAnterior, decimales: 2 });
    //console.log("NH_meta:", NH_meta);

    const saldoH = truncar({ num: (H_meta - info.VG_Habiles_PeriodoActual), decimales: 2 });
    //console.log("Saldo Habiles:", saldoH);

    const saldoNH = truncar({ num: (NH_meta - info.VG_NoHabiles_PeriodoActual), decimales: 2 });
    //console.log("Saldo No Habiles:", saldoNH);


    //console.log("Días laborables seleccionados:", dayStats.laborables);
    //console.log("Dias habiles usados en el periodo:", info.VG_Habiles_PeriodoActual);
    const H_after = truncar({ num: info.VG_Habiles_PeriodoActual + dayStats.laborables, decimales: 2 });
    //console.log("H_after:", H_after);
    //console.log("Días no laborables seleccionados:", dayStats.noLaborables);
    //console.log("Dias no habiles usados en el periodo:", info.VG_NoHabiles_PeriodoActual);
    const NH_after = truncar({ num: info.VG_NoHabiles_PeriodoActual + dayStats.noLaborables, decimales: 2 });
    //console.log("NH_after:", NH_after);
    const C_after = truncar({ num: H_after + NH_after, decimales: 2 });
    //console.log("C_after:", C_after);

    const NH_min_acum = Math.floor(C_after * (NH_meta / 30))
    console.log("NH_min_acum:", NH_min_acum);
    return { saldoH, saldoNH };
}