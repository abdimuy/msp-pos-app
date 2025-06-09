import { useState } from 'react';
import { View, TextInput, Image, TouchableOpacity, Text } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { styles } from './_login.styles';
import { Boton } from '../../componentes/boton/Boton';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Valora si los campos de email y password estan vacios
  const isDisabled = email.trim() === '' || password.trim() === '';

  // Ayuda a evaluar el estado del boton cuando se presiona
  const [isPressed, setIsPressed] = useState(false);

  // Evalua si el usuario ya interactua con el campo email
  const [tocado, setTocado] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  //Funcion par el inicio de sesión
  const handlePress = async () => {
    if (!isDisabled && esEmailValido(email)) {
      try {
        setIsLoading(true); // activa el spinner
        await login(email, password);
        router.replace('/');
        console.log(email, password);
      } catch (error) {
        alert('Correo o contraseña incorrectos');
        console.log(email, password);
      } finally {
        setIsLoading(false); // desactiva el spinner
      }
    }
  };

  // Funcion para asegurar que el usuario ingrese un correo
  const esEmailValido = (correo: string): boolean => {
    const regex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return regex.test(correo);
  };

  const mostrarError = tocado && !esEmailValido(email);

  return (
    <View style={styles.container}>
      {/* Logotipo */}
      <Image source={require('../../assets/logotipO2.png')} style={styles.logo} />

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
        {mostrarError && <Text style={styles.mensajeError}>Ingresa un correo válido</Text>}
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
          onPress={() => setShowPassword(!showPassword)}>
          <Image
            source={
              showPassword ? require('../../assets/eye-off.png') : require('../../assets/eye.png')
            }
            style={styles.iconRight}
          />
        </TouchableOpacity>
      </View>

      <Boton
        onPress={handlePress}
        label="INICIAR SESIÓN"
        disabled={isDisabled || isLoading}
        loading={isLoading}
        variant="primary"
        size="large"
        style={{ marginTop: 20 }}
      />
    </View>
  );
}
