import { Text, ScrollView, Image, View, Button } from 'react-native';
import { styles } from '../saleList/_listSale.styles';
import { useGetSale } from '../hooks/useGetSale';
import { Link } from 'expo-router';
import { format } from 'date-fns';


export default function detallesDeVentas() {
  const { venta, loading, error } = useGetSale();

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
            Fecha: {format(new Date(venta.date), "dd-MM-yyyy, h:mm a")}
          </Text>
          <Text>Estado: {venta.status === 1 ? 'Enviado' : 'Pendiente'}</Text>
          <Text>Latitud: {venta.latitud}</Text>
          <Text>Longitud: {venta.longitud}</Text>
          <Text style={styles.subtitulos}>Imágenes:</Text>
          {venta.images.map((img) => (
          <Image key={img.id} source={{ uri: img.url }} style={styles.imagenes} />
        ))}
      </ScrollView>

      <Link href="/(tabs)/sales/saleList/ListSale" asChild>
        <Button title="Atrás" />
      </Link>
    </View>
  );
}
