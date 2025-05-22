import React, {useState} from "react"; 
import { View, TextInput, StyleSheet, Image, TouchableOpacity, Text, Pressable, Button, } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../src/config/firebaseConfig'

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Valora si los campos de email y password estan vacios
  const isDisabled = email.trim()==='' || password.trim()=== '';

  // Ayuda a evaluar el estado del boton cuando se presiona
  const [isPressed, setIsPressed] = useState(false);
  
  // Evalua si el usuario ya interactua con el campo email 
  const [tocado, setTocado] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  //Funcion par el inicio de sesión
  const handlePress = async() => {
    if (!isDisabled && esEmailValido(email)) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth , email, password);
        const user = userCredential.user;
        
        login({ email: user.email, uid: user.uid }); // Guarda en contexto
        router.replace('/login/prueba');
        console.log(email,password);

      } catch (error) {
        alert('Correo o contraseña incorrectos');
        console.log(email,password);
      }
    }
  };

  // Funcion para asegurar que el usuario ingrese un correo
   const esEmailValido = (correo:string): boolean => {
    const regex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return regex.test(correo);
  };

   const mostrarError = tocado && !esEmailValido(email);

  return (
    <View style={styles.container}>

      {/* Logotipo */}
      <Image source={require('../../assets/logotipO2.png')} style={styles.logo}/>

      {/* Input Email */}
      <View style={styles.inputContainer}>
        <Image source={require('../../assets/email.png')} style={styles.iconLeft} />
        <TextInput
          placeholder="Correo electrónico"
          style={[styles.input, { paddingLeft: 40 }, mostrarError && styles.inputError]}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          onBlur={() => setTocado(true)}
        />
         {mostrarError && (
        <Text style={styles.mensajeError}>Ingresa un correo válido</Text>
      )}
      </View>

      {/* Input Contraseña */}
      <View style={styles.inputContainer}>
        <Image source={require('../../assets/lock.png')} style={styles.iconLeft} />
        <TextInput
          placeholder="Contraseña"
          secureTextEntry={!showPassword}
          style={[styles.input, { paddingLeft: 40, paddingRight: 40 }]}
          value={password}
          autoCapitalize="none"
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.iconRightWrapper}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Image
            source={
              showPassword
                ? require('../../assets/eye-off.png')
                : require('../../assets/eye.png')
            }
            style={styles.iconRight}
          />
        </TouchableOpacity>
      </View>

      {/* Botón */}
      <Pressable
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}

        onPress={handlePress}
        disabled={isDisabled}
        
        style={[
          styles.button,
          isDisabled
            ? styles.buttonDisabled
            : isPressed
            ? styles.buttonPressed
            : styles.buttonEnabled,
        ]}
      >
        <Text style={styles.buttonText}>INICIAR SESIÓN</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
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
});