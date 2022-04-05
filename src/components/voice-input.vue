<template>
  <div class="voice-input">
    <div class="microphone-icon" @click="startRecording">
      <div class="sound-microphone" v-show="isRecording">
        <div class="radar"></div>
        <div class="radar"></div>
        <div class="radar"></div>
        <div class="radar"></div>
        <div class="radar"></div>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        :fill="this.isRecording == true ? '#f74b4b' : '#ffffff'"
        viewBox="0 0 24 24"
      >
        <path
          d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.42 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"
        />
      </svg>
    </div>
  </div>
</template>
<script>
export default {
  name: "VoiceInput",
  props: {
    onInput: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      isRecording: false,
    };
  },
  methods: {
    startRecording() {
      if (this.isRecording == true) {
        this.isRecording = false;
        return;
      }
      this.isRecording = true;
      this.recognition.start();
    },
    stopRecording() {
      if (this.isRecording == true) {
        this.isRecording = false;
        this.recognition.stop();
      }
    },
    onResult(event) {
      this.onInput(event.results[0][0].transcript);
    },
  },

  mounted() {
    var SpeechGrammarList =
      window.SpeechGrammarList || window.webkitSpeechGrammarList;
    var SpeechRecognitionEvent =
      window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

    this.recognition = new webkitSpeechRecognition();
    this.recognition.lang = "es-ES";
    this.recognition.continuous = false;
    this.recognition.interimResults = true;

    this.recognition.onerror = function (event) {
      console.log("Error Escuchando: " + event.error);
    };

    this.recognition.onresult = (evt) => {
      if (evt.results[0].isFinal) {
        this.onResult(evt);
        this.stopRecording();
      }
    };
    //detectar cuando se detiene la grabacion
    this.recognition.onend = () => {
      this.stopRecording();
    };
  },
};
</script>
<style scoped lang="scss">
@keyframes sound-microphone {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.voice-input {
  display: inline-block;
}
.microphone-icon {
  cursor: pointer;
  svg {
    position: fixed;
    top: 85%;
    left: calc(50% - 25px);
    width: 50px;
    height: 50px;
    color: #fff;
    background: rgb(34, 34, 34);
    padding: 10px;
    border-radius: 50%;
    transition: all 0.2s ease-in-out;
    animation: sound-microphone 1s 1;
  }
}
.radar {
  position: fixed;
  top: calc(85% + 25px);
  left: calc(50%);
  border-radius: 50%;
  border: 10px solid #fff;
  width: 190px;
  height: 190px;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  -webkit-animation: radar 2s infinite;
  animation: radar 2s infinite;
  opacity: 0;
  animation-direction: normal;
}
.radar:nth-child(2) {
  animation-delay: 0.4s;
}
.radar:nth-child(3) {
  animation-delay: 0.9s;
}
.radar:nth-child(4) {
  animation-delay: 0.15s;
}
@keyframes radar {
  0% {
    width: 55px;
    height: 55px;
    border: 5px solid #f74b4b;
    opacity: 0;
  }
  50% {
    opacity: 0.1;
  }
  90% {
    width: 90px;
    height: 90px;
  }
  90%,
  100% {
    border: 3px solid rgb(245, 245, 245);
    opacity: 0;
  }
  100% {
    width: 300px;
    height: 300px;
  }
}
</style>
