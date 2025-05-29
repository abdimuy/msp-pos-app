import {useEffect, useState} from "react";
import { Text, View, ScrollView, Alert, TouchableOpacity } from "react-native";
import { Sale } from '../../../Types/sales'
import { obtenerVentas } from "app/Database/database";
import { styles } from './_listSale.styles'
import { useRouter } from "expo-router";

export default function listaVentas() {
    const [ventas, setVentas] = useState<Sale[]>([]);
    const router = useRouter();
    
    const cargarVentas = async () =>{
        const datos = await obtenerVentas();
        setVentas(datos);
    }

    useEffect(() => {
        cargarVentas();
    })

    return(
        <View style={styles.container}>
            <ScrollView style={{padding: 10 }}>
                <Text style={styles.title}>Ventas Registradas</Text>
                {ventas.map((venta) => (
                    <View key={venta.id} style={styles.card}>
                        <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/listaVentas/[id]', params: { id: venta.id}}) }>
                            <Text style={styles.bold}>{venta.name}</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}