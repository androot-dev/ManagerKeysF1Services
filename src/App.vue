<template>
  <div>
    <div id="search">
      <div class="input-key">
        <img id="logo" :src="logo" /> {{ this.load_state }}

        <input
          id="keys"
          name="keys"
          type="text"
          v-model="input"
          placeholder="Busqueda de llaves"
          autocomplete="off"
          spellcheck="false"
        />
        <div class="icon-menu">
          <Menu class="menu-icon" @click="menu = !menu" />

          <ul class="menu-options" v-show="menu">
            <li
              class="close-icon"
              :style="menu == true ? 'display: none;' : 'display:flex;'"
            >
              <CloseOutline @click="menu = false" />
            </li>
            <li class="menu-option" @click="search = ['all-keys']">
              <span>Llaves Internas <KeyChain class="mdeu-icon" /> </span>
            </li>
            <li class="menu-option" @click="search = ['all-keys-colocated']">
              <span>Llaves Externas <RadioTower /></span>
            </li>
            <li class="menu-option" @click="clear">
              <span>Limpiar <Restart /> </span>
            </li>
            <li class="menu-option" @click="alertiw.open('information-alert')">
              <span>Información<Information /></span>
              <alert-iw
                class="information-alert"
                name="information-alert"
                title="Gestión de llaves"
                ><div class="information-alert-content">
                  <h3>F1 Services & Solutions</h3>
                  <h4>O&M - Operaciones y Mantenimiento</h4>
                  <span>
                    <i
                      >Dirección: "Av Alisos Mz "D" Lt 11. Exfundo Oquendo
                      Callao"</i
                    ></span
                  >
                  <br />
                  <br />
                  <footer>
                    <span>
                      Copyright © 2021 Alejandro Gonzalez

                      <i>
                        <Email />
                        <a href="mailto:alejandrorgp18@gmail.com"
                          >alejandrorgp18@gmail.com</a
                        >
                      </i>
                    </span>
                  </footer>
                </div>
              </alert-iw>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <key-viewer
      :search="search"
      :wordsVariation="wordsVariation"
      @state="updateState"
    ></key-viewer>
    <voice-input :onInput="voiceSearchKeys"></voice-input>
  </div>
