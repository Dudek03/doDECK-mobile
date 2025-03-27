import React from 'react';
import { SafeAreaView, Button, StyleSheet, Text, View } from 'react-native';
import axios from 'axios';
import TextButton from '../app/components/TextButton'

const App = () => {
  const [responseMessage, setResponseMessage] = React.useState('');

  // Funkcja do wysyłania zapytania POST na endpoint /win+d
  const handleWinD = async () => {
    try {
      const response = await axios.post('http://192.168.100.47:5000/desktop');  // Użyj IP serwera Flask
      setResponseMessage(response.data.message);
    } catch (error) {
      setResponseMessage('Error: ' + error);
    }
  };

  // Funkcja do wysyłania zapytania POST na endpoint /mute
  const handleMute = async () => {
    try {
      const response = await axios.post('http://192.168.100.47:5000/mute');  // Użyj IP serwera Flask
      setResponseMessage(response.data.message);
    } catch (error) {
      setResponseMessage('Error : ' + error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.clock}>

      </View>
      <View style={styles.buttons}>
        <View style={styles.buttonRow}>
          <TextButton text={"handle win+D"} click={() => { handleWinD() }} bgColor={"black"} />
          <TextButton text={"toggle mute"} click={() => { handleMute() }} bgColor={"purple"} />
        </View>
        <View style={styles.buttonRow}>
          <Button title="Minimize All Windows" onPress={handleWinD} />
          <Button title="Toggle Mute" onPress={handleMute} />
        </View>
      </View>
      {responseMessage ? <Text style={styles.response}>{responseMessage}</Text> : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  response: {
    marginTop: 20,
    fontSize: 16,
    color: 'green',
  },
  clock: {
    backgroundColor: "purple",
    flex: 1
  },
  buttons: {
    flexDirection: "column",
    flex: 1
  },
  buttonRow: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-evenly",
    backgroundColor: "red",
    width: '100%'
  }
});

export default App;

