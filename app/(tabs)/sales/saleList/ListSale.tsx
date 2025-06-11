import { Text, View, ScrollView, TouchableOpacity, Button } from 'react-native';
import { styles } from './_listSale.styles';
import { useRouter, Link } from 'expo-router';
import { useGetListSale } from './useGetListSale';

export default function listaVentas() {
  const { listaVentas, loading, error } = useGetListSale();

  const router = useRouter();

  if (loading) return <Text>Cargando ventas...</Text>;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <View style={styles.container}>
      <ScrollView style={{ padding: 10 }}>
        <Text style={styles.title}>Ventas Registradas</Text>
        {listaVentas.map((venta) => (
          <View key={venta.id} style={styles.card}>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/sales/detailsSale/[id]',
                  params: { id: venta.id },
                })
              }>
              <Text style={styles.bold}>{venta.name}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <Link href="/" asChild>
        <Button title="Atrás" />
      </Link>
    </View>
  );
}
