import { useLocalSearchParams } from "expo-router";
import {useEffect , useState} from "react";
import { Text, ScrollView, Image, View } from "react-native";
import { Sale } from '../../../Types/sales'
import { obtenerDetallesVenta } from "app/Database/database";
import { styles } from './_listSale.styles'

export default function detallesDeVentas() {
    const { id } = useLocalSearchParams();
    const [venta, setVenta] = useState<Sale | null>(null);

    useEffect(() => {
        if (id) {
            obtenerDetallesVenta(Number(id)).then((data) => {
                setVenta(data);
            });
        }
    }, [id]);

    if (!venta) {
        return <Text>Cargando...</Text>;
    }

    return (
      <View>
        <Text style= {styles.header}>Detalles de Venta</Text>
        <ScrollView contentContainerStyle={styles.contenedor}>
          <Text style={styles.titulos}>{venta.name}</Text>
          <Text>
            Fecha: {new Intl.DateTimeFormat('es-ES', {
              dateStyle: 'medium',
              timeStyle: 'short',
            }).format(new Date(venta.date))}hrs
          </Text>
          <Text>Estado: {venta.status === 1 ? 'Completado' : 'Pendiente'}</Text>
          <Text style={styles.subtitulos}>Imágenes:</Text>
          {venta.images?.map((img, index) => (
            <Image
              key={index}
              source={{ uri: img.url }}
              style={styles.imagenes}
            />
          ))}
        </ScrollView>
      </View>
  );
}