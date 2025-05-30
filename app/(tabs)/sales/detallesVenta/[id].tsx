import { Text, ScrollView, Image, View } from "react-native";
import { styles } from '../listaVentas/_listSale.styles'
import { useVenta } from "./useVenta";

export default function detallesDeVentas() {
    const {venta , loading, error} = useVenta();    

    if (loading || !venta) {
      return <Text>Cargando...</Text>;
    }

    if (error) return <Text>Error:{error}</Text>

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