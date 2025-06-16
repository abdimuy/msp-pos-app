import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    width: '100%',
    paddingVertical: 12,
    marginBottom: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003366',
    textAlign: 'center',
  },
  imageWrapper: {
    marginVertical: 10,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  image: {
    width: 240,
    height: 240,
    borderRadius: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    marginVertical: 16,
    width: '100%',
    maxWidth: 360,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  text: {
    fontSize: 20,
  },
  error: {
    color: 'red',
    fontSize: 16,
    marginVertical: 8,
  },
  priceMeses: {
    fontSize: 20,
    color: '#2e7d32',
    marginTop: 4,
    fontWeight: 'bold',
  },
});
