export function validarCodigo(
    codigo: any,
    nombreCampo:string = 'codigo'):{
        valor?: number;
        error?: string } {

    const numero = Number(codigo);
    if(!codigo){
        return {error: `El ${nombreCampo} no fue provisto`};
    } else if(isNaN(numero)){
        return {error: `El ${nombreCampo} es inválido`};
    };
    return { valor: Number(numero) };
};