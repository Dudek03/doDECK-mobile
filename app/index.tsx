import React from 'react'
import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import axios from 'axios'
import TextButton from '../app/components/TextButton'
import VolumeControl from '../app/components/VolumeControl'

const SERWERIP = '192.168.1.36'

const App = () => {
  const [responseMessage, setResponseMessage] = React.useState('')
  const [isAudioChanging, setIsAudioChanging] = React.useState(false)
  const [appsAudio, setAppsAudio] = React.useState({})

  const handleWinD = async () => {
    try {
      const response = await axios.get(`http://${SERWERIP}:5000/system/handleDesktop`)
      setResponseMessage(response.data.message)
    } catch (error) {
      setResponseMessage('Error: ' + error)
    }
  }

  const handleMute = async () => {
    try {
      const response = await axios.post(`http://${SERWERIP}:5000/discord/muteDiscord`)
      setResponseMessage(response.data.message)
    } catch (error) {
      setResponseMessage('Error : ' + error)
    }
  }

  const clip = async () => {
    try {
      const response = await axios.post(`http://${SERWERIP}:5000/system/handleClip`)
      setResponseMessage(response.data.message)
    } catch (error) {
      setResponseMessage('Error: ' + error)
    }
  }

  const getApps = async () => {
    try {
      const response = await axios.get(`http://${SERWERIP}:5000/audio/getAppsVolume`)
      setAppsAudio(response.data)
    } catch (error) {
      setResponseMessage('Error: ' + error)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
        {isAudioChanging ? (<VolumeControl appsVolume={appsAudio} closeFunction={()=>{setIsAudioChanging(false)}}></VolumeControl>): (
            <>
          <View style={styles.clock}>

          </View>
          <View style={styles.buttons}>
            <View style={styles.buttonRow}>
              <TextButton text={"handle win+D"} click={() => { handleWinD() }} bgColor={"black"} />
              <TextButton text={"toggle mute"} click={() => { handleMute() }} bgColor={"purple"} />
            </View>
            <View style={styles.buttonRow}>
              <TextButton text={"klip"} click={() => { clip() }} bgColor={"black"} />
              <TextButton text={"get apps"} click={() => { getApps(); setIsAudioChanging(true) }} bgColor={"black"} />
            </View>
          </View>
          <Text style={styles.response}>{responseMessage}</Text>
          </>
        )}
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

