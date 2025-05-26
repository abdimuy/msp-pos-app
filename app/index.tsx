import { Text, View, Button } from 'react-native';
import { Link } from 'expo-router';

const Home = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Hello, this is the home screen!</Text>
      <Link href="/prueba" asChild>
        <Button title="Prueba" />
      </Link>
    </View>
  );
};

export default Home;
