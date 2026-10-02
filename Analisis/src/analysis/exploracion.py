import os
from pathlib import Path

import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[2] 

RAW_DIR = BASE_DIR/"data"/"raw"

def cargar_csv(ruta):
    
    try:
        
        df = pd.read_csv(ruta, sep=None, engine='python', encoding="utf-8" )
        
        return df
    
    except UnicodeDecodeError:
        
        try:
            df = pd.read_csv(ruta, sep=None, engine='python', encoding="latin-1" )
            
            return df
        
        except Exception as error:
            print(f"Error de lectura: {error}")
            return None
        
    except Exception as error:
        print(f"Error de lectura: {error}")
        return None
            
            
def diagnosticar_df(nombre, df):
    
    print(f"Tabla: {nombre}")
    print(f"-" * 50)
    
    filas, columnas = df.shape
    
    ##Dimensiones
    print(f"Filas: {filas}")
    print(f"Columnas: {columnas}")
    
    
    ##Columnas de la tabla
    
    print("\n La tabla contiene las siguientes columnas: \n")
    
    for columna in df.columns:
        print(f"- {columna}")
        
        
    ##Tipo de datos de cada columna
    print("\nTipo de datos")
    
    for columna, tipo in df.dtypes.items():
        print(f"- {columna}: {tipo}")
    
    ##Valores nulos
    
    print("\n Valores nulos")

    nulos = df.isnull().sum()

    columnas_con_nulos = nulos[nulos > 0]
    
    if columnas_con_nulos.empty:
        print("No hay valores nulos.")
    else:
        for columna, cantidad in columnas_con_nulos.items():
            porcentaje = (cantidad / len(df)) * 100 if len(df) > 0 else 0

            print(
                f" - {columna}: "
                f"{cantidad:,} ({porcentaje:.2f}%)"
            )
        
    # Duplicados

    print("\n Duplicados")

    duplicados = df.duplicated().sum()

    print(f"Filas duplicadas: {duplicados:,}")

    if duplicados == 0:
        print("No se encontraron duplicados.")

    # Valores únicos
    print("\n Valores unicos")

    for columna in df.columns:

        cantidad_unicos = df[columna].nunique(dropna=True)

        print(
            f" - {columna}: "
            f"{cantidad_unicos:,} valores únicos"
        )

    # Fechas

    print("\n Posibles columnas de fechas")

    columnas_fecha = []

    for columna in df.columns:

        nombre_columna = columna.lower()

        if any(
            palabra in nombre_columna
            for palabra in [
                "fecha",
                "date",
                "timestamp",
                "creacion",
                "registro",
                "contratacion",
                "asociacion"
            ]
        ):
            columnas_fecha.append(columna)

    if not columnas_fecha:

        print("   No se detectaron columnas de fecha por nombre.")

    else:

        for columna in columnas_fecha:

            print(f"\n {columna}")

            try:

                fechas = pd.to_datetime(
                    df[columna],
                    errors="coerce"
                )

                fechas_validas = fechas.dropna()

                if fechas_validas.empty:

                    print(" No se pudieron interpretar fechas.")

                else:

                    print(
                        f" Desde: {fechas_validas.min()}"
                    )

                    print(
                        f" Hasta: {fechas_validas.max()}"
                    )

                    fechas_invalidas = fechas.isna().sum()

                    if fechas_invalidas > 0:
                        print(
                            f" Fechas no interpretables: "
                            f"{fechas_invalidas:,}"
                        )

            except Exception as error:

                print(
                    f" Error analizando fecha: {error}"
                )

    print("\n PRIMERAS 5 FILAS")

    print(
        df.head(5).to_string(index=False)
    )
    
def main():
    
    print(f"\n Carpeta analizada:")
    print(f"   {RAW_DIR}")
    
    
    if not RAW_DIR.exists():

        print("\n ERROR")
        print("No existe la carpeta data/raw.")
        print(f"Ruta buscada: {RAW_DIR}")

        return
        
    #Buscar csv
    
    archivos_csv = sorted(RAW_DIR.glob("*.csv"))
    
    if not archivos_csv:
        print("No se encontraron archivos")
        
    print(
        f"Archivos encontrados: "
        f"{len(archivos_csv)}"
    )
    
    resultados = []
    
    for ruta in archivos_csv:
        nombre = ruta.stem
        
        
        print(f"Analizando: {ruta.name}")
        
        df = cargar_csv(ruta)
        
        if df is None:
            continue
        
        diagnosticar_df(nombre, df)
        
        resultados.append(
            {
                "tabla": nombre,
                "filas": len(df),
                "columnas": len(df.columns),
                "nulos": int(df.isnull().sum().sum()),
                "duplicados": int(df.duplicated().sum())
            }
        )
    
    print("#"*50)
    print("Resumen general")
    
    if resultados:

        resumen = pd.DataFrame(resultados)

        print()

        print(
            resumen.to_string(index=False)
        )

        print("\n" + "-" * 70)

        print(
            f"Total de tablas analizadas: "
            f"{len(resumen)}"
        )

        print(
            f"Total de filas analizadas: "
            f"{resumen['filas'].sum():,}"
        )

        print(
            f"Total de valores nulos: "
            f"{resumen['nulos'].sum():,}"
        )

        print(
            f"Total de filas duplicadas: "
            f"{resumen['duplicados'].sum():,}"
        )


if __name__ == "__main__":
    main()