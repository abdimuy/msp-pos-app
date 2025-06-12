import { Text, ScrollView, Image, View } from "react-native";
import { styles } from '../listaVentas/_listSale.styles'
import { useGetVenta } from "../hooks/useGetVenta";

export default function detallesDeVentas() {
  const { venta, loading, error } = useGetVenta();

  if (loading) {
    return <Text>Cargando...</Text>;
  }

  if (error) return <Text>Error:{error}</Text>;

  if (!venta) return <Text>No se encontro ninguna venta...</Text>;

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
          <Text>Estado: {venta.status === 1 ? 'Enviado' : 'Pendiente'}</Text>
          <Text>Latitud: {venta.latitud}</Text>
          <Text>Longitud: {venta.longitud}</Text>
          <Text style={styles.subtitulos}>Imágenes:</Text>
          {venta.images.map((img) => (
          <Image key={img.id} source={{ uri: img.url }} style={styles.imagenes} />
        ))}
        </ScrollView>
      </View>
  );
}