</template>
<script>
import KeyViewer from "./components/key-viewer.vue";
import VoiceInput from "./components/voice-input.vue";
import logo from "./assets/logo.png";
import { alertiw } from "./assets/scripts/AlertIw.js";
import colocatedKeys from "@/colocated-keys.json";
import electronicsKeys from "@/electronic-keys.json";
import ownKeys from "@/own-keys.json";
import {
  Menu,
  Email,
  Information,
  KeyChain,
  RadioTower,
  Close,
  Restart,
} from "mdue";
import AlertIw from "./components/global/AlertIw.vue";
export default {
  data() {
    return {
      electronicsKeys,
      ownKeys,
      colocatedKeys,
      load_state: "",
      alertiw,
      logo,
      input: "",

      search: [],
      menu: false,
      searchTimeout: null,
      voiceInput: false,
      multipleSearchSeparatorVoice: "_mas_",
      multipleSearchSeparatorText: ",",
      wordsWithAcronyms: {
        puente: "pte_",
        avenida: "av_",
        kilometro: "km_",
        urbanizacion: "urb_",
        cinco: "5_",
        san_martin_de_porres: "smp",
        san_juan_de_lurigancho: "sjl",
        cuzco: "cusco",
        cusco: "cuzco",
        repetidor: "rep_",
        copic: "coopip",
        grupo: "group_",
        "a.m.": "amt",
        cara_b: "carabay",
        mosoco: "moxoco",
        municipalidad: "muni_",
        municipalida: "mun_",
        municipio: "municip",
        santa: "sta_",
        gambita: "gambeta",
        alelies: "alhelies",
        tren_emmen: "trenemann",
        trenes_man: "trenemann",
        algeli_es: "alhelies",
      },
      wordsVariation: {
        alhelies: ["alhélies", "alelies", "algeli es"],
      },
    };
  },
  components: {
    CloseOutline: Close,
    VoiceInput,
    KeyViewer,
    Menu,
    Information,
    KeyChain,
    RadioTower,
    Restart,
    AlertIw,
    Email,
  },
  methods: {
    updateState(evt) {
      this.load_state = evt;
    },
    clear() {
      this.input = "";
      this.search = [];
    },
    searchAlgorithmFormatter(str, method = "text") {
      const removeAccents = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      };
      str = removeAccents(str).toLowerCase();
      str = str.replace(/\s/g, "_");
      str = str.replace(/__/g, "_");
      let SEARCH = [];
      SEARCH.push(str);
      this.input = str;

      let get_variations_search = (str) => {
        let match = [];
        for (let i in this.wordsWithAcronyms) {
          if (str.includes(i)) {
            match.push(i);
          }
        }
        return match;
      };
      let set_variations_search = (str2, variations) => {
        //remplazar en str las palabras con acrónimos
        let res = [];
        let str3 = str2;
        for (let i in variations) {
          let str = str2;
          str = str.replace(
            variations[i],
            this.wordsWithAcronyms[variations[i]]
          );
          //cambiar __ por _
          str = str.replace(/__/g, "_");

          str3 = str3.replace(
            variations[i],
            this.wordsWithAcronyms[variations[i]]
          );
          str3 = str3.replace(/__/g, "_");

          res.push(str);
        }
        res.push(str3);
        return res;
      };
      let variations = get_variations_search(str);
      let items_simultaneos = [];

      for (let a in variations) {
        items_simultaneos.push(variations[a]);
      }

      let res = set_variations_search(str, items_simultaneos);
      SEARCH = SEARCH.concat(res);

      //eliminar el ultimo item de variations
      variations.pop();

      if (method == "voice") {
        let ultimo_caracter = str.substr(str.length - 1);

        if (str.includes("y_")) {
          let variation = str.replace("y_", "i_");
          SEARCH.push(variation);
        }
        if (ultimo_caracter == "i") {
          //eliminar el ultimo caracter
          let variation = str.substr(0, str.length - 1);
          //agregar la letra "y" al final
          variation = variation + "y";

          SEARCH.push(variation);
        }
      }
      //si el caracter final no es _

      for (let i in SEARCH) {
        if (SEARCH[i].substr(SEARCH[i].length - 1) != "_") {
          SEARCH.push(SEARCH[i].replace(/_/g, ""));
        }
      }
      //eliminar duplicados
      SEARCH = [...new Set(SEARCH)];
      this.search = SEARCH;
    },
    voiceSearchKeys(evtVoice) {
      this.search = [];
      this.searchAlgorithmFormatter(evtVoice, "voice");
      this.voiceInput = true;
    },
    searchKeys(newValue) {
      this.search = [];
      this.searchAlgorithmFormatter(newValue, "text");
      this.voiceInput = false;
    },
  },
  mounted() {
    window.addEventListener(
      "click",
      function (event) {
        if (
          !event.target.matches(".menu-icon") &&
          !event.target.matches(".icon-menu")
        ) {
          this.menu = false;
        }
      }.bind(this)
    );
  },
  watch: {
    input(newValue) {
      //dividir el resultado en varios item separados por "," y buscar cada 1500ms
      clearTimeout(this.searchTimeout);
      if (this.voiceInput == false) {
        this.searchTimeout = setTimeout(() => {
          this.searchKeys(newValue);
        }, 1000);
      }
      this.voiceInput = false;
    },
  },
};
</script>
<style lang="scss">
@import "@/_basic.scss";

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #dcdcdc;
  background-color: #2f3640;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  @include scrollbar("y");
  @include flex(center, wrap, row, flex-start);
}
@font-face {
  font-family: "Roboto-Black";
  src: local("Roboto-Black"), url("assets/fonts/Roboto/Roboto-Black.ttf");
  font-display: block;
}
@font-face {
  font-family: "Roboto-Regular";
  src: local("Roboto-Regular"), url("assets/fonts/Roboto/Roboto-Regular.ttf");
  font-display: block;
}
@font-face {
  font-family: "nunito-light";
  src: local("nunito-light"), url("assets/fonts/Nunito/Nunito-Light.ttf");
  font-display: block;
}
@font-face {
  font-family: "nunito-bold";
  src: local("nunito-bold"), url("assets/fonts/Nunito/Nunito-Bold.ttf");
  font-display: block;
}
.information-alert-content {
  padding: 0 20px;
  width: 310px;
  font-size: 11px;
  footer {
    padding: 10px;
    background-color: #bebebe;
    color: #292929;
    @include flex(center, wrap, column, center);
    span {
      @include flex(center, wrap, column, flex-start);
      margin: 0;
      padding: 0;
      i {
        @include flex(center, nowrap, row, center);
        padding: 0;
        font-family: "Roboto-Regular";
        color: #9e9e99;

        svg {
          width: 20px;
          height: 20px;
          fill: #292929;
          margin: 0 15px;
        }
        a {
          color: #292929;
          text-decoration: none;
        }
        color: #dcdcdc;
        text-decoration: none;
      }
    }
  }
}
@keyframes fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
#search {
  width: 100vw;
  background: #353b48;
  @include flex(center, nowrap, column);
  font-family: "nunito-light";
  font-size: 13px;
  padding: 15px 5px;
  //colocar encima de todo
  z-index: 99999;
  .icon-menu {
    color: #dcdcdc;
    font-size: 20px;
    margin-left: 10px;

    cursor: pointer;
    @include tablets {
      cursor: none;
    }

    position: relative;
    @include flex(center, nowrap, column);
    * {
      pointer-events: none;
    }

    .menu-icon {
      @include flex(center);
      width: 35px;
      height: 35px;
      margin-right: 5px;
      fill: #c5c4c4;
      padding: 5px;
      pointer-events: all;
      position: relative;
    }
    .menu-options {
      animation-name: fade;
      animation-duration: 0.2s;
      animation-fill-mode: alternate;
      animation-timing-function: ease-in-out;

      //colocar debajo de #search
      position: absolute;
      top: 100%;
      left: -100px;
      width: 170px;
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      z-index: 99999;

      @include phones {
        position: fixed;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        font-family: "nunito-bold";
        .close-icon {
          display: flex !important;
          cursor: pointer;
          position: absolute;
          font-size: 30px;
          top: 20px;
          right: 20px;
        }
      }
      background: #353b48;
      @include flex(center, wrap, column, flex-start);
      padding: 10px;

      @include flex(center, nowrap, column);
      .menu-option {
        @include flex(center, nowrap, column);
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

        padding: 10px;
        color: #dcdcdc;
        font-size: 13px;
        cursor: pointer;
        &:hover {
          background-color: #2f3640;
          color: #dcdcdc;
        }
      }
      * {
        pointer-events: all;
      }
      .menu-option {
        @include flex(space-between, nowrap, row, center);
        padding: 5px;
        cursor: pointer;
        color: #dcdcdc;
        @include phones {
          font-size: 20px;
        }

        font-size: 13px;
        width: 100%;
        span {
          width: 100%;
          @include flex(space-between);
        }
        &:hover {
          background: #2f3640;
        }
      }
    }
  }
  .input-key {
    font-family: "nunito-light";
    @include flex(center, nowrap, row);
    width: 90%;

    img {
      width: 30%;
      max-width: 50px;
      margin-right: 10px;
    }
  }
  input {
    padding: 7px;
    width: 70%;
    max-width: 400px;
    outline: none;
    border: none;
    border-radius: 4px;
    background: #9e9e9e;
    color: black;
    &::placeholder {
      color: rgb(4, 4, 4);
      font-family: "nunito-light";
    }
    font-family: "nunito-bold";
  }
}
header {
  font-size: 9px;

  height: 20vh;
  background: black;
}
</style>
