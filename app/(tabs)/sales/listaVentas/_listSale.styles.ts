import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: '#fff',
        padding:10
    },
    title:{
        fontSize: 18, 
        fontWeight: 'bold',
        marginTop: 10
    },
    card:{
        marginVertical: 10,
        padding: 10,
        backgroundColor:'#f0f0f0',
        borderRadius:6
    },
    bold:{
        fontWeight: 'bold'
    },
    contenedor:{
        padding: 16,
        gap: 8,
    },
    titulos:{
        fontSize:24,
        fontWeight: 'bold',
    },
    subtitulos:{
        marginTop: 16,
        fontSize: 18,
        fontWeight: '600',
    },
    imagenes:{
        width: '100%',
        height: 200,
        marginTop: 8,
        borderRadius: 10,
    },
    header:{
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '600',
        color: '#003366',
        marginTop: 5
    }
})