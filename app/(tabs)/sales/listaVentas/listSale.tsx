import { Text, View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { styles } from './_listSale.styles';
import { useRouter } from 'expo-router';
import { useListaVentas } from './useListaVentas';

export default function listaVentas() {
  const {listaVentas, loading, error}= useListaVentas();

  const router = useRouter();

  if (loading) return <Text>Cargando ventas...</Text>;
  if (error) return <Text>Error: {error}</Text>
  
  return (
    <View style={styles.container}>
      <ScrollView style={{ padding: 10 }}>
        <Text style={styles.title}>Ventas Registradas</Text>
        {listaVentas.map((venta) => (
          <View key={venta.id} style={styles.card}>
            <TouchableOpacity
              onPress={() =>
                router.push({ pathname: '/(tabs)/sales/detallesVenta/[id]', params: { id: venta.id } })
              }>
              <Text style={styles.bold}>{venta.name}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
