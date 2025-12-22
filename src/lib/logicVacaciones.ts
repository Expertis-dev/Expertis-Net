type AjusteOptimo = {
    ok: boolean
    x_h: number
    x_n: number
    deltaHabiles: number   // + agregar / - quitar
    deltaNoHabiles: number // + agregar / - quitar
    Hr: number
    Nr: number
    ratioAfter: number
    message: string
}

export function ajusteOptimoProporcionSaldo(
    H: number,
    N: number,
    h0: number,
    n0: number,
    L = 2.65,
    U = 2.85,
    wh = 1,     // peso cambios hábiles
    wn = 1.2    // peso cambios no hábiles (si quieres penalizar más tocar no-hábiles)
): AjusteOptimo {
    // Validación base
    if (H < 0 || N < 0) throw new Error("Saldos inválidos")
    if (h0 < 0 || n0 < 0) throw new Error("Selección inválida")

    let best: { cost: number; xh: number; xn: number; Hr: number; Nr: number; ratio: number } | null = null

    // Enumeración exacta
    for (let xh = 0; xh <= H; xh++) {
        for (let xn = 0; xn <= N - 1; xn++) { // asegura Nr>=1
            const Hr = H - xh
            const Nr = N - xn
            const ratio = Hr / Nr

            if (ratio < L || ratio > U) continue

            // Distancia a lo que pidió el usuario (L1 ponderada)
            const cost = wh * Math.abs(xh - h0) + wn * Math.abs(xn - n0)

            if (!best || cost < best.cost) {
                best = { cost, xh, xn, Hr, Nr, ratio }
            }
        }
    }

    if (!best) {
        return {
            ok: false,
            x_h: h0,
            x_n: n0,
            deltaHabiles: 0,
            deltaNoHabiles: 0,
            Hr: H - h0,
            Nr: N - n0,
            ratioAfter: (N - n0) > 0 ? (H - h0) / (N - n0) : Infinity,
            message: "No existe una forma de ajustar la selección para que el saldo resultante quede dentro del rango permitido.",
        }
    }

    const deltaHabiles = best.xh - h0
    const deltaNoHabiles = best.xn - n0

    // Mensaje entendible
    let msg = "Selección ajustada para mantener el equilibrio de saldos."
    if (deltaHabiles > 0) msg += ` Agrega ${deltaHabiles} día(s) HÁBIL(ES).`
    if (deltaHabiles < 0) msg += ` Quita ${Math.abs(deltaHabiles)} día(s) HÁBIL(ES).`
    if (deltaNoHabiles > 0) msg += ` Agrega ${deltaNoHabiles} día(s) NO HÁBIL(ES).`
    if (deltaNoHabiles < 0) msg += ` Quita ${Math.abs(deltaNoHabiles)} día(s) NO HÁBIL(ES).`

    msg += ` Saldo resultante: H=${best.Hr}, NH=${best.Nr}.`

    return {
        ok: true,
        x_h: best.xh,
        x_n: best.xn,
        deltaHabiles,
        deltaNoHabiles,
        Hr: best.Hr,
        Nr: best.Nr,
        ratioAfter: best.ratio,
        message: msg,
    }
}
