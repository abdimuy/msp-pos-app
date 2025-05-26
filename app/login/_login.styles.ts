import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
    container: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    height: 143,
    alignSelf: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#007BFF',
    borderRadius: 4,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  iconLeft: {
    width: 16,
    height: 16,
    position: 'absolute',
    top: 16,
    left: 12,
  },
  iconRightWrapper: {
    position: 'absolute',
    top: 12,
    right: 8,
    padding: 4,
  },
  iconRight: {
    width: 24,
    height: 24,
  },
    button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputError: {
    borderColor: 'red',
  },
  mensajeError: {
    color: 'red',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: 16,
  },
  buttonEnabled: {
    backgroundColor: '#007bff',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  }, 
  buttonPressed:{
    backgroundColor: '#0056b3'
  },
})