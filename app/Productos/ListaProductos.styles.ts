import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  header: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#003366',
    paddingVertical: 12,
  },
  inputFiltro: {
    height: 40,
    borderColor: '#003366',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  lista: {
    paddingBottom: 16,
    paddingTop: 16,
  },
  card: {
    height: 96,
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    padding: 8,
  },
  imagen: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#CBD5E1',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  nombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003366',
  },
  stock: {
    fontSize: 14,
    fontWeight: '400',
    color: '#0056B3',
  },
});
